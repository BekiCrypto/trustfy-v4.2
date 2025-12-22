import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2, CheckCircle, Image as ImageIcon, Link2, FileText, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useWalletGuard } from "@/components/web3/useWalletGuard";
import { useTranslation } from 'react-i18next';

export default function PaymentConfirmationModal({ open, onOpenChange, trade, onConfirm, effectiveStatus, buyerConfirmRemaining }) {
  const { t } = useTranslation();
  const { ensureWallet, authModal } = useWalletGuard();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    screenshots: [],
    invoiceLink: '',
    transactionId: '',
    notes: ''
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setFormData(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, ...urls]
      }));
      
      toast.success(t('trade.paymentConfirmation.toast.filesUploaded', { count: files.length }));
    } catch (error) {
      toast.error(t('trade.paymentConfirmation.toast.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (index) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!ensureWallet()) return;
    if (effectiveStatus && effectiveStatus !== 'funded') {
      toast.error('Payment confirmation is only available after escrow is FUNDED.');
      return;
    }
    if (buyerConfirmRemaining === 0) {
      toast.error('Payment confirmation window expired.');
      return;
    }
    if (formData.screenshots.length === 0 && !formData.invoiceLink) {
      toast.error(t('trade.paymentConfirmation.toast.evidenceRequired'));
      return;
    }

    // Store payment evidence in trade metadata or create a ChatMessage
    const evidenceMessage = t('trade.paymentConfirmation.evidenceMessage', {
      transactionId: formData.transactionId || t('trade.paymentConfirmation.notAvailable'),
      invoiceLink: formData.invoiceLink || t('trade.paymentConfirmation.notAvailable'),
      notes: formData.notes || t('trade.paymentConfirmation.notAvailable'),
      screenshots: formData.screenshots.length
    });

    try {
      // Create a system message with evidence
      await base44.entities.ChatMessage.create({
        trade_id: trade.id,
        sender_address: trade.buyer_address,
        content: evidenceMessage,
        message_type: 'system',
        file_url: formData.screenshots[0] // Store first screenshot URL
      });

      // Also store all evidence URLs in metadata
      await base44.entities.Trade.update(trade.id, {
        payment_evidence: {
          screenshots: formData.screenshots,
          invoiceLink: formData.invoiceLink,
          transactionId: formData.transactionId,
          notes: formData.notes,
          submittedAt: new Date().toISOString()
        }
      });

      onConfirm();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        screenshots: [],
        invoiceLink: '',
        transactionId: '',
        notes: ''
      });
    } catch (error) {
      toast.error(t('trade.paymentConfirmation.toast.submitFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('trade.paymentConfirmation.title')}</DialogTitle>
          <p className="text-sm text-slate-400 mt-2">{t('trade.paymentConfirmation.subtitle')}</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* DisputeBond Notice */}
          <Card className="bg-purple-500/10 border-purple-500/30 p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-400 text-sm mb-1">
                  DisputeBond Status
                </p>
                <p className="text-slate-300 text-xs mb-2">
                  The buyer DisputeBond is locked when the Ad is taken. Confirming payment updates the on-chain state only.
                </p>
                <p className="text-white font-bold text-sm">
                  Payment confirmation window applies.
                </p>
                {buyerConfirmRemaining !== undefined && buyerConfirmRemaining !== null && (
                  <p className="text-xs text-slate-300 mt-2">
                    Time remaining: {Math.max(0, Math.floor(buyerConfirmRemaining / 3600))}h{' '}
                    {Math.max(0, Math.floor((buyerConfirmRemaining % 3600) / 60))}m
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  ✓ Confirm only after you have sent fiat<br />
                  ✓ Evidence helps arbitration if a dispute occurs<br />
                  ⚠️ Missing the deadline may forfeit the buyer DisputeBond to Treasury
                </p>
              </div>
            </div>
          </Card>
          
          {/* Payment Amount Summary */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{t('trade.paymentConfirmation.fiatAmountLabel')}</p>
                <p className="text-lg font-bold text-white">
                  {trade.fiat_currency} {trade.total_fiat_amount?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">{t('trade.paymentConfirmation.paymentMethodLabel')}</p>
                <p className="text-sm text-white">
                  {trade.payment_methods?.[0]?.split(':')[0] || t('trade.paymentConfirmation.notAvailable')}
                </p>
              </div>
            </div>
          </Card>

          {/* Upload Screenshots */}
          <div>
            <Label className="text-base mb-3 block font-semibold text-white">
              {t('trade.paymentConfirmation.screenshotLabel')}{' '}
              <span className="text-xs text-slate-400 font-normal ml-2">
                {t('trade.paymentConfirmation.screenshotHint')}
              </span>
            </Label>
            
            <div className="space-y-3">
              {formData.screenshots.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.screenshots.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-700"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-2 right-2 h-6 w-6 bg-red-500/80 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <div className="flex flex-col items-center justify-center py-4">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                  )}
                  <p className="text-sm text-slate-400">
                    {uploading ? t('trade.paymentConfirmation.uploading') : t('trade.paymentConfirmation.uploadCta')}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{t('trade.paymentConfirmation.uploadTypes')}</p>
                </div>
              </label>
            </div>
          </div>

          {/* Invoice/Receipt Link */}
          <div>
            <Label className="text-base mb-3 block font-semibold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              {t('trade.paymentConfirmation.invoiceLinkLabel')}
              <span className="text-xs text-slate-400 font-normal">{t('trade.paymentConfirmation.invoiceLinkHint')}</span>
            </Label>
            <Input
              placeholder={t('trade.paymentConfirmation.invoicePlaceholder')}
              value={formData.invoiceLink}
              onChange={(e) => setFormData({ ...formData, invoiceLink: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500 mt-2">
              {t('trade.paymentConfirmation.invoiceHelp')}
            </p>
          </div>

          {/* Transaction ID */}
          <div>
            <Label className="text-base mb-3 block font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('trade.paymentConfirmation.transactionIdLabel')}
              <span className="text-xs text-slate-400 font-normal">{t('trade.paymentConfirmation.transactionIdHint')}</span>
            </Label>
            <Input
              placeholder={t('trade.paymentConfirmation.transactionIdPlaceholder')}
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <Label className="text-base mb-3 block font-semibold text-white">
              {t('trade.paymentConfirmation.notesLabel')}
              <span className="text-xs text-slate-400 font-normal ml-2">{t('trade.paymentConfirmation.notesHint')}</span>
            </Label>
            <Textarea
              placeholder={t('trade.paymentConfirmation.notesPlaceholder')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white min-h-[100px]"
            />
          </div>

          {/* Info Boxes */}
          <Card className="bg-blue-500/10 border-blue-500/30 p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-blue-400 mb-1">{t('trade.paymentConfirmation.proofTitle')}</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>• {t('trade.paymentConfirmation.proofBullet1')}</li>
                  <li>• {t('trade.paymentConfirmation.proofBullet2')}</li>
                  <li>• {t('trade.paymentConfirmation.proofBullet3')}</li>
                  <li>• {t('trade.paymentConfirmation.proofBullet4')}</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <Card className="bg-amber-500/10 border-amber-500/30 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
              <strong>{t('trade.paymentConfirmation.warningTitle')}</strong>{' '}
              {t('trade.paymentConfirmation.warningText')}
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {t('trade.paymentConfirmation.actionConfirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
      {authModal}
    </Dialog>
  );
}
