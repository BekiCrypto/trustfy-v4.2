# 🚀 Trustfy Web3 Authentication - Complete Setup Guide

This guide walks you through setting up production-grade Web3 authentication for Trustfy.

---

## 📋 Prerequisites

- Base44 account with admin access
- 5 minutes setup time
- No blockchain experience needed

---

## Step 1: Get WalletConnect Project ID (Free)

### 1.1 Create WalletConnect Account

1. Go to https://cloud.walletconnect.com/
2. Click "Sign Up" (free forever)
3. Sign up with your email
4. Verify your email

### 1.2 Create a New Project

1. In the WalletConnect dashboard, click "Create Project"
2. Fill in the details:
   - **Project Name**: `Trustfy`
   - **Project Description**: `Decentralized P2P Trading Platform`
   - **Project Homepage**: `https://trustfy.app` (or your domain)
3. Click "Create"
4. **Copy your Project ID** (looks like: `a1b2c3d4e5f6g7h8i9j0`)

### 1.3 Add Project ID to Trustfy

1. Go to your Base44 Dashboard
2. Navigate to **Settings → Environment Variables**
3. Add new secret:
   - **Name**: `WALLETCONNECT_PROJECT_ID`
   - **Value**: Paste your Project ID
4. Click "Save"

✅ **Done!** The platform will now use your WalletConnect Project ID.

---

## Step 2: Verify Setup

1. Open your Trustfy app
2. You should see a "Connect Wallet" button in the header
3. Click it - a professional wallet selection modal should appear
4. Try connecting with:
   - MetaMask (browser extension)
   - WalletConnect (mobile wallets via QR)
   - Coinbase Wallet
   - Trust Wallet

---

## Step 3: Test Authentication Flow

### 3.1 Connect Wallet

1. Click "Connect Wallet"
2. Select your wallet
3. Approve the connection

### 3.2 Sign Authentication Message

1. After connecting, click "Sign to Authenticate"
2. Your wallet will prompt you to sign a message
3. This proves you own the wallet (no transaction, no gas fees)
4. Click "Sign" in your wallet

✅ You're now authenticated!

---

## 🔒 Security Features

### What We Do

✅ **Signature-based auth** - No passwords, just wallet signatures
✅ **Nonce verification** - Each login generates a unique nonce
✅ **Session management** - Secure session tokens
✅ **Auto-logout** - Logs out when wallet disconnects
✅ **Network validation** - Enforces BSC Testnet
✅ **No private keys** - Everything stays in your wallet

### What We DON'T Do

❌ Never ask for seed phrases
❌ Never access private keys
❌ Never auto-sign transactions
❌ Never store wallet credentials

---

## 🌐 Supported Wallets

### Desktop (Browser Extensions)
- ✅ MetaMask
- ✅ Coinbase Wallet
- ✅ Brave Wallet
- ✅ Rainbow Wallet
- ✅ Frame

### Mobile (WalletConnect)
- ✅ Trust Wallet
- ✅ MetaMask Mobile
- ✅ Coinbase Wallet Mobile
- ✅ Rainbow Mobile
- ✅ imToken
- ✅ TokenPocket
- ✅ SafePal
- ✅ OKX Wallet
- ✅ Binance Wallet
- ✅ 200+ other wallets

---

## 🔧 Network Configuration

### Current Setup

**Development**: BSC Testnet (Chain ID 97)
- RPC: `https://data-seed-prebsc-1-s1.binance.org:8545`
- Explorer: `https://testnet.bscscan.com`

**Production**: BSC Mainnet (Chain ID 56)
- RPC: `https://bsc-dataseed1.binance.org`
- Explorer: `https://bscscan.com`

### Switching Networks

Users on the wrong network will see:
1. Warning banner at the top
2. "Switch to BSC Testnet" button
3. Blocked UI until they switch

The platform automatically requests network switching through Wagmi.

---

## 🎨 Customization

### Branding

Edit `components/web3/wagmiConfig.js`:

```javascript
const metadata = {
  name: 'Trustfy',
  description: 'Your description here',
  url: 'https://yoursite.com',
  icons: ['https://yoursite.com/logo.png']
};
```

### Theme Colors

```javascript
themeVariables: {
  '--w3m-accent': '#6366f1', // Primary color
  '--w3m-color-mix': '#1e293b', // Background mix
}
```

---

## 🐛 Troubleshooting

### "WalletConnect Project ID not set"

**Solution**: Add `WALLETCONNECT_PROJECT_ID` to environment variables

### "Wrong Network" warning

**Solution**: Click "Switch to BSC Testnet" button

### "Transaction Failed"

**Solution**: Check you have enough BNB for gas fees

### Wallet won't connect

**Solutions**:
1. Refresh the page
2. Disconnect wallet from settings
3. Try a different wallet
4. Check browser extensions aren't conflicting

---

## 📱 Mobile Setup

### For Users

1. Install a mobile wallet (Trust Wallet, MetaMask, etc.)
2. Open Trustfy in mobile browser
3. Click "Connect Wallet"
4. Select "WalletConnect"
5. Scan QR code with wallet app
6. Approve connection

### For In-App Browsers

Some wallets have built-in browsers (MetaMask, Trust Wallet):
1. Open wallet app
2. Navigate to browser section
3. Visit your Trustfy URL
4. Wallet auto-connects

---

## 🔐 Contract Integration

### Smart Contract Address

```
0x79DA3a1E93fDEB9C99A840009ec184132e74Ad79
```

View on BscScan:
https://testnet.bscscan.com/address/0x79DA3a1E93fDEB9C99A840009ec184132e74Ad79

### Available Functions

All escrow functions are integrated:
- ✅ createEscrow
- ✅ fundEscrow
- ✅ confirmPayment
- ✅ releaseFunds
- ✅ initiateDispute
- ✅ resolveDispute
- ✅ refundIfUnconfirmed
- ✅ withdrawBondCredit

---

## 📊 Testing Checklist

### Development Testing

- [ ] Connect with MetaMask
- [ ] Connect with mobile wallet via WalletConnect
- [ ] Sign authentication message
- [ ] Switch networks when prompted
- [ ] Disconnect and reconnect
- [ ] Check bond credits display
- [ ] View wallet on explorer
- [ ] Copy wallet address

### Production Testing

- [ ] Test on real devices
- [ ] Test on slow networks
- [ ] Test error scenarios
- [ ] Monitor authentication success rate
- [ ] Check session persistence
- [ ] Verify signature validation

---

## 🚀 Going to Production

### Pre-Launch Checklist

1. **Set Production Network**
   - Edit `wagmiConfig.js`
   - Change `TARGET_CHAIN_ID` to `56` (BSC Mainnet)

2. **Update RPC Endpoints**
   - Use premium RPC for better reliability
   - Consider: Ankr, QuickNode, or GetBlock

3. **Enable HTTPS**
   - Required for Web3 wallets
   - Get SSL certificate

4. **Monitor Metrics**
   - Authentication success rate
   - Network error rate
   - Transaction failure rate

5. **User Support**
   - Create wallet setup guides
   - Prepare FAQs
   - Set up support channel

---

## 💡 Best Practices

### For Developers

✅ Always show loading states during wallet operations
✅ Provide clear error messages
✅ Test with multiple wallets
✅ Handle network switches gracefully
✅ Never skip signature verification

### For Users

✅ Keep wallet software updated
✅ Never share seed phrases
✅ Verify contract addresses
✅ Use hardware wallets for large amounts
✅ Test with small amounts first

---

## 📚 Additional Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Web3Modal Documentation](https://docs.walletconnect.com/web3modal/about)
- [Viem Documentation](https://viem.sh/)
- [BSC Documentation](https://docs.bnbchain.org/)

---

## ✅ Quick Start Summary

1. Get WalletConnect Project ID → Add to environment variables
2. Test wallet connection → Should see Web3Modal
3. Sign authentication → Wallet prompts for signature
4. Use the platform → Fully authenticated!

**Total Time**: 5 minutes
**Difficulty**: Easy
**Cost**: Free

---

Need help? Check the main README.md or create an issue on GitHub.