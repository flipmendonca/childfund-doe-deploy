import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authService } from "../../services/authService";
import { sendEmailResetSchema } from "../../utils/authSchemas";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = "Recuperar Senha - ChildFund Brasil";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // Validar email com schema Zod
      const validationResult = sendEmailResetSchema.safeParse({ email });
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        const firstError = errors[0];
        
        toast({
          title: "Email inválido",
          description: firstError.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Verificar se estamos em desenvolvimento
      const isDevelopment = import.meta.env.VITE_APP_MODE === 'development' || !import.meta.env.VITE_APP_MODE;
      
      if (isDevelopment) {
        // Em desenvolvimento, simular envio
        setTimeout(() => {
          setSubmitted(true);
          setIsSubmitting(false);
          
          toast({
            title: "E-mail enviado",
            description: "Verifique sua caixa de entrada para redefinir sua senha.",
          });
        }, 1500);
      } else {
        // Em produção, usar API DSO
        const response = await authService.forgotPassword({ email });
        
        if (response.success) {
          setSubmitted(true);
          setIsSubmitting(false);
          
          toast({
            title: "E-mail enviado",
            description: "Verifique sua caixa de entrada para redefinir sua senha.",
          });
        } else {
          throw new Error(response.message || 'Erro ao enviar email');
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar email",
        description: error instanceof Error ? error.message : "Houve um problema ao enviar o email. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side: Image */}
        <div className="hidden md:flex md:w-1/2 bg-primary">
          <div className="relative w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1477332552946-cfb384aeaf1c?auto=format&fit=crop&w=2000&q=80" 
              alt="Criança sorridente" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-8 text-white">
              <h1 className="text-3xl font-bold mb-4">Recupere sua senha</h1>
              <p className="text-lg max-w-md">Ajudaremos você a acessar sua conta para que possa continuar sua jornada de impacto.</p>
            </div>
          </div>
        </div>
        
        {/* Right side: Form */}
        <div className="flex flex-col w-full md:w-1/2 items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">CF</span>
              </div>
              <span className="font-bold text-xl">ChildFund Brasil</span>
            </Link>
            
            <div className="bg-white p-8 rounded-lg shadow-md w-full">
              {!submitted ? (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Esqueceu sua senha?</h2>
                    <p className="text-gray-600">Digite seu e-mail e enviaremos instruções para redefinir sua senha.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-mail
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                          <Mail size={18} />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full py-6 bg-primary text-white hover:bg-primary-hover"
                      disabled={isSubmitting || !email}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </span>
                      ) : (
                        'Enviar instruções'
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">E-mail enviado!</h2>
                  <p className="text-gray-600 mb-6">
                    Enviamos instruções para redefinir sua senha para {email}. Verifique sua caixa de entrada e siga as instruções.
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Não recebeu o email? Verifique sua caixa de spam ou solicite outro email.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setSubmitted(false)}
                  >
                    Reenviar instruções
                  </Button>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm text-primary hover:text-primary-hover"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Voltar para o login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
