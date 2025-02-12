import React from 'react';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';
import { Footer } from '@/components/Footer';

const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col lg:ml-64">
        <div className="flex-1 overflow-y-auto p-6">
          <Dashboard />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default DashboardPage; 