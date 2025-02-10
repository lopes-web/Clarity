import React, { useState } from 'react';
import DisciplineList from '@/components/DisciplineList';
import Sidebar from '@/components/Sidebar';
import Dashboard from "@/components/Dashboard";
import TabSystem from "@/components/TabSystem";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [disciplinas, setDisciplinas] = useState<string[]>([
    "Cálculo I",
    "Física Básica",
    "Programação",
    "Outra Disciplina"
  ]);

  const handleDeleteDiscipline = (disciplina: string) => {
    setDisciplinas(prev => prev.filter(item => item !== disciplina));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TabSystem
          onTabOpen={(tabId) => setActiveTab(tabId)}
          onAllTabsClose={() => setActiveTab(null)}
        />
        {!activeTab && (
          <div className="h-[calc(100vh-48px)] overflow-y-auto">
            <Dashboard />
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Disciplinas do Semestre</h2>
              <DisciplineList disciplinas={disciplinas} onDelete={handleDeleteDiscipline} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
