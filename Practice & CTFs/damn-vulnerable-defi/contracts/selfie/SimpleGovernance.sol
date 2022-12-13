// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../DamnValuableTokenSnapshot.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title SimpleGovernance
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract SimpleGovernance {
    using Address for address;

    struct GovernanceAction {
        address receiver;
        bytes data;
        uint256 weiAmount;
        uint256 proposedAt;
        uint256 executedAt;
    }

    DamnValuableTokenSnapshot public governanceToken;

    //log of all actions, GovernanceAction will keep details of the particular action.
    mapping(uint256 => GovernanceAction) public actions;

    //number of actions performed.
    uint256 private actionCounter;

    //
    uint256 private ACTION_DELAY_IN_SECONDS = 2 days;

    event ActionQueued(uint256 actionId, address indexed caller);
    event ActionExecuted(uint256 actionId, address indexed caller);

    constructor(address governanceTokenAddress) {
        require(
            governanceTokenAddress != address(0),
            "Governance token cannot be zero address"
        );
        governanceToken = DamnValuableTokenSnapshot(governanceTokenAddress);
        actionCounter = 1;
    }

    //queue for new action.
    //@audit - There is no checks on the receiver address
    function queueAction(
        address receiver,
        bytes calldata data,
        uint256 weiAmount
    ) external returns (uint256) {
        //should have governanceToken > LastTokenSupply/2
        //this is just a check, actual tokens are not transferred.
        require(
            _hasEnoughVotes(msg.sender),
            "Not enough votes to propose an action"
        );

        //we cannot run action on SimpleGovernance contract.
        require(
            receiver != address(this),
            "Cannot queue actions that affect Governance"
        );

        uint256 actionId = actionCounter;

        //this could mean, actionToQueue now point to actions[actionId]
        GovernanceAction storage actionToQueue = actions[actionId];

        //set the action details
        actionToQueue.receiver = receiver;
        actionToQueue.weiAmount = weiAmount;
        actionToQueue.data = data;
        actionToQueue.proposedAt = block.timestamp;

        //increment the action counter.
        actionCounter++;

        emit ActionQueued(actionId, msg.sender);
        return actionId;
    }

    function executeAction(uint256 actionId) external payable {
        //the action should be in queue for atleast 2 days then only it can be executed.
        require(_canBeExecuted(actionId), "Cannot execute this action");

        //execute the action.
        GovernanceAction storage actionToExecute = actions[actionId];
        actionToExecute.executedAt = block.timestamp;

        actionToExecute.receiver.functionCallWithValue(
            actionToExecute.data,
            actionToExecute.weiAmount
        );

        emit ActionExecuted(actionId, msg.sender);
    }

    function getActionDelay() public view returns (uint256) {
        return ACTION_DELAY_IN_SECONDS;
    }

    /**
     * @dev an action can only be executed if:
     * 1) it's never been executed before and
     * 2) enough time has passed since it was first proposed
     */
    function _canBeExecuted(uint256 actionId) private view returns (bool) {
        GovernanceAction memory actionToExecute = actions[actionId];
        return (actionToExecute.executedAt == 0 &&
            (block.timestamp - actionToExecute.proposedAt >=
                ACTION_DELAY_IN_SECONDS));
    }

    function _hasEnoughVotes(address account) private view returns (bool) {
        uint256 balance = governanceToken.getBalanceAtLastSnapshot(account);
        uint256 halfTotalSupply = governanceToken
            .getTotalSupplyAtLastSnapshot() / 2;
        return balance > halfTotalSupply;
    }
}
