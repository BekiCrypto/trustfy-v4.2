# 🔐 Trustfy Decentralized Authentication Model

## Overview

Trustfy implements a **fully decentralized authentication system** that relies solely on Web3 wallet signatures. Your wallet address is your identity.

---

## 🎯 Architecture

### **Login & Identity - Wallet Only**
Users access the platform using:
- 🟣 **Web3 Wallet** (WalletConnect v2 + Web3Modal + Wagmi/Viem)

### **Execution - Wallet Required**
All actions are signed by your wallet:
- Bond locking
- Escrow funding
- Payment release
- Dispute filing
- All smart contract interactions

---

## 🔄 How It Works

1. **Connect Wallet** → Authentication + transaction identity in one step
2. **Sign Message** → Prove wallet ownership (free, no gas)
3. **Full Access** → Ready to trade immediately

---

## ✨ User Benefits

### **Web3 Login (Wallet) Advantages:**
- ✅ Maximum privacy (no email required)
- ✅ One-step authentication
- ✅ Immediate transaction readiness
- ✅ Self-sovereign identity
- ✅ No password management
- ✅ Crypto-native experience

---

## 🔒 Security Model

### **Login Security:**
- Wallet: Message signature verification
- Sessions: Secure JWT tokens derived from wallet signature

### **Transaction Security:**
- All blockchain actions require wallet signature
- Network guard (BSC Testnet enforcement)
- Contract verification before execution
- User confirms all transactions in wallet

### **Privacy Levels:**

| Feature | Wallet-Only |
|---------|-------------|
| **Login Method** | Wallet signature |
| **Email Stored** | ❌ No |
| **KYC Required** | ❌ Never |
| **Transaction Privacy** | ✅ Fully private |
| **Account Recovery** | Wallet seed phrase |

---

## 🛠 Technical Implementation

### **Tech Stack:**
- **Wallet Connection:** WalletConnect v2
- **Wallet UI:** Web3Modal
- **Wallet Hooks:** Wagmi (React hooks for Ethereum)
- **Wallet Client:** Viem (TypeScript interface)
- **Network:** BSC Testnet
- **Session Management:** Base44 auth system + JWT

### **Authentication Storage:**
```javascript
{
  user_id: "uuid",
  wallet_address: "0x..." (required for transactions),
  created_at: "timestamp"
}
```

---

## 🔐 Key Principles

1. **Decentralization First** - Wallet always signs transactions
2. **Privacy Preservation** - No email, no KYC
3. **User Sovereignty** - Platform never controls keys

---

**Last Updated**: December 2025  
**Applies To**: All platform authentication, documentation, and user flows  
**Status**: Live
