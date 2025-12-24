import React, { useState } from 'react';
import { useTranslation } from "@/hooks/useTranslation";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  PlayCircle, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import ComingSoonBanner from "../components/common/ComingSoonBanner";

export default function MigrationRunner() {
  const { t } = useTranslation();
  const overview = t('migrationRunner.overview', { returnObjects: true });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: user?.email });
      return profiles[0] ?? null;
    },
    enabled: !!user?.email
  });

  // Allow access if: super_admin, admin, or owner
  const isAdmin = profile?.platform_role === 'super_admin' || 
                  profile?.platform_role === 'admin' ||
                  user?.role === 'admin';

  const runMigration = async (dryRun = true) => {
    if (!isAdmin) {
      toast.error(t('migrationRunner.toast.onlySuperAdmin'));
      return;
    }

    setRunning(true);
    setResult(null);

    try {
      toast.loading(
        dryRun ? t('migrationRunner.toast.runningDryRun') : t('migrationRunner.toast.runningMigration'),
        { id: 'migration' }
      );

      const response = await base44.functions.invoke('migrateUserProfiles', {
        dry_run: dryRun
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setResult(response.data);
      
      toast.success(response.data.message, { 
        id: 'migration',
        duration: 5000 
      });

    } catch (error) {
      console.error('Migration error:', error);
      toast.error(error.message || t('migrationRunner.toast.migrationFailed'), { id: 'migration' });
      setResult({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setRunning(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          <Alert className="bg-amber-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300">
              {t('migrationRunner.loginRequired')}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-2xl mx-auto">
          <Alert className="bg-red-500/10 border-red-500/30">
            <Shield className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
              {t('migrationRunner.accessDenied')}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <ComingSoonBanner />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('migrationRunner.title')}</h1>
            <p className="text-slate-400">{t('migrationRunner.subtitle')}</p>
          </div>
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="outline" className="border-slate-600">
              {t('migrationRunner.backToDashboard')}
            </Button>
          </Link>
        </div>

        {/* Safety Info */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-3">{overview.title}</h2>
              <div className="space-y-2 text-sm text-slate-300">
                {overview.items.map((item) => (
                  <p key={item.label}>
                    <span>✓ </span>
                    <strong>{item.label}</strong> {item.desc}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-4 bg-slate-700/50" />

          <div className="space-y-2 text-sm">
            <p className="text-slate-300"><strong>{t('migrationRunner.changes.title')}</strong></p>
            <ul className="list-disc list-inside text-slate-400 space-y-1 ml-2">
              {t('migrationRunner.changes.items', { returnObjects: true }).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Pre-flight Checklist */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 p-6">
          <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">{t('migrationRunner.preflight.title')}</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>{t('migrationRunner.preflight.items.backup')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>{t('migrationRunner.preflight.items.dryRun')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>{t('migrationRunner.preflight.items.review')}</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('migrationRunner.actions.title')}</h3>
          
          <div className="space-y-3">
            <Button
              onClick={() => runMigration(true)}
              disabled={running}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {running ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('migrationRunner.actions.running')}
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  {t('migrationRunner.actions.dryRun')}
                </>
              )}
            </Button>
            
            <Button
              onClick={() => runMigration(false)}
              disabled={running || !result?.success}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              {running ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('migrationRunner.actions.running')}
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5 mr-2" />
                  {t('migrationRunner.actions.execute')}
                </>
              )}
            </Button>
            
            <p className="text-xs text-slate-500 text-center">
              {t('migrationRunner.actions.helper')}
            </p>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <Card className={`bg-gradient-to-br ${
            result.success 
              ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/30' 
              : 'from-red-500/10 to-red-600/10 border-red-500/30'
          } p-6`}>
            <div className="flex items-start gap-4 mb-4">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{result.message}</h3>
                {result.results?.dry_run && (
                  <p className="text-sm text-amber-400 mb-3">
                    {t('migrationRunner.result.dryRun')}
                  </p>
                )}
              </div>
            </div>

            {result.summary && (
              <>
                <Separator className="my-4 bg-slate-700/50" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{result.summary.profiles_migrated}</p>
                    <p className="text-xs text-slate-400">{t('migrationRunner.result.profilesMigrated')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{result.summary.profiles_skipped}</p>
                    <p className="text-xs text-slate-400">{t('migrationRunner.result.profilesSkipped')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{result.summary.trades_updated}</p>
                    <p className="text-xs text-slate-400">{t('migrationRunner.result.tradesUpdated')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{result.summary.errors_count}</p>
                    <p className="text-xs text-slate-400">{t('migrationRunner.result.errors')}</p>
                  </div>
                </div>
              </>
            )}

            {result.results?.errors?.length > 0 && (
              <>
                <Separator className="my-4 bg-slate-700/50" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-red-400">{t('migrationRunner.result.errorsTitle')}</p>
                  {result.results.errors.map((err, idx) => (
                    <div key={idx} className="p-3 bg-red-500/10 rounded-lg text-xs text-red-300">
                      {err.profile_id && `${t('migrationRunner.result.profilePrefix')} ${err.profile_id}: `}
                      {err.trade_id && `${t('migrationRunner.result.tradePrefix')} ${err.trade_id}: `}
                      {err.error}
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.results?.details?.length > 0 && (
              <>
                <Separator className="my-4 bg-slate-700/50" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      {t('migrationRunner.result.hideDetails')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      {t('migrationRunner.result.showDetails', { count: result.results.details.length })}
                    </>
                  )}
                </Button>

                {showDetails && (
                  <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
                    {result.results.details.map((detail, idx) => (
                      <div key={idx} className="p-3 bg-slate-800/50 rounded-lg text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-400">{detail.type}</span>
                          <span className="text-slate-500">{detail.id}</span>
                        </div>
                        {detail.changes && (
                          <pre className="text-slate-300 mt-2">
                            {JSON.stringify(detail.changes, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
