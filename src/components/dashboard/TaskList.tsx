import { useState } from "react";
import { CheckCircle, Circle, ListTodo } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Revisar capítulo de Matemática", completed: false },
    { id: 2, title: "Fazer exercícios de Física", completed: true },
    { id: 3, title: "Ler artigo de História", completed: false },
    { id: 4, title: "Preparar apresentação", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, {
      id: Date.now(),
      title: newTask,
      completed: false
    }]);
    setNewTask("");
  };

  return (
    <DashboardCard title="Tarefas Pendentes" icon={<ListTodo className="h-5 w-5" />}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nova tarefa..."
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="flex-1"
          />
          <Button onClick={addTask} size="sm" className="shrink-0">
            Adicionar
          </Button>
        </div>
        <div className="h-[180px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-purple-200 hover:[&::-webkit-scrollbar-thumb]:bg-purple-300 [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="space-y-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group relative"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md transition-colors w-full text-left",
                    "hover:bg-purple-50",
                    task.completed ? "text-gray-400" : "text-gray-700"
                  )}
                >
                  <div className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                    )}
                  </div>
                  <span 
                    className={cn(
                      "flex-1 min-w-0",
                      task.completed && "line-through"
                    )}
                  >
                    {task.title}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}