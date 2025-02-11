import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <Link to="/" className="flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a página inicial
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
        
        <div className="prose prose-gray max-w-none">
          <p>Última atualização: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Informações que coletamos</h2>
          <p>
            O Clarity coleta apenas as informações necessárias para o funcionamento do serviço:
          </p>
          <ul>
            <li>Dados do calendário do Google (mediante sua autorização explícita)</li>
            <li>Informações sobre eventos acadêmicos que você criar</li>
          </ul>

          <h2>2. Como usamos suas informações</h2>
          <p>
            Utilizamos suas informações exclusivamente para:
          </p>
          <ul>
            <li>Sincronizar seus eventos acadêmicos com o Google Calendar</li>
            <li>Melhorar sua experiência de organização acadêmica</li>
          </ul>

          <h2>3. Compartilhamento de dados</h2>
          <p>
            Não compartilhamos suas informações com terceiros. Os dados são utilizados
            apenas para a sincronização com sua própria conta do Google Calendar.
          </p>

          <h2>4. Segurança</h2>
          <p>
            Implementamos medidas de segurança para proteger suas informações:
          </p>
          <ul>
            <li>Uso de HTTPS para todas as comunicações</li>
            <li>Armazenamento seguro de dados</li>
            <li>Autenticação via Google OAuth 2.0</li>
          </ul>

          <h2>5. Seus direitos</h2>
          <p>
            Você tem o direito de:
          </p>
          <ul>
            <li>Acessar seus dados</li>
            <li>Corrigir seus dados</li>
            <li>Excluir seus dados</li>
            <li>Revogar o acesso ao Google Calendar</li>
          </ul>

          <h2>6. Contato</h2>
          <p>
            Para questões sobre privacidade, entre em contato através do email:
            privacy@clarity-app.com
          </p>
        </div>
      </div>
    </div>
  );
} 