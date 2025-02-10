import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DisciplineListProps {
  disciplinas: string[];
  onDelete: (disciplina: string) => void;
}

const DisciplineList: React.FC<DisciplineListProps> = ({ disciplinas, onDelete }) => {
  return (
    <div className="space-y-3">
      {disciplinas.map((disciplina) => (
        <div key={disciplina} className="flex items-center justify-between bg-white p-4 rounded-lg border">
          <span className="text-lg font-medium">{disciplina}</span>
          <Button 
            variant="destructive" 
            onClick={() => onDelete(disciplina)} 
            aria-label={`Apagar disciplina ${disciplina}`}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {disciplinas.length === 0 && (
        <p className="text-gray-500">Nenhuma disciplina cadastrada.</p>
      )}
    </div>
  );
};

export default DisciplineList; 