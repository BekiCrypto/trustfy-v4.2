import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Shield,
  Lock,
  Wallet,
  CheckCircle2,
  Scale,
  Users,
  AlertTriangle,
  DollarSign,
  ExternalLink,
  Zap,
  Eye
} from "lucide-react";

export default function DocumentationModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const overviewNonCustodial = t('landing.docs.overview.nonCustodial.items', { returnObjects: true });
  const overviewEliminates = t('landing.docs.overview.nonCustodial.eliminates', { returnObjects: true });
  const overviewNoSurveillance = t('landing.docs.overview.noSurveillance.items', { returnObjects: true });
  const overviewGlobal = t('landing.docs.overview.global.items', { returnObjects: true });
  const overviewComparison = t('landing.docs.overview.comparison.rows', { returnObjects: true });
  const quickStartSteps = t('landing.docs.quickStart.steps', { returnObjects: true });
  const quickStartNetworks = t('landing.docs.quickStart.networks', { returnObjects: true });
  const quickStartListing = t('landing.docs.quickStart.listing.items', { returnObjects: true });
  const quickStartWorkflow = t('landing.docs.quickStart.workflow', { returnObjects: true });
  const bondCalc = t('landing.docs.bonds.calculation', { returnObjects: true });
  const disputeChecklist = t('landing.docs.disputes.review.items', { returnObjects: true });
  const securityPlatform = t('landing.docs.security.platform.items', { returnObjects: true });
  const securityContracts = t('landing.docs.security.contracts.items', { returnObjects: true });
  const securityWallet = t('landing.docs.security.wallet.items', { returnObjects: true });
  const securityGuidelines = t('landing.docs.security.guidelines.items', { returnObjects: true });
  const securityWarnings = t('landing.docs.security.warnings', { returnObjects: true });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50 text-white max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            {t('landing.docs.title')}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="bg-slate-800/50 border border-slate-700 w-full grid grid-cols-5">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 text-xs">
              {t('landing.docs.tabs.overview')}
            </TabsTrigger>
            <TabsTrigger value="getting-started" className="data-[state=active]:bg-slate-700 text-xs">
              {t('landing.docs.tabs.quickStart')}
            </TabsTrigger>
            <TabsTrigger value="bonds" className="data-[state=active]:bg-slate-700 text-xs">
              {t('landing.docs.tabs.bonds')}
            </TabsTrigger>
            <TabsTrigger value="disputes" className="data-[state=active]:bg-slate-700 text-xs">
              {t('landing.docs.tabs.disputes')}
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-slate-700 text-xs">
              {t('landing.docs.tabs.security')}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4 pr-4">
            {/* Platform Overview */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  {t('landing.docs.overview.title')}
                </h3>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30 p-6 mb-6">
                  <p className="text-slate-200 leading-relaxed text-lg">
                    {t('landing.docs.overview.subtitle')}
                  </p>
                </Card>

                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-400" />
                      {t('landing.docs.overview.nonCustodial.title')}
                    </h4>
                    <p className="text-slate-300 text-sm mb-3">
                      {t('landing.docs.overview.nonCustodial.lead')}
                    </p>
                    <div className="space-y-2">
                      {overviewNonCustodial.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                          <span className="text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                      <p className="text-xs text-slate-400">{t('landing.docs.overview.nonCustodial.eliminatesTitle')}</p>
                      <ul className="text-xs text-slate-300 mt-2 space-y-1 ml-4 list-disc">
                        {overviewEliminates.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      {t('landing.docs.overview.noSurveillance.title')}
                    </h4>
                    <p className="text-slate-300 text-sm mb-3">
                      {t('landing.docs.overview.noSurveillance.lead')}
                    </p>
                    <div className="space-y-2">
                      {overviewNoSurveillance.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" />
                          <span className="text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      {t('landing.docs.overview.global.title')}
                    </h4>
                    <p className="text-slate-300 text-sm mb-3">
                      {t('landing.docs.overview.global.lead')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {overviewGlobal.map((item) => (
                        <div key={item} className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-blue-400 mb-1" />
                          <p className="text-blue-300">{item}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      {t('landing.docs.overview.comparison.title')}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400">{t('landing.docs.overview.comparison.headers.feature')}</th>
                            <th className="text-left py-2 text-red-400">{t('landing.docs.overview.comparison.headers.traditional')}</th>
                            <th className="text-left py-2 text-emerald-400">{t('landing.docs.overview.comparison.headers.trustfy')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          {overviewComparison.map((row) => (
                            <tr key={row.feature} className="border-b border-slate-800">
                              <td className="py-2">{row.feature}</td>
                              <td className="py-2 text-red-400">{row.traditional}</td>
                              <td className="py-2 text-emerald-400">{row.trustfy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <div className="p-5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30">
                    <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      {t('landing.docs.overview.closing.title')}
                    </h4>
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {t('landing.docs.overview.closing.body')}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  {t('landing.docs.quickStart.title')}
                </h3>
                
                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{quickStartSteps[0].title}</h4>
                        <p className="text-slate-300 text-sm mb-3">{quickStartSteps[0].body}</p>
                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-2">{t('landing.docs.quickStart.networksTitle')}</p>
                          <div className="flex flex-wrap gap-2">
                            {quickStartNetworks.map((network) => (
                              <Badge key={network} className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                                {network}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{quickStartSteps[1].title}</h4>
                        <p className="text-slate-300 text-sm mb-3">{quickStartSteps[1].body}</p>
                        <div className="space-y-2">
                          {quickStartListing.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-slate-300">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{quickStartSteps[2].title}</h4>
                        <p className="text-slate-300 text-sm mb-3">{quickStartSteps[2].body}</p>
                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 space-y-2 text-sm">
                          {quickStartWorkflow.map((step, index) => (
                            <div key={step} className="flex items-center gap-2">
                              <span className="text-blue-400 font-mono">{index < 4 ? '→' : '✓'}</span>
                              <span className={index === 4 ? 'text-emerald-300' : 'text-slate-300'}>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{quickStartSteps[3].title}</h4>
                        <p className="text-slate-300 text-sm mb-3">{quickStartSteps[3].body}</p>
                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-sm text-slate-300">
                          {t('landing.docs.quickStart.timelineNote')}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Bond System */}
            <TabsContent value="bonds" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  {t('landing.docs.bonds.title')}
                </h3>

                <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6 mb-6">
                  <p className="text-slate-200 leading-relaxed">
                    {t('landing.docs.bonds.subtitle')}
                  </p>
                </Card>

                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      {t('landing.docs.bonds.calculationTitle')}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 rounded-lg bg-slate-900/50">
                        <p className="text-slate-300 mb-2">{bondCalc.seller.label}</p>
                        <div className="font-mono text-xs text-blue-400">{bondCalc.seller.formula}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50">
                        <p className="text-slate-300 mb-2">{bondCalc.buyer.label}</p>
                        <div className="font-mono text-xs text-purple-400">{bondCalc.buyer.formula}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-emerald-300 text-xs">
                          {bondCalc.note}
                        </p>
                      </div>
                    </div>
                  </Card>

                </div>
              </div>
            </TabsContent>

            {/* Disputes */}
            <TabsContent value="disputes" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  {t('landing.docs.disputes.title')}
                </h3>

                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Users className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{t('landing.docs.disputes.review.title')}</h4>
                        <Badge className="bg-amber-500/10 text-amber-400 text-xs mt-1">
                          {t('landing.docs.disputes.review.badge')}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">
                      {t('landing.docs.disputes.review.body')}
                    </p>
                    <div className="space-y-2">
                      {disputeChecklist.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-slate-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-red-300 font-semibold mb-1">{t('landing.docs.disputes.warning.title')}</p>
                        <p className="text-slate-300">
                          {t('landing.docs.disputes.warning.body')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6 mt-0">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  {t('landing.docs.security.title')}
                </h3>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 p-6 mb-6">
                  <p className="text-slate-200 leading-relaxed">
                    {t('landing.docs.security.subtitle')}
                  </p>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 p-5 mb-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    {t('landing.docs.security.platform.title')}
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    {t('landing.docs.security.platform.lead')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {securityPlatform.map((item) => (
                      <div key={item} className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mb-1" />
                        <p className="text-emerald-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="space-y-4">
                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    {t('landing.docs.security.contracts.title')}
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    {t('landing.docs.security.contracts.lead')}
                  </p>
                  <div className="space-y-2 text-sm">
                    {securityContracts.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-emerald-300 text-xs">
                      {t('landing.docs.security.contracts.note')}
                    </p>
                  </div>
                </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-purple-400" />
                    {t('landing.docs.security.wallet.title')}
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    {t('landing.docs.security.wallet.lead')}
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-white font-semibold text-sm mb-2">{t('landing.docs.security.wallet.signingTitle')}</p>
                      <div className="space-y-1 text-sm">
                        {securityWallet.map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span className="text-slate-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                  <Card className="bg-slate-800/50 border-slate-700 p-5">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-400" />
                    {t('landing.docs.security.guidelines.title')}
                  </h4>
                  <div className="space-y-3">
                    {securityGuidelines.map((item) => (
                      <div key={item.title} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                        <p className="font-semibold text-white text-sm mb-1">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-red-300 font-semibold mb-1">{t('landing.docs.security.warningsTitle')}</p>
                      <ul className="space-y-1 text-slate-300">
                        {securityWarnings.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">
              {t('landing.docs.footer.lastUpdated')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:border-blue-500/50 hover:text-blue-400"
                onClick={() => window.open('/docs', '_self')}
              >
                <BookOpen className="w-3 h-3 mr-2" />
                {t('landing.docs.footer.cta')}
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
