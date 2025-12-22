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
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

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
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Trades" element={<Trades />} />
                
                <Route path="/TradeDetails" element={<TradeDetails />} />
                
                <Route path="/Disputes" element={<Disputes />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/DisputeDetails" element={<DisputeDetails />} />
                
                <Route path="/InsuranceMarketplace" element={<InsuranceMarketplace />} />
                
                <Route path="/InsurerDashboard" element={<InsurerDashboard />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Marketplace" element={<Marketplace />} />
                
                <Route path="/Settings" element={<Settings />} />
                
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