import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Scale, User, Crown, CheckCircle, Info } from "lucide-react";
import ComingSoonBanner from "../components/common/ComingSoonBanner";

export default function RolesGuide() {
  const { t } = useTranslation();

  const roles = [
    {
      key: 'superAdmin',
      name: t('rolesGuide.superAdmin'),
      value: t('rolesGuidePage.superAdmin'),
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      description: t('rolesGuide.superAdminDesc'),
      permissions: [
        t('rolesGuidePage.fullAccessAdmin'),
        t('rolesGuidePage.manageAllRoles'),
        t('rolesGuidePage.viewManageAllEscrows'),
        t('rolesGuidePage.resolveDisputesAnyLevel'),
        t('rolesGuidePage.manageInsuranceProviders'),
        t('rolesGuidePage.configurePlatformFees'),
        t('rolesGuidePage.accessPlatformAnalytics')
      ],
      restrictions: [
        t('rolesGuidePage.cannotBeDemoted')
      ]
    },
    {
      key: 'admin',
      name: t('rolesGuide.admin'),
      value: t('rolesGuidePage.admin'),
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      description: t('rolesGuide.adminDesc'),
      permissions: [
        t('rolesGuidePage.accessAdminPanel'),
        t('rolesGuidePage.manageUserArbitrator'),
        t('rolesGuidePage.viewManageEscrows'),
        t('rolesGuidePage.resolveAnyLevel'),
        t('rolesGuidePage.manageInsuranceClaims'),
        t('rolesGuidePage.viewAnalytics')
      ],
      restrictions: [
        t('rolesGuidePage.cannotModifySuperAdmin'),
        t('rolesGuidePage.cannotPromoteSuperAdmin'),
        t('rolesGuidePage.cannotChangeFees')
      ]
    },
    {
      key: 'arbitrator',
      name: t('rolesGuide.arbitrator'),
      value: t('rolesGuidePage.arbitrator'),
      icon: Scale,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      description: t('rolesGuide.arbitratorDesc'),
      permissions: [
        t('rolesGuidePage.accessArbitratorDashboard'),
        t('rolesGuidePage.reviewResolveAssigned'),
        t('rolesGuidePage.requestEvidence'),
        t('rolesGuidePage.submitRulings'),
        t('rolesGuidePage.viewDisputeAnalytics'),
        t('rolesGuidePage.earnFees')
      ],
      restrictions: [
        t('rolesGuidePage.noAccessAdmin'),
        t('rolesGuidePage.cannotModifyUsers'),
        t('rolesGuidePage.cannotManageSettings'),
        t('rolesGuidePage.onlyAssignedCases')
      ]
    },
    {
      key: 'user',
      name: t('rolesGuide.user'),
      value: t('rolesGuidePage.user'),
      icon: User,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      description: t('rolesGuide.userDesc'),
      permissions: [
        t('rolesGuidePage.createManageOffers'),
        t('rolesGuidePage.acceptOffersInitiate'),
        t('rolesGuidePage.chatCounterparties'),
        t('rolesGuidePage.uploadPaymentEvidence'),
        t('rolesGuidePage.initiateDisputesOwn'),
        t('rolesGuidePage.purchaseInsurance'),
        t('rolesGuidePage.viewOwnProfile'),
        t('rolesGuidePage.upgradeTier')
      ],
      restrictions: [
        t('rolesGuidePage.noArbitratorDashboard'),
        t('rolesGuidePage.cannotManageOthers'),
        t('rolesGuidePage.cannotResolveDisputes'),
        t('rolesGuidePage.onlyViewOwn')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <ComingSoonBanner />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('rolesGuidePage.platformRolesPermissions')}</h1>
          <p className="text-slate-400">{t('rolesGuidePage.understandingAccess')}</p>
        </div>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            {t('rolesGuidePage.importantRoleManagement')}
          </h2>
          <div className="space-y-4 text-slate-300">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-sm">
                {t('rolesGuidePage.rolesManaged')} <span className="font-mono text-blue-400">UserProfile.platform_role</span> {t('rolesGuidePage.platformRoleField')}
              </p>
              <div className="mt-3 text-sm">
                <p className="font-semibold text-white">{t('rolesGuidePage.toManageRoles')}</p>
                <ul className="space-y-1 ml-4">
                  <li>• {t('rolesGuidePage.step1')}</li>
                  <li>• {t('rolesGuidePage.step2')} <span className="font-mono">{t('rolesGuidePage.usersTab')}</span> {t('rolesGuidePage.fromSidebar')}</li>
                  <li>• {t('rolesGuidePage.step3')}</li>
                  <li>• {t('rolesGuidePage.step4')}</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 mt-0.5" />
              <p className="text-sm text-slate-300">{t('rolesGuidePage.warning')}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.key} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 p-6">
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
                  <div>
                    <h3 className="text-white font-semibold mb-3">{t('rolesGuidePage.permissions')}</h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      {role.permissions.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-3">{t('rolesGuidePage.restrictions')}</h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      {role.restrictions.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
