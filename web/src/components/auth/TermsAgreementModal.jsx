import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, ExternalLink } from "lucide-react";

export default function TermsAgreementModal({ open, onOpenChange, onAgree, method = 'wallet' }) {
  const [accepted, setAccepted] = useState(false);

  const handleAgree = () => {
    if (accepted) {
      onAgree({
        terms_accepted: true,
        privacy_accepted: true,
        accepted_at: new Date().toISOString(),
        accepted_method: method,
        terms_version: '1.0',
        privacy_version: '1.0'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Agreement Required
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <Checkbox
              id="agreement"
              checked={accepted}
              onCheckedChange={setAccepted}
              className="mt-1"
            />
            <label htmlFor="agreement" className="text-sm text-slate-300 cursor-pointer leading-relaxed">
              I agree to Trustfy's{' '}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/docs', '_blank');
                }}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Terms & Conditions
              </button>
              {' '}and{' '}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/docs', '_blank');
                }}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Privacy Policy
              </button>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAgree}
            disabled={!accepted}
            className={`${
              accepted 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {accepted ? 'Continue' : 'Please Accept Terms'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
