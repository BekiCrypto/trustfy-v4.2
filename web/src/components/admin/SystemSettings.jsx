import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Settings, DollarSign, Shield, AlertTriangle } from "lucide-react";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // Revenue settings
    defaultMakerFee: 1.0,
    defaultTakerFee: 1.5,
    disputeFee: 1.0,
    
    // Insurance settings
    minInsuranceCoverage: 100,
    maxInsuranceCoverage: 100000,
    baseInsurancePremium: 2.5,
    
    // Escrow settings
    minTradeAmount: 10,
    maxTradeAmount: 1000000,
    defaultTradeTimeout: 48,
    
    // Dispute settings
    autoEscalationEnabled: true,
    escalationThreshold: 72,
    
    // Platform features
    insuranceEnabled: true,
    p2pMarketplaceEnabled: true,
    kycRequired: false
  });
  
  const handleSave = () => {
    // In production, this would save to a Settings entity
    toast.success('Settings saved successfully');
  };
  
  return (
    <div className="space-y-6 max-w-4xl">
      <Alert className="bg-amber-500/10 border-amber-500/30">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-amber-300 text-sm">
          This panel is informational and does not change on-chain configuration. On-chain settings apply to new Ads and trades only.
        </AlertDescription>
      </Alert>
      {/* Fee Configuration (Reference Only) */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Fee Configuration (Reference)</h3>
            <p className="text-slate-400 text-sm">Displayed values do not change on-chain settings</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Maker Fee (bps)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.defaultMakerFee}
                onChange={(e) => setSettings({...settings, defaultMakerFee: parseFloat(e.target.value)})}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Taker Fee (bps)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.defaultTakerFee}
                onChange={(e) => setSettings({...settings, defaultTakerFee: parseFloat(e.target.value)})}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-slate-300">DisputeBond Bps (reference)</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.disputeFee}
              onChange={(e) => setSettings({...settings, disputeFee: parseFloat(e.target.value)})}
              className="bg-slate-800 border-slate-700 mt-1"
            />
          </div>
        </div>
      </Card>
      
      {/* Insurance Configuration */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Insurance Configuration</h3>
            <p className="text-slate-400 text-sm">Configure insurance parameters</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Min Coverage ($)</Label>
              <Input
                type="number"
                value={settings.minInsuranceCoverage}
                onChange={(e) => setSettings({...settings, minInsuranceCoverage: parseFloat(e.target.value)})}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Max Coverage ($)</Label>
              <Input
                type="number"
                value={settings.maxInsuranceCoverage}
                onChange={(e) => setSettings({...settings, maxInsuranceCoverage: parseFloat(e.target.value)})}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-slate-300">Base Premium Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.baseInsurancePremium}
              onChange={(e) => setSettings({...settings, baseInsurancePremium: parseFloat(e.target.value)})}
              className="bg-slate-800 border-slate-700 mt-1"
            />
          </div>
        </div>
      </Card>
      
      {/* Escrow Configuration */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Escrow Configuration</h3>
            <p className="text-slate-400 text-sm">Configure escrow limits and timeouts</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Min Escrow Amount ($)</Label>
              <Input
                type="number"
                value={settings.minTradeAmount}
                onChange={(e) => setSettings({...settings, minTradeAmount: parseFloat(e.target.value)})}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300">Max Escrow Amount ($)</Label>
              <Input
                type="number"
                value={settings.maxTradeAmount}
                onChange={(e) => setSettings({...settings, maxTradeAmount: parseFloat(e.target.value)})}
                className="bg-slate-800 border-slate-700 mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-slate-300">Default Escrow Timeout (hours)</Label>
            <Input
              type="number"
              value={settings.defaultTradeTimeout}
              onChange={(e) => setSettings({...settings, defaultTradeTimeout: parseInt(e.target.value)})}
              className="bg-slate-800 border-slate-700 mt-1"
            />
          </div>
        </div>
      </Card>
      
      {/* Dispute Configuration */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Dispute Configuration</h3>
            <p className="text-slate-400 text-sm">Configure dispute escalation settings</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
            <div>
              <p className="text-white font-medium">Auto-Escalation</p>
              <p className="text-slate-400 text-sm">Automatically escalate unresolved disputes</p>
            </div>
            <Switch
              checked={settings.autoEscalationEnabled}
              onCheckedChange={(checked) => setSettings({...settings, autoEscalationEnabled: checked})}
            />
          </div>
          
          <div>
            <Label className="text-slate-300">Escalation Threshold (hours)</Label>
            <Input
              type="number"
              value={settings.escalationThreshold}
              onChange={(e) => setSettings({...settings, escalationThreshold: parseInt(e.target.value)})}
              className="bg-slate-800 border-slate-700 mt-1"
            />
          </div>
        </div>
      </Card>
      
      {/* Feature Toggles */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Feature Toggles</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
            <div>
              <p className="text-white font-medium">Insurance Module</p>
              <p className="text-slate-400 text-sm">Enable trade insurance feature</p>
            </div>
            <Switch
              checked={settings.insuranceEnabled}
              onCheckedChange={(checked) => setSettings({...settings, insuranceEnabled: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
            <div>
              <p className="text-white font-medium">P2P Marketplace</p>
              <p className="text-slate-400 text-sm">Enable P2P trading marketplace</p>
            </div>
            <Switch
              checked={settings.p2pMarketplaceEnabled}
              onCheckedChange={(checked) => setSettings({...settings, p2pMarketplaceEnabled: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
            <div>
              <p className="text-white font-medium">Mandatory KYC</p>
              <p className="text-slate-400 text-sm">Require KYC verification for all users</p>
            </div>
            <Switch
              checked={settings.kycRequired}
              onCheckedChange={(checked) => setSettings({...settings, kycRequired: checked})}
            />
          </div>
        </div>
      </Card>
      
      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Settings
      </Button>
    </div>
  );
}
