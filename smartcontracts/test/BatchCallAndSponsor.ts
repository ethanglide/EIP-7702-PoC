import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { BatchCallAndSponsor } from "../typechain-types";

describe("BatchCallAndSponsor", function () {
  /* Deploys the BatchCallAndSponsor contract and TCOIN contract. */
  async function deployContractsFixture() {
    const [sponsor, user0, user1] = await ethers.getSigners();

    // deploy the contract
    const BatchCallAndSponsorCf = await ethers.getContractFactory(
      "BatchCallAndSponsor"
    );

    const batchCallAndSponsor = await BatchCallAndSponsorCf.deploy();
    await batchCallAndSponsor.waitForDeployment();

    const TCOINCf = await ethers.getContractFactory("TCOIN");
    const tcoin = await TCOINCf.deploy(user0.address);
    await tcoin.waitForDeployment();

    // user0 mint 100 tcoin
    await tcoin.connect(user0).mint(user0.address, ethers.parseEther("100"));

    // give sponsor 100 eth, user1 10 eth, user2 0 eth
    await hre.network.provider.send("hardhat_setBalance", [
      sponsor.address,
      "0x56BC75E2D63100000", // 100 eth
    ]);
    await hre.network.provider.send("hardhat_setBalance", [
      user0.address,
      "0x8AC7230489E80000", // 10 eth
    ]);
    await hre.network.provider.send("hardhat_setBalance", [
      user1.address,
      "0x0", // 0 eth
    ]);

    return {
      batchCallAndSponsor,
      tcoin,
      sponsor,
      user0,
      user1,
    };
  }

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { batchCallAndSponsor, tcoin, sponsor, user0, user1 } =
        await loadFixture(deployContractsFixture);

      // check that the contracts are deployed
      expect(await batchCallAndSponsor.getAddress()).to.not.be.undefined;
      expect(await tcoin.getAddress()).to.not.be.undefined;

      // accounts should have right balances
      const sponsorBalance = await hre.ethers.provider.getBalance(
        sponsor.address
      );
      expect(sponsorBalance).to.equal(ethers.parseEther("100"));
      const user0Balance = await hre.ethers.provider.getBalance(user0.address);
      expect(user0Balance).to.equal(ethers.parseEther("10"));
      const user1Balance = await hre.ethers.provider.getBalance(user1.address);
      expect(user1Balance).to.equal(ethers.parseEther("0"));

      // accounts should have right tcoin balances
      const sponsorTcoinBalance = await tcoin.balanceOf(sponsor.address);
      expect(sponsorTcoinBalance).to.equal(0);
      const user0TcoinBalance = await tcoin.balanceOf(user0.address);
      expect(user0TcoinBalance).to.equal(ethers.parseEther("100"));
      const user1TcoinBalance = await tcoin.balanceOf(user1.address);
      expect(user1TcoinBalance).to.equal(0);
    });
  });

  describe("Calls", function () {
    it("Should send eth and tcoin from user0 to user1 in single transaction", async function () {
      const { batchCallAndSponsor, tcoin, user0, user1 } = await loadFixture(
        deployContractsFixture
      );

      const calls = [
        { to: user1.address, value: ethers.parseEther("1"), data: "0x" },
        {
          to: tcoin.getAddress(),
          value: 0,
          data: tcoin.interface.encodeFunctionData("transfer", [
            user1.address,
            ethers.parseEther("10"),
          ]),
        },
      ];

      // const domain = {
      //   name: "BatchCallAndSponsor",
      //   version: "1",
      //   chainId: (await ethers.provider.getNetwork()).chainId,
      //   verifyingContract: await batchCallAndSponsor.getAddress(),
      // };

      // const types = {
      //   Call: [
      //     { name: "to", type: "address" },
      //     { name: "value", type: "uint256" },
      //     { name: "data", type: "bytes" },
      //   ],
      // };

      // const signature = await user0.signTypedData(domain, types, { calls });
      // await batchCallAndSponsor
      //   .connect(user0)
      //   ["execute((address,uint256,bytes)[],bytes)"](calls, signature);

      const attachedBatchCallAndSponsor = batchCallAndSponsor.attach(
        user0.address
      ) as BatchCallAndSponsor;
      const tx = await attachedBatchCallAndSponsor
        .connect(user0)
        ["execute((address,uint256,bytes)[])"](calls);

      // // check for BatchExecuted and CallExecuted events
      // await expect(tx).to.emit(batchCallAndSponsor, "BatchExecuted");
      // // .withArgs(user0.address, calls);
      // await expect(tx).to.emit(batchCallAndSponsor, "CallExecuted");
      // // .withArgs(user0.address, user1.address, ethers.parseEther("1"), "0x");

      // const recipt = await tx.wait();
      // // check that the transaction was successful
      // expect(recipt).to.not.be.null;
      // if (!recipt) return;
      // expect(recipt.status).to.equal(1);

      // use changeEtherBalance and changeTokenBalance to check the balances

      // user0 should have 9 eth and 90 tcoin
      // const user0Balance = await hre.ethers.provider.getBalance(user0.address);
      // expect(user0Balance).to.equal(
      //   ethers.parseEther("10") - recipt.gasPrice * recipt.gasUsed
      // );
      // const user0TcoinBalance = await tcoin.balanceOf(user0.address);
      // expect(user0TcoinBalance).to.equal(ethers.parseEther("90"));

      // // user1 should have 1 eth and 10 tcoin
      // const user1Balance = await hre.ethers.provider.getBalance(user1.address);
      // expect(user1Balance).to.equal(ethers.parseEther("1"));
      // const user1TcoinBalance = await tcoin.balanceOf(user1.address);
      // expect(user1TcoinBalance).to.equal(ethers.parseEther("10"));
    });
  });
});
