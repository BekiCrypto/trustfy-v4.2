import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { hasPageAccess } from "./AccessControl";

export default function ProtectedPage({ children, requiredRoles, pageName }) {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });
  
  if (loadingUser || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  const userRole = profile?.platform_role || 'user';
  const hasAccess = pageName 
    ? hasPageAccess(userRole, pageName, user?.email)
    : (user?.email === 'bikilad@gmail.com' || requiredRoles?.includes(userRole));
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <Card className="bg-slate-900 border-slate-700 p-12 text-center max-w-md">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Required role: {requiredRoles?.join(' or ') || 'Higher access level'}
            <br />
            Your role: {userRole}
          </p>
          <Link to={createPageUrl('Marketplace')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Marketplace
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  return children;
}