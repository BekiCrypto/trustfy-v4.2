import React from 'react';
import { useTranslation } from "@/hooks/useTranslation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  Copy,
  ExternalLink,
  Shield,
  Wallet,
  Code,
  Terminal,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import ComingSoonBanner from "../components/common/ComingSoonBanner";

export default function DeploymentGuide() {
  const { t } = useTranslation();
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t('deploymentGuide.toast.copied'));
  };

  const steps = t('deploymentGuide.steps', { returnObjects: true });
  const launchChecklist = t('deploymentGuide.launchChecklist', { returnObjects: true });
  const resources = t('deploymentGuide.resources.items', { returnObjects: true });
  const iconMap = {
    settings: Settings,
    code: Code,
    terminal: Terminal,
    zap: Zap
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        <ComingSoonBanner />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('deploymentGuide.title')}</h1>
              <p className="text-slate-400">{t('deploymentGuide.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <Alert className="bg-amber-500/10 border-amber-500/30 mb-8">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300">
            <strong>{t('deploymentGuide.warningTitle')}</strong> {t('deploymentGuide.warningText')}
          </AlertDescription>
        </Alert>

        {/* Quick Launch Checklist */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {t('deploymentGuide.quickLaunchTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {launchChecklist.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  item.critical 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded border-2 border-slate-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm">{item.item}</p>
                  {item.critical && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs mt-1">
                      {t('deploymentGuide.status.critical')}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Deployment Steps */}
        <div className="space-y-8">
          {steps.map((category, catIdx) => {
            const Icon = iconMap[category.icon] || Settings;
            return (
              <div key={catIdx}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.steps.map((step, stepIdx) => (
                    <Card key={stepIdx} className="bg-slate-900/90 border-slate-700/50 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            step.status === 'critical' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {catIdx + 1}.{stepIdx + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                            <p className="text-slate-400 text-sm">{step.description}</p>
                          </div>
                        </div>
                        <Badge className={
                          step.status === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {step.status === 'critical'
                            ? t('deploymentGuide.status.critical')
                            : t('deploymentGuide.status.required')}
                        </Badge>
                      </div>

                      {step.details && (
                        <ul className="space-y-2 mb-4">
                          {step.details.map((detail, detailIdx) => (
                            <li key={detailIdx} className="flex items-start gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {step.commands && (
                        <div className="space-y-2">
                          {step.commands.map((cmd, cmdIdx) => (
                            <div key={cmdIdx} className="flex items-center gap-2">
                              <div className="flex-1 p-3 rounded-lg bg-slate-800 border border-slate-700 font-mono text-sm text-slate-300">
                                {cmd.value}
                              </div>
                              {cmd.copyable && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => copyToClipboard(cmd.value)}
                                  className="border-slate-600"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              )}
                              {cmd.type === 'link' && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => window.open(cmd.value, '_blank')}
                                  className="border-slate-600"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {step.action && (
                        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                          {step.action}
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resources */}
        <Card className="bg-slate-900/90 border-slate-700/50 p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('deploymentGuide.resources.title')}
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {resources.map((resource) => (
              <Button
                key={resource.url}
                variant="outline"
                className="justify-start border-slate-600"
                onClick={() => window.open(resource.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {resource.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Final Note */}
        <Alert className="bg-emerald-500/10 border-emerald-500/30 mt-8">
          <Rocket className="h-4 w-4 text-emerald-400" />
          <AlertDescription className="text-emerald-300">
            <strong>{t('deploymentGuide.finalTitle')}</strong> {t('deploymentGuide.finalText')}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
