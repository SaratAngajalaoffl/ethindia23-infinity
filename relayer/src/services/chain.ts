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

			const chainData = (conf as any)[destChain as any];

			const provider = new ethers.providers.JsonRpcProvider(chainData.rpc);
			let wallet = ethers.Wallet.fromMnemonic('bar jungle bean try butter donor inch bike farm enemy scatter seat');

			wallet = wallet.connect(provider);
			const entrypoint = new ethers.Contract(chainData.entrypointAddress, entrypointAbi, this.signer);

			const args = {
				messageId: ethers.utils.hexZeroPad(id.toHexString(), 32),
				sourceChainSelector: this.chainId,
				sender: ethers.constants.AddressZero,
				data: data,
				destTokenAmounts: [],
			};

			console.log('--args', entrypoint.interface.encodeFunctionData('ccipReceive', [args]));

			const tx = await entrypoint.ccipReceive(args);

			await tx.wait();

			console.log(`Relayed message from ${this.data.name} to ${chainData.name}`);
		});

		console.log(`Listening to chainlink CCIPRequest events on ${this.data.name}`);
	};
}
