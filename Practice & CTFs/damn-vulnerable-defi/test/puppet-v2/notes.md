Notes
    - As observed in puppetv1, if a person has many times the tokens as that of the exchange, the that person can perform oracle price manipulation attack.
    - In puppetV2 we hav similar situation, where we have 100x more tokens.

Attacker
    - You start with 20 ETH and 10000 DVT tokens in balance.

Exchnage
    - 10 WETH : 100 DVT

Pool
    - Allows borrowing `borrowAmount` of tokens by first depositing 3x of their value in WETH.
    - There are 2 methods called by pool to compute the oracle price.
        - UniswapV2Library.getReserves()
        - UniswapV2Library.quote()

Goal: Drain all pool balance.

Attack Approach 1:
    - Understand how the exchange rates are calculated.
        - UniswapV2Library.getReserves()
            - How are the reserves value computed?
                - 
        - UniswapV2Library.quote()
        - UniswapV2Pair.getReserves()
            - how is reserve0 and reserve1 updates in UniswapV2Pair?
                - _update() is what that does the updates. who all call it
                    - sync()
                    - swap()
                        - is what looks interesting
                    - burn()
                    - mint()
                    - skim()
    - Then find away using which we can manipulate the prices using the assets, the attacker own.


Attack Approach 2:
    - If we try to use flash loan to do price manipulation, it could have been possible in v1, but not in v2.
        - by measuring and recording the price before the first trade of each block
        - cumulative sum works of prices for exchange is also calculated

    - Bypass protection (may not always work)
        - end assets to the pair contract, thus change its balances and marginal price
        - If the contract simply checked its own balances and updated the oracle based on the current price, an attacker could manipulate the oracle by sending an asset to the contract immediately before calling it for the first time in a block.


Attack:
    - swap() DVT with WETH, this causes the price of DVT go drastically down
        - the pair contract, has very less WETH, and when we swap DVT with WETH, its WETH balance will further deplete.
        - now when we calculate the exchange rate = very less numerator / very big denominator, it will be many times less the new price of exchange.
    - and we will have some WETH with us which can help to solve the 3x WETH deposit.
    - check quote()
    - all good then borrow()
    *I cheated here, as the attack is similar to v1, just we have to do for v2 in a different way.*
    Ref: [Blud Alder puppet v2 solution](https://github.com/BlueAlder/damn-vulnerable-defi/blob/master/test/puppet-v2/puppet-v2.challenge.js)