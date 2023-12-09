import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('TokenMock', () => {
	const deployTokenFixture = async (name: string, symbol: string) => {
		// Contracts are deployed using the first signer/account by default
		const [owner, otherAccount] = await ethers.getSigners();

		const TokenMock = await ethers.getContractFactory('TokenMock');
		const token = await TokenMock.deploy(name, symbol);

		return { token, owner, otherAccount };
	};

	describe('when token is deployed', () => {
		it('Initial Mint', async () => {
			const { owner, token } = await deployTokenFixture('A USD', 'USDA');

			const balance = await token.balanceOf(owner.address);

			expect(balance).to.eq(ethers.parseEther('1000000'));
		});
	});
});
