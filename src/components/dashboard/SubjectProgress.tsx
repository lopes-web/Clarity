import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DashboardCard } from "./DashboardCard";
import { BookOpen } from "lucide-react";
import { fileSystemService } from "@/lib/fileSystemService";

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

  useEffect(() => {
    // Carrega as matérias e calcula o progresso
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
  }, []);

  if (data.length === 0) {
    return (
      <DashboardCard
        title="Progresso por Matéria"
        icon={<BookOpen className="h-5 w-5" />}
      >
        <div className="h-full flex items-center justify-center text-gray-500">
          Adicione matérias para ver o progresso
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