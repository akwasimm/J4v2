import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AIScoreProvider } from './contexts/AIScoreContext';

// Layout components
import PublicLayout from './components/PublicLayout';
import AppLayout from './components/AppLayout';

// Public pages
import LandingPage from './LandingPage';
import OpportunitiesPage from './OpportunitiesPage';
import SkillGapPage from './SkillGapPage';
import CareerCoachPage from './CareerCoachPage';
import JobDetailPage from './JobDetailPage';
import RegisterPage from './RegisterPage';
import NotFoundPage from './NotFoundPage';

// Standalone auth pages (no layout)
import LoginPage from './LoginPage';
import ResetPasswordPage from './ResetPasswordPage';
import OnboardingPage from './OnboardingPage';
import ResumeUploadPage from './ResumeUploadPage';

// App pages
import MyJobsPage from './MyJobsPage';
import SettingsPage from './SettingsPage';
import ResumeAnalyzerPage from './ResumeAnalyzerPage';
import Dashboard from './Dashboard';
import JobDiscoveryPage from './JobDiscoveryPage';
import ProfilePage from './ProfilePage';
import DevIndexPage from './DevIndexPage';
import MarketInsightsPage from './MarketInsightsPage';


export default function App() {
  return (
    <AIScoreProvider>
    <BrowserRouter>
      <Routes>
        {/* ── Public pages ── */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/opportunities" element={<AppLayout><OpportunitiesPage /></AppLayout>} />
        <Route path="/coach" element={<AppLayout><CareerCoachPage /></AppLayout>} />
        <Route path="/job" element={<PublicLayout><JobDetailPage /></PublicLayout>} />
        <Route path="/join" element={<RegisterPage />} />
        
        {/* ── Temporary Dev Map ── */}
        <Route path="/dev" element={<DevIndexPage />} />

        {/* ── Standalone auth pages ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route path="/preferences" element={<OnboardingPage />} />
        <Route path="/upload" element={<ResumeUploadPage />} />

        {/* ── App pages (sidebar + header) ── */}
        {/* Main Dashboard is now AIRecommendations */}
        <Route path="/user" element={<AppLayout><Dashboard /></AppLayout>} />

        {/* Saved/Applied Jobs - unified view with toggle */}
        <Route path="/applied" element={<Navigate to="/saved?tab=applied" replace />} />
        <Route path="/saved" element={<AppLayout><MyJobsPage /></AppLayout>} />
        <Route path="/discover" element={<AppLayout><JobDiscoveryPage /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
        <Route path="/skillgap" element={<AppLayout><SkillGapPage /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
        <Route path="/analyzer" element={<AppLayout><ResumeAnalyzerPage /></AppLayout>} />
        <Route path="/insights" element={<AppLayout><MarketInsightsPage /></AppLayout>} />

        {/* Catch-all 404 block MUST be at the end */}
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
    </BrowserRouter>
    </AIScoreProvider>
  );
}
