import { useState, useEffect, useMemo } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useTranslation } from '@/hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import { 
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Filter,
  Shield
} from "lucide-react";
import OfferCard from "../components/marketplace/OfferCard";
import CreateOfferModal from "../components/marketplace/CreateOfferModal";
import AcceptOfferModal from "../components/marketplace/AcceptOfferModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QueryErrorHandler from "../components/common/QueryErrorHandler";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import { useWalletGuard } from "@/components/web3/useWalletGuard";

export default function Marketplace() {
  const { t } = useTranslation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerType, setOfferType] = useState('all');
  const [chainFilter, setChainFilter] = useState('all');
  const [tokenFilter, setTokenFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [reputationFilter, setReputationFilter] = useState('all');
  const { ensureWallet, authModal } = useWalletGuard();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1' || params.get('post') === '1') {
      setCreateModalOpen(true);
    }
  }, [location.search]);

  const { data: offers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['trade-offers'],
    queryFn: () => base44.entities.TradeOffer.filter({ status: 'open' }, '-created_date', 100),
    refetchInterval: 30000,
    staleTime: 20000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });
  
  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => base44.entities.UserProfile.list()
  });
  
  const profileMap = useMemo(() => {
    return profiles.reduce((acc, profile) => {
      acc[profile.wallet_address] = profile;
      return acc;
    }, {});
  }, [profiles]);

  // Handle accepting an offer from marketplace
  const handleAcceptOffer = (offer) => {
    ensureWallet(() => {
      setSelectedOffer(offer);
      setAcceptModalOpen(true);
    });
  };
  
  // Filter and sort offers
  const filteredOffers = offers.filter(offer => {
    const typeMatch = offerType === 'all' || offer.offer_type === offerType;
    const chainMatch = chainFilter === 'all' || offer.chain === chainFilter;
    const tokenMatch = tokenFilter === 'all' || offer.token_symbol === tokenFilter;
    const searchMatch = !searchQuery || 
      offer.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.creator_address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Reputation filter
    const creatorProfile = profileMap[offer.creator_address];
    let reputationMatch = true;
    if (reputationFilter !== 'all') {
      if (reputationFilter === 'verified') {
        reputationMatch = creatorProfile?.kyc_status === 'verified';
      } else {
        reputationMatch = creatorProfile?.reputation_tier === reputationFilter;
      }
    }
    
    return typeMatch && chainMatch && tokenMatch && searchMatch && reputationMatch;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'price_asc':
        return a.price_per_unit - b.price_per_unit;
      case 'price_desc':
        return b.price_per_unit - a.price_per_unit;
      case 'amount_desc':
        return b.amount - a.amount;
      case 'amount_asc':
        return a.amount - b.amount;
      case 'newest':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'oldest':
        return new Date(a.created_date) - new Date(b.created_date);
      case 'reputation': {
        const aScore = profileMap[a.creator_address]?.reputation_score || 500;
        const bScore = profileMap[b.creator_address]?.reputation_score || 500;
        return bScore - aScore;
      }
      default:
        return a.price_per_unit - b.price_per_unit;
    }
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {t('marketplace.title')}
            </h1>
            <p className="text-slate-400 mt-1">
              {t('marketplace.subtitle')}
            </p>
          </div>
          
          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('marketplace.postAd')}
          </Button>
        </motion.div>
        
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder={t('marketplace.searchPlaceholderFull')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          
          <Select value={chainFilter} onValueChange={setChainFilter}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder={t('marketplace.chainPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">{t('marketplace.allChains')}</SelectItem>
                  <SelectItem value="BSC_TESTNET">{`${t('common.chains.bsc')} Testnet`}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={tokenFilter} onValueChange={setTokenFilter}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder={t('marketplace.tokenPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">{t('marketplace.allTokens')}</SelectItem>
              <SelectItem value="USDT">{t('common.tokens.usdt')}</SelectItem>
              <SelectItem value="USDC">{t('common.tokens.usdc')}</SelectItem>
              <SelectItem value="BTC">{t('common.tokens.btc')}</SelectItem>
              <SelectItem value="ETH">{t('common.tokens.eth')}</SelectItem>
              <SelectItem value="BNB">{t('common.tokens.bnb')}</SelectItem>
              <SelectItem value="MATIC">{t('common.tokens.matic')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-52 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder={t('marketplace.sortBy')} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="price_asc">{t('marketplace.priceLowHigh')}</SelectItem>
              <SelectItem value="price_desc">{t('marketplace.priceHighLow')}</SelectItem>
              <SelectItem value="amount_desc">{t('marketplace.amountHighLow')}</SelectItem>
              <SelectItem value="amount_asc">{t('marketplace.amountLowHigh')}</SelectItem>
              <SelectItem value="reputation">{t('marketplace.bestReputation')}</SelectItem>
              <SelectItem value="newest">{t('marketplace.newestFirst')}</SelectItem>
              <SelectItem value="oldest">{t('marketplace.oldestFirst')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={reputationFilter} onValueChange={setReputationFilter}>
            <SelectTrigger className="w-44 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder={t('marketplace.reputationPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">{t('marketplace.allUsers')}</SelectItem>
              <SelectItem value="verified">{t('marketplace.kycVerified')}</SelectItem>
              <SelectItem value="platinum">{t('marketplace.platinumOnly')}</SelectItem>
              <SelectItem value="gold">{t('marketplace.goldPlus')}</SelectItem>
              <SelectItem value="silver">{t('marketplace.silverPlus')}</SelectItem>
              <SelectItem value="bronze">{t('marketplace.bronzePlus')}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
        
        {/* Escrow Notice */}
        <Alert className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <Shield className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300 text-sm">
            <strong>{t('marketplace.smartEscrowTitle')}</strong>{' '}
            {t('marketplace.smartEscrowDescription')}
          </AlertDescription>
        </Alert>
        
        {/* Offer Type Tabs */}
        <Tabs value={offerType} onValueChange={setOfferType}>
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
              {t('marketplace.allOffers')}
            </TabsTrigger>
            <TabsTrigger value="buy" className="data-[state=active]:bg-slate-700">
              <TrendingUp className="w-4 h-4 mr-2 text-emerald-400" />
              {t('marketplace.buyOrders')}
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-slate-700">
              <TrendingDown className="w-4 h-4 mr-2 text-red-400" />
              {t('marketplace.sellOrders')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">{t('marketplace.stats.totalListings')}</p>
            <p className="text-2xl font-bold text-white">{offers.length}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 text-sm mb-1">{t('marketplace.stats.buyerListings')}</p>
            <p className="text-2xl font-bold text-white">{offers.filter(o => o.offer_type === 'buy').length}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm mb-1">{t('marketplace.stats.sellerListings')}</p>
            <p className="text-2xl font-bold text-white">{offers.filter(o => o.offer_type === 'sell').length}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-purple-400 text-sm mb-1">{t('marketplace.stats.activeEscrows')}</p>
            <p className="text-2xl font-bold text-white">{offers.length}</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <QueryErrorHandler 
            error={error} 
            retry={refetch}
            title={t('marketplace.failedToLoad')}
          />
        )}

        {/* Offers Grid */}
        {isLoading ? (
          <LoadingSpinner text={t('marketplace.loading')} />
        ) : filteredOffers.length === 0 && !error ? (
          <EmptyState
            icon={Filter}
            title={t('marketplace.noOffersFound')}
            description={t('marketplace.adjustFilters')}
            action={() => setCreateModalOpen(true)}
            actionLabel={t('marketplace.createEscrow')}
          />
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffers.map((offer, index) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                index={index}
                profile={profileMap[offer.creator_address]}
                onAcceptOffer={handleAcceptOffer}
                isMyOffer={currentUser?.email === offer.creator_address}
              />
            ))}
          </div>
        )}
        
        {/* Results Info */}
        {!isLoading && filteredOffers.length > 0 && (
          <div className="text-center text-sm text-slate-500 pt-4">
            {t('marketplace.showingResults', {
              shown: filteredOffers.length,
              total: offers.length
            })}
          </div>
        )}
      </div>
      
      <CreateOfferModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      
      <AcceptOfferModal 
        offer={selectedOffer}
        open={acceptModalOpen}
        onOpenChange={setAcceptModalOpen}
      />
      {authModal}
    </div>
  );
}
