import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Shield, AlertTriangle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatusBadge from "../common/StatusBadge";
import ChainBadge from "../common/ChainBadge";
import WalletAddress from "../common/WalletAddress";
import { base44 } from "@/api/base44Client";
import { useWalletGuard } from "@/components/web3/useWalletGuard";

export default function TradeCard({ trade, index = 0, effectiveStatus }) {
  const navigate = useNavigate();
  const { ensureWallet, authModal } = useWalletGuard();
  const [currentUser, setCurrentUser] = React.useState(null);
  
  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => null);
  }, []);
  
  const isSeller = currentUser?.email === trade.seller_address;
  const isBuyer = currentUser?.email === trade.buyer_address;
  const status = effectiveStatus || trade.status;
  const isExpiringSoon = trade.expires_at && 
    new Date(trade.expires_at) - new Date() < 24 * 60 * 60 * 1000;
  
  // Determine action required badge
  const getActionBadge = () => {
    if (!currentUser) return null;
    
    if (status === 'pending' && isSeller) {
      return { text: 'Fund Escrow', color: 'amber' };
    }
    if (status === 'funded' && isBuyer) {
      return { text: 'Confirm Payment', color: 'blue' };
    }
    if (status === 'in_progress' && isSeller) {
      return { text: 'Release Escrow', color: 'emerald' };
    }
    return null;
  };
  
  const actionBadge = getActionBadge();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl p-5 hover:border-slate-600/50 transition-all duration-300 group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={status} />
              <ChainBadge chain={trade.chain} />
              {trade.is_insured && (
                <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  Insured
                </div>
              )}
              {actionBadge && (
                <div className={`flex items-center gap-1 text-xs bg-${actionBadge.color}-500/10 px-2 py-0.5 rounded-full border border-${actionBadge.color}-500/30 animate-pulse`}>
                  <AlertTriangle className="w-3 h-3" />
                  <span className={`text-${actionBadge.color}-400 font-semibold`}>
                    {actionBadge.text}
                  </span>
                </div>
              )}
              {status === 'pending' && !actionBadge && (
                <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  Awaiting Seller Funding
                </div>
              )}
              {status === 'funded' && !actionBadge && (
                <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  Awaiting Buyer Confirmation
                </div>
              )}
              {status === 'in_progress' && !actionBadge && (
                <div className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  Payment Confirmed
                </div>
              )}
              {isExpiringSoon && status === 'pending' && (
                <div className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Expiring Soon
                </div>
              )}
              <button
                onClick={() =>
                  ensureWallet(() =>
                    navigate(createPageUrl(`TradeDetails?id=${trade.id}`))
                  )
                }
                className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30 hover:bg-blue-500/20 transition-all"
              >
                <MessageSquare className="w-3 h-3" />
                Chat
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-slate-500">Seller:</span>
                <WalletAddress address={trade.seller_address} />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
              <div>
                <span className="text-slate-500">Buyer:</span>
                <WalletAddress address={trade.buyer_address} />
              </div>
            </div>
            
            {trade.expires_at && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Expires: {format(new Date(trade.expires_at), "MMM d, yyyy HH:mm")}
              </div>
            )}
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {trade.amount?.toLocaleString()}
                <span className="text-base text-slate-400 ml-1">{trade.token_symbol}</span>
              </p>
              <p className="text-xs text-slate-500">Escrow amount</p>
            </div>
            
            <Button
              onClick={() => navigate(createPageUrl(`TradeDetails?id=${trade.id}`))}
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white group-hover:border-blue-500/50 transition-all"
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
        {authModal}
      </Card>
    </motion.div>
  );
}
