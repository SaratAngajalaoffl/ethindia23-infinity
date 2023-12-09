import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

import abi from './tokenabi.json';

type Props = {
	network: any;
};

export default function NetworkSection({ network }: Props) {
	const [balances, setBalances] = useState<any[] | null>(null);

	const getBalances = useCallback(async () => {
		const data = await Promise.all(
			Object.keys(network.tokens).map(async (token) => {
				const tokenData = network.tokens[token];

				const provider = new ethers.JsonRpcProvider(network.rpc);

				const contract = new ethers.Contract(tokenData, abi, provider);

				const balance = await contract.balanceOf('0xCF5B123Ea094A776dD20fA07c3Ea433B54323CBd');
				const name = await contract.name();
				const symbol = await contract.symbol();

				return {
					name,
					symbol,
					balance: parseInt(ethers.formatEther(balance)),
				};
			})
		);

		setBalances(data);
	}, [network]);

	useEffect(() => {
		getBalances();
	}, [getBalances]);

	return (
		<div className='network_section'>
			<h3 className='header'>{network.name}</h3>
			{!balances ? (
				<ClipLoader />
			) : (
				balances?.map((balance) => (
					<div key={balance.name} className='row'>
						<p className='key'>{balance.name}</p>
						<p className='value'>
							{balance.balance} {balance.symbol}
						</p>
					</div>
				))
			)}
		</div>
	);
}
