
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Child {
  id: string;
  name: string;
  age: number;
  location: string;
  image: string;
  dream: string;
  hobby: string;
}

export default function ChildrenGallery() {
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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
    {
      id: "3",
      name: "Ana",
      age: 6,
      location: "São Paulo",
      image: "https://images.unsplash.com/photo-1602734846297-9299fc2d4703?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      dream: "Ser médica",
      hobby: "Ler histórias"
    },
    {
      id: "4",
      name: "Pedro",
      age: 8,
      location: "Pernambuco",
      image: "https://images.unsplash.com/photo-1600880291319-1a7499c191e8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      dream: "Ser engenheiro",
      hobby: "Montar quebra-cabeças"
    },
    {
      id: "5",
      name: "Luiza",
      age: 10,
      location: "Rio de Janeiro",
      image: "https://images.unsplash.com/photo-1516633630673-67bbad747022?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      dream: "Ser cantora",
      hobby: "Cantar e dançar"
    },
    {
      id: "6",
      name: "Gabriel",
      age: 7,
      location: "Ceará",
      image: "https://images.unsplash.com/photo-1593604572577-1c6c44fa246c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      dream: "Ser astronauta",
      hobby: "Observar as estrelas"
    },
    {
      id: "7",
      name: "Beatriz",
      age: 9,
      location: "Goiás",
      image: "https://images.unsplash.com/photo-1595678776050-81592f8c3a36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      dream: "Ser escritora",
      hobby: "Escrever histórias"
    },
    {
      id: "8",
      name: "Miguel",
      age: 6,
      location: "Maranhão",
      image: "https://images.unsplash.com/photo-1591348278999-ee1c65a2c416?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      dream: "Ser veterinário",
      hobby: "Cuidar de animais"
    }
  ];

  const scrollGallery = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const scrollPosition = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleFlip = (childId: string) => {
    if (flippedCard === childId) {
      setFlippedCard(null);
    } else {
      setFlippedCard(childId);
    }
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Conheça Algumas Crianças</h2>
          <p className="text-gray-600 mb-8">Cada criança tem uma história única e um sonho especial. Você pode fazer parte dessa jornada através do apadrinhamento.</p>
        </div>

        <div className="relative">
          {/* Desktop/Tablet Navigation Controls */}
          <div className="hidden md:block">
            <button 
              onClick={() => scrollGallery('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-50"
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={() => scrollGallery('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-50"
              aria-label="Rolar para a direita"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Gallery */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-5 pb-6 hide-scrollbar snap-x"
          >
            {children.map((child) => (
              <div 
                key={child.id}
                className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 snap-start"
              >
                <div 
                  className={`children-card cursor-pointer h-96 perspective-1000 ${flippedCard === child.id ? 'rotate-y-180' : ''}`}
                  onClick={() => toggleFlip(child.id)}
                  role="button"
                  aria-label={`Ver detalhes de ${child.name}`}
                >
                  <div className={`w-full h-full transition-all duration-500 transform-style-3d relative ${flippedCard === child.id ? 'rotate-y-180 absolute' : ''}`}>
                    {/* Front of card */}
                    <div className={`w-full h-full backface-hidden ${flippedCard === child.id ? 'invisible' : ''}`}>
                      <img 
                        src={child.image} 
                        alt={`${child.name}, ${child.age} anos, ${child.location}`} 
                        className="w-full h-56 object-cover"
                        loading="lazy"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-xl mb-1">{child.name}, {child.age}</h3>
                        <p className="text-gray-600 mb-4">{child.location}</p>
                        <p className="text-sm text-gray-500 mb-2">Clique para conhecer mais</p>
                      </div>
                    </div>
                    
                    {/* Back of card */}
                    <div className={`absolute w-full h-full backface-hidden bg-primary text-white p-6 flex flex-col justify-between rotate-y-180 rounded-lg ${flippedCard === child.id ? 'visible' : 'invisible'}`}>
                      <div>
                        <h3 className="font-bold text-xl mb-4">Sobre {child.name}</h3>
                        <p className="mb-3"><strong>Idade:</strong> {child.age} anos</p>
                        <p className="mb-3"><strong>Região:</strong> {child.location}</p>
                        <p className="mb-3"><strong>Sonho:</strong> {child.dream}</p>
                        <p className="mb-6"><strong>Gosta de:</strong> {child.hobby}</p>
                      </div>
                      
                      <div>
                        <Link to={`/sponsor/${child.id}`}>
                          <Button className="w-full bg-white text-primary hover:bg-gray-100">
                            Apadrinhar {child.name}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/sponsor" className="btn-primary">
              Ver Todas as Crianças
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
