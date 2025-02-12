import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !name) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, name);
    } catch (error: any) {
      console.error("Erro no registro:", error);
      if (error?.message?.includes("after")) {
        // Extrai o número de segundos da mensagem de erro
        const seconds = parseInt(error.message.match(/\d+/)?.[0] || "60");
        setRateLimitSeconds(seconds);
        toast.error(`Aguarde ${seconds} segundos antes de tentar novamente`);

        // Inicia o contador regressivo
        const interval = setInterval(() => {
          setRateLimitSeconds(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error("Erro ao criar conta. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="space-y-6">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Crie sua conta</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Só vai precisar fazer isso uma vez cabeça de bunda

            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nome da mulher mais linda do mundo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email da mulher mais linda do mundo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loading || rateLimitSeconds !== null}
            >
              {loading ? "Registrando..." :
                rateLimitSeconds ? `Aguarde ${rateLimitSeconds}s...` :
                  "Criar conta"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Faça login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-8 text-center text-sm text-gray-600">
        Ao criar uma conta, você concorda com nossos{" "}
        <Link to="/terms-of-service" className="font-medium text-primary hover:text-primary/80">
          Termos de Serviço
        </Link>{" "}
        e{" "}
        <Link to="/privacy-policy" className="font-medium text-primary hover:text-primary/80">
          Política de Privacidade
        </Link>
      </p>
    </div>
  );
} 