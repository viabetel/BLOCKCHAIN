// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Limero Token (LIME)
 * @notice Production-grade ERC-20 for the Limero protocol.
 *
 *  - Fixed total supply: 100,000,000 LIME (minted at deploy to the deployer).
 *  - Standard ERC-20 with Permit (EIP-2612) for gasless approvals.
 *  - Owner can call `burn()` on own tokens (optional contraction).
 *  - No mint() post-deploy. No backdoors. No upgrades.
 *  - Deploy ONCE, distribute from deployer wallet.
 *
 *  This replaces the MockZkLTC faucet-mintable token used during testnet.
 *  For testnet onboarding, the deployer routes LIME through the Faucet
 *  contract (or directly to the Limero Faucet wallet) and drip-releases
 *  it to users who claim.
 */

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

interface IERC20Permit {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function nonces(address owner) external view returns (uint256);
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}

contract LimeToken is IERC20, IERC20Metadata, IERC20Permit {
    // ---------------- Metadata ----------------
    string public constant name = "Limero";
    string public constant symbol = "LIME";
    uint8 public constant decimals = 18;

    // Total supply minted at deploy: 100M LIME
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18;

    // ---------------- ERC-20 state ----------------
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // ---------------- Ownership (simple) ----------------
    address public owner;

    // ---------------- EIP-2612 Permit ----------------
    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 private immutable _DOMAIN_SEPARATOR;
    mapping(address => uint256) private _nonces;

    // ---------------- Errors ----------------
    error InsufficientBalance();
    error InsufficientAllowance();
    error ZeroAddress();
    error PermitExpired();
    error InvalidSignature();
    error NotOwner();

    // ---------------- Events ----------------
    event Burn(address indexed from, uint256 amount);
    event OwnershipTransferred(address indexed from, address indexed to);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        _totalSupply = INITIAL_SUPPLY;
        _balances[msg.sender] = INITIAL_SUPPLY;
        emit Transfer(address(0), msg.sender, INITIAL_SUPPLY);

        // EIP-712 domain separator
        _DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // ---------------- ERC-20 ----------------

    function totalSupply() external view returns (uint256) { return _totalSupply; }
    function balanceOf(address a) external view returns (uint256) { return _balances[a]; }
    function allowance(address o, address s) external view returns (uint256) { return _allowances[o][s]; }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 current = _allowances[from][msg.sender];
        if (current != type(uint256).max) {
            if (current < amount) revert InsufficientAllowance();
            unchecked { _allowances[from][msg.sender] = current - amount; }
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (to == address(0)) revert ZeroAddress();
        uint256 bal = _balances[from];
        if (bal < amount) revert InsufficientBalance();
        unchecked {
            _balances[from] = bal - amount;
            _balances[to] += amount;
        }
        emit Transfer(from, to, amount);
    }

    function _approve(address o, address s, uint256 amount) internal {
        if (s == address(0)) revert ZeroAddress();
        _allowances[o][s] = amount;
        emit Approval(o, s, amount);
    }

    // ---------------- Burn (owner or self) ----------------

    function burn(uint256 amount) external {
        uint256 bal = _balances[msg.sender];
        if (bal < amount) revert InsufficientBalance();
        unchecked {
            _balances[msg.sender] = bal - amount;
            _totalSupply -= amount;
        }
        emit Transfer(msg.sender, address(0), amount);
        emit Burn(msg.sender, amount);
    }

    // ---------------- Ownership ----------------

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ---------------- EIP-2612 Permit ----------------

    function nonces(address o) external view returns (uint256) { return _nonces[o]; }
    function DOMAIN_SEPARATOR() external view returns (bytes32) { return _DOMAIN_SEPARATOR; }

    function permit(
        address ownerAddr,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (block.timestamp > deadline) revert PermitExpired();

        bytes32 structHash = keccak256(
            abi.encode(_PERMIT_TYPEHASH, ownerAddr, spender, value, _nonces[ownerAddr]++, deadline)
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", _DOMAIN_SEPARATOR, structHash));
        address signer = ecrecover(digest, v, r, s);
        if (signer == address(0) || signer != ownerAddr) revert InvalidSignature();

        _approve(ownerAddr, spender, value);
    }
}
