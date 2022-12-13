- TheRewarderPool
    - If a person deposits token in pool for atleast 5 days, he will get reward every 5th day.
    - This is the pool where alice, bob, charlie, david, has deposited some eithers.

- RewardToken
    - The reward earning will be stored in form of reward tokens.

- AccountingToken
    - Token used for tracking the total supply of Liquidity tokens. And balance of users.

- LiquidityToken
    - This is the main transaction tokens, similar to ETH.


## Notes
- Whereever roles are used, this will prevent public users from running those particular function.
- How to "deposit" successfully to rewardPool
    - 

## Possible Attacks
- Can triggering TheRewardPool.deposit() multiple times before the reward is reached causes some bug.
    - No
- Using the flashloan
    - we call the rewardpool and deposit a very big amount
    - now when the reward of this will be calculate it will be huge. (assuming this can be breached.)
    - attacker can withdraw a hugh percentage of the reward tokens.

