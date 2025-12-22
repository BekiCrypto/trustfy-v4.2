import React from 'react';
import { motion } from "framer-motion";
import { Shield, Info, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from 'react-i18next';
import BondAccount from "../components/trade/BondAccount";

export default function BondCredits() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {t('bondCredits.title')}
              </h1>
              <p className="text-slate-400 mt-1">{t('bondCredits.subtitle')}</p>
            </div>
          </div>
        </motion.div>

        {/* Info Alert */}
        <Alert className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <Info className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300 text-sm">
            <strong>{t('bondCredits.smartBondSystem')}:</strong> {t('bondCredits.systemDesc')}
          </AlertDescription>
        </Alert>

        {/* How It Works */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            {t('bondCredits.howItWorks')}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-slate-800/50">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold text-white mb-1">{t('bondCredits.step1Title')}</h3>
              <p className="text-xs text-slate-400">
                {t('bondCredits.step1Desc')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-white mb-1">{t('bondCredits.step2Title')}</h3>
              <p className="text-xs text-slate-400">
                {t('bondCredits.step2Desc')}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50">
              <div className="text-2xl mb-2">💎</div>
              <h3 className="font-semibold text-white mb-1">{t('bondCredits.step3Title')}</h3>
              <p className="text-xs text-slate-400">
                {t('bondCredits.step3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Bond Account Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BondAccount />
        </motion.div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('bondCredits.benefits')}</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">✓</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{t('bondCredits.benefit1')}</p>
                <p className="text-slate-400 text-xs">{t('bondCredits.benefit1Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">✓</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{t('bondCredits.benefit2')}</p>
                <p className="text-slate-400 text-xs">{t('bondCredits.benefit2Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">✓</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{t('bondCredits.benefit3')}</p>
                <p className="text-slate-400 text-xs">{t('bondCredits.benefit3Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">✓</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{t('bondCredits.benefit4')}</p>
                <p className="text-slate-400 text-xs">{t('bondCredits.benefit4Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}