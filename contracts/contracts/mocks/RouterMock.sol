// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

contract Router {
    uint256 private _idCounter = 1;

    event Request(uint256 id, uint64 destChainSelector, bytes data);

    function getFee(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external returns (uint256) {
        return 0;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage memory message
    ) external payable returns (bytes32) {
        uint256 id = _idCounter;

        unchecked {
            _idCounter++;
        }

        emit Request(id, destinationChainSelector, abi.encode(message));

        return bytes32(id);
    }
}
