import { SafeAuthPack } from '@safe-global/auth-kit';

const chains = {
	sepolia: {
		chainId: '0xaa36a7',
		rpc: 'https://sepolia.infura.io/v3/8355f475b03443bf996b249da90176f6',
		serviceUrl: 'https://safe-transaction-sepolia.safe.global/',
	},
	'base-goerli': {
		chainId: '0x14a33',
		rpc: 'https://goerli.base.org',
		serviceUrl: 'https://safe-transaction-base-testnet.safe.global/',
	},
	celo: {
		chainId: '0xaef3',
		rpc: 'https://celo-alfajores.infura.io/v3/8355f475b03443bf996b249da90176f6',
		serviceUrl: 'https://safe-transaction-celo.safe.global/',
	},
};

export const getSafeAuthPack = async (chain: keyof typeof chains): Promise<SafeAuthPack> => {
	const safeAuthInitOptions = {
		enableLogging: false,
		showWidgetButton: true,
		chainConfig: {
			chainId: chains[chain].chainId,
			rpcTarget: chains[chain].rpc,
		},
	};

	const safeAuthPack = new SafeAuthPack({ txServiceUrl: chains[chain].serviceUrl });
	await safeAuthPack.init(safeAuthInitOptions);

	return safeAuthPack;
};
