
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface Tab {
  id: string;
  title: string;
  content: string;
}

interface TabSystemProps {
  onTabOpen: (tabId: string) => void;
  onAllTabsClose: () => void;
}

const TabSystem = ({ onTabOpen, onAllTabsClose }: TabSystemProps) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const createNewTab = () => {
    const newTab = {
      id: Date.now().toString(),
      title: "Nova nota",
      content: "",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    onTabOpen(newTab.id);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(tabs.filter((tab) => tab.id !== tabId));
    if (activeTabId === tabId) {
      const nextTabId = tabs[tabs.length - 2]?.id || null;
      setActiveTabId(nextTabId);
      if (!nextTabId) {
        onAllTabsClose();
      }
    }
  };

  const updateTabContent = (tabId: string, newContent: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === tabId ? { ...tab, content: newContent } : tab
      )
    );
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    onTabOpen(tabId);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center border-b border-gray-200 bg-white">
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center px-4 py-2 cursor-pointer border-r border-gray-200 min-w-[120px] ${
                activeTabId === tab.id
                  ? "bg-primary text-white"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <span className="truncate flex-1">{tab.title}</span>
              <button
                onClick={(e) => closeTab(tab.id, e)}
                className="ml-2 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={createNewTab}
          className="p-2 hover:bg-gray-100 text-gray-600"
          title="Nova nota"
        >
          <Plus size={20} />
        </button>
      </div>

      {activeTab && (
        <div className="flex-1 bg-white">
          <Textarea
            value={activeTab.content}
            onChange={(e) => updateTabContent(activeTab.id, e.target.value)}
            className="w-full h-[calc(100vh-48px)] resize-none p-4 border-none focus:ring-0"
            placeholder="Digite sua anotação aqui..."
          />
        </div>
      )}
    </div>
  );
};

export default TabSystem;
