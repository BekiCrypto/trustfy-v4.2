import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Shield, AlertTriangle, Scale, Globe, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TermsModal({ open, onOpenChange }) {
  const { t } = useTranslation();

  const getArray = (key) => {
    const res = t(key, { returnObjects: true });
    return Array.isArray(res) ? res : [];
  };

  const eligibilityItems = getArray('landing.terms.sections.eligibility.items');
  const nonCustodialItems = getArray('landing.terms.sections.nonCustodial.items');
  const walletItems = getArray('landing.terms.sections.wallet.items');
  const platformRoleItems = getArray('landing.terms.sections.platformRole.items');
  const escrowProcessItems = getArray('landing.terms.sections.escrowProcess.items');
  const bondItems = getArray('landing.terms.sections.bonds.items');
  const disputeItems = getArray('landing.terms.sections.disputes.items');
  const pricingItems = getArray('landing.terms.sections.pricing.items');
  const responsibilityItems = getArray('landing.terms.sections.responsibilities.items');
  const prohibitedItems = getArray('landing.terms.sections.prohibited.items');
  const risksItems = getArray('landing.terms.sections.risks.items');
  const warrantiesItems = getArray('landing.terms.sections.warranties.items');
  const liabilityItems = getArray('landing.terms.sections.liability.items');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            {t('landing.terms.title')}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {t('landing.terms.effectiveDate')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                {t('landing.terms.sections.intro.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.intro.body')}</p>
                <p className="text-blue-300 font-medium">{t('landing.terms.sections.intro.note')}</p>
              </div>
            </Card>

            {/* Eligibility */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.eligibility.title')}</h3>
              <div className="text-slate-300 text-sm space-y-1">
                <p>{t('landing.terms.sections.eligibility.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {eligibilityItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Non-Custodial */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                {t('landing.terms.sections.nonCustodial.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-emerald-300 font-medium">
                  {t('landing.terms.sections.nonCustodial.lead')}
                </p>
                <p>{t('landing.terms.sections.nonCustodial.sublead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {nonCustodialItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-slate-400 text-xs mt-2">
                  {t('landing.terms.sections.nonCustodial.note')}
                </p>
              </div>
            </Card>

            {/* Wallet Connections */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.wallet.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.wallet.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {walletItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-red-300 text-xs mt-2">
                  {t('landing.terms.sections.wallet.note')}
                </p>
              </div>
            </Card>

            {/* Platform Role */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.platformRole.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.platformRole.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {platformRoleItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-blue-300 font-medium mt-2">
                  {t('landing.terms.sections.platformRole.note')}
                </p>
              </div>
            </Card>

            {/* Escrow Process */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.escrowProcess.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.escrowProcess.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {escrowProcessItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Bond System */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                {t('landing.terms.sections.bonds.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.bonds.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {bondItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-purple-300 font-medium mt-2">
                  {t('landing.terms.sections.bonds.note')}
                </p>
              </div>
            </Card>

            {/* Dispute Resolution */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                {t('landing.terms.sections.disputes.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.disputes.lead')}</p>
                <p className="text-amber-300 mt-2">{t('landing.terms.sections.disputes.sublead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {disputeItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Pricing */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.pricing.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.pricing.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {pricingItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 mt-2">
                  {t('landing.terms.sections.pricing.note')}
                </p>
              </div>
            </Card>

            {/* User Responsibilities */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.responsibilities.title')}</h3>
              <div className="text-slate-300 text-sm">
                <p className="mb-2">{t('landing.terms.sections.responsibilities.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {responsibilityItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Prohibited Activities */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                {t('landing.terms.sections.prohibited.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p className="mb-2">{t('landing.terms.sections.prohibited.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {prohibitedItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Risks */}
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                {t('landing.terms.sections.risks.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-red-300 font-medium">{t('landing.terms.sections.risks.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {risksItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-red-300 font-medium mt-2">{t('landing.terms.sections.risks.note')}</p>
              </div>
            </Card>

            {/* Geographic */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                {t('landing.terms.sections.geography.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p>{t('landing.terms.sections.geography.body')}</p>
              </div>
            </Card>

            {/* Privacy */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.privacy.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.privacy.body')}</p>
                <p className="text-blue-300 font-medium">{t('landing.terms.sections.privacy.note')}</p>
              </div>
            </Card>

            {/* No Warranties */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.warranties.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.warranties.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {warrantiesItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Liability */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.liability.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.terms.sections.liability.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {liabilityItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-red-300 font-medium mt-2">
                  {t('landing.terms.sections.liability.note')}
                </p>
              </div>
            </Card>

            {/* Modifications */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.modifications.title')}</h3>
              <div className="text-slate-300 text-sm">
                <p>{t('landing.terms.sections.modifications.body')}</p>
              </div>
            </Card>

            {/* Contact */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.terms.sections.contact.title')}</h3>
              <div className="text-slate-300 text-sm">
                <p className="mb-2">{t('landing.terms.sections.contact.body')}</p>
                <p className="text-red-300 text-xs">{t('landing.terms.sections.contact.note')}</p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('landing.terms.footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
