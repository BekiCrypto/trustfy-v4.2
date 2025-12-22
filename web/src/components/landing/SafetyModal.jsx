import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  AlertTriangle,
  Lock,
  Scale,
  Eye,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function SafetyModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const guidelineCards = t('landing.safety.guidelines.cards', { returnObjects: true });
  const disputeWhenItems = t('landing.safety.disputes.when.items', { returnObjects: true });
  const disputeProcess = t('landing.safety.disputes.process', { returnObjects: true });
  const disputeEvidence = t('landing.safety.disputes.evidence', { returnObjects: true });
  const disputeOutcomes = t('landing.safety.disputes.outcomes', { returnObjects: true });
  const antifraudThreats = t('landing.safety.antifraud.threats', { returnObjects: true });
  const antifraudMitigations = t('landing.safety.antifraud.mitigations', { returnObjects: true });
  const riskFinancial = t('landing.safety.risks.financial', { returnObjects: true });
  const riskTechnical = t('landing.safety.risks.technical', { returnObjects: true });
  const riskLegal = t('landing.safety.risks.legal', { returnObjects: true });
  const riskUser = t('landing.safety.risks.user', { returnObjects: true });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-8 h-8 text-emerald-400" />
            {t('landing.safety.title')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            <p className="text-slate-400">{t('landing.safety.subtitle')}</p>

            <Tabs defaultValue="guidelines" className="space-y-6">
              <TabsList className="bg-slate-800/50 border border-slate-700 w-full grid grid-cols-4">
                <TabsTrigger value="guidelines">{t('landing.safety.tabs.guidelines')}</TabsTrigger>
                <TabsTrigger value="disputes">{t('landing.safety.tabs.disputes')}</TabsTrigger>
                <TabsTrigger value="antifraud">{t('landing.safety.tabs.antifraud')}</TabsTrigger>
                <TabsTrigger value="risks">{t('landing.safety.tabs.risks')}</TabsTrigger>
              </TabsList>

              {/* Safety Guidelines */}
              <TabsContent value="guidelines" className="space-y-6">
                <Alert className="bg-emerald-500/10 border-emerald-500/30">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <AlertDescription className="text-emerald-300 text-sm">
                    {t('landing.safety.guidelines.alert')}
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  {guidelineCards.map((card, index) => {
                    const iconMap = [Lock, Eye, CheckCircle2, AlertTriangle];
                    const Icon = iconMap[index] || Lock;
                    const listIcon = index === 3 ? XCircle : CheckCircle2;
                    const listIconClass = index === 3 ? 'text-red-400' : 'text-emerald-400';

                    return (
                      <Card key={card.title} className="bg-slate-800/50 border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${index === 1 ? 'text-purple-400' : index === 2 ? 'text-emerald-400' : index === 3 ? 'text-amber-400' : 'text-blue-400'}`} />
                          {card.title}
                        </h3>
                        <ul className="space-y-2 text-slate-300 text-sm">
                          {card.items.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <listIcon className={`w-4 h-4 ${listIconClass} mt-0.5`} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Dispute Policy */}
              <TabsContent value="disputes" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-amber-400" />
                    {t('landing.safety.disputes.title')}
                  </h3>
                  <p className="text-slate-300 text-sm mb-6">
                    {t('landing.safety.disputes.subtitle')}
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">
                        {t('landing.safety.disputes.when.title')}
                      </h4>
                      <ul className="space-y-2 text-slate-300 text-sm ml-4">
                        {disputeWhenItems.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                      <p className="text-slate-400 text-xs mt-2">
                        {t('landing.safety.disputes.when.note')}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        {t('landing.safety.disputes.processTitle')}
                      </h4>
                      <ol className="space-y-2 text-slate-300 text-sm">
                        {disputeProcess.map((step, index) => (
                          <li key={step} className="flex gap-2">
                            <span className="font-bold text-blue-400">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">
                        {t('landing.safety.disputes.evidenceTitle')}
                      </h4>
                      <ul className="grid md:grid-cols-2 gap-2 text-slate-300 text-sm">
                        {disputeEvidence.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        {t('landing.safety.disputes.outcomesTitle')}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 rounded bg-slate-900/50">
                          <p className="font-semibold text-emerald-400 mb-1">
                            {t('landing.safety.disputes.outcomesBuyer')}
                          </p>
                          <ul className="text-slate-300 ml-4 space-y-1">
                            {disputeOutcomes.buyer.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 rounded bg-slate-900/50">
                          <p className="font-semibold text-blue-400 mb-1">
                            {t('landing.safety.disputes.outcomesSeller')}
                          </p>
                          <ul className="text-slate-300 ml-4 space-y-1">
                            {disputeOutcomes.seller.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Anti-Fraud */}
              <TabsContent value="antifraud" className="space-y-6">
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300 text-sm">
                    {t('landing.safety.antifraud.alert')}
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 text-red-400">
                      {t('landing.safety.antifraud.threatsTitle')}
                    </h3>
                    <div className="space-y-3 text-sm">
                      {antifraudThreats.map((threat) => (
                        <div key={threat.title} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                          <p className="font-semibold text-white mb-1">{threat.title}</p>
                          <p className="text-slate-300">{threat.description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 text-emerald-400">
                      {t('landing.safety.antifraud.mitigationsTitle')}
                    </h3>
                    <ul className="space-y-3 text-sm">
                      {antifraudMitigations.map((item, index) => {
                        const icons = [Shield, Lock, Scale, CheckCircle2];
                        const colors = ['text-emerald-400', 'text-blue-400', 'text-purple-400', 'text-amber-400'];
                        const Icon = icons[index] || Shield;
                        const iconClass = colors[index] || 'text-emerald-400';
                        return (
                          <li key={item} className="flex items-start gap-2">
                            <Icon className={`w-5 h-5 ${iconClass} mt-0.5`} />
                            <span className="text-slate-300">{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                </div>
              </TabsContent>

              {/* Risk Disclosure */}
              <TabsContent value="risks" className="space-y-6">
                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <AlertDescription className="text-amber-300 text-sm">
                    {t('landing.safety.risks.alert')}
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {t('landing.safety.risks.financialTitle')}
                    </h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                      {riskFinancial.map((item) => (
                        <div key={item.title} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {t('landing.safety.risks.technicalTitle')}
                    </h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                      {riskTechnical.map((item) => (
                        <div key={item.title} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {t('landing.safety.risks.legalTitle')}
                    </h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                      {riskLegal.map((item) => (
                        <div key={item.title} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-purple-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {t('landing.safety.risks.userTitle')}
                    </h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                      {riskUser.map((item) => (
                        <div key={item.title} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
