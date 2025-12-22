import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from 'qrcode.react';
import * as OTPAuth from 'otpauth';
import { Shield, Copy, Loader2, CheckCircle, Smartphone, Key, ArrowRight, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function TwoFactorSetup({ open, onOpenChange, userProfile }) {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (open && !secret) {
      generateSecret();
    }
  }, [open]);

  const generateSecret = () => {
    const secret = new OTPAuth.Secret();
    
    const totp = new OTPAuth.TOTP({
      issuer: 'TRUSTFY',
      label: userProfile?.display_name || userProfile?.wallet_address || 'User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    });

    const secretBase32 = totp.secret.base32;
    const otpauthUrl = totp.toString();

    setSecret(secretBase32);
    setQrCode(otpauthUrl);
  };

  const enable2FA = useMutation({
    mutationFn: async ({ code }) => {
      // Verify the code first (in production, this would be done on backend)
      const totp = new OTPAuth.TOTP({
        issuer: 'TRUSTFY',
        label: userProfile?.display_name || userProfile?.wallet_address,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });

      const isValid = totp.validate({ token: code, window: 1 }) !== null;
      
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Store 2FA secret in user profile
      return base44.entities.UserProfile.update(userProfile.id, {
        two_factor_enabled: true,
        two_factor_secret: secret // In production, this should be encrypted on backend
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-profile'] });
      toast.success('2FA enabled successfully!');
      setStep(3);
      setTimeout(() => {
        onOpenChange(false);
        setStep(1);
        setSecret('');
        setQrCode('');
        setVerificationCode('');
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || 'Invalid verification code');
    }
  });

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret key copied!');
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    enable2FA.mutate({ code: verificationCode });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/50 text-white max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-slate-700/50 px-6 py-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Two-Factor Authentication
              </DialogTitle>
            </div>
            <p className="text-slate-300 text-sm">Add an extra layer of security to your account</p>
          </DialogHeader>
        </div>

        <div className="px-6 py-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                1
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>
                Scan QR
              </span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-white' : 'text-slate-500'}`}>
                Verify
              </span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 ${step >= 3 ? 'bg-emerald-600' : 'bg-slate-700'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                ✓
              </div>
              <span className={`text-sm font-medium ${step >= 3 ? 'text-white' : 'text-slate-500'}`}>
                Done
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">Step 1: Install Authenticator App</p>
                      <p className="text-xs text-slate-400">
                        Download Google Authenticator, Authy, Microsoft Authenticator, or any TOTP app
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs text-slate-400 font-medium">
                    Scan with your app
                  </div>
                  <div className="flex justify-center p-8 bg-white rounded-2xl shadow-2xl border-4 border-slate-800">
                    {qrCode && <QRCodeSVG value={qrCode} size={220} level="H" />}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs text-slate-400 font-medium">
                    Or use manual entry
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <Label className="text-slate-400 text-xs mb-2 flex items-center gap-2">
                      <Key className="w-3 h-3" />
                      Secret Key
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={secret}
                        readOnly
                        className="font-mono text-sm bg-slate-900 border-slate-600 text-slate-300"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copySecret}
                        className="border-slate-600 hover:bg-slate-800 hover:border-blue-500/50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg shadow-blue-500/20 group"
                >
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify}
                className="space-y-6"
              >
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-purple-300 font-medium mb-1">Step 2: Verify Setup</p>
                      <p className="text-xs text-slate-400">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300 text-sm">Verification Code</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="bg-slate-800/50 border-slate-600 text-center text-3xl tracking-[0.5em] font-mono h-16 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      placeholder="● ● ● ● ● ●"
                      autoFocus
                    />
                    {verificationCode.length === 6 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Code refreshes every 30 seconds in your app
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-slate-600 hover:bg-slate-800 h-11"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={enable2FA.isPending || verificationCode.length !== 6}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 h-11 font-semibold shadow-lg shadow-emerald-500/20"
                  >
                    {enable2FA.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Enable
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="relative inline-block mb-6"
                >
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
                  <div className="relative p-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-3">
                    2FA Successfully Enabled!
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Your account is now secured with two-factor authentication
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Extra Security Active</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}