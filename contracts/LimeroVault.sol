// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Limero Yield Vault
 * @notice A simplified yield vault for the Limero protocol.
 *
 *         Users deposit an underlying token (LIME or USDC) and receive
 *         vault shares ("vLIME" or "vUSDC"). As fees accrue from prediction
 *         markets, the vault's backing asset balance grows — so each share
 *         becomes worth more underlying over time.
 *
 *         The vault is owner-managed at the protocol level:
 *           - Owner can call `routeToMarket()` to deploy vault capital as
 *             liquidity into a Limero market (the vault calls addLiquidity).
 *           - Owner can call `pullFromMarket()` to reclaim LP shares + fees.
 *           - Owner can call `harvest()` to record new fees as inflated shares.
 *
 *         Users always deposit / withdraw against the SHARE PRICE (totalAssets /
 *         totalShares). If the vault has more underlying than it started with
 *         (from accrued fees), the shares are worth more.
 *
 *         THIS IS SIMPLE ON PURPOSE: no ERC4626 full compliance, no complex
 *         fee structures, no swap/rebalance logic. Just deposit, withdraw,
 *         and let the owner route liquidity.
 *
 *         Deploy this twice: once with LIME as underlying, once with USDC.
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

interface ILimeroMarket {
    function addLiquidity(uint256 amount) external;
    function removeLiquidity(uint256 liqShares) external;
    function liquidity(address) external view returns (uint256);
}

contract LimeroVault {
    // ---------------- Errors ----------------
    error NotOwner();
    error ZeroAmount();
    error InsufficientShares();
    error ReentrantCall();
    error TransferFailed();
    error InvalidMarket();

    // ---------------- Events ----------------
    event Deposit(address indexed user, uint256 assets, uint256 shares);
    event Withdraw(address indexed user, uint256 assets, uint256 shares);
    event RouteToMarket(address indexed market, uint256 amount);
    event PullFromMarket(address indexed market, uint256 liqShares);
    event Harvest(uint256 newTotalAssets, uint256 totalShares);

    // ---------------- Storage ----------------
    IERC20 public immutable underlying;
    address public owner;
    string public name;
    string public symbol;
    uint8 public immutable decimals;

    uint256 public totalShares;
    mapping(address => uint256) public sharesOf;

    // Markets this vault has routed liquidity into
    mapping(address => bool) public authorizedMarket;
    address[] public marketList;

    uint256 private _locked;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier nonReentrant() {
        if (_locked == 1) revert ReentrantCall();
        _locked = 1;
        _;
        _locked = 0;
    }

    constructor(
        address _underlying,
        string memory _name,
        string memory _symbol
    ) {
        underlying = IERC20(_underlying);
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        decimals = IERC20(_underlying).decimals();
    }

    // ================== SHARE ACCOUNTING ==================
    //
    // totalAssets() = vault's own underlying balance + (optional) assets
    //                 deployed to markets. For simplicity we count ONLY the
    //                 vault's direct balance. Assets "in market" are tracked
    //                 separately via pullFromMarket to realize them back.
    //
    //                 Fees earned appear when the owner calls pullFromMarket:
    //                 the market returns more underlying than was sent in.
    //
    // ======================================================

    function totalAssets() public view returns (uint256) {
        return underlying.balanceOf(address(this));
    }

    function sharePrice() public view returns (uint256) {
        if (totalShares == 0) return 1e18;
        return (totalAssets() * 1e18) / totalShares;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        if (totalShares == 0) return assets;
        return (assets * totalShares) / totalAssets();
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        if (totalShares == 0) return shares;
        return (shares * totalAssets()) / totalShares;
    }

    // ================== USER FUNCTIONS ==================

    function deposit(uint256 assets) external nonReentrant returns (uint256 shares) {
        if (assets == 0) revert ZeroAmount();

        shares = convertToShares(assets);
        if (shares == 0) revert ZeroAmount();

        // Pull underlying from user
        bool ok = underlying.transferFrom(msg.sender, address(this), assets);
        if (!ok) revert TransferFailed();

        totalShares += shares;
        sharesOf[msg.sender] += shares;

        emit Deposit(msg.sender, assets, shares);
    }

    function withdraw(uint256 shares) external nonReentrant returns (uint256 assets) {
        if (shares == 0) revert ZeroAmount();
        if (sharesOf[msg.sender] < shares) revert InsufficientShares();

        assets = convertToAssets(shares);
        if (assets == 0) revert ZeroAmount();

        // Burn shares first (CEI pattern)
        sharesOf[msg.sender] -= shares;
        totalShares -= shares;

        bool ok = underlying.transfer(msg.sender, assets);
        if (!ok) revert TransferFailed();

        emit Withdraw(msg.sender, assets, shares);
    }

    // ================== OWNER FUNCTIONS ==================
    // Route vault liquidity INTO a Limero market.
    // Market address must have been authorized first.
    function routeToMarket(address market, uint256 amount) external onlyOwner nonReentrant {
        if (!authorizedMarket[market]) revert InvalidMarket();
        if (amount == 0) revert ZeroAmount();

        // Approve market to pull `amount` of underlying
        underlying.approve(market, amount);
        ILimeroMarket(market).addLiquidity(amount);

        emit RouteToMarket(market, amount);
    }

    // Pull LP shares back from a market.
    function pullFromMarket(address market, uint256 liqShares) external onlyOwner nonReentrant {
        if (!authorizedMarket[market]) revert InvalidMarket();
        if (liqShares == 0) revert ZeroAmount();

        ILimeroMarket(market).removeLiquidity(liqShares);

        emit PullFromMarket(market, liqShares);
    }

    // Authorize a market address. Only authorized markets can receive liquidity.
    function authorizeMarket(address market) external onlyOwner {
        if (!authorizedMarket[market]) {
            authorizedMarket[market] = true;
            marketList.push(market);
        }
    }

    // "Harvest" is a no-op snapshot — fees auto-reflect in sharePrice when
    // pullFromMarket returns more than was deposited. This just emits for tracking.
    function harvest() external onlyOwner {
        emit Harvest(totalAssets(), totalShares);
    }

    // Ownership transfer (simple)
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    // Emergency: rescue arbitrary ERC20 sent by mistake (not underlying!)
    function rescue(address token, uint256 amount) external onlyOwner {
        require(token != address(underlying), "cannot rescue underlying");
        IERC20(token).transfer(owner, amount);
    }

    function marketCount() external view returns (uint256) {
        return marketList.length;
    }
}
