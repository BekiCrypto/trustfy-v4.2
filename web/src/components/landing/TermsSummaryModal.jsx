import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Shield, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TermsSummaryModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const sections = t('landing.termsSummary.sections', { returnObjects: true });
  const iconMap = {
    control: CheckCircle2,
    wallet: Lock,
    rules: Shield,
    prohibited: AlertTriangle,
    risks: AlertTriangle
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            {t('landing.termsSummary.title')}
          </DialogTitle>
          <p className="text-slate-400 text-sm">{t('landing.termsSummary.subtitle')}</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <FileText className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300 text-sm">
                {t('landing.termsSummary.alert')}
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {sections.map((section) => {
                const Icon = iconMap[section.id];
                const cardClass =
                  section.id === 'prohibited'
                    ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30'
                    : 'bg-slate-800/50 border-slate-700';

                return (
                  <Card key={section.id} className={`${cardClass} p-5`}>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      {Icon && (
                        <Icon
                          className={`w-5 h-5 ${section.id === 'prohibited' ? 'text-red-400' : section.id === 'risks' ? 'text-amber-400' : section.id === 'control' ? 'text-emerald-400' : section.id === 'wallet' ? 'text-blue-400' : 'text-purple-400'}`}
                        />
                      )}
                      {section.title}
                    </h3>
                    <div className="text-slate-300 text-sm space-y-2">
                      {section.body && <p>{section.body}</p>}
                      {section.bullets && (
                        <ul className={`${section.ordered ? 'list-decimal' : 'list-disc'} list-inside ml-2 space-y-1`}>
                          {section.bullets.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {section.note && <p className="text-amber-300">{section.note}</p>}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('landing.termsSummary.footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
