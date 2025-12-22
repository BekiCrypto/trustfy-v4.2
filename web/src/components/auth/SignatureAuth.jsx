import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertTriangle, Shield } from "lucide-react";
import { useAccount } from "wagmi";
import { useAuthContext } from "@/context/AuthContext";

export default function SignatureAuth({ open, onOpenChange, onSuccess }) {
  const { address, isConnected } = useAccount();
  const { reauthenticate, isAuthenticating, error } = useAuthContext();
  const [step, setStep] = useState("idle");

  useEffect(() => {
    if (!open || !isConnected) return;
    const run = async () => {
      try {
        setStep("signing");
        await reauthenticate();
        setStep("success");
        setTimeout(() => {
          onSuccess ? onSuccess() : (window.location.href = "/dashboard");
        }, 500);
      } catch {
        setStep("error");
      }
    };
    void run();
  }, [open, isConnected, onSuccess, reauthenticate]);

  const retry = () => {
    setStep("idle");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-blue-400" />
            Sign to Authenticate
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Verify your wallet to enable Trustfy actions.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-500 mb-1">Wallet Address</p>
          <p className="text-sm font-mono text-white break-all">{address}</p>
        </div>

        {isAuthenticating && (
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            <AlertDescription className="text-blue-300 text-sm">
              Preparing signature request…
            </AlertDescription>
          </Alert>
        )}

        {step === "signing" && !isAuthenticating && (
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 text-sm">
              Please sign the Trustfy login message.
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
              {error || "Authentication failed. Try again."}
            </AlertDescription>
          </Alert>
        )}

        {step === "error" && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={retry}
              variant="destructive"
              className="flex-1"
            >
              Retry
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
