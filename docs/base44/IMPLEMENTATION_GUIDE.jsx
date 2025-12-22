# 🛠 Hybrid Authentication Implementation Guide

## For Base44 Platform Integration

This guide details the technical implementation requirements for Trustfy's hybrid OAuth2 + Web3 authentication system.

---

## 📋 Implementation Requirements

### **1. Authentication Providers to Integrate**

#### **OAuth2 Providers:**
- ✅ Google OAuth2
- ✅ Facebook OAuth2
- ✅ Email & Password (internal)

#### **Web3 Provider:**
- ✅ WalletConnect v2
- ✅ Web3Modal (UI)
- ✅ Wagmi (React hooks)
- ✅ Viem (TypeScript client)

---

## 🎨 Landing Page Authentication Hub

### **Design Requirements:**

Create a unified login screen with clear visual separation:

```jsx
┌─────────────────────────────────┐
│     Sign in to Trustfy          │
│                                 │
│  [🔵 Continue with Google]      │
│  [🔵 Continue with Facebook]    │
│  [📧 Continue with Email]       │
│                                 │
│  ─────────── OR ───────────     │
│                                 │
│  [🟣 Connect Web3 Wallet]       │
│                                 │
│  New to Web3? No problem!       │
│  Start with email and connect   │
│  your wallet when you're ready. │
└─────────────────────────────────┘
```

### **Button Specifications:**
- OAuth2 buttons: 48px height, full width
- Consistent brand colors for each provider
- Web3 wallet button: Distinctive purple gradient
- Clear visual hierarchy
- Mobile-responsive design

---

## 🔐 Authentication Flows

### **Flow 1: OAuth2 Login**

```javascript
// User clicks "Continue with Google"
1. Initiate OAuth2 flow with Google
2. User authenticates with Google
3. Receive OAuth2 token + user info
4. Create/retrieve Base44 user account
5. Check if wallet is linked:
   ├─ Yes → Full access
   └─ No → Show wallet connection prompt
6. Store session (JWT)
7. Redirect to dashboard
```

### **Flow 2: Web3 Wallet Login**

```javascript
// User clicks "Connect Web3 Wallet"
1. Open Web3Modal (WalletConnect v2)
2. User selects wallet and connects
3. Request signature for authentication message
4. Verify signature on backend
5. Create/retrieve Base44 user account by wallet address
6. Store session (JWT)
7. Redirect to dashboard
```

### **Flow 3: OAuth2 User Connects Wallet**

```javascript
// OAuth2 user tries to create trade
1. Check if wallet is connected
2. If not, show modal:
   "To create trades, connect your Web3 wallet"
3. User clicks "Connect Wallet"
4. Open Web3Modal
5. Link wallet address to user account
6. Update session with wallet info
7. Proceed with trade creation
```

---

## 💾 Database Schema Updates

### **User Table Extensions:**

```javascript
{
  id: uuid,
  
  // Login methods
  login_method: "google" | "facebook" | "email" | "wallet",
  created_via: "oauth2" | "web3",
  
  // OAuth2 fields (nullable)
  google_id: string | null,
  facebook_id: string | null,
  email: string | null,
  password_hash: string | null,
  
  // Web3 fields
  wallet_address: string | null,  // Can be null initially for OAuth2 users
  wallet_connected_at: timestamp | null,
  
  // Account state
  email_verified: boolean,
  kyc_status: "none" | "pending" | "verified" | "rejected",
  
  // Session
  last_login_method: string,
  last_login_at: timestamp,
  
  // Metadata
  created_date: timestamp,
  updated_date: timestamp
}
```

### **Authentication Sessions:**

```javascript
{
  session_id: uuid,
  user_id: uuid,
  login_method: string,
  wallet_address: string | null,
  jwt_token: string,
  expires_at: timestamp,
  created_at: timestamp
}
```

---

## 🔌 Backend API Endpoints

### **1. OAuth2 Endpoints:**

```typescript
POST /auth/google/initiate
POST /auth/google/callback
POST /auth/facebook/initiate
POST /auth/facebook/callback
POST /auth/email/register
POST /auth/email/login
```

### **2. Web3 Endpoints:**

```typescript
POST /auth/wallet/nonce          // Get nonce for signing
POST /auth/wallet/verify         // Verify signature
POST /auth/wallet/link           // Link wallet to OAuth2 account
POST /auth/wallet/unlink         // Unlink wallet
```

### **3. Session Management:**

```typescript
GET  /auth/me                    // Current user info
POST /auth/logout                // Logout
POST /auth/refresh               // Refresh JWT token
```

---

## 🎣 Frontend React Hooks

### **useAuth Hook:**

```typescript
const {
  user,
  isAuthenticated,
  loginMethod,
  hasWallet,
  walletAddress,
  
  // OAuth2 methods
  loginWithGoogle,
  loginWithFacebook,
  loginWithEmail,
  
  // Web3 methods
  connectWallet,
  disconnectWallet,
  signMessage,
  
  // Session
  logout,
  refreshSession
} = useAuth();
```

### **useWalletRequired Hook:**

```typescript
const { 
  promptWalletConnection,
  isWalletConnected,
  canPerformAction 
} = useWalletRequired();

// Usage in trade creation:
const handleCreateTrade = async () => {
  if (!canPerformAction) {
    await promptWalletConnection();
    return;
  }
  // Proceed with trade
};
```

---

## 🎨 UI Components to Create

### **1. Unified Login Screen**
- File: `pages/Login.jsx`
- All authentication options in one place
- Responsive design
- Loading states
- Error handling

### **2. Wallet Connection Modal**
- File: `components/auth/WalletConnectionModal.jsx`
- Shown to OAuth2 users before first transaction
- Clear explanation of why wallet is needed
- Integration with Web3Modal
- Beginner-friendly tutorial link

### **3. Account Settings - Login Methods**
- File: `components/settings/LoginMethods.jsx`
- Display current login methods
- Add/remove OAuth2 providers
- Add/remove wallet addresses
- Primary method selection

### **4. Onboarding Flow**
- File: `components/onboarding/OnboardingWizard.jsx`
- Different paths for OAuth2 vs Web3 users
- Wallet connection guide for OAuth2 users
- Optional Prime feature discovery

---

## 🔒 Security Requirements

### **OAuth2 Security:**
- PKCE flow for all OAuth2 providers
- Secure token storage (httpOnly cookies)
- CSRF protection
- State parameter validation

### **Web3 Security:**
- Message signature verification on backend
- Nonce-based replay attack prevention
- Network verification (BSC Testnet)
- Session binding to wallet address

### **General Security:**
- JWT token rotation
- Rate limiting on auth endpoints
- IP-based suspicious activity detection
- Audit logs for all login attempts

---

## 🎯 Wallet Connection Prompt Logic

### **When to Prompt Wallet Connection:**

```typescript
const walletRequiredActions = [
  'create_trade',
  'accept_offer',
  'lock_bond',
  'fund_escrow',
  'release_payment',
  'file_dispute',
  'withdraw_bond_credits'
];

function requiresWallet(action: string): boolean {
  return walletRequiredActions.includes(action);
}
```

### **Prompt UI:**

```jsx
<WalletRequiredModal>
  <h2>Connect Your Web3 Wallet</h2>
  <p>
    To create trades and interact with smart contracts, 
    you need to connect a Web3 wallet.
  </p>
  
  <Button onClick={connectWallet}>
    Connect Wallet
  </Button>
  
  <Link to="/wallet-guide">
    Don't have a wallet? Learn more →
  </Link>
</WalletRequiredModal>
```

---

## 📱 Mobile Considerations

### **Deep Linking:**
- WalletConnect mobile deep links
- Return to app after wallet authentication
- Handle interrupted flows gracefully

### **Responsive Design:**
- Mobile-optimized login buttons
- Touch-friendly wallet connection
- Bottom sheet modals on mobile
- Native app feel

---

## 🧪 Testing Requirements

### **Test Scenarios:**

1. **OAuth2 → Wallet Connection:**
   - Login with Google
   - Try to create trade
   - Connect wallet
   - Complete trade
   - Logout and login again (should remember wallet)

2. **Direct Web3 Login:**
   - Connect wallet directly
   - Create trade immediately
   - Verify no email prompt

3. **Multiple Login Methods:**
   - Login with Google
   - Connect wallet
   - Logout
   - Login with wallet directly
   - Should access same account

4. **Edge Cases:**
   - Wallet disconnect during transaction
   - Session expiry
   - Network switching
   - Multiple wallets
   - OAuth2 token refresh

---

## 📊 Analytics to Track

### **Authentication Metrics:**
```javascript
{
  "new_users_by_method": {
    "google": 120,
    "facebook": 45,
    "email": 67,
    "wallet": 89
  },
  "wallet_connection_rate": "78%",  // OAuth2 users who connected wallet
  "wallet_connection_time": "3.2 min",  // Average time to connect
  "login_method_preference": {
    "oauth2_primary": "62%",
    "wallet_primary": "38%"
  },
  "conversion_to_prime": {
    "oauth2_users": "12%",
    "wallet_only_users": "7%"
  }
}
```

---

## 🚀 Deployment Checklist

### **Pre-Launch:**
- [ ] OAuth2 apps created and configured
- [ ] WalletConnect project ID obtained
- [ ] Database migrations completed
- [ ] All auth endpoints tested
- [ ] Security audit completed
- [ ] Error handling verified
- [ ] Rollback plan prepared

### **Launch:**
- [ ] Feature flag enabled
- [ ] Monitoring dashboards active
- [ ] Support team briefed
- [ ] Documentation published
- [ ] User announcements sent

### **Post-Launch:**
- [ ] Monitor authentication metrics
- [ ] Watch error rates
- [ ] Collect user feedback
- [ ] Iterate on onboarding flow
- [ ] Optimize conversion rates

---

## 🎓 User Documentation Needed

1. **"How to Login to Trustfy"** - All methods explained
2. **"Connecting Your Web3 Wallet"** - Step-by-step guide
3. **"Creating Your First Wallet"** - For complete beginners
4. **"Account Recovery Options"** - OAuth2 vs wallet seed phrase
5. **"Managing Multiple Login Methods"** - Settings guide
6. **"Security Best Practices"** - For hybrid auth users

---

## 🔄 Migration Strategy

### **Existing Wallet-Only Users:**

```javascript
// On first login after update:
1. Detect user has no OAuth2 login method
2. Show banner: "New! Add email login for account recovery"
3. Optional action: Link email/social account
4. Skip button available (no forced migration)
```

### **Database Migration:**

```sql
-- Add new columns to User table
ALTER TABLE users ADD COLUMN login_method VARCHAR(50);
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255);
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Update existing users
UPDATE users SET login_method = 'wallet' WHERE wallet_address IS NOT NULL;
```

---

## 📞 Support Scenarios

### **Common User Questions:**

**Q: "I logged in with Google but can't create trades?"**
A: Guide them to connect wallet in settings.

**Q: "I lost access to my email, can I still login?"**
A: Yes, if wallet is connected, login via wallet.

**Q: "Do I need to give my email?"**
A: No, wallet-only login is fully supported.

**Q: "Why do I need a wallet if I have email login?"**
A: Email is for platform access, wallet signs blockchain transactions.

---

## ✅ Success Criteria

### **Technical:**
- 99.9% authentication uptime
- <500ms authentication latency
- Zero security incidents
- All auth methods work on mobile

### **User Experience:**
- >80% successful first-time login rate
- <5% login abandonment
- >70% wallet connection rate for OAuth2 users
- <30s average wallet connection time

### **Business:**
- 3x increase in new user signups
- 50% reduction in support tickets (account recovery)
- 15% increase in Prime conversions
- Maintain wallet-only user satisfaction

---

## 🎯 Next Steps

1. **Week 1:** OAuth2 provider setup + database schema
2. **Week 2:** Backend API endpoints + JWT system
3. **Week 3:** Frontend login screen + Web3Modal integration
4. **Week 4:** Wallet connection prompts + onboarding flows
5. **Week 5:** Testing + security audit
6. **Week 6:** Staged rollout + monitoring

---

**Implementation Owner:** Base44 Platform Team  
**Technical Lead:** TBD  
**Target Launch:** Q1 2025  
**Status:** Specification Complete, Ready for Implementation