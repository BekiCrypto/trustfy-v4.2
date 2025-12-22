import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function KYCPolicyModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const publicAccessItems = t('landing.kyc.sections.walletAccess.public.items', { returnObjects: true });
  const transactionItems = t('landing.kyc.sections.walletAccess.transaction.items', { returnObjects: true });
  const autonomyItems = t('landing.kyc.sections.whyWalletOnly.items', { returnObjects: true });
  const dataProtectionItems = t('landing.kyc.sections.dataProtection.items', { returnObjects: true });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            {t('landing.kyc.title')}
          </DialogTitle>
          <p className="text-slate-400 text-sm">{t('landing.kyc.subtitle')}</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                {t('landing.kyc.hero.body')}
              </p>
              <p className="text-blue-300 text-sm leading-relaxed mt-3">
                {t('landing.kyc.hero.note')}
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                {t('landing.kyc.sections.walletAccess.title')}
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="text-white font-semibold mb-2">{t('landing.kyc.sections.walletAccess.public.title')}</h4>
                  <p className="text-slate-300 text-sm mb-2">{t('landing.kyc.sections.walletAccess.public.lead')}</p>
                  <ul className="space-y-1 text-slate-300 text-sm ml-4">
                    {publicAccessItems.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="text-white font-semibold mb-2">{t('landing.kyc.sections.walletAccess.transaction.title')}</h4>
                  <p className="text-slate-300 text-sm mb-2">{t('landing.kyc.sections.walletAccess.transaction.lead')}</p>
                  <ul className="space-y-1 text-slate-300 text-sm ml-4">
                    {transactionItems.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <p className="text-blue-300 font-medium text-sm mt-2">
                    {t('landing.kyc.sections.walletAccess.transaction.note')}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.kyc.sections.identity.title')}</h3>
              <p className="text-slate-300 text-sm mb-3">{t('landing.kyc.sections.identity.body')}</p>
              <p className="text-blue-300 text-sm">{t('landing.kyc.sections.identity.note')}</p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.kyc.sections.whyWalletOnly.title')}</h3>
              <p className="text-slate-300 text-sm mb-3">{t('landing.kyc.sections.whyWalletOnly.lead')}</p>
              <ul className="space-y-2 text-slate-300 text-sm">
                {autonomyItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-blue-300 text-sm mt-3 font-medium">
                {t('landing.kyc.sections.whyWalletOnly.note')}
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.kyc.sections.autonomy.title')}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t('landing.kyc.sections.autonomy.body')}
              </p>
              <p className="text-emerald-300 text-sm mt-2 font-medium">
                {t('landing.kyc.sections.autonomy.note')}
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.kyc.sections.dataProtection.title')}</h3>
              <p className="text-slate-300 text-sm mb-3">{t('landing.kyc.sections.dataProtection.lead')}</p>
              <ul className="space-y-1 text-slate-300 text-sm ml-4">
                {dataProtectionItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.kyc.sections.responsibility.title')}</h3>
              <p className="text-slate-300 text-sm">{t('landing.kyc.sections.responsibility.body')}</p>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30 p-5">
              <div className="text-center space-y-3">
                <p className="text-lg font-semibold text-white">{t('landing.kyc.closing.title')}</p>
                <p className="text-slate-300 text-sm">{t('landing.kyc.closing.body')}</p>
                <p className="text-emerald-300 font-medium">{t('landing.kyc.closing.note')}</p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('landing.kyc.footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
