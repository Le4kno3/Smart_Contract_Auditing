Notes
- exchange is selling DVNFT tokens. (1 token for 999ETH)
- price of this token is fetched from "on-chain oracle" - which has 3 "reporters".
    - 0xA73209FB1a42495120166736362A1DfA9F95A105
    - 0xe92401A4d3af5E446d93D11EEc806b1462b39D15
    - 0x81A5D6E50C214044bE44cA0CB057fe119097850c
- balance of the exchange = 9990 (we can buy 10 tokens worth 999 each)

- Exchange
    - buyOne DVNFT
    - sellOne DVNFT

- DVNFT token contract
    - looks good to me.
    - Can supports interface be vulnerable?

- Approaches
    - If we can buy 10 DVNFT tokens then we can exchange them to drain all ETH from exchange.
        - Can we influence the exchange rates? `postPrice()`
        - Can we somehow bypass checks to buy DVNFT, this is done on exchange? buyOne()
            - Not as per my checks.
        - Can we somehow influence or get access to one of the sources.
            - This is it.
        - Can i influence the median price by adding new sources? Is it feasible?
            - ?
    - Can I change these sources to attacker defined sources?
        - d

- Attack Initial approach (using private key of 2 reporters)
    - from the reporter1 account - "4d48686a4e6a63345a575978595745304e545a6b59545931597a5a6d597a55"
        - Change the price of the token 0.001ETH
    - from the reporter1 account - "4d4867794d4467794e444a6a4e4442685932526d59546c6c5a4467344f5755"
        - Change the price of the token 0.001ETH
    - Now the median of the 3 reporters is, 1 DVNFT = 0.001 ETH
    - Now buy 10 DVNFT.
    - Change the prices back to 1 DVNFT = 999 ETH
    - Then sell 10 DVNFT, to get back 9990ETH.

- Attack Finetuned approach for the challenge (our goal is not to buy 10 tokens but make the exchange balance to 0)
    - from the reporter1 account - "4d48686a4e6a63345a575978595745304e545a6b59545931597a5a6d597a55"
        - Change the price of the token 0.001ETH
    - from the reporter1 account - "4d4867794d4467794e444a6a4e4442685932526d59546c6c5a4467344f5755"
        - Change the price of the token 0.001ETH
    - Now the median of the 3 reporters is, 1 DVNFT = 0.001 ETH
    - Now buy 1 DVNFT
    - Change the prices back to 1 DVNFT = 9989.99 ETH (remaining exchange balance)
    - Then sell that 1 DVNFT token.


0x4d48686a4e6a63345a575978595745304e545a6b59545931597a5a6d597a55344e6a466b4e4451344f544a6a5a475a68597a426a4e6d4d34597a49314e6a42695a6a426a4f575a69593252685a544a6d4e44637a4e574535

0x4d4867794d4467794e444a6a4e4442685932526d59546c6c5a4467344f5755324f44566a4d6a4d314e44646859324a6c5a446c695a575a6a4e6a417a4e7a466c4f5467334e575a69593251334d7a597a4e444269596a5134


          4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35

          4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34
        