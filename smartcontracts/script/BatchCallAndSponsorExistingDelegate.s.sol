// SPDX-License-Identifier: MIT
// https://www.quicknode.com/guides/ethereum-development/smart-contracts/eip-7702-smart-accounts#test-cases-walkthrough
// https://book.getfoundry.sh/cheatcodes/sign-delegation
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {BatchCallAndSponsor} from "../src/BatchCallAndSponsor.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract BatchCallAndSponsorScript is Script {
    // Can be any address - EOA does not need any ETH. All transactions paid for by sponsor.
    address payable constant EOA_ADDRESS =
        payable(0xb66Ff730b987C8732068284c35CF3C1Cd259Dbdc);
    uint256 constant EOA_PK =
        0xed6553c1afe1baa355376c1c6d9d04d243ce480bddcf456894b6d6e3dce98b22;

    // Sponsor's address and private key (Sponsor will execute transactions on EOA's behalf).
    // Don't change these - they are initialized by anvil and start with 10000 ETH.
    // Sponsor needs ETH to pay for gas for all these transactions in this script.
    address constant SPONSOR_ADDRESS =
        0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    uint256 constant SPONSOR_PK =
        0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;

    // The contract that EOA will delegate to.
    BatchCallAndSponsor public implementation;

    // ERC-20 token contract.
    MockERC20 public token;

    function run() external {
        setup();
        executeBatchSponsoredExecutionWithOldDelegate();
    }

    function setup() internal {
        // Still deploy new ERC20 and mint tokens.
        // Start broadcasting transactions as Sponsor.
        vm.startBroadcast(SPONSOR_PK);

        // Deploy an ERC20 token contract.
        token = new MockERC20();

        // Mint tokens to EOA's address.
        token.mint(EOA_ADDRESS, 1000e18);

        vm.stopBroadcast();
    }

    function executeBatchSponsoredExecutionWithOldDelegate() internal {
        // Recover the address of the delegate contract from EOA's code.
        bytes memory code = address(EOA_ADDRESS).code;
        console.log("Code on EOA's account:", vm.toString(code));

        // Should be of form 0xef0100 || address(implementation).
        // First 3 bytes are 0xef0100.
        require(code.length == 23, "code should be 23 bytes long (3 + 20)");
        require(
            code[0] == 0xef && code[1] == 0x01 && code[2] == 0x00,
            "code should start with 0xef0100"
        );

        bytes memory implementationBytes = new bytes(20);
        for (uint256 i = 0; i < 20; i++) {
            implementationBytes[i] = code[i + 3];
        }
        address payable implementationAddress = payable(
            address(bytes20(implementationBytes))
        );
        implementation = BatchCallAndSponsor(implementationAddress);
        // This should match the address of the delegate contract created when running BatchCallAndSponsorScript.
        console.log(
            "Delegate contract address:",
            vm.toString(implementationAddress)
        );

        // Make 2 calls to transfer tokens to two different recipients.
        BatchCallAndSponsor.Call[]
            memory calls = new BatchCallAndSponsor.Call[](2);
        address recipient0 = makeAddr("recipient0");
        address recipient1 = makeAddr("recipient1");

        calls[0] = BatchCallAndSponsor.Call({
            to: address(token),
            value: 0,
            data: abi.encodeCall(ERC20.transfer, (recipient0, 100e18))
        });

        calls[1] = BatchCallAndSponsor.Call({
            to: address(token),
            value: 0,
            data: abi.encodeCall(ERC20.transfer, (recipient1, 200e18))
        });

        bytes memory encodedCalls = "";
        for (uint256 i = 0; i < calls.length; i++) {
            encodedCalls = abi.encodePacked(
                encodedCalls,
                calls[i].to,
                calls[i].value,
                calls[i].data
            );
        }
        bytes32 digest = keccak256(
            abi.encodePacked(
                BatchCallAndSponsor(EOA_ADDRESS).nonce(),
                encodedCalls
            )
        );

        // EOA signs over the digest of the calls.
        // Without this (or if the delegate contract does not verify a signature over this data),
        // anyone could make arbitrary calls to the EOA's address to run anything in the delegate contract(s).
        // This does not neccesarily need to be signed by EOA private key.
        // Could make many subkeys with different permissions.
        // Delegate contract should have logic to check signatures and only reject if not signed by key with sufficient permissions.
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            EOA_PK,
            MessageHashUtils.toEthSignedMessageHash(digest)
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        // Start broadcasting transactions as Sponsor.
        vm.startBroadcast(SPONSOR_PK);

        // As Sponsor, call "execute" (function in the delegate contract).
        // Transaction is sent to EOA address and code pointed to by delegate address is loaded and run.
        // Only one of this type of call will be accepted per block - wait until the next block.
        BatchCallAndSponsor(EOA_ADDRESS).execute(calls, signature);
        vm.stopBroadcast();

        require(
            token.balanceOf(recipient0) == 100e18,
            "recipient0 should have received 100 tokens"
        );
        require(
            token.balanceOf(recipient1) == 200e18,
            "recipient1 should have received 200 tokens"
        );
        require(
            token.balanceOf(EOA_ADDRESS) == 700e18,
            "EOA should have 700 tokens left"
        );
    }
}
