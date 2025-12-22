import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus,
  Code,
  BookOpen,
  Terminal,
  Shield,
  Zap,
  Bot,
  TrendingUp,
  AlertCircle,
  Brain,
  Sparkles,
  Play,
  Pause,
  CheckCircle,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  DollarSign,
  TrendingDown,
  Wallet,
  Clock,
  Target,
  Percent,
  Lock,
  Unlock,
  Activity,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  History,
  Flame,
  Timer
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function TradingAPI() {
  const { t } = useTranslation();
  const [showKey, setShowKey] = useState({});
  const [strategyInput, setStrategyInput] = useState('');
  const [analyzingStrategy, setAnalyzingStrategy] = useState(false);
  const [strategyAnalysis, setStrategyAnalysis] = useState(null);
  const [detectingArbitrage, setDetectingArbitrage] = useState(false);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState([]);
  const [autoArbitrage, setAutoArbitrage] = useState(false);
  const [arbitrageSortBy, setArbitrageSortBy] = useState('roi'); // roi, profit, volume
  const [minProfitFilter, setMinProfitFilter] = useState(1);
  const [selectedToken, setSelectedToken] = useState('all');
  const [opportunityHistory, setOpportunityHistory] = useState([]);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: currentUser?.email });
      return profiles[0];
    },
    enabled: !!currentUser?.email
  });

  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState(null);

  const generateAPIKey = useMutation({
    mutationFn: async (keyName) => {
      // Generate a more secure key with timestamp and random components
      const timestamp = Date.now().toString(36);
      const random1 = Math.random().toString(36).substring(2, 15);
      const random2 = Math.random().toString(36).substring(2, 15);
      const apiKey = `trst_${timestamp}_${random1}${random2}`;
      const apiKeys = profile?.api_keys || [];
      
      return base44.entities.UserProfile.update(profile.id, {
        api_keys: [...apiKeys, {
          key: apiKey,
          name: keyName || `API Key ${apiKeys.length + 1}`,
          created_at: new Date().toISOString(),
          last_used: null,
          permissions: ['read', 'trade'], // Future: customizable permissions
          rate_limit: 100 // requests per minute
        }]
      });
    },
    onSuccess: (data) => {
      const newKey = data.api_keys[data.api_keys.length - 1];
      setNewlyGeneratedKey(newKey.key);
      queryClient.invalidateQueries({ queryKey: ['current-profile'] });
      toast.success('API key generated successfully!', {
        description: 'Make sure to copy it now - you won\'t see it again'
      });
    },
    onError: () => {
      toast.error('Failed to generate API key');
    }
  });

  const deleteAPIKey = useMutation({
    mutationFn: async (keyToDelete) => {
      const apiKeys = profile?.api_keys?.filter(k => k.key !== keyToDelete) || [];
      return base44.entities.UserProfile.update(profile.id, { api_keys: apiKeys });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-profile'] });
      toast.success('API key revoked successfully');
    }
  });

  const handleGenerateKey = () => {
    generateAPIKey.mutate(newKeyName);
    setNewKeyName('');
    setShowNewKeyModal(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Filter and sort opportunities
  const filteredOpportunities = React.useMemo(() => {
    let filtered = arbitrageOpportunities.filter(opp => {
      const meetsMinProfit = parseFloat(opp.netProfitPercent) >= minProfitFilter;
      const meetsTokenFilter = selectedToken === 'all' || opp.token === selectedToken;
      return meetsMinProfit && meetsTokenFilter;
    });

    // Sort based on selection
    switch (arbitrageSortBy) {
      case 'roi':
        filtered.sort((a, b) => parseFloat(b.netProfitPercent) - parseFloat(a.netProfitPercent));
        break;
      case 'profit':
        filtered.sort((a, b) => parseFloat(b.netProfit) - parseFloat(a.netProfit));
        break;
      case 'volume':
        filtered.sort((a, b) => b.maxAmount - a.maxAmount);
        break;
      default:
        break;
    }

    return filtered;
  }, [arbitrageOpportunities, arbitrageSortBy, minProfitFilter, selectedToken]);

  // Get unique tokens for filter
  const availableTokens = React.useMemo(() => {
    const tokens = new Set(arbitrageOpportunities.map(opp => opp.token));
    return Array.from(tokens);
  }, [arbitrageOpportunities]);

  const apiKeys = profile?.api_keys || [];

  const { data: offers = [] } = useQuery({
    queryKey: ['trade-offers'],
    queryFn: () => base44.entities.TradeOffer.list(),
    refetchInterval: autoArbitrage ? 10000 : false
  });

  const analyzeStrategy = async () => {
    if (!strategyInput.trim()) {
      toast.error('Please enter a trading strategy');
      return;
    }

    setAnalyzingStrategy(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert cryptocurrency trading advisor. Analyze the following trading strategy and provide:
1. A structured breakdown of the strategy
2. Risk assessment (score 1-10 where 10 is highest risk)
3. Potential profit opportunities
4. Risk mitigation suggestions
5. Implementation parameters (entry/exit points, stop-loss levels)

Strategy: "${strategyInput}"

Return a JSON response with this exact structure:
{
  "strategy_name": "string",
  "parsed_strategy": {
    "action": "buy/sell",
    "token": "string",
    "condition": "string",
    "trigger_percentage": number,
    "exit_strategy": "string"
  },
  "risk_score": number (1-10),
  "risk_level": "low/medium/high",
  "profit_potential": "string description",
  "risks": ["array of risk factors"],
  "mitigation_suggestions": ["array of suggestions"],
  "implementation": {
    "entry_price": "string",
    "exit_price": "string",
    "stop_loss": "string",
    "position_size": "string"
  },
  "improvements": ["array of strategy improvements"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            strategy_name: { type: "string" },
            parsed_strategy: {
              type: "object",
              properties: {
                action: { type: "string" },
                token: { type: "string" },
                condition: { type: "string" },
                trigger_percentage: { type: "number" },
                exit_strategy: { type: "string" }
              }
            },
            risk_score: { type: "number" },
            risk_level: { type: "string" },
            profit_potential: { type: "string" },
            risks: { type: "array", items: { type: "string" } },
            mitigation_suggestions: { type: "array", items: { type: "string" } },
            implementation: {
              type: "object",
              properties: {
                entry_price: { type: "string" },
                exit_price: { type: "string" },
                stop_loss: { type: "string" },
                position_size: { type: "string" }
              }
            },
            improvements: { type: "array", items: { type: "string" } }
          }
        }
      });

      setStrategyAnalysis(response);
      toast.success('Strategy analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze strategy');
      console.error(error);
    } finally {
      setAnalyzingStrategy(false);
    }
  };

  const detectArbitrage = async () => {
    setDetectingArbitrage(true);
    try {
      // Group offers by token and fiat currency
      const offersByTokenAndCurrency = {};
      
      offers.forEach(offer => {
        if (offer.status !== 'open') return;
        
        const key = `${offer.token_symbol}_${offer.fiat_currency || 'USD'}`;
        
        if (!offersByTokenAndCurrency[key]) {
          offersByTokenAndCurrency[key] = { 
            buy: [], 
            sell: [],
            token: offer.token_symbol,
            currency: offer.fiat_currency || 'USD'
          };
        }
        
        if (offer.offer_type === 'buy') {
          offersByTokenAndCurrency[key].buy.push(offer);
        } else {
          offersByTokenAndCurrency[key].sell.push(offer);
        }
      });

      const opportunities = [];
      
      for (const [key, tokenOffers] of Object.entries(offersByTokenAndCurrency)) {
        // Sort: highest buy price first, lowest sell price first
        const buyOffers = tokenOffers.buy
          .sort((a, b) => b.price_per_unit - a.price_per_unit)
          .filter(o => (o.amount - (o.filled_amount || 0)) > 0);
          
        const sellOffers = tokenOffers.sell
          .sort((a, b) => a.price_per_unit - b.price_per_unit)
          .filter(o => (o.amount - (o.filled_amount || 0)) > 0);
        
        if (buyOffers.length > 0 && sellOffers.length > 0) {
          const highestBuy = buyOffers[0];
          const lowestSell = sellOffers[0];
          
          const buyPrice = lowestSell.price_per_unit;
          const sellPrice = highestBuy.price_per_unit;
          const priceDiff = sellPrice - buyPrice;
          const profitPercent = ((priceDiff / buyPrice) * 100);
          
          // Calculate max tradeable amount
          const maxAmount = Math.min(
            lowestSell.amount - (lowestSell.filled_amount || 0),
            highestBuy.amount - (highestBuy.filled_amount || 0)
          );
          
          // Fees: 1% maker + 1.5% taker = 2.5% total
          const totalFees = 0.025;
          const grossProfit = priceDiff * maxAmount;
          const feeAmount = (buyPrice * maxAmount + sellPrice * maxAmount) * (totalFees / 2);
          const netProfit = grossProfit - feeAmount;
          const netProfitPercent = ((netProfit / (buyPrice * maxAmount)) * 100);
          
          // Only show if net profit is positive and > 1%
          if (netProfit > 0 && netProfitPercent > 1) {
            opportunities.push({
              token: tokenOffers.token,
              currency: tokenOffers.currency,
              buyFrom: lowestSell,
              sellTo: highestBuy,
              buyPrice,
              sellPrice,
              priceDiff,
              profitPercent: profitPercent.toFixed(2),
              maxAmount,
              grossProfit: grossProfit.toFixed(2),
              feeAmount: feeAmount.toFixed(2),
              netProfit: netProfit.toFixed(2),
              netProfitPercent: netProfitPercent.toFixed(2),
              roi: ((netProfit / (buyPrice * maxAmount)) * 100).toFixed(2),
              investment: (buyPrice * maxAmount).toFixed(2),
              timestamp: Date.now()
            });
          }
        }
      }

      const sortedOpps = opportunities.sort((a, b) => parseFloat(b.netProfitPercent) - parseFloat(a.netProfitPercent));
      setArbitrageOpportunities(sortedOpps);
      
      // Add to history
      if (sortedOpps.length > 0) {
        const newHistoryEntry = {
          timestamp: Date.now(),
          count: sortedOpps.length,
          bestRoi: sortedOpps[0].netProfitPercent,
          bestToken: sortedOpps[0].token,
          totalPotentialProfit: sortedOpps.reduce((sum, opp) => sum + parseFloat(opp.netProfit), 0).toFixed(2)
        };
        setOpportunityHistory(prev => [newHistoryEntry, ...prev.slice(0, 19)]); // Keep last 20
        
        toast.success(`🎯 Found ${sortedOpps.length} profitable arbitrage opportunities!`, {
          description: `Best: ${sortedOpps[0].netProfitPercent}% ROI on ${sortedOpps[0].token}`
        });
      } else {
        toast.info('No profitable arbitrage opportunities found', {
          description: 'Market prices are currently aligned'
        });
      }
    } catch (error) {
      toast.error('Failed to scan for arbitrage');
      console.error(error);
    } finally {
      setDetectingArbitrage(false);
    }
  };

  // Prime status requires KYC verification
  const hasKYC = profile?.kyc_status === 'verified';
  const isPrime = hasKYC;

  // Show Prime gate if not Prime
  if (!isPrime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
        
        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
              <Bot className="w-12 h-12 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Trading API & Automation</h1>
            <p className="text-slate-400">Prime feature - Upgrade to access</p>
          </motion.div>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-8">
            <div className="text-center mb-6">
              <Lock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Prime Access Required</h2>
              <p className="text-slate-400">
                Trading API, automation, and arbitrage scanning are available exclusively for Prime members
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Full REST API access</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>AI-powered strategy analysis</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Real-time arbitrage scanner</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Unlimited API keys</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Advanced rate limits (100 req/min)</span>
              </div>
            </div>

            <Link to={createPageUrl('Settings')}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" size="lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Upgrade to Prime
              </Button>
            </Link>

            <p className="text-xs text-slate-500 text-center mt-4">
              Complete KYC verification via Settings → Prime Account
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">{t('tradingBots.title')}</h1>
          </div>
          <p className="text-slate-400">{t('tradingBots.subtitle')}</p>
        </motion.div>

        <Tabs defaultValue="ai-strategies" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="ai-strategies" className="data-[state=active]:bg-slate-700">
              <Brain className="w-4 h-4 mr-2" />
              {t('tradingBots.aiStrategies')}
            </TabsTrigger>
            <TabsTrigger value="arbitrage" className="data-[state=active]:bg-slate-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t('tradingBots.arbitrageScanner')}
            </TabsTrigger>
            <TabsTrigger value="keys" className="data-[state=active]:bg-slate-700">
              <Key className="w-4 h-4 mr-2" />
              {t('tradingBots.apiKeys')}
            </TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-slate-700">
              <BookOpen className="w-4 h-4 mr-2" />
              {t('tradingBots.documentation')}
            </TabsTrigger>
            <TabsTrigger value="examples" className="data-[state=active]:bg-slate-700">
              <Code className="w-4 h-4 mr-2" />
              {t('tradingBots.examples')}
            </TabsTrigger>
          </TabsList>

          {/* AI Strategy Builder */}
          <TabsContent value="ai-strategies" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('tradingBots.aiStrategyBuilder')}</h2>
                  <p className="text-sm text-slate-400">{t('tradingBots.describeStrategy')}</p>
                </div>
              </div>
              
              <Textarea
                placeholder={t('tradingBots.exampleStrategy')}
                value={strategyInput}
                onChange={(e) => setStrategyInput(e.target.value)}
                className="min-h-[100px] bg-slate-900/50 border-slate-700 text-white mb-4"
              />
              
              <Button
                onClick={analyzeStrategy}
                disabled={analyzingStrategy || !strategyInput.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {analyzingStrategy ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-spin" />
                    {t('tradingBots.analyzing')}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {t('tradingBots.analyzeWithAI')}
                  </>
                )}
              </Button>
            </Card>

            {strategyAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Strategy Overview */}
                <Card className="bg-slate-900/50 border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    {strategyAnalysis.strategy_name}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">Risk Level</p>
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-bold ${
                          strategyAnalysis.risk_level === 'low' ? 'text-emerald-400' :
                          strategyAnalysis.risk_level === 'medium' ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                          {strategyAnalysis.risk_score}/10
                        </div>
                        <span className="text-sm text-slate-400 capitalize">
                          ({strategyAnalysis.risk_level})
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">Profit Potential</p>
                      <p className="text-sm text-white">{strategyAnalysis.profit_potential}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-sm font-medium text-blue-400 mb-2">Parsed Strategy</p>
                      <div className="text-xs text-slate-300 space-y-1">
                        <p><span className="text-slate-500">Action:</span> {strategyAnalysis.parsed_strategy.action}</p>
                        <p><span className="text-slate-500">Token:</span> {strategyAnalysis.parsed_strategy.token}</p>
                        <p><span className="text-slate-500">Condition:</span> {strategyAnalysis.parsed_strategy.condition}</p>
                        <p><span className="text-slate-500">Trigger:</span> {strategyAnalysis.parsed_strategy.trigger_percentage}%</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Risk Assessment */}
                <Card className="bg-slate-900/50 border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Risk Assessment & Mitigation
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-2">Identified Risks:</p>
                      <ul className="space-y-2">
                        {strategyAnalysis.risks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-2">Mitigation Suggestions:</p>
                      <ul className="space-y-2">
                        {strategyAnalysis.mitigation_suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Implementation Guide */}
                <Card className="bg-slate-900/50 border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    Implementation Parameters
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">Entry Price</p>
                      <p className="text-sm text-white font-mono">{strategyAnalysis.implementation.entry_price}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">Exit Price</p>
                      <p className="text-sm text-white font-mono">{strategyAnalysis.implementation.exit_price}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">Stop Loss</p>
                      <p className="text-sm text-red-400 font-mono">{strategyAnalysis.implementation.stop_loss}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">Position Size</p>
                      <p className="text-sm text-white font-mono">{strategyAnalysis.implementation.position_size}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-300 mb-2">Suggested Improvements:</p>
                    <ul className="space-y-2">
                      {strategyAnalysis.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Arbitrage Scanner */}
          <TabsContent value="arbitrage" className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-emerald-500/30 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{t('tradingBots.arbitrageScanner')}</h2>
                      <p className="text-sm text-slate-300">{t('tradingBots.aiPoweredDetection')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                      <Switch
                        checked={autoArbitrage}
                        onCheckedChange={setAutoArbitrage}
                        id="auto-arbitrage"
                      />
                      <Label htmlFor="auto-arbitrage" className="text-sm text-slate-300 cursor-pointer">
                        {t('tradingBots.autoScan')}
                      </Label>
                    </div>
                    
                    <Button
                      onClick={detectArbitrage}
                      disabled={detectingArbitrage}
                      className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-lg shadow-emerald-500/20"
                    >
                      {detectingArbitrage ? (
                        <>
                          <Bot className="w-4 h-4 mr-2 animate-spin" />
                          {t('tradingBots.scanning')}
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {t('tradingBots.scanNow')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {autoArbitrage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                          </div>
                          <p className="text-sm text-emerald-400 font-semibold">{t('tradingBots.liveAutoScanning')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-slate-400" />
                          <p className="text-xs text-slate-400">{t('tradingBots.refreshingEvery')}</p>
                        </div>
                      </div>
                      {arbitrageOpportunities.length > 0 && (
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Flame className="w-3 h-3" />
                            <span className="font-medium">{arbitrageOpportunities.length} {t('tradingBots.active')}</span>
                          </div>
                          <div className="text-slate-400">
                            {t('tradingBots.best')}: {arbitrageOpportunities[0].netProfitPercent}% ROI
                          </div>
                          <div className="text-slate-400">
                            {t('tradingBots.totalPotential')}: ${arbitrageOpportunities.reduce((sum, opp) => sum + parseFloat(opp.netProfit), 0).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              
                {/* Market Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-slate-500">{t('tradingBots.activeOffers')}</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{offers.filter(o => o.status === 'open').length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-800/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <p className="text-xs text-emerald-400">{t('tradingBots.opportunities')}</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{filteredOpportunities.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-800/20 border border-cyan-500/30 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <p className="text-xs text-cyan-400">{t('tradingBots.bestROI')}</p>
                    </div>
                    <p className="text-2xl font-bold text-cyan-400">
                      {filteredOpportunities.length > 0 ? `${filteredOpportunities[0].netProfitPercent}%` : '0%'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-800/20 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-purple-400">{t('tradingBots.totalProfit')}</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">
                      ${filteredOpportunities.reduce((sum, opp) => sum + parseFloat(opp.netProfit), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Filters & Sort */}
            {arbitrageOpportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-900/50 border-slate-700/50 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <SlidersHorizontal className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-white">{t('tradingBots.filtersAndSorting')}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sort By */}
                    <div>
                      <Label className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                        <ArrowUpDown className="w-3 h-3" />
                        {t('tradingBots.sortBy')}
                      </Label>
                      <Select value={arbitrageSortBy} onValueChange={setArbitrageSortBy}>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="roi">{t('tradingBots.highestROI')}</SelectItem>
                          <SelectItem value="profit">{t('tradingBots.highestProfit')}</SelectItem>
                          <SelectItem value="volume">{t('tradingBots.highestVolume')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Token Filter */}
                    <div>
                      <Label className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        {t('tradingBots.tokenFilter')}
                      </Label>
                      <Select value={selectedToken} onValueChange={setSelectedToken}>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="all">{t('tradingBots.allTokens')}</SelectItem>
                          {availableTokens.map(token => (
                            <SelectItem key={token} value={token}>{token}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Min Profit Filter */}
                    <div>
                      <Label className="text-xs text-slate-400 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Percent className="w-3 h-3" />
                          Min ROI %
                        </div>
                        <span className="text-emerald-400 font-mono">{minProfitFilter}%</span>
                      </Label>
                      <Slider
                        value={[minProfitFilter]}
                        onValueChange={(v) => setMinProfitFilter(v[0])}
                        min={0}
                        max={10}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <p>{t('tradingBots.showing')} {filteredOpportunities.length} {t('tradingBots.of')} {arbitrageOpportunities.length} {t('tradingBots.opportunities')}</p>
                    {(selectedToken !== 'all' || minProfitFilter > 1) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedToken('all');
                          setMinProfitFilter(1);
                        }}
                        className="text-xs h-7"
                      >
                        {t('tradingBots.clearFilters')}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Scan History */}
            {opportunityHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-slate-900/50 border-slate-700/50 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <History className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-white">{t('tradingBots.recentScans')}</h3>
                  </div>

                  <div className="space-y-2">
                    {opportunityHistory.slice(0, 5).map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-sm">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-400">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-slate-400">
                            <span className="text-white font-medium">{entry.count}</span> opps
                          </div>
                          <div className="text-slate-400">
                            Best: <span className="text-emerald-400 font-medium">{entry.bestRoi}%</span> on {entry.bestToken}
                          </div>
                          <div className="text-slate-400">
                            Potential: <span className="text-cyan-400 font-medium">${entry.totalPotentialProfit}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            <div className="space-y-4">
              {filteredOpportunities.length === 0 ? (
                <Card className="bg-slate-900/50 border-slate-700/50 p-12 text-center">
                  {arbitrageOpportunities.length === 0 ? (
                    <>
                      <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">{t('tradingBots.noArbitrage')}</p>
                      <p className="text-sm text-slate-500 mt-1">{t('tradingBots.clickScan')}</p>
                    </>
                  ) : (
                    <>
                      <Filter className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">{t('tradingBots.noMatchFilters')}</p>
                      <p className="text-sm text-slate-500 mt-1">{t('tradingBots.adjustFilters')}</p>
                    </>
                  )}
                </Card>
              ) : (
                filteredOpportunities.map((opp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/30 p-6 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/20 overflow-hidden group">
                      {/* Rank Badge */}
                      {idx < 3 && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg">
                          #{idx + 1} Top
                        </div>
                      )}
                      
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      
                      {/* Header */}
                      <div className="relative flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
                            <ArrowRightLeft className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-2xl font-bold text-white">{opp.token}</h3>
                              <span className="text-xs text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded">/ {opp.currency}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3" />
                                {Math.floor((Date.now() - opp.timestamp) / 1000)}s ago
                              </div>
                              {parseFloat(opp.netProfitPercent) > 5 && (
                                <div className="flex items-center gap-1 text-amber-400 animate-pulse">
                                  <Flame className="w-3 h-3" />
                                  <span className="font-medium">Hot Deal!</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-baseline gap-1 mb-1">
                            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                              +{opp.netProfitPercent}%
                            </p>
                          </div>
                          <p className="text-sm text-slate-400 font-medium">Net ROI</p>
                        </div>
                      </div>

                      {/* Profit Breakdown */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <p className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Net Profit
                          </p>
                          <p className="text-lg font-bold text-white">${opp.netProfit}</p>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Investment
                          </p>
                          <p className="text-lg font-bold text-white">${opp.investment}</p>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            Fees
                          </p>
                          <p className="text-lg font-bold text-red-400">${opp.feeAmount}</p>
                        </div>
                      </div>

                      {/* Trade Flow */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 relative">
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            Buy
                          </div>
                          <p className="text-xs text-slate-500 mb-2">Step 1: Buy from Seller</p>
                          <p className="text-2xl font-bold text-white mb-1">${opp.buyPrice}</p>
                          <p className="text-xs text-slate-400 mb-2">
                            {opp.maxAmount.toFixed(2)} {opp.token}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Wallet className="w-3 h-3" />
                            {opp.buyFrom.creator_address.slice(0, 6)}...{opp.buyFrom.creator_address.slice(-4)}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30 relative">
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                            Sell
                          </div>
                          <p className="text-xs text-emerald-400 mb-2">Step 2: Sell to Buyer</p>
                          <p className="text-2xl font-bold text-emerald-400 mb-1">${opp.sellPrice}</p>
                          <p className="text-xs text-slate-400 mb-2">
                            {opp.maxAmount.toFixed(2)} {opp.token}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Wallet className="w-3 h-3" />
                            {opp.sellTo.creator_address.slice(0, 6)}...{opp.sellTo.creator_address.slice(-4)}
                          </div>
                        </div>
                      </div>

                      {/* Details Summary */}
                      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 mb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Price Difference:</span>
                            <span className="text-white font-mono">${opp.priceDiff.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Gross Profit:</span>
                            <span className="text-emerald-400 font-mono">+${opp.grossProfit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Max Volume:</span>
                            <span className="text-white font-mono">{opp.maxAmount.toFixed(2)} {opp.token}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Trading Fees:</span>
                            <span className="text-red-400 font-mono">-${opp.feeAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-lg shadow-emerald-500/20"
                          onClick={() => toast.info('Auto-execution coming soon! For now, manually create matching trades.')}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Execute Arbitrage
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-slate-600"
                          onClick={() => {
                            const details = `Arbitrage Details:\n\nToken: ${opp.token}\nNet Profit: $${opp.netProfit} (${opp.netProfitPercent}% ROI)\n\nBuy: ${opp.maxAmount} ${opp.token} @ $${opp.buyPrice}\nSell: ${opp.maxAmount} ${opp.token} @ $${opp.sellPrice}\n\nInvestment: $${opp.investment}\nGross Profit: $${opp.grossProfit}\nFees: $${opp.feeAmount}\nNet Profit: $${opp.netProfit}`;
                            copyToClipboard(details);
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Warning for high-value trades */}
                      {parseFloat(opp.investment) > 1000 && (
                        <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-400">
                            High-value arbitrage. Ensure sufficient liquidity and verify counterparties.
                          </p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* API Keys Management */}
          <TabsContent value="keys" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t('tradingBots.apiKeyManagement')}</h2>
                    <p className="text-sm text-slate-300 mt-1">{t('tradingBots.securelyManage')}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowNewKeyModal(true)}
                  disabled={generateAPIKey.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('tradingBots.generateNewKey')}
                </Button>
              </div>

              {/* Stats */}
              {apiKeys.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-slate-400">{t('tradingBots.totalKeys')}</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{apiKeys.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <p className="text-xs text-slate-400">{t('tradingBots.activeKeys')}</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{apiKeys.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-slate-400">{t('tradingBots.rateLimit')}</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">100/min</p>
                  </div>
                </div>
              )}
            </Card>

            {/* New Key Success Modal */}
            {newlyGeneratedKey && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{t('tradingBots.apiKeyGenerated')}</h3>
                      <p className="text-sm text-emerald-300">
                        ⚠️ {t('tradingBots.copyNow')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Input
                      value={newlyGeneratedKey}
                      readOnly
                      className="font-mono text-sm bg-slate-950 border-emerald-500/50 pr-24 text-emerald-300"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(newlyGeneratedKey)}
                        className="h-8 hover:bg-emerald-500/20"
                      >
                        <Copy className="w-4 h-4 text-emerald-400" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setNewlyGeneratedKey(null)}
                        className="h-8 hover:bg-slate-800"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Keys List */}
            <Card className="bg-slate-900/50 border-slate-700/50 p-6">

              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-700/50 rounded-xl">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />
                      <div className="relative p-4 rounded-full bg-slate-800">
                        <Key className="w-12 h-12 text-slate-500" />
                      </div>
                    </div>
                    <p className="text-lg text-slate-300 font-medium">{t('tradingBots.noAPIKeys')}</p>
                    <p className="text-sm text-slate-500 mt-2 mb-4">{t('tradingBots.generateFirst')}</p>
                    <Button
                      onClick={() => setShowNewKeyModal(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('tradingBots.createFirstKey')}
                    </Button>
                  </div>
                ) : (
                  apiKeys.map((apiKey, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 p-5 hover:border-purple-500/30 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                              <Key className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-lg">{apiKey.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-slate-500">
                                  {t('tradingBots.created')} {new Date(apiKey.created_at).toLocaleDateString()}
                                </p>
                                {apiKey.last_used && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <p className="text-xs text-slate-500">
                                      {t('tradingBots.lastUsed')} {new Date(apiKey.last_used).toLocaleDateString()}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                <Unlock className="w-3 h-3" />
                                {t('tradingBots.active')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-slate-500 mb-2 block">{t('tradingBots.apiKey')}</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type={showKey[apiKey.key] ? 'text' : 'password'}
                                value={apiKey.key}
                                readOnly
                                className="font-mono text-sm bg-slate-950 border-slate-700 flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowKey({...showKey, [apiKey.key]: !showKey[apiKey.key]})}
                                className="border-slate-700 hover:bg-slate-800"
                              >
                                {showKey[apiKey.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(apiKey.key)}
                                className="border-slate-700 hover:bg-slate-800"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
                                    deleteAPIKey.mutate(apiKey.key);
                                  }
                                }}
                                className="border-red-900/50 hover:bg-red-900/20 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Permissions & Rate Limit */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-slate-400">{t('tradingBots.permissions')}:</span>
                              <span className="text-xs text-white font-medium">{t('tradingBots.readTrade')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-slate-400">Rate Limit:</span>
                              <span className="text-xs text-white font-medium">100 req/min</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Security Best Practices */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base font-semibold text-amber-400 mb-2">{t('tradingBots.securityBestPractices')}</p>
                    <ul className="text-sm text-slate-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{t('tradingBots.neverShare')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{t('tradingBots.storeSecurely')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{t('tradingBots.rotateRegularly')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{t('tradingBots.monitorUsage')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Generate Key Modal */}
            <Dialog open={showNewKeyModal} onOpenChange={setShowNewKeyModal}>
              <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Key className="w-6 h-6 text-purple-400" />
                    {t('tradingBots.generateNewKeyTitle')}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    {t('tradingBots.giveDescriptive')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="keyName" className="text-slate-300 mb-2 block">
                      {t('tradingBots.keyName')}
                    </Label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder={t('tradingBots.keyNamePlaceholder')}
                      className="bg-slate-800 border-slate-700"
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerateKey()}
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-400">
                      <strong>{t('tradingBots.note')}:</strong> {t('tradingBots.noteDesc')}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewKeyModal(false);
                        setNewKeyName('');
                      }}
                      className="flex-1 border-slate-700"
                    >
                      {t('tradingBots.cancel')}
                    </Button>
                    <Button
                      onClick={handleGenerateKey}
                      disabled={generateAPIKey.isPending}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {generateAPIKey.isPending ? (
                        <>
                          <Bot className="w-4 h-4 mr-2 animate-spin" />
                          {t('tradingBots.generating')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t('tradingBots.generateKey')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Documentation */}
          <TabsContent value="docs" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">{t('tradingBots.apiDocumentation')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-blue-400 mb-2">{t('tradingBots.authentication')}</h3>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <code className="text-sm text-slate-300">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {t('tradingBots.authDescription')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-blue-400 mb-2">{t('tradingBots.baseURL')}</h3>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <code className="text-sm text-slate-300">
                      https://api.trustfy.io/v1
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-blue-400 mb-3">{t('tradingBots.endpoints')}</h3>
                  <div className="space-y-4">
                    <div className="border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">GET</span>
                        <code className="text-sm text-white">/offers</code>
                      </div>
                      <p className="text-sm text-slate-400">{t('tradingBots.getAllOffers')}</p>
                    </div>

                    <div className="border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">POST</span>
                        <code className="text-sm text-white">/offers</code>
                      </div>
                      <p className="text-sm text-slate-400">{t('tradingBots.createOffer')}</p>
                    </div>

                    <div className="border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">GET</span>
                        <code className="text-sm text-white">/trades</code>
                      </div>
                      <p className="text-sm text-slate-400">{t('tradingBots.getTrades')}</p>
                    </div>

                    <div className="border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-mono rounded">PUT</span>
                        <code className="text-sm text-white">/trades/:id</code>
                      </div>
                      <p className="text-sm text-slate-400">{t('tradingBots.updateTrade')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">{t('tradingBots.codeExamples')}</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-blue-400">{t('tradingBots.pythonBot')}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(pythonExample)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
                      <code>{pythonExample}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-blue-400">{t('tradingBots.jsBot')}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(jsExample)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
                      <code>{jsExample}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
              <div className="flex gap-3">
                <Zap className="w-6 h-6 text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('tradingBots.gettingStarted')}</h3>
                  <p className="text-slate-300 text-sm mb-3">
                    {t('tradingBots.useExamples')}
                  </p>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• {t('tradingBots.monitorMarket')}</li>
                    <li>• {t('tradingBots.priceAlerts')}</li>
                    <li>• {t('tradingBots.dcaStrategies')}</li>
                    <li>• {t('tradingBots.arbitrageBetween')}</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const pythonExample = `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.trustfy.io/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Get available offers
def get_offers():
    response = requests.get(f"{BASE_URL}/offers", headers=headers)
    return response.json()

# Create a buy offer
def create_buy_offer(token, amount, price):
    data = {
        "offer_type": "buy",
        "token_symbol": token,
        "amount": amount,
        "price_per_unit": price,
        "chain": "BSC"
    }
    response = requests.post(f"{BASE_URL}/offers", headers=headers, json=data)
    return response.json()

# Monitor and auto-trade
def trading_bot():
    offers = get_offers()
    
    for offer in offers:
        if offer["token_symbol"] == "USDT" and offer["price_per_unit"] < 1.0:
            print(f"Found good deal: {offer['price_per_unit']}")
            # Execute trade logic here
            
if __name__ == "__main__":
    trading_bot()`;

const jsExample = `const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.trustfy.io/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  }
});

// Get available offers
async function getOffers() {
  const response = await api.get('/offers');
  return response.data;
}

// Create a sell offer
async function createSellOffer(token, amount, price) {
  const data = {
    offer_type: 'sell',
    token_symbol: token,
    amount: amount,
    price_per_unit: price,
    chain: 'Polygon'
  };
  const response = await api.post('/offers', data);
  return response.data;
}

// Automated trading bot
async function tradingBot() {
  try {
    const offers = await getOffers();
    
    offers.forEach(offer => {
      if (offer.token_symbol === 'USDC' && offer.price_per_unit > 1.01) {
        console.log(\`Arbitrage opportunity: \${offer.price_per_unit}\`);
        // Execute trade logic here
      }
    });
  } catch (error) {
    console.error('Bot error:', error);
  }
}

// Run bot every 30 seconds
setInterval(tradingBot, 30000);`;