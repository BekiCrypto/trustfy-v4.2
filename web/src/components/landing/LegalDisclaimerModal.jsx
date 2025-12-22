import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, AlertTriangle, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LegalDisclaimerModal({ open, onOpenChange }) {
  const { t } = useTranslation();

  const sections = [
    {
      id: 'noFinancial',
      title: t('landing.legalDisclaimer.sections.noFinancial.title'),
      intro: t('landing.legalDisclaimer.sections.noFinancial.intro'),
      bullets: t('landing.legalDisclaimer.sections.noFinancial.bullets', { returnObjects: true }),
      note: t('landing.legalDisclaimer.sections.noFinancial.note')
    },
    {
      id: 'noCustody',
      title: t('landing.legalDisclaimer.sections.noCustody.title'),
      intro: t('landing.legalDisclaimer.sections.noCustody.intro'),
      icon: Shield,
      iconClass: 'text-emerald-400'
    },
    {
      id: 'noGuarantee',
      title: t('landing.legalDisclaimer.sections.noGuarantee.title'),
      intro: t('landing.legalDisclaimer.sections.noGuarantee.intro'),
      bullets: t('landing.legalDisclaimer.sections.noGuarantee.bullets', { returnObjects: true }),
      note: t('landing.legalDisclaimer.sections.noGuarantee.note'),
      noteClass: 'text-red-300'
    },
    {
      id: 'smartContractRisks',
      title: t('landing.legalDisclaimer.sections.smartContractRisks.title'),
      intro: t('landing.legalDisclaimer.sections.smartContractRisks.intro'),
      bullets: t('landing.legalDisclaimer.sections.smartContractRisks.bullets', { returnObjects: true }),
      note: t('landing.legalDisclaimer.sections.smartContractRisks.note'),
      tone: 'danger'
    },
    {
      id: 'userDecisions',
      title: t('landing.legalDisclaimer.sections.userDecisions.title'),
      intro: t('landing.legalDisclaimer.sections.userDecisions.intro'),
      bullets: t('landing.legalDisclaimer.sections.userDecisions.bullets', { returnObjects: true }),
      note: t('landing.legalDisclaimer.sections.userDecisions.note'),
      noteClass: 'text-amber-300'
    },
    {
      id: 'walletRisks',
      title: t('landing.legalDisclaimer.sections.walletRisks.title'),
      intro: t('landing.legalDisclaimer.sections.walletRisks.intro'),
      bullets: t('landing.legalDisclaimer.sections.walletRisks.bullets', { returnObjects: true }),
      note: t('landing.legalDisclaimer.sections.walletRisks.note'),
      noteClass: 'text-slate-400 text-xs'
    },
    {
      id: 'regulatory',
      title: t('landing.legalDisclaimer.sections.regulatory.title'),
      intro: t('landing.legalDisclaimer.sections.regulatory.intro'),
      bullets: t('landing.legalDisclaimer.sections.regulatory.bullets', { returnObjects: true }),
      note: t('landing.legalDisclaimer.sections.regulatory.note'),
      noteClass: 'text-slate-400 text-xs'
    },
    {
      id: 'thirdParty',
      title: t('landing.legalDisclaimer.sections.thirdParty.title'),
      intro: t('landing.legalDisclaimer.sections.thirdParty.intro')
    },
    {
      id: 'availability',
      title: t('landing.legalDisclaimer.sections.availability.title'),
      intro: t('landing.legalDisclaimer.sections.availability.intro')
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Scale className="w-6 h-6 text-amber-400" />
            {t('landing.legalDisclaimer.title')}
          </DialogTitle>
          <p className="text-slate-400 text-sm">{t('landing.legalDisclaimer.subtitle')}</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300 text-sm">
                {t('landing.legalDisclaimer.alert')}
              </AlertDescription>
            </Alert>

            {sections.map((section) => {
              const cardClass =
                section.id === 'smartContractRisks'
                  ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30'
                  : 'bg-slate-800/50 border-slate-700';

              return (
                <Card key={section.id} className={`${cardClass} p-5`}>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {section.icon && <section.icon className={`w-5 h-5 ${section.iconClass || ''}`} />}
                    {section.title}
                  </h3>
                  <div className="text-slate-300 text-sm space-y-2">
                    {section.intro && <p>{section.intro}</p>}
                    {section.bullets && (
                      <ul className="space-y-1 text-slate-300 text-sm ml-4">
                        {section.bullets.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    )}
                    {section.note && (
                      <p className={`${section.noteClass || 'text-blue-300 font-medium'} mt-3`}>{section.note}</p>
                    )}
                  </div>
                </Card>
              );
            })}

            {/* Final Note */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 text-center">
                {t('landing.legalDisclaimer.finalNote.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2 text-center">
                <p>{t('landing.legalDisclaimer.finalNote.line1')}</p>
                <p>{t('landing.legalDisclaimer.finalNote.line2')}</p>
                <p className="text-blue-300 font-medium">
                  {t('landing.legalDisclaimer.finalNote.line3')}
                </p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('landing.legalDisclaimer.footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
