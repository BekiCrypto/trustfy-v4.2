import { Shield, Star, Crown, Gem, Sparkles } from "lucide-react";

export const TIER_BENEFITS = {
  new: {
    name: 'tierNames.new',
    icon: Shield,
    color: 'from-slate-500 to-slate-600',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
    minReputation: 0,
    minTrades: 0,
    minVolume: 0,
    benefits: {
      makerFeeDiscount: 0,
      takerFeeDiscount: 0,
      maxTradeLimit: 10000,
      prioritySupport: false,
      insuranceDiscount: 0,
      disputePriority: 'standard'
    },
    perks: [
      'tierBenefits.standardExperience',
      'tierBenefits.basicSupport',
      'tierBenefits.standardLimits',
      'tierBenefits.walletAccess'
    ]
  },
  bronze: {
    name: 'tierNames.bronze',
    icon: Shield,
    color: 'from-orange-700 to-orange-900',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    minReputation: 600,
    minTrades: 5,
    minVolume: 1000,
    benefits: {
      makerFeeDiscount: 5,
      takerFeeDiscount: 5,
      maxTradeLimit: 25000,
      prioritySupport: false,
      insuranceDiscount: 2,
      disputePriority: 'standard'
    },
    perks: [
      'tierBenefits.verifiedBadge',
      'tierBenefits.higherLimits',
      'tierBenefits.enhancedVisibility',
      'tierBenefits.requiresKyc'
    ]
  },
  silver: {
    name: 'tierNames.silver',
    icon: Star,
    color: 'from-slate-400 to-slate-600',
    textColor: 'text-slate-300',
    bgColor: 'bg-slate-400/20',
    borderColor: 'border-slate-400/30',
    minReputation: 700,
    minTrades: 15,
    minVolume: 5000,
    benefits: {
      makerFeeDiscount: 10,
      takerFeeDiscount: 10,
      maxTradeLimit: 50000,
      prioritySupport: false,
      insuranceDiscount: 5,
      disputePriority: 'elevated'
    },
    perks: [
      'tierBenefits.elevatedDispute',
      'tierBenefits.higherLimits',
      'tierBenefits.customBadge',
      'tierBenefits.requiresKyc'
    ]
  },
  gold: {
    name: 'tierNames.gold',
    icon: Crown,
    color: 'from-yellow-500 to-amber-600',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    minReputation: 800,
    minTrades: 30,
    minVolume: 20000,
    benefits: {
      makerFeeDiscount: 15,
      takerFeeDiscount: 15,
      maxTradeLimit: 100000,
      prioritySupport: true,
      insuranceDiscount: 10,
      disputePriority: 'priority'
    },
    perks: [
      'tierBenefits.prioritySupport',
      'tierBenefits.priorityDispute',
      'tierBenefits.higherLimits',
      'tierBenefits.exclusiveGoldBadge',
      'tierBenefits.kycVerified'
    ]
  },
  platinum: {
    name: 'tierNames.platinum',
    icon: Gem,
    color: 'from-cyan-400 to-blue-600',
    textColor: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    minReputation: 900,
    minTrades: 50,
    minVolume: 50000,
    benefits: {
      makerFeeDiscount: 25,
      takerFeeDiscount: 20,
      maxTradeLimit: 500000,
      prioritySupport: true,
      insuranceDiscount: 15,
      disputePriority: 'express'
    },
    perks: [
      'tierBenefits.vipSupport',
      'tierBenefits.expressDispute',
      'tierBenefits.highestLimits',
      'tierBenefits.exclusivePlatinumBadge',
      'tierBenefits.earlyAccess',
      'tierBenefits.fullKyc'
    ]
  }
};

export const calculateTier = (profile) => {
  if (!profile) return 'new';
  
  const { reputation_score = 0, total_trades = 0, total_volume = 0 } = profile;
  
  const tiers = ['platinum', 'gold', 'silver', 'bronze'];
  
  for (const tier of tiers) {
    const config = TIER_BENEFITS[tier];
    if (
      reputation_score >= config.minReputation &&
      total_trades >= config.minTrades &&
      total_volume >= config.minVolume
    ) {
      return tier;
    }
  }
  
  return 'new';
};

export const getNextTier = (currentTier) => {
  const tierOrder = ['new', 'bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1];
  }
  return null;
};

export const getTierProgress = (profile, currentTier) => {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return { progress: 100, requirements: [] };
  
  const nextConfig = TIER_BENEFITS[nextTier];
  const { reputation_score = 0, total_trades = 0, total_volume = 0 } = profile || {};
  
  const requirements = [
    {
      label: 'tiersPage.reputationScoreLabel',
      current: reputation_score,
      required: nextConfig.minReputation,
      progress: Math.min((reputation_score / nextConfig.minReputation) * 100, 100)
    },
    {
      label: 'tiersPage.successfulTradesLabel',
      current: total_trades,
      required: nextConfig.minTrades,
      progress: Math.min((total_trades / nextConfig.minTrades) * 100, 100)
    },
    {
      label: 'tiersPage.tradingVolumeLabel',
      current: total_volume,
      required: nextConfig.minVolume,
      progress: Math.min((total_volume / nextConfig.minVolume) * 100, 100)
    }
  ];
  
  const overallProgress = requirements.reduce((sum, req) => sum + req.progress, 0) / requirements.length;
  
  return { progress: overallProgress, requirements };
};
