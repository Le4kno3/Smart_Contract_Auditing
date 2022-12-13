- governanceToken in SimpleGovernance = token in SelfiPool = this.token
    - d

- SimpleGovernance
    - d


- Attack (action)
    - Receiver = SelfiePool.address
    - Action (calldata) = drainAllFunds(attacker.address) , attackerContract
    - Value - 0 in wei

Attack
    - take flash loan of say > TOKENS_IN_POOL / 2 (75000000) token, this amount of flashloan.
    - the flash loan did update the token balance of the attackerContract, but the governance check on token supply is done using snapshot balance. But at this stage we have no snapshots, so we cannot pass the governance check
    - To pass the check we already have the required balance, we simply need to trigger the snapshot for the DVT Snaphot tokens manually.
    - drain all the tokens
        - by first queueing the attack (action)
        - repay the 1 token
    - There is no deduction of amount due to governance, so the amount taken from pool is given back to pool.
    - the pool current has 1.5 million DVT tokens
    - To execute the queued action id, it does not check for the balance or supply, it just checks if action is execute or 2 days have past or not.
        - time past = 2 days
        - send the execute action.
    - As the pool's balance will be drained and will be sent to the attackerContract.
    - Finally to complete the attack, transfer all the DVT tokens to attacker.

- Problem
    - How to trigger a snapshot?
        - The DVT snapshot contract has exposed function for this. So create an instance of this contract, instead of ERC20Snapshot.sol.
        - ` snap_id = tokenContract1.snapshot();`