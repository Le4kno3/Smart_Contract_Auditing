Notes
    - Attacker, current assets : 25 ETH & 1000 DVTs

Goal - You must steal all tokens from the lending pool.


Lending Pool
    - There are 100,000 DVT tokens in the pool
    - The lending pool makes use of exchange to determine the price of the DVT tokens.
    - first need to deposit twice the borrow amount in ETH as collateral.

Exchange
    - There's a DVT market opened in an Uniswap v1 exchange, currently with 10 ETH and 10 DVT in liquidity.
        - This means a new "exchange token" contract is created which will handle the exchange prices and management of that token.
    - current liquidity : 10 ETH & 10 DVT
    - Due to this exchange rate = 1:1

Analysis
    - After reading the question and contract, there is not much in pool contract. But the "uniswap v1" looks suspicious.
    - I am taking some help in reading the uniswap v1 "exchange" contract from [Uniswap v1 explanation](https://hackmd.io/@HaydenAdams/HJ9jLsfTz#Creating-Exchanges)

Attack Approach:
    - We can directly add or remove liquidity from exchange contract, but the exchange has a limited funds.
    - Our first goal is to make the OMG token price as less as possible.
        1. Sell all attacker owned DVT tokens.
            - we just need to transfer the tokens to the exchange.address
            - why cant is send using this.token.transfer(this.exchange.address) yes this works
            - this will reduce the price of OMG token.
    - How many ETH I will get in return?
        2. 1980.19801980198 ETH, but the problem is this is not enough because we need 2x of ETH.
            - I think we need to repeat this attack in an intelligent way, rather than investing all attacker tokens ETH at once we should be doing this in steps gradually.
            - If we have transferred the tokens, can we remove the token liquidity?
    3. The buy as much DVT tokens as possible.
        - you have to pay the 2x collateral.
    - summary: Inject lots of tokens to exchange, reduce the price of token, then buy the tokens from pool. Due to this manipulated price, we can drain the pool, slowly if not all at once.

Attack Approach 2:
     - The above method does de-value the DVT tokens.
     - But the problem is that it now requires around 1989 ETH (earlier it was 100000 ETH) to buy 100000 DVT.
     - Now the only possible solution is to somehow reduce the exchange ETH balance.
        - We need to swap Tokens with ETH, instead of simply sending the tokens to the exchange.
        - This will reduce the ETH amount of reserve for that exchange. And we are already sending a lots of tokens.
    - new ETH_reserve(exchange) = previous_reserve(exchange) - swapping_cost(tx)
    - Now when the next exchange rates are calculated it will be new ETH_reserve(exhcnage) / TOKEN_reserve(exchange)

Root Cause of Attack: The attack has 100x more tokens than the exchange.