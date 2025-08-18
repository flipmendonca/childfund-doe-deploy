import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApadrinhamentoForm from "../components/ApadrinhamentoForm";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

export default function DoacaoApadrinhamentoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  // Verificar se há dados de criança nos parâmetros
  const childId = searchParams.get("child");
  const childName = searchParams.get("name");
  const childAge = searchParams.get("age");
  const childLocation = searchParams.get("location");
  const childImage = searchParams.get("image");
  
  const hasChildData = childId && childName && childAge && childImage;

  useEffect(() => {
    document.title = "Apadrinhamento - ChildFund Brasil";
  }, []);

  // Se não há dados de criança, mostrar página de redirecionamento
  if (!hasChildData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <motion.main 
          className="flex-grow bg-gray-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-childfund-yellow/10 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Users className="text-childfund-yellow" size={40} />
                </div>
                <h1 className="text-4xl font-bold mb-4">Apadrinhamento de Crianças</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Crie um vínculo especial com uma criança e acompanhe de perto seu desenvolvimento.
                </p>
              </div>
              
              {/* Informações sobre apadrinhamento */}
              <div className="bg-childfund-yellow/5 border border-childfund-yellow/20 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-childfund-yellow mb-2">Por que escolher uma criança?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-childfund-yellow rounded-full mt-2 flex-shrink-0"></div>
                    <span>Vínculo direto e pessoal com uma criança específica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-childfund-yellow rounded-full mt-2 flex-shrink-0"></div>
                    <span>Acompanhamento do desenvolvimento através de relatórios e fotos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-childfund-yellow rounded-full mt-2 flex-shrink-0"></div>
                    <span>Possibilidade de troca de correspondências</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2" size={18} />
                  Voltar ao início
                </Button>
                
                <Button
                  onClick={() => navigate('/como-apoiar#apadrinhamento')}
                  className="flex-1 bg-childfund-yellow hover:bg-childfund-yellow/90 text-white"
                >
                  <Users className="mr-2" size={18} />
                  Escolher uma criança
                </Button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">
                  Prefere fazer uma doação sem apadrinhar uma criança específica?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/doacao-mensal')}
                    className="flex-1 text-childfund-green border-childfund-green hover:bg-childfund-green/10"
                  >
                    Doação Mensal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/doacao-unica')}
                    className="flex-1 text-childfund-green border-childfund-green hover:bg-childfund-green/10"
                  >
                    Doação Única
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.main>
        
        <Footer />
      </div>
    );
  }

  // Se há dados de criança, mostrar o formulário de apadrinhamento
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main 
        className="flex-grow bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ApadrinhamentoForm />
      </motion.main>
      
      <Footer />
    </div>
  );
}
