// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../mocks/TokenMock.sol";
import "../mocks/RouterMock.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {ClientLib} from "../lib/ClientLib.sol";

contract InfinityEntrypoint is CCIPReceiver {
    struct Trade {
        uint256 tradeId;
        uint64 destChain;
        address[] inputs;
        uint256[] inputAmounts;
        address outputAddress;
        uint256 outputAmount;
        uint256 duration;
        uint256 ccipId;
    }

    struct Auction {
        uint256 tradeId;
    }

    mapping(uint256 => Trade) trades;
    mapping(uint256 => Auction) auctions;

    mapping(uint256 => address) entrypoints;
    mapping(uint256 => uint64) selectors;

    uint256 private _idCounter = 1;

    Router private _chainlinkRouter;
    TokenMock private _linkToken; // Remove this

    error NotEnoughBalance(uint256 balance, uint256 fees);

    // Event emitted when a message is received from another chain.
    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed sourceChainSelector, // The chain selector of the source chain.
        address sender, // The address of the sender from the source chain.
        string text // The text that was received.
    );

    constructor(
        address linkToken,
        address chainlinkRouter
    ) CCIPReceiver(chainlinkRouter) {
        _linkToken = TokenMock(linkToken);
        _chainlinkRouter = Router(chainlinkRouter);
    }

    function _generateId() internal returns (uint256 id) {
        id = _idCounter;

        unchecked {
            _idCounter++;
        }
    }

    function _buildCCIPMessage(
        address _receiver,
        bytes memory _data,
        address _feeTokenAddress
    ) internal pure returns (Client.EVM2AnyMessage memory) {
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver),
                data: _data,
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: ClientLib._argsToBytes(
                    ClientLib.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
                ),
                feeToken: _feeTokenAddress
            });
    }

    function ccipReceive(
        Client.Any2EVMMessage calldata message
    ) external virtual override {
        _ccipReceive(message);
    }

    /// handle a received message
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        uint256 s_lastReceivedMessageId = uint256(message.messageId); // fetch the messageId
        Trade memory s_lastReceivedText = abi.decode(message.data, (Trade)); // abi-decoding of the sent text

        emit MessageReceived(
            message.messageId,
            message.sourceChainSelector, // fetch the source chain identifier (aka selector)
            abi.decode(message.sender, (address)), // abi-decoding of the sender address,
            abi.decode(message.data, (string))
        );
    }

    function setSelector(uint256 chain, uint64 selector) external {
        selectors[chain] = selector;
    }

    function setEntrypoint(uint256 destChain, address entrypoint) external {
        entrypoints[destChain] = entrypoint;
    }

    function initiate(
        address[] calldata inputs,
        uint256[] calldata inputAmounts,
        address outputAddress,
        uint256 outputAmount,
        uint64 destChain,
        uint256 duration
    ) external {
        uint256 srcChain = block.chainid;
        uint256 tradeId = _generateId();

        Trade memory trade = Trade({
            tradeId: tradeId,
            destChain: destChain,
            inputs: inputs,
            inputAmounts: inputAmounts,
            outputAddress: outputAddress,
            outputAmount: outputAmount,
            duration: duration,
            ccipId: 0
        });

        Client.EVM2AnyMessage memory message = _buildCCIPMessage(
            entrypoints[destChain],
            abi.encode(trade),
            address(0)
        );

        uint256 fees = _chainlinkRouter.getFee(selectors[destChain], message);

        if (fees > address(this).balance)
            revert NotEnoughBalance(address(this).balance, fees);

        // Send the CCIP message through the router and store the returned CCIP message ID
        bytes32 messageId = _chainlinkRouter.ccipSend{value: fees}(
            selectors[destChain],
            message
        );

        trade.ccipId = uint256(messageId);
    }
}
