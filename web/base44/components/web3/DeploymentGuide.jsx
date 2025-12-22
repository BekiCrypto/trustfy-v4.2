# TrustfyEscrow Smart Contract Deployment Guide

## Prerequisites

1. **Install Dependencies**
```bash
npm install --save-dev hardhat @openzeppelin/contracts
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

2. **Create Hardhat Config** (hardhat.config.js)
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY] // Add your private key to .env
    },
    bscMainnet: {
      url: "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY
    }
  }
};
```

## Deployment Steps

### 1. Compile Contract
```bash
npx hardhat compile
```

### 2. Create Deployment Script (scripts/deploy.js)
```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Platform wallet address - CHANGE THIS to your platform wallet
  const platformWallet = "YOUR_PLATFORM_WALLET_ADDRESS";

  const TrustfyEscrow = await hre.ethers.getContractFactory("TrustfyEscrow");
  const escrow = await TrustfyEscrow.deploy(platformWallet);

  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log("TrustfyEscrow deployed to:", address);
  console.log("Platform wallet:", platformWallet);
  
  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await escrow.deploymentTransaction().wait(5);
  
  // Verify contract on BSCScan
  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [platformWallet],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 3. Deploy to BSC Testnet (for testing)
```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

### 4. Deploy to BSC Mainnet (production)
```bash
npx hardhat run scripts/deploy.js --network bscMainnet
```

### 5. Update Contract Address

After deployment, update the contract address in:
**components/web3/contractABI.js**

```javascript
export const CONTRACT_ADDRESSES = {
  BSC: {
    escrow: "YOUR_DEPLOYED_CONTRACT_ADDRESS", // ← Update this
    // ... rest of addresses
  }
};
```

## Post-Deployment Setup

### 1. Add Arbitrators
```javascript
// Using Hardhat console or scripts
const escrow = await ethers.getContractAt("TrustfyEscrow", "CONTRACT_ADDRESS");
await escrow.addArbitrator("ARBITRATOR_WALLET_ADDRESS");
```

### 2. Verify Contract on BSCScan
- Go to https://bscscan.com/verifyContract
- Enter contract address
- Select compiler version 0.8.19
- Upload flattened source code

### 3. Test Contract Functions
```bash
npx hardhat test
```

## Security Checklist

- [ ] Contract audited by professional auditor
- [ ] All access controls properly set
- [ ] Platform wallet address is correct
- [ ] Testnet deployment successful
- [ ] All functions tested
- [ ] Emergency pause mechanism considered
- [ ] Gas optimization verified
- [ ] Reentrancy guards in place
- [ ] Integer overflow/underflow protected
- [ ] External calls handled safely

## Contract Features

✅ **Multi-signature Escrow** - Both parties must confirm
✅ **Native & ERC20 Support** - BNB, USDT, USDC, etc.
✅ **Dispute Resolution** - Multi-tier arbitration
✅ **Platform Fees** - Automatic fee collection
✅ **Refund Mechanism** - Timeout-based refunds
✅ **Role-Based Access** - Admin and Arbitrator roles
✅ **Event Logging** - Complete transaction history
✅ **Reentrancy Protection** - OpenZeppelin standards
✅ **Gas Optimized** - Efficient storage patterns

## Integration with Frontend

The contract is already integrated with the frontend via:
- `components/web3/WalletContext.js` - Wallet connection & contract calls
- `components/web3/contractABI.js` - ABI and addresses
- `components/trade/EscrowManager.js` - User interface

## Support

For deployment assistance or issues:
- Check Hardhat docs: https://hardhat.org/
- BSC deployment guide: https://docs.bnbchain.org/
- OpenZeppelin contracts: https://docs.openzeppelin.com/