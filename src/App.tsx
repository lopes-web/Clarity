import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { EventProvider } from "@/components/EventProvider";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Index from "@/pages/Index";
import Calendar from "@/pages/Calendar";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/privacy-policy";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('VITE_GOOGLE_CLIENT_ID is not defined in environment variables');
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <EventProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </EventProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
