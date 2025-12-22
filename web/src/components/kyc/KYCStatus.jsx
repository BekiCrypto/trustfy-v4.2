import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, XCircle, Shield } from "lucide-react";

export default function KYCStatus({ kycStatus, onStartKYC }) {
  const { t } = useTranslation();
  
  const statusConfig = {
    none: {
      icon: Shield,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      titleKey: 'kyc.notVerified',
      descriptionKey: 'kyc.subtitle',
      actionLabelKey: 'kyc.startVerification',
      actionVariant: 'default'
    },
    pending: {
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      titleKey: 'kyc.verificationPending',
      descriptionKey: 'kyc.subtitle',
      actionLabelKey: 'common.viewDetails',
      actionVariant: 'outline'
    },
    verified: {
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      titleKey: 'kyc.verificationApproved',
      descriptionKey: 'kyc.verificationApproved',
      actionLabelKey: null,
      actionVariant: null
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      titleKey: 'kyc.verificationRejected',
      descriptionKey: 'kyc.verificationRejected',
      actionLabelKey: 'kyc.resubmit',
      actionVariant: 'destructive'
    }
  };

  const config = statusConfig[kycStatus] || statusConfig.none;
  const Icon = config.icon;

  return (
    <Card className={`${config.bg} border ${config.border} p-6`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${config.bg} border ${config.border}`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${config.color} mb-1`}>{t(config.titleKey)}</h3>
          <p className="text-slate-400 text-sm mb-3">{t(config.descriptionKey)}</p>
          
          {/* Trade Limit Info */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                {kycStatus === 'verified' ? (
                  <>
                    <p className="text-slate-300 font-medium mb-1">✓ Unlimited Trading</p>
                    <p className="text-slate-500">Trade any amount per ad with KYC verification</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-300 font-medium mb-1">Trade Limit: $10,000 per ad</p>
                    <p className="text-slate-500">Verify KYC to unlock higher limits (up to $500k per ad)</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {config.actionLabelKey && (
            <Button
              onClick={onStartKYC}
              variant={config.actionVariant}
              className={config.actionVariant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {t(config.actionLabelKey)}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}