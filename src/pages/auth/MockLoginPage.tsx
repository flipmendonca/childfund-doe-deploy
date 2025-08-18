import { useEffect } from "react";
import LoginForm from "../../components/auth/LoginForm";
import { Link } from "react-router-dom";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Users, TestTube } from "lucide-react";

export default function MockLoginPage() {
  useEffect(() => {
    // Set page title
    document.title = "Login Mockado - ChildFund Brasil (DEV)";
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side: Image */}
        <div className="hidden md:flex md:w-1/2 bg-primary">
          <div className="relative w-full h-full">
            <img 
              src="/images/Foto-Jake_Lyell-116-1-1.webp" 
              alt="Crianças sorridentes" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Right side: Form */}
        <div className="flex flex-col w-full md:w-1/2 items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-8">
              <img src="/logo-cor.png" alt="ChildFund Brasil" className="h-16 max-h-16 w-auto" />
            </div>
            
            {/* Alert de ambiente de desenvolvimento */}
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <TestTube className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Ambiente de Desenvolvimento</strong><br />
                Esta página usa dados mockados para testes e prototipagem.
              </AlertDescription>
            </Alert>

            <LoginForm isMockMode={true} />
            
            {/* Informações sobre usuários mockados */}
            <Card className="mt-6 border-dashed border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usuários de Teste Disponíveis
                </CardTitle>
                <CardDescription className="text-xs">
                  Use qualquer CPF e senha da lista abaixo para testar diferentes cenários
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Padrinho:</span>
                    <Badge variant="outline" className="text-xs">CPF: 11122233344</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Guardião:</span>
                    <Badge variant="outline" className="text-xs">CPF: 22233344455</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Doação Única:</span>
                    <Badge variant="outline" className="text-xs">CPF: 33344455566</Badge>
                  </div>
                  <div className="text-gray-500 mt-2">
                    <Info className="h-3 w-3 inline mr-1" />
                    Senha para todos: <code className="bg-gray-100 px-1 rounded">Teste123!</code>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-6">
              <Link to="/" className="flex items-center text-[#2C9B44] hover:underline text-sm font-medium w-fit">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Voltar para a Home
              </Link>
            </div>
            
            <div className="text-center mt-4">
              <Link to="/auth/login" className="text-xs text-gray-500 hover:text-gray-700">
                Acessar login real →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 