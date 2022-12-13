// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "../helpers/UpgradeableProxy-08.sol";

contract PuzzleProxy is UpgradeableProxy {
    address public pendingAdmin; //slot 0 - overlaps with PuzzleWallet.owner
    address public admin; //slot 1 - overlaps with PuzzleWallet.maxBalance

    constructor(
        address _admin,
        address _implementation,
        bytes memory _initData
    ) UpgradeableProxy(_implementation, _initData) {
        admin = _admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    function proposeNewAdmin(address _newAdmin) external {
        pendingAdmin = _newAdmin;
    }

    function approveNewAdmin(address _expectedAdmin) external onlyAdmin {
        require(
            pendingAdmin == _expectedAdmin,
            "Expected new admin by the current admin is not the pending admin"
        );
        admin = pendingAdmin;
    }

    function upgradeTo(address _newImplementation) external onlyAdmin {
        _upgradeTo(_newImplementation);
    }
}

contract PuzzleWallet {
    address public owner; //slot 0 - overlaps with PuzzleProxy.pendingAdmin
    uint256 public maxBalance; //slot 1 - overlaps with PuzzleProxy.admin
    mapping(address => bool) public whitelisted; //slot 2 & "more in a different starting address"
    mapping(address => uint256) public balances; //slot 3 & "more in a different starting address"

    function init(uint256 _maxBalance) public {
        require(maxBalance == 0, "Already initialized");
        maxBalance = _maxBalance;
        owner = msg.sender;
    }

    modifier onlyWhitelisted() {
        require(whitelisted[msg.sender], "Not whitelisted");
        _;
    }

    function setMaxBalance(uint256 _maxBalance) external onlyWhitelisted {
        require(address(this).balance == 0, "Contract balance is not 0");
        maxBalance = _maxBalance;
    }

    //@audit-issue - permissions granter function is public and with no checks.
    function addToWhitelist(address addr) external {
        require(msg.sender == owner, "Not the owner");
        whitelisted[addr] = true;
    }

    function deposit() external payable onlyWhitelisted {
        require(address(this).balance <= maxBalance, "Max balance reached");
        balances[msg.sender] += msg.value;
    }

    function execute(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable onlyWhitelisted {
        //checks
        require(balances[msg.sender] >= value, "Insufficient balance");

        //effects
        balances[msg.sender] -= value; //@audit-ok - There is indeed an integer overflow, but with the newer version of solidity, this is handled by EVM.

        //interaction
        (bool success, ) = to.call{value: value}(data);
        require(success, "Execution failed");
    }

    function multicall(bytes[] calldata data) external payable onlyWhitelisted {
        bool depositCalled = false;
        for (uint256 i = 0; i < data.length; i++) {
            bytes memory _data = data[i];
            bytes4 selector;
            assembly {
                //add(_data, 32) = next memory after selector.
                //now this is pointing to the next call data, as the bytes[] is dynamic and consecutive elements are store close to each other.
                selector := mload(add(_data, 32))
            }

            //if I somehow bypass this check, I can deposit any number of balance to msg.sender, without actually sending it.
            // this.deposit.selector = web3.eth.abi.encodeFunctionSignature("deposit()") - only the first 4bytes or 8 hexd.
            if (selector == this.deposit.selector) {
                require(!depositCalled, "Deposit can only be called once"); //is this check strong enough?
                // Protect against reusing msg.value
                depositCalled = true;
            }

            //can this below line be exploited?
            //because msg.value is a global variable, its value will not change within a single transaction.
            //if you are using some loop to deposit msg.value, 2 times, then it will be added 2 times.
            (bool success, ) = address(this).delegatecall(data[i]);
            require(success, "Error while delegating call");
        }
    }
}
