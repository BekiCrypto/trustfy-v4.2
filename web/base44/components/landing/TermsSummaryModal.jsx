import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Shield, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TermsSummaryModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            Terms of Service Summary
          </DialogTitle>
          <p className="text-slate-400 text-sm">Quick overview - not a replacement for full terms</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <FileText className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300 text-sm">
                This is a high-level overview. Read the full Terms and Conditions for complete details.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  1. You Stay in Control
                </h3>
                <p className="text-slate-300 text-sm">
                  TRUSTFY never holds your private keys or your funds. All trades happen through smart contracts that you control.
                </p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-400" />
                  2. Wallet Login
                </h3>
                <p className="text-slate-300 text-sm">
                  You use your wallet to access TRUSTFY. You are responsible for its security.
                </p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  3. Escrow Rules
                </h3>
                <p className="text-slate-300 text-sm">
                  The smart contract locks funds until both sides follow the trade steps. 
                  Funds are released only after the seller confirms payment.
                </p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2">4. Bonds</h3>
                <div className="text-slate-300 text-sm space-y-1">
                  <p>Both users add a small refundable bond for fairness.</p>
                  <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
                    <li>Bonds return to both users if the trade completes normally</li>
                    <li>The losing party in a dispute may lose their bond</li>
                  </ul>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2">5. Disputes</h3>
                <div className="text-slate-300 text-sm space-y-1">
                  <p>Either user can open a dispute if something goes wrong.</p>
                  <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
                    <li>A neutral arbitrator checks the evidence and gives a final decision</li>
                    <li>The smart contract enforces the result</li>
                  </ul>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2">6. Fees</h3>
                <div className="text-slate-300 text-sm space-y-1">
                  <p>Fees are shown before you confirm a transaction.</p>
                  <p className="text-amber-300">
                    Fees are taken by the smart contract and cannot be changed after the transaction is approved.
                  </p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 p-5">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  7. Prohibited Actions
                </h3>
                <p className="text-slate-300 text-sm mb-2">Users must not:</p>
                <ul className="list-decimal list-inside ml-2 space-y-1 text-slate-300 text-sm">
                  <li>Use TRUSTFY for illegal activity</li>
                  <li>Try to bypass the smart contract</li>
                  <li>Harass or threaten other users</li>
                  <li>Pretend to be support staff</li>
                </ul>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  8. Risks
                </h3>
                <p className="text-slate-300 text-sm">
                  Blockchain trading includes risks such as price changes, wallet errors, and network issues. 
                  TRUSTFY cannot recover lost transactions.
                </p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2">9. No Guarantee</h3>
                <p className="text-slate-300 text-sm">
                  The platform is provided "as is". We do not guarantee perfect operation.
                </p>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-2">10. Updates</h3>
                <p className="text-slate-300 text-sm">
                  We may update our Terms at any time. Continued use means you accept the changes.
                </p>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            For complete details, please read the full Terms and Conditions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}