import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PomodoroTimer } from "@/components/dashboard/PomodoroTimer";
import { TaskList } from "@/components/dashboard/TaskList";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { FileSystem } from "@/components/dashboard/FileSystem";
import { SubjectManager } from "@/components/dashboard/SubjectManager";
import { TabsManager } from "@/components/layout/TabsManager";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { LockIcon, UnlockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GridLayout from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const QuickNotes = () => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-medium">Notas Rápidas</h3>
      </div>
      
      <textarea 
        className="w-full h-24 p-2 text-sm border rounded-md resize-none 
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        placeholder="Digite suas anotações aqui..."
      />
      
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>Pressione Enter para salvar</span>
        <span>0/200</span>
      </div>
    </div>
  );
};

const Index = () => {
  const [layout, setLayout] = useState([
    { i: 'pomodoro', x: 0, y: 0, w: 1, h: 6 },
    { i: 'tasks', x: 1, y: 0, w: 1, h: 6 },
    { i: 'progress', x: 2, y: 0, w: 1, h: 6 },
    { i: 'files', x: 0, y: 6, w: 1, h: 6 },
    { i: 'subjects', x: 1, y: 6, w: 1, h: 6 },
    { i: 'editor', x: 2, y: 6, w: 1, h: 6 },
    { i: 'assistant', x: 0, y: 12, w: 3, h: 12 },
  ]);
  const [isDraggable, setIsDraggable] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDraggable = () => {
    setIsDraggable(!isDraggable);
    toast.success(`Modo de edição ${!isDraggable ? 'ativado' : 'desativado'}`);
  };

  // Ajuste do cálculo da largura do grid
  const getGridWidth = () => {
    const sidebarWidth = 250;
    const padding = 32;
    const minColumnWidth = 280; // Reduzido de 300 para 280
    const gridGap = 12 * 2; // Espaço entre colunas
    
    // Calcula largura disponível considerando o sidebar
    const availableWidth = windowWidth - sidebarWidth - padding;
    
    // Largura ideal para 3 colunas
    const idealWidth = minColumnWidth * 3 + gridGap;
    
    return Math.min(Math.max(availableWidth, idealWidth), 1200); // Máximo de 1200px
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pastel-pink/20 via-pastel-purple/10 to-pastel-blue/20">
      <main className="p-4">
        <div className="mx-auto space-y-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDraggable}
                className={`transition-colors ${
                  isDraggable ? 'bg-pastel-purple/20' : ''
                }`}
              >
                {isDraggable ? (
                  <UnlockIcon className="h-4 w-4 mr-2" />
                ) : (
                  <LockIcon className="h-4 w-4 mr-2" />
                )}
                {isDraggable ? 'Modo Edição' : 'Modo Visualização'}
              </Button>
              <SidebarTrigger />
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="w-full" style={{ maxWidth: getGridWidth() }}>
              <GridLayout
                className="layout"
                layout={layout}
                cols={3}
                rowHeight={50}
                width={getGridWidth()}
                onLayoutChange={(newLayout) => setLayout(newLayout)}
                isDraggable={isDraggable}
                isResizable={isDraggable}
                margin={[10, 10]}
                containerPadding={[8, 8]}
                resizeHandles={['s', 'se', 'e']}
                minH={3}
                maxH={20}
              >
                <div key="pomodoro">
                  <PomodoroTimer />
                </div>
                <div key="tasks">
                  <TaskList />
                </div>
                <div key="progress">
                  <SubjectProgress />
                </div>
                <div key="files">
                  <FileSystem />
                </div>
                <div key="subjects">
                  <SubjectManager />
                </div>
                <div key="editor" className="h-full">
                  <QuickNotes />
                </div>
                <div key="assistant" className="h-full overflow-hidden">
                  <AIAssistant />
                </div>
              </GridLayout>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;