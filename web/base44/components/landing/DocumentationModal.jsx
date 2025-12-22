import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Shield,
  Lock,
  Wallet,
  FileText,
  CheckCircle2,
  Code,
  Bot,
  Scale,
  TrendingUp,
  Users,
  Award,
  Zap,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Copy,
  Eye
} from "lucide-react";
import { toast } from "sonner";

export default function DocumentationModal({ open, onOpenChange }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            TRUSTFY Documentation
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="bg-slate-800/50 border border-slate-700 w-full grid grid-cols-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 text-xs">
              Why Trustfy
            </TabsTrigger>
            <TabsTrigger value="getting-started" className="data-[state=active]:bg-slate-700 text-xs">
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="bonds" className="data-[state=active]:bg-slate-700 text-xs">
              Bonds
            </TabsTrigger>
            <TabsTrigger value="disputes" className="data-[state=active]:bg-slate-700 text-xs">
              Disputes
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-slate-700 text-xs">
              API
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-slate-700 text-xs">
              Security
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4 pr-4">
            {/* Platform Overview */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  What Makes TRUSTFY Different?
                </h3>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30 p-6 mb-6">
                  <p className="text-slate-200 leading-relaxed text-lg">
                    TRUSTFY is a <strong className="text-emerald-400">non-custodial, smart-contract escrow platform</strong>.
                  </p>
                </Card>

                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-400" />
                      Non-Custodial by Design
                    </h4>
                    <p className="text-slate-300 text-sm mb-3">
                      We <strong className="text-white">never hold your money</strong>. Your assets are always in one of only two places:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">In your own wallet</strong> – under your complete control</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span className="text-slate-300"><strong className="text-white">Locked in transparent smart contracts</strong> – released only by programmed rules</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                      <p className="text-xs text-slate-400">This eliminates:</p>
                      <ul className="text-xs text-slate-300 mt-2 space-y-1 ml-4 list-disc">
                        <li>Centralized risk</li>
                        <li>Unauthorized access</li>
                        <li>Platform misuse or seizure</li>
                        <li>Single points of failure</li>
                      </ul>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      No Surveillance. No Monitoring.
                    </h4>
                    <p className="text-slate-300 text-sm mb-3">
                      TRUSTFY <strong className="text-white">does not track</strong> your transactions, identity, or financial activity.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" />
                        <span className="text-slate-300">No centralized database to expose your activity</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" />
                        <span className="text-slate-300">No staff can spy on your trades</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" />
                        <span className="text-slate-300">Wallet-based authentication – no email/phone required</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      Built for Global Users
                    </h4>
                    <p className="text-slate-300 text-sm mb-3">
                      Even in high-restriction regions, TRUSTFY remains accessible thanks to Web3 principles:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-blue-400 mb-1" />
                        <p className="text-blue-300">No bank account needed</p>
                      </div>
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-blue-400 mb-1" />
                        <p className="text-blue-300">Wallet-only access</p>
                      </div>
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-blue-400 mb-1" />
                        <p className="text-blue-300">Cannot be locked out</p>
                      </div>
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-blue-400 mb-1" />
                        <p className="text-blue-300">Works under censorship</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3">TRUSTFY vs Traditional P2P</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400">Feature</th>
                            <th className="text-left py-2 text-red-400">Traditional P2P</th>
                            <th className="text-left py-2 text-emerald-400">TRUSTFY</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          <tr className="border-b border-slate-800">
                            <td className="py-2">Fund Control</td>
                            <td className="py-2 text-red-400">Custodial</td>
                            <td className="py-2 text-emerald-400">Non-custodial</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="py-2">Privacy</td>
                            <td className="py-2 text-red-400">Heavy monitoring</td>
                            <td className="py-2 text-emerald-400">No surveillance</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="py-2">Account Freezes</td>
                            <td className="py-2 text-red-400">Common</td>
                            <td className="py-2 text-emerald-400">Impossible</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="py-2">Fraud Protection</td>
                            <td className="py-2 text-red-400">Limited</td>
                            <td className="py-2 text-emerald-400">Bond-secured</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="py-2">Access Requirements</td>
                            <td className="py-2 text-red-400">KYC required</td>
                            <td className="py-2 text-emerald-400">Wallet only (KYC optional)</td>
                          </tr>
                          <tr className="border-b border-slate-800">
                            <td className="py-2">Infrastructure</td>
                            <td className="py-2 text-red-400">Centralized</td>
                            <td className="py-2 text-emerald-400">Decentralized</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <div className="p-5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30">
                    <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      Your Money Stays in Your Hands
                    </h4>
                    <p className="text-slate-200 text-sm leading-relaxed">
                      TRUSTFY gives you <strong className="text-emerald-400">complete control</strong> of your assets, even in regions where 
                      financial systems are restrictive or hostile toward crypto. The platform protects you — not the other way around.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  Quick Start Guide
                </h3>
                
                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h4>
                        <p className="text-slate-300 text-sm mb-3">
                          Install and connect a Web3 wallet (MetaMask, Trust Wallet, or WalletConnect).
                        </p>
                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-2">Supported Networks:</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                              BSC (Live)
                            </Badge>
                            <Badge className="bg-slate-700 text-slate-400">
                              Polygon (Soon)
                            </Badge>
                            <Badge className="bg-slate-700 text-slate-400">
                              Arbitrum (Soon)
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Browse or Create Offers</h4>
                        <p className="text-slate-300 text-sm mb-3">
                          Navigate to the Marketplace to find existing offers or create your own trade ad.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-300">Set your price, amount, and payment methods</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-300">Specify minimum reputation or KYC requirements</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-300">Add custom terms and expiration times</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Execute the Trade</h4>
                        <p className="text-slate-300 text-sm mb-3">
                          Follow the escrow workflow to complete your trade safely.
                        </p>
                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400 font-mono">→</span>
                            <span className="text-slate-300"><strong className="text-white">Seller:</strong> Fund escrow with crypto + fees + bond</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400 font-mono">→</span>
                            <span className="text-slate-300"><strong className="text-white">Buyer:</strong> Send fiat payment via agreed method</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-mono">→</span>
                            <span className="text-slate-300"><strong className="text-white">Buyer:</strong> Mark as paid and lock your bond</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-mono">→</span>
                            <span className="text-slate-300"><strong className="text-white">Seller:</strong> Confirm payment and release crypto</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-mono">✓</span>
                            <span className="text-emerald-300"><strong>Done:</strong> Both bonds automatically refunded!</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Build Your Reputation</h4>
                        <p className="text-slate-300 text-sm mb-3">
                          Rate your trading partner and earn reputation to unlock benefits.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30 text-xs text-center">
                            <Award className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                            <p className="text-purple-400 font-semibold">Tier Upgrades</p>
                          </div>
                          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-center">
                            <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                            <p className="text-emerald-400 font-semibold">Fee Discounts</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Bond System */}
            <TabsContent value="bonds" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Symmetric Bond Escrow System
                </h3>

                <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6 mb-6">
                  <p className="text-slate-200 leading-relaxed">
                    TRUSTFY's innovative <strong className="text-purple-400">Symmetric Bond Escrow</strong> ensures both parties have equal skin in the game. 
                    By requiring both buyer and seller to lock refundable bonds, we create perfectly aligned incentives for honest behavior.
                  </p>
                </Card>

                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      How Bond Amounts Are Calculated
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 rounded-lg bg-slate-900/50">
                        <p className="text-slate-300 mb-2">
                          <strong className="text-white">Seller Bond:</strong> ~1% of trade amount (or equivalent from bond credit pool)
                        </p>
                        <div className="font-mono text-xs text-blue-400">
                          seller_bond = trade_amount × 0.01
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50">
                        <p className="text-slate-300 mb-2">
                          <strong className="text-white">Buyer Bond:</strong> Equal to seller bond (symmetric)
                        </p>
                        <div className="font-mono text-xs text-purple-400">
                          buyer_bond = seller_bond
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-emerald-300 text-xs">
                          <strong>✓ Both bonds are 100% refunded on successful trade completion</strong>
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      Smart Bond Credits (V3)
                    </h4>
                    <div className="space-y-3 text-sm text-slate-300">
                      <p>Our latest innovation: build a <strong className="text-blue-400">reusable bond credit pool</strong> from successful trades.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 mb-1" />
                          <p className="font-semibold text-white">Accumulate Credits</p>
                          <p className="text-xs text-slate-400 mt-1">Each successful trade adds to your pool</p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <Zap className="w-4 h-4 text-purple-400 mb-1" />
                          <p className="font-semibold text-white">Instant Trading</p>
                          <p className="text-xs text-slate-400 mt-1">Reuse credits without new approvals</p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
                          <p className="font-semibold text-white">Lower Costs</p>
                          <p className="text-xs text-slate-400 mt-1">Save on gas and transaction fees</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <Wallet className="w-4 h-4 text-amber-400 mb-1" />
                          <p className="font-semibold text-white">Withdraw Anytime</p>
                          <p className="text-xs text-slate-400 mt-1">Claim credits back to wallet</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Disputes */}
            <TabsContent value="disputes" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  Multi-Tier Dispute Resolution
                </h3>

                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Bot className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Tier 1: AI Analysis</h4>
                        <Badge className="bg-blue-500/10 text-blue-400 text-xs mt-1">
                          Resolution Time: Minutes
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">
                      Advanced AI analyzes evidence, chat history, payment proof, and user reputation to make data-driven decisions.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Screenshot analysis and OCR verification</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Chat sentiment and behavior analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Historical pattern recognition</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Users className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Tier 2: Human Arbitration</h4>
                        <Badge className="bg-amber-500/10 text-amber-400 text-xs mt-1">
                          Resolution Time: Few Minutes - Hours
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">
                      Professional arbitrators review complex cases that AI cannot confidently resolve.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Expert review of all evidence and communications</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Detailed reasoning for each ruling</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Arbitrators stake reputation and earn fees</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Scale className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Tier 3: DAO Governance</h4>
                        <Badge className="bg-purple-500/10 text-purple-400 text-xs mt-1">
                          Resolution Time: Hours
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">
                      High-value or contentious disputes can be escalated to community governance voting.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Decentralized decision-making</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Token-weighted voting mechanism</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-slate-400">Transparent on-chain execution</span>
                      </div>
                    </div>
                  </Card>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-red-300 font-semibold mb-1">Dispute Consequences</p>
                        <p className="text-slate-300">
                          Winner gets their bond refunded. Loser's bond becomes platform fee. This ensures both parties have strong incentive to act honestly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* API */}
            <TabsContent value="api" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  Trading API & Automation
                </h3>

                <Card className="bg-slate-800/50 border-slate-700 p-5 mb-4">
                  <h4 className="text-lg font-semibold text-white mb-3">API Authentication</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Generate API keys in your dashboard:</p>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-xs text-slate-400">Settings → Trading Bots → API Keys</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard('Settings → Trading Bots → API Keys')}
                            className="h-6"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Include in requests:</p>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY')}
                          className="absolute top-2 right-2 h-6"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <code className="text-xs text-emerald-400">Authorization: Bearer YOUR_API_KEY</code>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 p-5 mb-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Example: Automated Trading Bot</h4>
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(exampleBotCode)}
                      className="absolute top-2 right-2 z-10"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto text-xs">
                      <code className="text-emerald-300">{exampleBotCode}</code>
                    </pre>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-4">
                    <Bot className="w-6 h-6 text-purple-400 mb-2" />
                    <h4 className="font-semibold text-white mb-1">AI Strategy Analyzer</h4>
                    <p className="text-xs text-slate-300">
                      Describe your strategy in plain language and get AI-powered analysis with risk assessment
                    </p>
                  </Card>
                  <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 p-4">
                    <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
                    <h4 className="font-semibold text-white mb-1">Arbitrage Scanner</h4>
                    <p className="text-xs text-slate-300">
                      Real-time detection of profitable arbitrage opportunities across all offers
                    </p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Security & Best Practices
                </h3>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-6 mb-6">
                  <p className="text-slate-200 leading-relaxed">
                    TRUSTFY prioritizes security through decentralization, transparency, and user control. Your funds and data are protected by design.
                  </p>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 p-5 mb-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Protection From Platform Risk
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Unlike centralized platforms, TRUSTFY carries <strong className="text-white">zero custody</strong>:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mb-1" />
                      <p className="text-emerald-300">Cannot freeze accounts</p>
                    </div>
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mb-1" />
                      <p className="text-emerald-300">Cannot hold assets</p>
                    </div>
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mb-1" />
                      <p className="text-emerald-300">No bankruptcy risk</p>
                    </div>
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mb-1" />
                      <p className="text-emerald-300">No insider risk</p>
                    </div>
                  </div>
                </Card>

                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Transparent Smart Contracts
                    </h4>
                    <p className="text-slate-300 text-sm mb-3">
                      Every action is executed by public smart contracts. Users can verify all logic on-chain:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Escrow creation & fund locks</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Fund releases & refunds</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Dispute outcomes & bond handling</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Platform fees & bond balances</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-emerald-300 text-xs">
                        <strong>Nothing is hidden.</strong> All logic is on-chain and tamper-proof.
                      </p>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-purple-400" />
                      Hybrid Authentication
                    </h4>
                    <p className="text-slate-300 text-sm mb-3">
                      Access Trustfy using Google, Facebook, email, or your Web3 wallet. All escrow transactions are signed 
                      with your connected wallet for maximum security and decentralization.
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-white font-semibold text-sm mb-2">🔐 Login Options</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5" />
                            <span className="text-slate-300">Google OAuth2</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5" />
                            <span className="text-slate-300">Facebook OAuth2</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5" />
                            <span className="text-slate-300">Email & Password</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5" />
                            <span className="text-slate-300">Web3 Wallet (WalletConnect v2)</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-white font-semibold text-sm mb-2">🔗 Transaction Signing</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span className="text-slate-300">All blockchain actions require connected wallet</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span className="text-slate-300">Wallet signature for every transaction</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span className="text-slate-300">OAuth2 users connect wallet before first trade</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <p className="text-purple-300 text-xs">
                        <strong>Best of both worlds:</strong> Accessible login with Google/Facebook/Email, plus true decentralization through wallet signatures.
                      </p>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-400" />
                      User Safety Guidelines
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="font-semibold text-white text-sm mb-1">✓ Always Verify Payment Details</p>
                        <p className="text-xs text-slate-400">Double-check payment method info before sending fiat</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="font-semibold text-white text-sm mb-1">✓ Check Counterparty Reputation</p>
                        <p className="text-xs text-slate-400">Trade with higher-tier users for better safety</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="font-semibold text-white text-sm mb-1">✓ Use Chat for Evidence</p>
                        <p className="text-xs text-slate-400">Keep all communication in-app for dispute protection</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="font-semibold text-white text-sm mb-1">✓ Submit Clear Payment Proof</p>
                        <p className="text-xs text-slate-400">Upload screenshots, transaction IDs for faster resolution</p>
                      </div>
                    </div>
                  </Card>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-red-300 font-semibold mb-1">Security Warnings</p>
                        <ul className="space-y-1 text-slate-300">
                          <li>• Never share your wallet private keys or seed phrases</li>
                          <li>• Only communicate through the in-app chat system</li>
                          <li>• Be cautious of deals that seem too good to be true</li>
                          <li>• Report suspicious behavior to arbitrators immediately</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">
              Last updated: December 2025
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-400"
                onClick={() => window.open('https://trustfy.base44.app/Docs', '_blank')}
              >
                <BookOpen className="w-3 h-3 mr-2" />
                Documentation Hub
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

const exampleBotCode = `// Automated Arbitrage Bot Example
import axios from 'axios';

const API_KEY = 'your_api_key';
const API_URL = 'https://api.trustfy.io/v1';

async function scanArbitrage() {
  const { data: offers } = await axios.get(
    \`\${API_URL}/offers?status=open\`,
    { headers: { Authorization: \`Bearer \${API_KEY}\` }}
  );
  
  // Find buy/sell price differences
  const opportunities = offers
    .filter(o => o.token === 'USDT')
    .reduce((acc, offer) => {
      // Match buy and sell offers
      if (offer.type === 'sell') {
        const matchingBuy = offers.find(
          b => b.type === 'buy' && 
          b.price > offer.price * 1.02
        );
        
        if (matchingBuy) {
          acc.push({
            profit: matchingBuy.price - offer.price,
            volume: Math.min(offer.amount, matchingBuy.amount)
          });
        }
      }
      return acc;
    }, []);
    
  return opportunities;
}

// Run every 30 seconds
setInterval(scanArbitrage, 30000);`;