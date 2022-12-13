// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Buyer {
    function price() external view returns (uint);
}

contract Shop {
    uint public price = 100;
    bool public isSold;

    function buy() public {
        //@audit-issue - interface must be used with caution.
        //As the interface is not defined, attacker can define this interface, with malicious logic.
        Buyer _buyer = Buyer(msg.sender); //@audit-issue - user input should not be trusted.

        if (_buyer.price() >= price && !isSold) {
            isSold = true;
            price = _buyer.price();
        }
    }
}
