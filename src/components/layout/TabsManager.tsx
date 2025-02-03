import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotionEditor } from '../editor/NotionEditor';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useLocation } from 'react-router-dom';

interface Tab {
  id: string;
  title: string;
  content: string;
  fileId?: string;
  path?: string;
}

interface TabsManagerProps {
  onActiveTabChange?: (hasActiveTab: boolean) => void;
}

export function TabsManager({ onActiveTabChange }: TabsManagerProps) {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const savedTabs = localStorage.getItem('dashboard-tabs');
    return savedTabs ? JSON.parse(savedTabs) : [];
  });

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const { createFile, updateFile } = useFileSystem();
  const location = useLocation();

  useEffect(() => {
    onActiveTabChange?.(activeTabId !== null);
  }, [activeTabId, onActiveTabChange]);

  useEffect(() => {
    if (location.state && (location.state as any).clearActiveTab) {
      setActiveTabId(null);
      window.history.replaceState({}, document.title);
    } else if (location.pathname === '/') {
      setActiveTabId(null);
    } else {
      const matchingTabs = tabs.filter(tab => tab.path === location.pathname);
      if (matchingTabs.length > 0) {
        setActiveTabId(matchingTabs[matchingTabs.length - 1].id);
      } else {
        setActiveTabId(null);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('dashboard-tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('dashboard-active-tab', activeTabId || '');
  }, [activeTabId]);

  const createNewTab = () => {
    const newTab: Tab = {
      id: crypto.randomUUID(),
      title: 'Sem título',
      content: '',
      path: location.pathname,
    };
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    setTabs(tabs.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      const newActiveId = tabs[tabs.length - 2]?.id || null;
      setActiveTabId(newActiveId);
    }
  };

  const updateTabContent = (tabId: string, content: string) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, content } 
        : tab
    ));
  };

  const saveTab = async (tabId: string, path?: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (path) {
      setTabs(prevTabs => prevTabs.map(t => 
        t.id === tabId 
          ? { ...t, path } 
          : t
      ));
    }

    if (tab.fileId && !path) {
      updateFile(tab.fileId, tab.content);
    } else {
      const file = createFile(tab.title, tab.content, path);
      if (file) {
        setTabs(prevTabs => prevTabs.map(t => 
          t.id === tabId 
            ? { ...t, fileId: file.id, path: file.path } 
            : t
        ));
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

  return (
    <>
      <div className="flex items-center gap-1 px-2 h-10 bg-muted/30 border-b border-border">
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "group relative flex items-center gap-2 px-4 h-9 rounded-t-lg transition-colors cursor-pointer shrink-0",
                activeTabId === tab.id
                  ? "bg-background border-t border-x border-border"
                  : "hover:bg-accent/50 bg-transparent"
              )}
              onClick={() => setActiveTabId(tab.id)}
            >
              <input
                type="text"
                value={tab.title}
                onChange={(e) => updateTabTitle(tab.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-none outline-none text-sm max-w-[120px]"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
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
            onClick={createNewTab}
            className="p-2 hover:bg-accent rounded-md shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {activeTabId && (
        <div className="flex-1">
          <NotionEditor
            key={activeTabId}
            content={tabs.find(tab => tab.id === activeTabId)?.content}
            currentPath={tabs.find(tab => tab.id === activeTabId)?.path}
            onUpdate={(content) => {
              updateTabContent(activeTabId, content);
            }}
            onSave={(path) => saveTab(activeTabId, path)}
            className="h-full"
          />
        </div>
      )}
    </>
  );
} 