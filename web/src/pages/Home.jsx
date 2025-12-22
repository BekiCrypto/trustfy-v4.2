import React from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import DocumentationModal from "../components/landing/DocumentationModal";
import TermsModal from "../components/landing/TermsModal";
import PrivacyModal from "../components/landing/PrivacyModal";
import BeginnerGuideModal from "../components/landing/BeginnerGuideModal";
import TermsSummaryModal from "../components/landing/TermsSummaryModal";
import ComplianceModal from "../components/landing/ComplianceModal";
import KYCPolicyModal from "../components/landing/KYCPolicyModal";
import LegalDisclaimerModal from "../components/landing/LegalDisclaimerModal";
import SafetyModal from "../components/landing/SafetyModal";
import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Lock,
  Globe,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  MessageSquare,
  FileText,
  Scale,
  HelpCircle,
  BookOpen
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const { t } = useTranslation();
  const [showDocs, setShowDocs] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showBeginnerGuide, setShowBeginnerGuide] = React.useState(false);
  const [showTermsSummary, setShowTermsSummary] = React.useState(false);
  const [showCompliance, setShowCompliance] = React.useState(false);
  const [showKYCPolicy, setShowKYCPolicy] = React.useState(false);
  const [showLegalDisclaimer, setShowLegalDisclaimer] = React.useState(false);
  const [showSafety, setShowSafety] = React.useState(false);
  const navigate = useNavigate();
  
  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) {
        window.location.href = createPageUrl('Dashboard');
      }
    });
  }, []);
  
  const features = [
    {
      icon: Shield,
      title: t('landing.features.onChain.title'),
      description: t('landing.features.onChain.description')
    },
    {
      icon: Lock,
      title: t('landing.features.nonCustodial.title'),
      description: t('landing.features.nonCustodial.description')
    },
    {
      icon: Scale,
      title: t('landing.features.arbitrator.title'),
      description: t('landing.features.arbitrator.description')
    },
    {
      icon: MessageSquare,
      title: t('landing.features.chatEvidence.title'),
      description: t('landing.features.chatEvidence.description')
    },
    {
      icon: Globe,
      title: t('landing.features.bscSupport.title'),
      description: t('landing.features.bscSupport.description')
    },
    {
      icon: BarChart3,
      title: t('landing.features.indexer.title'),
      description: t('landing.features.indexer.description')
    }
  ];

  const stats = t('landing.stats', { returnObjects: true });
  const howItWorksSteps = t('landing.howItWorks.steps', { returnObjects: true });
  const howItWorksIcons = [FileText, Users, Lock, CheckCircle2];
  const faqItems = t('landing.faq.items', { returnObjects: true });
  const howItWorks = howItWorksSteps.map((step, index) => ({
    ...step,
    icon: howItWorksIcons[index] || FileText,
    step: index + 1
  }));

  const handleAuthClick = () => {
    navigate(createPageUrl('Dashboard'));
  };

  const handleModalOpen = (modalName) => {
    const modalMap = {
      docs: setShowDocs,
      terms: setShowTerms,
      privacy: setShowPrivacy,
      beginner: setShowBeginnerGuide,
      summary: setShowTermsSummary,
      compliance: setShowCompliance,
      kyc: setShowKYCPolicy,
      disclaimer: setShowLegalDisclaimer,
      safety: setShowSafety
    };
    modalMap[modalName]?.(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header Navigation */}
      <LandingHeader onAuthClick={handleAuthClick} onModalOpen={handleModalOpen} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            {/* Logo */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6935c88e6bbf26b171a5a3a1/0e150037c_TECHWEALTH.png" 
                  alt="TRUSTFY"
                  className="w-16 h-16 object-contain"
                />
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
                  TRUSTFY
                </h1>
              </div>
              <p className="text-lg md:text-xl text-slate-300 font-medium">
                {t('landing.hero.brandTagline')}
              </p>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight">
              {t('landing.hero.titleLine1')}
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                {t('landing.hero.titleLine2')}
              </span>
            </h2>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                onClick={handleAuthClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                {t('landing.hero.launchApp')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setShowDocs(true)}
                className="border-slate-700 text-white hover:bg-slate-800 hover:border-blue-500/50 text-lg px-8 py-6 group transition-all"
              >
                <BookOpen className="w-5 h-5 mr-2 group-hover:text-blue-400 transition-colors" />
                {t('landing.hero.viewDocumentation')}
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>

            {/* Terms Notice */}
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">
              {t('landing.hero.termsPrefix')}{' '}
              <button onClick={() => setShowTerms(true)} className="text-blue-400 hover:text-blue-300 underline">
                {t('landing.hero.termsLabel')}
              </button>{' '}
              {t('landing.common.and', { defaultValue: 'and' })}{' '}
              <button onClick={() => setShowPrivacy(true)} className="text-purple-400 hover:text-purple-300 underline">
                {t('landing.hero.privacyLabel')}
              </button>
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('landing.hero.badges.onChain')}
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                {t('landing.hero.badges.nonCustodial')}
              </Badge>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 px-4 py-2">
                <Lock className="w-4 h-4 mr-2" />
                {t('landing.hero.badges.bonds')}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.features.heading')}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('landing.features.subheading')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-900/50 border-slate-800 p-6 hover:border-slate-700 transition-all h-full">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 w-fit mb-4">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.howItWorks.heading')}
            </h2>
            <p className="text-slate-400 text-lg">
              {t('landing.howItWorks.subheading')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
              <HelpCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.faq.heading')}
            </h2>
            <p className="text-slate-400 text-lg">
              {t('landing.faq.subheading')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`item-${index + 1}`}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50"
                >
                  <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    <div className="space-y-3 pt-2">
                      <p>{item.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('landing.cta.heading')}
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                {t('landing.cta.subheading')}
              </p>
              <Button 
                size="lg" 
                onClick={handleAuthClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-6"
              >
                {t('landing.cta.button')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-slate-500 text-xs mt-4">
                {t('landing.cta.termsLinePrefix')}{' '}
                <button onClick={() => setShowTerms(true)} className="text-blue-400 hover:underline">
                  {t('landing.cta.termsShort')}
                </button>
                {' '}
                {t('landing.common.and', { defaultValue: 'and' })}{' '}
                <button onClick={() => setShowPrivacy(true)} className="text-purple-400 hover:underline">
                  {t('landing.cta.privacyShort')}
                </button>
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter onModalOpen={handleModalOpen} />

      {/* Modals */}
      <DocumentationModal open={showDocs} onOpenChange={setShowDocs} />
      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
      <PrivacyModal open={showPrivacy} onOpenChange={setShowPrivacy} />
      <BeginnerGuideModal open={showBeginnerGuide} onOpenChange={setShowBeginnerGuide} />
      <TermsSummaryModal open={showTermsSummary} onOpenChange={setShowTermsSummary} />
      <ComplianceModal open={showCompliance} onOpenChange={setShowCompliance} />
      <KYCPolicyModal open={showKYCPolicy} onOpenChange={setShowKYCPolicy} />
      <LegalDisclaimerModal open={showLegalDisclaimer} onOpenChange={setShowLegalDisclaimer} />
      <SafetyModal open={showSafety} onOpenChange={setShowSafety} />
      
    </div>
  );
}
