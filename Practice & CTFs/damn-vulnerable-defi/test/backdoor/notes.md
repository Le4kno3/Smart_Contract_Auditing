Notes
    - Standard libraries generally are throughly audited. So Findings bugs in GnosisSafe.sol should be the last thing to do.

Gnosis Wallet Proxy
    - These are user wallet contracts, implemented via proxy.
    - A user(s) which has it own address, own the wallet ( = Gnosis Wallet Proxy ) which has a different address.

Wallet Factory
    - The contract that manages creation of new gnosis safe wallets.

Wallet Registery
    - There is a huge payment of 10 ether, for anyone who creates a gnosis wallet.

Attack Approach
    - Attack/Exploit proxyCreated() function
    - We need to execute attack via wallet_factory contract.
    - initializer calldata should first callGnosisSafe.setup()
    - checks the max owner and the max threshold
    - owner of the gnosis safe wallet should be a beneficiary

    - can't we create new custom contracts without using gnosis factory, and pass it to wallet registry contract?

    - can we exploit add remove beneficiary?

    - can we create a new proxy and impersonate another user or exploit the business logic bugs?
        - benificiaries are global variables.
        - we need to create a proxy for each of the benificiaries.
            - As per instruction in WalletRegistery.sol contract, we need to make use of createProxyWithCallback().
                - I dont need to specify proxyCreated(), because this function createProxyWithCallback() does call it at the end.
                - this will handle, msg.sender = walletFactory.
                - initializer? Payload for message call sent to new proxy contract.
                    - I think so the initializer will call setup()
                - saltNonce? Nonce that will be used to generate the salt to calculate the address of the new proxy contract.
        - for bypassing the rest of the checks, as we define the details of the setup() we can satisfy all the require checks.

Attack
    - cheated! faced confusion between different fallback calls, expecially the GenosisSafe.setup() call.
    Ref: 
    https://github.com/BlueAlder/damn-vulnerable-defi/blob/master/test/backdoor/backdoor.challenge.js
    Ref: https://github.com/BlueAlder/damn-vulnerable-defi/blob/master/contracts/attacker-contracts/AttackBackdoor.sol


Attack overview

This challenge introduces the idea of proxy contracts and singleton 
contracts.

The way this works is that you can have a factory contract which deploys 
proxies to the Gnosis Safe singleton contract. This essentially means
that the proxy offloads all logic to the singleton contract with the
context of the proxy state. It does this through delegate calls.

Factory CALLS -> Proxy DELEGATECALLS -> Singleton Gnosis Safe

Now we can create new Gnosis safes with anyone as the owner which means
we can create a safe on the behalf of the beneficiraies and then 
ensure the factory calls back to the WalletRegistry contract. During
this callback the contract will transfer 10 DVT to the newly created
Gnosis safe. However we are unable to access it since it is solely owned
by one of the beneficiaries. 

To get around this we can install a backdoor module into the Gnosis safe
on initialization which DOES NOT require the signatures of the owners on
deployment only (if you try to add a module after deployment it does
require signatures).

You can exploit this via execTransactionFromModule() or even more simply,
you can run the exploit on the initialisation code of your module. Within 
this code you can approve the attacker/smart contract to spend the funds
of the Gnosis wallet.

Most of the logic is placed in the Smart Contract to allow this to happen
in one transaction. But essentially it goes:


1. Deploy malicious contract
2. Generate the ABI to call the setupToken() function in the malicious contract
3. exploit(): Call exploit with the above ABI and the list of users
4. exploit(): Generate the ABI to setup the new Gnosis wallet with the ABI from step 2
          such that the callback address and function is the wallet registry
5. exploit(): Call the ProxyFactory contract with the ABI from step 4 and a few other bobs
      with a callback to the WalletRegistry proxyCreated() function.
6. createProxyWithCallback(): Deploys the new Proxy and calls setup() on the proxy
7. setup(): New proxy is setup and sets up the module calling back to the malicous contract
      however this time is a delegate call meaning it is executed in the context
      of the newly create proxy contract.
8. setupToken(): [proxy context] Approve 10 ether to be spent by the malicious contract
          of the proxies token funds
9. proxyCreated(): Callback executed on the wallet registry and passes checks and transfers
              10 ether to the newly created wallet
10. exploit(): Transfer the 10 ether from the Gnosis wallet to the attacker address
11. Repeat for each beneficiary from within the contract and hence 1 transaction.



- flow
    1. create a new proxy (new wallet) - GSProxyFactory.createProxyWithCallback()
    2. As we have selected fallback, as soon as the proxy (new wallet) is created, the fallback will execute - WalletRegistry.proxyCreated()
    3. Proxy Created will deposit, 10 ether to benificiary.
    4. We need to then run the setup()


Root Cause
    - Benificiaries are assigned by their respective wallet address are not created.
    - Signatures were not verified of the sender.
    - User input is trusted.
        - user can specify fallback functions and proxyCreated()
        - Such that they can get the "promotional" payment of 10 ether of other accounts.