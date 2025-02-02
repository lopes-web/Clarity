import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const sugestoes = [
  {
    title: "Nutrição Animal",
    icon: "🍽️",
    description: "Explore aspectos nutricionais e dietas balanceadas",
    questions: [
      "Quais são os principais nutrientes necessários na dieta de bovinos de corte?",
      "Como calcular a ração balanceada para frangos de corte?",
      "Qual a importância dos minerais na alimentação de suínos?",
    ],
  },
  {
    title: "Reprodução",
    icon: "🧬",
    description: "Aprenda sobre manejo reprodutivo e técnicas de reprodução",
    questions: [
      "Quais são os sinais de cio em vacas leiteiras?",
      "Como funciona o processo de inseminação artificial em ovinos?",
      "Quais são as principais técnicas de manejo reprodutivo em caprinos?",
    ],
  },
  {
    title: "Sanidade",
    icon: "🏥",
    description: "Saiba mais sobre saúde animal e prevenção de doenças",
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-12"
      >
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <Lightbulb className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Como posso ajudar você hoje?
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Escolha uma das sugestões abaixo ou faça sua própria pergunta para começarmos nossa conversa
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {sugestoes.map((categoria, index) => (
          <motion.div
            key={categoria.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="relative p-6 space-y-4">
                <div className="space-y-2">
                  <span className="text-2xl">{categoria.icon}</span>
                  <h3 className="font-semibold text-xl text-gray-900">
                    {categoria.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {categoria.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {categoria.questions.map((question) => (
                    <motion.div
                      key={question}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-left hover:bg-blue-50/50 group/button p-3"
                        onClick={() => onSelectQuestion(question)}
                      >
                        <span className="text-sm text-gray-600 group-hover/button:text-blue-600 flex-1 mr-2">
                          {question}
                        </span>
                        <ChevronRight className="w-4 h-4 shrink-0 text-gray-400 group-hover/button:text-blue-500 transition-transform group-hover/button:translate-x-1" />
                      </Button>
                    </motion.div>
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