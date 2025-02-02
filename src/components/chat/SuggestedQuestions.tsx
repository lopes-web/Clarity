import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

const sugestoes = [
  {
    title: "Nutrição Animal",
    questions: [
      "Quais são os principais nutrientes necessários na dieta de bovinos de corte?",
      "Como calcular a ração balanceada para frangos de corte?",
      "Qual a importância dos minerais na alimentação de suínos?",
    ],
  },
  {
    title: "Reprodução",
    questions: [
      "Quais são os sinais de cio em vacas leiteiras?",
      "Como funciona o processo de inseminação artificial em ovinos?",
      "Quais são as principais técnicas de manejo reprodutivo em caprinos?",
    ],
  },
  {
    title: "Sanidade",
    questions: [
      "Quais são as principais doenças que afetam aves de postura?",
      "Como prevenir a mastite em vacas leiteiras?",
      "Quais vacinas são essenciais para bovinos de corte?",
    ],
  },
];

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export function SuggestedQuestions({ onSelectQuestion }: SuggestedQuestionsProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-accent" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Como posso ajudar você hoje?
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha uma sugestão ou faça sua própria pergunta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {sugestoes.map((categoria) => (
          <Card key={categoria.title} className="p-4 space-y-3">
            <h3 className="font-medium text-sm text-foreground">
              {categoria.title}
            </h3>
            <div className="space-y-2">
              {categoria.questions.map((question) => (
                <Button
                  key={question}
                  variant="ghost"
                  className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => onSelectQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 