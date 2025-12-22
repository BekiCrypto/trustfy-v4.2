import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Link2,
  Eye,
  X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import WalletAddress from "../common/WalletAddress";
import ChainBadge from "../common/ChainBadge";
import ConfirmDialog from "../common/ConfirmDialog";

export default function OfferCard({ offer, index, onViewMatches, onAcceptOffer, showCancel = false, isMyOffer = false, matchCount }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const isBuyOrder = offer.offer_type === 'buy';
  const remaining = offer.amount - (offer.filled_amount || 0);
  const fillPercentage = ((offer.filled_amount || 0) / offer.amount) * 100;
  
  const cancelOffer = useMutation({
    mutationFn: async () => {
      console.log('Cancelling offer:', offer.id);
      const result = await base44.entities.TradeOffer.update(offer.id, {
        status: 'cancelled'
      });
      console.log('Cancel result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      queryClient.invalidateQueries({ queryKey: ['trade-offers'] });
      queryClient.invalidateQueries({ queryKey: ['all-offers'] });
      toast.success('✓ Ad cancelled and removed from marketplace');
      setShowCancelDialog(false);
    },
    onError: (error) => {
      console.error('Cancel error:', error);
      toast.error(`Failed to cancel: ${error?.message || 'Unknown error'}`);
      setShowCancelDialog(false);
    }
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl p-5 hover:border-slate-600/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {isBuyOrder ? (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
            )}
            <div>
              <p className={`font-semibold ${isBuyOrder ? 'text-emerald-400' : 'text-red-400'}`}>
                {isBuyOrder ? 'BUY' : 'SELL'}
              </p>
              <p className="text-xs text-slate-500">{t('cards.offer.order')}</p>
            </div>
          </div>
          
          <ChainBadge chain={offer.chain} />
        </div>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-white">{remaining.toLocaleString()}</span>
            <span className="text-slate-400">{offer.token_symbol}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">@</span>
            <span className="text-white font-semibold">{offer.fiat_currency || 'USD'} {offer.price_per_unit}</span>
            <span className="text-slate-500">{t('cards.offer.perUnit')}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('cards.offer.total')}: {offer.fiat_currency || 'USD'} {offer.total_value?.toLocaleString()}
          </p>
        </div>
        
        {fillPercentage > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{t('cards.offer.filled')}</span>
              <span>{fillPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('cards.offer.creator')}:</span>
            <WalletAddress address={offer.creator_address} />
          </div>
          
          {offer.expires_at && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{t('cards.offer.expires')}:</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(offer.expires_at), "MMM d, HH:mm")}
              </span>
            </div>
          )}
          
          {offer.payment_methods && offer.payment_methods.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>{t('cards.offer.payment')}:</span>
              <span className="text-slate-300">{offer.payment_methods[0]?.split(':')[0]}</span>
              {offer.payment_methods.length > 1 && (
                <span className="text-slate-500">+{offer.payment_methods.length - 1}</span>
              )}
            </div>
          )}
          
          {offer.requirements?.min_reputation > 0 && (
            <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
              {t('cards.offer.minRep')}: {offer.requirements.min_reputation}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          {isMyOffer ? (
            <>
              <Button
                onClick={() => onViewMatches(offer)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                {matchCount !== undefined ? `${matchCount} Matches` : t('cards.offer.viewMatches')}
              </Button>
              
              {showCancel && offer.status === 'open' && (
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={cancelOffer.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={() => onAcceptOffer?.(offer)}
              className={`flex-1 ${isBuyOrder ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              size="sm"
              disabled={remaining <= 0}
            >
              {remaining <= 0 ? (
                'Fully Filled'
              ) : isBuyOrder ? (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t('common.sell')} {offer.token_symbol}
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 mr-2" />
                  {t('common.buy')} {offer.token_symbol}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
      
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={() => {
          console.log('Confirm clicked, mutating...');
          cancelOffer.mutate();
        }}
        title="Cancel Offer?"
        description={`Are you sure you want to cancel this ${offer.offer_type} offer for ${offer.amount} ${offer.token_symbol}? This action cannot be undone.`}
        confirmText={cancelOffer.isPending ? "Cancelling..." : "Yes, Cancel Offer"}
        cancelText="No, Keep It"
        variant="destructive"
      />
    </motion.div>
  );
}