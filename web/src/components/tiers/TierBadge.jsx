import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TIER_BENEFITS } from './TierConfig';
import { useTranslation } from '@/hooks/useTranslation';

export default function TierBadge({ tier, size = 'md', showName = true }) {
  const { t } = useTranslation();
  const config = TIER_BENEFITS[tier] || TIER_BENEFITS.new;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <Badge className={`bg-gradient-to-r ${config.color} border ${config.borderColor} font-semibold ${sizeClasses[size]} flex items-center gap-1.5 w-fit`}>
      <Icon className={iconSizes[size]} />
      {showName && t(config.name)}
    </Badge>
  );
}