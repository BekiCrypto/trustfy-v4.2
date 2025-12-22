import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  HelpCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { toast } from "sonner";

/**
 * ErrorRecovery - Provides recovery options and troubleshooting
 * for common trade flow errors
 */
export default function ErrorRecovery({ error, trade, onRetry, onRefresh }) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Categorize error types
  const errorType = (() => {
    const msg = error?.message?.toLowerCase() || '';
    
    if (!isOnline || msg.includes('network') || msg.includes('connection')) {
      return 'network';
    }
    if (msg.includes('wallet') || msg.includes('sign') || msg.includes('rejected')) {
      return 'wallet';
    }
    if (msg.includes('balance') || msg.includes('insufficient')) {
      return 'balance';
    }
    if (msg.includes('gas') || msg.includes('fee')) {
      return 'gas';
    }
    if (msg.includes('chain') || msg.includes('network')) {
      return 'chain';
    }
    if (msg.includes('timeout') || msg.includes('pending')) {
      return 'timeout';
    }
    return 'unknown';
  })();

  const errorGuides = {
    network: {
      icon: WifiOff,
      title: 'Connection Error',
      description: 'Unable to connect to the network',
      solutions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Switch to a different network',
        'Disable VPN if active'
      ]
    },
    wallet: {
      icon: AlertTriangle,
      title: 'Wallet Transaction Failed',
      description: 'Transaction was rejected or cancelled',
      solutions: [
        'Make sure you approved the transaction in your wallet',
        'Check if you have enough tokens for gas fees',
        'Try reconnecting your wallet',
        'Clear your wallet cache and retry'
      ]
    },
    balance: {
      icon: AlertTriangle,
      title: 'Insufficient Balance',
      description: 'Not enough tokens in your wallet',
      solutions: [
        `Add more ${trade?.token_symbol || 'tokens'} to your wallet`,
        'Check if tokens are on the correct network',
        'Ensure you have enough for amount + fees + bond',
        'View required amounts in the bond breakdown section'
      ]
    },
    gas: {
      icon: AlertTriangle,
      title: 'Gas Fee Error',
      description: 'Insufficient gas or gas estimation failed',
      solutions: [
        'Make sure you have enough BNB for gas fees',
        'Try increasing gas limit manually in wallet',
        'Wait for network congestion to clear',
        'Check current BSC network status'
      ]
    },
    chain: {
      icon: AlertTriangle,
      title: 'Wrong Network',
      description: 'Connected to incorrect blockchain',
      solutions: [
        'Switch to BNB Smart Chain in your wallet',
        'Check the network badge shows BSC',
        'Disconnect and reconnect wallet',
        'Ensure your wallet supports BSC'
      ]
    },
    timeout: {
      icon: AlertTriangle,
      title: 'Transaction Timeout',
      description: 'Transaction took too long to confirm',
      solutions: [
        'Check if transaction is still pending in wallet',
        'Wait for confirmation before retrying',
        'Increase gas price for faster confirmation',
        'Check BSCScan for transaction status'
      ]
    },
    unknown: {
      icon: HelpCircle,
      title: 'Something Went Wrong',
      description: error?.message || 'Unknown error occurred',
      solutions: [
        'Try the action again',
        'Refresh the page',
        'Check your wallet connection',
        'Contact support if issue persists'
      ]
    }
  };

  const guide = errorGuides[errorType];
  const Icon = guide.icon;

  return (
    <Card className="bg-red-500/10 border-red-500/30 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-red-500/20 flex-shrink-0">
          <Icon className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400">{guide.title}</h3>
          <p className="text-slate-300 text-sm mt-1">{guide.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-white mb-2">Try these solutions:</p>
        <ol className="space-y-1.5 text-sm text-slate-300">
          {guide.solutions.map((solution, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-blue-400 flex-shrink-0">{idx + 1}.</span>
              <span>{solution}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
        {trade?.tx_hash && (
          <Button
            onClick={() => window.open(`https://bscscan.com/tx/${trade.tx_hash}`, '_blank')}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            size="sm"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Network Status */}
      {!isOnline && (
        <Alert className="mt-3 bg-amber-500/10 border-amber-500/30">
          <WifiOff className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-300 text-xs">
            You appear to be offline. Check your internet connection.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}