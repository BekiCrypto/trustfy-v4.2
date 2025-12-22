import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Shield, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ComplianceModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const neutralItems = t('landing.compliance.neutral.items', { returnObjects: true });
  const platformRoles = t('landing.compliance.platformRole.items', { returnObjects: true });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-400" />
            {t('landing.compliance.title')}
          </DialogTitle>
          <p className="text-slate-400 text-sm">{t('landing.compliance.subtitle')}</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                {t('landing.compliance.intro')}
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                {t('landing.compliance.neutral.title')}
              </h3>
              <div className="space-y-3">
                {neutralItems.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-slate-300 text-sm">
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.compliance.commitment.title')}</h3>
              <p className="text-slate-300 text-sm mb-4">
                {t('landing.compliance.commitment.body')}
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.compliance.platformRole.title')}</h3>
              <p className="text-slate-300 text-sm mb-3">{t('landing.compliance.platformRole.subtitle')}</p>
              <ul className="space-y-2 text-slate-300 text-sm">
                {platformRoles.map((item, index) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.compliance.control.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-emerald-300 font-medium">{t('landing.compliance.control.line1')}</p>
                <p className="text-emerald-300 font-medium">{t('landing.compliance.control.line2')}</p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('landing.compliance.footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
