Notes
    - NFT Marketplace
    - Until now only 6 NFTs are minted, and listed on the marketplace.
    - 1 DVNFT = 15 ETH
    - Attacker balance = 0.5 ETH

Goal
    - Take all 6 NFTs.

Attack Approaches
    - Create new offers of almost 0 value of DVNFT token
        - The offers will not be updated as the new tokens are not approved to list on marketplace.
        - The challenge also says that you need to buy these 6 NFTs.
        - "But this seems feasible" but only the deployer of token contract (marketplace contract) can mint new tokens, due to minter RBAC.
    - After token transfer if we pay to the new owner, then we are indeed paying the buyer.