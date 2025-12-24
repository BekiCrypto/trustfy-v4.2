import React, { useState } from 'react';
import { userApi } from "@/api/user";
import { tradesApi } from "@/api/trades";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from '@/hooks/useTranslation';
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  User,
  Shield,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Copy,
  Settings,
  ExternalLink,
  Star,
  Trophy
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import ReputationScore from "../components/common/ReputationScore";
import TradeCard from "../components/trade/TradeCard";
import TierBadge from "../components/tiers/TierBadge";
import TierProgress from "../components/tiers/TierProgress";
import { calculateTier, TIER_BENEFITS } from "../components/tiers/TierConfig";

export default function Profile() {
  const { t } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);
  const [currentUser, setCurrentUser] = useState(null);
  const { address } = useAccount();
  
  React.useEffect(() => {
    userApi.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);
  
  const walletAddress = urlParams.get('address') || address || currentUser?.address || '';
  
  const { data: profile } = useQuery({
    queryKey: ['profile', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const user = await userApi.getProfile(walletAddress);
      return user ?? {
        address: walletAddress,
        displayName: 'Anonymous User',
        reputationScore: 500,
        successfulTrades: 0,
        totalVolume: 0,
        roles: [],
        prime: null
      };
    },
    enabled: !!walletAddress
  });
  
  const { data: trades = [] } = useQuery({
    queryKey: ['userTrades', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      // Use the 'participant' filter to get trades where this user is buyer OR seller
      const response = await tradesApi.listEscrows({ participant: walletAddress });
      
      const rawTrades = response.items || [];
      return rawTrades.map(t => ({
        id: t.escrowId,
        trade_id: t.escrowId,
        seller_address: t.seller,
        buyer_address: t.buyer,
        amount: parseFloat(t.amount),
        token_symbol: t.tokenKey,
        status: t.state.toLowerCase(),
        created_date: t.updatedAt
      })).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!walletAddress
  });
  
  const { data: reviews = [] } = useQuery({
    queryKey: ['user-reviews', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      return await userApi.getReviews(walletAddress);
    },
    enabled: !!walletAddress
  });
  
  const { data: preferredPayments = [] } = useQuery({
    queryKey: ['preferred-payments', walletAddress],
    queryFn: () => profile?.preferredPaymentMethods || [] // Backend should provide this in user profile
  });
  
  // Stats calculation
  const totalTrades = trades.length;
  const successRate = totalTrades > 0 
    ? ((profile?.successfulTrades / totalTrades) * 100).toFixed(1) 
    : 0;
  
  const currentTier = profile ? calculateTier(profile) : 'new';
  const tierConfig = TIER_BENEFITS[currentTier];
  
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success(t('profilePage.addressCopied'));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {profile?.displayName || t('profilePage.anonymousUser')}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                      <Wallet className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-sm text-slate-300">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>
                      <button onClick={copyAddress} className="text-slate-500 hover:text-white">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {profile?.is_arbitrator && (
                      <div className="flex items-center gap-1 bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-lg text-sm">
                        <Shield className="w-4 h-4" />
                        {t('profilePage.arbitrator')}
                      </div>
                    )}
                    
                    <TierBadge tier={currentTier} size="md" />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <ReputationScore score={profile?.reputationScore || 500} size="lg" />
                  <Link to={createPageUrl('Tiers')}>
                    <Button variant="outline" size="sm" className="border-slate-600">
                      <Trophy className="w-4 h-4 mr-2" />
                      {t('profilePage.viewTiers')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 w-full justify-start">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              <Shield className="w-4 h-4 mr-2" />
              {t('profilePage.overview')}
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-slate-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t('profilePage.statistics')}
            </TabsTrigger>
            <TabsTrigger value="trades" className="data-[state=active]:bg-slate-700">
              <Clock className="w-4 h-4 mr-2" />
              {t('profilePage.escrowHistory')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            
            {/* Tier Progress */}
            <TierProgress profile={profile} currentTier={currentTier} />
            
            {/* Tier Benefits */}
            <Card className={`bg-gradient-to-br ${tierConfig.color}/10 border ${tierConfig.borderColor} p-6`}>
              <h3 className="text-lg font-semibold text-white mb-4">{t('profilePage.yourBenefits')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-xs mb-1">{t('profilePage.trustTier')}</p>
                  <p className="text-white font-bold">{t(tierConfig.name) || t('profilePage.trustTierDefault')}</p>
                  <p className="text-emerald-400 text-xs">{t('profilePage.reputationBased')}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-xs mb-1">{t('profilePage.completionRate')}</p>
                  <p className="text-white font-bold">{successRate}%</p>
                  <p className="text-emerald-400 text-xs">{t('profilePage.verifiedHistory')}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-xs mb-1">{t('profilePage.escrowsCompleted')}</p>
                  <p className="text-white font-bold text-sm">{profile?.successfulTrades || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50">
                  <p className="text-slate-400 text-xs mb-1">{t('profilePage.support')}</p>
                  <p className="text-white font-bold text-xs">{tierConfig.benefits.prioritySupport ? t('tiersPage.prioritySupport') : t('tierBenefits.basicSupport')}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Reviews Summary */}
            {reviews.length > 0 && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  {t('profilePage.userRatingsReviews')}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl font-bold text-white">
                        {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                      </div>
                      <div>
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-400 text-sm">{t('profilePage.reviewsCount', { count: reviews.length })}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(r => r.rating === rating).length;
                        const percentage = (count / reviews.length) * 100;
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-slate-400 text-sm w-12">{rating} {t('profilePage.star')}</span>
                            <Progress value={percentage} className="h-2 flex-1" />
                            <span className="text-slate-400 text-sm w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          {review.reviewTags?.length > 0 && (
                            <div className="flex gap-1">
                              {review.reviewTags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {review.reviewText && (
                          <p className="text-slate-300 text-sm">{review.reviewText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-slate-400 text-sm">{t('profilePage.totalVolume')}</span>
              </div>
              <p className="text-2xl font-bold text-white">
                ${(profile?.totalVolume || 0).toLocaleString()}
              </p>
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-slate-400 text-sm">{t('profilePage.successRate')}</span>
              </div>
              <p className="text-2xl font-bold text-white">{successRate}%</p>
              <Progress value={parseFloat(successRate)} className="mt-2 h-1" />
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-slate-400 text-sm">{t('profilePage.totalEscrows')}</span>
              </div>
              <p className="text-2xl font-bold text-white">{profile?.successfulTrades || 0}</p>
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-slate-400 text-sm">{t('profilePage.avgTime')}</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {profile?.averageCompletionTime || 0}h
              </p>
            </Card>
          </div>
          
          {/* Preferred Payment Methods */}
          {profile?.preferredPaymentMethods?.length > 0 && (
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('profilePage.preferredPaymentMethods')}</h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferredPaymentMethods.map((method) => (
                  <div key={method} className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg">
                    {method}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

          {/* Escrows Tab */}
          <TabsContent value="trades" className="space-y-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-slate-300">
                  {t('profilePage.allEscrows')}
                </TabsTrigger>
                <TabsTrigger value="selling" className="data-[state=active]:bg-slate-700 text-slate-300">
                  {t('profilePage.asSeller')}
                </TabsTrigger>
                <TabsTrigger value="buying" className="data-[state=active]:bg-slate-700 text-slate-300">
                  {t('profilePage.asBuyer')}
                </TabsTrigger>
              </TabsList>
            
            <TabsContent value="all" className="mt-6 space-y-4">
              {trades.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">{t('profilePage.noEscrowsFound')}</p>
                </div>
              ) : (
                trades.slice(0, 10).map((trade, index) => (
                  <TradeCard key={trade.id} trade={trade} index={index} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="selling" className="mt-6 space-y-4">
              {trades.filter(t => t.seller_address === walletAddress).length === 0 ? (
                <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <p className="text-slate-500">{t('profilePage.noEscrowsAsSeller')}</p>
                </div>
              ) : (
                trades
                  .filter(t => t.seller_address === walletAddress)
                  .slice(0, 10)
                  .map((trade, index) => (
                    <TradeCard key={trade.id} trade={trade} index={index} />
                  ))
              )}
            </TabsContent>
            
            <TabsContent value="buying" className="mt-6 space-y-4">
              {trades.filter(t => t.buyer_address === walletAddress).length === 0 ? (
                <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <p className="text-slate-500">{t('profilePage.noEscrowsAsBuyer')}</p>
                </div>
              ) : (
                trades
                  .filter(t => t.buyer_address === walletAddress)
                  .slice(0, 10)
                  .map((trade, index) => (
                    <TradeCard key={trade.id} trade={trade} index={index} />
                  ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
      
    </div>
  );
}
