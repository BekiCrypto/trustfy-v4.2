import React from 'react';
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BondBreakdown({ 
  trade, 
  bondAmount,
  bondCredits,
  userRole, // 'seller' or 'buyer'
  status // trade status
}) {
  const isSeller = userRole === 'seller';
  const fees = ((trade.maker_fee + trade.taker_fee) * trade.amount / 100).toFixed(4);
  
  const bondFromCredits = Math.min(parseFloat(bondCredits || 0), parseFloat(bondAmount || 0));
  const bondFromWallet = Math.max(0, parseFloat(bondAmount || 0) - bondFromCredits);

  const getSellerTotal = () => {
    return (parseFloat(trade.amount) + parseFloat(fees) + parseFloat(bondAmount || 0)).toFixed(4);
  };

  const getBuyerTotal = () => {
    return parseFloat(bondAmount || 0).toFixed(4);
  };

  if (status === 'completed' || status === 'cancelled' || status === 'refunded') {
    return null; // Don't show for completed trades
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className={`w-5 h-5 ${isSeller ? 'text-blue-400' : 'text-purple-400'}`} />
        <h3 className="text-lg font-semibold text-white">
          {isSeller ? 'Seller Deposit Breakdown' : 'Buyer Bond Required'}
        </h3>
      </div>

      {isSeller ? (
        // Seller View
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 text-sm">Trade Amount</span>
              <span className="text-white font-semibold">{trade.amount} {trade.token_symbol}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 text-sm">Platform Fees</span>
              <span className="text-white font-semibold">{fees} {trade.token_symbol}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Maker {trade.maker_fee}% + Taker {trade.taker_fee}%
            </p>
          </div>

          {bondAmount && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex justify-between items-center mb-1">
                <span className="text-purple-400 text-sm font-medium">Seller Dispute Bond</span>
                <span className="text-white font-bold">{bondAmount} {trade.token_symbol}</span>
              </div>
              {bondFromCredits > 0 && (
                <div className="mt-2 p-2 rounded bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                  <div className="flex justify-between text-purple-300">
                    <span>From Credits:</span>
                    <span className="font-semibold">{bondFromCredits.toFixed(4)} {trade.token_symbol}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>From Wallet:</span>
                    <span className="font-semibold">{bondFromWallet.toFixed(4)} {trade.token_symbol}</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-purple-300 mt-2">
                ✓ Converted to reusable credits on successful trade
              </p>
            </div>
          )}

          <div className="h-px bg-slate-700" />

          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <div className="flex justify-between items-center">
              <span className="text-blue-400 font-semibold">Total You'll Deposit</span>
              <span className="text-white font-bold text-lg">{getSellerTotal()} {trade.token_symbol}</span>
            </div>
          </div>

          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300 text-xs">
              Bond converts to reusable credits on success. Build your pool to reduce future costs.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        // Buyer View
        <div className="space-y-3">
          {bondAmount && (
            <>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-400 text-sm font-medium">Buyer Dispute Bond</span>
                  <span className="text-white font-bold text-lg">{bondAmount} {trade.token_symbol}</span>
                </div>
                {bondFromCredits > 0 && (
                  <div className="mt-2 p-2 rounded bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                    <div className="flex justify-between text-purple-300">
                      <span>From Credits:</span>
                      <span className="font-semibold">{bondFromCredits.toFixed(4)} {trade.token_symbol}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>From Wallet:</span>
                      <span className="font-semibold">{bondFromWallet.toFixed(4)} {trade.token_symbol}</span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-purple-300 mt-2">
                  Lock bond to confirm fiat payment sent
                </p>
              </div>

              <Alert className="bg-purple-500/10 border-purple-500/30">
                <Shield className="h-4 w-4 text-purple-400" />
                <AlertDescription className="text-purple-300 text-xs space-y-2">
                  <p><strong>✓ Converted to reusable credits:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Trade completes successfully</li>
                    <li>You win a dispute</li>
                  </ul>
                  <p className="pt-2"><strong>⚠️ Forfeited as platform fee:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>You lose a dispute</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-xs">
                  Bonds convert to credits on success. Build your pool for lower costs.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      )}
    </Card>
  );
}