1. Intially the balance will be 10 ** 6. So when you done 10, then coin.transfer() will be executed.

2. Define the wallet.donate10() -> coin.transfer() -> "notify" function of "INotifyable" interface, inside the  with below:
```
revert NotEnoughBalance();
```
3. This will successfuly revert until the wallet.balance >=10, if the balance is less than 10, then we will not be able to call it. But a good thing is that the contract itself calls it we dont have to call the `remainderBalancer`, just make sure our `notify` does not revert in this case.