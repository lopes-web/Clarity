import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface Tab {
  id: string;
  title: string;
  path: string;
}

export function AppTabs() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const savedTabs = localStorage.getItem('app-tabs');
    return savedTabs ? JSON.parse(savedTabs) : [];
  });
  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    const savedActiveTab = localStorage.getItem('active-tab');
    return savedActiveTab || null;
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Salva as abas no localStorage
  useEffect(() => {
    localStorage.setItem('app-tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('active-tab', activeTabId || '');
  }, [activeTabId]);

  // Atualiza a aba ativa quando a rota muda
  useEffect(() => {
    if (location.state && (location.state as any).clearActiveTab) {
      setActiveTabId(null);
      // Clear the location state without triggering navigation
      window.history.replaceState({}, document.title);
    } else {
      const matchingTabs = tabs.filter(tab => tab.path === location.pathname);
      if (matchingTabs.length > 0) {
        // Ativa a aba mais recente (última) com a rota atual
        setActiveTabId(matchingTabs[matchingTabs.length - 1].id);
      } else {
        setActiveTabId(null);
      }
    }
  }, [location.pathname, tabs]);

  const createNewTab = () => {
    // Clear any lingering navigation state that may cause deactivation of the new tab
    window.history.replaceState({}, document.title);
    const newTab: Tab = {
      id: crypto.randomUUID(),
      title: 'Nova aba',
      path: location.pathname,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tabToClose = tabs.find(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const nextTab = newTabs[newTabs.length - 1];
      if (nextTab) {
        setActiveTabId(nextTab.id);
        navigate(nextTab.path);
      }
    }
  };

  const updateTabTitle = (tabId: string, newTitle: string) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId
        ? { ...tab, title: newTitle }
        : tab
    ));
  };

  const handleTabClick = (tab: Tab) => {
    setActiveTabId(tab.id);
    if (location.pathname !== tab.path) {
      navigate(tab.path);
    }
  };

  return (
    <div className="flex items-center gap-1 px-2 h-10 bg-background border-b border-border">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group relative flex items-center gap-2 px-4 h-9 rounded-t-lg transition-colors cursor-pointer",
            activeTabId === tab.id
              ? "bg-background border-t border-x border-border"
              : "hover:bg-accent/50 bg-muted/30"
          )}
          onClick={() => handleTabClick(tab)}
        >
          <input
            type="text"
            value={tab.title}
            onChange={(e) => updateTabTitle(tab.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent border-none outline-none text-sm max-w-[120px]"
          />
          <button
            type="button"
            onClick={(e) => closeTab(tab.id, e)}
            className={cn(
              "p-1 rounded-sm hover:bg-muted",
              activeTabId === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <X className="w-3 h-3" />
          </button>
          {activeTabId === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-background" />
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={createNewTab}
        className="p-2 hover:bg-accent rounded-md ml-1"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
} 