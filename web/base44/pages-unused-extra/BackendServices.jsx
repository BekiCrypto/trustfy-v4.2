import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calculator, ArrowLeftRight, Link as LinkIcon, Clock, Shield, Zap, Database, Mail } from "lucide-react";

export default function BackendServices() {
  const services = [
    {
      category: 'Trade Lifecycle',
      icon: ArrowLeftRight,
      color: 'from-blue-500 to-indigo-500',
      services: [
        {
          name: 'matchTrades',
          file: 'functions/matchTrades.js',
          description: 'Automated trade matching engine that pairs buy/sell offers',
          trigger: 'Frontend: User accepts an offer',
          input: '{ offer_id, match_amount }',
          output: '{ success, trade_id, trade, next_step }',
          features: [
            'Validates user reputation and KYC requirements',
            'Calculates fees with tier discounts',
            'Creates Trade entity with all parties',
            'Updates offer status (matched/partially_filled)',
            'Sends notifications to both parties'
          ]
        },
        {
          name: 'autoExpireTrades',
          file: 'functions/autoExpireTrades.js',
          description: 'Automatically expires trades past their expiration time',
          trigger: 'Cron Job: Should run every 15-30 minutes',
          input: '{}',
          output: '{ success, expired_trades, checked_trades }',
          features: [
            'Scans all pending/funded trades',
            'Checks expiration timestamps',
            'Updates status to "expired"',
            'Notifies both parties',
            'Suggests refund for funded escrows'
          ]
        }
      ]
    },
    {
      category: 'Notifications',
      icon: Bell,
      color: 'from-amber-500 to-orange-500',
      services: [
        {
          name: 'tradeNotifications',
          file: 'functions/tradeNotifications.js',
          description: 'Centralized notification service for all trade lifecycle events',
          trigger: 'Frontend: After trade status changes',
          input: '{ trade_id, event_type, recipient_address? }',
          output: '{ success, notification_sent }',
          features: [
            'Handles 6+ event types: escrow_funded, payment_confirmed, funds_released, etc.',
            'Creates in-app notifications',
            'Sends email notifications (if enabled)',
            'Respects user notification preferences',
            'Includes deep links to relevant pages'
          ]
        }
      ]
    },
    {
      category: 'Reputation System',
      icon: Calculator,
      color: 'from-purple-500 to-violet-500',
      services: [
        {
          name: 'calculateReputationScore',
          file: 'functions/calculateReputationScore.js',
          description: 'Calculates and updates user reputation score (0-1000) and tier',
          trigger: 'Frontend: After trade completion or review submission',
          input: '{ wallet_address }',
          output: '{ success, reputation: { score, tier, stats } }',
          features: [
            'Analyzes all user trades (success rate, volume, completion time)',
            'Processes user reviews and ratings',
            'Calculates reputation score (0-1000)',
            'Assigns tier (new/bronze/silver/gold/platinum)',
            'Applies fee discounts based on tier',
            'Updates positive/negative rating counts'
          ]
        }
      ]
    },
    {
      category: 'Blockchain Integration',
      icon: LinkIcon,
      color: 'from-emerald-500 to-green-500',
      services: [
        {
          name: 'syncBlockchainStatus',
          file: 'functions/syncBlockchainStatus.js',
          description: 'Syncs on-chain transaction status with database records',
          trigger: 'Frontend: After blockchain transaction (fund/release/dispute)',
          input: '{ trade_id, tx_hash, event_type }',
          output: '{ success, status, confirmations }',
          features: [
            'Monitors transaction confirmations',
            'Updates trade status based on chain events',
            'Handles transaction failures',
            'Parses smart contract event logs',
            'Validates transaction receipts'
          ]
        }
      ]
    },
    {
      category: 'Security & Authentication',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      services: [
        {
          name: 'validateWalletSignature',
          file: 'functions/validateWalletSignature.js',
          description: 'Validates cryptographic wallet signatures for secure authentication',
          trigger: 'Frontend: When user signs a message with their wallet',
          input: '{ wallet_address, signature, message }',
          output: '{ success, valid, wallet_address }',
          features: [
            'Verifies ECDSA signatures using ethers.js',
            'Confirms user controls the wallet address',
            'Validates message timestamp (5-minute window)',
            'Prevents replay attacks',
            'Returns recovered address for verification'
          ]
        }
      ]
    }
  ];

  const integrations = [
    {
      name: 'Base44 Core.SendEmail',
      description: 'Built-in email service for notifications',
      usage: 'tradeNotifications.js',
      noSecretsNeeded: true
    },
    {
      name: 'Base44 Core.InvokeLLM',
      description: 'AI/LLM for dispute analysis and KYC verification',
      usage: 'AI dispute analyzer, KYC document verification',
      noSecretsNeeded: true
    },
    {
      name: 'Base44 Core.UploadFile',
      description: 'File upload service for evidence and documents',
      usage: 'Payment proof, dispute evidence, KYC docs',
      noSecretsNeeded: true
    },
    {
      name: 'Ethers.js (BSC)',
      description: 'Blockchain interaction via public RPC',
      usage: 'Smart contract calls, signature validation',
      noSecretsNeeded: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Backend Microservices Architecture</h1>
          <p className="text-slate-400">Complete transparency of all backend functions and integrations</p>
        </div>

        {/* Services by Category */}
        <div className="space-y-8 mb-8">
          {services.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                  <Badge className="bg-slate-700 text-slate-300">{category.services.length} service{category.services.length > 1 ? 's' : ''}</Badge>
                </div>

                <div className="grid gap-4">
                  {category.services.map((service) => (
                    <Card key={service.name} className="bg-slate-900/90 border-slate-700/50 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">{service.name}</h3>
                          <p className="text-slate-400 text-sm">{service.description}</p>
                          <p className="text-slate-500 text-xs font-mono mt-1">{service.file}</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Active
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-xs text-slate-500 mb-1">Trigger:</p>
                          <p className="text-sm text-slate-300">{service.trigger}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">Input:</p>
                            <p className="text-xs text-emerald-400 font-mono">{service.input}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">Output:</p>
                            <p className="text-xs text-blue-400 font-mono">{service.output}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400 mb-2 font-medium">Features:</p>
                        <ul className="space-y-1">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                              <Zap className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* External Integrations */}
        <Card className="bg-slate-900/90 border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">External Integrations</h2>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              No Secrets Required
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div key={integration.name} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold">{integration.name}</h3>
                  {integration.noSecretsNeeded && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      Built-in
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-2">{integration.description}</p>
                <p className="text-slate-500 text-xs">
                  <span className="text-slate-600">Used in:</span> {integration.usage}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Cron Jobs */}
        <Card className="bg-slate-900/90 border-slate-700/50 p-6 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Scheduled Jobs Required</h2>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              Manual Setup
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <h3 className="text-white font-semibold mb-2">autoExpireTrades</h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate-300">
                  <span className="text-amber-400">Frequency:</span> Every 15-30 minutes
                </p>
                <p className="text-slate-300">
                  <span className="text-amber-400">Endpoint:</span> <code className="text-xs bg-slate-800 px-2 py-1 rounded">POST /functions/autoExpireTrades</code>
                </p>
                <p className="text-slate-300">
                  <span className="text-amber-400">Setup:</span> Use external cron service (cron-job.org, EasyCron) or serverless scheduler
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">6</p>
              <p className="text-slate-400 text-sm">Backend Functions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">4</p>
              <p className="text-slate-400 text-sm">Built-in Integrations</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">0</p>
              <p className="text-slate-400 text-sm">Secrets Required</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}