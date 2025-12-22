import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  Copy,
  ExternalLink,
  Shield,
  Wallet,
  Code,
  Terminal,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export default function DeploymentGuide() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const steps = [
    {
      category: 'Pre-Deployment Preparation',
      icon: Settings,
      steps: [
        {
          title: 'Review Production Checklist',
          description: 'Ensure all systems are operational',
          action: 'Go to Production Checklist page',
          status: 'required',
          details: [
            'All entities configured',
            'Backend functions deployed',
            'Authentication working',
            'Error handling in place'
          ]
        },
        {
          title: 'Setup Platform Wallet',
          description: 'Create a dedicated wallet for platform operations',
          status: 'required',
          details: [
            'Generate new wallet address for platform',
            'Fund with BNB for gas fees (min 0.5 BNB recommended)',
            'Never share private keys',
            'Store securely (hardware wallet recommended)'
          ]
        }
      ]
    },
    {
      category: 'Smart Contract Deployment',
      icon: Code,
      steps: [
        {
          title: 'Deploy TrustfyEscrowV3 to BSC Mainnet',
          description: 'Deploy the V3 smart contract with bond credit system',
          status: 'critical',
          details: [
            'Contract source: components/web3/TrustfyEscrowV3.sol',
            'Use Remix IDE or Hardhat for deployment',
            'Network: BSC Mainnet (Chain ID: 56)',
            'RPC: https://bsc-dataseed1.binance.org',
            'Gas: ~3-5M units required'
          ],
          commands: [
            {
              label: 'Remix IDE',
              value: 'https://remix.ethereum.org',
              type: 'link'
            }
          ]
        },
        {
          title: 'Configure Contract Address',
          description: 'Update the deployed contract address in the codebase',
          status: 'critical',
          details: [
            'File: components/web3/contractABI.jsx',
            'Update CONTRACT_ADDRESSES.BSC.escrow',
            'Verify address on BSCScan',
            'Test contract interaction'
          ],
          commands: [
            {
              label: 'Address format',
              value: '0x1234567890123456789012345678901234567890',
              copyable: true
            }
          ]
        },
        {
          title: 'Grant Admin Roles',
          description: 'Setup platform admin and arbitrator roles on contract',
          status: 'required',
          details: [
            'Grant DEFAULT_ADMIN_ROLE to platform wallet',
            'Grant ARBITRATOR_ROLE to designated arbitrators',
            'Configure bond rate and minimum amounts',
            'Set withdrawal thresholds per token'
          ]
        }
      ]
    },
    {
      category: 'Backend Configuration',
      icon: Terminal,
      steps: [
        {
          title: 'Setup Cron Jobs',
          description: 'Configure automated scheduled tasks',
          status: 'required',
          details: [
            'autoExpireTrades: Run every 15-30 minutes',
            'Use cron-job.org or similar service',
            'Monitor execution logs',
            'Setup failure alerts'
          ],
          commands: [
            {
              label: 'Cron endpoint',
              value: 'POST https://your-app.base44.run/functions/autoExpireTrades',
              copyable: true
            },
            {
              label: 'Schedule',
              value: '*/15 * * * *',
              copyable: true
            }
          ]
        },
        {
          title: 'Verify Backend Functions',
          description: 'Test all 6 backend microservices',
          status: 'required',
          details: [
            'matchTrades: Trade matching engine',
            'tradeNotifications: Notification system',
            'calculateReputationScore: Reputation updates',
            'autoExpireTrades: Auto-expiry',
            'syncBlockchainStatus: Chain sync',
            'validateWalletSignature: Wallet auth'
          ]
        }
      ]
    },
    {
      category: 'Post-Deployment Testing',
      icon: Zap,
      steps: [
        {
          title: 'Test Critical User Flows',
          description: 'End-to-end testing with real transactions',
          status: 'required',
          details: [
            'Create trade offer with real funds (small amount)',
            'Accept offer and execute full trade cycle',
            'Test dispute initiation and resolution',
            'Verify bond credit accumulation and withdrawal',
            'Test all payment methods',
            'Verify notifications (in-app and email)'
          ]
        },
        {
          title: 'Security Verification',
          description: 'Final security checks before launch',
          status: 'critical',
          details: [
            'Verify RLS policies on all entities',
            'Test role-based access control',
            'Confirm contract ownership',
            'Test emergency pause functionality',
            'Verify no private keys in code',
            'Review all error messages for info leaks'
          ]
        },
        {
          title: 'Monitor Initial Trades',
          description: 'Active monitoring during soft launch',
          status: 'required',
          details: [
            'Monitor contract events in real-time',
            'Track gas costs and optimize',
            'Monitor dispute resolution flow',
            'Track user feedback',
            'Monitor platform fee accumulation',
            'Setup alerts for critical errors'
          ]
        }
      ]
    }
  ];

  const launchChecklist = [
    { item: 'Smart contract deployed to BSC mainnet', critical: true },
    { item: 'Contract address updated in codebase', critical: true },
    { item: 'Platform wallet funded with BNB', critical: true },
    { item: 'Admin roles configured on contract', critical: true },
    { item: 'Cron job scheduled for autoExpireTrades', critical: true },
    { item: 'All backend functions tested', critical: true },
    { item: 'End-to-end trade flow tested with real funds', critical: true },
    { item: 'Dispute resolution tested', critical: false },
    { item: 'Email notifications working', critical: false },
    { item: 'Monitoring and alerts configured', critical: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Production Deployment Guide</h1>
              <p className="text-slate-400">Step-by-step guide to launch TRUSTFY on BSC mainnet</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <Alert className="bg-amber-500/10 border-amber-500/30 mb-8">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300">
            <strong>Important:</strong> Follow these steps carefully. Once deployed to mainnet, the contract will handle real user funds. Test thoroughly on testnet first.
          </AlertDescription>
        </Alert>

        {/* Quick Launch Checklist */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Quick Launch Checklist
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {launchChecklist.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  item.critical 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded border-2 border-slate-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm">{item.item}</p>
                  {item.critical && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs mt-1">
                      Critical
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Deployment Steps */}
        <div className="space-y-8">
          {steps.map((category, catIdx) => {
            const Icon = category.icon;
            return (
              <div key={catIdx}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.steps.map((step, stepIdx) => (
                    <Card key={stepIdx} className="bg-slate-900/90 border-slate-700/50 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            step.status === 'critical' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {catIdx + 1}.{stepIdx + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                            <p className="text-slate-400 text-sm">{step.description}</p>
                          </div>
                        </div>
                        <Badge className={
                          step.status === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {step.status === 'critical' ? 'Critical' : 'Required'}
                        </Badge>
                      </div>

                      {step.details && (
                        <ul className="space-y-2 mb-4">
                          {step.details.map((detail, detailIdx) => (
                            <li key={detailIdx} className="flex items-start gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {step.commands && (
                        <div className="space-y-2">
                          {step.commands.map((cmd, cmdIdx) => (
                            <div key={cmdIdx} className="flex items-center gap-2">
                              <div className="flex-1 p-3 rounded-lg bg-slate-800 border border-slate-700 font-mono text-sm text-slate-300">
                                {cmd.value}
                              </div>
                              {cmd.copyable && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => copyToClipboard(cmd.value)}
                                  className="border-slate-600"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              )}
                              {cmd.type === 'link' && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => window.open(cmd.value, '_blank')}
                                  className="border-slate-600"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {step.action && (
                        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                          {step.action}
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resources */}
        <Card className="bg-slate-900/90 border-slate-700/50 p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Additional Resources
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start border-slate-600"
              onClick={() => window.open('https://docs.bnbchain.org/docs/overview/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              BSC Documentation
            </Button>
            <Button
              variant="outline"
              className="justify-start border-slate-600"
              onClick={() => window.open('https://bscscan.com/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              BSCScan Explorer
            </Button>
            <Button
              variant="outline"
              className="justify-start border-slate-600"
              onClick={() => window.open('https://remix.ethereum.org/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Remix IDE
            </Button>
            <Button
              variant="outline"
              className="justify-start border-slate-600"
              onClick={() => window.open('https://cron-job.org/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Cron Job Setup
            </Button>
          </div>
        </Card>

        {/* Final Note */}
        <Alert className="bg-emerald-500/10 border-emerald-500/30 mt-8">
          <Rocket className="h-4 w-4 text-emerald-400" />
          <AlertDescription className="text-emerald-300">
            <strong>Ready to Launch:</strong> Once all steps are completed, your platform will be live on BSC mainnet. Monitor closely during the first 24-48 hours and be ready to respond to any issues.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}