// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BatchCallAndSponsorModule = buildModule(
  "BatchCallAndSponsorModule",
  (m) => {
    const BatchCallAndSponsor = m.contract("BatchCallAndSponsor", []);

    return { BatchCallAndSponsor };
  }
);

export default BatchCallAndSponsorModule;
