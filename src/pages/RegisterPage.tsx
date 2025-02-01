import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#C49ED7]/20 via-[#C49ED7]/10 to-[#C49ED7]/5">
      <div className="w-full max-w-md space-y-8 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Logo size={96} />
          </div>
          <p className="text-gray-600">
            Crie sua conta e comece a estudar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#C49ED7] hover:bg-[#C49ED7]/90"
            disabled={loading}
          >
            {loading ? (
              'Criando conta...'
            ) : (
              <>
                Criar conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-sm text-center text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-[#C49ED7] hover:text-[#C49ED7]/80 transition-colors"
            >
              Faça login
            </Link>
          </p>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Seu assistente de estudos com IA
      </p>
    </div>
  );
} 