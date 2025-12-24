import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FileText, Lock, Shield, Scale, AlertTriangle, BookOpen, HelpCircle, Layers } from "lucide-react";

export default function LandingFooter({ onModalOpen }) {
  const { t } = useTranslation();
  const footerSections = [
    {
      title: t('landing.header.menu.product'),
      links: [
        { name: t('landing.header.items.howTrustfyWorks'), icon: Layers, action: () => onModalOpen('docs') },
        { name: t('landing.header.items.escrowSystem'), icon: Shield, action: () => onModalOpen('docs') },
        { name: t('landing.header.items.disputeSystem'), icon: Scale, action: () => onModalOpen('docs') },
        { name: t('landing.header.items.smartBonds'), icon: Lock, action: () => onModalOpen('docs') },
      ]
    },
    {
      title: t('landing.header.menu.learn'), // Resources
      links: [
        { name: t('landing.header.items.documentationHub'), icon: BookOpen, action: () => onModalOpen('docs') },
        { name: t('landing.header.items.beginnerGuide'), icon: HelpCircle, action: () => onModalOpen('beginner') },
        { name: t('landing.header.items.safetyCenter'), icon: Shield, action: () => onModalOpen('safety') },
        { name: t('landing.header.items.helpCenter'), icon: FileText, action: () => onModalOpen('docs') },
      ]
    },
    {
      title: t('landing.header.menu.legal'),
      links: [
        { name: t('landing.header.items.termsConditions'), icon: FileText, action: () => onModalOpen('terms') },
        { name: t('landing.header.items.privacyPolicy'), icon: Lock, action: () => onModalOpen('privacy') },
        { name: t('landing.header.items.complianceStatement'), icon: Scale, action: () => onModalOpen('compliance') },
        { name: t('landing.header.items.riskDisclosure'), icon: AlertTriangle, action: () => onModalOpen('disclaimer') },
      ]
    }
  ];

  return (
    <footer className="border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col items-center md:items-start">
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={link.action}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <link.icon className="w-3.5 h-3.5" />
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
                <p className="text-xs text-slate-500">{t('landing.header.tagline')}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center md:text-right">
              {t('landing.footer.copyLine1')}<br />
              {t('landing.footer.copyLine2')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
