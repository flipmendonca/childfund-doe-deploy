import { useEffect } from "react";
import LoginForm from "../../components/auth/LoginForm";
import { Link } from "react-router-dom";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, ArrowRight } from "lucide-react";

export default function LoginPage() {
  useEffect(() => {
    // Set page title
    document.title = "Login - ChildFund Brasil";
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
            <LoginForm />
            
            {/* Botão para acesso ao login mockado */}
            <Card className="mt-6 border-dashed border-orange-300 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <TestTube className="h-4 w-4" />
                  Ambiente de Desenvolvimento
                </CardTitle>
                <CardDescription className="text-xs text-orange-600">
                  Acesse dados mockados para testes e prototipagem
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Link to="/auth/mock-login" className="flex items-center justify-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Acessar Login Mockado
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-6">
              <Link to="/" className="flex items-center text-[#2C9B44] hover:underline text-sm font-medium w-fit">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Voltar para a Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
