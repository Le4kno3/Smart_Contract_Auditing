idea
Approach 1:
* Using upgradeTo() to upgrade malicious contract, change the global/storage variables.
* Then change back to the original.
* only the owner can add to whitelist. So I cannot directly exploit the puzzle contract, I have to first exploit somehow the proxy contract first such that it can influence the puzzle contract.

-------------------------------------------------------------------------

problem1 - proxy contract is not accessible
* I can logically tell that proxy contract public variables and functions should be accessible.
* Also all my requests will first go to the proxy contract, which then will forward to logic contract. But this is not very intutive when I see the `contract` object given by ethernaut challange.

solution1 - very trivial
* It could be that they are deliberately removed all public functions so that the normal user cannot access it.
* as the slots are overlapping it may be difficult to grab it.
* simply add the missing function in the contract ABI, if you are attacking using a attack.sol contract
[part1](solution1.png)
or

directly use low-level call from browser itself, ethernauth's `contract` object has a sendTransaction() sending function signature and arguments.
Ref: https://www-kiendt-me.translate.goog/2022/03/01/the-ethernaut-24/?_x_tr_sl=vi&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=sc

Finally, using this we can change owner. Then we need to whitelist our address.

`await contract.addToWhitelist(player);`

----------------------------------------------------------------------------

problem2 - How to make this.balance of PuzzleWallet contract = 0

Ref: https://www-kiendt-me.translate.goog/2022/03/01/the-ethernaut-24/?_x_tr_sl=vi&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=sc

upgrading the "max balance" will solve the problem, but currently the balance is > 0

first i need to make the balance = 0;

Understanding working of "multicall".

As it is "multicall" we can batch multiple calls. But we cannot batch multiple "deposit" call, due to check.

Our goal is = in 1 transaction call deposit multiple times.

In 1 "multicall" we can only call the deposit once.

what if we batch 2 multicall (child calls) in inside 1 multicall (parent call) and send the parent mulitcall. Such that a child multicall will only execute the deposit function once.

[part2](solution2.png)

Then finally,
- spend all (this).balance of the puzzleWallet contract.
- change the maxBalance which will change the admin of the proxy contract

-----------------------------------------------------------------------------