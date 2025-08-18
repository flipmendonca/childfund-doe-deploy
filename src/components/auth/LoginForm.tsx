import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatCPF, formatCNPJ } from "../../utils/formatters";
import { loginSchema } from "../../utils/authSchemas";
import { useFormStepTracking } from "../../hooks/useFormStepTracking";

interface LoginFormProps {
  isMockMode?: boolean;
}

export default function LoginForm({ isMockMode = false }: LoginFormProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();

  // Tracking de etapas do RD Station
  const { trackFormCompletion } = useFormStepTracking({
    formType: 'login',
    currentStep: 1,
    totalSteps: 1,
    stepName: 'Login',
    userEmail: '', // Email não disponível no login
    userName: '', // Nome não disponível no login
    userPhone: '', // Telefone não disponível no login
    userState: '',
    userCity: ''
  });

  // Função para detectar o tipo de documento e formatar automaticamente
  const handleDocumentChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    // Detecta se é CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (cleanValue.length <= 11) {
      // Formata como CPF
      const formatted = formatCPF(cleanValue);
      setLogin(formatted);
    } else {
      // Formata como CNPJ
      const formatted = formatCNPJ(cleanValue);
      setLogin(formatted);
    }
  };

  // Função para obter o placeholder baseado no tipo de documento
  const getPlaceholder = () => {
    const cleanValue = login.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return "000.000.000-00";
    } else {
      return "00.000.000/0000-00";
    }
  };

  // Função para obter o label baseado no tipo de documento
  const getDocumentLabel = () => {
    const cleanValue = login.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return "CPF";
    } else {
      return "CNPJ";
    }
  };

  // Função para obter o valor formatado para exibição
  const getFormattedValue = () => {
    const cleanValue = login.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return formatCPF(cleanValue);
    } else {
      return formatCNPJ(cleanValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validar dados com schema Zod apenas no login real
      if (!isMockMode) {
      const validationResult = loginSchema.safeParse({ login, password });
      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        const firstError = errors[0];
        toast({
          title: "Dados inválidos",
          description: firstError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      } else {
        // No modo mockado, apenas validar se os campos não estão vazios
        if (!login.trim() || !password.trim()) {
          toast({
            title: "Dados inválidos",
            description: "Documento e senha são obrigatórios",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Remover formatação do CPF/CNPJ antes de enviar
      const cleanLogin = login.replace(/\D/g, '');
      
      console.log('🔍 [LoginForm] Fazendo login com:');
      console.log('  - cleanLogin:', cleanLogin);
      console.log('  - password:', password ? '***' : 'vazio');
      console.log('  - isMockMode:', isMockMode);
      
      // Fazer login com modo mockado se especificado
      await authLogin(cleanLogin, password, isMockMode);
      
      // Tracking de conclusão do formulário
      trackFormCompletion();
      
      toast({
        title: "Login realizado com sucesso",
        description: isMockMode ? "Bem-vindo ao ambiente de testes!" : "Bem-vindo à sua jornada de impacto!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Documento ou senha incorretos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bem-vindo de volta</h2>
        <p className="text-gray-600">Acesse sua conta para continuar sua jornada de impacto</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login">{getDocumentLabel()}</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FileText size={18} />
            </div>
            <Input
              id="login"
              type="text"
              placeholder={getPlaceholder()}
              className="pl-10"
              value={getFormattedValue()}
              onChange={(e) => handleDocumentChange(e.target.value)}
              maxLength={18}
              required
            />
          </div>
          <p className="text-xs text-gray-500">
            Digite seu CPF ou CNPJ
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Senha</Label>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate("/auth/forgot-password"); }}
              className="text-sm text-primary hover:underline"
            >
              Esqueceu a senha?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Lock size={18} />
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full py-6 bg-[#2C9B44] hover:bg-[#238336] text-white font-bold"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Entrando...
            </span>
          ) : (
            <span className="flex items-center">
              Entrar <ArrowRight size={18} className="ml-2" />
            </span>
          )}
        </Button>
        
        {/* Botão de teste DSO direto */}
        {/* Removido conforme solicitado */}
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Ainda não tem uma conta?{" "}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate("/auth/register"); }}
            className="text-primary font-medium hover:underline"
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}
