import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Loader2, Shield, ArrowRight, Wallet, Clock, Coins, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { calculateRiskScore, calculatePremium } from "../insurance/RiskCalculator";
import { useWalletGuard } from "@/components/web3/useWalletGuard";
import { useTranslation } from "react-i18next";

export default function CreateTradeModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const { ensureWallet, authModal } = useWalletGuard();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    buyer_address: '',
    seller_address: '',
    token_symbol: 'USDT',
    amount: '',
    chain: 'BSC_TESTNET',
    timeout_duration: 24,
    is_insured: false,
    terms: ''
  });
  
  const queryClient = useQueryClient();
  
  // Fetch insurance providers
  const { data: providers = [] } = useQuery({
    queryKey: ['insurance-providers'],
    queryFn: () => base44.entities.InsuranceProvider.filter({ status: 'active' })
  });
  
  // Fetch user profiles for risk calculation
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', formData.seller_address],
    queryFn: async () => {
      if (!formData.seller_address) return null;
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: formData.seller_address });
      return profiles[0] ?? null;
    },
    enabled: !!formData.seller_address
  });
  
  const { data: counterpartyProfile } = useQuery({
    queryKey: ['counterparty-profile', formData.buyer_address],
    queryFn: async () => {
      if (!formData.buyer_address) return null;
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: formData.buyer_address });
      return profiles[0] ?? null;
    },
    enabled: !!formData.buyer_address
  });
  
  // Calculate risk and premium
  const riskScore = formData.amount && step === 3 
    ? calculateRiskScore(
        { amount: parseFloat(formData.amount), chain: formData.chain },
        userProfile,
        counterpartyProfile
      )
    : 50;
  
  const selectedProvider = providers.find(p => 
    parseFloat(formData.amount) >= p.min_coverage &&
    parseFloat(formData.amount) <= p.max_coverage &&
    p.supported_chains?.includes(formData.chain)
  );
  
  const premiumCalc = formData.is_insured && selectedProvider && formData.amount
    ? calculatePremium(parseFloat(formData.amount), riskScore, selectedProvider.base_premium_rate)
    : null;
  
  const createTrade = useMutation({
    mutationFn: async (data) => {
      const tradeId = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
      const expiresAt = new Date(Date.now() + data.timeout_duration * 60 * 60 * 1000);
      
      const trade = await base44.entities.Trade.create({
        ...data,
        trade_id: tradeId,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        seller_signed: false,
        buyer_signed: false,
        maker_fee: 1,
        taker_fee: 1.5,
        insurance_premium: data.is_insured && premiumCalc ? premiumCalc.premium : 0
      });
      
      // Create insurance policy if enabled
      if (data.is_insured && selectedProvider && premiumCalc) {
        const policyId = `0xP${Date.now().toString(16)}${Math.random().toString(16).slice(2, 8)}`;
        
        await base44.entities.InsurancePolicy.create({
          policy_id: policyId,
          trade_id: trade.id,
          provider_id: selectedProvider.id,
          insured_address: data.seller_address,
          coverage_amount: data.amount,
          premium_amount: premiumCalc.premium,
          premium_rate: premiumCalc.rate,
          risk_score: riskScore,
          risk_factors: {
            user_reputation: userProfile?.reputation_score || 500,
            trade_amount: data.amount,
            counterparty_reputation: counterpartyProfile?.reputation_score || 500,
            chain_risk: data.chain
          },
          status: selectedProvider.auto_approve ? 'active' : 'pending',
          start_date: new Date().toISOString(),
          end_date: expiresAt.toISOString(),
          terms: `Standard insurance coverage for escrow ${tradeId}`,
          auto_approved: selectedProvider.auto_approve
        });
      }
      
      return trade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success(t('trade.createModal.toastSuccess'));
      onOpenChange(false);
      setStep(1);
      setFormData({
        buyer_address: '',
        seller_address: '',
        token_symbol: 'USDT',
        amount: '',
        chain: 'BSC_TESTNET',
        timeout_duration: 24,
        is_insured: false,
        terms: ''
      });
    },
    onError: (error) => {
      toast.error(t('trade.createModal.toastFailed'));
    }
  });
  
  const handleSubmit = () => {
    ensureWallet(() => {
      createTrade.mutate({
        ...formData,
        amount: parseFloat(formData.amount)
      });
    });
  };
  
  const isStep1Valid = formData.seller_address && formData.buyer_address;
  const isStep2Valid = formData.token_symbol && formData.amount && parseFloat(formData.amount) > 0;
  const tokens = [
    { symbol: 'USDT', nameKey: 'trade.createModal.tokens.usdt', address: '0x...' },
    { symbol: 'USDC', nameKey: 'trade.createModal.tokens.usdc', address: '0x...' },
    { symbol: 'BTC', nameKey: 'trade.createModal.tokens.btc', address: '0x...' },
    { symbol: 'ETH', nameKey: 'trade.createModal.tokens.eth', address: '0x...' },
    { symbol: 'BNB', nameKey: 'trade.createModal.tokens.bnb', address: '0x...' },
    { symbol: 'MATIC', nameKey: 'trade.createModal.tokens.matic', address: '0x...' }
  ];
  const chains = [
    { value: 'BSC_TESTNET', label: `${t('common.chains.bsc')} Testnet` }
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            {t('trade.createModal.title')}
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                step >= s ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 transition-all ${
                  step > s ? 'bg-blue-500' : 'bg-slate-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> {t('trade.createModal.sellerWallet')}
                </Label>
                <Input
                  placeholder={t('trade.createModal.walletPlaceholder')}
                  value={formData.seller_address}
                  onChange={(e) => setFormData({ ...formData, seller_address: e.target.value })}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 font-mono"
                />
              </div>
              
              <div className="flex justify-center py-2">
                <ArrowRight className="w-5 h-5 text-slate-500" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> {t('trade.createModal.buyerWallet')}
                </Label>
                <Input
                  placeholder={t('trade.createModal.walletPlaceholder')}
                  value={formData.buyer_address}
                  onChange={(e) => setFormData({ ...formData, buyer_address: e.target.value })}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 font-mono"
                />
              </div>
              
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
              >
                {t('common.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Coins className="w-4 h-4" /> {t('trade.createModal.token')}
                  </Label>
                  <Select
                    value={formData.token_symbol}
                    onValueChange={(value) => setFormData({ ...formData, token_symbol: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {tokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                          {token.symbol} - {t(token.nameKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">{t('trade.createModal.chain')}</Label>
                  <Select
                    value={formData.chain}
                    onValueChange={(value) => setFormData({ ...formData, chain: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {chains.map((chain) => (
                        <SelectItem key={chain.value} value={chain.value} className="text-white">
                          {chain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">{t('trade.createModal.amount')}</Label>
                <Input
                  type="number"
                  placeholder={t('trade.createModal.amountPlaceholder')}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {t('trade.createModal.timeoutLabel')}
                </Label>
                <Select
                  value={formData.timeout_duration.toString()}
                  onValueChange={(value) => setFormData({ ...formData, timeout_duration: parseInt(value) })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="0.25" className="text-white">{t('trade.createModal.timeoutOptions.minutes15')}</SelectItem>
                    <SelectItem value="0.5" className="text-white">{t('trade.createModal.timeoutOptions.minutes30')}</SelectItem>
                    <SelectItem value="12" className="text-white">{t('trade.createModal.timeoutOptions.hours12')}</SelectItem>
                    <SelectItem value="24" className="text-white">{t('trade.createModal.timeoutOptions.hours24')}</SelectItem>
                    <SelectItem value="48" className="text-white">{t('trade.createModal.timeoutOptions.hours48')}</SelectItem>
                    <SelectItem value="72" className="text-white">{t('trade.createModal.timeoutOptions.hours72')}</SelectItem>
                    <SelectItem value="168" className="text-white">{t('trade.createModal.timeoutOptions.days7')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {t('common.back')}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {t('common.next')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('trade.createModal.insuranceProtection')}</span>
                  <Switch
                    checked={formData.is_insured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_insured: checked })}
                  />
                </div>
                {formData.is_insured && (
                  <>
                    {!selectedProvider ? (
                      <div className="text-xs text-amber-400 bg-amber-500/10 p-2 rounded flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5" />
                        <div>
                          <p className="font-medium">{t('trade.createModal.noProviderTitle')}</p>
                          <p className="opacity-80">{t('trade.createModal.noProviderDesc')}</p>
                        </div>
                      </div>
                    ) : premiumCalc ? (
                      <div className="space-y-2">
                        <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded">
                          <Shield className="w-4 h-4 inline mr-1" />
                          {t('trade.createModal.premiumLabel')}: {premiumCalc.rate.toFixed(2)}% (${premiumCalc.premium.toFixed(2)})
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="text-slate-500">{t('trade.createModal.providerLabel')} <span className="text-slate-300">{selectedProvider.provider_name}</span></p>
                          <p className="text-slate-500">{t('trade.createModal.riskScoreLabel')} <span className={`font-medium ${
                            riskScore < 30 ? 'text-emerald-400' :
                            riskScore < 70 ? 'text-amber-400' :
                            'text-red-400'
                          }`}>{riskScore}/100</span></p>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">{t('trade.createModal.customTerms')}</Label>
                <Textarea
                  placeholder={t('trade.createModal.customTermsPlaceholder')}
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                />
              </div>
              
              {/* Bond Notice */}
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-purple-400 text-xs font-semibold mb-1">{t('trade.createModal.disputeBondsTitle')}</p>
                    <p className="text-slate-300 text-xs">{t('trade.createModal.disputeBondsDesc')}</p>
                  </div>
                </div>
              </div>
              
              {/* Summary */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 space-y-2">
                <h4 className="font-semibold text-white">{t('trade.createModal.summaryTitle')}</h4>
                <div className="text-sm space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>{t('trade.createModal.summaryAmount')}</span>
                    <span className="font-mono">{formData.amount} {formData.token_symbol}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>{t('trade.createModal.summarySellerBond')}</span>
                    <span className="font-mono">{(parseFloat(formData.amount || 0) * 0.10).toFixed(4)} {formData.token_symbol}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>{t('trade.createModal.summaryBuyerBond')}</span>
                    <span className="font-mono">{(parseFloat(formData.amount || 0) * 0.10).toFixed(4)} {formData.token_symbol}</span>
                  </div>
                  {formData.is_insured && premiumCalc && (
                    <div className="flex justify-between">
                      <span>{t('trade.createModal.summaryInsurance')}</span>
                      <span className="font-mono">{premiumCalc.premium.toFixed(4)} {formData.token_symbol}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-600 pt-1 mt-2 flex justify-between font-semibold">
                    <span>{t('trade.createModal.summaryEstimatedDeposit')}</span>
                    <span className="font-mono text-white">
                      {(
                        parseFloat(formData.amount || 0) +
                        parseFloat(formData.amount || 0) * 0.025 +
                        parseFloat(formData.amount || 0) * 0.10 +
                        (formData.is_insured && premiumCalc ? premiumCalc.premium : 0)
                      ).toFixed(4)} {formData.token_symbol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    {t('trade.createModal.summaryFormula', {
                      suffix: formData.is_insured ? t('trade.createModal.summaryFormulaProtection') : ''
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {t('common.back')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createTrade.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createTrade.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('trade.createModal.creating')}
                    </>
                  ) : (
                    t('trade.createModal.createEscrow')
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
      {authModal}
    </Dialog>
  );
}
