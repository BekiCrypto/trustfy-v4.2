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

export default function PaymentConfirmationModal({ open, onOpenChange, trade, onConfirm }) {
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
      
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload files');
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
    if (formData.screenshots.length === 0 && !formData.invoiceLink) {
      toast.error('Please upload at least one screenshot or provide an invoice link');
      return;
    }

    // Store payment evidence in trade metadata or create a ChatMessage
    const evidenceMessage = `Payment Confirmation:\n\nTransaction ID: ${formData.transactionId || 'N/A'}\nInvoice/Receipt Link: ${formData.invoiceLink || 'N/A'}\nNotes: ${formData.notes || 'N/A'}\n\nScreenshots: ${formData.screenshots.length} attached`;

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
      toast.error('Failed to submit payment evidence');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Fiat Payment & Lock Buyer Bond</DialogTitle>
          <p className="text-sm text-slate-400 mt-2">
            This will lock your dispute bond on-chain and mark payment as sent
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Bond Warning */}
          <Card className="bg-purple-500/10 border-purple-500/30 p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-400 text-sm mb-1">Buyer Bond Required</p>
                <p className="text-slate-300 text-xs mb-2">
                  You'll lock a refundable bond equal to the seller's bond. This ensures both parties are committed to honest trade execution.
                </p>
                <p className="text-white font-bold text-sm">
                  Bond Amount: <span className="text-purple-400">Calculated from trade amount</span>
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  ✓ Refunded on successful trade completion<br />
                  ✓ Refunded if you win a dispute<br />
                  ⚠️ Forfeited only if you lose a dispute
                </p>
              </div>
            </div>
          </Card>
          
          {/* Payment Amount Summary */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Fiat Payment Amount</p>
                <p className="text-lg font-bold text-white">
                  {trade.fiat_currency} {trade.total_fiat_amount?.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Payment Method</p>
                <p className="text-sm text-white">
                  {trade.payment_methods?.[0]?.split(':')[0] || 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          {/* Upload Screenshots */}
          <div>
            <Label className="text-base mb-3 block font-semibold text-white">
              Screenshot *
              <span className="text-xs text-slate-400 font-normal ml-2">(Upload payment receipt/confirmation)</span>
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
                    {uploading ? 'Uploading...' : 'Click to upload screenshots'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </label>
            </div>
          </div>

          {/* Invoice/Receipt Link */}
          <div>
            <Label className="text-base mb-3 block font-semibold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Transaction Confirmation Web Link
              <span className="text-xs text-slate-400 font-normal">(Optional but highly recommended)</span>
            </Label>
            <Input
              placeholder="e.g., https://transactioninfo.ethiotelecom.et/receipt/CL78Q9HXO4"
              value={formData.invoiceLink}
              onChange={(e) => setFormData({ ...formData, invoiceLink: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500 mt-2">
              Providing a verifiable link with QR/barcode makes dispute resolution much faster and easier
            </p>
          </div>

          {/* Transaction ID */}
          <div>
            <Label className="text-base mb-3 block font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transaction ID / Reference Number
              <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Input
              placeholder="Enter your transaction reference number"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <Label className="text-base mb-3 block font-semibold text-white">
              Additional Notes
              <span className="text-xs text-slate-400 font-normal ml-2">(Optional)</span>
            </Label>
            <Textarea
              placeholder="Any additional information about the payment..."
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
                <p className="font-medium text-blue-400 mb-1">Why provide proof of payment?</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>• Helps seller verify payment quickly</li>
                  <li>• Critical evidence if dispute occurs</li>
                  <li>• Links with QR/barcodes can be auto-verified</li>
                  <li>• Protects your locked bond from false claims</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <Card className="bg-amber-500/10 border-amber-500/30 p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                <strong>Important:</strong> Your buyer bond will be locked on-chain after submission. 
                Make absolutely sure you've sent the fiat payment before proceeding.
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
              Cancel
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
              Lock Bond & Confirm Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}