// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

contract Test {
    mapping(address => uint) public contributions;
    address payable public owner;

    constructor() public {
        owner = msg.sender;
        contributions[msg.sender] = 1000 * (1 ether); //@audit-ok - static integer multiplication.
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    function contribute() public payable {
        require(msg.value < 0.001 ether);
        contributions[msg.sender] += msg.value; //@audit-ok - msg.value can never be negative.
        if (contributions[msg.sender] > contributions[owner]) {
            owner = msg.sender;
        }
    }

    function getContribution() public view returns (uint) {
        return contributions[msg.sender];
    }

    function withdraw() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    receive() external payable {
        require(msg.value > 0 && contributions[msg.sender] > 0);
        owner = msg.sender; //@audit-issue - very weak check for changing owner.
    }
}
