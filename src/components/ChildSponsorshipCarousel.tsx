import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Heart, MapPin, Filter, Shuffle, BookOpen, Utensils, Stethoscope, Shirt, Music, Smile, ChevronLeft, ChevronRight, GraduationCap, Users, Shield, Home, AlertCircle, RefreshCw, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Child } from "../types/Child";
import ChildDetailPanel from "./ChildDetailPanel";
import { useSwipeable } from 'react-swipeable';
import { useDSOChildrenData } from "../hooks/useDSOChildrenData";

// Componente agora usa DSO conforme documentação
// Fallback para Dynamics CRM se DSO não estiver disponível

const BG_COLOR = "#E6F4EF";
const EMOJI_MAP: Record<string, JSX.Element> = {
  "Apoio educacional": <BookOpen className="inline text-childfund-green" size={18} />, 
  "Apoio nutricional": <Utensils className="inline text-childfund-yellow" size={18} />, 
  "Acompanhamento escolar": <GraduationCap className="inline text-childfund-blue" size={18} />,
  "Desenvolvimento artístico": <Music className="inline text-childfund-yellow" size={18} />,
  "Cuidados de saúde": <Stethoscope className="inline text-childfund-green" size={18} />,
  "Suporte familiar": <Users className="inline text-childfund-blue" size={18} />,
  "Proteção e segurança": <Shield className="inline text-childfund-green" size={18} />,
  "Melhoria habitacional": <Home className="inline text-childfund-yellow" size={18} />,
  "Desenvolvimento social": <Smile className="inline text-childfund-blue" size={18} />,
};

function getNeedIcon(need: string) {
  return EMOJI_MAP[need] || <Smile className="inline text-childfund-green" size={18} />;
}

function getEmotionalBadge() {
  const badges = [
    "Aguardando um padrinho especial",
    "Pronto para viver uma nova história com você",
    "Esperando por um novo começo",
    "Seu carinho pode mudar tudo"
  ];
  return badges[Math.floor(Math.random() * badges.length)];
}

// Função para embaralhar array (algoritmo Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ChildSponsorshipCarousel() {
  // Memoizar filtros para evitar re-renders desnecessários
  const filters = useMemo(() => ({}), []);

  // Hook para buscar dados do DSO (conforme documentação)
  const {
    children: dsoChildren,
    loading: dsoLoading,
    error: dsoError,
    refetch: refetchDSO,
    loadMore,
    hasMore,
    isDSOAvailable
  } = useDSOChildrenData({
    filters,
    autoLoad: true,
    pageSize: 50
  });

  const [shuffleKey, setShuffleKey] = useState(0); // Para forçar reembaralhamento

  // Usar dados reais do DSO - SEM FALLBACK PARA MOCK
  const availableChildren = useMemo(() => {
    console.log('🔍 DSO: dsoChildren.length =', dsoChildren.length);
    
    // Se não há dados do DSO, retornar array vazio
    if (dsoChildren.length === 0) {
      console.log('🔍 Carrossel: Nenhuma criança disponível do DSO');
      return [];
    }
    
    // Aplicar aleatoriedade no frontend para variar a exibição
    const shuffledChildren = shuffleArray(dsoChildren);
    console.log('🔍 Carrossel: availableChildren.length =', shuffledChildren.length);
    return shuffledChildren;
  }, [dsoChildren, shuffleKey]);
  
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  
  const [genderFilter, setGenderFilter] = useState<"all" | "female" | "male">("all");
  const [nameFilter, setNameFilter] = useState<string>("all");
  const [startIndex, setStartIndex] = useState(0); // desktop pagination
  const [selectedIndex, setSelectedIndex] = useState(0); // mobile selection
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Gerar lista de nomes únicos para o filtro, considerando o filtro de gênero atual
  const nameOptions = useMemo(() => {
    let filtered = availableChildren;
    if (genderFilter === 'female') {
      filtered = filtered.filter(child => child.gender === 'F');
    } else if (genderFilter === 'male') {
      filtered = filtered.filter(child => child.gender === 'M');
    }
    const nomes = Array.from(new Set(filtered.map(child => child.name)));
    return ['all', ...nomes];
  }, [availableChildren, genderFilter]);

  // Se o nome selecionado não existir mais para o gênero filtrado, resetar para 'all'
  useEffect(() => {
    if (nameFilter !== 'all' && !nameOptions.includes(nameFilter)) {
      setNameFilter('all');
    }
  }, [nameOptions, nameFilter]);

  // Definir criança selecionada inicial após carregar crianças disponíveis
  // useEffect(() => {
  //   if (availableChildren.length > 0) {
  //     // Sempre selecionar a primeira criança do array embaralhado
  //     const firstChild = availableChildren[0];
  //     setSelectedChild(firstChild);
  //     console.log('🔍 SELECÇÃO AUTOMÁTICA: Primeira criança selecionada:', {
  //       name: firstChild.name,
  //       id: firstChild.id,
  //       position: 'primeira do carrossel'
  //     });
  //   }
  // }, [availableChildren]); // Remover selectedChild da dependência para evitar loops

  // Contador de filtros ativos
  const filtrosAtivos = (genderFilter !== 'all' ? 1 : 0) + (nameFilter !== 'all' ? 1 : 0);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSelectedIndex(0);
    }
  }, [genderFilter, nameFilter, isMobile]);

  // Log para depuração do array de crianças disponíveis
  console.log('🔍 TESTE SEM FILTROS - availableChildren:', availableChildren);
  console.log('🔍 TESTE SEM FILTROS - Tamanho do array:', availableChildren.length);

  // Filtrar crianças baseado nos filtros selecionados
  const filteredChildren = availableChildren.filter(child => {
    // Filtro de gênero: compara com 'M' ou 'F'
    const genderMatch = genderFilter === 'all' ||
      (genderFilter === 'female' && child.gender === 'F') ||
      (genderFilter === 'male' && child.gender === 'M');
    // Filtro de nome: compara com o primeiro nome
    const nameMatch = nameFilter === 'all' || child.name === nameFilter;
    return genderMatch && nameMatch;
  });

  // Garantir que a primeira criança filtrada seja selecionada APENAS na inicialização
  useEffect(() => {
    if (filteredChildren.length > 0 && !selectedChild) {
      const firstFilteredChild = filteredChildren[0];
      console.log('🔍 DEBUG: Inicialização - selecionando primeira criança:', firstFilteredChild.name);
      setSelectedChild(firstFilteredChild);
    }
  }, [filteredChildren]); // Só executa quando filteredChildren muda E selectedChild é null

  // Resetar seleção se a criança selecionada não estiver mais na lista filtrada
  useEffect(() => {
    if (selectedChild && filteredChildren.length > 0) {
      const isSelectedChildInFiltered = filteredChildren.some(child => child.id === selectedChild.id);
      if (!isSelectedChildInFiltered) {
        console.log('🔍 DEBUG: Criança selecionada não está mais na lista filtrada, resetando para primeira');
        setSelectedChild(filteredChildren[0]);
      }
    }
  }, [filteredChildren, selectedChild]);

  // Log para depuração
  console.log('🔍 TESTE SEM FILTROS - filteredChildren (sem filtros):', filteredChildren);
  console.log('🔍 TESTE SEM FILTROS - Tamanho após "filtragem":', filteredChildren.length);
  console.log('🔍 TESTE SEM FILTROS - Crianças disponíveis para apadrinhamento:', filteredChildren.map(child => ({
    id: child.id,
    name: child.name,
    statuscode: child.statuscode,
    statecode: child.statecode
  })));

  // Exibir apenas 1 criança por vez no mobile, 5 no desktop
  const visibleChildren = isMobile
    ? filteredChildren.slice(startIndex, startIndex + 1)
    : filteredChildren.slice(startIndex, startIndex + 5);

  function scrollLeft() {
    if (isMobile) {
      if (startIndex > 0) setStartIndex(startIndex - 1);
    } else {
      if (startIndex > 0) setStartIndex(startIndex - 1);
    }
  }
  function scrollRight() {
    if (isMobile) {
      if (startIndex < filteredChildren.length - 1) setStartIndex(startIndex + 1);
    } else {
      if (startIndex + 5 < filteredChildren.length) setStartIndex(startIndex + 1);
    }
  }

  // Swipe handlers para mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setStartIndex((prev) => (prev + 1) % filteredChildren.length),
    onSwipedRight: () => setStartIndex((prev) => (prev - 1 + filteredChildren.length) % filteredChildren.length),
    trackMouse: true,
  });

  const getIconForNeed = (need: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Educação": <BookOpen className="inline text-childfund-green" size={18} />,
      "Saúde": <Heart className="inline text-childfund-green" size={18} />,
      "Apoio nutricional": <Utensils className="inline text-childfund-yellow" size={18} />,
      "Proteção": <Shield className="inline text-childfund-green" size={18} />,
      "Desenvolvimento social": <Users className="inline text-childfund-green" size={18} />,
    };
    return iconMap[need] || <Star className="inline text-childfund-green" size={18} />;
  };

  // Função para selecionar criança aleatória
  const selectRandomChild = () => {
    if (filteredChildren.length === 0) {
      console.log('🔍 Carrossel: Nenhuma criança disponível para seleção aleatória');
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredChildren.length);
    const randomChild = filteredChildren[randomIndex];
    
    console.log('🔍 Carrossel: Seleção aleatória:', {
      totalCriancas: filteredChildren.length,
      indiceSelecionado: randomIndex,
      criancaSelecionada: randomChild.name,
      id: randomChild.id
    });

    if (isMobile) {
      setSelectedIndex(randomIndex);
    } else {
      setSelectedChild(randomChild);
      // Ajustar o índice de início para mostrar a criança selecionada
      const newStartIndex = Math.max(0, Math.min(randomIndex, filteredChildren.length - 5));
      setStartIndex(newStartIndex);
    }
  };

  // Função para reembaralhar os dados
  const reshuffleData = () => {
    console.log('🔍 REEMBARALHAMENTO: Forçando novo embaralhamento dos dados');
    setShuffleKey(prev => prev + 1);
    setStartIndex(0); // Resetar para o início
    // Não resetar selectedChild aqui - o useEffect fará a seleção automática
  };

  return (
    <div className="py-16 bg-[#F6FDFB]">
      <div className="container max-w-7xl mx-auto">
        {/* Seção explicativa sobre Apadrinhamento */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-lg border border-[#3CC387]/20">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#007A45] mb-6 leading-tight">
                O que é o <span className="text-[#FE7130]">Apadrinhamento</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#666666] leading-relaxed max-w-4xl mx-auto">
                Apadrinhar uma criança é criar um laço de afeto e esperança. Ao apadrinhar uma criança, você acompanha de perto seu crescimento, suas conquistas e desafios e vê, de forma concreta, como sua contribuição transforma uma vida para sempre.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/images/Foto- Jake_Lyell_3.webp"
                  alt="Criança apadrinhada do ChildFund Brasil"
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                />
              </div>
              <div className="space-y-6">
                
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-[#FE7130]">
                    Benefícios do Apadrinhamento:
                  </h4>
                  <ul className="space-y-3 text-[#666666]">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#FE7130] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Vínculo único com uma criança</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#FE7130] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Acompanhamento regular do desenvolvimento</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#FE7130] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Troca de correspondências e fotos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#FE7130] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Relatórios detalhados sobre o impacto da sua ajuda</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-[#007A45]">
                    O que sua contribuição proporciona:
                  </h4>
                  <ul className="space-y-3 text-[#666666]">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#007A45] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Acesso à educação de qualidade</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#007A45] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Cuidados de saúde e nutrição adequada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#007A45] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Desenvolvimento de habilidades e talentos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#007A45] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Proteção e segurança</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold mb-4 text-[#007A45]">Escolha uma criança para apadrinhar</h3>
          <p className="text-[#666666] max-w-2xl mx-auto mb-3">
            Cada criança tem uma história única e sonhos para o futuro. Escolha quem você gostaria de acompanhar nesta jornada de transformação.
          </p>
          
          {/* Status de carregamento e controles */}
          <div className="flex flex-col items-center gap-3 mb-4">
            {dsoLoading && (
              <div className="flex items-center gap-2 text-[#007A45]">
                <RefreshCw size={16} className="animate-spin" />
                <span className="text-sm">Carregando crianças do sistema...</span>
              </div>
            )}
            
            {dsoError && (
              <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 rounded-lg">
                <AlertCircle size={16} />
                <span className="text-sm">Falha na conexão com sistema</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    refetchDSO();
                  }}
                  className="ml-2 text-xs h-6"
                >
                  Reconectar
                </Button>
              </div>
            )}
            

          </div>
        </motion.div>

        {/* Filtros alinhados */}
        <motion.div className="mb-8">
          <div className="bg-[#FFF8EC] rounded-2xl p-6 border border-[#3CC387]/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
              <div className="flex items-center gap-2 mb-2 md:mb-0">
                <Filter className="text-[#007A45]" size={20} />
                <span className="font-semibold text-[#007A45]">
                  Filtros{filtrosAtivos > 0 && (
                    <span className="ml-1 text-xs bg-childfund-green text-white rounded-full px-2 py-0.5 align-middle">{filtrosAtivos}</span>
                  )}
                  <span className="ml-1">▾</span>
                </span>
                {filtrosAtivos > 0 && (
                  <button
                    className="ml-2 text-[#FE7130] text-xs font-bold hover:underline"
                    onClick={() => { setGenderFilter('all'); setNameFilter('all'); }}
                    title="Limpar filtros"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-4 w-full md:flex-row md:gap-4 md:flex-1">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#007A45] mb-2">Filtrar por sexo</label>
                  <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value as "all" | "female" | "male")}>
                    <SelectTrigger className="w-full bg-white/80 border-[#3CC387]/20">
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#007A45] mb-2">Filtrar por nome</label>
                  <Select value={nameFilter} onValueChange={setNameFilter}>
                    <SelectTrigger className="w-full bg-white/80 border-[#3CC387]/20">
                      <SelectValue placeholder="Selecione pelo nome" />
                    </SelectTrigger>
                    <SelectContent>
                      {nameOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option === 'all' ? 'Todos os nomes' : option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Botão ocupa 100% no mobile, ao lado dos filtros no desktop */}
              <div className="w-full md:w-auto md:self-end flex gap-2">
                <Button
                  onClick={selectRandomChild}
                  className="bg-[#FE7130] hover:bg-[#FE7130]/90 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <Shuffle className="mr-2" size={18} />
                  Escolha do ChildFund
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Carrossel de crianças - só exibe no desktop */}
        {!isMobile && (
          <div className="w-full max-w-7xl mx-auto flex items-center gap-4 justify-center overflow-hidden">
            {/* Seta esquerda */}
            <button
              onClick={scrollLeft}
              aria-label="Anterior"
              disabled={startIndex === 0}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#FE7E42] shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
              style={{ minWidth: 40, minHeight: 40 }}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            {/* Carrossel de crianças */}
            <div className="relative flex-1 overflow-hidden">
              <div className="flex gap-4 px-2 py-4 items-center justify-center w-full">
                {filteredChildren.slice(startIndex, startIndex + 5).map((child, idx) => (
                  <motion.div
                    key={child.id}
                    className={`transition-all duration-300 w-[75vw] max-w-[280px] md:w-[200px] md:max-w-[220px] md:h-[260px] flex-shrink-0 rounded-2xl border-0 cursor-pointer ${selectedChild?.id === child.id ? 'bg-white z-20 border-2 border-[#FE7130] text-[#007A45]' : 'bg-white text-[#007A45] hover:border-[#FE7130]'}`}
                    onClick={() => {
                      console.log('🔍 DEBUG: Clicou na criança:', child.name, 'ID:', child.id);
                      console.log('🔍 DEBUG: selectedChild antes do click:', selectedChild?.name, selectedChild?.id);
                      setSelectedChild(child);
                      console.log('🔍 DEBUG: setSelectedChild chamado com:', child.name, child.id);
                    }}
                    layout={false}
                    style={{ minWidth: 0 }}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`relative w-full aspect-[5/6] overflow-hidden rounded-t-2xl h-[180px] md:h-[220px]`}>
                        <img 
                          src={child.image} 
                          alt={child.name} 
                          className="w-full h-full object-cover object-center rounded-t-2xl" 
                        />
                      </div>
                      <div className="p-3 md:p-4 flex flex-col gap-1 min-h-[80px]">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-base md:text-lg font-bold text-[#007A45] break-words max-w-[70%]">{child.name}</h4>
                          <span className="font-medium text-xs md:text-sm text-[#666666] whitespace-nowrap">{child.age} anos</span>
                        </div>
                        <span className="flex items-center gap-1 text-[#666666] text-xs break-words max-w-full"><MapPin size={12} className="text-[#3CC387]" />{child.location}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Seta direita */}
            <button
              onClick={scrollRight}
              aria-label="Próximo"
              disabled={startIndex + 5 >= filteredChildren.length}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#FE7E42] shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
              style={{ minWidth: 40, minHeight: 40 }}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        )}

        {/* Mensagem quando não há crianças disponíveis */}
        {filteredChildren.length === 0 && !dsoLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            {dsoError ? (
              <div className="space-y-4">
                <div className="text-[#FE7130] text-lg mb-4">
                  Não foi possível conectar com o sistema de apadrinhamento
                </div>
                <div className="text-[#666666] text-sm mb-4">
                  {dsoError}
                </div>
                <Button 
                  onClick={() => refetchDSO()}
                  className="bg-[#007A45] hover:bg-[#007A45]/90 text-white"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Tentar Conectar Novamente
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-[#666666] text-lg mb-4">
                  {genderFilter !== 'all' || nameFilter !== 'all' 
                    ? 'Nenhuma criança encontrada com os filtros selecionados'
                    : 'Nenhuma criança disponível para apadrinhamento no momento'
                  }
                </div>
                {(genderFilter !== 'all' || nameFilter !== 'all') && (
                  <Button 
                    onClick={() => {
                      setGenderFilter("all");
                      setNameFilter("all");
                    }}
                    variant="outline"
                    className="border-[#007A45] text-[#007A45] hover:bg-[#007A45] hover:text-white"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Loading state */}
        {dsoLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007A45]"></div>
              <div className="text-[#007A45] text-lg">
                Conectando com o sistema de apadrinhamento...
              </div>
            </div>
          </motion.div>
        )}

        {/* Mensagem quando não há crianças disponíveis */}
        {!dsoLoading && !dsoError && availableChildren.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="text-[#007A45] text-lg font-medium">
                Nenhuma criança disponível no momento
              </div>
              <div className="text-gray-600 text-sm max-w-md">
                Não há crianças disponíveis para apadrinhamento no sistema DSO. 
                Tente novamente mais tarde ou entre em contato conosco.
              </div>
              <Button
                onClick={() => refetchDSO()}
                className="bg-[#007A45] hover:bg-[#007A45]/90 text-white"
              >
                Tentar Novamente
              </Button>
            </div>
          </motion.div>
        )}

        {/* Preview/Detalhe da criança selecionada - no mobile, filtros e setas controlam este componente */}
        {isMobile ? (
          <div className="flex flex-col items-center">
            {/* Setas de navegação mobile */}
            <div className="flex items-center justify-center w-full max-w-[320px] mb-2 gap-4">
              <button
                onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Anterior"
                disabled={selectedIndex === 0}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#FE7E42] shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                onClick={() => setSelectedIndex((prev) => Math.min(filteredChildren.length - 1, prev + 1))}
                aria-label="Próximo"
                disabled={selectedIndex === filteredChildren.length - 1}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#FE7E42] shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </div>
            {/* Carrossel mobile: 3 crianças, centralizando a do meio */}
            {filteredChildren.length > 0 && (
              <div className="w-full flex flex-col items-center mb-2">
                <div className="flex gap-2 justify-center w-full overflow-hidden px-4">
                  {(() => {
                    // Calcular a janela de 3 crianças centralizando a selecionada
                    let start = 0;
                    if (filteredChildren.length > 3) {
                      if (selectedIndex === 0) start = 0;
                      else if (selectedIndex === filteredChildren.length - 1) start = filteredChildren.length - 3;
                      else start = selectedIndex - 1;
                    }
                    return filteredChildren.slice(start, start + 3).map((child, idx) => {
                      const realIdx = start + idx;
                      const isCenter = realIdx === selectedIndex;
                      return (
                        <div
                          key={child.id}
                          className={`flex flex-col items-center justify-center bg-white rounded-2xl border transition-all duration-200 w-[90px] min-w-[90px] max-w-[95px] p-2 shadow-sm ${isCenter ? 'border-[#FE7E42] shadow-lg z-10' : 'border-[#E6F4EF] z-0'}`}
                          style={{ cursor: isCenter ? 'default' : 'pointer' }}
                          onClick={() => setSelectedIndex(realIdx)}
                        >
                          <div className="w-[70px] h-[84px] rounded-2xl overflow-hidden mb-2 border border-[#E6F4EF] bg-[#F6FDFB] flex items-center justify-center">
                            <img src={child.image} alt={child.name} className="w-full h-full object-cover object-center rounded-2xl" />
                          </div>
                          <div className="text-xs font-bold text-[#007A45] text-center break-words leading-tight">{child.name}</div>
                          <div className="text-[10px] text-[#666] text-center">{child.age} anos</div>
                          <div className="text-[10px] text-[#666] text-center truncate max-w-[80px]">{child.location}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            {/* Dots de navegação */}
            <div className="flex items-center justify-center mb-4 px-2 w-full">
              <div className="flex gap-1.5 justify-center flex-wrap max-w-[280px]">
                {filteredChildren.map((child, idx) => (
                  <span
                    key={`dot-${child.id}`}
                    className={`w-2.5 h-2.5 rounded-full border border-[#FE7E42] transition-all duration-200 flex-shrink-0 ${idx === selectedIndex ? 'bg-[#FE7E42]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>
            {/* Painel de detalhes da criança */}
            {filteredChildren[selectedIndex] && (
              <ChildDetailPanel 
                child={filteredChildren[selectedIndex]}
                onSwipeLeft={() => {
                  if (selectedIndex < filteredChildren.length - 1) setSelectedIndex(selectedIndex + 1);
                }}
                onSwipeRight={() => {
                  if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
                }}
              />
            )}
          </div>
        ) : (
          // Desktop: painel de detalhes da criança selecionada
          selectedChild && (
            <>
              {console.log('🔍 DEBUG: Renderizando ChildDetailPanel com selectedChild:', selectedChild.name, 'ID:', selectedChild.id)}
              <ChildDetailPanel 
                child={selectedChild}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}
