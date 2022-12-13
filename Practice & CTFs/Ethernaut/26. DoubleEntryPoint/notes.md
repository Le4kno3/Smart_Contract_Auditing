Notes:
* Interfaces are not defined.
* The forta defination seems to be safe, given it does not have used in any checks.

Solution:
* Basically we dont have to worry about interface definition here.
* We only need to find a weak token transfer function, such that it can take any ERC20 token (in this case there are 2 tokens owned (or have permissions) by the contract to transfer) and perform the transfer.
Ref: https://github.com/maAPPsDEV/double-entry-point-attack
Ref: https://daltyboy11.github.io/every-ethernaut-challenge-explained/#doubleentrypoint