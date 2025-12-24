import React, { Suspense } from "react";
const Layout = React.lazy(() => import("./Layout.jsx"));
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const Dashboard = React.lazy(() => import("./Dashboard"));
const Trades = React.lazy(() => import("./Trades"));
const TradeDetails = React.lazy(() => import("./TradeDetails"));
const Disputes = React.lazy(() => import("./Disputes"));
const Profile = React.lazy(() => import("./Profile"));
const DisputeDetails = React.lazy(() => import("./DisputeDetails"));
const InsuranceMarketplace = React.lazy(() => import("./InsuranceMarketplace"));
const InsurerDashboard = React.lazy(() => import("./InsurerDashboard"));
const Analytics = React.lazy(() => import("./Analytics"));
const Marketplace = React.lazy(() => import("./Marketplace"));
const Settings = React.lazy(() => import("./Settings"));
const Orders = React.lazy(() => import("./Orders"));
const MyAds = React.lazy(() => import("./MyAds"));
const Appeal = React.lazy(() => import("./Appeal"));
const Admin = React.lazy(() => import("./Admin"));
const ArbitratorDashboard = React.lazy(() => import("./ArbitratorDashboard"));
const Tiers = React.lazy(() => import("./Tiers"));
const RolesGuide = React.lazy(() => import("./RolesGuide"));
const TradingAPI = React.lazy(() => import("./TradingAPI"));
const TestingSuite = React.lazy(() => import("./TestingSuite"));
const BackendServices = React.lazy(() => import("./BackendServices"));
const ProductionChecklist = React.lazy(() => import("./ProductionChecklist"));
const BondCredits = React.lazy(() => import("./BondCredits"));
const DeploymentGuide = React.lazy(() => import("./DeploymentGuide"));
const Home = React.lazy(() => import("./Home"));
const Safety = React.lazy(() => import("./Safety"));
const Docs = React.lazy(() => import("./Docs"));
const Referrals = React.lazy(() => import("./Referrals"));
const MigrationRunner = React.lazy(() => import("./MigrationRunner"));

const PAGES = {
    Dashboard: Dashboard,
    Referrals: Referrals,
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
        referrals: "Referrals",
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
        creditwallet: "BondCredits",
        "credit-wallet": "BondCredits",
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
export function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/referrals" element={<Referrals />} />
                    <Route path="/explore" element={<Marketplace />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/escrows" element={<Orders />} />
                    <Route path="/escrows/create" element={<Trades />} />
                    <Route path="/escrows/:escrowId" element={<TradeDetails />} />
                    <Route path="/trades" element={<Trades />} />
                    <Route path="/trade-details" element={<TradeDetails />} />
                    <Route path="/disputes" element={<Disputes />} />
                    <Route path="/dispute-details" element={<DisputeDetails />} />
                    <Route
                      path="/arbitration"
                      element={
                        <ProtectedRoute roles={["ARBITRATOR", "SUPER_ADMIN"]}>
                          <ArbitratorDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/arbitration/:escrowId"
                      element={
                        <ProtectedRoute roles={["ARBITRATOR", "SUPER_ADMIN"]}>
                          <DisputeDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/pools"
                      element={
                        <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/roles"
                      element={
                        <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/tokens"
                      element={
                        <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/arbitrator-dashboard"
                      element={
                        <ProtectedRoute roles={["ARBITRATOR", "SUPER_ADMIN"]}>
                          <ArbitratorDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/my-ads" element={<MyAds />} />
                    <Route path="/appeal" element={<Appeal />} />
                    <Route path="/tiers" element={<Tiers />} />
                    <Route path="/rolesguide" element={<RolesGuide />} />
                    <Route path="/roles-guide" element={<RolesGuide />} />
                    <Route path="/trading-api" element={<TradingAPI />} />
                    <Route path="/tradingapi" element={<TradingAPI />} />
                    <Route path="/testing-suite" element={<TestingSuite />} />
                    <Route path="/testingsuite" element={<TestingSuite />} />
                    <Route path="/backend-services" element={<BackendServices />} />
                    <Route path="/production-checklist" element={<ProductionChecklist />} />
                    <Route path="/productionchecklist" element={<ProductionChecklist />} />
                    <Route path="/bond-credits" element={<BondCredits />} />
                    <Route path="/bondcredits" element={<BondCredits />} />
                    <Route path="/credit-wallet" element={<BondCredits />} />
                    <Route path="/creditwallet" element={<BondCredits />} />
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
                    <Route
                      path="/Admin"
                      element={
                        <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ArbitratorDashboard"
                      element={
                        <ProtectedRoute roles={["ARBITRATOR", "SUPER_ADMIN"]}>
                          <ArbitratorDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/Tiers" element={<Tiers />} />
                    <Route path="/RolesGuide" element={<RolesGuide />} />
                    <Route path="/TradingAPI" element={<TradingAPI />} />
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
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <Suspense fallback={<LoadingSpinner fullScreen text="Loading layout..." />}>
                <PagesContent />
            </Suspense>
        </Router>
    );
}
