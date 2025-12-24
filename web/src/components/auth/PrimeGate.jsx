import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Crown, 
  Lock, 
  ArrowRight, 
  CheckCircle2,
  Shield,
  Zap,
  TrendingUp,
  Bot,
  BarChart3
} from "lucide-react";

/**
 * PrimeGate - Access gate for Prime-only features
 * 
 * Usage:
 * <PrimeGate>
 *   <YourPrimeFeature />
 * </PrimeGate>
 * 
 * Or with custom UI:
 * <PrimeGate
 *   title="Custom Title"
 *   description="Custom description"
 *   benefits={["Custom benefit 1", "Custom benefit 2"]}
 * >
 *   <YourPrimeFeature />
 * </PrimeGate>
 */
export default function PrimeGate({ 
  children, 
  title = "Prime Feature",
  description = "This feature is available to Prime members only",
  benefits = [
    "Trading Bots & Automation",
    "REST API Access",
    "Arbitrage Scanner",
    "Higher Trading Limits",
    "Priority Support",
    "Advanced Analytics"
  ]
}) {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const walletAddress = user.email.toLowerCase();
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: walletAddress });
      return profiles[0] ?? null;
    },
    enabled: !!user?.email
  });

  // Check if user has Prime access
  const isPrime = profile?.is_prime === true;

  // If Prime, render the children
  if (isPrime) {
    return <>{children}</>;
  }

  // Otherwise, show Prime upgrade gate
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-amber-500/30">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-3">
              <Lock className="w-3 h-3 mr-1" />
              Prime Only
            </Badge>
            <CardTitle className="text-2xl text-white mb-2">{title}</CardTitle>
            <CardDescription className="text-slate-400 text-base">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>Your Access:</strong> Basic (Wallet Only). Upgrade via referrals to unlock Prime. No KYC or 2FA required.
            </AlertDescription>
          </Alert>

          {/* Prime Benefits */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Prime Features & Benefits
            </h3>
            <div className="grid gap-2">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-2">Prime Requirements:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Active Wallet Session ✓</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Referral-based Prime unlock ✓</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <Link to={createPageUrl('Settings')} className="flex-1">
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Prime
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-slate-500">
            Prime unlocks via referrals. No KYC or 2FA required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook to check Prime access programmatically
 */
export function usePrimeAccess() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const walletAddress = user.email.toLowerCase();
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: walletAddress });
      return profiles[0] ?? null;
    },
    enabled: !!user?.email
  });

  return {
    isPrime: profile?.is_prime === true,
    profile,
    user
  };
}
