import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DashboardCard } from "./DashboardCard";
import { BookOpen, Plus } from "lucide-react";
import { fileSystemService } from "@/lib/fileSystemService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SubjectProgress {
  name: string;
  value: number;
  color: string;
  files: {
    total: number;
    completed: number;
  };
}

export function SubjectProgress() {
  const [data, setData] = useState<SubjectProgress[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newColor, setNewColor] = useState("#FFDEE2");

  // Função para carregar os dados de progresso
  const loadProgressData = () => {
    const subjects = fileSystemService.getSubjects();
    const progressData = subjects.map(subject => {
      const progress = fileSystemService.getSubjectProgress(subject.id);
      
      return {
        name: subject.name,
        value: progress.progress,
        color: subject.color,
        files: {
          total: progress.totalFiles,
          completed: progress.completedFiles
        }
      };
    });

    setData(progressData);
  };

  // Carrega os dados inicialmente e configura um intervalo para atualização
  useEffect(() => {
    loadProgressData();
    const interval = setInterval(loadProgressData, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const handleAddSubject = () => {
    if (!newSubject) return;
    
    try {
      fileSystemService.createSubject(newSubject, newColor);
      loadProgressData(); // Recarrega os dados após criar a matéria
      
      // Limpa o formulário
      setNewSubject("");
      setNewColor("#FFDEE2");
      setIsDialogOpen(false);
      
      toast.success(`Matéria "${newSubject}" criada com sucesso!`);
    } catch (error) {
      console.error('Erro ao criar matéria:', error);
      toast.error('Erro ao criar matéria. Tente novamente.');
    }
  };

  if (data.length === 0) {
    return (
      <DashboardCard
        title="Progresso por Matéria"
        icon={<BookOpen className="h-5 w-5" />}
      >
        <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-gray-500 text-center">
            Adicione matérias para acompanhar seu progresso
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova Matéria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Matéria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome da matéria"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Cor:</span>
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-24 h-8 rounded cursor-pointer"
                  />
                </div>
                <Button onClick={handleAddSubject} className="w-full">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardCard>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border text-sm">
          <p className="font-semibold">{data.name}</p>
          <p>Progresso: {data.value}%</p>
          <p>Arquivos: {data.files.completed}/{data.files.total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardCard
      title="Progresso por Matéria"
      icon={<BookOpen className="h-5 w-5" />}
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}