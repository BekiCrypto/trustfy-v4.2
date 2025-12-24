import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Shield, Info, TrendingUp, Wallet, ArrowRightLeft, ArrowDownToLine, History, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/components/web3/useAuth';
import BondAccount from "../components/trade/BondAccount";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { referralsApi } from "@/api/referrals";

export default function CreditWallet() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [dashData, txData] = await Promise.all([
        referralsApi.getDashboard(),
        referralsApi.getWalletTransactions()
      ]);
      setDashboard(dashData);
      setTransactions(txData);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    setIsProcessing(true);
    try {
      await referralsApi.withdraw(parseFloat(withdrawAmount));
      toast.success(t('creditWallet.withdraw.success'));
      setWithdrawAmount('');
      fetchData();
    } catch (error) {
      toast.error(t('creditWallet.withdraw.failed', { error: error.response?.data?.message || error.message }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) return;
    setIsProcessing(true);
    try {
      await referralsApi.transferToCredit(parseFloat(transferAmount));
      toast.success(t('creditWallet.convert.success'));
      setTransferAmount('');
      fetchData();
    } catch (error) {
      toast.error(t('creditWallet.convert.failed', { error: error.response?.data?.message || error.message }));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 w-fit mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('creditWallet.connectWallet.title')}</h2>
          <p className="text-slate-400">{t('creditWallet.connectWallet.subtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {t('creditWallet.title')}
              </h1>
              <p className="text-slate-400 mt-1">{t('creditWallet.subtitle')}</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">{t('creditWallet.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="referral-wallet" className="data-[state=active]:bg-slate-700">{t('creditWallet.tabs.referralWallet')}</TabsTrigger>
            <TabsTrigger value="bond-credits" className="data-[state=active]:bg-slate-700">{t('creditWallet.tabs.bondCredits')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Referral Wallet Card */}
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t('creditWallet.referralWallet.title')}</h3>
                      <p className="text-slate-400 text-xs">{t('creditWallet.referralWallet.subtitle')}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-white">
                    ${dashboard?.walletBalance?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-slate-400">{t('creditWallet.referralWallet.availableBalance')}</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => document.getElementById('tab-trigger-referral-wallet').click()} className="flex-1 bg-slate-800 hover:bg-slate-700">
                    {t('creditWallet.referralWallet.manageWallet')}
                  </Button>
                </div>
              </Card>

              {/* Bond Credits Summary */}
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
                 <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{t('creditWallet.bondCredits.title')}</h3>
                      <p className="text-slate-400 text-xs">{t('creditWallet.bondCredits.subtitle')}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                   <p className="text-sm text-slate-400 mb-2">{t('creditWallet.bondCredits.checkDetails')}</p>
                   <div className="flex gap-2">
                     <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs">USDT</span>
                     <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">USDC</span>
                     <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">BNB</span>
                   </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => document.getElementById('tab-trigger-bond-credits').click()} className="flex-1 bg-slate-800 hover:bg-slate-700">
                    {t('creditWallet.bondCredits.viewCredits')}
                  </Button>
                </div>
              </Card>
            </div>
            
             {/* Info Alert */}
            <Alert className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
              <Info className="h-4 w-4 text-purple-400" />
              <AlertDescription className="text-purple-300 text-sm">
                <strong>{t('creditWallet.info.unifiedSystem')}</strong> {t('creditWallet.info.description')}
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="referral-wallet" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actions Panel */}
                <div className="lg:col-span-2 space-y-6">
                   <Card className="bg-slate-900/50 border-slate-700 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">{t('creditWallet.withdraw.title')}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">{t('creditWallet.withdraw.amountLabel')}</label>
                          <div className="flex gap-3">
                            <Input 
                              type="number" 
                              value={withdrawAmount} 
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-slate-950 border-slate-800"
                            />
                            <Button 
                              onClick={handleWithdraw}
                              disabled={isProcessing || !withdrawAmount}
                              className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                            >
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4 mr-2" />}
                              {t('creditWallet.withdraw.button')}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {t('creditWallet.withdraw.available', { amount: dashboard?.walletBalance?.toFixed(2) })}
                          </p>
                        </div>
                      </div>
                   </Card>

                   <Card className="bg-slate-900/50 border-slate-700 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">{t('creditWallet.convert.title')}</h3>
                      <div className="space-y-4">
                        <Alert className="bg-blue-500/10 border-blue-500/30 mb-4">
                          <Info className="h-4 w-4 text-blue-400" />
                          <AlertDescription className="text-blue-300 text-xs">
                            {t('creditWallet.convert.info')}
                          </AlertDescription>
                        </Alert>
                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">{t('creditWallet.convert.amountLabel')}</label>
                          <div className="flex gap-3">
                            <Input 
                              type="number" 
                              value={transferAmount} 
                              onChange={(e) => setTransferAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-slate-950 border-slate-800"
                            />
                            <Button 
                              onClick={handleTransfer}
                              disabled={isProcessing || !transferAmount}
                              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                            >
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4 mr-2" />}
                              {t('creditWallet.convert.button')}
                            </Button>
                          </div>
                        </div>
                      </div>
                   </Card>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-1">
                  <Card className="bg-slate-900/50 border-slate-700 p-6 h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-slate-400" />
                      <h3 className="text-lg font-semibold text-white">{t('creditWallet.history.title')}</h3>
                    </div>
                    
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
                        </div>
                      ) : transactions.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">{t('creditWallet.history.noTransactions')}</p>
                      ) : (
                        transactions.map((tx) => (
                          <div key={tx.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                              }`}>
                                {tx.type}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-white font-mono font-medium">${Number(tx.amount).toFixed(2)}</span>
                              <span className={`text-xs ${
                                tx.status === 'completed' ? 'text-emerald-400' : 
                                tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="bond-credits">
            <BondAccount />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
