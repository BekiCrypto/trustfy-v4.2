import React from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletAddress({ address, truncate = true, showCopy = true }) {
  const [copied, setCopied] = React.useState(false);
  
  const displayAddress = truncate && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-slate-300">{displayAddress}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          {copied ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
}