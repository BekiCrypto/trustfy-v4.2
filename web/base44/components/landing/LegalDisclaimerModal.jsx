import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, AlertTriangle, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LegalDisclaimerModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Scale className="w-6 h-6 text-amber-400" />
            Legal Disclaimer
          </DialogTitle>
          <p className="text-slate-400 text-sm">Important legal information for Web3 users</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300 text-sm">
                TRUSTFY is a decentralized application for blockchain smart contracts. By using TRUSTFY, you acknowledge and accept the following.
              </AlertDescription>
            </Alert>

            {/* No Financial Services */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">1. No Financial Services</h3>
              <p className="text-slate-300 text-sm mb-3">TRUSTFY does not:</p>
              <ul className="space-y-1 text-slate-300 text-sm ml-4">
                <li>• Provide investment advice</li>
                <li>• Act as a broker</li>
                <li>• Act as a financial institution</li>
                <li>• Manage user assets</li>
                <li>• Hold or safeguard private keys</li>
              </ul>
              <p className="text-blue-300 font-medium mt-3">
                The platform is a tool, not a financial service provider.
              </p>
            </Card>

            {/* No Custody */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                2. No Custody of Funds
              </h3>
              <p className="text-slate-300 text-sm">
                TRUSTFY does not store or control digital assets. All funds remain in the user's wallet or inside 
                smart contracts that execute based on predetermined rules.
              </p>
            </Card>

            {/* No Guarantee */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">3. No Guarantee of Outcomes</h3>
              <p className="text-slate-300 text-sm mb-3">TRUSTFY does not guarantee:</p>
              <ul className="space-y-1 text-slate-300 text-sm ml-4">
                <li>• Profit or financial gain</li>
                <li>• Accuracy of market conditions</li>
                <li>• Successful completion of trades</li>
              </ul>
              <p className="text-red-300 font-medium mt-3">
                Smart contract interactions are final and irreversible.
              </p>
            </Card>

            {/* Smart Contract Risks */}
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                4. Smart Contract Risks
              </h3>
              <p className="text-slate-300 text-sm mb-3">Users acknowledge that:</p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <span>Smart contracts may contain vulnerabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <span>Blockchain networks may fail or slow down</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <span>Gas fees may increase unexpectedly</span>
                </li>
              </ul>
              <p className="text-red-300 font-medium mt-3">
                Users bear full responsibility for understanding these risks.
              </p>
            </Card>

            {/* User Decisions */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">5. User Decisions</h3>
              <p className="text-slate-300 text-sm mb-3">
                All transactions require a signed confirmation from your wallet. You are responsible for:
              </p>
              <ul className="space-y-1 text-slate-300 text-sm ml-4">
                <li>• Reviewing transaction details</li>
                <li>• Understanding cost and impact</li>
                <li>• Managing your own risk</li>
              </ul>
              <p className="text-amber-300 font-medium mt-3">
                TRUSTFY cannot modify or cancel a transaction once it has been confirmed on the blockchain.
              </p>
            </Card>

            {/* Wallet Risks */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">6. External Wallet Risks</h3>
              <p className="text-slate-300 text-sm mb-3">TRUSTFY is not responsible for:</p>
              <ul className="space-y-1 text-slate-300 text-sm ml-4">
                <li>• Compromised wallets</li>
                <li>• Lost or stolen private keys</li>
                <li>• Malicious wallet extensions</li>
                <li>• Incorrect contract approvals</li>
              </ul>
              <p className="text-slate-400 text-xs mt-2">
                Your wallet provider determines how signatures and approvals work.
              </p>
            </Card>

            {/* Regulatory */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">7. Regulatory Considerations</h3>
              <p className="text-slate-300 text-sm mb-3">
                Digital asset laws vary across regions. TRUSTFY does not provide legal guidance. Users are responsible for:
              </p>
              <ul className="space-y-1 text-slate-300 text-sm ml-4">
                <li>• Knowing the laws in their region</li>
                <li>• Ensuring their activity is allowed</li>
                <li>• Complying with local restrictions</li>
              </ul>
              <p className="text-slate-400 text-xs mt-2">
                TRUSTFY does not restrict access unless legally required.
              </p>
            </Card>

            {/* Third Party */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">8. Third Party Services</h3>
              <p className="text-slate-300 text-sm">
                TRUSTFY may link or interact with third-party wallets or services. We cannot control the safety 
                or reliability of those external tools.
              </p>
            </Card>

            {/* Availability */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">9. Platform Availability</h3>
              <p className="text-slate-300 text-sm">
                TRUSTFY may experience downtime or updates. We do not guarantee uninterrupted access. Use of the 
                platform is at your own discretion.
              </p>
            </Card>

            {/* Final Note */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 text-center">Final Note</h3>
              <div className="text-slate-300 text-sm space-y-2 text-center">
                <p>TRUSTFY offers decentralized tools for peer-to-peer digital asset exchange.</p>
                <p>These tools function based on user action and blockchain logic.</p>
                <p className="text-blue-300 font-medium">
                  Users accept full responsibility for all transactions and interactions made through their connected wallets.
                </p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            By using TRUSTFY, you acknowledge these terms and accept full responsibility for your actions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}