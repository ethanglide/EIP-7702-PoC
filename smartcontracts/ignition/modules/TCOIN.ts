// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const INITIAL_OWNER = "0xC692fe07cc8BCdc3FbCbf3e7798ca5Abf75BC721";

const TCOINModule = buildModule("TCOINModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", INITIAL_OWNER);

  const TCOIN = m.contract("TCOIN", [initialOwner]);

  return { TCOIN };
});

export default TCOINModule;
