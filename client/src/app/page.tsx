'use client';

import { useCallback, useEffect, useState } from 'react';
import BalancePanel from '../components/BalancePanel';

import { SafeAuthPack, SafeAuthConfig, SafeAuthInitOptions } from '@safe-global/auth-kit';
import { getSafeAuthPack } from '@/utils/safe.utils';

function App() {
	const [authPack, setAuthPack] = useState<SafeAuthPack | null>();
	const [selectedChain, setSelectedChain] = useState<'sepolia' | 'base-goerli'>('sepolia');

	const initialiseSafe = useCallback(async () => {
		const authPack = await getSafeAuthPack(selectedChain);
		setAuthPack(authPack);
	}, [selectedChain]);

	const handleConnect = useCallback(() => {
		const authKitSignData = authPack?.signIn();

		console.log({ authKitSignData });
	}, [authPack]);

	useEffect(() => {
		initialiseSafe();
	}, [initialiseSafe]);

	return (
		<div className='main'>
			<div className='left_panel grid place-items-center'>
				<div className='flex flex-col gap-8'>
					<select value={selectedChain} onChange={(e) => setSelectedChain(e.target.value as any)}>
						<option value={'sepolia'}>Sepolia</option>
						<option value={'base-goerli'}>Base Goerli</option>
					</select>
					<button onClick={handleConnect}>Connect Safe</button>
				</div>
			</div>
			<div className='right_panel'>
				<BalancePanel />
			</div>
		</div>
	);
}

export default App;
