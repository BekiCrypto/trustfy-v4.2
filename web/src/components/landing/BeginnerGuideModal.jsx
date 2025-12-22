
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, Shield, Lock, Users, CheckCircle2, AlertTriangle, Wallet, Rocket, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function BeginnerGuideModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const accessNeeds = t('landing.beginner.access.option1.needs', { returnObjects: true });
  const accessNoNeed = t('landing.beginner.access.option1.noNeed', { returnObjects: true });
  const accessSteps = t('landing.beginner.access.option1.steps', { returnObjects: true });
  const accessCanDo = t('landing.beginner.access.option1.canDo', { returnObjects: true });
  const readySteps = t('landing.beginner.access.ready.steps', { returnObjects: true });
  const escrowSteps = t('landing.beginner.escrow.steps', { returnObjects: true });
  const bondItems = t('landing.beginner.bonds.items', { returnObjects: true });
  const holdMoneyItems = t('landing.beginner.holdMoney.items', { returnObjects: true });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-blue-400" />
            {t('landing.beginner.title')}
          </DialogTitle>
          <p className="text-slate-400 text-sm">{t('landing.beginner.subtitle')}</p>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {/* What is Trustfy */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{t('landing.beginner.intro.title')}</h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.beginner.intro.body')}</p>
                <p className="text-blue-300 font-medium">{t('landing.beginner.intro.note')}</p>
              </div>
            </Card>

            {/* NEW SECTION: Authentication & Access */}
            <h2 className="text-xl font-bold text-white mt-8 mb-4 border-b border-slate-700/50 pb-2">
              <KeyRound className="inline-block w-6 h-6 mr-2 text-blue-400" />
              {t('landing.beginner.access.title')}
            </h2>

            {/* Option 1: Privacy-First Access */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-blue-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-400" />
                {t('landing.beginner.access.option1.title')}{' '}
                <span className="text-xs text-slate-400 font-normal ml-2">
                  {t('landing.beginner.access.option1.badge')}
                </span>
              </h3>
              <p className="text-blue-300 font-medium text-sm mb-4">
                {t('landing.beginner.access.option1.lead')}
              </p>

              <div className="space-y-4 text-slate-300 text-sm">
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {t('landing.beginner.access.option1.needTitle')}
                  </h4>
                  <ul className="space-y-1 ml-4">
                    {accessNeeds.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {t('landing.beginner.access.option1.noNeedTitle')}
                  </h4>
                  <ul className="space-y-1 ml-4">
                    {accessNoNeed.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <AlertTriangle className="flex-shrink-0 w-4 h-4 text-red-400 mt-0.5 transform rotate-180" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {t('landing.beginner.access.option1.stepsTitle')}
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    {accessSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {t('landing.beginner.access.option1.canDoTitle')}
                  </h4>
                  <ul className="space-y-1 ml-4">
                    {accessCanDo.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-emerald-400 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Ready to Start? */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-400" />
                {t('landing.beginner.access.ready.title')}
              </h3>
              <div className="space-y-4 text-slate-300 text-sm">
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  {readySteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="text-blue-300 font-medium mt-2">
                  {t('landing.beginner.access.ready.note')}
                </p>
              </div>
            </Card>
            {/* END NEW SECTION: Authentication & Access */}


            {/* How Escrow Works */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                {t('landing.beginner.escrow.title')}
              </h3>
              <ol className="space-y-2 text-slate-300 text-sm">
                {escrowSteps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>

            {/* Bond System */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                {t('landing.beginner.bonds.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.beginner.bonds.lead')}</p>
                <ul className="space-y-2 ml-4">
                  {bondItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-purple-300 font-medium mt-2">{t('landing.beginner.bonds.note')}</p>
              </div>
            </Card>

            {/* Does Trustfy Hold Money */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.beginner.holdMoney.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-emerald-300 font-bold text-lg">{t('landing.beginner.holdMoney.answer')}</p>
                <p>{t('landing.beginner.holdMoney.lead')}</p>
                <ol className="space-y-1 ml-6 list-decimal">
                  {holdMoneyItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
                <p className="text-emerald-300 font-medium mt-2">
                  {t('landing.beginner.holdMoney.note')}
                </p>
              </div>
            </Card>

            {/* Identity */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.beginner.identity.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-blue-300 font-bold text-lg">{t('landing.beginner.identity.answer')}</p>
                <p>{t('landing.beginner.identity.body')}</p>
              </div>
            </Card>

            {/* Freeze Account */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.beginner.freeze.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-blue-300 font-bold text-lg">{t('landing.beginner.freeze.answer')}</p>
                <p>{t('landing.beginner.freeze.body')}</p>
              </div>
            </Card>

            {/* Privacy */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                {t('landing.beginner.privacy.title')}
              </h3>
              <div className="text-slate-300 text-sm">
                <p>{t('landing.beginner.privacy.body')}</p>
              </div>
            </Card>

            {/* Risks */}
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                {t('landing.beginner.risks.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p className="text-red-300 font-medium">
                  {t('landing.beginner.risks.body')}
                </p>
                <p className="text-amber-300">{t('landing.beginner.risks.note')}</p>
              </div>
            </Card>

            {/* Support */}
            <Card className="bg-slate-800/50 border-slate-700 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('landing.beginner.support.title')}
              </h3>
              <div className="text-slate-300 text-sm space-y-2">
                <p>{t('landing.beginner.support.body')}</p>
                <p className="text-red-300 font-medium">
                  {t('landing.beginner.support.note')}
                </p>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            {t('landing.beginner.footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
