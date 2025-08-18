
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import DonationStepForm from "@/components/DonationStepForm";
import { ArrowLeft } from "lucide-react";

interface Child {
  id: string;
  name: string;
  age: number;
  location: string;
  image: string;
  dream: string;
  hobby: string;
}

// Lista de crianças (normalmente viria de uma API)
const children: Child[] = [
  {
    id: "1",
    name: "Maria",
    age: 7,
    location: "Minas Gerais",
    image: "https://images.unsplash.com/photo-1594753154778-273013529793?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    dream: "Ser professora",
    hobby: "Desenhar e pintar"
  },
  {
    id: "2",
    name: "João",
    age: 9,
    location: "Bahia",
    image: "https://images.unsplash.com/photo-1597920467799-ee3e909250e1?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    dream: "Ser jogador de futebol",
    hobby: "Jogar futebol com os amigos"
  },
  // ... mais crianças conforme necessário
];

export default function ApadrinhamentoPage() {
  const { childId } = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Apadrinhamento - ChildFund Brasil";
    
    // Buscar dados da criança baseado no ID
    const selectedChild = children.find(c => c.id === childId);
    
    if (selectedChild) {
      setChild(selectedChild);
    } else {
      // Se não encontrar a criança, redirecionar para a página principal de apadrinhamento
      navigate("/sponsor");
    }
  }, [childId, navigate]);

  if (!child) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main 
        className="flex-grow bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="py-12 md:py-16">
          <div className="container">
            <Button 
              variant="outline" 
              className="mb-8 flex items-center gap-2"
              onClick={() => navigate("/sponsor")}
            >
              <ArrowLeft size={16} />
              <span>Voltar para galeria</span>
            </Button>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={child.image} 
                    alt={`${child.name}, ${child.age} anos`}
                    className="w-full h-96 object-cover"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-4">{child.name}, {child.age} anos</h1>
                <p className="text-lg text-gray-600 mb-4">De {child.location}</p>
                
                <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                  <h2 className="font-semibold mb-2">Sobre {child.name}</h2>
                  <p className="mb-4">
                    {child.name} é uma criança {child.age < 8 ? 'alegre' : 'determinada'} que sonha em {child.dream.toLowerCase()}.
                    Seu passatempo favorito é {child.hobby.toLowerCase()}.
                  </p>
                  <p className="text-gray-600">
                    Ao apadrinhar {child.name}, você estará ajudando a realizar seus sonhos
                    e garantindo educação, saúde e proteção para {child.age < 8 ? 'ela' : 'ele'}.
                  </p>
                </div>

                <div className="bg-primary/10 p-6 rounded-xl">
                  <h2 className="font-semibold mb-2">Seu apadrinhamento inclui:</h2>
                  <ul className="space-y-2">
                    <li className="flex gap-2 items-start">
                      <span className="text-primary font-bold">•</span>
                      <span>Contribuição mensal de R$ 120,00</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-primary font-bold">•</span>
                      <span>Acompanhamento do desenvolvimento da criança</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-primary font-bold">•</span>
                      <span>Troca de correspondências e atualizações periódicas</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-primary font-bold">•</span>
                      <span>Suporte contínuo aos programas de desenvolvimento comunitário</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="bg-white shadow-lg rounded-xl p-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Apadrinhar {child.name}</h2>
              <DonationStepForm 
                initialMode="monthly" 
                initialValue={120}
                sponsorData={{
                  childId: child.id,
                  childName: child.name,
                  childAge: child.age,
                  childLocation: child.location,
                  childImage: child.image
                }}
              />
            </motion.div>
          </div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
}
