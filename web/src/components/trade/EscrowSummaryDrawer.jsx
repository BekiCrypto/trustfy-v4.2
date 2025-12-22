import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Clock, 
  Shield, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import WalletAddress from "../common/WalletAddress";
import ChainBadge from "../common/ChainBadge";
import { useTranslation } from "react-i18next";

export default function EscrowSummaryDrawer({ trade, bondAmount, escrowStatus, effectiveStatus }) {
  const { t } = useTranslation();
  const status = effectiveStatus || trade.status;
  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Clock, label: t('trade.summaryDrawer.status.created') },
      funded: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Lock, label: t('trade.summaryDrawer.status.funded') },
      in_progress: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: TrendingDown, label: t('trade.summaryDrawer.status.inProgress') },
      disputed: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertCircle, label: t('trade.summaryDrawer.status.disputed') },
      completed: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2, label: t('trade.summaryDrawer.status.completed') },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: t('trade.summaryDrawer.status.cancelled') },
      refunded: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: t('trade.summaryDrawer.status.refunded') }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(status);
  const Icon = statusConfig.icon;
  const timeRemaining = trade.expires_at ? new Date(trade.expires_at) - new Date() : 0;
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
  const isExpired = timeRemaining <= 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {t('trade.summaryDrawer.title')}
          </h3>
          <p className="text-slate-400 text-xs">
            {t('trade.summaryDrawer.escrowId', { id: trade.trade_id })}
          </p>
        </div>
        <Badge className={statusConfig.color}>
          <Icon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Trade Details */}
      <div className="space-y-4">
        {/* Participants */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <p className="text-slate-400 text-xs mb-1">
              {t('trade.summaryDrawer.seller')}
            </p>
            <WalletAddress address={trade.seller_address} />
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <p className="text-slate-400 text-xs mb-1">
              {t('trade.summaryDrawer.buyer')}
            </p>
            <WalletAddress address={trade.buyer_address} />
          </div>
        </div>

        {/* Amount & Chain */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <p className="text-slate-400 text-xs mb-1">
              {t('trade.summaryDrawer.escrowAmount')}
            </p>
            <p className="text-white font-semibold">{trade.amount} {trade.token_symbol}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <p className="text-slate-400 text-xs mb-1">
              {t('trade.summaryDrawer.chain')}
            </p>
            <ChainBadge chain={trade.chain} />
          </div>
        </div>

        {/* Bonds Section */}
        {bondAmount && (
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-purple-400">
                {t('trade.summaryDrawer.disputeBonds')}
              </h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">
                  {t('trade.summaryDrawer.sellerBond')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{bondAmount} {trade.token_symbol}</span>
                  {escrowStatus?.sellerBondLocked ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">
                  {t('trade.summaryDrawer.buyerBond')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{bondAmount} {trade.token_symbol}</span>
                  {escrowStatus?.buyerBondLocked ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Note */}
        <div className="p-3 rounded-lg bg-slate-800/50">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">
              {t('trade.summaryDrawer.pricing')}
            </span>
            <span className="text-white font-medium text-sm">
              {t('trade.summaryDrawer.pricingNote')}
            </span>
          </div>
        </div>

        {/* Time Remaining */}
        {trade.expires_at && status !== 'completed' && status !== 'cancelled' && (
          <div className={`p-3 rounded-lg ${isExpired ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isExpired ? 'text-red-400' : 'text-blue-400'}`} />
                <span className={`text-sm font-medium ${isExpired ? 'text-red-400' : 'text-blue-400'}`}>
                  {isExpired ? t('trade.summaryDrawer.expired') : t('trade.summaryDrawer.timeRemaining')}
                </span>
              </div>
              <span className={`text-sm font-bold ${isExpired ? 'text-red-400' : 'text-white'}`}>
                {isExpired
                  ? t('trade.summaryDrawer.refundAvailable')
                  : t('trade.summaryDrawer.hoursRemaining', { hours: hoursRemaining })}
              </span>
            </div>
            {!isExpired && (
              <p className="text-xs text-slate-400 mt-2">
                {t('trade.summaryDrawer.expires', {
                  date: format(new Date(trade.expires_at), 'MMM d, yyyy HH:mm')
                })}
              </p>
            )}
          </div>
        )}

        {/* Total Locked */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
          <p className="text-slate-400 text-xs mb-1">
            {t('trade.summaryDrawer.totalLocked')}
          </p>
          <p className="text-2xl font-bold text-white">
            {(parseFloat(trade.amount) + 
              parseFloat(bondAmount || 0) * 2).toFixed(4)} {trade.token_symbol}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {t('trade.summaryDrawer.totalLockedNote')}
          </p>
        </div>
      </div>
    </Card>
  );
}
