import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Shield, AlertTriangle, Scale, Globe, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TermsModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            Terms and Conditions
          </DialogTitle>
          <p className="text-slate-400 text-sm">Effective Date: December 2025</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                1. Introduction
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>
                  These Terms and Conditions govern your access to and use of the Trustfy platform. By connecting a wallet or using any service on Trustfy, you accept these Terms.
                </p>
                <p className="text-blue-300 font-medium">
                  Trustfy is a tool that enables users to interact with smart contracts. Trustfy does not hold user funds, manage private keys, or act as a financial custodian.
                </p>
              </div>
            </Card>

            {/* Eligibility */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">2. Eligibility</h3>
              <div className="text-slate-300 text-sm space-y-1">
                <p>To use Trustfy you confirm that:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>You are at least 18 years of age or the legal age of majority in your region</li>
                  <li>You have full authority to enter into these Terms</li>
                  <li>You are not restricted from using blockchain-based tools by any law</li>
                  <li>You accept the risks associated with decentralized systems</li>
                </ul>
              </div>
            </Card>

            {/* Non-Custodial */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                3. Non-Custodial Nature of the Service
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-emerald-300 font-medium">
                  Trustfy never holds, controls, or manages digital assets on behalf of users. You retain full control over your wallet at all times.
                </p>
                <p>Your funds move only between:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Your own wallet</li>
                  <li>Smart contracts that release assets according to preset rules</li>
                </ul>
                <p className="text-slate-400 text-xs mt-2">
                  Trustfy cannot reverse transactions, freeze assets, access private keys, or perform actions within the smart contract on your behalf.
                </p>
              </div>
            </Card>

            {/* Wallet Connections */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">4. Wallet Connections</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>To use Trustfy you must connect a supported blockchain wallet. You are solely responsible for:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Securing your wallet</li>
                  <li>Maintaining backups</li>
                  <li>Authorizing transactions</li>
                  <li>Ensuring you are interacting with the correct smart contract address</li>
                </ul>
                <p className="text-red-300 text-xs mt-2">
                  Trustfy does not have access to your private keys and cannot assist in recovering a lost wallet.
                </p>
              </div>
            </Card>

            {/* Platform Role */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">5. Platform Role</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Trustfy provides access to decentralized escrow contracts. Trustfy does not:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Operate as a financial institution</li>
                  <li>Provide legal, investment, or tax advice</li>
                  <li>Validate buyer or seller identities</li>
                  <li>Interfere with trades or negotiate terms between users</li>
                  <li>Monitor or supervise user activity</li>
                </ul>
                <p className="text-blue-300 font-medium mt-2">
                  All transactions are executed purely by smart contract logic.
                </p>
              </div>
            </Card>

            {/* Escrow Process */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">6. Escrow and Trade Process</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Users engage in digital asset trading by creating and accepting escrow transactions. Each escrow follows the rules programmed into the smart contract which include:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Locking of seller assets</li>
                  <li>Locking of buyer and seller dispute bonds</li>
                  <li>Release of assets upon seller confirmation</li>
                  <li>Automatic or arbitrated settlement if a dispute occurs</li>
                </ul>
              </div>
            </Card>

            {/* Bond System */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                7. Bond System
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Each trade requires both sides to secure a bond. The bond is:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Refunded upon successful settlement</li>
                  <li>Credited to the winner in a dispute</li>
                  <li>Treated as platform revenue if ruled against a party</li>
                </ul>
                <p className="text-purple-300 font-medium mt-2">
                  Users accept that the bond mechanism is a key security feature. Bonds are refundable under the conditions stated by the smart contract.
                </p>
              </div>
            </Card>

            {/* Dispute Resolution */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                8. Dispute Resolution
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>If a disagreement arises between users, either participant may open a dispute within the smart contract. The assigned arbitrator will review information presented by both sides and issue a final ruling.</p>
                <p className="text-amber-300 mt-2">Users accept that:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Arbitrator decisions are final within the scope of the platform</li>
                  <li>Trustfy does not influence dispute outcomes</li>
                  <li>Disputes follow the logic embedded in the smart contract</li>
                </ul>
              </div>
            </Card>

            {/* Fees */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">9. Fees</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Platform fees are calculated and distributed by the smart contract. Fees apply to:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Standard trade settlements</li>
                  <li>Dispute outcomes involving bond forfeiture</li>
                </ul>
                <p className="text-xs text-slate-400 mt-2">
                  All fees are known before user actions are confirmed. By signing a transaction you accept the associated fee structure.
                </p>
              </div>
            </Card>

            {/* User Responsibilities */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">10. User Responsibilities</h3>
              <div className="text-slate-300 text-sm">
                <p className="mb-2">By using Trustfy you agree to:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Conduct trades in good faith</li>
                  <li>Provide accurate information during disputes</li>
                  <li>Avoid fraudulent or abusive practices</li>
                  <li>Operate your wallet securely</li>
                  <li>Respect other participants</li>
                </ul>
              </div>
            </Card>

            {/* Prohibited Activities */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                11. Prohibited Activities
              </h3>
              <div className="text-slate-300 text-sm">
                <p className="mb-2">Users must not:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Use Trustfy for unlawful activity</li>
                  <li>Attempt to bypass smart contract logic</li>
                  <li>Interfere with platform operations</li>
                  <li>Harass or threaten other users</li>
                  <li>Exploit contract or UI vulnerabilities</li>
                </ul>
              </div>
            </Card>

            {/* Risks */}
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                12. Risks
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-red-300 font-medium">Using blockchain-based applications involves risk. These include:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Market volatility</li>
                  <li>Smart contract vulnerabilities</li>
                  <li>Regulatory uncertainty in your region</li>
                  <li>Loss of private keys</li>
                  <li>Network congestion</li>
                  <li>Delayed or failed transactions</li>
                </ul>
                <p className="text-red-300 font-medium mt-2">By using Trustfy, you accept these risks.</p>
              </div>
            </Card>

            {/* Geographic */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                13. Geographic Restrictions
              </h3>
              <div className="text-slate-300 text-sm">
                <p>
                  Trustfy does not restrict users based on geography. However, users are responsible for understanding laws in their own region. 
                  Users must ensure their activity complies with local regulations.
                </p>
              </div>
            </Card>

            {/* Privacy */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">14. Data and Privacy</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>
                  Trustfy does not store personal information unless provided voluntarily. Wallet authentication does not reveal identity details and remains within the user's control.
                </p>
                <p className="text-blue-300 font-medium">
                  The platform does not track or monitor user transactions beyond what is visible on public blockchains.
                </p>
              </div>
            </Card>

            {/* No Warranties */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">15. No Warranties</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Trustfy is provided on an "as is" and "as available" basis. We do not guarantee:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Continuous or error-free operation</li>
                  <li>Compatibility with all wallets or devices</li>
                  <li>Protection from loss caused by blockchain bugs</li>
                  <li>Future availability of any feature</li>
                </ul>
              </div>
            </Card>

            {/* Liability */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">16. Limitation of Liability</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>To the fullest extent permitted by law, Trustfy and its contributors are not liable for:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Financial loss</li>
                  <li>Loss of digital assets</li>
                  <li>Errors caused by user actions</li>
                  <li>Wallet mismanagement</li>
                  <li>Smart contract failures outside platform control</li>
                  <li>Disputes between users</li>
                </ul>
                <p className="text-red-300 font-medium mt-2">
                  Users interact with blockchain systems at their own risk.
                </p>
              </div>
            </Card>

            {/* Modifications */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">17. Modification of Terms</h3>
              <div className="text-slate-300 text-sm">
                <p>
                  Trustfy may update these Terms to reflect changes in features, legal requirements, or platform improvements. 
                  Updates take effect once published. Continued use of the platform means you agree to the updated Terms.
                </p>
              </div>
            </Card>

            {/* Contact */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">18. Contact</h3>
              <div className="text-slate-300 text-sm">
                <p className="mb-2">For general inquiries or support, please contact us through the platform.</p>
                <p className="text-red-300 text-xs">
                  No private key support or direct wallet recovery assistance is provided.
                </p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            By using TRUSTFY, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}