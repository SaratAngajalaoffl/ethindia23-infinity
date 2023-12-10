# Infinity Protocol

![Infinity Logo](assets/logo.png)

## _Infinity_ enables seamless crosschain swaps that guarantee the most optimal trade ratio to the end user by enabling a dutch-auction system to fullfill orders.

## Problem statement

Infinity enables users to find most optimal swaps across chains whilst providing a simple UX to the end user.

A user can define his intent to swap as follows, "I want 10 LINK tokens on Scroll, use a maximum of 10 USDT, 10 USDC and 0.05 WETH from BASE and fulfill it within 10 seconds"

This data get serialized and the input tokens are locked in a contract to initiate a dutch-aution on scroll where solvers lock tokens to provide the best valued trade. Once the user-specified time period ends, the input tokens get released to the auction winner and output tokens get released to the user.

Creating a competition among solvers to provide the best possible price ensures that the user is getting the most optimal trade.

## Implmentation Details

Following are the protocols being used

-   Scroll, Celo, Mantle, Linea, Base and Arbitrum - Chains to deploy on
-   Chainlink CCIP - to pass messages across chains
-   Safe AA SDK - to enable batching of transactions and paymaster functionalities
-   Metamask - get realtime gas price data

User sends a transaction calling the below function on the `InfinityEntrypoint` contract on the source chain

```
initiate(
	address[] inputs,
	address inputValues[],
	address outputs[],
	address outputValues[],
	uint256 destChain,
	uint256 duration
)
```

The contract locks all the input tokens within itself and uses CCIP to register the trade on `destChain`

Solvers call the below function on the `InfinityEntrypoint` contract on the destination chain.

```
propose(
	uint256 tradeId,
	address[] inputs,
	address inputValues[]
)
```

The contract gets the market price conversion (Mocked for now) to determine the new solution is better value than the previous provided / initial solution

Once the user-set duration elapses, the winner of the auction calls the below function to claim his reward and complete the trade, releasing funds to the user.

```
claim(
	uint256 tradeId
)
```

The contract checks the defined duration has elapsed and releases funds on the destination chain to the user. It also makes another crosschain request to initiate release of funds on the source chain to the solver

# Deployment Addresses

## Sepolia

-   InfinityEntrypoint: [0x09246EeB9D56bDc7Cd66f1928764B05B07F4C47E](https://sepolia.etherscan.io/address/0x09246EeB9D56bDc7Cd66f1928764B05B07F4C47E)

## Base

-   InfinityEntrypoint: [0x28bBB720d15D63543861b5FC94bF93Bb4AdC680A](https://goerli.basescan.org/address/0x28bBB720d15D63543861b5FC94bF93Bb4AdC680A)

## Mantle

-   CustomChainlinkRouter: [0xF6aC3c345296DCd381659Dff0bD04b53Ec213Bee](https://explorer.testnet.mantle.xyz/address/0xF6aC3c345296DCd381659Dff0bD04b53Ec213Bee)
-   InfinityEntrypoint: [0xc901A057a9037c3768090CEF25Dbbc9f06A23d32](https://explorer.testnet.mantle.xyz/address/0xc901A057a9037c3768090CEF25Dbbc9f06A23d32)

## Scroll

-   CustomChainlinkRouter:
-   InfinityEntrypoint:

## Arbitrum

-   CustomChainlinkRouter:
-   InfinityEntrypoint:

## Celo

-   CustomChainlinkRouter: [0xF6aC3c345296DCd381659Dff0bD04b53Ec213Bee](https://explorer.celo.org/alfajores/address/0xF6aC3c345296DCd381659Dff0bD04b53Ec213Bee)
-   InfinityEntrypoint: [0xc901A057a9037c3768090CEF25Dbbc9f06A23d32](https://explorer.celo.org/alfajores/address/0xc901A057a9037c3768090CEF25Dbbc9f06A23d32)

## Chainlink

-   Live CCIP Message ID: [0x259440c5b04d8891a4dc5645ad89691c5c8aa5bca9860c7eb06d9a71f4abe538](https://ccip.chain.link/msg/0x259440c5b04d8891a4dc5645ad89691c5c8aa5bca9860c7eb06d9a71f4abe538)

### Transaction Trace

-   User Initiates Trade - [here](https://sepolia.etherscan.io/tx/0x542ccb31a14f5b731316a957478e307705d6020869ef03b497de238596b6f0d0)
-   Trade propagates through CCIP - [here](https://ccip.chain.link/msg/0x259440c5b04d8891a4dc5645ad89691c5c8aa5bca9860c7eb06d9a71f4abe538)
-   Corresponding transaction on base-goerli chain - [here](https://goerli.basescan.org/tx/0x37245a3a0e7c9698c7887b3e9ee0cd116b6178022655fa1483c522c8033a7e58)
-   Solver proposes a solution - [here](https://goerli.basescan.org/tx/0xc088080b792ef85396ecabcc893d7b2cb6e6a8021212425e45710bd374d13e6e)

# Team

# Sarat Angajala - [SaratAngajalaoffl](https://github.com/SaratAngajalaoffl)
