import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Store, Shield } from "lucide-react";
import { useTranslation } from 'react-i18next';
import CreateOfferModal from "../components/marketplace/CreateOfferModal";
import MatchedOffersModal from "../components/marketplace/MatchedOffersModal";
import OfferCard from "../components/marketplace/OfferCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MyAds() {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['my-offers', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      return await base44.entities.TradeOffer.filter({ creator_address: currentUser.email }, '-created_date', 100);
    },
    enabled: !!currentUser,
    refetchInterval: 30000,
    staleTime: 20000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });
  
  const { data: allOffers = [] } = useQuery({
    queryKey: ['all-offers'],
    queryFn: () => base44.entities.TradeOffer.filter({ status: 'open' })
  });
  
  const { data: myProfile } = useQuery({
    queryKey: ['my-profile', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return null;
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: currentUser.email });
      return profiles[0];
    },
    enabled: !!currentUser
  });
  
  const filteredOffers = offers.filter(offer => {
    const typeMatch = typeFilter === 'all' || offer.offer_type === typeFilter;
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && offer.status === 'open') ||
      (statusFilter === 'matched' && offer.status === 'matched') ||
      (statusFilter === 'cancelled' && offer.status === 'cancelled') ||
      (statusFilter === 'expired' && offer.status === 'expired');
    return typeMatch && statusMatch;
  });
  
  const handleViewMatches = (offer) => {
    setSelectedOffer(offer);
    setShowMatchesModal(true);
  };
  
  const stats = {
    totalOffers: offers.length,
    activeOffers: offers.filter(o => o.status === 'open').length,
    matchedOffers: offers.filter(o => o.status === 'matched').length,
    totalVolume: offers.reduce((sum, o) => sum + (o.total_value || 0), 0),
    avgPrice: offers.length > 0 ? offers.reduce((sum, o) => sum + o.price_per_unit, 0) / offers.length : 0
  };
  
  // Calculate potential matches for my offers
  const potentialMatches = React.useMemo(() => {
    return offers.filter(myOffer => myOffer.status === 'open').map(myOffer => {
      const matches = allOffers.filter(offer => 
        offer.status === 'open' &&
        offer.creator_address !== currentUser?.email &&
        offer.offer_type !== myOffer.offer_type &&
        offer.token_symbol === myOffer.token_symbol &&
        offer.chain === myOffer.chain
      ).length;
      return { offerId: myOffer.id, matchCount: matches };
    });
  }, [offers, allOffers, currentUser]);
  
  const counts = {
    all: offers.filter(o => statusFilter === 'all' || o.status === (statusFilter === 'active' ? 'open' : statusFilter)).length,
    buy: offers.filter(o => o.offer_type === 'buy' && (statusFilter === 'all' || o.status === (statusFilter === 'active' ? 'open' : statusFilter))).length,
    sell: offers.filter(o => o.offer_type === 'sell' && (statusFilter === 'all' || o.status === (statusFilter === 'active' ? 'open' : statusFilter))).length
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {t('trade.myOffers')}
            </h1>
            <p className="text-slate-400 mt-1">{t('trade.startTrading')}</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('trade.createNewOffer')}
          </Button>
        </motion.div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-xl p-4"
          >
            <p className="text-slate-400 text-sm mb-1">{t('myAds.totalAds')}</p>
            <p className="text-2xl font-bold text-white">{stats.totalOffers}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border border-emerald-700/50 rounded-xl p-4"
          >
            <p className="text-emerald-400 text-sm mb-1">{t('myAds.active')}</p>
            <p className="text-2xl font-bold text-white">{stats.activeOffers}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/50 rounded-xl p-4"
          >
            <p className="text-blue-400 text-sm mb-1">{t('myAds.matched')}</p>
            <p className="text-2xl font-bold text-white">{stats.matchedOffers}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/50 rounded-xl p-4"
          >
            <p className="text-purple-400 text-sm mb-1">{t('myAds.totalVolume')}</p>
            <p className="text-2xl font-bold text-white">${(stats.totalVolume / 1000).toFixed(0)}k</p>
          </motion.div>
        </div>
        
        {/* Bond Info */}
        <Alert className="bg-purple-500/10 border-purple-500/30">
          <Shield className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300 text-sm">
            <strong>{t('myAds.bondSystem')}:</strong> {t('myAds.bondSystemDesc')}
          </AlertDescription>
        </Alert>
        
        {/* Quick Actions & Insights */}
        {myProfile && (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('myAds.reputationScore')}</p>
                <p className="text-2xl font-bold text-white">{myProfile.reputation_score}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">{t('myAds.feeDiscount')}</p>
                <p className="text-lg font-bold text-emerald-400">
                  {myProfile.maker_fee_discount}% {t('myAds.maker')} / {myProfile.taker_fee_discount}% {t('myAds.taker')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">{t('myAds.potentialMatches')}</p>
                <p className="text-2xl font-bold text-blue-400">
                  {potentialMatches.reduce((sum, m) => sum + m.matchCount, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <Tabs value={typeFilter} onValueChange={setTypeFilter} className="flex-1">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1 w-full">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-slate-300 flex-1">
                {t('common.all')} ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="buy" className="data-[state=active]:bg-emerald-700 data-[state=active]:text-white text-slate-300 flex-1">
                {t('common.buy')} ({counts.buy})
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-700 data-[state=active]:text-white text-slate-300 flex-1">
                {t('common.sell')} ({counts.sell})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="flex-1">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1 w-full">
              <TabsTrigger value="active" className="data-[state=active]:bg-slate-700 text-slate-300 flex-1 text-xs md:text-sm">
                {t('myAds.active')}
              </TabsTrigger>
              <TabsTrigger value="matched" className="data-[state=active]:bg-slate-700 text-slate-300 flex-1 text-xs md:text-sm">
                {t('myAds.matched')}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="data-[state=active]:bg-slate-700 text-slate-300 flex-1 text-xs md:text-sm">
                {t('myAds.cancelled')}
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-slate-300 flex-1 text-xs md:text-sm">
                {t('myAds.all')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Offers Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredOffers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700/50"
            >
              <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {t('trade.noOffersYet')}
              </h3>
              <p className="text-slate-500 mb-6">
                {t('trade.startTrading')}
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('trade.createNewOffer')}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredOffers.map((offer, index) => {
                const matchInfo = potentialMatches.find(m => m.offerId === offer.id);
                return (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    index={index}
                    profile={myProfile}
                    onViewMatches={handleViewMatches}
                    onAcceptOffer={() => {}}
                    showCancel={true}
                    isMyOffer={true}
                    matchCount={matchInfo?.matchCount}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <CreateOfferModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      
      <MatchedOffersModal
        open={showMatchesModal}
        onOpenChange={setShowMatchesModal}
        offer={selectedOffer}
        allOffers={allOffers}
      />
    </div>
  );
}