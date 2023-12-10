// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../mocks/TokenMock.sol";
import "../mocks/RouterMock.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

contract InfinityEntrypoint is CCIPReceiver {
    struct Trade {
        address sender;
        uint256 tradeId;
        uint64 destChain;
        address[] inputs;
        uint256[] inputAmounts;
        address outputAddress;
        uint256 outputAmount;
        uint256 duration;
        uint256 ccipId;
    }

    struct Bid {
        uint256[] inputAmounts;
        address solver;
    }

    struct Auction {
        uint256 tradeId;
        address[] inputs;
        uint256[] inputAmounts;
        address outputAddress;
        uint256 outputAmount;
        uint256 srcChain;
        uint256 deadline;
        address recieverAddress;
        Bid activeBid;
    }

    mapping(uint256 => Trade) trades;
    mapping(uint256 => Trade) messages;
    mapping(uint256 => Auction) auctions;

    mapping(uint256 => address) entrypoints;
    mapping(uint256 => uint64) selectors;
    mapping(uint64 => uint256) chains;

    uint256 private _idCounter = 1;

    Router private _chainlinkRouter;

    error NotEnoughBalance(uint256 balance, uint256 fees);
    error MessageMismatch(uint256 message1, uint256 message2);
    error SizeMismatch(uint256 size1, uint256 size2);
    error AuctionExpired(uint256 deadline, uint256 current);
    error ValueHigher(address token, uint256 prev, uint256 curr);

    event AuctionInitiated(
        address[] inputs,
        uint256[] inputAmounts,
        address outputAddress,
        uint256 outputAmount,
        uint256 srcChain,
        uint256 deadline
    );

    event SolutionProposed(uint256 tradeId, uint256[] inputAmounts);

    event TradeCompleted(
        uint256 tradeId,
        uint256[] initialInputAmounts,
        uint256[] finalInputAmounts
    );

    constructor(address chainlinkRouter) CCIPReceiver(chainlinkRouter) {
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
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 980_000})
                ),
                feeToken: _feeTokenAddress
            });
    }

    /// handle a received message
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        if (message.data[0] == 0) {
            (bool flag, Trade memory trade) = abi.decode(
                message.data,
                (bool, Trade)
            ); // abi-decoding of the sent text

            uint256 deadline = block.timestamp + trade.duration;
            uint256 srcChain = chains[message.sourceChainSelector];

            Auction memory auction = Auction({
                tradeId: trade.tradeId,
                inputs: trade.inputs,
                inputAmounts: trade.inputAmounts,
                outputAddress: trade.outputAddress,
                outputAmount: trade.outputAmount,
                srcChain: srcChain,
                deadline: deadline,
                recieverAddress: trade.sender,
                activeBid: Bid({
                    solver: address(0),
                    inputAmounts: trade.inputAmounts
                })
            });

            auctions[trade.tradeId] = auction;

            emit AuctionInitiated(
                trade.inputs,
                trade.inputAmounts,
                trade.outputAddress,
                trade.outputAmount,
                srcChain,
                deadline
            );
        } else {
            (bool flag, Auction memory auction) = abi.decode(
                message.data,
                (bool, Auction)
            ); // abi-decoding of the sent text

            Trade memory trade = trades[auction.tradeId];

            for (uint256 i = 0; i < trade.inputs.length; i++) {
                TokenMock token = TokenMock(trade.inputs[i]);

                token.transfer(
                    auction.activeBid.solver,
                    auction.activeBid.inputAmounts[i]
                );

                token.transfer(
                    trade.sender,
                    trade.inputAmounts[i] - auction.activeBid.inputAmounts[i]
                );
            }

            emit TradeCompleted(
                trade.tradeId,
                trade.inputAmounts,
                auction.activeBid.inputAmounts
            );
        }
    }

    function setSelectors(
        uint256[] calldata chain,
        uint64[] calldata selector
    ) external {
        for (uint256 i = 0; i < chain.length; i++) {
            selectors[chain[i]] = selector[i];
            chains[selector[i]] = chain[i];
        }
    }

    function setEntrypoints(
        uint256[] calldata destChain,
        address[] calldata entrypoint
    ) external {
        for (uint256 i = 0; i < destChain.length; i++) {
            entrypoints[destChain[i]] = entrypoint[i];
        }
    }

    function ccipReceive(
        Client.Any2EVMMessage calldata message
    ) external virtual override {
        _ccipReceive(message);
    }

    function initiate(
        address[] calldata inputs,
        uint256[] calldata inputAmounts,
        address outputAddress,
        uint256 outputAmount,
        uint64 destChain,
        uint256 duration
    ) external {
        uint256 tradeId = _generateId();

        for (uint256 i = 0; i < inputs.length; i++) {
            TokenMock(inputs[i]).transferFrom(
                msg.sender,
                address(this),
                inputAmounts[i]
            );
        }

        Trade memory trade = Trade({
            sender: msg.sender,
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
            abi.encode(false, trade),
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

        trades[tradeId] = trade;
    }

    function propose(uint256 tradeId, uint256[] calldata inputValues) external {
        address solver = msg.sender;
        Auction memory auction = auctions[tradeId];

        if (auction.inputs.length != inputValues.length) {
            revert SizeMismatch(auction.inputs.length, inputValues.length);
        }

        for (uint256 i = 0; i < inputValues.length; i++) {
            if (inputValues[i] > auction.activeBid.inputAmounts[i]) {
                revert ValueHigher(
                    auction.inputs[i],
                    inputValues[i],
                    auction.activeBid.inputAmounts[i]
                );
            }
        }

        TokenMock(auction.outputAddress).transferFrom(
            solver,
            address(this),
            auction.outputAmount
        );

        if (auction.activeBid.solver != address(0)) {
            TokenMock(auction.outputAddress).transfer(
                auction.activeBid.solver,
                auction.outputAmount
            );
        }

        for (uint256 i = 0; i < inputValues.length; i++) {
            auction.activeBid.inputAmounts[i] = inputValues[i];
        }

        auction.activeBid.solver = solver;

        emit SolutionProposed(auction.tradeId, inputValues);
    }

    function claim(uint256 tradeId) external {
        Auction memory auction = auctions[tradeId];
        uint256 destChain = auction.srcChain;

        Client.EVM2AnyMessage memory message = _buildCCIPMessage(
            entrypoints[destChain],
            abi.encode(true, auction),
            address(0)
        );

        uint256 fees = _chainlinkRouter.getFee(selectors[destChain], message);

        if (fees > address(this).balance)
            revert NotEnoughBalance(address(this).balance, fees);

        // Send the CCIP message through the router and store the returned CCIP message ID
        _chainlinkRouter.ccipSend{value: fees}(selectors[destChain], message);

        TokenMock(auction.outputAddress).transfer(
            auction.recieverAddress,
            auction.outputAmount
        );
    }

    receive() external payable {}

    fallback() external payable {}
}
