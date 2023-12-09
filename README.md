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

## Scroll

-   MockPriceProvider:
-   InfinityEntrypoint:

## Base

-   MockPriceProvider:
-   InfinityEntrypoint:

## Arbitrum

-   MockPriceProvider:
-   InfinityEntrypoint:

## Linea

-   MockPriceProvider:
-   InfinityEntrypoint:

## Celo

-   MockPriceProvider:
-   InfinityEntrypoint:

## Mantle

-   MockPriceProvider:
-   InfinityEntrypoint:

## Chainlink

-   Live CCIP Message ID: 0x24c492bb4f9e22e81575e39b48c3f9b9866040f0c61806d780550e305e0fc999

# Team

# Sarat Angajala - [SaratAngajalaoffl](https://github.com/SaratAngajalaoffl)
