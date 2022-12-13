// SPDX-License-Identifier: MIT

pragma solidity <0.7.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

//this is a proxy contract
contract Motorbike {
    // keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1
    //@audit-ok - This is the only storage variable the proxy contract has.
    //we want to define this in some random storage slot, to avoid any slot conficts with logic contract.
    bytes32 internal constant _IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    struct AddressSlot {
        address value;
    }

    // Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
    constructor(address _logic) public {
        //we need "StorageSlots" to avoid slot conflicts, generally used in proxy contract implementation.
        //any storage variable stored in "Proxy" contract will start with a different/later slot.
        //@audit-ok - check if the address is a contract address but this check is not a full proof check.
        //But this is called in constructor so it is fine.
        require(
            Address.isContract(_logic),
            "ERC1967: new implementation is not a contract"
        );

        //set value to "StroageSlot"
        //it stores the contract address in implementation slot.
        _getAddressSlot(_IMPLEMENTATION_SLOT).value = _logic;

        //run the "initialize" function of the logic contract. workaround for the constructor.
        (bool success, ) = _logic.delegatecall(
            abi.encodeWithSignature("initialize()")
        );
        require(success, "Call failed");
    }

    // this is a userfriendly interface to interact with "StorageSlots".
    // the `AddressSlot` will give `value` interface to read and write data on the storage slot.
    function _getAddressSlot(
        bytes32 slot
    ) internal pure returns (AddressSlot storage r) {
        assembly {
            r_slot := slot //sets the address of the slot
        }
    }

    // Delegates any calls to proxy contract to logic constract.
    //the modifier is set to "virtual" it means it can be overriten in the inherited contract.
    function _delegate(address implementation) internal virtual {
        assembly {
            //copy call data to memory
            //0 - memory offset
            //0 - which part of calldata to copy, by 0 we mean all.
            //calldatasize() - how much data to copy from the offset of calldata.
            calldatacopy(0, 0, calldatasize())
            //now memory(0:calldatasize()) will store the calldata

            //call deligate call. The function to call is specified in calldata.
            let result := delegatecall(
                gas(), //get the amount of available gas, and pass it to the deligate logic contract.
                implementation, //address of the logic contract.
                0, //argument offset
                calldatasize(), //argument size
                0, //return offset - nothing returned.
                0 //return size - nothing returned.
            )

            //the results returned are copied in memory.
            //@audit - pending, it does not return anything so why this line is there?
            returndatacopy(0, 0, returndatasize())

            //If result = 0, tne trigger exception. Else simply return output.
            //@audit - pending, dont know why returndatasize is returned.
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    // Fallback function that delegates calls to the address returned by `_implementation()`.
    // Will run if no other function in the contract matches the call data
    fallback() external payable virtual {
        //basically - deligate(logic_contract_address)
        _delegate(_getAddressSlot(_IMPLEMENTATION_SLOT).value);
    }
}

//this is the logic contract.
contract Engine is Initializable {
    // keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1
    //@audit - slot conflict with proxy contract, this means we can change address of the implementation contract.
    bytes32 internal constant _IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    address public upgrader;
    uint256 public horsePower;

    struct AddressSlot {
        address value;
    }

    //@audit-ok - this is protected by initializer mutex.
    //what if I call this from my contructor.
    function initialize() external initializer {
        horsePower = 1000;
        upgrader = msg.sender;
    }

    // Upgrade the implementation of the proxy to `newImplementation`
    // subsequently execute the function call
    function upgradeToAndCall(
        address newImplementation,
        bytes memory data
    ) external payable {
        //check if sender is the "upgrader" of the contract.
        _authorizeUpgrade();

        //if no exception. then run this.
        _upgradeToAndCall(newImplementation, data);
    }

    // Restrict to upgrader role
    //simply checks if you are upgrader or not.
    function _authorizeUpgrade() internal view {
        require(msg.sender == upgrader, "Can't upgrade");
    }

    // Perform implementation upgrade with security checks for UUPS proxies, and additional setup call.
    function _upgradeToAndCall(
        address newImplementation,
        bytes memory data
    ) internal {
        // Initial upgrade and setup call
        _setImplementation(newImplementation);
        if (data.length > 0) {
            (bool success, ) = newImplementation.delegatecall(data);
            require(success, "Call failed");
        }
    }

    // Stores a new address in the EIP1967 implementation slot.
    function _setImplementation(address newImplementation) private {
        require(
            Address.isContract(newImplementation),
            "ERC1967: new implementation is not a contract"
        );

        AddressSlot storage r;
        assembly {
            r_slot := _IMPLEMENTATION_SLOT
        }
        r.value = newImplementation;
    }
}
