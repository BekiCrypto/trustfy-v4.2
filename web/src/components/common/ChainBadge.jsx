import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Link2 } from "lucide-react";

const chainConfig = {
  BSC: { label: 'BSC', color: 'from-yellow-500/20 to-yellow-600/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  BSC_TESTNET: { label: 'BSC Testnet', color: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  Polygon: { label: 'Polygon', color: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  Arbitrum: { label: 'Arbitrum', color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  Optimism: { label: 'Optimism', color: 'from-red-500/20 to-red-600/20', border: 'border-red-500/30', text: 'text-red-400' }
};

export default function ChainBadge({ chain }) {
  const config = chainConfig[chain] || chainConfig.BSC;
  
  return (
    <Badge className={`bg-gradient-to-r ${config.color} ${config.border} ${config.text} border font-medium text-xs flex items-center gap-1`}>
      <Link2 className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
