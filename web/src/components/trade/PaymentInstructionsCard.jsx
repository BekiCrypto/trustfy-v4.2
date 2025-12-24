import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  CreditCard,
  Clock,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from '@/hooks/useTranslation';

/**
 * PaymentInstructionsCard - Shows clear payment instructions for buyer
 * Displays amount, payment methods, and instructions
 */
export default function PaymentInstructionsCard({ trade, onPaymentSubmit }) {
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t('trade.paymentInstructions.toastCopied'));
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Parse payment methods (format: "Method: Details" or just "Method")
  const parsedPaymentMethods = (trade.payment_methods || []).map(method => {
    const parts = method.split(':');
    return {
      method: parts[0].trim(),
      details: parts[1]?.trim() || null
    };
  });

  const timeRemaining = trade.expires_at 
    ? Math.max(0, Math.floor((new Date(trade.expires_at) - new Date()) / (1000 * 60))) 
    : 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <CreditCard className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{t('trade.paymentInstructions.title')}</h3>
          <p className="text-slate-400 text-xs">{t('trade.paymentInstructions.subtitle')}</p>
        </div>
      </div>

      {/* Time Warning */}
      {timeRemaining < 60 && timeRemaining > 0 && (
        <Alert className="mb-4 bg-red-500/10 border-red-500/30">
          <Clock className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300 text-sm">
            <strong>{t('trade.paymentInstructions.hurry')}</strong>{' '}
            {t('trade.paymentInstructions.onlyMinutes', { minutes: timeRemaining })}
          </AlertDescription>
        </Alert>
      )}

      {/* Amount to Pay */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 mb-6">
        <p className="text-sm text-blue-400 mb-2">{t('trade.paymentInstructions.totalAmountLabel')}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {trade.fiat_currency} {trade.total_fiat_amount?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(trade.total_fiat_amount?.toFixed(2), 'amount')}
            className="text-blue-400 hover:text-blue-300"
          >
            {copiedField === 'amount' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {t('trade.paymentInstructions.amountNote')}
        </p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">{t('trade.paymentInstructions.paymentMethodsTitle')}</p>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {t('trade.paymentInstructions.availableCount', { count: parsedPaymentMethods.length })}
          </Badge>
        </div>

        {parsedPaymentMethods.length > 0 ? (
          <div className="space-y-3">
            {parsedPaymentMethods.map((pm, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{pm.method}</span>
                  {pm.details && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(pm.details, `method-${idx}`)}
                      className="text-blue-400 hover:text-blue-300 h-7 px-2"
                    >
                      {copiedField === `method-${idx}` ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
                {pm.details && (
                  <p className="text-sm text-slate-300 font-mono bg-slate-900/50 px-2 py-1 rounded">
                    {pm.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 text-sm">
              {t('trade.paymentInstructions.noPaymentDetails')}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-white">{t('trade.paymentInstructions.stepsTitle')}</p>
        <ol className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
            <span>{t('trade.paymentInstructions.step1')}</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
            <span>{t('trade.paymentInstructions.step2')}</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
            <span>{t('trade.paymentInstructions.step3')}</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">4</span>
            <span>{t('trade.paymentInstructions.step4')}</span>
          </li>
        </ol>
      </div>

      {/* Escrow Terms */}
      {trade.terms && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 mb-6">
          <p className="text-xs text-slate-500 mb-1">{t('trade.paymentInstructions.escrowTermsTitle')}</p>
          <p className="text-sm text-slate-300">{trade.terms}</p>
        </div>
      )}

      {/* Important Notice */}
      <Alert className="bg-purple-500/10 border-purple-500/30">
        <Shield className="h-4 w-4 text-purple-400" />
        <AlertDescription className="text-purple-300 text-sm">
          <strong>{t('trade.paymentInstructions.importantTitle')}</strong>{' '}
          {t('trade.paymentInstructions.importantDesc')}
        </AlertDescription>
      </Alert>

      {/* Action Button */}
      {onPaymentSubmit && (
        <Button
          onClick={onPaymentSubmit}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {t('trade.paymentInstructions.actionButton')}
        </Button>
      )}
    </Card>
  );
}
