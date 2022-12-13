608060405234801561001057600080fd5b50600a8061001f6000396000f3fe602a60405260206040f3



-----------------ANALYSIS AND WORKING-------------------------------


===> Step 1:

[00]
PUSH1	80
[02]	PUSH1	40
[04]	MSTORE


* `memory [ 0x40 : 0x40 + 0x20 ] = 0x80`
* This could be some standard runtime thing that every EVM has to do.

<==============================================================================

===> Step 2:

[05]	CALLVALUE
[06]	DUP1
[07]	ISZERO
[08]	PUSH2	0010
[0b]	JUMPI
[0c]	PUSH1	00
[0e]	DUP1
[0f]	REVERT
[10]	JUMPDEST


* Check if any money (`value`) is sent, if yes then terminate the transaction, if no money then continue.

<==============================================================================

===> Step 3:

[11]	POP


* Clear the stack before moving forward

<==============================================================================


===> Step 4:

[12]	PUSH1	0a
[14]	DUP1
[15]	PUSH2	001f
[18]	PUSH1	00
[1a]	CODECOPY
[1b]	PUSH1	00
[1d]	RETURN
[1e]	INVALID        <- end of the constructor / runtime code, which will not be saved in blockchain.


[1f]	PUSH1	2a
[21]	PUSH1	40
[23]	MSTORE
[24]	PUSH1	20
[26]	PUSH1	40
[28]	RETURN


* Until now this was the run time code that will execute by EVM, **this bytecode will not be pushed in blockchain**.
* Now for the bytecode that will be pushed, we need to tell the EVM where the bytecode start and what length.
* We need to copy code in `memory` so that we can push this bytecode to blockchain.
* CODECOPY
    * From: The location after the last line of constructor, which in our case is [1e], so we will copy from [1f]
    * To: we need to copy to [1f + 0a] == [29]
    * copy all this code in memory, with offset = 0x0, which means memory[00 : 00+0a].


<==============================================================================





