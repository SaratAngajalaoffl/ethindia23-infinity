import { ethers } from 'ethers';

import entrypoint from '../../contracts/artifacts/contracts/core/InfinityEntrypoint.sol/InfinityEntrypoint.json';
import tokenAbi from '../../contracts/artifacts/contracts/mocks/TokenMock.sol/TokenMock.json';

const MNEMONIC = 'bar jungle bean try butter donor inch bike farm enemy scatter seat';

const gasPrice = { gasPrice: ethers.utils.parseUnits('1', 'gwei') };

const network1 = {
	rpc: 'https://sepolia.infura.io/v3/8355f475b03443bf996b249da90176f6',
	mnemonic: MNEMONIC,
	linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
	router: '0x9aC0Cc4e41Fe6dd4eDCb1e8819F942fD419C9F98',
	destChain: '84531',
	destSelector: '84531',
	aToken: '0x08e664C62E2ff8B390051eF24B08167204B6e62C',
	xToken: '0xD49d5d18C160711Ac725112c62457338C37c30F4',
};

const network2 = {
	rpc: 'https://goerli.base.org',
	mnemonic: MNEMONIC,
	linkToken: '0xd886e2286fd1073df82462ea1822119600af80b6',
	router: '0x1202612210b96D2287dF7Cd6c10D0D5f582bCcB4',
	destChain: '534351',
	destSelector: '534351',
	aToken: '0x08e664C62E2ff8B390051eF24B08167204B6e62C',
	xToken: '0xD49d5d18C160711Ac725112c62457338C37c30F4',
};

// SEPOLIA <-> BASE through actual chainlink

// const network1 = {
// 	rpc: 'https://sepolia.infura.io/v3/8355f475b03443bf996b249da90176f6',
// 	mnemonic: MNEMONIC,
// 	linkToken: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
// 	router: '0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59',
// 	destChain: '84531',
// 	destSelector: '5790810961207155433',
// 	aToken: '0xD5723D9871f16353DcD53FcF9c96643B601801a2',
// 	xToken: '0x39636F92BAcF2849024Ab3690ced89836EBf11Ce',
// };

// const network2 = {
// 	rpc: 'https://goerli.base.org',
// 	mnemonic: MNEMONIC,
// 	linkToken: '0xd886e2286fd1073df82462ea1822119600af80b6',
// 	router: '0x80af2f44ed0469018922c9f483dc5a909862fdc2',
// 	destChain: '11155111',
// 	destSelector: '16015286601757825753',
// 	aToken: '0x08e664C62E2ff8B390051eF24B08167204B6e62C',
// 	xToken: '0xD49d5d18C160711Ac725112c62457338C37c30F4',
// };

const main = async () => {
	const scrollSigner = ethers.Wallet.fromMnemonic(network1.mnemonic).connect(new ethers.providers.JsonRpcProvider(network1.rpc));
	const baseSigner = ethers.Wallet.fromMnemonic(network2.mnemonic).connect(new ethers.providers.JsonRpcProvider(network2.rpc));

	const scrollEntrypointFactory = new ethers.ContractFactory(entrypoint.abi, entrypoint.bytecode, scrollSigner);
	const scrollEntrypointDeployment = await scrollEntrypointFactory.deploy(network1.linkToken, network1.router, gasPrice);

	await scrollEntrypointDeployment.deployed();

	console.log('--scroll deployment', scrollEntrypointDeployment.address);

	const baseEntrypointFactory = new ethers.ContractFactory(entrypoint.abi, entrypoint.bytecode, baseSigner);
	const baseEntrypointDeployment = await baseEntrypointFactory.deploy(network2.linkToken, network2.router, gasPrice);

	await baseEntrypointDeployment.deployed();

	console.log('--base deployment', baseEntrypointDeployment.address);

	let tx;

	tx = await scrollEntrypointDeployment.functions.setSelectors([network1.destChain], [network1.destSelector], gasPrice);
	await tx.wait();

	console.log('--trade initiated');
	tx = await scrollEntrypointDeployment.functions.setEntrypoints([network1.destChain], [baseEntrypointDeployment.address], gasPrice);
	await tx.wait();
	console.log('--trade initiated');

	// tx = await baseEntrypointDeployment.functions.setSelectors([network2.destChain], [network2.destSelector], gasPrice);
	// await tx.wait();
	// console.log('--trade initiated');

	// tx = await baseEntrypointDeployment.functions.setEntrypoints([network2.destChain], [scrollEntrypointDeployment.address], gasPrice);
	// await tx.wait();

	const scrollAToken = new ethers.Contract(network1.aToken, tokenAbi.abi, scrollSigner);
	tx = await scrollAToken.functions.approve(scrollEntrypointDeployment.address, ethers.constants.MaxUint256, gasPrice);
	await tx.wait();

	// const baseAToken = new ethers.Contract(network2.aToken, tokenAbi.abi, scrollSigner);
	// tx = await baseAToken.functions.approve(baseEntrypointDeployment.address, ethers.constants.MaxUint256, gasPrice);
	// await tx.wait();
	// console.log('--trade initiated');

	// const scrollXToken = new ethers.Contract(network1.xToken, tokenAbi.abi, scrollSigner);
	// tx = await scrollXToken.functions.approve(scrollEntrypointDeployment.address, ethers.constants.MaxUint256, gasPrice);
	// await tx.wait();
	// console.log('--trade initiated');

	// const baseXToken = new ethers.Contract(network2.xToken, tokenAbi.abi, scrollSigner);
	// tx = await baseXToken.functions.approve(scrollEntrypointDeployment.address, ethers.constants.MaxUint256, gasPrice);
	// await tx.wait();
	console.log('--token approvals done');

	// tx = await scrollSigner.sendTransaction({ to: scrollEntrypointDeployment.address, value: ethers.utils.parseEther('0.001'), ...gasPrice });

	// await tx.wait();
	// console.log('--trade initiated');

	const args = [[network1.aToken], [ethers.utils.parseEther('1')], network2.xToken, ethers.utils.parseEther('1'), network1.destChain, 300];

	tx = await scrollEntrypointDeployment.functions.initiate(...args, gasPrice);
	await tx.wait();

	console.log('--trade initiated');
};

main();
