import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const sugestoes = [
  {
    title: "Nutrição Animal",
    icon: "🍽️",
    questions: [
      "Quais são os principais nutrientes necessários na dieta de bovinos de corte?",
      "Como calcular a ração balanceada para frangos de corte?",
      "Qual a importância dos minerais na alimentação de suínos?",
    ],
  },
  {
    title: "Reprodução",
    icon: "🧬",
    questions: [
      "Quais são os sinais de cio em vacas leiteiras?",
      "Como funciona o processo de inseminação artificial em ovinos?",
      "Quais são as principais técnicas de manejo reprodutivo em caprinos?",
    ],
  },
  {
    title: "Sanidade",
    icon: "🏥",
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-8 max-w-7xl mx-auto"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center"
          >
            <Lightbulb className="w-8 h-8 text-accent" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Como posso ajudar você hoje?
        </h2>
        <p className="text-base text-muted-foreground max-w-lg mx-auto">
          Escolha uma sugestão ou faça sua própria pergunta para começarmos nossa conversa
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {sugestoes.map((categoria, index) => (
          <motion.div
            key={categoria.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <Card className="h-full p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoria.icon}</span>
                  <h3 className="font-semibold text-lg text-foreground">
                    {categoria.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  {categoria.questions.map((question) => (
                    <Button
                      key={question}
                      variant="ghost"
                      className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors duration-200"
                      onClick={() => onSelectQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 