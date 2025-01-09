import { useState, useEffect } from "react";
import { BookOpen, Plus } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { fileSystemService } from "@/lib/fileSystemService";

interface Subject {
  id: string;
  name: string;
  color: string;
  folderId: string;
}

export function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newColor, setNewColor] = useState("#FFDEE2");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Carrega as matérias ao montar o componente
    setSubjects(fileSystemService.getSubjects());
  }, []);

  const handleAddSubject = () => {
    if (!newSubject) return;
    
    try {
      // Cria a matéria e sua estrutura de pastas
      const subject = fileSystemService.createSubject(newSubject, newColor);
      setSubjects(fileSystemService.getSubjects());
      
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

  return (
    <DashboardCard title="Matérias" icon={<BookOpen className="h-5 w-5" />}>
      <div className="space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
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

        <div className="grid gap-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-pastel-purple/10"
              style={{ borderLeft: `4px solid ${subject.color}` }}
            >
              <span>{subject.name}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}