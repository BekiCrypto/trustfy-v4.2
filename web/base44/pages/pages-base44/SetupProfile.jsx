import React, { useEffect, useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SetupProfile() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });
  
  const { data: profile, refetch } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ wallet_address: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });
  
  const createProfile = useMutation({
    mutationFn: async () => {
      // Determine role based on User.role and email
      let role = 'user';
      if (user.email === 'bikilad@gmail.com') {
        role = 'super_admin';
      } else if (user.role === 'admin') {
        role = 'admin';
      }
      // Note: arbitrator role must be manually assigned by super_admin
      
      return base44.entities.UserProfile.create({
        wallet_address: user.email,
        platform_role: role,
        display_name: user.full_name || user.email.split('@')[0]
      });
    },
    onSuccess: () => {
      setStatus('success');
      refetch();
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 2000);
    },
    onError: (error) => {
      setStatus('error');
      console.error('Profile creation error:', error);
    }
  });
  
  useEffect(() => {
    if (profile) {
      setStatus('exists');
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 1000);
    } else if (user && status === 'checking') {
      setStatus('ready');
    }
  }, [profile, user, status, navigate]);
  
  if (status === 'checking' || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Checking your profile...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'exists') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-900 border-slate-700 p-12 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile Found</h2>
          <p className="text-slate-400">Redirecting to dashboard...</p>
        </Card>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-900 border-slate-700 p-12 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile Created!</h2>
          <p className="text-slate-400 mb-4">Your profile has been set up successfully.</p>
          <p className="text-sm text-slate-500">
            Role: {profile?.platform_role || 'user'}
          </p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
      <Card className="bg-slate-900 border-slate-700 p-12 text-center max-w-md">
        <UserPlus className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to TRUSTFY</h2>
        <p className="text-slate-400 mb-6">
          We need to create your profile to get started.
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Email: {user?.email}
        </p>
        
        {status === 'error' && (
          <p className="text-red-400 text-sm mb-4">
            Failed to create profile. Please try again.
          </p>
        )}
        
        <Button
          onClick={() => createProfile.mutate()}
          disabled={createProfile.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {createProfile.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Profile...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Profile
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}