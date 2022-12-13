// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./Elevator.sol";

contract Testing {
    bool public toggle = true;
    Elevator public target;

    constructor(address _targetAddress) {
        target = Elevator(_targetAddress);
    }

    function isLastFloor(uint) public returns (bool) {
        toggle = !toggle;
        return toggle;
    }

    function setTop(uint _floor) public {
        target.goTo(_floor);
    }
}
