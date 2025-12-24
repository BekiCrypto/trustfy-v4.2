import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calculator, ArrowLeftRight, Link as LinkIcon, Clock, Shield, Zap, Database } from "lucide-react";
import ComingSoonBanner from "../components/common/ComingSoonBanner";

const CATEGORY_META = {
  tradeLifecycle: { icon: ArrowLeftRight, color: 'from-blue-500 to-indigo-500' },
  notifications: { icon: Bell, color: 'from-amber-500 to-orange-500' },
  reputation: { icon: Calculator, color: 'from-purple-500 to-violet-500' },
  blockchain: { icon: LinkIcon, color: 'from-emerald-500 to-green-500' },
  security: { icon: Shield, color: 'from-red-500 to-pink-500' }
};

export default function BackendServices() {
  const { t } = useTranslation();
  const services = t('backendServices.services', { returnObjects: true });
  const integrations = t('backendServices.integrations', { returnObjects: true });
  const cron = t('backendServices.cron', { returnObjects: true });
  const summary = t('backendServices.summary', { returnObjects: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <ComingSoonBanner />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('backendServices.title')}</h1>
          <p className="text-slate-400">{t('backendServices.subtitle')}</p>
        </div>

        <div className="space-y-8 mb-8">
          {services.map((category) => {
            const meta = CATEGORY_META[category.id] || CATEGORY_META.tradeLifecycle;
            const Icon = meta.icon;
            return (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${meta.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  <Badge className="bg-slate-700 text-slate-300">
                    {category.services.length} {t('backendServices.labels.service')}
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {category.services.map((service) => (
                    <Card key={service.name} className="bg-slate-900/90 border-slate-700/50 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">{service.name}</h3>
                          <p className="text-slate-400 text-sm">{service.description}</p>
                          <p className="text-slate-500 text-xs font-mono mt-1">{service.file}</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {t('backendServices.status.active')}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-xs text-slate-500 mb-1">{t('backendServices.labels.trigger')}</p>
                          <p className="text-sm text-slate-300">{service.trigger}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">{t('backendServices.labels.input')}</p>
                            <p className="text-xs text-emerald-400 font-mono">{service.input}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">{t('backendServices.labels.output')}</p>
                            <p className="text-xs text-blue-400 font-mono">{service.output}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400 mb-2 font-medium">{t('backendServices.labels.features')}</p>
                        <ul className="space-y-1">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                              <Zap className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Card className="bg-slate-900/90 border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('backendServices.integrationsTitle')}</h2>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {t('backendServices.integrationsBadge')}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div key={integration.name} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold">{integration.name}</h3>
                  {integration.noSecretsNeeded && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                      {t('backendServices.integrationsBuiltIn')}
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-2">{integration.description}</p>
                <p className="text-slate-500 text-xs">
                  <span className="text-slate-600">{t('backendServices.integrationsUsedIn')}</span> {integration.usage}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900/90 border-slate-700/50 p-6 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{cron.title}</h2>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {cron.badge}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <h3 className="text-white font-semibold mb-2">{cron.job.name}</h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate-300">
                  <span className="text-amber-400">{cron.labels.frequency}</span> {cron.job.frequency}
                </p>
                <p className="text-slate-300">
                  <span className="text-amber-400">{cron.labels.endpoint}</span> <code className="text-xs bg-slate-800 px-2 py-1 rounded">{cron.job.endpoint}</code>
                </p>
                <p className="text-slate-300">
                  <span className="text-amber-400">{cron.labels.setup}</span> {cron.job.setup}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">{summary.title}</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">{summary.backendFunctions.value}</p>
              <p className="text-slate-400 text-sm">{summary.backendFunctions.label}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">{summary.integrations.value}</p>
              <p className="text-slate-400 text-sm">{summary.integrations.label}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">{summary.secrets.value}</p>
              <p className="text-slate-400 text-sm">{summary.secrets.label}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
