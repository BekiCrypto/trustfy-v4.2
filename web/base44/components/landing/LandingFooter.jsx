import React from 'react';
import { FileText, Lock, Shield, Scale, AlertTriangle, BookOpen, HelpCircle, Layers, Wallet } from "lucide-react";

export default function LandingFooter({ onModalOpen }) {
  const footerSections = [
    {
      title: 'Legal',
      links: [
        { name: 'Terms & Conditions', icon: FileText, action: () => onModalOpen('terms') },
        { name: 'Privacy Policy', icon: Lock, action: () => onModalOpen('privacy') },
        { name: 'Identity Policy', icon: Shield, action: () => onModalOpen('kyc') },
        { name: 'Dispute Policy', icon: Scale, action: () => onModalOpen('safety') },
        { name: 'Risk Disclosure', icon: AlertTriangle, action: () => onModalOpen('disclaimer') },
        { name: 'Compliance Statement', icon: Scale, action: () => onModalOpen('compliance') },
      ]
    },
    {
      title: 'Platform',
      links: [
        { name: 'How It Works', icon: Layers, action: () => onModalOpen('docs') },
        { name: 'Supported Wallets', icon: Wallet, action: () => onModalOpen('docs') },
        { name: 'Bond Wallet', icon: Shield, action: () => onModalOpen('docs') },
        { name: 'Fee Structure', icon: FileText, action: () => onModalOpen('docs') },
        { name: 'Prime Features', icon: Shield, action: () => onModalOpen('docs') },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', icon: HelpCircle, action: () => onModalOpen('docs') },
        { name: 'Documentation Hub', icon: BookOpen, action: () => window.location.href = '/Docs' },
        { name: 'Safety Center', icon: Shield, action: () => onModalOpen('safety') },
        { name: 'Contact Support', icon: HelpCircle, action: () => onModalOpen('docs') },
      ]
    },
    {
      title: 'Learn',
      links: [
        { name: 'Beginner Guide', icon: BookOpen, action: () => onModalOpen('beginner') },
        { name: 'Quick Start', icon: FileText, action: () => onModalOpen('summary') },
        { name: 'Safety Tips', icon: Shield, action: () => onModalOpen('safety') },
        { name: 'Risk Awareness', icon: AlertTriangle, action: () => onModalOpen('disclaimer') },
      ]
    }
  ];

  return (
    <footer className="border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={link.action}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <link.icon className="w-3 h-3" />
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6935c88e6bbf26b171a5a3a1/0e150037c_TECHWEALTH.png" 
                alt="TECHWEALTH"
                className="w-8 h-8 object-contain"
              />
              <div>
                <p className="text-sm font-semibold text-white">TRUSTFY</p>
                <p className="text-xs text-slate-500">Decentralized P2P Escrow Platform</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center md:text-right">
              © 2025 Trustfy. All rights reserved.<br />
              Non-custodial platform. Users remain in full control.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}