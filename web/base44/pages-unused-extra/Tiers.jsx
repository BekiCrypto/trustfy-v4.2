import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { 
  Trophy, 
  TrendingUp, 
  Loader2, 
  CheckCircle,
  XCircle,
  Star,
  Target,
  Award,
  Info,
  ArrowRight,
  Zap,
  Shield
} from "lucide-react";
import { TIER_BENEFITS, calculateTier } from "../components/tiers/TierConfig";
import TierCard from "../components/tiers/TierCard";
import TierProgress from "../components/tiers/TierProgress";

export default function TiersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });
  
  const currentTier = profile ? calculateTier(profile) : 'new';
  
  // Tier requirements (static data - no computation needed)
  const tierRequirements = {
    new: { score: 0, trades: 0, volume: 0 },
    bronze: { score: 600, trades: 5, volume: 500 },
    silver: { score: 700, trades: 20, volume: 5000 },
    gold: { score: 800, trades: 50, volume: 25000 },
    platinum: { score: 900, trades: 100, volume: 100000 }
  };
  
  // Calculate progress to next tier (memoized with useMemo would be better, but keeping simple)
  const tiers = ['new', 'bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  const nextRequirements = nextTier ? tierRequirements[nextTier] : null;
  
  const progress = nextRequirements && profile ? {
    score: Math.min(100, ((profile.reputation_score || 0) / nextRequirements.score) * 100),
    trades: Math.min(100, ((profile.successful_trades || 0) / nextRequirements.trades) * 100),
    volume: Math.min(100, ((profile.total_volume || 0) / nextRequirements.volume) * 100)
  } : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('tiersPage.membershipTiers')}</h1>
              <p className="text-slate-400">{t('tiersPage.unlockBenefits')}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Progress Section */}
        {isLoading ? (
          <Card className="bg-slate-900/50 border-slate-700/50 p-6 mb-8">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-2" />
              <span className="text-slate-400">Loading your tier progress...</span>
            </div>
          </Card>
        ) : profile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <TierProgress profile={profile} currentTier={currentTier} />
          </motion.div>
        ) : null}
        
        {/* Current Stats */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card className="bg-slate-900/50 border-slate-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t('tiersPage.reputationScore')}</p>
                  <p className="text-2xl font-bold text-white">{profile.reputation_score || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t('tiersPage.totalTrades')}</p>
                  <p className="text-2xl font-bold text-white">{profile.total_trades || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{t('tiersPage.tradingVolume')}</p>
                  <p className="text-2xl font-bold text-white">${(profile.total_volume || 0).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Next Tier Achievement */}
        {nextTier && progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Path to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Reputation Score</span>
                    <span className="text-white font-medium">{profile.reputation_score || 0} / {nextRequirements.score}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${progress.score}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Successful Trades</span>
                    <span className="text-white font-medium">{profile.successful_trades || 0} / {nextRequirements.trades}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                      style={{ width: `${progress.trades}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Trading Volume</span>
                    <span className="text-white font-medium">${(profile.total_volume || 0).toLocaleString()} / ${nextRequirements.volume.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${progress.volume}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-900/50 border border-slate-700/50 mb-6">
            <TabsTrigger value="overview">Tier Overview</TabsTrigger>
            <TabsTrigger value="comparison">Compare Benefits</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">{t('tiersPage.allTiers')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(TIER_BENEFITS).map((tier, idx) => (
                  <motion.div
                    key={tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <TierCard tier={tier} isCurrentTier={tier === currentTier} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card className="bg-slate-900/50 border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-400 text-sm font-medium">Benefit</th>
                      {Object.keys(TIER_BENEFITS).map(tier => (
                        <th key={tier} className="text-center p-4 text-slate-400 text-sm font-medium capitalize">
                          {tier}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-white font-medium">Maker Fee Discount</td>
                      {Object.keys(TIER_BENEFITS).map(tier => (
                        <td key={tier} className="text-center p-4">
                          <Badge className="bg-emerald-500/20 text-emerald-400">
                            {TIER_BENEFITS[tier].makerFeeDiscount}%
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-white font-medium">Taker Fee Discount</td>
                      {Object.keys(TIER_BENEFITS).map(tier => (
                        <td key={tier} className="text-center p-4">
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {TIER_BENEFITS[tier].takerFeeDiscount}%
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-white font-medium">Insurance Discount</td>
                      {Object.keys(TIER_BENEFITS).map(tier => (
                        <td key={tier} className="text-center p-4">
                          <Badge className="bg-purple-500/20 text-purple-400">
                            {TIER_BENEFITS[tier].insuranceDiscount}%
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-white font-medium">Priority Support</td>
                      {Object.keys(TIER_BENEFITS).map(tier => (
                        <td key={tier} className="text-center p-4">
                          {TIER_BENEFITS[tier].prioritySupport ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-white font-medium">Featured Listing</td>
                      {Object.keys(TIER_BENEFITS).map(tier => (
                        <td key={tier} className="text-center p-4">
                          {TIER_BENEFITS[tier].featuredListing ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-white font-medium">API Access</td>
                      {Object.keys(TIER_BENEFITS).map(tier => (
                        <td key={tier} className="text-center p-4">
                          {TIER_BENEFITS[tier].apiAccess ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-4 text-white font-medium">Higher Trade Limits</td>
                      {Object.keys(TIER_BENEFITS).map(tier => (
                        <td key={tier} className="text-center p-4">
                          {TIER_BENEFITS[tier].higherLimits ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
          
          {/* Requirements Tab */}
          <TabsContent value="requirements">
            <div className="space-y-6">
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-sm">
                  <strong>How to Advance:</strong> Meet ALL requirements for a tier to unlock it. 
                  Reputation, trades, and volume all count toward tier progression.
                </AlertDescription>
              </Alert>
              
              {Object.entries(tierRequirements).map(([tier, reqs]) => {
                const benefits = TIER_BENEFITS[tier];
                const meetsRequirements = profile && 
                  (profile.reputation_score || 0) >= reqs.score &&
                  (profile.successful_trades || 0) >= reqs.trades &&
                  (profile.total_volume || 0) >= reqs.volume;
                
                return (
                  <Card 
                    key={tier} 
                    className={`p-6 ${
                      tier === currentTier 
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50' 
                        : 'bg-slate-900/50 border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          tier === 'platinum' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                          tier === 'gold' ? 'bg-gradient-to-br from-amber-500 to-yellow-600' :
                          tier === 'silver' ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                          tier === 'bronze' ? 'bg-gradient-to-br from-orange-700 to-orange-800' :
                          'bg-slate-700'
                        }`}>
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white capitalize">{tier}</h3>
                          {tier === currentTier && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mt-1">
                              Current Tier
                            </Badge>
                          )}
                        </div>
                      </div>
                      {meetsRequirements && tier !== currentTier && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Eligible
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Requirements</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                            <span className="text-slate-400 text-sm">Reputation Score</span>
                            <span className="text-white font-medium">{reqs.score}+</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                            <span className="text-slate-400 text-sm">Successful Trades</span>
                            <span className="text-white font-medium">{reqs.trades}+</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                            <span className="text-slate-400 text-sm">Trading Volume</span>
                            <span className="text-white font-medium">${reqs.volume.toLocaleString()}+</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Key Benefits</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-300">{benefits.makerFeeDiscount}% Maker Fee Discount</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300">{benefits.takerFeeDiscount}% Taker Fee Discount</span>
                          </div>
                          {benefits.prioritySupport && (
                            <div className="flex items-center gap-2 text-sm">
                              <Shield className="w-4 h-4 text-purple-400" />
                              <span className="text-slate-300">Priority Support</span>
                            </div>
                          )}
                          {benefits.featuredListing && (
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="w-4 h-4 text-amber-400" />
                              <span className="text-slate-300">Featured Listings</span>
                            </div>
                          )}
                          {benefits.apiAccess && (
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="w-4 h-4 text-cyan-400" />
                              <span className="text-slate-300">API Access</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}