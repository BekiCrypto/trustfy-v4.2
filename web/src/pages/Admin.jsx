import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Shield,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  TrendingUp,
  Settings,
  BarChart3,
  ShieldAlert,
  BookOpen,
  Trophy,
  Activity,
  FileText,
  Database,
  Bell
} from "lucide-react";
import PlatformStats from "../components/admin/PlatformStats";
import UserManagement from "../components/admin/UserManagement";
import TradeManagement from "../components/admin/TradeManagement";
import DisputeManagement from "../components/admin/DisputeManagement";
import InsuranceManagement from "../components/admin/InsuranceManagement";
import SystemSettings from "../components/admin/SystemSettings";
import FeeManagement from "../components/admin/FeeManagement";
import SecurityMonitoring from "../components/admin/SecurityMonitoring";
import RolesGuide from "../pages/RolesGuide";
import Tiers from "../pages/Tiers";
import PlatformWithdrawal from "../components/admin/PlatformWithdrawal";
import BondConfigManager from "../components/admin/BondConfigManager";
import TokenConfigManager from "../components/admin/TokenConfigManager";
import ArbitratorRoleManager from "../components/admin/ArbitratorRoleManager";
import SystemHealth from "../components/admin/SystemHealth";
import AuditLogs from "../components/admin/AuditLogs";
import DatabaseManager from "../components/admin/DatabaseManager";
import NotificationManager from "../components/admin/NotificationManager";
import ProtectedPage from "../components/auth/ProtectedPage";
import { ROLES } from "../components/auth/AccessControl";

export default function Admin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('health');
  
  return (
    <ProtectedPage requiredRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} pageName="Admin">
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('admin.title')}</h1>
              <p className="text-slate-400">{t('admin.subtitle')}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-900/50 border border-slate-700/50 p-1 flex-wrap h-auto">
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {t('admin.tabs.systemHealth')}
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('admin.statistics')}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                {t('admin.security')}
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('admin.users')}
              </TabsTrigger>
              <TabsTrigger value="trades" className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                {t('admin.trades')}
              </TabsTrigger>
              <TabsTrigger value="disputes" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t('admin.disputes')}
              </TabsTrigger>
              <TabsTrigger value="insurance" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t('admin.insurance')}
              </TabsTrigger>
              <TabsTrigger value="fees" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('admin.fees')}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {t('admin.tabs.notifications')}
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                {t('admin.tabs.database')}
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('admin.tabs.auditLogs')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('admin.settings')}
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t('admin.rolesGuide')}
              </TabsTrigger>
              <TabsTrigger value="tiers" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {t('admin.tiers')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="health">
              <SystemHealth />
            </TabsContent>
            
            <TabsContent value="stats">
              <PlatformStats />
            </TabsContent>
            
            <TabsContent value="security">
              <SecurityMonitoring />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="trades">
              <TradeManagement />
            </TabsContent>
            
            <TabsContent value="disputes">
              <DisputeManagement />
            </TabsContent>
            
            <TabsContent value="insurance">
              <InsuranceManagement />
            </TabsContent>
            
            <TabsContent value="fees">
              <div className="space-y-6">
                <FeeManagement />
                <TokenConfigManager />
                <BondConfigManager />
                <PlatformWithdrawal />
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationManager />
            </TabsContent>
            
            <TabsContent value="database">
              <DatabaseManager />
            </TabsContent>
            
            <TabsContent value="audit">
              <AuditLogs />
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-6">
                <SystemSettings />
                <ArbitratorRoleManager />
              </div>
            </TabsContent>
            
            <TabsContent value="roles">
              <RolesGuide />
            </TabsContent>
            
            <TabsContent value="tiers">
              <Tiers />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
    </ProtectedPage>
  );
}
