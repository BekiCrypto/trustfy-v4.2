import React, { useState, useEffect } from 'react';
import { userApi } from "@/api/user";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from '@/hooks/useTranslation';
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon,
  CreditCard,
  Bell,
  Shield,
  Link2,
  Loader2,
  CheckCircle,
  XCircle,
  Plus,
  X,
  ExternalLink,
  Key,
  User,
  Palette,
  Globe,
  Bot,
  Sparkles,
  Crown
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ThemeSelector from "../components/settings/ThemeSelector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
const PrimeUpgrade = React.lazy(() => import("../components/settings/PrimeUpgrade"));

const KYC_STATUS_CONFIG = {
  none: { labelKey: 'kyc.notVerified', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: Shield },
  pending: { labelKey: 'kyc.verificationPending', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Loader2 },
  verified: { labelKey: 'kyc.verificationApproved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
  rejected: { labelKey: 'kyc.verificationRejected', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle }
};

export default function Settings() {
  const { t } = useTranslation();
  const { address: connectedAddress } = useAccount();
  const queryClient = useQueryClient();
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const paymentMethodOptions = [
    { value: 'bank_transfer', label: t('settings.paymentMethodsOptions.bankTransfer') },
    { value: 'mobile_money', label: t('settings.paymentMethodsOptions.mobileMoney') },
    { value: 'paypal', label: t('settings.paymentMethodsOptions.paypal') },
    { value: 'wise', label: t('settings.paymentMethodsOptions.wise') },
    { value: 'western_union', label: t('settings.paymentMethodsOptions.westernUnion') },
    { value: 'cash_deposit', label: t('settings.paymentMethodsOptions.cashDeposit') },
    { value: 'crypto_wallet', label: t('settings.paymentMethodsOptions.cryptoWallet') }
  ];
  const paymentMethodLabelMap = paymentMethodOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});
  const formatPaymentMethod = (method) => paymentMethodLabelMap[method] || method;
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const targetAddress = user?.address || connectedAddress;
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', targetAddress],
    queryFn: async () => {
      if (!targetAddress) return null;
      return userApi.getProfile(targetAddress);
    },
    enabled: !!targetAddress
  });
  
  const updateProfile = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success(t('settings.toast.updated'));
    },
    onError: () => {
      toast.error(t('settings.toast.updateFailed'));
    }
  });
  
  const handleAddPaymentMethod = () => {
    const method = customPaymentMethod || newPaymentMethod;
    if (!method) return;
    
    const currentMethods = profile?.paymentMethods || [];
    const updated = [...currentMethods, method];
    updateProfile.mutate({ paymentMethods: updated });
    setNewPaymentMethod('');
    setCustomPaymentMethod('');
  };
  
  const handleRemovePaymentMethod = (method) => {
    const currentMethods = profile?.paymentMethods || [];
    const updated = currentMethods.filter(m => m !== method);
    updateProfile.mutate({ paymentMethods: updated });
  };
  
  const handleNotificationToggle = (key, value) => {
    const updated = {
      ...profile.notification_preferences,
      [key]: value
    };
    updateProfile.mutate({ notification_preferences: updated });
  };
  
  const handleChainChange = (chain) => {
    updateProfile.mutate({ preferred_chain: chain });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  
  
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            {t('settings.title')}
          </h1>
          <p className="text-slate-400 mt-1">{t('settings.subtitle')}</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 w-full justify-start overflow-x-auto">
            <TabsTrigger value="account" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-purple-600">
              <User className="w-4 h-4 mr-2" />
              {t('settingsTabs.account', 'Account')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700">
              <Bell className="w-4 h-4 mr-2" />
              {t('settingsTabs.notifications')}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-slate-700">
              <Palette className="w-4 h-4 mr-2" />
              {t('settingsTabs.appearance')}
            </TabsTrigger>
          </TabsList>
          {/* Account Tab - Unified Account Management */}
          <TabsContent value="account" className="space-y-6">
            
            {/* Account Info & Bio */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('settingsContent.profileInfo')}</h2>
                  <p className="text-sm text-slate-400">{t('settingsContent.manageProfile')}</p>
                </div>
              </div>
              
              <Separator className="my-4 bg-slate-700/50" />
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">{t('settingsContent.displayName')}</Label>
                    <Input
                      value={profile?.displayName || ''}
                      onChange={(e) => updateProfile.mutate({ 
                        displayName: e.target.value
                      })}
                      className="bg-slate-800/50 border-slate-600 text-white"
                      placeholder={t('settingsContent.yourDisplayName')}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">{t('settingsContent.walletAddress')}</Label>
                    <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-white font-mono text-sm truncate">{targetAddress}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">{t('settingsContent.bio')}</Label>
                  <Textarea 
                    value={profile?.bio || ''}
                    onChange={(e) => updateProfile.mutate({ bio: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-white h-24"
                    placeholder={t('settingsContent.bioPlaceholder', 'Tell other traders about yourself...')}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                      {profile?.platform_role || 'User'}
                    </Badge>
                  </div>
                  
                  <RouterLink to={createPageUrl('Profile')}>
                    <Button variant="outline" size="sm" className="border-slate-600">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('settingsContent.viewFullProfile')}
                    </Button>
                  </RouterLink>
                </div>
              </div>
            </Card>

            {/* Payment Methods Section */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('settings.paymentMethods')}</h2>
                  <p className="text-sm text-slate-400">{t('settings.addPaymentMethod')}</p>
                </div>
              </div>
              
              <Separator className="my-4 bg-slate-700/50" />
              
              {profile?.paymentMethods && profile.paymentMethods.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.paymentMethods.map((method, idx) => (
                    <Badge 
                      key={idx}
                      className="bg-slate-800 border-slate-600 text-slate-200 px-3 py-1.5 text-sm"
                    >
                      {formatPaymentMethod(method)}
                      <button
                        onClick={() => handleRemovePaymentMethod(method)}
                        className="ml-2 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm mb-4">{t('settings.noPaymentMethods')}</p>
              )}
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white w-full">
                        <SelectValue placeholder={t('settings.selectMethod')} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {paymentMethodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-slate-300">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleAddPaymentMethod}
                      disabled={!newPaymentMethod || updateProfile.isPending}
                      className="bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('settings.accountDetails')}
                      value={customPaymentMethod}
                      onChange={(e) => setCustomPaymentMethod(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                    <Button 
                      onClick={handleAddPaymentMethod}
                      disabled={!customPaymentMethod || updateProfile.isPending}
                      className="bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Trustfy Rewards (Formerly Prime) */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">{t('primeUpgrade.title', 'Trustfy Rewards')}</h2>
              </div>
              <React.Suspense fallback={<div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300">Loading Rewards…</div>}>
                <PrimeUpgrade />
              </React.Suspense>
            </div>

          </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{t('settings.notifications')}</h2>
                <p className="text-sm text-slate-400">{t('settings.emailNotifications')}</p>
              </div>
            </div>
            
            <Separator className="my-4 bg-slate-700/50" />
            
            <div className="space-y-4">
              {/* Email Enabled */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div>
                  <Label className="text-slate-200 font-medium">{t('settings.notifications')}</Label>
                  <p className="text-xs text-slate-500 mt-1">Receive in-app notifications</p>
                </div>
                <Switch
                  checked={profile?.notification_preferences?.email_enabled ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('email_enabled', checked)}
                />
              </div>
              
              {profile?.notification_preferences?.email_enabled && (
                <>
                  {/* Trade Matches */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30">
                    <div>
                      <Label className="text-slate-300">{t('settings.tradeMatches')}</Label>
                      <p className="text-xs text-slate-500 mt-1">{t('settings.notifyNewMatches')}</p>
                    </div>
                    <Switch
                      checked={profile?.notification_preferences?.trade_match ?? true}
                      onCheckedChange={(checked) => handleNotificationToggle('trade_match', checked)}
                    />
                  </div>
                  
                  {/* Status Changes */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30">
                    <div>
                      <Label className="text-slate-300">{t('settings.statusChanges')}</Label>
                      <p className="text-xs text-slate-500 mt-1">{t('settings.notifyStatusChanges')}</p>
                    </div>
                    <Switch
                      checked={profile?.notification_preferences?.status_change ?? true}
                      onCheckedChange={(checked) => handleNotificationToggle('status_change', checked)}
                    />
                  </div>
                  
                  {/* Messages */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30">
                    <div>
                      <Label className="text-slate-300">{t('settings.messages')}</Label>
                      <p className="text-xs text-slate-500 mt-1">{t('settings.notifyNewMessages')}</p>
                    </div>
                    <Switch
                      checked={profile?.notification_preferences?.messages ?? false}
                      onCheckedChange={(checked) => handleNotificationToggle('messages', checked)}
                    />
                  </div>
                  
                  {/* Disputes */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30">
                    <div>
                      <Label className="text-slate-300">{t('nav.disputes')}</Label>
                      <p className="text-xs text-slate-500 mt-1">{t('settings.notifyDisputes')}</p>
                    </div>
                    <Switch
                      checked={profile?.notification_preferences?.disputes ?? true}
                      onCheckedChange={(checked) => handleNotificationToggle('disputes', checked)}
                    />
                  </div>
                  
                  {/* Insurance */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30">
                    <div>
                      <Label className="text-slate-300">{t('insurance.myClaims')}</Label>
                      <p className="text-xs text-slate-500 mt-1">{t('settings.notifyInsurance')}</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Switch
                          checked={profile?.notification_preferences?.insurance ?? true}
                          onCheckedChange={(checked) => handleNotificationToggle('insurance', checked)}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                        <p>Get notified about insurance claim status</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Minimum Priority */}
                  <div className="p-4 rounded-lg bg-slate-800/30">
                    <Label className="text-slate-300 mb-2 block">{t('settingsContent.minEmailPriority')}</Label>
                    <p className="text-xs text-slate-500 mb-3">{t('settingsContent.minEmailPriorityDesc')}</p>
                    <Select 
                      value={profile?.notification_preferences?.min_priority || 'medium'}
                      onValueChange={(value) => handleNotificationToggle('min_priority', value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="low" className="text-slate-300">{t('settingsContent.lowAbove')}</SelectItem>
                        <SelectItem value="medium" className="text-slate-300">{t('settingsContent.mediumAbove')}</SelectItem>
                        <SelectItem value="high" className="text-slate-300">{t('settingsContent.highAbove')}</SelectItem>
                        <SelectItem value="critical" className="text-slate-300">{t('settingsContent.criticalOnly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </Card>
        </TabsContent>



        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('settingsContent.theme')}</h2>
                  <p className="text-sm text-slate-400">{t('settingsContent.chooseTheme')}</p>
                </div>
              </div>
              
              <Separator className="my-4 bg-slate-700/50" />
              
              <ThemeSelector />
            </Card>
          </div>
        </TabsContent>


      </Tabs>
      </div>

      
    </div>
  );
}
