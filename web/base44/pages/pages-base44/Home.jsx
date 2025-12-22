import React from 'react';
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
import SignatureAuth from "../components/auth/SignatureAuth";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { toast } from "sonner";
import {
  Shield,
  TrendingUp,
  Users,
  Lock,
  Zap,
  Globe,
  CheckCircle2,
  ArrowRight,
  Star,
  BarChart3,
  MessageSquare,
  Award,
  Wallet,
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
  const [showDocs, setShowDocs] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showBeginnerGuide, setShowBeginnerGuide] = React.useState(false);
  const [showTermsSummary, setShowTermsSummary] = React.useState(false);
  const [showCompliance, setShowCompliance] = React.useState(false);
  const [showKYCPolicy, setShowKYCPolicy] = React.useState(false);
  const [showLegalDisclaimer, setShowLegalDisclaimer] = React.useState(false);
  const [showSafety, setShowSafety] = React.useState(false);
  const [showSignatureAuth, setShowSignatureAuth] = React.useState(false);
  const { open: openWeb3Modal } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  
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
      title: "Symmetric Bond Escrow",
      description: "Both parties lock equal dispute bonds to ensure fair play. Winner gets both bonds, loser's bond becomes platform fee."
    },
    {
      icon: Scale,
      title: "Multi-Tier Dispute Resolution",
      description: "AI analysis, human arbitrators, and DAO governance for fair dispute handling"
    },
    {
      icon: Award,
      title: "Reputation System",
      description: "Build trust through verified ratings and reputation tiers"
    },
    {
      icon: Lock,
      title: "Insurance Protection",
      description: "Optional trade insurance from decentralized insurance providers"
    },
    {
      icon: Globe,
      title: "Multi-Chain Support",
      description: "Trade on BSC, Polygon, Arbitrum, and Optimism networks"
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description: "Quick matching, instant notifications, and streamlined workflows"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Traders" },
    { value: "$50M+", label: "Trading Volume" },
    { value: "99.8%", label: "Success Rate" },
    { value: "< 2 hrs", label: "Avg Trade Time" }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Connect Wallet",
      description: "Connect your Web3 wallet to get started",
      icon: Wallet
    },
    {
      step: "2",
      title: "Create or Browse Offers",
      description: "Post your own ad or find matching offers in the marketplace",
      icon: FileText
    },
    {
      step: "3",
      title: "Lock Bonds & Escrow",
      description: "Both parties lock refundable dispute bonds. Seller funds trade amount + fees + bond",
      icon: Lock
    },
    {
      step: "4",
      title: "Complete Trade",
      description: "Buyer pays fiat, locks bond, seller releases crypto. Both bonds refunded on success",
      icon: CheckCircle2
    }
  ];

  const handleAuthClick = async () => {
    try {
      // Open Web3Modal for wallet connection
      await openWeb3Modal();
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
      toast.error('Failed to connect wallet');
    }
  };

  // Show SignatureAuth modal after wallet connects
  React.useEffect(() => {
    if (isConnected && address) {
      setShowSignatureAuth(true);
    }
  }, [isConnected, address]);

  const handleAuthSuccess = () => {
    // After successful signature verification, redirect to dashboard
    setShowSignatureAuth(false);
    toast.success('Welcome to Trustfy!');
    // Small delay for UX
    setTimeout(() => {
      window.location.href = createPageUrl('Dashboard');
    }, 500);
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
                Trade crypto safely, privately, and fairly.
              </p>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight">
              Decentralized P2P Trading with
              <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                Smart Contract Security
              </span>
            </h2>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Trade crypto peer-to-peer with symmetric bond escrow, AI-powered dispute resolution, and decentralized insurance protection
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                onClick={handleAuthClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                Launch App
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setShowDocs(true)}
                className="border-slate-700 text-white hover:bg-slate-800 hover:border-blue-500/50 text-lg px-8 py-6 group transition-all"
              >
                <BookOpen className="w-5 h-5 mr-2 group-hover:text-blue-400 transition-colors" />
                View Documentation
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>

            {/* Terms Notice */}
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">
              By signing in you agree to Trustfy's{' '}
              <button onClick={() => setShowTerms(true)} className="text-blue-400 hover:text-blue-300 underline">
                Terms and Conditions
              </button>{' '}
              and{' '}
              <button onClick={() => setShowPrivacy(true)} className="text-purple-400 hover:text-purple-300 underline">
                Privacy Policy
              </button>
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Audited Smart Contracts
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Non-Custodial
              </Badge>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 px-4 py-2">
                <Lock className="w-4 h-4 mr-2" />
                Symmetric Bonds
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
              Why Choose TRUSTFY?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Built with cutting-edge blockchain technology and designed for maximum security and user experience
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
              How It Works
            </h2>
            <p className="text-slate-400 text-lg">
              Start trading in just 4 simple steps
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
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-lg">
              Everything you need to know about trading on TRUSTFY
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  How does the symmetric bond system work?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>TRUSTFY uses an innovative symmetric bond escrow system where both parties lock equal, refundable dispute bonds:</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Seller:</strong> Locks their bond (~10% of trade value) when funding the escrow with crypto</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Buyer:</strong> Locks their bond after sending fiat payment and marking it as paid</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Success:</strong> Both bonds are fully refunded when the trade completes successfully</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Disputes:</strong> Winner gets their bond back, loser's bond becomes platform fee - ensuring both parties act honestly</span>
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  Is my money safe? How does the escrow protect me?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>Your funds are protected by multiple layers of security:</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Smart Contract Escrow:</strong> Funds are locked in audited blockchain smart contracts - no one can access them until conditions are met</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Non-Custodial:</strong> We never hold your funds - they're secured on-chain and only you control your wallet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Scale className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Dispute Resolution:</strong> Multi-tier system with AI analysis and human arbitrators ensures fair outcomes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Bonds at Stake:</strong> Both parties have financial incentive to act honestly or lose their bond</span>
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  What happens if there's a dispute?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>Our multi-tier dispute resolution system ensures fair and fast outcomes:</p>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-1">🤖 Tier 1: AI Analysis (Minutes)</p>
                        <p className="text-sm">Automated review of evidence, chat logs, and transaction data for clear-cut cases</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-1">🏛️ Tier 2: DAO Governance (hours)</p>
                        <p className="text-sm">Decentralized community vote for high-stake disputes requiring collective decision-making</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-1">👨‍⚖️ Tier 3: Human Arbitration (few minutes-hours)</p>
                        <p className="text-sm">Professional arbitrators review evidence and make fair, binding rulings for complex disputes</p>
                      </div>
                    </div>
                    <p className="text-blue-400 font-medium">⚡ Most disputes resolve in minutes to few hours</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  What are the fees and costs?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>TRUSTFY uses a transparent, competitive fee structure:</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold flex-shrink-0">1%</span>
                        <span><strong>Maker Fee:</strong> Charged to the seller (offer creator) when escrow is funded</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold flex-shrink-0">1.5%</span>
                        <span><strong>Taker Fee:</strong> Charged to the buyer (offer acceptor) when completing trade</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold flex-shrink-0">~1%</span>
                        <span><strong>Dispute Bonds:</strong> Fully refundable security deposit locked by both parties (returned on successful trade completion)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold flex-shrink-0">2-3%</span>
                        <span><strong>Insurance (Optional):</strong> Protect your trade against defaults or fraud</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Reputation Discounts:</strong> Build your reputation to earn fee discounts up to 50%</span>
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  How do I get started trading?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>Getting started is simple and takes less than 5 minutes:</p>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex-shrink-0">1</span>
                        <div>
                          <p className="font-semibold text-white">Connect Your Wallet</p>
                          <p className="text-sm">Use MetaMask, WalletConnect, or any Web3 wallet on BSC network</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex-shrink-0">2</span>
                        <div>
                          <p className="font-semibold text-white">Set Reputation Requirements</p>
                          <p className="text-sm">Specify minimum reputation or optional verification levels for your trading partners</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex-shrink-0">3</span>
                        <div>
                          <p className="font-semibold text-white">Fund Escrow & Lock Bonds</p>
                          <p className="text-sm">Seller funds crypto + fees + bond, buyer locks bond after paying fiat</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex-shrink-0">4</span>
                        <div>
                          <p className="font-semibold text-white">Complete & Release</p>
                          <p className="text-sm">Seller releases crypto, bonds refunded automatically - build your reputation!</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  How does the reputation system work?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>Build trust and unlock benefits through our comprehensive reputation system:</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Trade History:</strong> Complete successful trades to increase your score (0-1000 scale)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Award className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Reputation Tiers:</strong> Progress from New → Bronze → Silver → Gold → Platinum</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Fee Discounts:</strong> Higher tiers earn up to 50% discount on trading fees</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Partner Ratings:</strong> Receive and give ratings to build community trust</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Optional Verification:</strong> Add email or KYC for Prime features and higher limits (completely voluntary)</span>
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  What payment methods are supported?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>TRUSTFY supports a wide variety of fiat payment methods for maximum flexibility:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-2">🏦 Bank Transfers</p>
                        <ul className="text-sm space-y-1">
                          <li>• Wire Transfer / SWIFT</li>
                          <li>• ACH / SEPA / SPEI</li>
                          <li>• Local Bank Transfer</li>
                          <li>• Faster Payments</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-2">💳 Digital Wallets</p>
                        <ul className="text-sm space-y-1">
                          <li>• PayPal / Venmo / Zelle</li>
                          <li>• Cash App / Apple Pay</li>
                          <li>• Revolut / Wise / N26</li>
                          <li>• Google Pay</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-2">📱 Mobile Money</p>
                        <ul className="text-sm space-y-1">
                          <li>• M-Pesa / Telebirr</li>
                          <li>• GCash / PayMaya</li>
                          <li>• Alipay / WeChat Pay</li>
                          <li>• MTN Mobile Money</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-2">🌍 Regional Methods</p>
                        <ul className="text-sm space-y-1">
                          <li>• PIX / Mercado Pago</li>
                          <li>• UPI / PhonePe / Paytm</li>
                          <li>• KakaoPay / Toss</li>
                          <li>• 100+ more options</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-blue-400 text-sm">✨ Specify your preferred methods when creating offers to match with compatible traders worldwide</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  What is the Smart Bond Credit system?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>Smart Bond Credits are your <strong>reusable security deposit pool</strong> that makes trading faster and cheaper:</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Earn Credits:</strong> Complete successful trades to accumulate bond credits in your account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Instant Trading:</strong> Use accumulated credits instead of locking new bonds for each trade - trade faster!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Lower Costs:</strong> Save on gas fees and transaction costs by reusing your bond pool</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Wallet className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Withdraw Anytime:</strong> Claim your bond credits back to your wallet whenever you want</span>
                      </li>
                    </ul>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 mt-3">
                      <p className="text-sm"><strong className="text-purple-400">💡 Pro Tip:</strong> Build up your bond credit balance to become a power trader with instant execution and minimal overhead costs!</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  Can I automate my trading with bots?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>Yes! TRUSTFY provides powerful automation tools for advanced traders:</p>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-1">🤖 Trading API</p>
                        <p className="text-sm">RESTful API with full CRUD access to create, monitor, and manage trades programmatically</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-1">🔮 AI Strategy Analyzer</p>
                        <p className="text-sm">Upload your trading strategy and get AI-powered analysis with risk assessment and optimization tips</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-1">📊 Arbitrage Scanner</p>
                        <p className="text-sm">Real-time arbitrage opportunity detection across all marketplace offers with profit calculations</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-1">🔐 Secure API Keys</p>
                        <p className="text-sm">Generate and manage multiple API keys with granular permissions for safe automation</p>
                      </div>
                    </div>
                    <p className="text-emerald-400 text-sm font-medium">✅ Perfect for market makers, arbitrage traders, and high-volume merchants</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  What tokens and blockchains are supported?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>TRUSTFY supports major stablecoins and cryptocurrencies across multiple chains:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-2">💰 Supported Tokens</p>
                        <ul className="text-sm space-y-1">
                          <li>• <strong className="text-emerald-400">USDT</strong> - Tether USD</li>
                          <li>• <strong className="text-blue-400">USDC</strong> - USD Coin</li>
                          <li>• <strong className="text-yellow-400">BUSD</strong> - Binance USD</li>
                          <li>• <strong className="text-amber-400">BNB</strong> - Binance Coin</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="font-semibold text-white mb-2">⛓️ Blockchain Networks</p>
                        <ul className="text-sm space-y-1">
                          <li>• <strong className="text-amber-400">BSC</strong> - Binance Smart Chain (Live)</li>
                          <li>• <strong className="text-purple-400">Polygon</strong> - Coming Soon</li>
                          <li>• <strong className="text-blue-400">Arbitrum</strong> - Coming Soon</li>
                          <li>• <strong className="text-red-400">Optimism</strong> - Coming Soon</li>
                        </ul>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 mt-3">
                      <p className="text-sm"><strong className="text-amber-400">🚀 MVP Phase:</strong> Currently live on Binance Smart Chain (BSC) with low fees and fast transactions. Multi-chain expansion coming Q1 2026!</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  Is insurance really necessary? How does it work?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>Trade insurance is <strong>optional but recommended</strong> for large trades or when trading with new users:</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Coverage:</strong> Protects you against counterparty default, fraud, or dispute losses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Dynamic Pricing:</strong> Premium calculated based on trade amount, reputation, and risk factors (typically 2-3%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Decentralized Providers:</strong> Multiple insurance providers compete for your business with transparent terms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Fast Claims:</strong> Automated claim processing linked to dispute outcomes - get paid within hours</span>
                      </li>
                    </ul>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/30 mt-3">
                      <p className="text-sm"><strong className="text-blue-400">💼 Smart Choice:</strong> Consider insurance for trades over $1,000 or when trading with users below Gold tier reputation</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12" className="bg-slate-900/50 border border-slate-800 rounded-xl px-6 data-[state=open]:border-blue-500/50">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  What makes TRUSTFY different from other P2P platforms?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  <div className="space-y-3 pt-2">
                    <p>TRUSTFY introduces several innovations that make P2P trading safer and more efficient:</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Symmetric Bond Escrow:</strong> Both parties lock equal bonds - first of its kind for true alignment of incentives</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Smart Bond Credits:</strong> Reusable bond pool system reduces costs and speeds up repeat trading</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span><strong>AI-First Disputes:</strong> Automated analysis resolves 80%+ of disputes in minutes without human intervention</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Decentralized Insurance:</strong> Built-in optional insurance marketplace with competitive pricing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Advanced Reputation:</strong> Multi-factor scoring system with tier rewards and fee discounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Trading Automation:</strong> Full API, AI strategy analyzer, and arbitrage detection for power users</span>
                      </li>
                    </ul>
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 mt-3">
                      <p className="text-sm"><strong className="text-purple-400">🌟 Built Different:</strong> TRUSTFY is designed from the ground up as a truly decentralized, user-centric platform with innovative security mechanisms</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
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
                Ready to Start Trading?
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of traders using TRUSTFY for secure, decentralized P2P trading
              </p>
              <Button 
                size="lg" 
                onClick={handleAuthClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-6"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-slate-500 text-xs mt-4">
                By signing in you agree to our{' '}
                <button onClick={() => setShowTerms(true)} className="text-blue-400 hover:underline">Terms</button>
                {' '}and{' '}
                <button onClick={() => setShowPrivacy(true)} className="text-purple-400 hover:underline">Privacy Policy</button>
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
      
      {/* Signature Authentication Modal */}
      <SignatureAuth 
        open={showSignatureAuth} 
        onOpenChange={setShowSignatureAuth}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}