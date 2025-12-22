import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Shield, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ComplianceModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-400" />
            Compliance Neutrality Statement
          </DialogTitle>
          <p className="text-slate-400 text-sm">Our approach to global regulatory compliance</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                TRUSTFY is a <strong className="text-blue-300">non-custodial smart contract escrow system</strong>. 
                It does not hold user funds, operate as a central exchange, or manage user accounts. TRUSTFY is a 
                software interface that allows users to interact directly with decentralized blockchain contracts.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Our Neutral Approach
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-300 text-sm">
                    <p className="font-medium text-white">No Personal Data Collection</p>
                    <p className="text-xs text-slate-400">We do not collect personal identity information by default</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-300 text-sm">
                    <p className="font-medium text-white">No Activity Monitoring</p>
                    <p className="text-xs text-slate-400">We do not monitor or supervise user trading activity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-300 text-sm">
                    <p className="font-medium text-white">Open Access</p>
                    <p className="text-xs text-slate-400">We do not enforce regional access restrictions unless required by law</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-300 text-sm">
                    <p className="font-medium text-white">Non-Custodial Design</p>
                    <p className="text-xs text-slate-400">We do not store or control user assets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-300 text-sm">
                    <p className="font-medium text-white">No Evasion Tools</p>
                    <p className="text-xs text-slate-400">We do not provide tools for evading local laws</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-300 text-sm">
                    <p className="font-medium text-white">User Responsibility</p>
                    <p className="text-xs text-slate-400">Users are responsible for understanding the rules in their own region</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Our Commitment</h3>
              <p className="text-slate-300 text-sm mb-4">
                TRUSTFY does not promote the use of digital assets in violation of local regulations. 
                We support safe peer-to-peer digital asset transactions in a transparent, responsible manner.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Platform Role</h3>
              <p className="text-slate-300 text-sm mb-3">The platform acts only as:</p>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>An access point to public smart contracts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>A non-custodial escrow mechanism</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>A neutral dispute settlement channel</span>
                </li>
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Your Control</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-emerald-300 font-medium">
                  TRUSTFY does not interfere with user funds and cannot freeze or reverse transactions.
                </p>
                <p className="text-emerald-300 font-medium">
                  Users remain in full control of their wallets at all times.
                </p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            TRUSTFY is designed to be transparent, neutral, and user-controlled by nature
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}