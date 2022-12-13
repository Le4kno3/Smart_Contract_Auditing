// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract CoinFlip {
    using SafeMath for uint256;
    uint256 public consecutiveWins;
    uint256 lastHash;
    uint256 FACTOR =
        57896044618658097711785492504343953926634992332820282019728792003956564819968;

    constructor() public {
        consecutiveWins = 0; //this will just record consecutive wins.
    }

    function flip(bool _guess) public returns (bool) {
        //for me to success, blockValue should always be different.

        uint256 blockValue = uint256(blockhash(block.number.sub(1))); //@audit-issue - Using block number for randomness

        //to me it just means that, wait for the current block to be filled, and then run the next block
        //but even if you run 2 transaction in same block, it will simply revert, your consecutiveWins count will not be affected.
        if (lastHash == blockValue) {
            revert();
        }

        lastHash = blockValue;

        uint256 coinFlip = blockValue.div(FACTOR);
        bool side = coinFlip == 1 ? true : false; //@audit - does not looks good.

        if (side == _guess) {
            consecutiveWins++; //@audit-ok - on 1 is added.
            return true;
        } else {
            consecutiveWins = 0;
            return false;
        }
    }
}
