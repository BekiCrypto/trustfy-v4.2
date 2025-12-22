import { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Scale,
  CheckCircle,
  Clock,
  Search,
  Filter,
  TrendingUp,
  Award,
  Activity,
  Trophy,
  BookOpen
} from "lucide-react";
import ArbitratorDisputeCard from "../components/arbitrator/ArbitratorDisputeCard";
import ArbitratorStats from "../components/arbitrator/ArbitratorStats";
import Tiers from "../pages/Tiers";
import ProtectedPage from "../components/auth/ProtectedPage";
import { ROLES } from "../components/auth/AccessControl";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function ArbitratorDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [escalationFilter, setEscalationFilter] = useState('all');
  
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  
  useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: user?.email });
      return profiles[0] ?? null;
    },
    enabled: !!user?.email
  });
  
  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['arbitrator-disputes', user?.email],
    queryFn: () => base44.entities.Dispute.list('-created_date', 200),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const { data: allTrades = [] } = useQuery({
    queryKey: ['all-trades'],
    queryFn: () => base44.entities.Trade.list('-created_date', 200),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const { data: allArbitrators = [] } = useQuery({
    queryKey: ['all-arbitrators'],
    queryFn: async () => {
      return await base44.entities.UserProfile.filter({ platform_role: 'arbitrator' });
    }
  });
  
  // Filter disputes assigned to this arbitrator
  const myDisputes = disputes.filter(d => 
    d.arbitrator_address === user?.email && d.status === 'arbitration'
  );
  
  // All unassigned disputes (for arbitrators to pick up)
  const unassignedDisputes = disputes.filter(d => 
    !d.arbitrator_address && ['pending', 'automated_review'].includes(d.status)
  );

  // Calculate priority based on dispute age and value
  const calculatePriority = (dispute) => {
    const trade = allTrades.find(t => t.trade_id === dispute.trade_id);
    const ageHours = (Date.now() - new Date(dispute.created_date).getTime()) / (1000 * 60 * 60);
    const value = trade?.amount || 0;
    
    if (ageHours > 72 || value > 10000) return 'high';
    if (ageHours > 48 || value > 5000) return 'medium';
    return 'low';
  };
  
  const pendingDisputes = myDisputes.filter(d => d.ruling === 'pending');
  const resolvedDisputes = disputes.filter(d => 
    d.arbitrator_address === user?.email && d.status === 'resolved'
  );

  // Apply filters
  const filterDisputes = (disputeList) => {
    return disputeList.filter(dispute => {
      const priority = calculatePriority(dispute);
      
      // Search filter
      const matchesSearch = !searchQuery || 
        dispute.trade_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;
      
      // Escalation filter
      const matchesEscalation = escalationFilter === 'all' || 
        dispute.escalation_level?.toString() === escalationFilter;
      
      return matchesSearch && matchesPriority && matchesEscalation;
    });
  };

  const filteredPending = filterDisputes(pendingDisputes);
  const filteredUnassigned = filterDisputes(unassignedDisputes);
  const filteredResolved = filterDisputes(resolvedDisputes);

  // Performance metrics
  const totalResolved = resolvedDisputes.length;
  const avgResolutionTime = resolvedDisputes.length > 0
    ? resolvedDisputes.reduce((sum, d) => {
        const start = new Date(d.created_date).getTime();
        const end = new Date(d.resolved_at).getTime();
        return sum + (end - start);
      }, 0) / (resolvedDisputes.length * 1000 * 60 * 60) // Convert to hours
    : 0;
  
  const rulingDistribution = {
    favor_seller: resolvedDisputes.filter(d => d.ruling === 'favor_seller').length,
    favor_buyer: resolvedDisputes.filter(d => d.ruling === 'favor_buyer').length,
    split: resolvedDisputes.filter(d => d.ruling === 'split').length
  };

  // Arbitrator leaderboard
  const arbitratorLeaderboard = allArbitrators.map(arb => {
    const arbDisputes = disputes.filter(d => d.arbitrator_address === arb.wallet_address);
    const resolved = arbDisputes.filter(d => d.status === 'resolved');
    return {
      ...arb,
      totalResolved: resolved.length,
      pending: arbDisputes.filter(d => d.status === 'arbitration').length
    };
  }).sort((a, b) => b.totalResolved - a.totalResolved).slice(0, 5);

  // High priority disputes
  const highPriorityDisputes = pendingDisputes.filter(d => {
    const priority = calculatePriority(d);
    return priority === 'high';
  });
  
  if (loadingUser || isLoading) {
    return <LoadingSpinner text={t('arbitratorPage.loadingDashboard')} />;
  }
  
  return (
    <ProtectedPage requiredRoles={[ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN]} pageName="ArbitratorDashboard">
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('arbitrator.arbitrationCenter')}</h1>
              <p className="text-slate-400">{t('arbitrator.reviewResolveProfessionally')}</p>
            </div>
          </div>
        </motion.div>
        
        {/* High Priority Alert */}
        {highPriorityDisputes.length > 0 && (
          <Alert className="bg-red-500/10 border-red-500/30 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              <strong>{t('arbitrator.urgentLabel')}</strong> {t('arbitrator.urgentNotice', { count: highPriorityDisputes.length })}
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700/50 p-5">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-amber-400 font-semibold">{t('arbitrator.pending')}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{pendingDisputes.length}</p>
              <p className="text-slate-400 text-sm">{t('arbitrator.assignedToYou')}</p>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50 p-5">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-blue-400 font-semibold">{t('arbitrator.available')}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{unassignedDisputes.length}</p>
              <p className="text-slate-400 text-sm">{t('arbitrator.unassignedCases')}</p>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border-emerald-700/50 p-5">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold">{t('arbitrator.resolved')}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{totalResolved}</p>
              <p className="text-slate-400 text-sm">{t('arbitrator.totalCases')}</p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50 p-5">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-purple-400 font-semibold">{t('arbitrator.avgTime')}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{avgResolutionTime.toFixed(1)}h</p>
              <p className="text-slate-400 text-sm">{t('arbitrator.resolutionTime')}</p>
            </Card>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                {t('arbitrator.yourPerformance')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">{t('arbitrator.rulingDistribution')}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 text-sm">{t('arbitrator.sellerWins')}</span>
                    <span className="text-white font-semibold">{rulingDistribution.favor_seller}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 text-sm">{t('arbitrator.buyerWins')}</span>
                    <span className="text-white font-semibold">{rulingDistribution.favor_buyer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 text-sm">{t('arbitrator.split')}</span>
                    <span className="text-white font-semibold">{rulingDistribution.split}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">{t('arbitrator.efficiencyScore')}</p>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-2xl font-bold text-white">
                    {totalResolved > 0 ? ((totalResolved / (totalResolved + pendingDisputes.length)) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1">{t('arbitrator.casesClosedRate')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">{t('arbitrator.activeWorkload')}</p>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{pendingDisputes.length}</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">{t('arbitrator.casesInProgress')}</p>
              </div>
            </div>
            </Card>

            {/* Arbitrator Leaderboard */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Top Arbitrators
              </h3>
              <div className="space-y-3">
                {arbitratorLeaderboard.map((arb, idx) => (
                  <div key={arb.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                    <Badge className={
                      idx === 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      idx === 1 ? 'bg-slate-400/20 text-slate-300 border-slate-400/30' :
                      idx === 2 ? 'bg-orange-700/20 text-orange-400 border-orange-700/30' :
                      'bg-slate-600/20 text-slate-400 border-slate-600/30'
                    }>
                      #{idx + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{arb.display_name}</p>
                      <p className="text-slate-400 text-xs">{t('arbitrator.resolvedShort', { count: arb.totalResolved })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">{arb.reputation_score}</p>
                      <p className="text-slate-500 text-xs capitalize">{arb.reputation_tier}</p>
                    </div>
                  </div>
                ))}
                {arbitratorLeaderboard.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">{t('arbitrator.noArbitratorsYet')}</p>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
        
        {/* Disputes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-900/50 border border-slate-700/50 p-1">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('arbitratorPage.pending')} ({filteredPending.length})
              </TabsTrigger>
              <TabsTrigger value="unassigned" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t('arbitrator.availableTab')} ({filteredUnassigned.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {t('arbitratorPage.resolved')} ({filteredResolved.length})
              </TabsTrigger>
              <TabsTrigger value="tiers" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {t('arbitrator.userTiers')}
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Stats Component */}
            <ArbitratorStats 
              pendingCount={pendingDisputes.length}
              resolvedCount={totalResolved}
              totalAssigned={myDisputes.length + resolvedDisputes.length}
              avgResolutionTime={avgResolutionTime}
              rulingDistribution={rulingDistribution}
            />

            {/* Filters */}
            <Card className="bg-slate-900/50 border-slate-700/50 p-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">{t('arbitrator.filters')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setPriorityFilter('all');
                    setEscalationFilter('all');
                  }}
                  className="text-slate-400 text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">{t('arbitrator.search')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder={t('arbitrator.tradeIdReason')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">{t('arbitrator.priority')}</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">{t('arbitrator.allPriorities')}</SelectItem>
                      <SelectItem value="high">{t('arbitrator.highPriority')}</SelectItem>
                      <SelectItem value="medium">{t('arbitrator.mediumPriority')}</SelectItem>
                      <SelectItem value="low">{t('arbitrator.lowPriority')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">{t('arbitrator.escalationLevel')}</label>
                  <Select value={escalationFilter} onValueChange={setEscalationFilter}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">{t('arbitrator.allLevels')}</SelectItem>
                      <SelectItem value="1">{t('arbitrator.tier1Automated')}</SelectItem>
                      <SelectItem value="2">{t('arbitrator.tier2HumanReview')}</SelectItem>
                      <SelectItem value="3">{t('arbitrator.tier3DAOVote')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
            
            <TabsContent value="pending" className="mt-6">
              {filteredPending.length === 0 ? (
                <Card className="bg-slate-900/50 border-slate-700/50 p-12 text-center">
                  <Scale className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    {searchQuery || priorityFilter !== 'all' || escalationFilter !== 'all'
                      ? t('arbitrator.noDisputesMatchFilters')
                      : t('arbitratorPage.noPendingDisputes')}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    {searchQuery || priorityFilter !== 'all' || escalationFilter !== 'all'
                      ? t('arbitrator.tryAdjustingFilters')
                      : t('arbitratorPage.allAssignedResolved')}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredPending.map((dispute, idx) => {
                    const priority = calculatePriority(dispute);
                    return (
                      <div key={dispute.id} className="relative">
                        {priority === 'high' && (
                          <div className="absolute -left-1 top-0 bottom-0 w-1 bg-red-500 rounded-full" />
                        )}
                        <ArbitratorDisputeCard dispute={dispute} index={idx} />
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unassigned" className="mt-6">
              {filteredUnassigned.length === 0 ? (
                <Card className="bg-slate-900/50 border-slate-700/50 p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">{t('arbitrator.noUnassignedDisputes')}</p>
                  <p className="text-slate-500 text-sm mt-2">{t('arbitrator.allDisputesAssigned')}</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-4">
                    <p className="text-blue-400 text-sm">
                      💡 {t('arbitrator.awaitingAssignment')}
                    </p>
                  </div>
                  {filteredUnassigned.map((dispute, idx) => (
                    <ArbitratorDisputeCard key={dispute.id} dispute={dispute} index={idx} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resolved" className="mt-6">
              {filteredResolved.length === 0 ? (
                <Card className="bg-slate-900/50 border-slate-700/50 p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    {searchQuery || priorityFilter !== 'all' || escalationFilter !== 'all'
                      ? t('arbitrator.noResolvedDisputesFilters')
                      : t('arbitratorPage.noResolvedDisputes')}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredResolved.map((dispute, idx) => (
                    <ArbitratorDisputeCard key={dispute.id} dispute={dispute} resolved index={idx} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tiers" className="mt-6">
              <Card className="bg-slate-900/50 border-slate-700/50 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('arbitrator.userReputationSystem')}</h3>
                    <p className="text-slate-400 text-sm">{t('arbitrator.understandUserTiers')}</p>
                  </div>
                </div>
              </Card>
              <Tiers />
            </TabsContent>
          </Tabs>
        </motion.div>
        </div>
      </div>
    </ProtectedPage>
  );
}
