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
        executeSponsoredBatchTransaction();
    }

    function setup() internal {
        // Start broadcasting transactions as Sponsor.
        vm.startBroadcast(SPONSOR_PK);

        // Deploy an ERC20 token contract.
        token = new MockERC20();

        // Mint tokens to EOA's address.
        token.mint(EOA_ADDRESS, 1000e18);

        // Deploy the BatchCallAndSponsor contract.
        implementation = new BatchCallAndSponsor();

        vm.stopBroadcast();
    }

    function executeSponsoredBatchTransaction() internal {
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
        // Without this (or if the delegate contract does not check verify a signature over this data),
        // anyone could make arbitrary calls to the EOA's address to run anything in the delegate contract(s).
        // This does not neccesarily need to be signed by EOA private key.
        // Could make many subkeys with different permissions.
        // Delegate contract should have logic to check signatures and only reject if not signed by key with sufficient permissions.
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            EOA_PK,
            MessageHashUtils.toEthSignedMessageHash(digest)
        );
        bytes memory signature = abi.encodePacked(r, s, v);

        // EOA signs "delegation" to save delegation address to their code.
        // Code-executing transactions sent to EOA can then execute code stored at that address.
        // Actually saves 0xef0100 || address(implementation) to EOA's code (prepend 0xef0100 to the address of delegate).
        Vm.SignedDelegation memory signedDelegation = vm.signDelegation(
            address(implementation),
            EOA_PK
        );

        // Sponsor attaches the signed delegation from EOA and broadcasts it.
        // With foundry, this will make next transaction an EIP-7702 transaction with an authorization list containing the signedDelegation.
        vm.startBroadcast(SPONSOR_PK);

        bytes memory code = address(EOA_ADDRESS).code;
        require(
            code.length == 0,
            "code should be empty before attach. restart anvil node to redo demo or remove this check if you want to try overwriting the delegate"
        );
        vm.attachDelegation(signedDelegation);
        code = address(EOA_ADDRESS).code;
        require(
            bytes26(code) ==
                bytes26(
                    abi.encodePacked(
                        bytes3(0xef0100),
                        bytes20(address(implementation))
                    )
                ),
            "EOA's code should be 0xef0100 followed by the delegate contract address"
        );

        // Code executing operations sent to EOA will now temporarily load the code at implementation address into the EOA's code.
        // The address of the delegate contract is permanently stored in the EOA's code (until it is overridden or removed by another EIP-7702 transaction).

        // As Sponsor (we are broadcasting as sponsor), call "execute" (function in the delegate contract).
        // Transaction is sent to EOA address and code pointed to by delegate address is loaded and run.
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
