import { ethers } from "hardhat";

export const deployInfinityEntrypoint = async (
  linkToken: string,
  routerMock: string
) => {
  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await ethers.getSigners();

  const InfinityEntrypoint = await ethers.getContractFactory(
    "InfinityEntrypoint"
  );
  const entrypoint = await InfinityEntrypoint.deploy(linkToken, routerMock);

  await entrypoint.waitForDeployment();

  console.log(
    `pnpm hardhat verify --network sepolia ${await entrypoint.getAddress()} "${linkToken}" "${routerMock}"`
  );

  return { entrypoint, owner, otherAccount };
};

export const deployToken = async (name: string, symbol: string) => {
  const [owner, otherAccount] = await ethers.getSigners();

  const TokenMock = await ethers.getContractFactory("TokenMock");
  const token = await TokenMock.deploy(name, symbol);

  await token.waitForDeployment();

  console.log(
    `pnpm hardhat verify --network sepolia ${await token.getAddress()} "${name}" "${symbol}"`
  );

  return { token, owner, otherAccount };
};

export const deployRouter = async () => {
  const [owner, otherAccount] = await ethers.getSigners();

  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy();

  await router.waitForDeployment();

  console.log(
    `pnpm hardhat verify --network sepolia ${await router.getAddress()}`
  );

  return { router, owner, otherAccount };
};

export const deployMockTokens = async () => {
  const deployment1 = await deployToken("A USD", "USDA");
  const deployment2 = await deployToken("B USD", "USDB");
  const deployment3 = await deployToken("C USD", "USDC");
  const deployment4 = await deployToken("X USD", "USDX");

  return { deployment1, deployment2, deployment3, deployment4 };
};

export const main = async () => {
  await deployMockTokens();
};

// main().catch((err) => console.error(err));
