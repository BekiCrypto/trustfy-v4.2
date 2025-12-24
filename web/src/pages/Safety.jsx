import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Lock,
  Scale,
  Eye,
  CheckCircle2,
  XCircle
} from "lucide-react";
import ComingSoonBanner from "../components/common/ComingSoonBanner";

export default function Safety() {
  const { t } = useTranslation();
  const guidelineCards = t('safety.guidelines.cards', { returnObjects: true });
  const antifraudThreats = t('safety.antifraud.threats', { returnObjects: true });
  const antifraudMitigations = t('safety.antifraud.mitigations', { returnObjects: true });
  const disputeWhenItems = t('safety.disputes.when.items', { returnObjects: true });
  const disputeProcess = t('safety.disputes.process', { returnObjects: true });
  const disputeEvidence = t('safety.disputes.evidence', { returnObjects: true });
  const disputeOutcomesBuyer = t('safety.disputes.outcomes.buyer', { returnObjects: true });
  const disputeOutcomesSeller = t('safety.disputes.outcomes.seller', { returnObjects: true });
  const riskFinancial = t('safety.risks.financial', { returnObjects: true });
  const riskTechnical = t('safety.risks.technical', { returnObjects: true });
  const riskLegal = t('safety.risks.legal', { returnObjects: true });
  const riskUser = t('safety.risks.user', { returnObjects: true });
  const guidelineIcons = [Lock, Eye, CheckCircle2, AlertTriangle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-8">
        <ComingSoonBanner />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">{t('safety.title')}</h1>
          </div>
          <p className="text-slate-400 text-lg">
            {t('safety.subtitle')}
          </p>
        </motion.div>

        <Tabs defaultValue="guidelines" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 w-full grid grid-cols-4">
            <TabsTrigger value="guidelines">{t('safety.tabs.guidelines')}</TabsTrigger>
            <TabsTrigger value="disputes">{t('safety.tabs.disputes')}</TabsTrigger>
            <TabsTrigger value="antifraud">{t('safety.tabs.antifraud')}</TabsTrigger>
            <TabsTrigger value="risks">{t('safety.tabs.risks')}</TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="space-y-6">
            <Alert className="bg-emerald-500/10 border-emerald-500/30">
              <Shield className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="text-emerald-300 text-sm">
                {t('safety.guidelines.alert')}
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              {guidelineCards.map((card, index) => {
                const Icon = guidelineIcons[index] || Shield;
                const iconColor = index === 0
                  ? 'text-blue-400'
                  : index === 1
                    ? 'text-purple-400'
                    : index === 2
                      ? 'text-emerald-400'
                      : 'text-amber-400';
                const bulletIcon = index === 3 ? XCircle : CheckCircle2;
                const bulletColor = index === 3 ? 'text-red-400' : 'text-emerald-400';

                return (
                  <Card key={card.title} className="bg-slate-800/50 border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                      {card.title}
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      {card.items.map((item) => {
                        const BulletIcon = bulletIcon;
                        return (
                          <li key={item} className="flex items-start gap-2">
                            <BulletIcon className={`w-4 h-4 ${bulletColor} mt-0.5`} />
                            <span>{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-amber-400" />
                {t('safety.disputes.title')}
              </h3>
              <p className="text-slate-300 text-sm mb-6">
                {t('safety.disputes.subtitle')}
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">{t('safety.disputes.when.title')}</h4>
                  <ul className="space-y-2 text-slate-300 text-sm ml-4">
                    {disputeWhenItems.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <p className="text-slate-400 text-xs mt-2">
                    {t('safety.disputes.when.note')}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="text-lg font-semibold text-white mb-3">{t('safety.disputes.processTitle')}</h4>
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
                  <h4 className="text-lg font-semibold text-white mb-3">{t('safety.disputes.evidenceTitle')}</h4>
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
                  <h4 className="text-lg font-semibold text-white mb-3">{t('safety.disputes.outcomesTitle')}</h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded bg-slate-900/50">
                      <p className="font-semibold text-emerald-400 mb-1">{t('safety.disputes.outcomesBuyer')}</p>
                      <ul className="text-slate-300 ml-4 space-y-1">
                        {disputeOutcomesBuyer.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded bg-slate-900/50">
                      <p className="font-semibold text-blue-400 mb-1">{t('safety.disputes.outcomesSeller')}</p>
                      <ul className="text-slate-300 ml-4 space-y-1">
                        {disputeOutcomesSeller.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="antifraud" className="space-y-6">
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300 text-sm">
                {t('safety.antifraud.alert')}
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-red-400">{t('safety.antifraud.threatsTitle')}</h3>
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
                <h3 className="text-lg font-semibold text-white mb-4 text-emerald-400">{t('safety.antifraud.mitigationsTitle')}</h3>
                <ul className="space-y-3 text-sm">
                  {antifraudMitigations.map((item, index) => {
                    const iconProps = index === 0
                      ? { icon: Shield, color: 'text-emerald-400' }
                      : index === 1
                        ? { icon: Lock, color: 'text-blue-400' }
                        : index === 2
                          ? { icon: Scale, color: 'text-purple-400' }
                          : { icon: CheckCircle2, color: 'text-amber-400' };
                    const Icon = iconProps.icon;

                    return (
                      <li key={item} className="flex items-start gap-2">
                        <Icon className={`w-5 h-5 ${iconProps.color} mt-0.5`} />
                        <span className="text-slate-300">{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300 text-sm">
                {t('safety.risks.alert')}
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t('safety.risks.financialTitle')}</h3>
                <div className="space-y-2 text-slate-300 text-sm">
                  {riskFinancial.map((risk) => (
                    <div key={risk.title} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">{risk.title}</p>
                        <p className="text-xs text-slate-400">{risk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t('safety.risks.technicalTitle')}</h3>
                <div className="space-y-2 text-slate-300 text-sm">
                  {riskTechnical.map((risk) => (
                    <div key={risk.title} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">{risk.title}</p>
                        <p className="text-xs text-slate-400">{risk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t('safety.risks.legalTitle')}</h3>
                <div className="space-y-2 text-slate-300 text-sm">
                  {riskLegal.map((risk) => (
                    <div key={risk.title} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-purple-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">{risk.title}</p>
                        <p className="text-xs text-slate-400">{risk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{t('safety.risks.userTitle')}</h3>
                <div className="space-y-2 text-slate-300 text-sm">
                  {riskUser.map((risk) => (
                    <div key={risk.title} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">{risk.title}</p>
                        <p className="text-xs text-slate-400">{risk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
