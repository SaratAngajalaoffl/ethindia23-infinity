import { ethers } from 'hardhat';

export const deployToken = async (name: string, symbol: string) => {
	const [owner, otherAccount] = await ethers.getSigners();

	const TokenMock = await ethers.getContractFactory('TokenMock');
	const token = await TokenMock.deploy(name, symbol);

	return { token, owner, otherAccount };
};
