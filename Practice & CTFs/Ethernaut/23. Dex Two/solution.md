Between Dex and Dex2, there is 2 changes.

1. `require((from == token1 && to == token2) || (from == token2 && to == token1), "Invalid tokens");` is removed.

2. you now need to drain both of the contracts. The approach now will be different, as we can give any malicious contract address now.


Solution:
Ref: https://dev.to/nvn/ethernaut-hacks-level-23-dex-two-4424

1. create malicious token T3 and create an initial supply of 400, out of this we keep 200 coins for us.

2. Add liquidity (send to the exchange) 100 coins.

3. Exchange T1 token with our malicious coin. I deliberately only supplied 100 coins in liquidity to keep the exchange rate = 1.

4. At this point the exchange the exchange will not have any T1. It will have only T2 and T3(our malicious token).

5. Similarly Repeat 2, 3 & 4 for T2. This will keep the exchange rate = 1, to make attack simple to understand.

6. Finally, at the end, the exchange will only have this malicious tokens T3 (200 coins) with it, and all the valuable tokens (T1 & T2) will be exchanged to attacker's contract/account.