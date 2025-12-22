import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function KYCPolicyModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Identity & Privacy Policy
          </DialogTitle>
          <p className="text-slate-400 text-sm">Your privacy. Your choice. Your control.</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                Trustfy combines <strong className="text-emerald-300">accessible login with true decentralization</strong>. Access the platform 
                using Google, Facebook, email, or your Web3 wallet. <strong className="text-white">All escrow transactions are signed with your 
                connected wallet</strong>, ensuring you maintain full control and sovereignty.
              </p>
              <p className="text-blue-300 text-sm leading-relaxed mt-3">
                Login provides dashboard access, but your wallet remains your transaction identity. Some users may want 
                <strong className="text-blue-400"> optional Prime services</strong> like higher limits or referral rewards—these require 
                email and optional identity verification, but core trading works regardless of login method.
              </p>
            </Card>

            {/* Dual Access Model */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                1. Dual Access Model
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="text-white font-semibold mb-2">🔓 Flexible Login Options</h4>
                  <p className="text-slate-300 text-sm mb-2">Access Trustfy using any method:</p>
                  <ul className="space-y-1 text-slate-300 text-sm ml-4">
                    <li>• Google or Facebook OAuth2</li>
                    <li>• Email and password</li>
                    <li>• Web3 wallet (WalletConnect v2)</li>
                    <li>• Wallet required for transactions</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="text-white font-semibold mb-2">⭐ Prime Mode (Optional)</h4>
                  <p className="text-slate-300 text-sm mb-2">Add optional enhancements for advanced features:</p>
                  <ul className="space-y-1 text-slate-300 text-sm ml-4">
                    <li>• Optional email for account recovery</li>
                    <li>• Optional 2FA for security</li>
                    <li>• Optional identity verification for highest limits</li>
                  </ul>
                  <p className="text-blue-300 font-medium text-sm mt-2">
                    ✨ These enhancements are voluntary and only needed for Prime-level features
                  </p>
                </div>
              </div>
            </Card>

            {/* Prime Features */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">2. What Prime Features Offer</h3>
              <p className="text-slate-300 text-sm mb-3">Users who choose Prime enhancements unlock:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-white font-semibold text-sm mb-1">📈 Higher Limits</p>
                  <p className="text-xs text-slate-400">10x-100x standard transaction caps</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-white font-semibold text-sm mb-1">⚡ Priority Support</p>
                  <p className="text-xs text-slate-400">Faster dispute resolution times</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-white font-semibold text-sm mb-1">🎁 Referral Bonuses</p>
                  <p className="text-xs text-slate-400">Earn rewards for inviting traders</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-white font-semibold text-sm mb-1">🤖 Full API Access</p>
                  <p className="text-xs text-slate-400">Programmatic trading automation</p>
                </div>
              </div>
              <p className="text-blue-300 text-sm mt-3">
                These enhancements are <strong>completely optional</strong>. Standard wallet-only access remains fully functional.
              </p>
            </Card>

            {/* Why This Model */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">3. Why This Dual Model?</h3>
              <p className="text-slate-300 text-sm mb-3">Trustfy is designed as non-custodial infrastructure:</p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Does not custody assets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Does not process fiat deposits/withdrawals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Does not control user funds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Cannot freeze accounts or reverse transactions</span>
                </li>
              </ul>
              <p className="text-blue-300 text-sm mt-3 font-medium">
                Therefore, identity verification is not required for core services. It becomes optional only for users wanting premium benefits.
              </p>
            </Card>

            {/* User Autonomy */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">4. User Autonomy</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-white">Trustfy will never require identity verification</strong> unless you choose to opt into a feature that specifically depends on it. 
                Your ability to use core Web3 escrow services stays independent from traditional account systems.
              </p>
              <p className="text-emerald-300 text-sm mt-2 font-medium">
                You decide how much information you share. Both paths remain available.
              </p>
            </Card>

            {/* Data Protection */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">5. Data Protection</h3>
              <p className="text-slate-300 text-sm mb-3">For wallet-only users:</p>
              <ul className="space-y-1 text-slate-300 text-sm ml-4">
                <li>• No personal data stored</li>
                <li>• No tracking or surveillance</li>
                <li>• Complete anonymity maintained</li>
              </ul>
              <p className="text-slate-300 text-sm mt-3 mb-2">For Prime users who add email/KYC:</p>
              <ul className="space-y-1 text-slate-300 text-sm ml-4">
                <li>• Data encrypted and securely stored</li>
                <li>• Never shared with third parties</li>
                <li>• Used only for requested features</li>
                <li>• Can request deletion anytime</li>
              </ul>
            </Card>

            {/* User Responsibility */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">6. User Responsibility</h3>
              <p className="text-slate-300 text-sm">
                Users are responsible for ensuring that participation in digital asset trading complies with laws 
                that apply to them personally. Trustfy does not verify compliance or enforce regional restrictions.
              </p>
              <p className="text-amber-300 text-sm mt-2">
                Both Privacy-First and Prime users must comply with applicable regulations in their jurisdiction.
              </p>
            </Card>

            {/* Conclusion */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30 p-5">
              <div className="text-center space-y-3">
                <p className="text-lg font-semibold text-white">Trustfy gives users freedom of choice.</p>
                <p className="text-slate-300 text-sm">
                  Use the platform anonymously through your wallet, or unlock Prime features by adding optional email access and optional identity verification.
                </p>
                <p className="text-emerald-300 font-medium">Your privacy stays with you.</p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Wallet login gives you full access. Email and KYC are optional if you want Prime limits and bonus features.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}