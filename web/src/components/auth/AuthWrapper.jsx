import React, { useEffect, useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { postReferralAttribution } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  const publicPages = ['Landing'];
  const currentPage = location.pathname.split('/').pop() || 'Landing';
  const isPublicPage = publicPages.some(p => currentPage.includes(p));
  
  useEffect(() => {
    // Capture referral code from URL immediately on mount
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('pending_ref_code', refCode);
    }
    
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
      
      // Handle referral attribution
      try {
        // Check for pending ref code in localStorage (persisted from landing)
        const pendingRefCode = localStorage.getItem('pending_ref_code');
        
        if (pendingRefCode && userData?.email) {
          const key = `ref_attributed_${pendingRefCode}_${userData.email}`.toLowerCase();
          
          // Only attribute if not done before for this specific combo
          if (!localStorage.getItem(key)) {
            await postReferralAttribution(pendingRefCode, userData.email);
            localStorage.setItem(key, "1");
            // Optional: Clear pending code after success, or keep it if we want to support multi-wallet attribution? 
            // Better to keep it for this session in case they switch wallets, but for now let's clear to be clean
            localStorage.removeItem('pending_ref_code');
          }
        }
      } catch (e) {
        // swallow attribution errors to avoid blocking auth flow
        console.warn('Referral attribution failed', e);
      }
      
      // We rely on wallet address as identity, no separate profile setup needed
      setChecking(false);
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
