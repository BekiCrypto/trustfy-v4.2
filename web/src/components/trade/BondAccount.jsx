import React, { useMemo, useState } from 'react';
import { useWallet } from "../web3/WalletContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Wallet, ArrowDownToLine, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from '@/hooks/useTranslation';

const DEFAULT_TOKENS = ['USDT', 'USDC', 'BNB'];

export default function BondAccount({ chain = 'BSC', tokens = DEFAULT_TOKENS }) {
  const { t } = useTranslation();
  const { account, getBondCredits, withdrawBondCredit } = useWallet();
  const [bondCredits, setBondCredits] = useState({});
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(null);
  const [withdrawAmounts, setWithdrawAmounts] = useState({});
  const tokenList = useMemo(
    () => tokens,
    [Array.isArray(tokens) ? tokens.join('|') : tokens]
  );

  React.useEffect(() => {
    const fetchBondCredits = async () => {
      if (!account || !getBondCredits) {
        setBondCredits({});
        return;
      }
      if (account && getBondCredits) {
        const credits = {};
        for (const token of tokenList) {
          try {
            const credit = await getBondCredits(chain, token, account);
            credits[token] = credit;
          } catch (error) {
            console.error(`Error fetching ${token} bond credits:`, error);
            credits[token] = '0';
          }
        }
        setBondCredits(credits);
      }
    };
    fetchBondCredits();
  }, [account, chain, getBondCredits, tokenList]);

  const handleWithdraw = async (token) => {
    const amount = withdrawAmounts[token];
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('bondAccount.toast.invalidAmount'));
      return;
    }

    const available = parseFloat(bondCredits[token] || 0);
    if (parseFloat(amount) > available) {
      toast.error(t('bondAccount.toast.exceedsAvailable'));
      return;
    }

    setWithdrawing(token);
    try {
      await withdrawBondCredit(chain, token, amount);
      
      toast.success(t('bondAccount.toast.claimSuccessTitle'), {
        description: t('bondAccount.toast.claimSuccessDesc', { amount, token })
      });

      // Refresh credits
      const newCredit = await getBondCredits(chain, token, account);
      setBondCredits(prev => ({ ...prev, [token]: newCredit }));
      setWithdrawAmounts(prev => ({ ...prev, [token]: '' }));
    } catch (error) {
      console.error('Error withdrawing bond credits:', error);
      toast.error(error.message || t('bondAccount.toast.withdrawFailed'));
    } finally {
      setWithdrawing(null);
    }
  };

  const totalValue = Object.entries(bondCredits).reduce((sum, [token, amount]) => {
    return sum + parseFloat(amount || 0);
  }, 0);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Shield className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{t('bondAccount.title')}</h3>
          <p className="text-slate-400 text-xs">{t('bondAccount.subtitle')}</p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          V3
        </Badge>
      </div>

      <Alert className="bg-blue-500/10 border-blue-500/30 mb-6">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300 text-xs">
          {t('bondAccount.notice')}
        </AlertDescription>
      </Alert>

      {Object.keys(bondCredits).length > 0 ? (
        <div className="space-y-4">
          {/* Total Value */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-slate-400 text-sm">{t('bondAccount.totalBondCredits')}</span>
              </div>
              <span className="text-white font-bold text-lg">
                {totalValue.toFixed(4)} {t('bondAccount.tokens')}
              </span>
            </div>
          </div>

          {/* Per Token Credits */}
          {Object.entries(bondCredits).map(([token, amount]) => {
            const hasCredits = parseFloat(amount) > 0;
            const WITHDRAW_THRESHOLD = 0.0001; // Minimum amount required to withdraw
            const canWithdraw = parseFloat(amount) >= WITHDRAW_THRESHOLD;
            
            return (
              <div
                key={token}
                className={`p-4 rounded-lg border ${
                  hasCredits
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-slate-900/50 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{token}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {parseFloat(amount).toFixed(6)} {token}
                      </p>
                      <p className="text-slate-500 text-xs">{t('bondAccount.availableForReuse')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">💸 {t('bondAccount.claimToWallet')}</p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmounts[token] || ''}
                      onChange={(e) => setWithdrawAmounts(prev => ({
                        ...prev,
                        [token]: e.target.value
                      }))}
                      max={amount}
                      step="0.0001"
                      disabled={!canWithdraw}
                      className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 disabled:opacity-50"
                    />
                    <Button
                      onClick={() => handleWithdraw(token)}
                      disabled={!canWithdraw || withdrawing === token || !withdrawAmounts[token]}
                      size="default"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {withdrawing === token ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('bondAccount.claiming')}
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-4 h-4 mr-2" />
                          {t('bondAccount.claim')}
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canWithdraw}
                      onClick={() => setWithdrawAmounts(prev => ({
                        ...prev,
                        [token]: (parseFloat(amount) * 0.25).toFixed(6)
                      }))}
                      className="flex-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      25%
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canWithdraw}
                      onClick={() => setWithdrawAmounts(prev => ({
                        ...prev,
                        [token]: (parseFloat(amount) * 0.5).toFixed(6)
                      }))}
                      className="flex-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      50%
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canWithdraw}
                      onClick={() => setWithdrawAmounts(prev => ({
                        ...prev,
                        [token]: (parseFloat(amount) * 0.75).toFixed(6)
                      }))}
                      className="flex-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      75%
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canWithdraw}
                      onClick={() => setWithdrawAmounts(prev => ({
                        ...prev,
                        [token]: amount
                      }))}
                      className="flex-1 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('bondAccount.max')}
                    </Button>
                  </div>
                  {!canWithdraw && hasCredits && (
                    <p className="text-xs text-amber-400 mt-2">
                      ⚠️ {t('bondAccount.minimumWithdraw', { amount: WITHDRAW_THRESHOLD, token })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          <Alert className="bg-amber-500/10 border-amber-500/30">
            <Wallet className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 text-xs">
              <strong>⚠️ {t('bondAccount.importantWarning')}</strong> {t('bondAccount.warningDesc')}
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-2">{t('bondAccount.noBondCredits')}</p>
          <p className="text-slate-500 text-xs">
            {t('bondAccount.completeEscrows')}
          </p>
        </div>
      )}
    </Card>
  );
}
