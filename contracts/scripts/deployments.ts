import { ethers } from "hardhat";
import contracts from "../config/contracts.json";

export const deployInfinityEntrypoint = async () => {
  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await ethers.getSigners();

  const networkName = (await owner.provider.getNetwork()).name;

  console.log("--network name", networkName);

  const networkData = (contracts as any)[networkName] as any;

  const routerMock = networkData.chainlinkRouter;

  const InfinityEntrypoint = await ethers.getContractFactory(
    "InfinityEntrypoint"
  );
  const entrypoint = await InfinityEntrypoint.deploy(routerMock, {
    gasPrice: ethers.parseUnits("10", "gwei"),
  });

  await entrypoint.waitForDeployment();

  console.log(
    `pnpm hardhat verify --network ${networkName} ${await entrypoint.getAddress()} "${routerMock}"`
  );

  return { entrypoint, owner, otherAccount };
};

export const deployToken = async (name: string, symbol: string) => {
  const [owner, otherAccount] = await ethers.getSigners();

  const TokenMock = await ethers.getContractFactory("TokenMock");
  const token = await TokenMock.deploy(name, symbol, {
    gasPrice: ethers.parseUnits("1", "gwei"),
  });

  await token.waitForDeployment();

  console.log(
    `pnpm hardhat verify --network ${
      (await owner.provider.getNetwork()).name
    } ${await token.getAddress()} "${name}" "${symbol}"`
  );

  return { token, owner, otherAccount };
};

export const deployRouter = async () => {
  const [owner, otherAccount] = await ethers.getSigners();

  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy({
    gasPrice: ethers.parseUnits("1", "gwei"),
  });

  await router.waitForDeployment();

  console.log(
    `pnpm hardhat verify --network ${
      (await owner.provider.getNetwork()).name
    } ${await router.getAddress()}`
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
  await deployInfinityEntrypoint();
  // await deployMockTokens();
  // await deployRouter();
};

main().catch((err) => console.error(err));
