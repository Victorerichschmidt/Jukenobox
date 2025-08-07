import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { User, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { login, setStoredUser, type LoginCredentials } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: ""
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setStoredUser(user);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.username}!`
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: "Usuário ou senha incorretos!"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface to-gray-100">
      <div className="w-full max-w-md">
        {/* Logos Container */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <div className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-lg">PLANET</div>
          <div className="bg-secondary text-white px-6 py-3 rounded-lg font-bold text-lg">JUKE</div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl card-hover">
          <CardContent className="pt-6 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary mb-2">Sistema de Gerenciamento</h1>
              <p className="text-textLight">Faça login para acessar o painel administrativo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-primary">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="pl-10"
                    placeholder="Digite seu usuário"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="pl-10"
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-hover"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar no Sistema"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-primary mb-2">Credenciais de Acesso:</h3>
              <p className="text-sm text-textLight">Usuário: <span className="font-mono font-bold">admin</span></p>
              <p className="text-sm text-textLight">Senha: <span className="font-mono font-bold">123456</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
