import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AuthenticationModal from './AuthenticationModal';
import { useAuth } from './useAuth';
import { getContractAddress, getRpcUrl, TARGET_CHAIN_ID } from '@/lib/config';

export function useWalletGuard() {
  const { isConnected, isAuthenticated, chain } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState('unknown');
  const [isCheckingDeployment, setIsCheckingDeployment] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkDeployment = async () => {
      if (!isConnected || !chain?.id) {
        setDeploymentStatus('unknown');
        return;
      }
      if (chain.id !== TARGET_CHAIN_ID) {
        setDeploymentStatus('unknown');
        return;
      }
      const rpcUrl = getRpcUrl(chain.id);
      const escrowAddress = getContractAddress(chain.id);
      if (!rpcUrl || !escrowAddress) {
        setDeploymentStatus('not_deployed');
        return;
      }
      setIsCheckingDeployment(true);
      try {
        const { JsonRpcProvider } = await import('ethers');
        const provider = new JsonRpcProvider(rpcUrl);
        const code = await provider.getCode(escrowAddress);
        if (cancelled) return;
        setDeploymentStatus(code && code !== '0x' ? 'deployed' : 'not_deployed');
      } catch {
        if (!cancelled) setDeploymentStatus('not_deployed');
      } finally {
        if (!cancelled) setIsCheckingDeployment(false);
      }
    };
    checkDeployment();
    return () => {
      cancelled = true;
    };
  }, [isConnected, chain?.id]);

  const ensureWallet = useCallback(
    (onSuccess) => {
      if (!isConnected || !isAuthenticated) {
        setShowAuthModal(true);
        return false;
      }
      if (chain?.id && chain.id !== TARGET_CHAIN_ID) {
        toast.error(`Wrong network. Please switch to chain ${TARGET_CHAIN_ID}.`);
        return false;
      }
      if (isCheckingDeployment) {
        toast.error('Validating contract deployment. Please retry in a moment.');
        return false;
      }
      if (deploymentStatus === 'not_deployed') {
        toast.error('Escrow contract not deployed for this network.');
        return false;
      }
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      return true;
    },
    [isConnected, isAuthenticated, chain?.id, deploymentStatus, isCheckingDeployment]
  );

  const authModal = (
    <AuthenticationModal open={showAuthModal} onOpenChange={setShowAuthModal} />
  );

  return {
    ensureWallet,
    authModal,
    isConnected,
    isAuthenticated,
    openAuthModal: () => setShowAuthModal(true),
    deploymentStatus,
  };
}
