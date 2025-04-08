## Backend Demo

### Start Local Node

Navigate to smartcontracts directory

```
cd smartcontracts
```

Run anvil node version prague (EIP-7702 only supported after prague)

```
anvil --hardfork prague
```

### Run Demo Script

Navigate to smartcontracts directory

```
cd smartcontracts
```

Run script using local anvil node

```
forge script ./script/BatchCallAndSponsor.s.sol --tc BatchCallAndSponsorScript --broadcast --rpc-url 127.0.0.1:8545 --non-interactive
```

Script does the following

1. Deploys a MockERC20 contract
2. Mints some ERC20 tokens for Alice
3. Deploys BatchCallAndSponsor contract that Alice will delegate to
4. Alice signs authorization list allowing the BatchCallAndSponsor delegate
5. Constructs calls to transfer ERC20 to 2 accounts
6. Alice signs over the transfer calls
7. Bob sends an EIP-7702 transaction to Alice's EOA including an authorization list to set Alice's delegate to BatchCallAndSponsor. The transaction also runs the execute function in the delegate code with list of transfer calls and Alice's signature over these calls in args. This will transfer some ERC20 from Alice to 2 other accounts, but Bob pays for the gas.

The two token transfers are exected in a single transaction (batching).
The gas is paid for by Bob - the one who sends this transaction (sponsorship).
You can use any EOA in the demo - it does not need any ETH on the local chain because Bob pays for all the gas.

Run the second script to try sending another sponsored batch transaction using the same delegation:

```
forge script ./script/BatchCallAndSponsorExistingDelegate.s.sol --tc BatchCallAndSponsorScript --broadcast --rpc-url 127.0.0.1:8545 --non-interactive
```

Script does the following

1. Same setup of ERC20 deployment and minting
2. Constructs a similar transaction to transfer some ERC20 to 2 accounts. Alice signs over these calls.
3. Bob sends transaction to Alice's EOA including the calls and her signature over these calls in the args. No authorization list is passed (Alice has already delegated to the BatchCallAndSponsor contract code and this delegation will remain until she overwrites it or removes it with another EIP-7702 transaction). This will again transfer some ERC20 (the token just deployed in the script) from Alice to 2 other accounts, but Bob pays for the gas.

### View Results

Open

```
smartcontracts/broadcast/BatchCallAndSponsor.s.sol/31337/run-latest.json
```

to see transaction logs for the first script.

The results of the second script can be found in

```
smartcontracts/broadcast/BatchCallAndSponsorExistingDelegate.s.sol/31337/run-latest.json
```
