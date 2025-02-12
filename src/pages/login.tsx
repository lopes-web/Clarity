import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src="/logo.svg" alt="Clarity Logo" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Bem-vindo de volta!</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Faça login para acessar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700">Senha</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-8 text-center text-sm text-gray-600">
        Ao fazer login, você concorda com nossos{" "}
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