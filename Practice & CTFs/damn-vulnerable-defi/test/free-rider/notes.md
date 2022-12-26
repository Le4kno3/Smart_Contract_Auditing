Notes
    - NFT Marketplace
    - Until now only 6 NFTs are minted, and listed on the marketplace.
    - 1 DVNFT = 15 ETH
    - Attacker balance = 0.5 ETH

TODO
    - Troubleshot the AttackFR.sol contract issues.
    - compare it with the working "AttackFreeRider.sol" contract.

Goal
    - Take all 6 NFTs.

Attack Approache 1
    - Create new offers of almost 0 value of DVNFT token
        - The offers will not be updated as the new tokens are not approved to list on marketplace.
        - The challenge also says that you need to buy these 6 NFTs.
        - "But this seems feasible" but only the deployer of token contract (marketplace contract) can mint new tokens, due to minter RBAC.
    - After token transfer if we pay to the new owner, then we are indeed paying the buyer.

Attack Approach 2:
    - As we have offer many, could we change the value the contract is called again?
    - create new NFT?

Attack:
    - Cheated! I did see the bug but did not know how to get the 15 ether to exploit it.
    - Ref: https://www.youtube.com/watch?v=bdM8Qs6JUro