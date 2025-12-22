import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Scale, User, Crown, CheckCircle } from "lucide-react";

export default function RolesGuide() {
  const roles = [
    {
      name: 'Super Admin',
      value: 'super_admin',
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      description: 'Full platform access and control',
      access: [
        'All admin panel features',
        'User management (promote/demote roles)',
        'System settings and configuration',
        'Platform analytics and reports',
        'Fee management',
        'Insurance provider management',
        'Arbitration oversight',
        'All user features'
      ],
      autoAssigned: 'Reserved for platform owner (bikilad@gmail.com) only',
      howToAssign: 'Owner email is hardcoded - cannot be changed'
    },
    {
      name: 'Admin',
      value: 'admin',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      description: 'Platform management and oversight',
      access: [
        'Admin panel access',
        'View platform statistics',
        'Manage trades and disputes',
        'View all user profiles',
        'Platform analytics',
        'All user features'
      ],
      autoAssigned: 'Auto-assigned to User.role = "admin" from Base44 platform (excluding owner)',
      howToAssign: 'Invite user as Admin in Base44 dashboard → User Settings'
    },
    {
      name: 'Arbitrator',
      value: 'arbitrator',
      icon: Scale,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      description: 'Dispute resolution specialist',
      access: [
        'Arbitration dashboard',
        'Review and resolve disputes',
        'Access dispute evidence',
        'Make rulings on trades',
        'View AI dispute analysis',
        'All user features'
      ],
      autoAssigned: 'Must be manually assigned',
      howToAssign: 'Super Admin → Admin Panel → Edit UserProfile.platform_role'
    },
    {
      name: 'User',
      value: 'user',
      icon: User,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      description: 'Regular platform user',
      access: [
        'Create and manage trade offers',
        'Buy and sell crypto (with bond requirements)',
        'Chat with trading partners',
        'Manage orders',
        'Lock dispute bonds when trading',
        'Rate trading partners',
        'Open disputes',
        'View own analytics',
        'KYC verification'
      ],
      autoAssigned: 'Default role for all new users',
      howToAssign: 'Automatically assigned on first login'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Platform Roles & Permissions</h1>
          <p className="text-slate-400">Understanding access levels and how to assign roles</p>
        </div>

        {/* Role Mapping Explanation */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Role System Architecture
          </h2>
          <div className="space-y-4 text-slate-300">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <h3 className="text-white font-medium mb-2">Two-Tier Role System:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="text-blue-400 font-mono">User.role</span> (Base44 Platform) - 
                    <span className="text-slate-400"> Controls Base44 admin access: "admin" or "user"</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="text-purple-400 font-mono">UserProfile.platform_role</span> (This App) - 
                    <span className="text-slate-400"> Controls app features: "super_admin", "admin", "arbitrator", "user"</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h3 className="text-blue-400 font-medium mb-2">Automatic Role Mapping:</h3>
              <ul className="space-y-1 text-sm">
                <li>• User.role = <span className="font-mono">"admin"</span> → UserProfile.platform_role = <span className="font-mono">"super_admin"</span></li>
                <li>• User.role = <span className="font-mono">"user"</span> → UserProfile.platform_role = <span className="font-mono">"user"</span></li>
                <li>• Arbitrators must be promoted manually by Super Admin</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Role Cards */}
        <div className="grid gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.value} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">{role.name}</h2>
                      <Badge className={`${role.bgColor} border ${role.borderColor} text-white`}>
                        {role.value}
                      </Badge>
                    </div>
                    <p className="text-slate-400">{role.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Access Rights */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Access Rights
                    </h3>
                    <ul className="space-y-2">
                      {role.access.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Assignment Info */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Assignment</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">Auto-Assignment:</p>
                        <p className="text-sm text-slate-300">{role.autoAssigned}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">How to Assign:</p>
                        <p className="text-sm text-slate-300">{role.howToAssign}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Usage Guide */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Start Guide</h2>
          <div className="space-y-4 text-slate-300 text-sm">
            <div>
              <h3 className="text-white font-medium mb-2">1. Promote User to Arbitrator:</h3>
              <ol className="list-decimal list-inside space-y-1 pl-4">
                <li>Go to Admin Panel → User Management</li>
                <li>Find the user you want to promote</li>
                <li>Click Edit → Change platform_role to "arbitrator"</li>
                <li>User will see Arbitration Dashboard on next login</li>
              </ol>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">2. Grant Super Admin Access:</h3>
              <ol className="list-decimal list-inside space-y-1 pl-4">
                <li>In Base44 Dashboard → Settings → Users</li>
                <li>Invite user with Admin role</li>
                <li>User logs in → Automatically gets super_admin in app</li>
                <li>Full platform access granted</li>
              </ol>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">3. Check User Roles:</h3>
              <ol className="list-decimal list-inside space-y-1 pl-4">
                <li>Admin Panel → User Management</li>
                <li>View UserProfile.platform_role column</li>
                <li>Navigation updates automatically based on role</li>
              </ol>
            </div>
          </div>
        </Card>
        
        {/* Bond System Notice */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6 mt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-purple-400 font-semibold text-lg mb-2">Escrow V2: Symmetric Bond System</h3>
              <p className="text-slate-300 text-sm mb-3">
                All trades require both parties to lock equal, refundable dispute bonds:
              </p>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• <strong className="text-white">Seller:</strong> Locks bond when funding escrow (PENDING → FUNDED)</li>
                <li>• <strong className="text-white">Buyer:</strong> Locks bond when confirming fiat payment (FUNDED → IN_PROGRESS)</li>
                <li>• <strong className="text-emerald-400">Success:</strong> Both bonds refunded to respective parties</li>
                <li>• <strong className="text-amber-400">Dispute:</strong> Winner gets bond back, loser's bond → platform fee</li>
                <li>• <strong className="text-purple-400">Bond amount:</strong> Calculated as ~10% of trade value (set by smart contract)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}