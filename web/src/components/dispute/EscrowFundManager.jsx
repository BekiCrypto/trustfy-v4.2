import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Unlock, ArrowRight, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export default function EscrowFundManager({ trade, dispute, onRelease }) {
  const { t } = useTranslation();
  const escrowAmount = trade.escrow_amount || trade.amount;
  const isLocked = ['disputed', 'in_progress'].includes(trade.status);
  const isResolved = dispute?.ruling !== 'pending';

  const handleRelease = async (recipient) => {
    if (!isResolved) {
      toast.error(t('trade.disputeFundManager.toastNotResolved'));
      return;
    }
    
    if (onRelease) {
      await onRelease(recipient, escrowAmount);
    }
  };

  return (
    <Card className="bg-slate-900/90 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-400" />
        {t('trade.disputeFundManager.title')}
      </h3>

      {/* Escrow Status */}
      <div className="space-y-4">
        <div className={`p-4 rounded-xl border-2 ${
          isLocked 
            ? 'bg-amber-500/10 border-amber-500/30' 
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isLocked ? (
                <Lock className="w-5 h-5 text-amber-400" />
              ) : (
                <Unlock className="w-5 h-5 text-emerald-400" />
              )}
              <span className={`font-semibold ${
                isLocked ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {isLocked ? t('trade.disputeFundManager.fundsLocked') : t('trade.disputeFundManager.fundsAvailable')}
              </span>
            </div>
            <span className={`text-sm ${
              isLocked ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {isLocked ? t('trade.disputeFundManager.securedInEscrow') : t('trade.disputeFundManager.readyForRelease')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-white" />
            <span className="text-2xl font-bold text-white">
              {escrowAmount} {trade.token_symbol}
            </span>
          </div>
          
          {trade.total_fiat_amount && (
            <p className="text-sm text-slate-400 mt-1">
              ≈ {trade.fiat_currency} {trade.total_fiat_amount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">{t('trade.disputeFundManager.multiSig')}</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {trade.seller_signed && trade.buyer_signed
                ? t('trade.disputeFundManager.bothSigned')
                : t('trade.disputeFundManager.pending')}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">{t('trade.disputeFundManager.statusLabel')}</span>
            </div>
            <p className="text-sm font-semibold text-white capitalize">
              {trade.status}
            </p>
          </div>
        </div>

        {/* Dispute Ruling */}
        {dispute && isResolved && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-sm font-semibold text-white mb-2">{t('trade.disputeFundManager.rulingTitle')}</h4>
            <p className="text-sm text-slate-300 mb-3">
              {dispute.ruling === 'favor_seller' && t('trade.disputeFundManager.rulingSeller')}
              {dispute.ruling === 'favor_buyer' && t('trade.disputeFundManager.rulingBuyer')}
              {dispute.ruling === 'split' && t('trade.disputeFundManager.rulingSplit')}
            </p>
            
            {dispute.ruling_reason && (
              <p className="text-xs text-slate-400 mt-2">
                {t('trade.disputeFundManager.reasonLabel')} {dispute.ruling_reason}
              </p>
            )}
          </div>
        )}

        {/* Release Actions */}
        {isResolved && dispute && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {t('trade.disputeFundManager.arbitratorNote')}
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleRelease('seller')}
                disabled={!isLocked}
                variant="outline"
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {t('trade.disputeFundManager.toSeller')}
              </Button>
              
              <Button
                onClick={() => handleRelease('buyer')}
                disabled={!isLocked}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {t('trade.disputeFundManager.toBuyer')}
              </Button>
            </div>
          </div>
        )}

        {/* Timeline of Fund Events */}
        <div className="pt-4 border-t border-slate-700">
          <h4 className="text-xs font-semibold text-slate-400 mb-3">{t('trade.disputeFundManager.fundEvents')}</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400">{t('trade.disputeFundManager.eventEscrowed')}</span>
              <span className="ml-auto text-slate-500">
                {new Date(trade.created_date).toLocaleString()}
              </span>
            </div>
            
            {trade.status === 'disputed' && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-400">{t('trade.disputeFundManager.eventLocked')}</span>
                <span className="ml-auto text-slate-500">
                  {dispute?.created_date && new Date(dispute.created_date).toLocaleString()}
                </span>
              </div>
            )}
            
            {trade.status === 'completed' && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-slate-400">{t('trade.disputeFundManager.eventReleased')}</span>
                <span className="ml-auto text-slate-500">
                  {new Date(trade.updated_date).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
