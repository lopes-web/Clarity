import React, { useState } from 'react';
import DisciplineList from '@/components/DisciplineList';
import Sidebar from '@/components/Sidebar';
import Dashboard from "@/components/Dashboard";
import TabSystem from "@/components/TabSystem";
import { Footer } from '@/components/Footer';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <TabSystem
          onTabOpen={(tabId) => setActiveTab(tabId)}
          onAllTabsClose={() => setActiveTab(null)}
        />
        {!activeTab && (
          <div className="flex-1 overflow-y-auto">
            <Dashboard />
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
};

export default Index;
