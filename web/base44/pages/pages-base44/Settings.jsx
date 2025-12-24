import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Sparkles
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import TwoFactorSetup from "../components/auth/TwoFactorSetup";
import { Link as RouterLink } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LanguageSwitcher from "../components/settings/LanguageSwitcher";
import ThemeSelector from "../components/settings/ThemeSelector";
import KYCStatus from "../components/kyc/KYCStatus";
import KYCSubmissionModal from "../components/kyc/KYCSubmissionModal";
import PrimeUpgrade from "../components/settings/PrimeUpgrade";

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Mobile Money',
  'PayPal',
  'Wise',
  'Western Union',
  'Cash Deposit',
  'Crypto Wallet'
];

const CHAINS = [
  { value: 'BSC', label: 'BNB Smart Chain (BEP20)' }
];

const KYC_STATUS_CONFIG = {
  none: { labelKey: 'kyc.notVerified', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: Shield },
  pending: { labelKey: 'kyc.verificationPending', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Loader2 },
  verified: { labelKey: 'kyc.verificationApproved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
  rejected: { labelKey: 'kyc.verificationRejected', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle }
};

export default function Settings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const walletAddress = user.email; // email field stores wallet_address
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: walletAddress });
      if (profiles.length === 0) {
        // Create profile if it doesn't exist
        return await base44.entities.UserProfile.create({
          wallet_address: walletAddress,
          kyc_level: 'none',
          is_prime: false,
          reputation_score: 500,
          notification_preferences: {
            email_enabled: true,
            trade_match: true,
            status_change: true,
            messages: false,
            disputes: true,
            insurance: true,
            min_priority: 'medium'
          },
          preferred_payment_methods: [],
          preferred_chain: 'BSC'
        });
      }
      return profiles[0];
    },
    enabled: !!user?.email
  });
  
  const updateProfile = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });
  
  const handleAddPaymentMethod = () => {
    const method = customPaymentMethod || newPaymentMethod;
    if (!method) return;
    
    const updated = [...(profile.preferred_payment_methods || []), method];
    updateProfile.mutate({ preferred_payment_methods: updated });
    setNewPaymentMethod('');
    setCustomPaymentMethod('');
  };
  
  const handleRemovePaymentMethod = (method) => {
    const updated = profile.preferred_payment_methods.filter(m => m !== method);
    updateProfile.mutate({ preferred_payment_methods: updated });
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
  
  const kycConfig = KYC_STATUS_CONFIG[profile?.kyc_status || 'none'];
  const KycIcon = kycConfig.icon;
  
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

        <Tabs defaultValue="prime" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 w-full justify-start overflow-x-auto">
            <TabsTrigger value="prime" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Prime Club
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
          {/* Prime Tab - Unified Account Management */}
          <TabsContent value="prime" className="space-y-6">
            {/* Prime Upgrade Overview */}
            <PrimeUpgrade />

            <Separator className="bg-slate-700/50" />

            {/* Profile Section */}
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
                <div>
                  <Label className="text-slate-300 mb-2 block">{t('settingsContent.displayName')}</Label>
                  <Input
                    value={profile?.display_name || ''}
                    onChange={(e) => updateProfile.mutate({ display_name: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-white"
                    placeholder={t('settingsContent.yourDisplayName')}
                  />
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">{t('settingsContent.walletAddress')}</Label>
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-white font-mono text-sm">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">{t('settingsContent.role')}</Label>
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-white capitalize">{profile?.platform_role || 'user'}</p>
                  </div>
                </div>

                <RouterLink to={createPageUrl('Profile')}>
                  <Button variant="outline" className="w-full border-slate-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('settingsContent.viewFullProfile')}
                  </Button>
                </RouterLink>
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
              
              {profile?.preferred_payment_methods && profile.preferred_payment_methods.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.preferred_payment_methods.map((method, idx) => (
                    <Badge 
                      key={idx}
                      className="bg-slate-800 border-slate-600 text-slate-200 px-3 py-1.5 text-sm"
                    >
                      {method}
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
                <Label className="text-slate-300">{t('settings.addPaymentMethod')}</Label>
                <div className="flex gap-2">
                  <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder={t('settings.selectMethod')} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method} className="text-slate-300">
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAddPaymentMethod}
                    disabled={!newPaymentMethod || updateProfile.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t('settings.accountDetails')}
                    value={customPaymentMethod}
                    onChange={(e) => setCustomPaymentMethod(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <Button 
                    onClick={handleAddPaymentMethod}
                    disabled={!customPaymentMethod || updateProfile.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* KYC & Security Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KYC Verification */}
              <KYCStatus 
                kycStatus={profile?.kyc_status || 'none'} 
                onStartKYC={() => setShowKYCModal(true)}
              />
              
              {/* Two-Factor Authentication */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{t('settings.twoFactorAuth')}</h2>
                    <p className="text-sm text-slate-400">{t('settings.twoFactorDesc')}</p>
                  </div>
                </div>
                
                <Separator className="my-4 bg-slate-700/50" />
                
                <div className={`p-4 rounded-lg ${profile?.two_factor_enabled ? 'bg-emerald-500/10' : 'bg-slate-800/50'} border border-slate-700/50 mb-4`}>
                  <div className="flex items-center gap-3">
                    {profile?.two_factor_enabled ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-slate-500" />
                    )}
                    <div>
                      <p className="text-sm text-slate-400">{t('settings.status2FA')}</p>
                      <p className={`font-semibold ${profile?.two_factor_enabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {profile?.two_factor_enabled ? t('settings.enabled') : t('settings.disabled')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {!profile?.two_factor_enabled ? (
                  <Button 
                    onClick={() => setShow2FAModal(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t('settings.enable2FA')}
                  </Button>
                ) : (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">{t('settings.twoFactorDesc')}</p>
                  </div>
                )}
              </Card>
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
                  <Label className="text-slate-200 font-medium">{t('settings.emailNotifications')}</Label>
                  <p className="text-xs text-slate-500 mt-1">{t('settings.receiveEmailNotifs')}</p>
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
                    <Switch
                      checked={profile?.notification_preferences?.insurance ?? true}
                      onCheckedChange={(checked) => handleNotificationToggle('insurance', checked)}
                    />
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

            {/* Language */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('settings.language')}</h2>
                  <p className="text-sm text-slate-400">{t('settings.selectLanguage')}</p>
                </div>
              </div>
              
              <Separator className="my-4 bg-slate-700/50" />
              
              <div className="flex justify-center">
                <LanguageSwitcher size="lg" />
              </div>
            </Card>
          </div>
        </TabsContent>


      </Tabs>
      </div>

      <TwoFactorSetup 
        open={show2FAModal} 
        onOpenChange={setShow2FAModal}
        userProfile={profile}
      />
      
      <KYCSubmissionModal 
        open={showKYCModal} 
        onOpenChange={setShowKYCModal}
        profile={profile}
      />
    </div>
  );
}
