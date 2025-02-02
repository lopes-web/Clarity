import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppSidebar } from './components/layout/AppSidebar';
import { AppTabs } from './components/layout/AppTabs';
import { TabsManager } from './components/layout/TabsManager';
import Index from './pages/Index';
import { FilesPage } from './pages/FilesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { SidebarProvider } from './components/ui/sidebar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GeminiProvider } from './contexts/GeminiContext';
import { useState } from 'react';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppContent() {
  const [hasActiveTab, setHasActiveTab] = useState(false);
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route
          path="*"
          element={
            <PrivateRoute>
              <SidebarProvider defaultOpen={true}>
                <div className="flex h-screen w-screen overflow-hidden">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col min-w-0 bg-background">
                    <TabsManager onActiveTabChange={(active) => setHasActiveTab(active)} />
                    <main className="flex-1 overflow-auto">
                      {!hasActiveTab && (
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/files" element={<FilesPage />} />
                        </Routes>
                      )}
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GeminiProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </GeminiProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
