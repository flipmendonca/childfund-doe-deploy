import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Lock, ArrowRight, X, CreditCard, User, UserPlus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatCPF, formatCNPJ } from "../../utils/formatters";
import { loginSchema } from "../../utils/authSchemas";
import { useNavigate } from "react-router-dom";

interface DebitLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function DebitLoginModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}: DebitLoginModalProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterOption, setShowRegisterOption] = useState(false);
  const { toast } = useToast();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  // Função para detectar o tipo de documento e formatar automaticamente
  const handleDocumentChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    // Detecta se é CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (cleanValue.length <= 11) {
      const formatted = formatCPF(cleanValue);
      setLogin(formatted);
    } else {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validar dados com schema Zod
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
      
      // Remover formatação do CPF/CNPJ antes de enviar
      const cleanLogin = login.replace(/\D/g, '');
      
      console.log('🔍 [DebitLoginModal] Fazendo login para débito automático');
      
      // Fazer login
      await authLogin(cleanLogin, password, false);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Agora você pode prosseguir com o débito automático!",
      });

      // Fechar modal e executar callback de sucesso
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
    } catch (error) {
      console.error('Erro no login para débito:', error);
      
      // Se for erro de usuário não encontrado, mostrar opção de cadastro
      if (error instanceof Error && 
          (error.message.includes('não encontrado') || 
           error.message.includes('not found') ||
           error.message.includes('Documento ou senha incorretos'))) {
        setShowRegisterOption(true);
        toast({
          title: "Usuário não encontrado",
          description: "Parece que você ainda não tem cadastro. Gostaria de se cadastrar?",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao fazer login",
          description: error instanceof Error ? error.message : "Documento ou senha incorretos. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToRegister = () => {
    onClose();
    navigate('/auth/register');
  };

  const handleBackToCredit = () => {
    onClose();
    toast({
      title: "Método alterado",
      description: "Você pode prosseguir com cartão de crédito sem necessidade de login.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-childfund-green/20 bg-childfund-green/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-childfund-green/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-childfund-green" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-childfund-green">
                Login Necessário
              </h2>
              <p className="text-sm text-gray-600">
                Débito automático requer autenticação
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Explicação */}
          <div className="mb-6 p-4 bg-childfund-green/5 rounded-lg border border-childfund-green/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-childfund-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4 text-childfund-green" />
              </div>
              <div className="text-sm">
                <p className="text-childfund-green font-medium mb-1">
                  Por que preciso fazer login?
                </p>
                <p className="text-gray-700">
                  O débito automático requer autenticação por questões de segurança. 
                  Após o login, você poderá configurar a cobrança mensal em sua conta bancária.
                </p>
              </div>
            </div>
          </div>

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="login" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4" />
                {getDocumentLabel()}
              </Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => handleDocumentChange(e.target.value)}
                placeholder={getPlaceholder()}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="mt-1"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !login || !password}
              className="w-full bg-childfund-green hover:bg-childfund-green/90 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Fazendo login...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Entrar e continuar
                </div>
              )}
            </Button>
          </form>

          {/* Opções alternativas */}
          <div className="mt-6 space-y-4">
            {/* Opção de cadastro (aparece após erro de usuário não encontrado) */}
            {showRegisterOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-childfund-orange/10 rounded-lg border border-childfund-orange/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <UserPlus className="w-5 h-5 text-childfund-orange" />
                  <span className="text-sm font-medium text-childfund-orange">
                    Usuário não encontrado!
                  </span>
                </div>
                <Button
                  onClick={handleGoToRegister}
                  className="w-full bg-childfund-orange hover:bg-childfund-orange/90 text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Criar conta gratuitamente
                </Button>
              </motion.div>
            )}

            {/* CTA Permanente para Cadastro */}
            {!showRegisterOption && (
              <div className="p-4 bg-childfund-orange/5 rounded-lg border border-childfund-orange/20">
                <div className="text-center mb-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Ainda não tem uma conta?
                  </p>
                  <Button
                    onClick={handleGoToRegister}
                    className="w-full bg-childfund-yellow hover:bg-childfund-yellow/90 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Cadastre-se gratuitamente
                  </Button>
                </div>
              </div>
            )}

            {/* Links de ação */}
            <div className="flex flex-col gap-3">
              {/* Esqueci minha senha - CTA destacado */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/auth/forgot-password');
                }}
                className="w-full py-2 px-4 text-sm text-childfund-green hover:bg-childfund-green/10 rounded-lg border border-childfund-green/30 transition-colors font-medium"
              >
                Esqueci minha senha
              </button>

              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Opção de voltar ao cartão */}
              <Button
                onClick={handleBackToCredit}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Usar cartão de crédito sem login
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
