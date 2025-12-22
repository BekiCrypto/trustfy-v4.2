import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";
import Trades from "./Trades";
import TradeDetails from "./TradeDetails";
import Disputes from "./Disputes";
import DisputeDetails from "./DisputeDetails";
import Marketplace from "./Marketplace";
import Admin from "./Admin";
import ArbitratorDashboard from "./ArbitratorDashboard";
import Profile from "./Profile";
import Settings from "./Settings";
import CreateEscrow from "./CreateEscrow";
import NotificationPreferences from "./NotificationPreferences";
import AdminPools from "./AdminPools";
import AdminRoles from "./AdminRoles";
import AdminTokens from "./AdminTokens";
import Home from "./Home";
import Safety from "./Safety";
import Docs from "./Docs";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    Trades: Trades,
    TradeDetails: TradeDetails,
    Disputes: Disputes,
    DisputeDetails: DisputeDetails,
    Marketplace: Marketplace,
    CreateEscrow: CreateEscrow,
    NotificationPreferences: NotificationPreferences,
    Admin: Admin,
    AdminPools: AdminPools,
    AdminRoles: AdminRoles,
    AdminTokens: AdminTokens,
    ArbitratorDashboard: ArbitratorDashboard,
    Profile: Profile,
    Settings: Settings,
    Home: Home,
    Safety: Safety,
    Docs: Docs,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    const segments = url.split('/').filter(Boolean);
    let urlLastPart = segments[segments.length - 1] || "";
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    if (segments.includes("trade-details")) return "TradeDetails";
    if (segments.includes("dispute-details")) return "DisputeDetails";
    if (segments.includes("admin")) return "Admin";
    if (segments.includes("disputes")) return "Disputes";
    if (segments.includes("marketplace")) return "Marketplace";
    if (segments.includes("dashboard")) return "Dashboard";

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
            <Route path="/" element={<Home />} />
                
                
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/trades" element={<Trades />} />
                
                <Route path="/trade-details/:escrowId" element={<TradeDetails />} />
                
                <Route path="/disputes" element={<Disputes />} />
                
                <Route path="/profile" element={<Profile />} />
                
                <Route path="/dispute-details/:escrowId" element={<DisputeDetails />} />
                
                <Route path="/marketplace" element={<Marketplace />} />
                
                <Route path="/create" element={<CreateEscrow />} />

                <Route path="/notifications" element={<NotificationPreferences />} />

                <Route path="/settings" element={<Settings />} />
                
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/pools" element={<AdminPools />} />
                <Route path="/admin/roles" element={<AdminRoles />} />
                <Route path="/admin/tokens" element={<AdminTokens />} />
                
                <Route path="/arbitrator" element={<ArbitratorDashboard />} />
                
                <Route path="/home" element={<Home />} />
                
                <Route path="/safety" element={<Safety />} />
                
                <Route path="/docs" element={<Docs />} />

                <Route path="/explore" element={<Marketplace />} />
                <Route path="/app/dashboard" element={<Dashboard />} />
                <Route path="/app/escrows" element={<Trades />} />
                <Route path="/app/escrows/:escrowId" element={<TradeDetails />} />
                <Route path="/app/create" element={<CreateEscrow />} />
                <Route path="/app/notifications" element={<NotificationPreferences />} />
                <Route path="/arbitrator/disputes" element={<Disputes />} />
                <Route path="/arbitrator/disputes/:escrowId" element={<DisputeDetails />} />
                <Route path="/admin/dashboard" element={<Admin />} />
                <Route path="/admin/pools" element={<AdminPools />} />
                <Route path="/admin/roles" element={<AdminRoles />} />
                <Route path="/admin/tokens" element={<AdminTokens />} />
                
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
