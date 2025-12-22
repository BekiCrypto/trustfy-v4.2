import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Eye, Lock, AlertTriangle, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PrivacyModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            Privacy Policy
          </DialogTitle>
          <p className="text-slate-400 text-sm">Effective Date: December 2025</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                1. Introduction
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>
                  This Privacy Policy explains how Trustfy handles information when you visit the platform or interact with the smart contract.
                </p>
                <p className="text-blue-300 font-medium">
                  Trustfy is a non-custodial, blockchain-based service. We do not collect personal data unless you provide it voluntarily. 
                  Your wallet is your identity and remains under your control at all times.
                </p>
              </div>
            </Card>

            {/* Privacy Model */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                2. Privacy-First by Default
              </h3>
              <div className="text-slate-300 text-sm space-y-3">
                <p className="text-emerald-300 font-medium">For wallet-only users, Trustfy does not collect or store:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Private keys or seed phrases</li>
                  <li>Email addresses or phone numbers</li>
                  <li>Bank account details</li>
                  <li>Passwords</li>
                  <li>Government IDs or personal documents</li>
                  <li>Behavioral tracking data</li>
                </ul>
                <p className="text-blue-300 font-medium mt-3">
                  For Prime users who voluntarily opt-in, we may collect:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1 text-blue-200">
                  <li>Email address (if you add email recovery)</li>
                  <li>Identity documents (only if you choose highest KYC tier)</li>
                  <li>Contact preferences for notifications</li>
                </ul>
                <p className="text-slate-400 text-xs mt-2">
                  All Prime data is encrypted, secured, and never shared with third parties. You can request deletion anytime.
                </p>
              </div>
            </Card>

            {/* What We May Receive */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">3. Information We May Receive</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>We may receive limited information that your browser or wallet provides when accessing the platform:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Wallet address (public by nature)</li>
                  <li>Browser type and device type</li>
                  <li>Basic log data for security</li>
                  <li>Optional information you provide through forms or support tickets</li>
                </ul>
                <p className="text-slate-400 text-xs mt-2">
                  Wallet addresses are public by nature and are not considered personal identifiers by us.
                </p>
              </div>
            </Card>

            {/* Cookies */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">4. Cookies and Local Storage</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>Trustfy uses only functional cookies or local storage items required for:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Session management</li>
                  <li>Interface preferences</li>
                  <li>User settings</li>
                </ul>
                <p className="text-blue-300 font-medium mt-2">
                  We do not use tracking cookies or analytics tools that follow your activity across the internet.
                </p>
              </div>
            </Card>

            {/* Data Security */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                5. Data Security
              </h3>
              <div className="text-slate-300 text-sm">
                <p>
                  We follow industry best practices to protect any optional data you share with us. Since the platform is non-custodial, 
                  your primary security responsibilities involve managing your wallet and protecting your private keys.
                </p>
              </div>
            </Card>

            {/* Third Party */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">6. Third Party Services</h3>
              <div className="text-slate-300 text-sm">
                <p>
                  Wallet providers such as MetaMask, Trust Wallet, or WalletConnect have their own privacy practices. 
                  You should review their policies as we do not control how they handle data.
                </p>
              </div>
            </Card>

            {/* Sharing */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">7. Sharing of Information</h3>
              <div className="text-slate-300 text-sm">
                <p className="text-emerald-300 font-medium mb-2">
                  Trustfy does not sell, rent, or share personal information with third parties.
                </p>
                <p>Smart contracts operate independently on the blockchain and their data is public by design.</p>
              </div>
            </Card>

            {/* Children */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">8. Children</h3>
              <div className="text-slate-300 text-sm">
                <p>Trustfy is not intended for individuals under the age of eighteen.</p>
              </div>
            </Card>

            {/* Changes */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">9. Changes to the Policy</h3>
              <div className="text-slate-300 text-sm">
                <p>
                  We may update this Privacy Policy when required. Continued use of the platform means you agree to the updated terms.
                </p>
              </div>
            </Card>

            {/* Contact */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">10. Contact</h3>
              <div className="text-slate-300 text-sm">
                <p>For privacy-related inquiries, please contact us through the platform.</p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Your privacy is protected by design. Personal data collection is opt-in only for Prime features.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}