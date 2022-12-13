1. somehow upgrade this contract, with the same contract but now with self destruct call.
2. to make proxy unusable, we dont have to do anything. As the upgrade logic will reside on the logic/implementation contract. Now if the logic contract is itself self destructed, there is no way to upgrade the proxy contract with any version or any new contract. Hence making the proxy unusable.

Ref: https://www.youtube.com/watch?v=D7IfmkINYJ0&ab_channel=D-Squared