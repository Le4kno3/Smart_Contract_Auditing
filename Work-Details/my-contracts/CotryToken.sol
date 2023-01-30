// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import 'hardhat/console.sol';

contract NFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address marketplaceContractAddress;
    uint256 public MAX_TOKENS_LIMIT;
    uint256 MAX_TOKENS_PER_USER;
    string TOKEN_URI = ''; //by default it will of type "storage"
    uint256 token_price; //it is assumed that all tokens in the NFT will have same price.
    mapping(address => uint256) private nftTokensClaimed;
    bool isSaleActive;

    // mapping(uint256 => address) private nftTokenOwnerByTokenId; //this is not needed as contract already has ownerOf(tokenId) function

    //The owner will be the creator of the contract, the buyer of NFT tokens will have different
    //data structure where there ownership will be sotred.

    constructor(
        uint256 max_supply_count,
        uint256 max_user_count,
        uint256 _price,
        string memory _tokenURI,
        bool _isActive
    ) ERC721('Cotry Tokens', 'COTRY') {
        // marketplaceContractAddress = marketAddress;
        MAX_TOKENS_LIMIT = max_supply_count;
        MAX_TOKENS_PER_USER = max_user_count;
        token_price = _price; //this price has to be in "wei"
        isSaleActive = _isActive;
        TOKEN_URI = _tokenURI;

        //set owner is not needed as ownable.sol will automatically take the deployer and initial owner.
    }

    //only the creator of the NFT contract can change the price.
    // @param _newPrice is in wei
    function updatePrice(uint256 _newPrice) public onlyOwner {
        token_price = _newPrice;
    }

    function setSaleActive(bool status) public onlyOwner {
        isSaleActive = status;
    }

    //lazy mint nft
    function safeMint(uint256 tokens_purchased) public payable {
        //token ID is already incremented in previous mint or else it is 0 for first mint.

        require(isSaleActive, 'Sale is currently not active');
        require(
            MAX_TOKENS_LIMIT > tokens_purchased + _tokenIds.current() + 1,
            'Not enough tokens left to buy.'
        );

        //for unintialized values, nftTokensClaimed[msg.sender] returns 0
        require(
            tokens_purchased > 0 &&
                nftTokensClaimed[msg.sender] + tokens_purchased <
                MAX_TOKENS_PER_USER + 1,
            'Amount of tokens exceeds the maximum number of tokens that can be owned by a single user.'
        );

        //note that msg.value is in wei
        require(
            msg.value >= tokens_purchased * token_price,
            'Amount of ether sent, is less than required.'
        ); //should msg.value = the required price?

        //update the claimed tokens count.
        nftTokensClaimed[msg.sender] += tokens_purchased;

        for (uint256 i = 0; i < tokens_purchased; i++) {
            //nft tokens will be minted and sent directly to the buyer.
            _safeMint(msg.sender, _tokenIds.current());
            //token URI will be same for all tokens of this contract.
            _setTokenURI(_tokenIds.current(), TOKEN_URI);
            _tokenIds.increment(); //this state change has to be done after the last used value.
        }
    }

    function transferToken(
        address from,
        address to,
        uint256 tokenId
    ) external onlyOwner {
        //check if the current user is the owner of the token.
        require(ownerOf(tokenId) == from, 'From address must be token owner');

        //if yes, then tranfer it to new owner.
        _transfer(from, to, tokenId);
    }

    //get list of tokens owned by the owner address.
    //its ok to include the first character to save some compuation cost.
    function getTokensOwnedByAddress(
        address owner_address
    ) public view returns (string memory) {
        string memory result = '';
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            if (ownerOf(i) == owner_address) {
                result = string.concat(result, ',', Strings.toString(i));
            }
        }
        return result;
    }

    //used to get owner address of the token ID.
    function getTokenOwnerFromTokenId(
        uint256 tokenId
    ) public view returns (address) {
        return ownerOf(tokenId);
    }

    function getCurrentTokenCount() public view returns (uint256) {
        return _tokenIds.current();
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
