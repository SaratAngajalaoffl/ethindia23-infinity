// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../mocks/TokenMock.sol";
import "../mocks/RouterMock.sol";

contract InfinityEntrypoint {
    uint256 private _idCounter;

    Router private _chainlinkRouter;
    TokenMock private _linkToken;

    event OutgoingTradeInitiated(uint256 id, address[] inputs);

    struct OutgoingTradeRequest {
        uint256 endTime;
        uint256 destChain;
        address outputAddress;
        uint256 outputValue;
    }

    constructor(address linkToken, address chainlinkRouter) {
        _linkToken = TokenMock(linkToken);
        _chainlinkRouter = Router(chainlinkRouter);
    }

    function _generateId() internal returns (uint256 id) {
        id = _idCounter;

        unchecked {
            _idCounter++;
        }
    }

    function initiate(
        address[] calldata inputs,
        uint256[] calldata inputValues,
        address outputAddress,
        uint256 outputAmount,
        uint256 destChain,
        uint256 duration
    ) external {
        uint256 id = _generateId();

        emit OutgoingTradeInitiated(id, inputs);
    }
}
