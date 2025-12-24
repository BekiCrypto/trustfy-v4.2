import React, { useState } from 'react';
import { userApi } from "@/api/user";
import { tradesApi } from "@/api/trades";
import { disputesApi } from "@/api/disputes";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthContext } from "@/context/AuthContext";
import { 
  Plus, 
  Shield, 
  TrendingUp, 
  Activity, 
  Users, 
  AlertTriangle,
  ArrowRight,
  Wallet,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatsCard from "../components/common/StatsCard";
import TradeCard from "../components/trade/TradeCard";
import CreateTradeModal from "../components/trade/CreateTradeModal";
import RecentActivity from "../components/dashboard/RecentActivity";
import VolumeChart from "../components/dashboard/VolumeChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QueryErrorHandler from "../components/common/QueryErrorHandler";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dashboard() {
  const { t } = useTranslation();
  const { session } = useAuthContext();
  const hasSession = Boolean(session?.accessToken);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => userApi.me(),
    enabled: hasSession
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.address],
    queryFn: async () => {
      // user object from me() already contains profile info
      return user || null;
    },
    enabled: !!user?.address
  });
  
  const { data: trades = [], isLoading: tradesLoading, error: tradesError, refetch: refetchTrades } = useQuery({
    queryKey: ['user-trades', user?.address],
    queryFn: async () => {
      if (!user?.address) return [];
      const response = await tradesApi.listEscrows({ role: 'participant' });
      // Map backend response to frontend format
      return (response.items || []).map(t => ({
        ...t,
        id: t.escrowId,
        trade_id: t.escrowId,
        seller_address: t.seller,
        buyer_address: t.buyer,
        amount: parseFloat(t.amount),
        token_symbol: t.tokenKey,
        status: t.state.toLowerCase(),
        created_date: t.updatedAt,
        chain: t.chainId
      }));
    },
    enabled: !!user?.address,
    refetchInterval: 30000,
    retry: 3,
    refetchOnWindowFocus: false
  });
  
  const { data: disputes = [] } = useQuery({
    queryKey: ['user-disputes', user?.address],
    queryFn: async () => {
      if (!user?.address) return [];
      // Fetch all disputes and filter by user's trades
      // Ideally backend should support participant filter
      const allDisputes = await disputesApi.list();
      return allDisputes.filter(d => 
        trades.some(t => t.id === d.escrowId)
      );
    },
    enabled: !!user?.address && trades.length > 0
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['user-offers', user?.address],
    queryFn: async () => {
      if (!user?.address) return [];
      return await tradesApi.listOffers({ creator: user.address });
    },
    enabled: !!user?.address
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.address],
    queryFn: async () => {
      if (!user?.address) return [];
      const notifs = await userApi.getNotifications();
      return notifs.filter(n => !n.read);
    },
    enabled: !!user?.address
  });
  
  // Calculate comprehensive stats
  const totalVolume = trades.reduce((acc, t) => acc + (t.amount || 0), 0);
  const activeTrades = trades.filter(t => ['pending', 'funded', 'in_progress'].includes(t.status)).length;
  const completedTrades = trades.filter(t => t.status === 'completed').length;
  const activeDisputes = disputes.filter(d => !['resolved', 'rejected'].includes(d.status)).length;
  const successRate = trades.length > 0 ? ((completedTrades / trades.length) * 100).toFixed(1) : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header with Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {user
                  ? `${t('dashboard.welcome')}, ${user?.displayName || user?.address?.slice(0, 8)}!`
                  : 'Welcome to Trustfy'}
              </h1>
              <p className="text-slate-400 mt-1">
                {user ? t('dashboard.subtitle') : 'Browse public escrow activity and market insights.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Marketplace')}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                      {t('dashboard.browseMarket')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                    <p>View all active buy and sell offers</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
              {hasSession ? (
                <Link to={createPageUrl('CreateEscrow')}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('dashboard.createOffer')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                      <p>Create a new buy or sell advertisement</p>
                    </TooltipContent>
                  </Tooltip>
                </Link>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      {t('dashboard.connectWalletAction')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                    <p>Connect your Web3 wallet to start trading</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          {!hasSession && (
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                {t('dashboard.noWalletNotice')}
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Quick Stats Banner */}
          {profile && (
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{t('dashboard.yourReputation')}</p>
                    <p className="text-2xl font-bold text-white">{profile.reputationScore} <span className="text-sm text-purple-400">• Standard</span></p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-slate-400">{t('dashboard.tradeSuccess')}</p>
                    <p className="text-lg font-semibold text-emerald-400">{successRate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">{t('dashboard.trustTier')}</p>
                    <p className="text-lg font-semibold text-blue-400">{profile.prime ? 'Prime' : 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">{t('dashboard.avgResponse')}</p>
                    <p className="text-lg font-semibold text-purple-400">1h</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to={createPageUrl('Marketplace')} className="block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
                    <TrendingUp className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white font-medium text-sm">{t('dashboard.browseP2P')}</p>
                    <p className="text-slate-500 text-xs">{t('dashboard.findOffers')}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                  <p>Browse active listings in the marketplace</p>
                </TooltipContent>
              </Tooltip>
            </Link>
            <Link to={createPageUrl('MyAds')} className="block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
                    <Plus className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white font-medium text-sm">{t('dashboard.postAd')}</p>
                    <p className="text-slate-500 text-xs">{offers.length} {t('dashboard.activeAds')}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                  <p>Manage your buy/sell advertisements</p>
                </TooltipContent>
              </Tooltip>
            </Link>
            <Link to={createPageUrl('CreditWallet')} className="block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
                    <Shield className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white font-medium text-sm">{t('dashboard.bondCredits')}</p>
                    <p className="text-slate-500 text-xs">{t('dashboard.managePool')}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                  <p>View and manage your bond credits</p>
                </TooltipContent>
              </Tooltip>
            </Link>
            <Link to={createPageUrl('Profile')} className="block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
                    <Users className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white font-medium text-sm">{t('dashboard.myProfile')}</p>
                    <p className="text-slate-500 text-xs">{profile?.reputationScore || 0} Rep</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                  <p>View your public profile and stats</p>
                </TooltipContent>
              </Tooltip>
            </Link>
          </div>
        </motion.div>
        
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Total Escrow Volume"
            value={totalVolume.toLocaleString()}
            icon={TrendingUp}
            gradient="from-blue-500/20 to-blue-600/20"
            trend="up"
            trendValue={`${trades.length} escrows`}
            prefix=""
            suffix=" tokens"
          />
          <StatsCard
            title="Active Escrows"
            value={activeTrades}
            icon={Activity}
            gradient="from-emerald-500/20 to-emerald-600/20"
            subtitle={`${trades.length} total escrows`}
          />
          <StatsCard
            title="Completion Rate"
            value={`${successRate}%`}
            icon={Shield}
            gradient="from-purple-500/20 to-purple-600/20"
            subtitle={`${completedTrades} resolved`}
          />
          <StatsCard
            title="Open Disputes"
            value={activeDisputes}
            icon={AlertTriangle}
            gradient={activeDisputes > 0 ? "from-red-500/20 to-red-600/20" : "from-emerald-500/20 to-emerald-600/20"}
            subtitle={activeDisputes === 0 ? "All resolved" : "Needs attention"}
          />
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Active Notifications */}
            {notifications.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400">{t('dashboard.recentAlerts')}</h3>
                {notifications.slice(0, 2).map((notif, idx) => (
                  <Alert key={notif.id} className="bg-blue-500/10 border-blue-500/30">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-300 text-sm">
                      <strong>{notif.title}:</strong> {notif.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Recent Escrows */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{t('dashboard.recentOrders')}</h2>
                <Link to={createPageUrl('Orders')}>
                  <Button variant="ghost" className="text-slate-400 hover:text-white text-sm">
                    {t('dashboard.viewAll')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              {tradesError && (
                <QueryErrorHandler 
                  error={tradesError} 
                  retry={refetchTrades}
                  title={t('dashboard.loadEscrowsFailed')}
                />
              )}

              {tradesLoading ? (
                <LoadingSpinner text={t('dashboard.loadingEscrows')} />
              ) : trades.length === 0 && !tradesError ? (
                <EmptyState
                  icon={Wallet}
                  title={t('dashboard.noEscrowsTitle')}
                  description={t('dashboard.noEscrowsDescription')}
                >
                  <div className="flex gap-3 justify-center">
                    <Link to={createPageUrl('Marketplace')}>
                      <Button variant="outline" className="border-slate-600">
                        {t('dashboard.browseMarket')}
                      </Button>
                    </Link>
                    <Link to={createPageUrl('MyAds')}>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('dashboard.createOffer')}
                      </Button>
                    </Link>
                  </div>
                </EmptyState>
              ) : !tradesError && (
                <div className="space-y-4">
                  {trades.slice(0, 5).map((trade, index) => (
                    <TradeCard key={trade.id} trade={trade} index={index} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Right Column - Activity & Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <VolumeChart trades={trades} />
            <RecentActivity trades={trades} disputes={disputes} />
          </motion.div>
        </div>
      </div>
      
      <CreateTradeModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
