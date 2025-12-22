import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Trades from "./Trades";

import TradeDetails from "./TradeDetails";

import Disputes from "./Disputes";

import Profile from "./Profile";

import DisputeDetails from "./DisputeDetails";

import InsuranceMarketplace from "./InsuranceMarketplace";

import InsurerDashboard from "./InsurerDashboard";

import Analytics from "./Analytics";

import Marketplace from "./Marketplace";

import Settings from "./Settings";

import Orders from "./Orders";

import MyAds from "./MyAds";

import Appeal from "./Appeal";

import Admin from "./Admin";

import ArbitratorDashboard from "./ArbitratorDashboard";

import Tiers from "./Tiers";

import RolesGuide from "./RolesGuide";

import TradingAPI from "./TradingAPI";

import SetupProfile from "./SetupProfile";

import TestingSuite from "./TestingSuite";

import BackendServices from "./BackendServices";

import ProductionChecklist from "./ProductionChecklist";

import BondCredits from "./BondCredits";

import DeploymentGuide from "./DeploymentGuide";

import Home from "./Home";

import Safety from "./Safety";

import Docs from "./Docs";

import MigrationRunner from "./MigrationRunner";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    Dashboard: Dashboard,
    Trades: Trades,
    TradeDetails: TradeDetails,
    Disputes: Disputes,
    Profile: Profile,
    DisputeDetails: DisputeDetails,
    InsuranceMarketplace: InsuranceMarketplace,
    InsurerDashboard: InsurerDashboard,
    Analytics: Analytics,
    Marketplace: Marketplace,
    Settings: Settings,
    Orders: Orders,
    MyAds: MyAds,
    Appeal: Appeal,
    Admin: Admin,
    ArbitratorDashboard: ArbitratorDashboard,
    Tiers: Tiers,
    RolesGuide: RolesGuide,
    TradingAPI: TradingAPI,
    SetupProfile: SetupProfile,
    TestingSuite: TestingSuite,
    BackendServices: BackendServices,
    ProductionChecklist: ProductionChecklist,
    BondCredits: BondCredits,
    DeploymentGuide: DeploymentGuide,
    Home: Home,
    Safety: Safety,
    Docs: Docs,
    MigrationRunner: MigrationRunner,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    const segments = url.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "home";

    const map = {
        dashboard: "Dashboard",
        trades: "Trades",
        escrows: "Orders",
        explore: "Marketplace",
        arbitration: "ArbitratorDashboard",
        "trade-details": "TradeDetails",
        disputes: "Disputes",
        "dispute-details": "DisputeDetails",
        profile: "Profile",
        marketplace: "Marketplace",
        analytics: "Analytics",
        admin: "Admin",
        "arbitrator-dashboard": "ArbitratorDashboard",
        tiers: "Tiers",
        rolesguide: "RolesGuide",
        "roles-guide": "RolesGuide",
        "trading-api": "TradingAPI",
        tradingapi: "TradingAPI",
        setupprofile: "SetupProfile",
        "setup-profile": "SetupProfile",
        orders: "Orders",
        myads: "MyAds",
        "my-ads": "MyAds",
        appeal: "Appeal",
        insurancemarketplace: "InsuranceMarketplace",
        "insurance-marketplace": "InsuranceMarketplace",
        insurerdashboard: "InsurerDashboard",
        "insurer-dashboard": "InsurerDashboard",
        "backend-services": "BackendServices",
        productionchecklist: "ProductionChecklist",
        "production-checklist": "ProductionChecklist",
        bondcredits: "BondCredits",
        "bond-credits": "BondCredits",
        deploymentguide: "DeploymentGuide",
        "deployment-guide": "DeploymentGuide",
        testing: "TestingSuite",
        testingsuite: "TestingSuite",
        "testing-suite": "TestingSuite",
        safety: "Safety",
        docs: "Docs",
        migrationrunner: "MigrationRunner",
        "migration-runner": "MigrationRunner",
        home: "Home",
    };

    for (const segment of segments) {
        const key = segment.toLowerCase();
        if (map[key]) return map[key];
    }

    const pageName = Object.keys(PAGES).find(
        page => page.toLowerCase() === lastSegment.toLowerCase()
    );
    return pageName || "Home";
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/explore" element={<Marketplace />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/escrows" element={<Orders />} />
                <Route path="/escrows/create" element={<Trades />} />
                <Route path="/escrows/:escrowId" element={<TradeDetails />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/trade-details" element={<TradeDetails />} />
                <Route path="/disputes" element={<Disputes />} />
                <Route path="/dispute-details" element={<DisputeDetails />} />
                <Route path="/arbitration" element={<ArbitratorDashboard />} />
                <Route path="/arbitration/:escrowId" element={<DisputeDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/pools" element={<Admin />} />
                <Route path="/admin/roles" element={<Admin />} />
                <Route path="/admin/tokens" element={<Admin />} />
                <Route path="/arbitrator-dashboard" element={<ArbitratorDashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/my-ads" element={<MyAds />} />
                <Route path="/appeal" element={<Appeal />} />
                <Route path="/tiers" element={<Tiers />} />
                <Route path="/rolesguide" element={<RolesGuide />} />
                <Route path="/roles-guide" element={<RolesGuide />} />
                <Route path="/trading-api" element={<TradingAPI />} />
                <Route path="/tradingapi" element={<TradingAPI />} />
                <Route path="/setup-profile" element={<SetupProfile />} />
                <Route path="/setupprofile" element={<SetupProfile />} />
                <Route path="/testing-suite" element={<TestingSuite />} />
                <Route path="/testingsuite" element={<TestingSuite />} />
                <Route path="/backend-services" element={<BackendServices />} />
                <Route path="/production-checklist" element={<ProductionChecklist />} />
                <Route path="/productionchecklist" element={<ProductionChecklist />} />
                <Route path="/bond-credits" element={<BondCredits />} />
                <Route path="/bondcredits" element={<BondCredits />} />
                <Route path="/deployment-guide" element={<DeploymentGuide />} />
                <Route path="/deploymentguide" element={<DeploymentGuide />} />
                <Route path="/insurance-marketplace" element={<InsuranceMarketplace />} />
                <Route path="/insurancemarketplace" element={<InsuranceMarketplace />} />
                <Route path="/insurer-dashboard" element={<InsurerDashboard />} />
                <Route path="/insurerdashboard" element={<InsurerDashboard />} />
                <Route path="/safety" element={<Safety />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/migration-runner" element={<MigrationRunner />} />
                <Route path="/migrationrunner" element={<MigrationRunner />} />

                <Route path="/InsuranceMarketplace" element={<InsuranceMarketplace />} />
                <Route path="/InsurerDashboard" element={<InsurerDashboard />} />
                <Route path="/Analytics" element={<Analytics />} />
                <Route path="/Marketplace" element={<Marketplace />} />
                <Route path="/Orders" element={<Orders />} />
                <Route path="/MyAds" element={<MyAds />} />
                <Route path="/Appeal" element={<Appeal />} />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/ArbitratorDashboard" element={<ArbitratorDashboard />} />
                <Route path="/Tiers" element={<Tiers />} />
                <Route path="/RolesGuide" element={<RolesGuide />} />
                <Route path="/TradingAPI" element={<TradingAPI />} />
                <Route path="/SetupProfile" element={<SetupProfile />} />
                <Route path="/TestingSuite" element={<TestingSuite />} />
                <Route path="/BackendServices" element={<BackendServices />} />
                <Route path="/ProductionChecklist" element={<ProductionChecklist />} />
                <Route path="/BondCredits" element={<BondCredits />} />
                <Route path="/DeploymentGuide" element={<DeploymentGuide />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Safety" element={<Safety />} />
                <Route path="/Docs" element={<Docs />} />
                <Route path="/MigrationRunner" element={<MigrationRunner />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
