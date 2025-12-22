import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  Loader2,
  Shield
} from "lucide-react";

/**
 * TradeFlowManager - Visual guide showing user where they are in the trade flow
 * and what actions are required next
 */
export default function TradeFlowManager({ trade, currentUser, bondAmount, escrowStatus }) {
  const isSeller = currentUser?.email === trade.seller_address;
  const isBuyer = currentUser?.email === trade.buyer_address;
  
  // Define the complete trade flow stages
  const stages = [
    {
      id: 1,
      name: 'Trade Created',
      status: 'completed',
      actor: 'both',
      description: 'Trade matched from marketplace'
    },
    {
      id: 2,
      name: 'Escrow Funded',
      status: trade.status === 'pending' ? 'active' : 'completed',
      actor: 'seller',
      description: `Seller funds ${trade.escrow_amount?.toFixed(2) || trade.amount} ${trade.token_symbol}`,
      required: isSeller && trade.status === 'pending',
      action: 'Fund Escrow & Lock Bond'
    },
    {
      id: 3,
      name: 'Payment Sent',
      status: trade.status === 'funded' ? 'active' : trade.status === 'pending' ? 'pending' : 'completed',
      actor: 'buyer',
      description: `Buyer sends ${trade.fiat_currency} ${trade.total_fiat_amount?.toLocaleString()}`,
      required: isBuyer && trade.status === 'funded',
      action: 'Send Payment & Submit Proof'
    },
    {
      id: 4,
      name: 'Payment Confirmed',
      status: trade.status === 'in_progress' ? 'active' : ['pending', 'funded'].includes(trade.status) ? 'pending' : 'completed',
      actor: 'buyer',
      description: 'Buyer locks bond after payment',
      required: isBuyer && trade.status === 'funded',
      action: 'Lock Buyer Bond'
    },
    {
      id: 5,
      name: 'Funds Released',
      status: trade.status === 'completed' ? 'completed' : trade.status === 'in_progress' ? 'active' : 'pending',
      actor: 'seller',
      description: 'Seller releases crypto to buyer',
      required: isSeller && trade.status === 'in_progress',
      action: 'Release Funds'
    },
    {
      id: 6,
      name: 'Trade Complete',
      status: trade.status === 'completed' ? 'completed' : 'pending',
      actor: 'both',
      description: 'Both bonds converted to credits'
    }
  ];

  // Calculate progress percentage
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const progressPercent = (completedStages / stages.length) * 100;

  // Find current active stage
  const activeStage = stages.find(s => s.status === 'active' && s.required);

  const getStageIcon = (stage) => {
    if (stage.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
    if (stage.status === 'active') {
      return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
    return <Clock className="w-5 h-5 text-slate-600" />;
  };

  const getStageColor = (stage) => {
    if (stage.status === 'completed') return 'border-emerald-500/30 bg-emerald-500/5';
    if (stage.status === 'active') return 'border-blue-500/30 bg-blue-500/5';
    return 'border-slate-700/50 bg-slate-800/30';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Trade Progress</h3>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {completedStages} / {stages.length}
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-2 bg-slate-800" />
      </div>

      {/* Active Action Alert */}
      {activeStage && (
        <Alert className="mb-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-sm">
            <strong>Your Action Required:</strong> {activeStage.action}
          </AlertDescription>
        </Alert>
      )}

      {/* Bond Status Alert */}
      {trade.status === 'in_progress' && (
        <Alert className="mb-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <Shield className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300 text-sm">
            <strong>Both Bonds Secured:</strong> Seller and buyer bonds are locked. Arbitrator can resolve disputes.
          </AlertDescription>
        </Alert>
      )}

      {/* Flow Visualization */}
      <div className="space-y-3">
        {stages.map((stage, idx) => (
          <div key={stage.id}>
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${getStageColor(stage)} transition-all`}>
              <div className="flex-shrink-0 mt-0.5">
                {getStageIcon(stage)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`font-medium ${
                    stage.status === 'completed' ? 'text-emerald-400' :
                    stage.status === 'active' ? 'text-blue-400' :
                    'text-slate-500'
                  }`}>
                    {stage.name}
                  </p>
                  {stage.actor !== 'both' && (
                    <Badge variant="outline" className={`text-xs ${
                      stage.actor === 'seller' ? 'border-amber-500/50 text-amber-400' :
                      'border-blue-500/50 text-blue-400'
                    }`}>
                      {stage.actor}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">{stage.description}</p>
                {stage.required && stage.action && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{stage.action}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Connector Line */}
            {idx < stages.length - 1 && (
              <div className="flex justify-center">
                <div className={`w-0.5 h-4 ${
                  stage.status === 'completed' ? 'bg-emerald-500/30' : 'bg-slate-700/50'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Summary */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-slate-500 mb-1">Escrow Status</p>
            <p className={`font-semibold ${
              ['funded', 'in_progress', 'completed'].includes(trade.status) ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {['funded', 'in_progress', 'completed'].includes(trade.status) ? 'Funded' : 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Bonds Locked</p>
            <p className={`font-semibold ${
              trade.status === 'in_progress' || trade.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {trade.status === 'in_progress' || trade.status === 'completed' ? 'Both' : 
               trade.status === 'funded' ? 'Seller' : 'None'}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Time Remaining</p>
            <p className="font-semibold text-blue-400">
              {trade.expires_at ? 
                Math.max(0, Math.floor((new Date(trade.expires_at) - new Date()) / (1000 * 60 * 60))) + 'h' :
                'N/A'
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}