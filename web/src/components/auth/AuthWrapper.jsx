import React, { useEffect, useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function AuthWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  const publicPages = ['Landing', 'SetupProfile'];
  const currentPage = location.pathname.split('/').pop() || 'Landing';
  const isPublicPage = publicPages.some(p => currentPage.includes(p));
  
  useEffect(() => {
    checkAuthAndProfile();
  }, [location.pathname]);
  
  const checkAuthAndProfile = async () => {
    try {
      // Check if user is authenticated
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth) {
        // Not authenticated - redirect to landing if trying to access protected page
        if (!isPublicPage) {
          navigate(createPageUrl('Landing'));
        }
        setChecking(false);
        return;
      }
      
      // Get user data
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Check if profile exists
      const profiles = await base44.entities.UserProfile.filter({ 
        wallet_address: userData.email 
      });
      
      if (profiles && profiles.length > 0) {
        setProfile(profiles[0]);
        setChecking(false);
      } else {
        // No profile - redirect to setup
        if (currentPage !== 'SetupProfile') {
          navigate(createPageUrl('SetupProfile'));
        }
        setChecking(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // If not on public page, redirect to landing
      if (!isPublicPage) {
        navigate(createPageUrl('Landing'));
      }
      setChecking(false);
    }
  };
  
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return children;
}