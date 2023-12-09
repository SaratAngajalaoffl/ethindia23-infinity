// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Router {
    uint256 private _idCounter;

    event Request(uint256 id, uint64 destChainSelector, bytes data);

    struct EVMTokenAmount {
        address token;
        uint256 amount;
    }

    struct EVM2AnyMessage {
        bytes receiver;
        bytes data;
        EVMTokenAmount[] tokenAmounts;
        address feeToken;
        bytes extraArgs;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        EVM2AnyMessage memory message
    ) external payable returns (bytes32) {
        uint256 id = _idCounter;

        unchecked {
            _idCounter++;
        }

        emit Request(id, destinationChainSelector, abi.encode(message));

        return bytes32(id);
    }
}
