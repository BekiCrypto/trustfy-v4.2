import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  BookOpen, 
  Shield, 
  Scale, 
  HelpCircle,
  FileText,
  Lock,
  AlertTriangle,
  GraduationCap,
  Layers,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function LandingHeader({ onAuthClick, onModalOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const menuItems = [
    {
      title: t('landing.header.menu.product'),
      items: [
        { name: t('landing.header.items.howTrustfyWorks'), icon: Layers, action: () => onModalOpen('docs') },
        { name: t('landing.header.items.escrowSystem'), icon: Shield, action: () => onModalOpen('docs') },
        { name: t('landing.header.items.disputeSystem'), icon: Scale, action: () => onModalOpen('docs') },
      ]
    },
    {
      title: t('landing.header.menu.learn'),
      items: [
        { name: t('landing.header.items.beginnerGuide'), icon: GraduationCap, action: () => onModalOpen('beginner') },
        { name: t('landing.header.items.safetyCenter'), icon: Shield, action: () => onModalOpen('safety') },
        { name: t('landing.header.items.riskDisclosure'), icon: AlertTriangle, action: () => onModalOpen('disclaimer') },
        { name: t('landing.header.items.quickStart'), icon: FileText, action: () => onModalOpen('summary') },
      ]
    },
    {
      title: t('landing.header.menu.legal'),
      items: [
        { name: t('landing.header.items.termsConditions'), icon: FileText, action: () => onModalOpen('terms') },
        { name: t('landing.header.items.privacyPolicy'), icon: Lock, action: () => onModalOpen('privacy') },
        { name: t('landing.header.items.disputePolicy'), icon: Scale, action: () => onModalOpen('safety') },
        { name: t('landing.header.items.complianceStatement'), icon: Scale, action: () => onModalOpen('compliance') },
        { name: t('landing.header.items.legalDisclaimer'), icon: AlertTriangle, action: () => onModalOpen('disclaimer') },
      ]
    },
    {
      title: t('landing.header.menu.support'),
      items: [
        { name: t('landing.header.items.helpCenter'), icon: HelpCircle, action: () => onModalOpen('docs') },
        { name: t('landing.header.items.documentationHub'), icon: BookOpen, action: () => window.location.href = '/docs' },
        { name: t('landing.header.items.contactSupport'), icon: HelpCircle, action: () => onModalOpen('docs') },
      ]
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6935c88e6bbf26b171a5a3a1/0e150037c_TECHWEALTH.png" 
              alt="TRUSTFY"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">TRUSTFY</h1>
              <p className="text-xs text-slate-500">{t('landing.header.tagline')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {menuItems.map((menu) => (
                <NavigationMenuItem key={menu.title}>
                  <NavigationMenuTrigger className="bg-transparent text-slate-300 hover:text-white">
                    {menu.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 bg-slate-900 border border-slate-800">
                      {menu.items.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <button
                              onClick={item.action}
                              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800 transition-colors text-left"
                            >
                              <div className="p-2 rounded-lg bg-slate-800">
                                <item.icon className="w-4 h-4 text-blue-400" />
                              </div>
                              <span className="text-sm text-slate-300 hover:text-white">
                                {item.name}
                              </span>
                            </button>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/docs'}
              className="text-slate-300 hover:text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {t('landing.header.docsButton')}
            </Button>
            <Button
              onClick={onAuthClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {t('landing.header.getStarted')}
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5 text-slate-300" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-slate-900 border-slate-800">
              <div className="space-y-6 mt-8">
                {menuItems.map((menu) => (
                  <div key={menu.title}>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">
                      {menu.title}
                    </h3>
                    <div className="space-y-2">
                      {menu.items.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.action();
                            setMobileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800 transition-colors text-left"
                        >
                          <item.icon className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-slate-300">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-slate-800">
                </div>
                <Button
                  onClick={() => {
                    onAuthClick();
                    setMobileOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {t('landing.header.getStarted')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
