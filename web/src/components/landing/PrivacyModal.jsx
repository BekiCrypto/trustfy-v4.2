import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Eye, Lock, AlertTriangle, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PrivacyModal({ open, onOpenChange }) {
  const { t } = useTranslation();

  const getArray = (key) => {
    const res = t(key, { returnObjects: true });
    return Array.isArray(res) ? res : [];
  };

  const noCollectItems = getArray('landing.privacy.sections.privacyDefaults.noCollect');
  const optionalItems = getArray('landing.privacy.sections.privacyDefaults.optional');
  const infoReceiveItems = getArray('landing.privacy.sections.infoReceive.items');
  const cookiesItems = getArray('landing.privacy.sections.cookies.items');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            {t('landing.privacy.title')}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {t('landing.privacy.effectiveDate')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                {t('landing.privacy.sections.intro.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.privacy.sections.intro.body')}</p>
                <p className="text-blue-300 font-medium">{t('landing.privacy.sections.intro.highlight')}</p>
              </div>
            </Card>

            {/* Privacy Model */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                {t('landing.privacy.sections.privacyDefaults.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-3">
                <p className="text-emerald-300 font-medium">
                  {t('landing.privacy.sections.privacyDefaults.lead')}
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {noCollectItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-blue-300 font-medium mt-3">
                  {t('landing.privacy.sections.privacyDefaults.optionalLead')}
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1 text-blue-200">
                  {optionalItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-slate-400 text-xs mt-2">
                  {t('landing.privacy.sections.privacyDefaults.optionalNote')}
                </p>
              </div>
            </Card>

            {/* What We May Receive */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.privacy.sections.infoReceive.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.privacy.sections.infoReceive.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {infoReceiveItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-slate-400 text-xs mt-2">
                  {t('landing.privacy.sections.infoReceive.note')}
                </p>
              </div>
            </Card>

            {/* Cookies */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.privacy.sections.cookies.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.privacy.sections.cookies.lead')}</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  {cookiesItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-blue-300 font-medium mt-2">
                  {t('landing.privacy.sections.cookies.note')}
                </p>
              </div>
            </Card>

            {/* Data Security */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                {t('landing.privacy.sections.security.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p>{t('landing.privacy.sections.security.body')}</p>
              </div>
            </Card>

            {/* Third Party */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.privacy.sections.thirdParty.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p>{t('landing.privacy.sections.thirdParty.body')}</p>
              </div>
            </Card>

            {/* Sharing */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.privacy.sections.sharing.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p className="text-emerald-300 font-medium mb-2">
                  {t('landing.privacy.sections.sharing.lead')}
                </p>
                <p>{t('landing.privacy.sections.sharing.body')}</p>
              </div>
            </Card>

            {/* Children */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.privacy.sections.children.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p>{t('landing.privacy.sections.children.body')}</p>
              </div>
            </Card>

            {/* Changes */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.privacy.sections.changes.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p>{t('landing.privacy.sections.changes.body')}</p>
              </div>
            </Card>

            {/* Contact */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.privacy.sections.contact.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p>{t('landing.privacy.sections.contact.body')}</p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('landing.privacy.footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
