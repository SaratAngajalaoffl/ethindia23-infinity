'use client';

import { useCallback, useEffect, useState } from 'react';
import BalancePanel from '../components/BalancePanel';

import { SafeAuthPack, SafeAuthConfig, SafeAuthInitOptions } from '@safe-global/auth-kit';

const safeAuthInitOptions: SafeAuthInitOptions = {
	enableLogging: true,
	showWidgetButton: false,
	chainConfig: {
		chainId: 'sepolia',
		rpcTarget: `https://sepolia.infura.io/v3/8355f475b03443bf996b249da90176f6`,
	},
};

function App() {
	const [authPack, setAuthPack] = useState<SafeAuthPack | null>();

	const initialiseSafe = useCallback(async () => {
		const safeAuthPack = new SafeAuthPack();
		await safeAuthPack.init(safeAuthInitOptions);

		setAuthPack(safeAuthPack);
	}, []);

	const handleConnect = useCallback(() => {
		authPack?.signIn();
	}, [authPack]);

	useEffect(() => {
		initialiseSafe();
	}, [initialiseSafe]);

	return (
		<div className='main'>
			<div className='left_panel'>
				<button onClick={handleConnect}>Connect Safe</button>
			</div>
			<div className='right_panel'>
				<BalancePanel />
			</div>
		</div>
	);
}

export default App;
