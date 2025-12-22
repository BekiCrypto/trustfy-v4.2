import React, { useState } from 'react';
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
  Wallet,
  GraduationCap,
  Layers,
  TrendingUp
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function LandingHeader({ onAuthClick, onModalOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      title: 'Product',
      items: [
        { name: 'How Trustfy Works', icon: Layers, action: () => onModalOpen('docs') },
        { name: 'Escrow System', icon: Shield, action: () => onModalOpen('docs') },
        { name: 'Bond Wallet', icon: Wallet, action: () => onModalOpen('docs') },
        { name: 'Dispute System', icon: Scale, action: () => onModalOpen('docs') },
        { name: 'Prime Features', icon: TrendingUp, action: () => onModalOpen('docs') },
      ]
    },
    {
      title: 'Learn',
      items: [
        { name: 'Beginner Guide', icon: GraduationCap, action: () => onModalOpen('beginner') },
        { name: 'Safety Center', icon: Shield, action: () => onModalOpen('safety') },
        { name: 'Risk Disclosure', icon: AlertTriangle, action: () => onModalOpen('disclaimer') },
        { name: 'Quick Start', icon: FileText, action: () => onModalOpen('summary') },
      ]
    },
    {
      title: 'Legal',
      items: [
        { name: 'Terms & Conditions', icon: FileText, action: () => onModalOpen('terms') },
        { name: 'Privacy Policy', icon: Lock, action: () => onModalOpen('privacy') },
        { name: 'Identity Policy', icon: Shield, action: () => onModalOpen('kyc') },
        { name: 'Dispute Policy', icon: Scale, action: () => onModalOpen('safety') },
        { name: 'Compliance Statement', icon: Scale, action: () => onModalOpen('compliance') },
        { name: 'Legal Disclaimer', icon: AlertTriangle, action: () => onModalOpen('disclaimer') },
      ]
    },
    {
      title: 'Support',
      items: [
        { name: 'Help Center', icon: HelpCircle, action: () => onModalOpen('docs') },
        { name: 'Documentation Hub', icon: BookOpen, action: () => window.location.href = '/Docs' },
        { name: 'Contact Support', icon: HelpCircle, action: () => onModalOpen('docs') },
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
              alt="TECHWEALTH"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">TRUSTFY</h1>
              <p className="text-xs text-slate-500">Decentralized P2P Escrow</p>
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
              onClick={() => window.location.href = '/Docs'}
              className="text-slate-300 hover:text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </Button>
            <Button
              onClick={onAuthClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started
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
                <Button
                  onClick={() => {
                    onAuthClick();
                    setMobileOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Get Started
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}