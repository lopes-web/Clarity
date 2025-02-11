import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <Link to="/" className="flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a página inicial
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
        
        <div className="prose prose-gray max-w-none">
          <p>Última atualização: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar o Clarity, você concorda em cumprir e estar vinculado aos seguintes termos e condições.
            Se você não concordar com qualquer parte destes termos, não poderá usar nosso serviço.
          </p>

          <h2>2. Descrição do Serviço</h2>
          <p>
            O Clarity é uma plataforma de organização acadêmica que permite:
          </p>
          <ul>
            <li>Gerenciamento de eventos acadêmicos</li>
            <li>Sincronização com Google Calendar</li>
            <li>Organização de disciplinas e atividades</li>
          </ul>

          <h2>3. Conta do Usuário</h2>
          <p>
            Para usar o Clarity, você precisa:
          </p>
          <ul>
            <li>Ter uma conta Google válida</li>
            <li>Fornecer autorização para acesso ao Google Calendar</li>
            <li>Manter suas credenciais seguras</li>
          </ul>

          <h2>4. Uso Aceitável</h2>
          <p>
            Você concorda em usar o serviço apenas para fins legítimos e de acordo com estes termos.
            Você não deve:
          </p>
          <ul>
            <li>Usar o serviço para atividades ilegais</li>
            <li>Tentar acessar dados de outros usuários</li>
            <li>Interferir na operação normal do serviço</li>
          </ul>

          <h2>5. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo e código do Clarity são protegidos por direitos autorais.
            Você não pode copiar, modificar ou distribuir nosso conteúdo sem autorização.
          </p>

          <h2>6. Limitação de Responsabilidade</h2>
          <p>
            O Clarity é fornecido "como está" e não oferecemos garantias específicas sobre sua operação.
            Não nos responsabilizamos por perdas de dados ou interrupções do serviço.
          </p>

          <h2>7. Modificações dos Termos</h2>
          <p>
            Reservamos o direito de modificar estes termos a qualquer momento.
            Alterações significativas serão notificadas aos usuários.
          </p>

          <h2>8. Encerramento</h2>
          <p>
            Podemos encerrar ou suspender o acesso ao nosso serviço imediatamente, sem aviso prévio,
            por qualquer motivo, incluindo violação destes termos.
          </p>

          <h2>9. Contato</h2>
          <p>
            Para questões sobre estes termos, entre em contato através do email:
            terms@clarity-app.com
          </p>
        </div>
      </div>
    </div>
  );
} 