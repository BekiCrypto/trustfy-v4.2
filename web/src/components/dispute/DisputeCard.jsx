import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from '@/hooks/useTranslation';
import { AlertTriangle, Clock, User, FileText, ArrowRight, Shield } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatusBadge from "../common/StatusBadge";
import WalletAddress from "../common/WalletAddress";

export default function DisputeCard({ dispute, index = 0 }) {
  const { t } = useTranslation();
  
  const escalationLabels = {
    1: { label: t('cards.dispute.aiReview'), color: 'text-violet-400', bg: 'bg-violet-500/10' },
    2: { label: t('cards.dispute.humanArbitration'), color: 'text-orange-400', bg: 'bg-orange-500/10' },
    3: { label: t('cards.dispute.daoGovernance'), color: 'text-purple-400', bg: 'bg-purple-500/10' }
  };
  
  const escalation = escalationLabels[dispute.escalation_level] || escalationLabels[1];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl p-5 hover:border-red-500/30 transition-all duration-300 group">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <StatusBadge status={dispute.status} />
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${escalation.bg} ${escalation.color}`}>
                {escalation.label}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-slate-500">{t('cards.dispute.initiatedBy')}:</span>
                <WalletAddress address={dispute.initiator_address} />
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                <div>
                  <span className="text-slate-500">{t('cards.dispute.reason')}:</span>
                  <p className="text-slate-300 mt-1">{dispute.reason}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {t('cards.dispute.opened')}: {dispute.created_date && format(new Date(dispute.created_date), "MMM d, yyyy HH:mm")}
            </div>
            
            {/* Bond Warning */}
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 mt-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs">
                <Shield className="w-3 h-3" />
                <span>Both bonds at stake • Winner takes both</span>
              </div>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-4">
            {dispute.evidence_urls?.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-slate-400">{t('cards.dispute.evidence')}</p>
                <p className="text-lg font-semibold text-white">{dispute.evidence_urls.length} {t('cards.dispute.files')}</p>
              </div>
            )}
            
            <Link to={createPageUrl(`DisputeDetails?id=${dispute.id}`)}>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white group-hover:border-red-500/50 transition-all"
              >
                {t('cards.dispute.review')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}