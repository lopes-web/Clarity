import { useState } from "react";
import { Plus, X } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { EditorSettings } from "./EditorSettings";
import { NoteTitle } from "./NoteTitle";
import { TabContextMenu } from "./TabContextMenu";
import { ExportButton } from "./ExportButton";

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
  const [editor, setEditor] = useState<any>(null);

  const createNewTab = (title: string = "Nova nota", content: string = "") => {
    const newTab = {
      id: Date.now().toString(),
      title,
      content,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    onTabOpen(newTab.id);
  };

  const closeTab = (tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTabs(tabs.filter((tab) => tab.id !== tabId));
    if (activeTabId === tabId) {
      const nextTabId = tabs[tabs.length - 2]?.id || null;
      setActiveTabId(nextTabId);
      if (!nextTabId) {
        onAllTabsClose();
      }
    }
  };

  const closeOtherTabs = (tabId: string) => {
    setTabs(tabs.filter((tab) => tab.id === tabId));
    setActiveTabId(tabId);
  };

  const closeAllTabs = () => {
    setTabs([]);
    setActiveTabId(null);
    onAllTabsClose();
  };

  const moveTabLeft = (tabId: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    if (tabIndex > 0) {
      const newTabs = [...tabs];
      const tab = newTabs[tabIndex];
      newTabs[tabIndex] = newTabs[tabIndex - 1];
      newTabs[tabIndex - 1] = tab;
      setTabs(newTabs);
    }
  };

  const moveTabRight = (tabId: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    if (tabIndex < tabs.length - 1) {
      const newTabs = [...tabs];
      const tab = newTabs[tabIndex];
      newTabs[tabIndex] = newTabs[tabIndex + 1];
      newTabs[tabIndex + 1] = tab;
      setTabs(newTabs);
    }
  };

  const duplicateTab = (tabId: string) => {
    const tab = tabs.find((tab) => tab.id === tabId);
    if (tab) {
      const newTab = {
        ...tab,
        id: Date.now().toString(),
        title: `${tab.title} (cópia)`,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
      onTabOpen(newTab.id);
    }
  };

  const updateTabContent = (tabId: string, newContent: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === tabId ? { ...tab, content: newContent } : tab
      )
    );
  };

  const updateTabTitle = (tabId: string, newTitle: string) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === tabId ? { ...tab, title: newTitle } : tab
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
      <div className="flex items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map((tab, index) => (
            <TabContextMenu
              key={tab.id}
              onClose={() => closeTab(tab.id)}
              onCloseOthers={() => closeOtherTabs(tab.id)}
              onCloseAll={closeAllTabs}
              onMoveLeft={() => moveTabLeft(tab.id)}
              onMoveRight={() => moveTabRight(tab.id)}
              onDuplicate={() => duplicateTab(tab.id)}
              canMoveLeft={index > 0}
              canMoveRight={index < tabs.length - 1}
              hasOtherTabs={tabs.length > 1}
            >
              <div
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center py-2 cursor-pointer border-r border-gray-200 min-w-[120px] ${activeTabId === tab.id
                  ? "bg-primary text-white"
                  : "bg-white hover:bg-gray-50"
                  }`}
              >
                <NoteTitle
                  title={tab.title}
                  onChange={(newTitle) => updateTabTitle(tab.id, newTitle)}
                  className={activeTabId === tab.id ? "text-white" : ""}
                />
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="ml-2 hover:text-red-500 px-2"
                >
                  <X size={16} />
                </button>
              </div>
            </TabContextMenu>
          ))}
        </div>
        <div className="flex items-center gap-2 px-2">
          {activeTab && editor && (
            <ExportButton editor={editor} />
          )}
          <EditorSettings />
          <button
            onClick={() => createNewTab()}
            className="p-2 hover:bg-gray-100 text-gray-600"
            title="Nova nota"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {activeTab && (
        <div className="flex-1 bg-white">
          <RichTextEditor
            content={activeTab.content}
            onChange={(content) => updateTabContent(activeTab.id, content)}
            placeholder="Digite sua anotação aqui..."
            onEditorReady={setEditor}
          />
        </div>
      )}
    </div>
  );
};

export default TabSystem;
