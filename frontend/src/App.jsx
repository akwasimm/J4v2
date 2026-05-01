import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AIScoreProvider } from './contexts/AIScoreContext';

// Layout components
import PublicLayout from './components/PublicLayout';
import AppLayout from './components/AppLayout';

// Public pages
import JobForLanding from './JobForLanding';
import V2Landing from './V2Landing';
import BigOpportunities from './BigOpportunities';
import MarketInsights from './MarketInsights';
import SkillGapAnalysis from './SkillGapAnalysis';
import CareerCoach from './CareerCoach';
import JobDetail from './JobDetail';
import JoinCommunity from './JoinCommunity';
import NotFound from './NotFound';

// Standalone auth pages (no layout)
import LoginPage from './LoginPage';
import ResetPassword from './ResetPassword';
import PreferencesPage from './PreferencesPage';
import UploadResumePage from './UploadResumePage';

// App pages
import UserDashboard from './UserDashboard';
import JobForDashboard from './JobForDashboard';
import SavedJobs from './SavedJobs';
import SettingsPage from './SettingsPage';
import ResumeAnalyzer from './ResumeAnalyzer';
import AIRecommendations from './AIRecommendations';
import JobDiscovery from './JobDiscovery';
import EditProfile from './EditProfile';
import MergedDashboard from './MergedDashboard';

// Temp Dev Index
import DevIndex from './DevIndex';

export default function App() {
  return (
    <AIScoreProvider>
    <BrowserRouter>
      <Routes>
        {/* ── Public pages ── */}
        <Route path="/" element={<PublicLayout><JobForLanding /></PublicLayout>} />
        <Route path="/v2-landing" element={<PublicLayout><V2Landing /></PublicLayout>} />
        <Route path="/opportunities" element={<AppLayout><BigOpportunities /></AppLayout>} />
        <Route path="/insights" element={<AppLayout><MarketInsights /></AppLayout>} />
        <Route path="/skill-gap" element={<AppLayout><SkillGapAnalysis /></AppLayout>} />
        <Route path="/coach" element={<AppLayout><CareerCoach /></AppLayout>} />
        <Route path="/job" element={<PublicLayout><JobDetail /></PublicLayout>} />
        <Route path="/join" element={<JoinCommunity />} />
        
        {/* ── Temporary Dev Map ── */}
        <Route path="/dev" element={<DevIndex />} />

        {/* ── Standalone auth pages ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/upload" element={<UploadResumePage />} />

        {/* ── App pages (sidebar + header) ── */}
        {/* Main Dashboard is now AIRecommendations */}
        <Route path="/user" element={<AppLayout><AIRecommendations /></AppLayout>} />
        <Route path="/user-archived" element={<AppLayout><UserDashboard /></AppLayout>} />

        {/* Saved/Applied Jobs - unified view with toggle */}
        <Route path="/applied" element={<Navigate to="/saved?tab=applied" replace />} />
        <Route path="/saved" element={<AppLayout><SavedJobs /></AppLayout>} />
        <Route path="/ai" element={<AppLayout><AIRecommendations /></AppLayout>} />
        <Route path="/merged" element={<AppLayout><MergedDashboard /></AppLayout>} />
        <Route path="/discover" element={<AppLayout><JobDiscovery /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><EditProfile /></AppLayout>} />
        <Route path="/skillgap" element={<AppLayout><SkillGapAnalysis /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
        <Route path="/analyzer" element={<AppLayout><ResumeAnalyzer /></AppLayout>} />
        
        {/* Catch-all 404 block MUST be at the end */}
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </BrowserRouter>
    </AIScoreProvider>
  );
}
