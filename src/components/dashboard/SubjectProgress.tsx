import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { DashboardCard } from "./DashboardCard";
import { BookOpen } from "lucide-react";

const data = [
  { name: "Matemática", value: 35 },
  { name: "Física", value: 25 },
  { name: "História", value: 20 },
  { name: "Literatura", value: 20 },
];

const COLORS = ["#FFDEE2", "#E5DEFF", "#D3E4FD", "#FDE1D3"];

export function SubjectProgress() {
  return (
    <DashboardCard
      title="Progresso por Matéria"
      icon={<BookOpen className="h-5 w-5" />}
      className="h-[300px]"
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
}