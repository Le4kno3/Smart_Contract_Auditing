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
    - Then the pool contract will use this manipulated exchange rates.
    - The buy as much DVT tokens as possible.
        - you have to pay the 2x collateral.
    - sell a lot of tokens to uniswap exchange directly
        - this will reduce the price of OMG token.
    - Then buy lots of OMG tokens from pool
    - summary: Inject lots of tokens to exchange, reduce the price of token, then buy the tokens from pool. Due to this manipulated price, we can drain the pool, slowly if not all at once.