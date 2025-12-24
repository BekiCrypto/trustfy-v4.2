import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Crown, 
  Mail, 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Zap,
  CheckCircle2,
  Info,
  Lock,
  Gift,
  BarChart3,
  Bot,
  Chrome,
  Facebook,
  LogIn,
  Key,
  Star,
  User,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { referralsApi } from "@/api/referrals";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useTranslation } from '@/hooks/useTranslation';

export default function PrimeUpgrade() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [metrics, setMetrics] = useState({
    totalReferrals: 0,
    qualifiedReferrals: 0,
    earnings: 0,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return null;
      const walletAddress = currentUser.email; // email stores wallet_address
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: walletAddress });
      return profiles[0] ?? null;
    },
    enabled: !!currentUser
  });

  const isPrime = profile?.is_prime === true;

  const { data: dashboard } = useQuery({
    queryKey: ['referrals-dashboard', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      return referralsApi.getDashboard();
    },
    enabled: !!currentUser?.email
  });

  const createCode = useMutation({
    mutationFn: () => referralsApi.createCode(),
    onSuccess: (data) => {
      toast.success(t('primeUpgrade.toast.linkGenerated', 'Referral link generated'));
      // Optimistic update to ensure UI reflects change immediately
      queryClient.setQueryData(['referrals-dashboard', currentUser?.email], (old) => {
        if (!old) return old;
        return {
          ...old,
          codes: [{ 
            code: data.code, 
            link: data.referralLink, 
            createdAt: new Date().toISOString() 
          }]
        };
      });
      queryClient.invalidateQueries({ queryKey: ['referrals-dashboard'] });
    },
    onError: (e) => toast.error(e.message || t('primeUpgrade.toast.generateFailed', 'Failed to generate link'))
  });

  const withdraw = useMutation({
    mutationFn: (amount) => referralsApi.withdraw({ amount }),
    onSuccess: () => {
      toast.success(t('primeUpgrade.toast.withdrawRequested', 'Withdrawal requested'));
      queryClient.invalidateQueries({ queryKey: ['referrals-dashboard'] });
    },
    onError: (e) => toast.error(e.message || t('primeUpgrade.toast.withdrawFailed', 'Failed to withdraw'))
  });

  const primeFeatures = [
    { icon: TrendingUp, label: t('primeUpgrade.features.reputation'), standard: t('primeUpgrade.features.standard.reputation'), prime: t('primeUpgrade.features.prime.reputation'), color: 'text-emerald-400', deliverable: true },
    { icon: Shield, label: t('primeUpgrade.features.disputes'), standard: t('primeUpgrade.features.standard.disputes'), prime: t('primeUpgrade.features.prime.disputes'), color: 'text-blue-400', deliverable: true },
    { icon: Gift, label: t('primeUpgrade.features.referrals'), standard: t('primeUpgrade.features.standard.referrals'), prime: t('primeUpgrade.features.prime.referrals'), color: 'text-purple-400', deliverable: true },
    { icon: BarChart3, label: t('primeUpgrade.features.analytics'), standard: t('primeUpgrade.features.standard.analytics'), prime: t('primeUpgrade.features.prime.analytics'), color: 'text-amber-400', deliverable: true },
    { icon: Sparkles, label: t('primeUpgrade.features.marketplace'), standard: t('primeUpgrade.features.standard.marketplace'), prime: t('primeUpgrade.features.prime.marketplace'), color: 'text-pink-400', deliverable: true },
  ];

  const handleOAuth2Login = (provider) => {
    setIsAuthenticating(true);
    toast.loading(t('primeUpgrade.toast.redirecting', 'Redirecting to login...'), { id: 'oauth-login' });
    // Redirect to OAuth2 login, then back to Settings
    base44.auth.redirectToLogin(createPageUrl('Settings'));
  };

  return (
    <div className="space-y-6">
      {/* Prime Status */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{t('primeUpgrade.title')}</h3>
              <p className="text-slate-400 text-sm">{t('primeUpgrade.subtitle')}</p>
            </div>
          </div>
          {isPrime ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {t('primeUpgrade.active')}
            </Badge>
          ) : (
            <Badge className="bg-slate-700 text-slate-400 px-4 py-2">
              {t('primeUpgrade.standard')}
            </Badge>
          )}
        </div>
      </Card>

      {/* Comparison Table - Compact */}
      <Card className="bg-slate-900/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('primeUpgrade.benefitTiers')}</h3>
        <div className="space-y-2">
          {primeFeatures.filter(f => f.deliverable !== false).map((feature) => (
            <div key={feature.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2">
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-white text-sm">{feature.label}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">{feature.standard}</span>
                <span className="text-slate-600">→</span>
                <span className="text-purple-400 font-semibold">{feature.prime}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upgrade Section */}
      {!isPrime && (
        <Card className="bg-slate-900/50 border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">{t('primeUpgrade.unlockRewards')}</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            {t('primeUpgrade.unlockDescription')}
          </p>
          
          {dashboard && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{t('primeUpgrade.totalReferrals')}</p>
                <p className="text-sm text-white font-semibold">{dashboard.totalReferrals}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                <CheckCircle2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{t('primeUpgrade.qualified')}</p>
                <p className="text-sm text-white font-semibold">{dashboard.qualifiedReferrals}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{t('primeUpgrade.earnings')}</p>
                <p className="text-sm text-white font-semibold">${dashboard.earnings?.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                <Key className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">{t('primeUpgrade.walletBalance')}</p>
                <p className="text-sm text-white font-semibold">${dashboard.walletBalance?.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-white font-medium">{t('primeUpgrade.referralLink')}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={dashboard?.codes?.[0]?.link || ''}
                  readOnly
                  className="bg-slate-900 border-slate-700 text-white font-mono text-xs"
                />
                {dashboard?.codes?.[0]?.link ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(dashboard.codes[0].link);
                          setReferralCopied(true);
                          toast.success(t('tradingBots.toast.copied'));
                          setTimeout(() => setReferralCopied(false), 2000);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-slate-600"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                      <p>{t('primeUpgrade.copyTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => createCode.mutate()}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {t('primeUpgrade.generateLink')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                      <p>{t('primeUpgrade.generateTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">{t('primeUpgrade.shareText')}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Prime Features */}
      {isPrime && (
        <Card className="bg-slate-900/50 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('primeUpgrade.rewardsDashboard')}</h3>
          
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-white font-medium">{t('primeUpgrade.referralProgram')}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={dashboard?.codes?.[0]?.link || ''}
                  readOnly
                  className="bg-slate-900 border-slate-700 text-white font-mono text-xs"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        if (dashboard?.codes?.[0]?.link) {
                          navigator.clipboard.writeText(dashboard.codes[0].link);
                        }
                        toast.success(t('tradingBots.toast.copied'));
                      }}
                      size="sm"
                      variant="outline"
                      className="border-slate-600"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                    <p>{t('primeUpgrade.copyTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-slate-500 mt-2">{t('primeUpgrade.shareText')}</p>
              {dashboard && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    className="justify-start text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
                    onClick={() => toast.info('Lead management coming soon')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('primeUpgrade.viewLeads')} ({(dashboard.referrals || []).filter(r => !r.qualified).length})
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="justify-start text-amber-400 hover:text-amber-300 hover:bg-slate-800"
                        onClick={() => {
                          const input = window.prompt('Enter withdrawal amount (USD)', '');
                          if (!input) return;
                          const amount = Number(input);
                          if (!Number.isFinite(amount) || amount <= 0) {
                            toast.error('Invalid amount');
                            return;
                          }
                          withdraw.mutate(amount);
                        }}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {t('primeUpgrade.withdrawEarnings')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                      <p>{t('primeUpgrade.withdrawTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Privacy Notice - Compact */}
      <Alert className="bg-slate-800/50 border-slate-600">
        <Lock className="h-4 w-4 text-slate-400" />
        <AlertDescription className="text-slate-400 text-xs">
          <strong>{t('primeUpgrade.privacyNotice')}</strong> {t('primeUpgrade.privacyText')}
        </AlertDescription>
      </Alert>
    </div>
  );
}
