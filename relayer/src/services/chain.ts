import { ethers } from 'ethers';

import conf from '../config/config.json';
import routerAbi from '../config/abis/router.json';
import entrypointAbi from '../config/abis/entrypoint.json';

export class Chain {
	data: (typeof conf)['534351'];
	signer: ethers.Signer;
	chainId: keyof typeof conf;

	constructor(chainId: keyof typeof conf) {
		const chainData = conf[chainId];

		this.chainId = chainId;

		const provider = new ethers.providers.JsonRpcProvider(chainData.rpc);
		let wallet = ethers.Wallet.fromMnemonic('bar jungle bean try butter donor inch bike farm enemy scatter seat');

		this.signer = wallet.connect(provider);
		this.data = chainData;
	}

	init = async () => {
		const router = new ethers.Contract(this.data.routerAddress, routerAbi, this.signer);

		router.on('Request', async (id, destChainSelector, data) => {
			const destChain = ethers.utils.formatUnits(destChainSelector, 'wei');

			console.log('--destchain', destChain);

			const chainData = (conf as any)[destChain as any];

			const provider = new ethers.providers.JsonRpcProvider(chainData.rpc);
			let wallet = ethers.Wallet.fromMnemonic('bar jungle bean try butter donor inch bike farm enemy scatter seat');

			wallet = wallet.connect(provider);
			const entrypoint = new ethers.Contract(chainData.entrypointAddress, entrypointAbi, wallet);

			const args = {
				messageId: ethers.utils.id(id.toHexString()), // Use ethers.utils.id to generate a bytes32 hash
				sourceChainSelector: parseInt(this.chainId),
				sender: ethers.utils.hexlify(await this.signer.getAddress()), // Make sure to convert the sender address to bytes
				data: data, // Convert your payload to bytes
				destTokenAmounts: [],
			};

			console.log('--args', args);

			// console.log('--args', entrypoint.interface.encodeFunctionData('ccipReceive', [args]));

			const tx = await entrypoint.ccipReceive(args, { gasLimit: ethers.utils.parseUnits('980000', 'wei') });

			await tx.wait();

			console.log(`Relayed message from ${this.data.name} to ${chainData.name}`);
		});

		console.log(`Listening to chainlink CCIPRequest events on ${this.data.name}`);
	};
}
