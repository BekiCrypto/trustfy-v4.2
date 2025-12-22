// Role-based access control configuration
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ARBITRATOR: 'arbitrator',
  USER: 'user'
};

// Page access configuration
export const PAGE_ACCESS = {
  // Public pages - all authenticated users
  Dashboard: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  Marketplace: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  Orders: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  MyAds: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  BondCredits: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  Disputes: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  Tiers: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  Profile: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  Settings: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  TradeDetails: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  DisputeDetails: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  InsuranceMarketplace: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  InsurerDashboard: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  Appeal: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  Trades: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  SetupProfile: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],
  TradingAPI: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR, ROLES.USER],

  // Arbitrator-only pages
  ArbitratorDashboard: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR],

  // Admin-only pages (STRICT ACCESS)
  Admin: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  RolesGuide: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  Analytics: [ROLES.SUPER_ADMIN, ROLES.ADMIN], // Platform analytics
};

// Navigation items configuration by role
export const NAVIGATION_CONFIG = {
  // Common navigation for all roles
  common: [
    { name: 'Dashboard', translationKey: 'nav.dashboard', icon: 'LayoutDashboard', page: 'Dashboard', roles: [ROLES.USER, ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    { name: 'P2P', translationKey: 'nav.marketplace', icon: 'ShoppingBag', page: 'Marketplace', roles: [ROLES.USER, ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    { name: 'Orders', translationKey: 'nav.orders', icon: 'FileText', page: 'Orders', roles: [ROLES.USER, ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    { name: 'My Ads', translationKey: 'nav.myAds', icon: 'Megaphone', page: 'MyAds', roles: [ROLES.USER, ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    { name: 'Appeal', translationKey: 'nav.disputes', icon: 'AlertTriangle', page: 'Disputes', roles: [ROLES.USER, ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    { name: 'Smart Bond', translationKey: 'nav.smartBond', icon: 'Shield', page: 'BondCredits', roles: [ROLES.USER, ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    { name: 'Trading Bots', translationKey: 'nav.tradingBots', icon: 'Bot', page: 'TradingAPI', roles: [ROLES.USER, ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    { name: 'Settings', translationKey: 'nav.settings', icon: 'Settings', page: 'Settings', roles: [ROLES.USER, ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
  ],

  // Arbitrator navigation
  arbitrator: [
    { name: 'Arbitration', translationKey: 'nav.arbitration', icon: 'Scale', page: 'ArbitratorDashboard', roles: [ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN] }
  ],

  // Admin navigation
  admin: [
    { name: 'Admin Panel', translationKey: 'nav.admin', icon: 'Users', page: 'Admin', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }
  ]
};

// Check if user has access to a specific page
export const hasPageAccess = (userRole, pageName, userEmail) => {
  if (!userRole || !pageName) return false;

  // OWNER (bikilad@gmail.com) has access to EVERYTHING regardless of role
  if (userEmail === 'bikilad@gmail.com') return true;

  // Super admins have access to EVERYTHING
  if (userRole === ROLES.SUPER_ADMIN) return true;

  const allowedRoles = PAGE_ACCESS[pageName];
  if (!allowedRoles) return true; // If not configured, allow access (for backwards compatibility)

  return allowedRoles.includes(userRole);
};

// Check if user can perform admin actions
export const canManageUsers = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
};

// Check if user can arbitrate disputes
export const canArbitrate = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR].includes(userRole);
};

// Check if user can view platform analytics
export const canViewAnalytics = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole);
};

// Check if user can manage disputes
export const canManageDisputes = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR].includes(userRole);
};

// Check if user has elevated privileges
export const hasElevatedPrivileges = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ARBITRATOR].includes(userRole);
};

// Get navigation items for a specific role
export const getNavigationForRole = (userRole) => {
  if (!userRole) return NAVIGATION_CONFIG.common.filter(item => item.roles.includes(ROLES.USER));
  
  const navItems = [
    ...NAVIGATION_CONFIG.common.filter(item => item.roles.includes(userRole))
  ];
  
  // Add arbitrator items if role is arbitrator or higher
  if ([ROLES.ARBITRATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(userRole)) {
    navItems.push(...NAVIGATION_CONFIG.arbitrator.filter(item => item.roles.includes(userRole)));
  }
  
  // Add admin items if role is admin or super_admin
  if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(userRole)) {
    navItems.push(...NAVIGATION_CONFIG.admin.filter(item => item.roles.includes(userRole)));
  }
  
  return navItems;
};

// Role hierarchy check (for escalated permissions)
export const hasMinimumRole = (userRole, requiredRole) => {
  const hierarchy = {
    [ROLES.USER]: 0,
    [ROLES.ARBITRATOR]: 1,
    [ROLES.ADMIN]: 2,
    [ROLES.SUPER_ADMIN]: 3
  };
  
  return hierarchy[userRole] >= hierarchy[requiredRole];
};