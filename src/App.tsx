import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { AchievementProvider } from './components/AchievementProvider';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import Login from './pages/login';
import Register from './pages/register';
import Calendar from './pages/Calendar';
import Achievements from './pages/achievements';
import PrivacyPolicy from './pages/privacy-policy';
import TermsOfService from './pages/terms-of-service';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AchievementProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/achievements" element={<Achievements />} />
            </Route>
          </Routes>
          <Toaster />
        </AchievementProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
