// components/auth/SignatureAuth.jsx

import {useState, useEffect} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAccount, useSignMessage } from "wagmi";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function SignatureAuth({ open, onOpenChange, onSuccess }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [step, setStep] = useState("idle"); // idle, fetching, signing, verifying, success, error
  const [nonce, setNonce] = useState(null);
  const [challenge, setChallenge] = useState("");
  const [error, setError] = useState("");

  /* -----------------------------
        1. GET NONCE
  ------------------------------ */
  const requestNonce = async () => {
    if (!address) {
      setError("Wallet not connected");
      setStep("error");
      return;
    }

    try {
      setStep("fetching");
      setError("");

      const res = await fetch("/api/auth/generateNonce", {
        method: "POST",
        body: JSON.stringify({ address: address.toLowerCase() })
      });

      const out = await res.json();

      if (!out.nonce || !out.message) {
        throw new Error("Invalid nonce response");
      }

      setNonce(out.nonce);
      setChallenge(out.message);
      setStep("signing");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate authentication challenge");
      setStep("error");
    }
  };

  /* -----------------------------
        2. SIGN MESSAGE
  ------------------------------ */
  const handleSign = async () => {
    try {
      const signature = await signMessageAsync({ message: challenge });

      setStep("verifying");

      const verify = await fetch("/api/auth/verifySignature", {
        method: "POST",
        body: JSON.stringify({
          address: address.toLowerCase(),
          signature,
          nonce
        })
      });

      const out = await verify.json();

      if (!out.success) {
        throw new Error(out.error || "Signature verification failed");
      }

      /* -----------------------------
           3. CREATE BASE44 SESSION
      ------------------------------ */
      await base44.auth.login({
        email: address.toLowerCase(),
        password: signature
      });

      const user = await base44.auth.me();
      if (!user) {
        throw new Error("Failed to establish authenticated session");
      }

      setStep("success");
      toast.success("Authentication successful!");

      setTimeout(() => {
        onSuccess ? onSuccess() : (window.location.href = "/dashboard");
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStep("error");
    }
  };

  /* -----------------------------
       RUN ON OPEN
  ------------------------------ */
  useEffect(() => {
    if (open && isConnected && !nonce) {
      requestNonce();
    }
  }, [open, isConnected]);

  const retry = () => {
    setStep("idle");
    setNonce(null);
    setChallenge("");
    setError("");
    requestNonce();
  };

  /* -----------------------------
       UI
  ------------------------------ */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-blue-400" />
            Sign to Authenticate
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Verify your wallet by signing a message.
          </DialogDescription>
        </DialogHeader>

        {/* Wallet Address */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
          <p className="text-sm font-mono text-white break-all">{address}</p>
        </div>

        {/* Status */}
        {step === "fetching" && (
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            <AlertDescription className="text-blue-300 text-sm">
              Generating authentication challenge…
            </AlertDescription>
          </Alert>
        )}

        {step === "signing" && (
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 text-sm">
              Please sign the message in your wallet.
            </AlertDescription>
          </Alert>
        )}

        {step === "verifying" && (
          <Alert className="bg-purple-500/10 border-purple-500/30">
            <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
            <AlertDescription className="text-purple-300">
              Verifying signature…
            </AlertDescription>
          </Alert>
        )}

        {step === "success" && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <AlertDescription className="text-emerald-300">
              Authentication successful!
            </AlertDescription>
          </Alert>
        )}

        {step === "error" && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          {step === "signing" && (
            <Button
              onClick={handleSign}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Sign Message
            </Button>
          )}

          {step === "error" && (
            <Button
              onClick={retry}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          )}

          {(step === "fetching" || step === "verifying") && (
            <Button disabled className="w-full bg-slate-700">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing…
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
