import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './auth/AuthContext';
import { FranchiseProvider } from './hooks/useFranchise';
import { ThemeProvider } from './components/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PublicSite from './pages/PublicSite';

// Dashboard Components
import DashboardLayout from './dashboard/DashboardLayout';
import DashboardHome from './dashboard/DashboardHome';
import Members from './admin/Members';
import Trainers from './admin/Trainers';
import Plans from './admin/Plans';
import Branches from './admin/Branches';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/:templateId" element={<Signup />} />
        <Route path="/onboarding" element={<Signup />} />
        <Route path="/onboarding/:templateId" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/site/:franchiseId" element={<PublicSite />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <FranchiseProvider>
              <DashboardLayout />
            </FranchiseProvider>
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="members" element={<Members />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="plans" element={<Plans />} />
          <Route path="branches" element={<Branches />} />
        </Route>

        <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
