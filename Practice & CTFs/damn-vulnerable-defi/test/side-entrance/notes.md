- to drain ether
    - make balances[msg.sender] = MAX_TOKENS

- Take flashloan and deposit using deposit
    - This will pay the flashloan and update the user balance also.

- Attack
    - I designed a new attack contract (defined just below the victim)
    - The attack was successful as I was able to drain all the balance but not all ethers were transferred to attacker, as there could be some gas or transaction amount deducted, see the result.png screenshot.