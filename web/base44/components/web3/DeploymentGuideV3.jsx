import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  AlertTriangle,
  Terminal,
  FileCode,
  Rocket,
  Code,
  Settings
} from "lucide-react";
import { toast } from "sonner";

export default function DeploymentGuideV3() {
  const [network, setNetwork] = useState('testnet');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const deploymentConfig = {
    testnet: {
      chainId: 97,
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      explorer: 'https://testnet.bscscan.com',
      faucet: 'https://testnet.bnbchain.org/faucet-smart',
      name: 'BSC Testnet'
    },
    mainnet: {
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed1.binance.org',
      explorer: 'https://bscscan.com',
      name: 'BSC Mainnet'
    }
  };

  const config = deploymentConfig[network];
  
  return (
    <div className="space-y-6 p-6">
      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Rocket className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>TrustfyEscrowV3</strong> deployment guide for BSC. This version includes bond credit pools and optimized gas usage.
        </AlertDescription>
      </Alert>

      <Tabs value={network} onValueChange={setNetwork}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="testnet" className="data-[state=active]:bg-slate-700">
            BSC Testnet (Recommended)
          </TabsTrigger>
          <TabsTrigger value="mainnet" className="data-[state=active]:bg-slate-700">
            BSC Mainnet
          </TabsTrigger>
        </TabsList>

        <TabsContent value={network} className="space-y-6 mt-6">
          {/* Network Info */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Deploying to</p>
                <p className="text-lg font-bold text-white">{config.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Chain ID</p>
                <p className="text-lg font-bold text-purple-400">{config.chainId}</p>
              </div>
            </div>
          </Card>

          {network === 'testnet' && (
            <Alert className="bg-emerald-500/10 border-emerald-500/30">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="text-emerald-300">
                <strong>Testnet Recommended:</strong> Deploy to testnet first to test all functionality before mainnet deployment.
                <a href={config.faucet} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Get free testnet BNB <ExternalLink className="w-3 h-3" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          {network === 'mainnet' && (
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300">
                <strong>Mainnet Deployment:</strong> Ensure you have thoroughly tested on testnet. Real BNB will be used for gas fees (~$2-5 USD).
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Prerequisites */}
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Terminal className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 1: Prerequisites</h3>
            </div>
            
            <div className="space-y-3 text-slate-300">
              <p className="text-sm">Install required tools:</p>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
                <div className="space-y-2">
                  <p className="text-emerald-400"># Install Hardhat globally</p>
                  <p className="text-slate-400">npm install -g hardhat</p>
                  <p className="text-emerald-400 mt-3"># Initialize Hardhat project</p>
                  <p className="text-slate-400">npx hardhat init</p>
                  <p className="text-emerald-400 mt-3"># Install OpenZeppelin contracts</p>
                  <p className="text-slate-400">npm install @openzeppelin/contracts</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm mb-2">Required accounts:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>MetaMask wallet with {config.name} configured</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {network === 'testnet' ? (
                        <>
                          Testnet BNB for gas fees (
                          <a href={config.faucet} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            get from faucet
                          </a>
                          )
                        </>
                      ) : (
                        'BNB for gas fees (~$2-5 USD)'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>BSCScan API key for verification (optional but recommended)</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Step 2: Contract Code */}
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <FileCode className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 2: Prepare Contract</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Create <code className="bg-slate-800 px-2 py-1 rounded text-xs">contracts/TrustfyEscrowV3.sol</code> in your Hardhat project:
              </p>
              
              <div className="bg-slate-950 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-2">The V3 contract includes:</p>
                <ul className="text-xs text-slate-400 space-y-1 ml-4">
                  <li>✓ Per-asset bond credit pools</li>
                  <li>✓ Automatic bond reuse across trades</li>
                  <li>✓ Pooled platform fee collection</li>
                  <li>✓ Separate bond revenue tracking</li>
                  <li>✓ Gas-optimized operations</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-800"
                onClick={() => copyToClipboard('See TrustfyEscrowV3.sol in components/web3/ folder')}
              >
                <Code className="w-4 h-4 mr-2" />
                Contract available in project files
              </Button>
            </div>
          </Card>

          {/* Step 3: Configure Hardhat */}
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Settings className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 3: Configure Hardhat</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Update <code className="bg-slate-800 px-2 py-1 rounded text-xs">hardhat.config.js</code>:
              </p>
              
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-slate-300">{`require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
    ${network === 'testnet' ? 'bscTestnet: {\n      url: "' + config.rpcUrl + '",\n      chainId: ' + config.chainId + ',\n      accounts: [process.env.PRIVATE_KEY]\n    }' : 'bsc: {\n      url: "' + config.rpcUrl + '",\n      chainId: ' + config.chainId + ',\n      accounts: [process.env.PRIVATE_KEY],\n      gasPrice: 3000000000 // 3 gwei\n    }'}
  },
  etherscan: {
    apiKey: {
      ${network === 'testnet' ? 'bscTestnet' : 'bsc'}: process.env.BSCSCAN_API_KEY
    }
  }
};`}</pre>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    ${network === 'testnet' ? 'bscTestnet' : 'bsc'}: {
      url: "${config.rpcUrl}",
      chainId: ${config.chainId},
      accounts: [process.env.PRIVATE_KEY]${network === 'mainnet' ? ',\n      gasPrice: 3000000000' : ''}
    }
  },
  etherscan: { apiKey: { ${network === 'testnet' ? 'bscTestnet' : 'bsc'}: process.env.BSCSCAN_API_KEY } }
};`)}
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copy Config
                </Button>
              </div>

              <Alert className="bg-amber-500/10 border-amber-500/30 mt-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300 text-xs">
                  Create <code className="bg-slate-800 px-1 py-0.5 rounded">.env</code> file with PRIVATE_KEY and BSCSCAN_API_KEY
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Step 4: Create Deploy Script */}
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Rocket className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 4: Deployment Script</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Create <code className="bg-slate-800 px-2 py-1 rounded text-xs">scripts/deploy-v3.js</code>:
              </p>
              
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-slate-300">{`const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying TrustfyEscrowV3 with:", deployer.address);
  console.log("Network:", hre.network.name);
  
  // Constructor parameters
  const platformWallet = deployer.address; // TODO: Change to treasury
  const bondBps = 1000;  // 10% bond requirement
  const minBond = hre.ethers.parseEther("0.01"); // 0.01 BNB/token min
  
  console.log("Config:", {
    platformWallet,
    bondBps: bondBps / 100 + "%",
    minBond: minBond.toString()
  });
  
  const TrustfyEscrowV3 = await hre.ethers.getContractFactory("TrustfyEscrowV3");
  const escrow = await TrustfyEscrowV3.deploy(
    platformWallet,
    bondBps,
    minBond
  );
  
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();
  
  console.log("\\n✅ TrustfyEscrowV3 deployed to:", address);
  console.log("\\n🔧 Next steps:");
  console.log("1. Update CONTRACT_ADDRESSES.BSC.escrow in contractABI.js");
  console.log("2. Verify: npx hardhat verify --network ${network === 'testnet' ? 'bscTestnet' : 'bsc'}", address, platformWallet, bondBps, minBond.toString());
  console.log("3. Set bond withdrawal thresholds for tokens");
  console.log("4. Add arbitrators if needed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`}</pre>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying TrustfyEscrowV3 with:", deployer.address);
  
  const platformWallet = deployer.address;
  const bondBps = 1000; // 10%
  const minBond = hre.ethers.parseEther("0.01");
  
  const TrustfyEscrowV3 = await hre.ethers.getContractFactory("TrustfyEscrowV3");
  const escrow = await TrustfyEscrowV3.deploy(platformWallet, bondBps, minBond);
  
  await escrow.waitForDeployment();
  console.log("TrustfyEscrowV3 deployed to:", await escrow.getAddress());
}

main().catch(console.error);`)}
              >
                <Copy className="w-3 h-3 mr-2" />
                Copy Script
              </Button>
            </div>
          </Card>

          {/* Step 5: Deploy */}
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Terminal className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 5: Deploy Contract</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">Run deployment command:</p>
              
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
                <p className="text-emerald-400"># Deploy to {config.name}</p>
                <p className="text-slate-300">npx hardhat run scripts/deploy-v3.js --network {network === 'testnet' ? 'bscTestnet' : 'bsc'}</p>
              </div>

              {network === 'testnet' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-300">
                  <p className="font-semibold mb-1">💡 Testnet Tips:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Get free testnet BNB from faucet before deploying</li>
                    <li>Deployment takes ~30 seconds</li>
                    <li>Test all functions before mainnet deployment</li>
                  </ul>
                </div>
              )}

              {network === 'mainnet' && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300 text-sm">
                    <strong>Mainnet Deployment:</strong> Double-check all parameters. This will cost real BNB (~$2-5 for gas).
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert className="bg-emerald-500/10 border-emerald-500/30">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-emerald-300 text-sm">
                  <strong>Save the contract address</strong> from the output. You'll update it in the next step.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Step 6: Verify Contract */}
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <CheckCircle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 6: Verify on BSCScan</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">Verify contract source code (highly recommended):</p>
              
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs">
                <p className="text-emerald-400"># Verify on {config.name}</p>
                <p className="text-slate-300">
                  npx hardhat verify --network {network === 'testnet' ? 'bscTestnet' : 'bsc'} YOUR_CONTRACT_ADDRESS "YOUR_PLATFORM_WALLET" 1000 "10000000000000000"
                </p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 text-xs space-y-1">
                <p className="text-slate-400">Constructor parameters:</p>
                <ul className="ml-4 space-y-1 text-slate-300">
                  <li>• <code className="bg-slate-900 px-1 rounded">YOUR_PLATFORM_WALLET</code> - Treasury address</li>
                  <li>• <code className="bg-slate-900 px-1 rounded">1000</code> - 10% bond (1000 bps)</li>
                  <li>• <code className="bg-slate-900 px-1 rounded">"10000000000000000"</code> - 0.01 min bond in wei</li>
                </ul>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-600 hover:bg-slate-800"
                onClick={() => window.open(`${config.explorer}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open {config.name === 'BSC Testnet' ? 'Testnet ' : ''}BSCScan
              </Button>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-xs">
                  Verification allows users to read contract state and interact directly via BSCScan.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Step 7: Update App */}
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <FileCode className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 7: Update App Configuration</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Update contract address in <code className="bg-slate-800 px-2 py-1 rounded text-xs">components/web3/contractABI.js</code>:
              </p>
              
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs">
                <pre className="text-slate-300">{`export const CONTRACT_ADDRESSES = {
  BSC: {
    escrow: "YOUR_DEPLOYED_V3_ADDRESS", // ← Update this
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    BNB: "0x0000000000000000000000000000000000000000"
  }
};`}</pre>
              </div>
              
              <Alert className="bg-emerald-500/10 border-emerald-500/30">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-emerald-300 text-sm">
                  <strong>Success!</strong> Your TrustfyEscrowV3 is deployed and connected.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Step 8: Post-Deployment */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 8: Post-Deployment Setup</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <p className="text-slate-300">Configure V3-specific settings:</p>
              
              <div className="space-y-2">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-white font-semibold mb-1">1. Set Bond Withdrawal Thresholds</p>
                  <p className="text-slate-400 text-xs">Configure minimum bond balance for withdrawals per token</p>
                  <code className="text-xs text-emerald-400">contract.setBondWithdrawalThreshold(token, threshold)</code>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-white font-semibold mb-1">2. Add Arbitrators</p>
                  <p className="text-slate-400 text-xs">Grant ARBITRATOR_ROLE to trusted addresses</p>
                  <code className="text-xs text-emerald-400">contract.addArbitrator(address)</code>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <p className="text-white font-semibold mb-1">3. Test Transactions</p>
                  <p className="text-slate-400 text-xs">Create test trade → Fund → Confirm → Release</p>
                  <p className="text-slate-400 text-xs">Verify bond credits are working correctly</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Resources */}
          <Card className="bg-slate-900/50 border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📚 Resources</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                onClick={() => window.open(config.explorer, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {config.name} Block Explorer
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                onClick={() => window.open('https://docs.bnbchain.org/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                BNB Chain Documentation
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                onClick={() => window.open('https://hardhat.org/docs', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Hardhat Documentation
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}