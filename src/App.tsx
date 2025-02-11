import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { EventProvider } from "@/components/EventProvider";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Index from "@/pages/Index";
import Calendar from "@/pages/Calendar";
import NotFound from "@/pages/NotFound";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <EventProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </EventProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
