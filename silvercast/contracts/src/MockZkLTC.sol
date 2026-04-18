// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Stand-in for zkLTC in local tests. Real zkLTC is the LitVM gas token (IERC20).
contract MockZkLTC is ERC20 {
    constructor() ERC20("Mock zkLTC", "zkLTC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
