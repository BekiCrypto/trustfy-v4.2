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
import KYCStatus from "../kyc/KYCStatus";
import KYCSubmissionModal from "../kyc/KYCSubmissionModal";

export default function PrimeUpgrade() {
  const queryClient = useQueryClient();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
      return profiles[0];
    },
    enabled: !!currentUser
  });

  // Prime status = KYC verified (kyc_level: basic or enhanced)
  const hasKYC = profile?.kyc_level && profile.kyc_level !== 'none';
  const isPrime = profile?.is_prime || hasKYC;

  const primeFeatures = [
    { icon: TrendingUp, label: 'Transaction Limits', standard: '$10,000', prime: '$1,000,000+', color: 'text-emerald-400' },
    { icon: Shield, label: 'Dispute Resolution', standard: 'Standard Queue', prime: 'Priority Handling', color: 'text-blue-400' },
    { icon: Gift, label: 'Referral Bonuses', standard: 'Not Available', prime: 'Earn Rewards', color: 'text-purple-400' },
    { icon: BarChart3, label: 'Analytics', standard: 'Basic Stats', prime: 'Advanced Insights', color: 'text-amber-400' },
    { icon: Bot, label: 'API Access', standard: 'Not Available', prime: 'Full API Access', color: 'text-cyan-400' },
    { icon: Sparkles, label: 'Marketplace', standard: 'Standard Listing', prime: 'Featured Ads', color: 'text-pink-400' },
  ];

  const handleOAuth2Login = (provider) => {
    setIsAuthenticating(true);
    toast.loading('Redirecting to login...', { id: 'oauth-login' });
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
              <h3 className="text-xl font-bold text-white">Prime Membership</h3>
              <p className="text-slate-400 text-sm">KYC verification required for advanced features</p>
            </div>
          </div>
          {isPrime ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge className="bg-slate-700 text-slate-400 px-4 py-2">
              Inactive
            </Badge>
          )}
        </div>
      </Card>

      {/* Comparison Table - Compact */}
      <Card className="bg-slate-900/50 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Feature Comparison</h3>
        <div className="space-y-2">
          {primeFeatures.map((feature) => (
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
            <h3 className="text-lg font-semibold text-white">Unlock Prime Features</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Complete KYC verification to access premium features and higher transaction limits
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">$1M+ Limits</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <Bot className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Trading API</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 text-center">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Priority Support</p>
            </div>
          </div>

          <Button 
            onClick={() => setShowKYCModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Start KYC Verification
          </Button>
        </Card>
      )}

      {/* Prime Features */}
      {isPrime && (
        <Card className="bg-slate-900/50 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Prime Features</h3>
          
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = createPageUrl('TradingAPI')}
              variant="outline"
              className="w-full justify-between border-slate-600 hover:bg-slate-700"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">Trading API & Automation</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Button>

            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-white font-medium">Referral Program</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={profile?.id ? `TRUSTFY-${profile.id.slice(0, 8).toUpperCase()}` : '...'}
                  readOnly
                  className="bg-slate-900 border-slate-700 text-white font-mono text-xs"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`TRUSTFY-${profile?.id.slice(0, 8).toUpperCase()}`);
                    toast.success('Copied!');
                  }}
                  size="sm"
                  variant="outline"
                  className="border-slate-600"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Share to earn 20% commission</p>
            </div>
          </div>
        </Card>
      )}

      {/* Privacy Notice - Compact */}
      <Alert className="bg-slate-800/50 border-slate-600">
        <Lock className="h-4 w-4 text-slate-400" />
        <AlertDescription className="text-slate-400 text-xs">
          <strong>Privacy First:</strong> Data is encrypted, never shared. Wallet-only access always available.
        </AlertDescription>
      </Alert>

      {/* KYC Modal */}
      <KYCSubmissionModal 
        open={showKYCModal} 
        onOpenChange={setShowKYCModal}
        profile={profile}
      />
    </div>
  );
}