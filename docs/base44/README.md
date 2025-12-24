# Trustfy Web3 Authentication System

Complete WalletConnect v2 + Web3Modal + Wagmi/Viem implementation for production-grade Web3 authentication.

## 🚀 Features

- **WalletConnect v2** - Universal wallet connection protocol
- **Web3Modal** - Professional, branded wallet selection modal
- **Wagmi + Viem** - Modern Web3 React hooks and utilities
- **Signature-based Auth** - Secure authentication with wallet signatures
- **Multi-wallet Support** - MetaMask, Trust Wallet, Coinbase, WalletConnect, and more
- **Network Guard** - Automatic network detection and switching
- **Session Management** - Reactive authentication state
- **Contract Interactions** - Type-safe smart contract calls
- **Error Handling** - User-friendly error messages

## 📦 Installation

Dependencies are already installed:
- `wagmi@^2.5.0`
- `viem@^2.7.0`
- `@web3modal/wagmi@^4.1.0`
- `@tanstack/react-query@^5.28.0`

## ⚙️ Configuration

### 1. Set WalletConnect Project ID

Get a free Project ID from https://cloud.walletconnect.com/

Add it to your secrets in the Base44 dashboard:
- Secret Name: `WALLETCONNECT_PROJECT_ID`
- Value: Your WalletConnect Project ID

Or set in `.env`:
```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Configure Networks

Edit `components/web3/wagmiConfig.js` to customize:
- Supported chains
- RPC endpoints
- Brand metadata
- Theme colors

Current setup:
- **Development**: BSC Testnet (Chain ID 97)
- **Production**: BSC Mainnet (Chain ID 56)

## 🔐 Authentication Flow

```
1. User clicks "Connect Wallet"
   ↓
2. Web3Modal opens with wallet options
   ↓
3. User selects wallet and approves connection
   ↓
4. App requests signature for authentication
   ↓
5. Backend verifies signature
   ↓
6. Session created, user is authenticated
```

### Implementation

```jsx
import { useAuth } from '@/components/web3/useAuth';

function MyComponent() {
  const { isAuthenticated, authenticate, address } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={authenticate}>Sign to Authenticate</button>;
  }

  return <div>Welcome {address}!</div>;
}
```

## 🔌 Contract Interactions

### Reading Contract Data

```jsx
import { useEscrowData, useBondCredits } from '@/components/web3/useContractInteraction';

function TradeDetails({ tradeId }) {
  const { escrowStatus, isLoading } = useEscrowData(tradeId);
  
  return (
    <div>
      Status: {escrowStatus?.status}
      Amount: {escrowStatus?.amount}
    </div>
  );
}
```

### Writing to Contract

```jsx
import { useEscrowContract } from '@/components/web3/useContractInteraction';

function FundEscrow({ tradeId }) {
  const { fundEscrow } = useEscrowContract();
  
  const handleFund = async () => {
    try {
      const hash = await fundEscrow(tradeId, true, '1.5');
      console.log('Transaction hash:', hash);
    } catch (error) {
      console.error('Failed to fund escrow:', error);
    }
  };
  
  return <button onClick={handleFund}>Fund Escrow</button>;
}
```

## 🛡️ Network Guard

Automatically ensures users are on the correct network:

```jsx
import NetworkGuardV2 from '@/components/web3/NetworkGuardV2';

function App() {
  return (
    <NetworkGuardV2>
      {/* Your app content */}
    </NetworkGuardV2>
  );
}
```

If user is on wrong network:
- Shows warning banner at top
- Blocks UI with overlay
- Provides easy "Switch Network" button

## 🎨 Wallet Button

Pre-built wallet connection button with dropdown:

```jsx
import WalletButtonV2 from '@/components/web3/WalletButtonV2';

<WalletButtonV2 size="default" variant="default" />
```

Features:
- Connect wallet
- Show wallet address
- Display current network
- Show bond credits
- Copy address
- View on block explorer
- Disconnect wallet

## 🔧 Available Hooks

### `useAuth()`
Authentication state and methods
- `isAuthenticated` - Boolean
- `authenticate()` - Trigger auth flow
- `logout()` - Disconnect and clear session
- `address` - Connected wallet address
- `isAuthenticating` - Loading state

### `useEscrowContract()`
Contract write operations
- `createEscrow()`
- `fundEscrow()`
- `confirmPayment()`
- `releaseFunds()`
- `refundIfUnconfirmed()`
- `initiateDispute()`
- `resolveDispute()`
- `withdrawBondCredit()`

### `useEscrowData(tradeId)`
Read escrow status
- `escrowStatus` - Full escrow data
- `isLoading` - Loading state
- `refetch()` - Refresh data

### `useBondCredits(userAddress, tokenAddress)`
Read bond credits
- `bondCredits` - Formatted balance
- `isLoading` - Loading state
- `refetch()` - Refresh data

### `useTokenOperations()`
ERC20 token operations
- `approveToken()` - Approve token spending

## 🔒 Security Best Practices

✅ **Never store private keys** - All signing happens in user's wallet
✅ **Signature verification** - Backend validates all signatures
✅ **Session management** - Automatic cleanup on disconnect
✅ **Network validation** - Enforces correct chain
✅ **User confirmations** - All transactions require wallet approval

❌ **Never** request seed phrases
❌ **Never** auto-sign transactions
❌ **Never** store sensitive wallet data

## 🐛 Error Handling

All contract interactions include user-friendly error messages:
- User rejection → "Transaction rejected by user"
- Insufficient gas → "Insufficient funds for gas"
- Contract revert → Detailed revert reason
- Network errors → Connection guidance

## 📱 Mobile Support

✅ Fully compatible with:
- MetaMask Mobile
- Trust Wallet
- Coinbase Wallet
- Rainbow Wallet
- All WalletConnect v2 wallets

✅ Features:
- QR code scanning
- Deep linking
- In-app browser support

## 🚀 Production Checklist

- [ ] Set WALLETCONNECT_PROJECT_ID in production environment
- [ ] Update `wagmiConfig.js` with production chain (BSC Mainnet)
- [ ] Test with multiple wallets
- [ ] Verify signature validation on backend
- [ ] Enable HTTPS (required for Web3)
- [ ] Test mobile wallet connections
- [ ] Monitor error rates
- [ ] Set up transaction monitoring

## 📚 Resources

- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)
- [Web3Modal Docs](https://docs.walletconnect.com/web3modal/about)
- [WalletConnect](https://walletconnect.com/)

## 🎯 Contract Address

**TrustfyEscrowV3 (BSC Testnet)**
```
0x79DA3a1E93fDEB9C99A840009ec184132e74Ad79
```

View on BscScan: https://testnet.bscscan.com/address/0x79DA3a1E93fDEB9C99A840009ec184132e74Ad79

---

**Need Help?** Check the component implementations in `components/web3/` for detailed examples.