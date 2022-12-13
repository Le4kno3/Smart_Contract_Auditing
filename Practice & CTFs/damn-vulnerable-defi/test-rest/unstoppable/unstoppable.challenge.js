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
    });

});
