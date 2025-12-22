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
import { useTranslation } from "react-i18next";

/**
 * TradeFlowManager - Visual guide showing user where they are in the escrow flow
 * and what actions are required next
 */
export default function TradeFlowManager({ trade, currentUser, bondAmount, escrowStatus, effectiveStatus }) {
  const { t } = useTranslation();
  const isSeller = currentUser?.email === trade.seller_address;
  const isBuyer = currentUser?.email === trade.buyer_address;
  const status = effectiveStatus || trade.status;
  
  // Define the complete escrow flow stages
  const stages = [
    {
      id: 1,
      name: 'Escrow Taken',
      status: 'completed',
      actor: 'both',
      description: 'Ad taken; Escrow created and Buyer DisputeBond locked'
    },
    {
      id: 2,
      name: 'Escrow Funded',
      status: status === 'pending' ? 'active' : 'completed',
      actor: 'seller',
      description: `Seller funds amount + fees + Seller DisputeBond (${trade.token_symbol})`,
      required: isSeller && status === 'pending',
      action: 'Fund Escrow'
    },
    {
      id: 3,
      name: 'Fiat Payment Sent',
      status: status === 'funded' ? 'active' : status === 'pending' ? 'pending' : 'completed',
      actor: 'buyer',
      description: `Buyer sends fiat (${trade.fiat_currency || 'fiat'}) off-chain`,
      required: isBuyer && status === 'funded',
      action: 'Send Fiat Payment'
    },
    {
      id: 4,
      name: 'Payment Confirmed',
      status: status === 'in_progress' ? 'active' : ['pending', 'funded'].includes(status) ? 'pending' : 'completed',
      actor: 'buyer',
      description: 'Buyer confirms payment within the window',
      required: isBuyer && status === 'funded',
      action: 'Confirm Payment'
    },
    {
      id: 5,
      name: 'Release Escrow',
      status: status === 'completed' ? 'completed' : status === 'in_progress' ? 'active' : 'pending',
      actor: 'seller',
      description: 'Seller releases escrow to buyer',
      required: isSeller && status === 'in_progress',
      action: 'Release Escrow'
    },
    {
      id: 6,
      name: 'Resolved',
      status: status === 'completed' ? 'completed' : 'pending',
      actor: 'both',
      description: 'Escrow resolved on-chain'
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
          <h3 className="text-lg font-semibold text-white">
            {t('trade.flowManager.title')}
          </h3>
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
            <strong>{t('trade.flowManager.actionRequiredLabel')}:</strong> {activeStage.action}
          </AlertDescription>
        </Alert>
      )}

      {/* Bond Status Alert */}
      {status === 'in_progress' && (
        <Alert className="mb-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <Shield className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300 text-sm">
            <strong>{t('trade.flowManager.bondsSecuredTitle')}:</strong>{' '}
            DisputeBonds are secured; disputes are allowed only after PAYMENT_CONFIRMED.
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
                      {stage.actor === 'seller'
                        ? t('trade.flowManager.actorSeller')
                        : t('trade.flowManager.actorBuyer')}
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
            <p className="text-slate-500 mb-1">{t('trade.flowManager.summaryStatus')}</p>
            <p className={`font-semibold ${
              ['funded', 'in_progress', 'completed'].includes(status) ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {['funded', 'in_progress', 'completed'].includes(status)
                ? t('trade.flowManager.summaryFunded')
                : t('trade.flowManager.summaryPending')}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">{t('trade.flowManager.summaryBondsLocked')}</p>
            <p className={`font-semibold ${
              status === 'in_progress' || status === 'completed' ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {status === 'in_progress' || status === 'completed'
                ? t('trade.flowManager.summaryBondsBoth')
                : status === 'funded'
                ? t('trade.flowManager.summaryBondsSeller')
                : t('trade.flowManager.summaryBondsNone')}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">{t('trade.flowManager.summaryTimeRemaining')}</p>
            <p className="font-semibold text-blue-400">
              {trade.expires_at ? 
                t('trade.flowManager.summaryHours', {
                  hours: Math.max(0, Math.floor((new Date(trade.expires_at) - new Date()) / (1000 * 60 * 60)))
                }) :
                t('trade.flowManager.summaryNA')
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
