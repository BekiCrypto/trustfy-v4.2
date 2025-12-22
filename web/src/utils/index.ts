


const ROUTE_MAP: Record<string, string> = {
    Home: '/',
    Landing: '/',
    Dashboard: '/dashboard',
    Explore: '/explore',
    Marketplace: '/explore',
    Escrows: '/escrows',
    Orders: '/escrows',
    Trades: '/escrows',
    CreateEscrow: '/marketplace?create=1',
    MyAds: '/my-ads',
    TradeDetails: '/escrows',
    Disputes: '/disputes',
    DisputeDetails: '/disputes',
    Arbitration: '/arbitration',
    ArbitratorDashboard: '/arbitration',
    Admin: '/admin',
    AdminPools: '/admin/pools',
    AdminRoles: '/admin/roles',
    AdminTokens: '/admin/tokens',
    Safety: '/safety',
    Docs: '/docs',
    Settings: '/settings',
    Profile: '/profile',
    BondCredits: '/bond-credits',
    TradingAPI: '/trading-api',
    Tiers: '/tiers',
    RolesGuide: '/roles-guide',
    DeploymentGuide: '/deployment-guide',
    ProductionChecklist: '/production-checklist',
    BackendServices: '/backend-services',
    TestingSuite: '/testing-suite',
    MigrationRunner: '/migration-runner',
    InsuranceMarketplace: '/insurance-marketplace',
    InsurerDashboard: '/insurer-dashboard',
    Analytics: '/analytics',
    Appeal: '/appeal'
};

export function createPageUrl(pageName: string) {
    if (!pageName) return '/';
    if (pageName.startsWith('/')) return pageName;

    const [rawName, query] = pageName.split('?');
    const mapped = ROUTE_MAP[rawName] || '/' + rawName.toLowerCase().replace(/ /g, '-');

    if (query && (rawName === 'TradeDetails' || rawName === 'DisputeDetails')) {
        const params = new URLSearchParams(query);
        const id = params.get('id');
        if (id) {
            if (rawName === 'TradeDetails') return `/escrows/${id}`;
            if (rawName === 'DisputeDetails') return `/arbitration/${id}`;
        }
    }

    return query ? `${mapped}?${query}` : mapped;
}
