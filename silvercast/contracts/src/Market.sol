// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Market
 * @notice Binary prediction market (YES/NO) using a Fixed Product Market Maker.
 *         Collateral = zkLTC. 1 YES = 1 zkLTC if YES wins, else 0 (and vice-versa).
 * @dev Simplified FPMM: mirrors Gnosis/Polymarket's AMM logic.
 */
contract Market is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---- Constants ----
    uint256 public constant OUTCOME_NO = 0;
    uint256 public constant OUTCOME_YES = 1;
    uint256 public constant FEE_BPS = 200; // 2% on each trade
    uint256 public constant BPS = 10_000;

    // ---- Immutable state ----
    IERC20 public immutable collateral; // zkLTC
    address public immutable oracle;    // authorized resolver
    address public immutable factory;
    uint256 public immutable resolutionTime;
    string public question;

    // ---- Mutable state ----
    uint256 public yesReserve;
    uint256 public noReserve;
    uint256 public totalLiquidity;
    uint256 public accumulatedFees;

    bool public resolved;
    uint256 public winningOutcome; // 0 or 1

    // Snapshot taken at resolve() for correct LP payouts
    uint256 public snapshotWinningReserve;
    uint256 public snapshotTotalLiquidity;

    mapping(address => uint256) public yesBalance;
    mapping(address => uint256) public noBalance;
    mapping(address => uint256) public liquidity;

    // ---- Events ----
    event LiquidityAdded(address indexed lp, uint256 collateralIn, uint256 sharesOut);
    event LiquidityRemoved(address indexed lp, uint256 sharesBurned, uint256 collateralOut);
    event Trade(address indexed trader, uint256 outcome, uint256 collateralIn, uint256 outcomeOut);
    event Resolved(uint256 outcome);
    event Redeemed(address indexed user, uint256 amount);

    // ---- Errors ----
    error NotOracle();
    error AlreadyResolved();
    error NotResolved();
    error ResolutionTooEarly();
    error InvalidOutcome();
    error ZeroAmount();
    error InsufficientBalance();

    constructor(
        address _collateral,
        address _oracle,
        uint256 _resolutionTime,
        string memory _question
    ) {
        collateral = IERC20(_collateral);
        oracle = _oracle;
        factory = msg.sender;
        resolutionTime = _resolutionTime;
        question = _question;
    }

    // =========================================================
    //                      LIQUIDITY
    // =========================================================

    /// @notice Seed the pool with equal YES/NO reserves. Anyone can add.
    /// @dev First LP sets the initial price at 50/50. Subsequent LPs add pro-rata.
    function addLiquidity(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (resolved) revert AlreadyResolved();

        collateral.safeTransferFrom(msg.sender, address(this), amount);

        uint256 shares;
        if (totalLiquidity == 0) {
            // Initial liquidity: mint `amount` YES and `amount` NO into reserves.
            yesReserve = amount;
            noReserve = amount;
            shares = amount;
        } else {
            // Pro-rata. Add to reserves equally, mint outcome tokens, no skew.
            shares = (amount * totalLiquidity) / collateralBacking();
            yesReserve += amount;
            noReserve += amount;
        }

        liquidity[msg.sender] += shares;
        totalLiquidity += shares;

        emit LiquidityAdded(msg.sender, amount, shares);
    }

    /// @notice Remove liquidity proportionally. User receives collateral + any skewed outcome tokens.
    function removeLiquidity(uint256 shares) external nonReentrant {
        if (shares == 0) revert ZeroAmount();
        if (liquidity[msg.sender] < shares) revert InsufficientBalance();

        // Proportional withdrawal of both reserves.
        uint256 yesOut = (yesReserve * shares) / totalLiquidity;
        uint256 noOut  = (noReserve  * shares) / totalLiquidity;

        // Send the smaller side as collateral (1 YES + 1 NO = 1 zkLTC), the excess as outcome tokens.
        uint256 collatOut = yesOut < noOut ? yesOut : noOut;
        uint256 yesExtra  = yesOut - collatOut;
        uint256 noExtra   = noOut  - collatOut;

        yesReserve -= yesOut;
        noReserve  -= noOut;
        liquidity[msg.sender] -= shares;
        totalLiquidity -= shares;

        if (yesExtra > 0) yesBalance[msg.sender] += yesExtra;
        if (noExtra  > 0) noBalance[msg.sender]  += noExtra;

        collateral.safeTransfer(msg.sender, collatOut);
        emit LiquidityRemoved(msg.sender, shares, collatOut);
    }

    // =========================================================
    //                        TRADING
    // =========================================================

    /// @notice Buy YES or NO tokens with collateral. Implements FPMM.
    function buy(uint256 outcome, uint256 collateralIn, uint256 minOutcomeOut)
        external
        nonReentrant
        returns (uint256 outcomeOut)
    {
        if (outcome > 1) revert InvalidOutcome();
        if (collateralIn == 0) revert ZeroAmount();
        if (resolved) revert AlreadyResolved();

        uint256 fee = (collateralIn * FEE_BPS) / BPS;
        uint256 netIn = collateralIn - fee;
        accumulatedFees += fee;

        collateral.safeTransferFrom(msg.sender, address(this), collateralIn);

        // Mint netIn YES + netIn NO into reserves, then pull out the chosen side to maintain k.
        uint256 newYes = yesReserve + netIn;
        uint256 newNo  = noReserve  + netIn;
        uint256 k = yesReserve * noReserve;

        if (outcome == OUTCOME_YES) {
            // Keep newNo; solve newYes' such that newYes' * newNo = k
            uint256 finalYes = k / newNo;
            outcomeOut = newYes - finalYes;
            yesReserve = finalYes;
            noReserve  = newNo;
            yesBalance[msg.sender] += outcomeOut;
        } else {
            uint256 finalNo = k / newYes;
            outcomeOut = newNo - finalNo;
            yesReserve = newYes;
            noReserve  = finalNo;
            noBalance[msg.sender] += outcomeOut;
        }

        require(outcomeOut >= minOutcomeOut, "slippage");
        emit Trade(msg.sender, outcome, collateralIn, outcomeOut);
    }

    /// @notice Sell YES or NO tokens back for collateral.
    function sell(uint256 outcome, uint256 outcomeIn, uint256 minCollateralOut)
        external
        nonReentrant
        returns (uint256 collateralOut)
    {
        if (outcome > 1) revert InvalidOutcome();
        if (outcomeIn == 0) revert ZeroAmount();
        if (resolved) revert AlreadyResolved();

        if (outcome == OUTCOME_YES) {
            if (yesBalance[msg.sender] < outcomeIn) revert InsufficientBalance();
            yesBalance[msg.sender] -= outcomeIn;
        } else {
            if (noBalance[msg.sender] < outcomeIn) revert InsufficientBalance();
            noBalance[msg.sender] -= outcomeIn;
        }

        // Inverse of buy: we're returning `outcomeIn` into the pool, and pulling collateral.
        // Solve for `collateralOut` such that:
        //   (yesReserve + outcomeIn - collateralOut) * (noReserve - collateralOut) = k   (if selling YES)
        //   or mirrored if selling NO.
        uint256 k = yesReserve * noReserve;
        uint256 a;
        uint256 b;
        if (outcome == OUTCOME_YES) {
            a = yesReserve + outcomeIn;
            b = noReserve;
        } else {
            a = yesReserve;
            b = noReserve + outcomeIn;
        }

        // Quadratic: (a - x)(b - x) = k  =>  x^2 - (a+b)x + (ab - k) = 0
        // x = ((a+b) - sqrt((a+b)^2 - 4*(ab - k))) / 2
        uint256 sum = a + b;
        uint256 product = a * b;
        uint256 discriminant = sum * sum - 4 * (product - k);
        uint256 x = (sum - sqrt(discriminant)) / 2;

        uint256 fee = (x * FEE_BPS) / BPS;
        collateralOut = x - fee;
        accumulatedFees += fee;

        if (outcome == OUTCOME_YES) {
            yesReserve = a - x;
            noReserve  = b - x;
        } else {
            yesReserve = a - x;
            noReserve  = b - x;
        }

        require(collateralOut >= minCollateralOut, "slippage");
        collateral.safeTransfer(msg.sender, collateralOut);
        emit Trade(msg.sender, outcome, collateralOut, outcomeIn);
    }

    // =========================================================
    //                      RESOLUTION
    // =========================================================

    function resolve(uint256 outcome) external {
        if (msg.sender != oracle) revert NotOracle();
        if (resolved) revert AlreadyResolved();
        if (block.timestamp < resolutionTime) revert ResolutionTooEarly();
        if (outcome > 1) revert InvalidOutcome();

        resolved = true;
        winningOutcome = outcome;
        snapshotWinningReserve = outcome == OUTCOME_YES ? yesReserve : noReserve;
        snapshotTotalLiquidity = totalLiquidity;
        emit Resolved(outcome);
    }

    /// @notice After resolution, redeem winning outcome tokens 1:1 for collateral.
    function redeem() external nonReentrant {
        if (!resolved) revert NotResolved();

        uint256 amount;
        if (winningOutcome == OUTCOME_YES) {
            amount = yesBalance[msg.sender];
            yesBalance[msg.sender] = 0;
        } else {
            amount = noBalance[msg.sender];
            noBalance[msg.sender] = 0;
        }

        if (amount == 0) revert ZeroAmount();
        collateral.safeTransfer(msg.sender, amount);
        emit Redeemed(msg.sender, amount);
    }

    /// @notice LPs redeem their share of the winning side from the pool snapshot.
    function redeemLiquidity() external nonReentrant {
        if (!resolved) revert NotResolved();
        uint256 shares = liquidity[msg.sender];
        if (shares == 0) revert ZeroAmount();

        uint256 payout = (snapshotWinningReserve * shares) / snapshotTotalLiquidity;

        liquidity[msg.sender] = 0;
        collateral.safeTransfer(msg.sender, payout);
        emit Redeemed(msg.sender, payout);
    }

    // =========================================================
    //                         VIEWS
    // =========================================================

    /// @notice Current marginal price of YES (0–1e18 scale). NO price = 1e18 - yesPrice.
    function yesPrice() external view returns (uint256) {
        if (yesReserve + noReserve == 0) return 0.5e18;
        return (noReserve * 1e18) / (yesReserve + noReserve);
    }

    /// @notice Total collateral effectively backing the pool (pair count = min reserve).
    function collateralBacking() public view returns (uint256) {
        return yesReserve < noReserve ? yesReserve : noReserve;
    }

    // =========================================================
    //                         UTILS
    // =========================================================

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
