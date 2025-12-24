import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ADMIN_WALLETS, ARBITRATOR_WALLETS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  AlertTriangle,
  User,
  Menu,
  Shield,
  LogOut,
  Settings,
  BarChart3,
  Store,
  TrendingUp,
  ShoppingBag,
  FileText,
  Megaphone,
  Bot,
  Trophy,
  Users,
  Scale,
  BookOpen
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from '@/hooks/useTranslation';
import { useWallet } from "../components/web3/WalletContext";
const WalletButtonV2Lazy = React.lazy(() => import("../components/web3/WalletButtonV2"));
const NotificationCenterLazy = React.lazy(() => import("@/components/notifications/NotificationCenter"));
const NotificationBannerLazy = React.lazy(() => import("@/components/notifications/NotificationBanner"));
import { getNavigationForRole } from "@/components/auth/AccessControl";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import NetworkStatus from "@/components/common/NetworkStatus";

const iconMap = {
  Store,
  ArrowLeftRight,
  LayoutDashboard,
  AlertTriangle,
  TrendingUp,
  User,
  Settings,
  Shield,
  BarChart3,
  Bot,
  ShoppingBag,
  FileText,
  Megaphone,
  Trophy,
  Users,
  Scale,
  BookOpen
};

export default function LayoutShell({ children, currentPageName }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { account, disconnectWallet } = useWallet();
  const { t } = useTranslation();
  const accountLower = account?.toLowerCase();
  const isAllowlistedAdmin = accountLower ? ADMIN_WALLETS.has(accountLower) : false;
  const isAllowlistedArbitrator = accountLower ? ARBITRATOR_WALLETS.has(accountLower) : false;
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!accountLower) {
        setUserProfile(null);
        return;
      }
      try {
        const profiles = await base44.entities.UserProfile.filter({ wallet_address: accountLower });
        if (profiles && profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      } catch (error) {
      }
    };
    fetchProfile();
  }, [accountLower]);
  
  const userRole = isAllowlistedAdmin ? 'admin' : isAllowlistedArbitrator ? 'arbitrator' : 'user';
  const navItems = useMemo(() => getNavigationForRole(userRole), [userRole]);
  const logoTarget = createPageUrl(account ? 'Dashboard' : 'Home');

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } finally {
      disconnectWallet();
      setMobileMenuOpen(false);
      navigate(createPageUrl('Home'));
    }
  };
  
  const NavLink = ({ item, mobile = false }) => {
    const isActive = currentPageName === item.page;
    const Icon = iconMap[item.icon] || Shield;
    
    return (
      <Link
        to={createPageUrl(item.page)}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
        <span className="font-medium">{item.translationKey ? t(item.translationKey) : item.name}</span>
      </Link>
    );
  };
  
  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-slate-950">
      <NetworkStatus />
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/50">
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/50">
            <Link to={logoTarget} className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6935c88e6bbf26b171a5a3a1/0e150037c_TECHWEALTH.png" 
                  alt={t('layout.logoAlt')}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-amber-400 bg-clip-text text-transparent tracking-tight">{t('layout.brand')}</h1>
                <p className="text-xs text-slate-500 font-medium">{t('layout.tagline')}</p>
              </div>
            </Link>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-800/50 space-y-2">
            <Suspense fallback={<div className="h-10 w-full rounded-md bg-slate-800" />}>
              <WalletButtonV2Lazy size="lg" className="w-full" />
            </Suspense>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 text-slate-300 hover:text-red-400"
                    size="default"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('common.logout', 'Logout')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                  <p>Disconnect wallet and sign out</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>
      
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link to={logoTarget} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6935c88e6bbf26b171a5a3a1/0e150037c_TECHWEALTH.png" 
                alt={t('layout.logoAlt')}
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">{t('layout.brand')}</h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Suspense fallback={null}>
              <NotificationCenterLazy />
            </Suspense>
            <Suspense fallback={<Button variant="ghost" size="sm" className="opacity-50">...</Button>}>
              <WalletButtonV2Lazy variant="ghost" size="sm" />
            </Suspense>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-slate-900 border-slate-800 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/50">
                    <Link to={logoTarget} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6935c88e6bbf26b171a5a3a1/0e150037c_TECHWEALTH.png" 
                          alt={t('layout.logoAlt')}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-amber-400 bg-clip-text text-transparent tracking-tight">{t('layout.brand')}</h1>
                        <p className="text-xs text-slate-500 font-medium">{t('layout.tagline')}</p>
                      </div>
                    </Link>
                  </div>
                  
                  <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                      <NavLink key={item.name} item={item} mobile />
                    ))}
                  </nav>
                  
                  <div className="p-4 border-t border-slate-800/50 space-y-2">
                    <Suspense fallback={<div className="h-10 w-full rounded-md bg-slate-800" />}>
                      <WalletButtonV2Lazy size="default" className="w-full" />
                    </Suspense>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 text-slate-300 hover:text-red-400"
                            size="default"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t('common.logout', 'Logout')}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 border-slate-700 text-slate-300">
                          <p>Disconnect wallet and sign out</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <Suspense fallback={null}>
          <NotificationBannerLazy />
        </Suspense>
        <motion.div
          key={currentPageName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

    </div>
    </ErrorBoundary>
  );
}
