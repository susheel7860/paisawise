import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getData, saveData, seedDemoData } from './engine/store';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ReportsPage from './pages/ReportsPage';
import GoalsPage from './pages/GoalsPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';

// App Context
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

function AppProvider({ children }) {
  const [appData, setAppData] = useState(() => getData());

  const refreshData = useCallback(() => {
    setAppData(getData());
  }, []);

  const updateAppData = useCallback((updates) => {
    setAppData(prev => {
      const updated = { ...prev, ...updates };
      saveData(updated);
      return updated;
    });
  }, []);

  const loadDemoData = useCallback(() => {
    const data = seedDemoData();
    setAppData(data);
  }, []);

  return (
    <AppContext.Provider value={{ appData, updateAppData, refreshData, loadDemoData }}>
      {children}
    </AppContext.Provider>
  );
}

function ProtectedRoute({ children }) {
  const { appData } = useApp();
  if (!appData.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
