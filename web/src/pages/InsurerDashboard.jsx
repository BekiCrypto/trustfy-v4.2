import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Shield,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  Settings,
  Plus,
  ArrowRight,
  Loader2
} from "lucide-react";
import StatsCard from "../components/common/StatsCard";
import InsurancePolicyCard from "../components/insurance/InsurancePolicyCard";
import InsuranceClaimCard from "../components/insurance/InsuranceClaimCard";
import ComingSoonBanner from "../components/common/ComingSoonBanner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function InsurerDashboard() {
  const { t } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);
  const providerId = urlParams.get('providerId');
  
  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ['insurance-provider', providerId],
    queryFn: async () => {
      if (!providerId) return null;
      const providers = await base44.entities.InsuranceProvider.filter({ id: providerId });
      return providers[0];
    },
    enabled: !!providerId
  });
  
  const { data: policies = [], isLoading: policiesLoading } = useQuery({
    queryKey: ['provider-policies', providerId],
    queryFn: () => base44.entities.InsurancePolicy.filter({ provider_id: providerId }),
    enabled: !!providerId
  });
  
  const { data: claims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ['provider-claims', providerId],
    queryFn: () => base44.entities.InsuranceClaim.filter({ provider_id: providerId }),
    enabled: !!providerId
  });
  
  // Calculate metrics
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const pendingClaims = claims.filter(c => ['pending', 'under_review'].includes(c.status)).length;
  const totalPremiums = policies.reduce((acc, p) => acc + (p.premium_amount || 0), 0);
  const totalPayouts = claims.filter(c => c.status === 'paid').reduce((acc, c) => acc + (c.payout_amount || 0), 0);
  
  // Mock chart data
  const premiumData = [
    { month: t('insurerDashboard.months.jan'), premiums: 1200, claims: 400 },
    { month: t('insurerDashboard.months.feb'), premiums: 1500, claims: 600 },
    { month: t('insurerDashboard.months.mar'), premiums: 1800, claims: 500 },
    { month: t('insurerDashboard.months.apr'), premiums: 2100, claims: 800 },
    { month: t('insurerDashboard.months.may'), premiums: 2400, claims: 700 },
    { month: t('insurerDashboard.months.jun'), premiums: 2800, claims: 900 }
  ];
  
  const riskDistribution = [
    { risk: t('insurerDashboard.risk.low'), count: 12 },
    { risk: t('insurerDashboard.risk.medium'), count: 28 },
    { risk: t('insurerDashboard.risk.high'), count: 8 }
  ];
  
  if (providerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('insurerDashboard.notFoundTitle')}</h2>
          <p className="text-slate-400 mb-6">{t('insurerDashboard.notFoundBody')}</p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('insurerDashboard.registerProvider')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-8">
        <ComingSoonBanner />
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              {provider.provider_name}
            </h1>
            <p className="text-slate-400 mt-1">
              {t('insurerDashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <Settings className="w-4 h-4 mr-2" />
              {t('insurerDashboard.settings')}
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              {t('insurerDashboard.addCapital')}
            </Button>
          </div>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title={t('insurerDashboard.stats.availableCapital')}
            value={`$${provider.capital_available?.toLocaleString()}`}
            icon={DollarSign}
            gradient="from-emerald-500/20 to-emerald-600/20"
            subtitle={t('insurerDashboard.stats.stakedAmount', {
              amount: provider.capital_staked?.toLocaleString()
            })}
          />
          <StatsCard
            title={t('insurerDashboard.stats.activePolicies')}
            value={activePolicies}
            icon={Shield}
            gradient="from-blue-500/20 to-blue-600/20"
            subtitle={t('insurerDashboard.stats.totalPolicies', { count: policies.length })}
          />
          <StatsCard
            title={t('insurerDashboard.stats.premiumsEarned')}
            value={`$${totalPremiums.toFixed(2)}`}
            icon={TrendingUp}
            gradient="from-purple-500/20 to-purple-600/20"
            trend="up"
            trendValue={t('insurerDashboard.stats.premiumsTrend')}
          />
          <StatsCard
            title={t('insurerDashboard.stats.pendingClaims')}
            value={pendingClaims}
            icon={AlertTriangle}
            gradient="from-amber-500/20 to-amber-600/20"
            subtitle={t('insurerDashboard.stats.totalClaims', { count: claims.length })}
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Premium vs Claims */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{t('insurerDashboard.charts.premiumsVsClaims')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={premiumData}>
                  <defs>
                    <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="claimGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="premiums"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#premiumGradient)"
                    name={t('insurerDashboard.charts.premiums')}
                  />
                  <Area
                    type="monotone"
                    dataKey="claims"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fill="url(#claimGradient)"
                    name={t('insurerDashboard.charts.claims')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Risk Distribution */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{t('insurerDashboard.charts.riskDistribution')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution}>
                  <XAxis 
                    dataKey="risk" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        {/* Policies and Claims Tabs */}
        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="policies" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('insurerDashboard.tabs.policies', { count: policies.length })}
            </TabsTrigger>
            <TabsTrigger value="claims" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('insurerDashboard.tabs.claims', { count: claims.length })}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700 text-slate-300">
              {t('insurerDashboard.tabs.settings')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="policies" className="mt-6">
            {policiesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">{t('insurerDashboard.empty.policiesTitle')}</h3>
                <p className="text-slate-500">{t('insurerDashboard.empty.policiesBody')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {policies.map((policy, index) => (
                  <InsurancePolicyCard key={policy.id} policy={policy} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="claims" className="mt-6">
            {claimsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">{t('insurerDashboard.empty.claimsTitle')}</h3>
                <p className="text-slate-500">{t('insurerDashboard.empty.claimsBody')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim, index) => (
                  <InsuranceClaimCard key={claim.id} claim={claim} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">{t('insurerDashboard.providerSettings')}</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{t('insurerDashboard.settingsLabels.basePremiumRate')}</label>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-2xl font-bold text-white">{provider.base_premium_rate}%</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{t('insurerDashboard.settingsLabels.providerRating')}</label>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-2xl font-bold text-white">{provider.provider_rating?.toFixed(1)} ⭐</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{t('insurerDashboard.settingsLabels.minCoverage')}</label>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-2xl font-bold text-white">${provider.min_coverage?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">{t('insurerDashboard.settingsLabels.maxCoverage')}</label>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-2xl font-bold text-white">${provider.max_coverage?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">{t('insurerDashboard.settingsLabels.autoApprovePolicies')}</label>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-white">
                      {provider.auto_approve ? t('insurerDashboard.settingsLabels.enabled') : t('insurerDashboard.settingsLabels.disabled')}
                    </p>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  {t('insurerDashboard.updateSettings')}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
