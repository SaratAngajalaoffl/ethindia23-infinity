import React from 'react';
import NetworkSection from './NetworkSection';

const networks = [
	{
		name: 'Sepolia',
		rpc: 'https://sepolia.infura.io/v3/8355f475b03443bf996b249da90176f6',
		tokens: {
			aToken: '0xD5723D9871f16353DcD53FcF9c96643B601801a2',
			bToken: '0xC9C0193fC31aA9698AbadB844005539C33454698',
			cToken: '0x9BA6409B87Bd7b72C02fa7ddd287A1035e2B2552',
			xToken: '0x39636F92BAcF2849024Ab3690ced89836EBf11Ce',
		},
	},
	{
		name: 'Base Goerli',
		rpc: 'https://goerli.base.org',
		tokens: {
			aToken: '0x08e664C62E2ff8B390051eF24B08167204B6e62C',
			bToken: '0xc901A057a9037c3768090CEF25Dbbc9f06A23d32',
			cToken: '0x07EDF0be4187C87D3c873fBd1142766e697d2aC5',
			xToken: '0xD49d5d18C160711Ac725112c62457338C37c30F4',
		},
	},
];

export default function BalancePanel() {
	return (
		<div className='balance_panel'>
			<h2 className='balances_header'>Balances</h2>
			{networks.map((item) => (
				<NetworkSection network={item} key={item.name} />
			))}
		</div>
	);
}
