import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployInfinityEntrypoint,
  deployRouter,
  deployToken,
} from "../../scripts/deployments";

describe("InfinityEntrypoint", () => {
  const setupFixture = async () => {
    const [owner, otherAccount] = await ethers.getSigners();

    const aToken = await deployToken("A", "A");
    const bToken = await deployToken("B", "B");
    const cToken = await deployToken("C", "C");
    const xToken = await deployToken("X", "X");

    const linkToken = await deployToken("Link", "LNK");

    const router = await deployRouter();

    const entrypoint = await deployInfinityEntrypoint(
      await linkToken.token.getAddress(),
      await router.router.getAddress()
    );

    return {
      owner,
      otherAccount,
      entrypoint,
      router,
      linkToken,
      aToken,
      bToken,
      cToken,
      xToken,
    };
  };

  describe("when entrypoint initiate is called", () => {
    it("Event emitted", async () => {
      const { owner, entrypoint, aToken, xToken } = await loadFixture(
        setupFixture
      );

      await expect(
        entrypoint.entrypoint.initiate(
          [await aToken.token.getAddress()],
          [ethers.parseEther("1")],
          await xToken.token.getAddress(),
          ethers.parseEther("1"),
          1,
          100
        )
      ).to.emit(entrypoint.entrypoint, "OutgoingTradeInitiated");
    });
  });
});
