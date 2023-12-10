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

-   Scroll, Celo, Mantle, Sepolia, Base and Arbitrum - Chains to deploy on
-   Chainlink CCIP - to pass messages across chains
-   Safe AA SDK - to enable seamless authentication and batching of transactions

User sends a transaction calling the below function on the `InfinityEntrypoint` contract on the source chain

```
initiate(
	address[] inputs,
	address[] inputAmounts,
	address output,
	address outputAmount,
	uint256 destChain,
	uint256 duration
)
```

The contract locks all the input tokens within itself and uses CCIP to register the trade on `destChain`

Solvers call the below function on the `InfinityEntrypoint` contract on the destination chain.

```
propose(
	uint256 tradeId,
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

-   CustomChainlinkRouter: [0xA02A2706BD8C4be84A1fEB01741C10DDc975D857](https://sepolia.scrollscan.com/address/0xA02A2706BD8C4be84A1fEB01741C10DDc975D857#code)
-   InfinityEntrypoint: [0x84335e34dbdE7eD4d15851B96E350FE010Cb7147](https://sepolia.scrollscan.com/address/0x84335e34dbdE7eD4d15851B96E350FE010Cb7147#code)

## Arbitrum

-   CustomChainlinkRouter:[0xF6aC3c345296DCd381659Dff0bD04b53Ec213Bee](https://sepolia.arbiscan.io/address/0xF6aC3c345296DCd381659Dff0bD04b53Ec213Bee)
-   InfinityEntrypoint: [0x08e664C62E2ff8B390051eF24B08167204B6e62C](https://sepolia.arbiscan.io/address/0x08e664C62E2ff8B390051eF24B08167204B6e62C)

## Celo

-   CustomChainlinkRouter: [0xF6aC3c345296DCd381659Dff0bD04b53Ec213Bee](https://explorer.celo.org/alfajores/address/0xF6aC3c345296DCd381659Dff0bD04b53Ec213Bee)
-   InfinityEntrypoint: [0xc901A057a9037c3768090CEF25Dbbc9f06A23d32](https://explorer.celo.org/alfajores/address/0xc901A057a9037c3768090CEF25Dbbc9f06A23d32)

## Chainlink

-   Live CCIP Message ID: [0x259440c5b04d8891a4dc5645ad89691c5c8aa5bca9860c7eb06d9a71f4abe538](https://ccip.chain.link/msg/0x259440c5b04d8891a4dc5645ad89691c5c8aa5bca9860c7eb06d9a71f4abe538)

### Transaction Trace

-   User Initiates Trade - [here](https://sepolia.etherscan.io/tx/0x3d7f6cfc34a7e27ff82ca50584d0b0bd68320a3c29d0c32077fbbcee0b1831ce)
-   Trade propagates through CCIP - [here](https://ccip.chain.link/msg/0x98ddf98f1f2aba1b2600d3c58a733be5cc2c8164cead1f73c6a67bb601ec2f2c)
-   Corresponding transaction on base-goerli chain - [here](https://goerli.basescan.org/tx/0x013a7a356c42192b2232010373a25648c5a92b3875859015a3d3e31bef848aeb)
-   Solvers propose solutions - [here](https://goerli.basescan.org/tx/0x8dae66996051a1a9bbf4bb48a0aeef75e8f001977d79c5bed4651b616b0744fd) and [here](https://goerli.basescan.org/tx/0x52778be667a8c2b41afc0373ed5de816e7f400cd0a2771ec11b7c82a504368eb)
-   Winner of the auction claims the rewards - [here](https://goerli.basescan.org/tx/0x9d54005918a0567b7381434bca46ac5e9053dd88477aee01304f184a5a54a1ba)
-   A message again propagates through CCIP - [here](https://ccip.chain.link/msg/0x81a9c70bb4b21c7f9acbe26eabec5f45add875fc6d5bb04e0c3a9952fc2d97eb)
-   And initiates release of user funds on the destination chain - [here](https://ccip.chain.link/msg/0x81a9c70bb4b21c7f9acbe26eabec5f45add875fc6d5bb04e0c3a9952fc2d97eb)

# Team

# Sarat Angajala - [SaratAngajalaoffl](https://github.com/SaratAngajalaoffl)
