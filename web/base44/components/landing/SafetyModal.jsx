import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  AlertTriangle,
  Lock,
  Scale,
  Eye,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function SafetyModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-8 h-8 text-emerald-400" />
            Safety Center
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            <p className="text-slate-400">
              Your complete guide to safe trading on TRUSTFY
            </p>

            <Tabs defaultValue="guidelines" className="space-y-6">
              <TabsList className="bg-slate-800/50 border border-slate-700 w-full grid grid-cols-4">
                <TabsTrigger value="guidelines">Safety Guidelines</TabsTrigger>
                <TabsTrigger value="disputes">Dispute Policy</TabsTrigger>
                <TabsTrigger value="antifraud">Anti-Fraud</TabsTrigger>
                <TabsTrigger value="risks">Risk Disclosure</TabsTrigger>
              </TabsList>

              {/* Safety Guidelines */}
              <TabsContent value="guidelines" className="space-y-6">
                <Alert className="bg-emerald-500/10 border-emerald-500/30">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <AlertDescription className="text-emerald-300 text-sm">
                    Follow these guidelines to protect yourself and ensure smooth trades
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-400" />
                      Protect Your Wallet
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Never share private keys or seed phrases with anyone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Avoid signing messages you don't understand</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Always verify you're on the correct platform domain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Use hardware wallets when possible</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      Stay Cautious in Communications
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Keep communications within approved channels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Avoid sharing personal information with traders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Beware of false payment proofs or edited screenshots</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Verify Payment Before Releasing Assets
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Confirm you received the correct fiat or digital asset</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Match sender details carefully</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>Don't rely on verbal promises or unverified confirmations</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      Beware of Common Scams
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        <span>Fake customer support contacts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        <span>Fake wallet extensions or phishing sites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        <span>Pressure to move outside the escrow</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        <span>Impersonation attacks</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </TabsContent>

              {/* Dispute Policy */}
              <TabsContent value="disputes" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-amber-400" />
                    Dispute Resolution Policy
                  </h3>
                  <p className="text-slate-300 text-sm mb-6">
                    TRUSTFY includes a neutral dispute system to protect both sides of a trade.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">When Can You Open a Dispute?</h4>
                      <ul className="space-y-2 text-slate-300 text-sm ml-4">
                        <li>• Buyer claims to have paid but seller disagrees</li>
                        <li>• Seller refuses to release assets after payment</li>
                        <li>• Evidence is conflicting</li>
                        <li>• Either party suspects fraud</li>
                      </ul>
                      <p className="text-slate-400 text-xs mt-2">
                        Disputes can only be opened within the time set by the escrow.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <h4 className="text-lg font-semibold text-white mb-3">Process Overview</h4>
                      <ol className="space-y-2 text-slate-300 text-sm">
                        <li className="flex gap-2">
                          <span className="font-bold text-blue-400">1.</span>
                          <span>Either party opens a dispute through the smart contract</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-blue-400">2.</span>
                          <span>Both bonds become locked</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-blue-400">3.</span>
                          <span>An arbitrator reviews all evidence from both parties</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-blue-400">4.</span>
                          <span>Arbitrator issues a ruling based on the facts presented</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-blue-400">5.</span>
                          <span>The smart contract enforces the outcome automatically</span>
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Valid Evidence Includes</h4>
                      <ul className="grid md:grid-cols-2 gap-2 text-slate-300 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Payment receipts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Bank confirmations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Screenshots</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Communication logs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>On-chain transaction records</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <h4 className="text-lg font-semibold text-white mb-3">Possible Outcomes</h4>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 rounded bg-slate-900/50">
                          <p className="font-semibold text-emerald-400 mb-1">Buyer Wins</p>
                          <ul className="text-slate-300 ml-4 space-y-1">
                            <li>• Buyer receives escrowed assets</li>
                            <li>• Buyer bond refunded</li>
                            <li>• Seller bond forfeited</li>
                          </ul>
                        </div>
                        <div className="p-3 rounded bg-slate-900/50">
                          <p className="font-semibold text-blue-400 mb-1">Seller Wins</p>
                          <ul className="text-slate-300 ml-4 space-y-1">
                            <li>• Seller receives refund or keeps assets</li>
                            <li>• Seller bond refunded</li>
                            <li>• Buyer bond forfeited</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Anti-Fraud */}
              <TabsContent value="antifraud" className="space-y-6">
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300 text-sm">
                    Understanding common threats helps you stay protected
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 text-red-400">Common Threats</h3>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="font-semibold text-white mb-1">Fake Payment Proofs</p>
                        <p className="text-slate-300">Scammers send edited screenshots. Always check your own bank or wallet directly.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="font-semibold text-white mb-1">Impersonation of Support</p>
                        <p className="text-slate-300">TRUSTFY support will never ask for private keys, seed phrases, or remote access.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="font-semibold text-white mb-1">Off-Escrow Transactions</p>
                        <p className="text-slate-300">Never release assets outside the smart contract. Fraud risk increases sharply.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="font-semibold text-white mb-1">Phishing Pages</p>
                        <p className="text-slate-300">Always check domain spelling. Bookmark the official website.</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 text-emerald-400">How TRUSTFY Reduces Fraud</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                        <span className="text-slate-300">Both sides secure a bond which punishes dishonest behavior</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
                        <span className="text-slate-300">Smart contracts hold funds until release conditions are met</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Scale className="w-5 h-5 text-purple-400 mt-0.5" />
                        <span className="text-slate-300">Disputes settled by neutral arbitrators, not by users</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5" />
                        <span className="text-slate-300">No central authority can change or override smart contract rules</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </TabsContent>

              {/* Risk Disclosure */}
              <TabsContent value="risks" className="space-y-6">
                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <AlertDescription className="text-amber-300 text-sm">
                    Trading and blockchain interaction involve risks. By using TRUSTFY, you acknowledge these risks.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Financial Risks</h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Volatility Risk</p>
                          <p className="text-xs text-slate-400">Digital asset prices may rise or fall suddenly</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Dispute Outcome Risk</p>
                          <p className="text-xs text-slate-400">You may lose your bond if evidence supports the other party</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Technical Risks</h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Smart Contract Risk</p>
                          <p className="text-xs text-slate-400">Contracts may contain unforeseen issues</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Wallet Security Risk</p>
                          <p className="text-xs text-slate-400">Loss of private keys results in permanent asset loss</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Network Risk</p>
                          <p className="text-xs text-slate-400">Transactions may be delayed or fail due to congestion</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Legal & Regulatory Risks</h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-purple-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Regulatory Risk</p>
                          <p className="text-xs text-slate-400">Laws vary across regions. You're responsible for compliance</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">User Responsibility Risks</h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">User Error</p>
                          <p className="text-xs text-slate-400">Mistakes like sending to wrong address cannot be reversed</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">Third Party Risks</p>
                          <p className="text-xs text-slate-400">Wallet providers and exchanges are not controlled by TRUSTFY</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}