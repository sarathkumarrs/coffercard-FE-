import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import PublicCampaignPage from './pages/PublicCampaignPage';
import SignupForm from './components/SignupForm';


const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/campaign/:code" element={<PublicCampaignPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;