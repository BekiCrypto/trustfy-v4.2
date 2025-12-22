import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  Star,
  DollarSign,
  Activity,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function InsuranceProviderCard({ provider, index = 0 }) {
  const utilizationRate = provider.capital_staked > 0 
    ? ((provider.capital_staked - provider.capital_available) / provider.capital_staked * 100).toFixed(1)
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{provider.provider_name}</h3>
              <p className="text-sm text-slate-400 mb-2">{provider.description}</p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  {provider.base_premium_rate}% Base Rate
                </Badge>
                
                {provider.status === 'active' && (
                  <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {provider.provider_rating?.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" />
              Capital
            </div>
            <p className="text-white font-semibold">
              ${provider.capital_available?.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Available</p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Activity className="w-3 h-3" />
              Utilization
            </div>
            <p className="text-white font-semibold">{utilizationRate}%</p>
            <p className="text-xs text-slate-500">In use</p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Award className="w-3 h-3" />
              Policies
            </div>
            <p className="text-white font-semibold">{provider.total_policies_written || 0}</p>
            <p className="text-xs text-slate-500">Written</p>
          </div>
          
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              Claims
            </div>
            <p className="text-white font-semibold">
              {provider.claim_ratio ? (provider.claim_ratio * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-500">Ratio</p>
          </div>
        </div>
        
        {/* Coverage Range */}
        <div className="mb-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <p className="text-xs text-slate-500 mb-1">Coverage Range</p>
          <p className="text-sm text-slate-300">
            ${provider.min_coverage?.toLocaleString()} - ${provider.max_coverage?.toLocaleString()}
          </p>
        </div>
        
        {/* Supported Chains */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-xs text-slate-500">Supported:</span>
          {provider.supported_chains?.map((chain) => (
            <Badge key={chain} variant="outline" className="text-xs border-slate-600 text-slate-400">
              {chain}
            </Badge>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Link to={createPageUrl(`InsuranceProviderDetails?id=${provider.id}`)} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              View Details
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}