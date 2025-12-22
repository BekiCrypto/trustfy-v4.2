import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  Scale, 
  AlertTriangle, 
  Lock,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import DocumentationModal from "../components/landing/DocumentationModal";
import TermsModal from "../components/landing/TermsModal";
import PrivacyModal from "../components/landing/PrivacyModal";
import KYCPolicyModal from "../components/landing/KYCPolicyModal";
import BeginnerGuideModal from "../components/landing/BeginnerGuideModal";
import TermsSummaryModal from "../components/landing/TermsSummaryModal";
import ComplianceModal from "../components/landing/ComplianceModal";
import LegalDisclaimerModal from "../components/landing/LegalDisclaimerModal";

export default function DocsHub() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const documentCategories = [
    {
      title: t('docsHub.sections.legal'),
      icon: Scale,
      color: 'from-blue-500 to-cyan-500',
      docs: [
        { id: 'terms', name: t('docsHub.docs.terms.name'), description: t('docsHub.docs.terms.description'), icon: FileText, modal: 'terms' },
        { id: 'privacy', name: t('docsHub.docs.privacy.name'), description: t('docsHub.docs.privacy.description'), icon: Lock, modal: 'privacy' },
        { id: 'kyc', name: t('docsHub.docs.identity.name'), description: t('docsHub.docs.identity.description'), icon: Shield, modal: 'kyc' },
        { id: 'disclaimer', name: t('docsHub.docs.disclaimer.name'), description: t('docsHub.docs.disclaimer.description'), icon: AlertTriangle, modal: 'disclaimer' },
        { id: 'compliance', name: t('docsHub.docs.compliance.name'), description: t('docsHub.docs.compliance.description'), icon: Scale, modal: 'compliance' },
      ]
    },
    {
      title: t('docsHub.sections.guides'),
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      docs: [
        { id: 'docs', name: t('docsHub.docs.platformDocs.name'), description: t('docsHub.docs.platformDocs.description'), icon: BookOpen, modal: 'docs' },
        { id: 'beginner', name: t('docsHub.docs.beginner.name'), description: t('docsHub.docs.beginner.description'), icon: GraduationCap, modal: 'beginner' },
        { id: 'summary', name: t('docsHub.docs.summary.name'), description: t('docsHub.docs.summary.description'), icon: FileText, modal: 'summary' },
      ]
    },
    {
      title: t('docsHub.sections.safety'),
      icon: Shield,
      color: 'from-emerald-500 to-green-500',
      docs: [
        { id: 'safety', name: t('docsHub.docs.safety.name'), description: t('docsHub.docs.safety.description'), icon: Shield, external: '/Safety' },
        { id: 'anti-fraud', name: t('docsHub.docs.antifraud.name'), description: t('docsHub.docs.antifraud.description'), icon: AlertTriangle, modal: 'docs' },
        { id: 'risk', name: t('docsHub.docs.risk.name'), description: t('docsHub.docs.risk.description'), icon: AlertTriangle, modal: 'disclaimer' },
      ]
    }
  ];

  const filteredCategories = documentCategories.map(category => ({
    ...category,
    docs: category.docs.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.docs.length > 0);

  const handleDocClick = (doc) => {
    if (doc.external) {
      window.open(doc.external, '_blank');
    } else if (doc.modal) {
      setActiveModal(doc.modal);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{t('docsHub.title')}</h1>
                    <p className="text-slate-400 text-sm">{t('docsHub.subtitle')}</p>
                  </div>
                </div>
                <a href="/" className="text-slate-400 hover:text-white transition-colors">
                  {t('docsHub.backToHome')}
                </a>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  placeholder={t('docsHub.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="space-y-12">
            {filteredCategories.map((category, idx) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  <Badge className="ml-2">
                    {category.docs.length}{' '}
                    {category.docs.length === 1 ? t('docsHub.docSingular') : t('docsHub.docPlural')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.docs.map((doc) => (
                    <Card
                      key={doc.id}
                      onClick={() => handleDocClick(doc)}
                      className="bg-slate-900/50 border-slate-700/50 p-6 hover:bg-slate-800/50 hover:border-slate-600 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                          <doc.icon className="w-5 h-5 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {doc.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{t('docsHub.empty.title')}</h3>
                <p className="text-slate-400">{t('docsHub.empty.subtitle')}</p>
              </div>
            )}
          </div>

          {/* Quick Links Footer */}
          <div className="mt-12 pt-8 border-t border-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">{t('docsHub.quickLinks.helpTitle')}</h4>
                <p className="text-sm text-slate-400 mb-2">
                  {t('docsHub.quickLinks.helpDesc')}
                </p>
                <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">
                  {t('docsHub.quickLinks.contactLink')}
                </a>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">{t('docsHub.quickLinks.quickStartTitle')}</h4>
                <p className="text-sm text-slate-400 mb-2">
                  {t('docsHub.quickLinks.quickStartDesc')}
                </p>
                <button
                  onClick={() => setActiveModal('beginner')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {t('docsHub.quickLinks.beginnerLink')}
                </button>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">{t('docsHub.quickLinks.statusTitle')}</h4>
                <p className="text-sm text-slate-400 mb-2">
                  {t('docsHub.quickLinks.statusDesc')}
                </p>
                <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">
                  {t('docsHub.quickLinks.statusLink')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentationModal open={activeModal === 'docs'} onOpenChange={() => setActiveModal(null)} />
      <TermsModal open={activeModal === 'terms'} onOpenChange={() => setActiveModal(null)} />
      <PrivacyModal open={activeModal === 'privacy'} onOpenChange={() => setActiveModal(null)} />
      <KYCPolicyModal open={activeModal === 'kyc'} onOpenChange={() => setActiveModal(null)} />
      <BeginnerGuideModal open={activeModal === 'beginner'} onOpenChange={() => setActiveModal(null)} />
      <TermsSummaryModal open={activeModal === 'summary'} onOpenChange={() => setActiveModal(null)} />
      <ComplianceModal open={activeModal === 'compliance'} onOpenChange={() => setActiveModal(null)} />
      <LegalDisclaimerModal open={activeModal === 'disclaimer'} onOpenChange={() => setActiveModal(null)} />
    </div>
  );
}
