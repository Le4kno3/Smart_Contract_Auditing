- UnstoppableLender:
    - This is the (main) lending contract.
    - which all the checks and logic for lending process.

- ReceiverUnstoppable:
    - It is like a borrower, who want to borrow a flash loan.
    - To interact with the lender contract (to get flash loan) we need to talk to the lending contract using a smart contract.
    - This contract is required to have a function say `receiveTokens` which will be used by the lender contract to collect back the loan amount.
    - Note that we should not modify any of the contract's code.

- Goals:
    1. stop the pool from offering flash loans (UnstoppableLender).

- Analysis:
    - I am only able to see one way
        - there could be a sync difference between poolBalance & damnVulnerableToken.balanceOf(address(this))
        - we can control the damnVulnerableToken.balanceOf(address(this)) by interacting directly with the token contract.
        - this can make the contract unusable because the poolBalance and this.balance will not be the same.
    - Can I run transfer() or approve() from lender contract.
        - No
    - DamnValuableToken could be vulnerable.
        - No, all public functions do check msg.sender

- Root Cause
    - (But we cannot change it) The lending contract is calling a malicious attacker controllable function `receiveTokens()`
    - There is a check inside the lending contract, which checks the actual balance with a contract tracked state variable.
    - As we can transfer more ethers to that address manually, then, this will not be tracked by poolBalance.
    - This causes the poolBalance and actual control_tokens_balance to have different values, as we are transfering the tokens not using the recommended `receiveTokens()`