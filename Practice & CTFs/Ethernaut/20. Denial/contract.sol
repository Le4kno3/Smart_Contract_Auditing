// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Denial {
    address public partner; // withdrawal partner - pay the gas, split the withdraw
    address public constant owner = address(0xA9E); //the owner is hardcoded.
    uint timeLastWithdrawn;
    mapping(address => uint) withdrawPartnerBalances; // keep track of partners balances

    function setWithdrawPartner(address _partner) public {
        partner = _partner; //@audit-issue - checks missing before effect. We can set this an address of a contract.
    }

    // withdraw 1% to recipient and 1% to owner
    function withdraw() public {
        uint amountToSend = address(this).balance / 100;
        // perform a call without checking return

        // The recipient can revert, the owner will still get their share

        //@audit-issue this is a bug, not even check or effects were done before interaction.
        partner.call{value: amountToSend}(""); //@audit - calling an untrseted address with low level call.
        payable(owner).transfer(amountToSend);

        // keep track of last withdrawal time
        timeLastWithdrawn = block.timestamp; //@audit-ok
        withdrawPartnerBalances[partner] += amountToSend;
    }

    // allow deposit of funds
    receive() external payable {}

    // convenience function
    function contractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
