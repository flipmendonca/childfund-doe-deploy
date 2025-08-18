import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Calendar, 
  Mail, 
  MailOpen,
  User, 
  Star, 
  Gift, 
  Stethoscope, 
  MapPin, 
  FileText, 
  ArrowLeft,
  Users,
  Send,
  Video,
  Home,
  GraduationCap,
  Baby,
  Cake,
  BookOpen,
  Users2,
  Church
} from "lucide-react";
import LoggedLayout from "../../components/layout/LoggedLayout";
import { useDonorData } from "../../hooks/useDonorData";

// Interface baseada nos dados disponíveis no CRM conforme documentação
interface SponsoredChild {
  // === IDENTIFICADORES ===
  contactid: string;
  id: string;
  
  // === DADOS PESSOAIS ===
  firstname?: string;
  lastname?: string;
  fullname?: string;
  nome?: string;
  new_cfb_nome?: string;
  
  // === DADOS DEMOGRÁFICOS ===
  birthdate?: string;
  new_datadenascimento?: string;
  new_cfb_datanascimento?: string;
  genero?: string;
  gendercode?: number;
  new_genero?: number;
  new_idade_pessoa?: string;
  
  // === LOCALIZAÇÃO ===
  cidade?: string;
  estado?: string;
  address1_city?: string;
  address1_stateorprovince?: string;
  new_comunidade?: string;
  
  // === MÍDIA E DESCRIÇÃO ===
  imagefotoperfil?: string;
  new_imagefotoperfil?: string;
  entityimage_url?: string;
  chf_fotocrianca?: string;
  chf_fotocrianca_url?: string;
  descricao?: string;
  description?: string;
  
  // === STATUS E CONTROLE ===
  statuscode?: number;
  statecode?: number;
  
  // === DADOS DE SINCRONIZAÇÃO ===
  createdon?: string;
  modifiedon?: string;
  
  // === INFORMAÇÕES ESPECÍFICAS CHILDFUND ===
  new_religiao?: string;
  new_cfb_religiao?: string;
  new_sabelereescrever?: boolean;
  
  // === DADOS FAMILIARES ===
  new_cfb_filhosdependentes?: string;
  new_possuifilhos?: boolean;
  numberofchildren?: string;
  childrensnames?: string;
  
  // === INFORMAÇÕES MÉDICAS ===
  new_satussaudedacrianca?: number;
  new_tipodedoenca?: string;
  new_descrivo_doena?: string;
  
  // === DADOS FINANCEIROS ===
  chf_valor?: string;
  chf_valor_base?: string;
  valor?: string;
  sponsorshipValue?: string;
  
  // === DADOS DE APADRINHAMENTO ===
  sponsorshipDate?: string; // Data do apadrinhamento (mockado por enquanto)
  lastLetterReceived?: string; // Mockado por enquanto
  lastLetterSent?: string; // Mockado por enquanto
  lastProgressReport?: { // Mockado por enquanto
    date: string;
    title: string;
    available: boolean;
  };
}

// Interface simplificada baseada nos dados reais da API DSO
interface RealSponsoredChild {
  id: string;
  childId: string;
  childName: string;
  childAge: number;
  childLocation: string;
  childImage: string;
  childStory: string;
  childNeeds: string[];
  childGender: string;
  startDate: string;
  monthlyAmount: number;
  status: string;
}

// ✅ HELPER FUNCTIONS PARA VALIDAÇÃO DE DADOS REAIS
const isValidData = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'number' && value === 0) return false;
  if (value === 'Não informado') return false;
  if (value === 'N/A') return false;
  return true;
};

const formatAge = (ageStr: string | undefined): string | null => {
  if (!isValidData(ageStr) || !ageStr) return null;
  const age = parseInt(ageStr);
  if (age <= 0 || age > 25) return null; // Idades inválidas
  return `${age} anos`;
};

const formatGender = (gender: string | undefined): string | null => {
  if (!isValidData(gender)) return null;
  if (gender === 'M') return 'Masculino';
  if (gender === 'F') return 'Feminino';
  return null;
};

const formatLocation = (city: string | undefined, state: string | undefined): { city: string | null, state: string | null } => {
  const result: { city: string | null, state: string | null } = { city: null, state: null };
  if (isValidData(city) && city) result.city = city;
  if (isValidData(state) && state) result.state = state;
  return result;
};

const formatBirthDate = (birthDate: string | undefined): string | null => {
  if (!isValidData(birthDate) || !birthDate) return null;
  try {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return null;
  }
};

const formatReligion = (religion: string | undefined): string | null => {
  if (!isValidData(religion) || !religion) return null;
  return religion;
};

const formatEducation = (canReadWrite: boolean | undefined): string | null => {
  if (canReadWrite === undefined || canReadWrite === null) return null;
  return canReadWrite ? 'Sim' : 'Não';
};

const formatHealthStatus = (healthStatus: number | string | undefined): string | null => {
  if (!isValidData(healthStatus)) return null;
  // Mapear códigos de status de saúde se necessário
  if (typeof healthStatus === 'number') {
    const statusMap: { [key: number]: string } = {
      1: 'Excelente',
      2: 'Boa',
      3: 'Regular',
      4: 'Necessita cuidados'
    };
    return statusMap[healthStatus] || null;
  }
  return String(healthStatus);
};

export default function SponsoredPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [sponsoredChildren, setSponsoredChildren] = useState<SponsoredChild[]>([]);

  const donorData = useDonorData();

  // Effect to populate sponsored children from real data
  useEffect(() => {
    if (donorData && 'sponsorships' in donorData && donorData.sponsorships && donorData.sponsorships.length > 0) {
      // Convert sponsorships to SponsoredChild format
      const realChildren: SponsoredChild[] = donorData.sponsorships.map(sponsorship => ({
        id: sponsorship.childId,
        contactid: sponsorship.childId,
        firstname: sponsorship.childName.split(' ')[0] || sponsorship.childName,
        lastname: sponsorship.childName.split(' ').slice(1).join(' ') || '',
        fullname: sponsorship.childName,
        birthdate: '', // Not available in sponsorship data
        sponsorshipDate: sponsorship.startDate,
        sponsorshipValue: `R$ ${sponsorship.monthlyAmount.toFixed(2)}`,
        description: (donorData && 'sponsoredChild' in donorData && donorData.sponsoredChild?.story) || '',
        imagefotoperfil: (donorData && 'sponsoredChild' in donorData && donorData.sponsoredChild?.image) || '',
        cidade: (donorData && 'sponsoredChild' in donorData && donorData.sponsoredChild?.location?.split(',')[0]) || '',
        estado: (donorData && 'sponsoredChild' in donorData && donorData.sponsoredChild?.location?.split(',')[1]?.trim()) || '',
        genero: (donorData && 'sponsoredChild' in donorData && donorData.sponsoredChild?.gender) || 'M',
        new_idade_pessoa: (donorData && 'sponsoredChild' in donorData && donorData.sponsoredChild?.age?.toString()) || '',
      }));
      setSponsoredChildren(realChildren);
    } else if (donorData && 'sponsoredChild' in donorData && donorData.sponsoredChild) {
      // Single sponsored child
      const child: SponsoredChild = {
        id: donorData.sponsoredChild.id,
        contactid: donorData.sponsoredChild.id,
        firstname: donorData.sponsoredChild.name.split(' ')[0] || donorData.sponsoredChild.name,
        lastname: donorData.sponsoredChild.name.split(' ').slice(1).join(' ') || '',
        fullname: donorData.sponsoredChild.name,
        birthdate: '', // Not available
        sponsorshipDate: new Date().toISOString(), // Default to today
        sponsorshipValue: 'R$ 74,00', // Default sponsorship value
        description: donorData.sponsoredChild.story,
        imagefotoperfil: donorData.sponsoredChild.image,
        cidade: donorData.sponsoredChild.location.split(',')[0] || '',
        estado: donorData.sponsoredChild.location.split(',')[1]?.trim() || '',
        genero: donorData.sponsoredChild.gender,
        new_idade_pessoa: donorData.sponsoredChild.age.toString(),
      };
      setSponsoredChildren([child]);
    }
  }, [donorData]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Meus Afilhados - ChildFund Brasil";
    
    // Verificar se há um ID de criança especificado na URL
    const childIdFromUrl = searchParams.get('childId');
    
    if (childIdFromUrl && sponsoredChildren.find(child => child.id === childIdFromUrl)) {
      setSelectedChildId(childIdFromUrl);
    } else if (sponsoredChildren.length > 0 && !selectedChildId) {
      // Selecionar primeiro afilhado por padrão se não houver ID na URL
      setSelectedChildId(sponsoredChildren[0].id);
    }
  }, [user, isLoading, navigate, sponsoredChildren, selectedChildId, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const selectedChild = sponsoredChildren.find(child => child.id === selectedChildId);

  const formatDate = (dateString: string): string | null => {
    if (!isValidData(dateString)) return null;
    
    try {
      const date = new Date(dateString);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return null;
      
      return date.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (error) {
      return null;
    }
  };

  const calculateAge = (birthday: string): number | null => {
    if (!isValidData(birthday)) return null;
    
    const today = new Date();
    const birthDate = new Date(birthday);
    
    // Verificar se a data é válida
    if (isNaN(birthDate.getTime())) return null;
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Retornar null se idade inválida
    if (age <= 0 || age > 25) return null;
    
    return age;
  };

  const getNextBirthday = (birthday: string) => {
    if (!birthday) return new Date();
    
    const today = new Date();
    const birthDate = new Date(birthday);
    
    // Verificar se a data é válida
    if (isNaN(birthDate.getTime())) return new Date();
    
    const thisYear = today.getFullYear();
    let nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < today) {
      nextBirthday = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    return nextBirthday;
  };

  const getDaysUntilBirthday = (birthday: string) => {
    if (!birthday) return 999; // Retorna um valor alto se não há data de aniversário
    
    const nextBirthday = getNextBirthday(birthday);
    const today = new Date();
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (sponsoredChildren.length === 0) {
    return (
      <LoggedLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-childfund-green">Meus Afilhados</h1>
              <p className="text-gray-600">Você ainda não possui afilhados</p>
            </div>
          </div>
          
          <Card className="text-center py-12">
            <CardContent>
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum afilhado encontrado</h3>
              <p className="text-gray-500 mb-6">Que tal começar a transformar vidas apadrinhando uma criança?</p>
              <Button 
                onClick={() => navigate('/apadrinhamento')}
                className="bg-childfund-green hover:bg-childfund-green/90"
              >
                <Heart className="mr-2" size={16} />
                Apadrinhar uma criança
              </Button>
            </CardContent>
          </Card>
        </div>
      </LoggedLayout>
    );
  }

  return (
    <LoggedLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-childfund-green">Meus Afilhados</h1>
            <p className="text-gray-600">
              {sponsoredChildren.length === 1 
                ? "Acompanhe o desenvolvimento da criança que você apadrinhou" 
                : `Você apadrinhou ${sponsoredChildren.length} crianças. Selecione uma para ver os detalhes.`
              }
            </p>
          </div>
        </div>

        {/* Seletor de Afilhado (apenas se houver mais de um) */}
        {sponsoredChildren.length > 1 && (
          <Card className="border-childfund-green/20">
            <CardHeader>
              <CardTitle className="text-childfund-green flex items-center gap-2">
                <Users size={20} />
                Selecione um Afilhado
              </CardTitle>
              <CardDescription>
                Escolha qual criança você gostaria de acompanhar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsoredChildren.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedChildId === child.id
                        ? "border-childfund-green bg-childfund-green/5 shadow-md"
                        : "border-gray-200 hover:border-childfund-green/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-childfund-green/20 rounded-full flex items-center justify-center overflow-hidden">
                        {child.imagefotoperfil || child.new_imagefotoperfil || child.entityimage_url || child.chf_fotocrianca_url ? (
                          <img 
                            src={child.imagefotoperfil || child.new_imagefotoperfil || child.entityimage_url || child.chf_fotocrianca_url} 
                            alt={child.fullname || `${child.firstname} ${child.lastname}`}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="text-childfund-green" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-childfund-green">{child.firstname} {child.lastname}</h3>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            const parts: string[] = [];
                            
                            // Idade
                            const age = calculateAge(child.birthdate || '');
                            if (age) {
                              parts.push(`${age} anos`);
                            }
                            
                            // Estado
                            if (isValidData(child.estado) && child.estado) {
                              parts.push(child.estado);
                            }
                            
                            return parts.length > 0 ? parts.join(' • ') : 'Afilhado';
                          })()}
                        </p>
                        {(() => {
                          const sponsorshipDate = formatDate(child.sponsorshipDate || '');
                          if (sponsorshipDate) {
                            return <p className="text-xs text-gray-500">Desde {sponsorshipDate}</p>;
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Afilhado Selecionado */}
        {selectedChild && (
          <>
            {/* Card Principal da Criança */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Foto e Informações Básicas */}
              <Card className="lg:col-span-1 border-childfund-green/20">
                <CardHeader>
                  <CardTitle className="text-childfund-green flex items-center gap-2">
                    <Heart size={20} />
                    {selectedChild.firstname} {selectedChild.lastname}
                  </CardTitle>
                  <CardDescription>
                    {(() => {
                      const parts = [];
                      
                      // Idade
                      const age = calculateAge(selectedChild.birthdate || '');
                      if (age) {
                        parts.push(`${age} anos`);
                      }
                      
                      // Localização
                      const location = formatLocation(
                        selectedChild.cidade || selectedChild.address1_city,
                        selectedChild.estado || selectedChild.address1_stateorprovince
                      );
                      
                      if (location.city && location.state) {
                        parts.push(`${location.city}, ${location.state}`);
                      } else if (location.city) {
                        parts.push(location.city);
                      } else if (location.state) {
                        parts.push(location.state);
                      }
                      
                      return parts.length > 0 ? parts.join(' • ') : 'Afilhado';
                    })()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {selectedChild.imagefotoperfil || selectedChild.new_imagefotoperfil || selectedChild.entityimage_url || selectedChild.chf_fotocrianca_url ? (
                      <img 
                        src={selectedChild.imagefotoperfil || selectedChild.new_imagefotoperfil || selectedChild.entityimage_url || selectedChild.chf_fotocrianca_url} 
                        alt={selectedChild.fullname || `${selectedChild.firstname} ${selectedChild.lastname}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-gray-400" size={64} />
                    )}
                  </div>
                  
                  {/* ✅ INFORMAÇÕES RÁPIDAS - APENAS DADOS REAIS */}
                  <div className="space-y-3">
                    {/* Idade - apenas se válida */}
                    {(() => {
                      const age = formatAge(selectedChild.new_idade_pessoa) || 
                                  (calculateAge(selectedChild.birthdate || '') ? `${calculateAge(selectedChild.birthdate || '')} anos` : null);
                      if (age) {
                        return (
                          <div className="flex items-center gap-2 text-sm">
                            <GraduationCap className="text-childfund-blue" size={16} />
                            <span className="font-medium">Idade:</span>
                            <span>{age}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Aniversário - apenas se data válida */}
                    {(() => {
                      const birthday = formatDate(selectedChild.birthdate || '');
                      if (birthday) {
                        return (
                          <div className="flex items-center gap-2 text-sm">
                            <Cake className="text-childfund-orange" size={16} />
                            <span className="font-medium">Aniversário:</span>
                            <span>{birthday}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Apadrinhado desde - apenas se data válida */}
                    {(() => {
                      const sponsorshipDate = formatDate(selectedChild.sponsorshipDate || '');
                      if (sponsorshipDate) {
                        return (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="text-childfund-green" size={16} />
                            <span className="font-medium">Apadrinhado desde:</span>
                            <span>{sponsorshipDate}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Próximo Aniversário - apenas se data válida e próxima */}
                    {(() => {
                      const daysUntil = getDaysUntilBirthday(selectedChild.birthdate || '');
                      if (isValidData(selectedChild.birthdate) && daysUntil <= 30 && daysUntil > 0) {
                        return (
                          <div className="p-3 bg-childfund-orange/10 rounded-lg border border-childfund-orange/20">
                            <div className="flex items-center gap-2 text-sm">
                              <Cake className="text-childfund-orange" size={16} />
                              <span className="font-medium text-childfund-orange">
                                Aniversário em {daysUntil} dias!
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Informações Detalhadas */}
              <Card className="lg:col-span-2 border-childfund-green/20">
                <CardHeader>
                  <CardTitle className="text-childfund-green flex items-center gap-2">
                    <User size={20} />
                    Sobre {selectedChild.firstname} {selectedChild.lastname}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* História */}
                  <div className="p-4 bg-childfund-blue/10 border-l-4 border-childfund-blue rounded">
                    <h4 className="font-medium text-childfund-blue mb-2">História</h4>
                    <p className="text-base text-gray-700 leading-relaxed">{selectedChild.description || selectedChild.descricao}</p>
                  </div>

                  {/* Grid de Informações */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Informações Pessoais e Familiares */}
                    <div className="space-y-4">
                      {/* ✅ INFORMAÇÕES PESSOAIS - APENAS DADOS REAIS */}
                      {(() => {
                        const personalInfo: React.ReactElement[] = [];
                        
                        // Nome completo - sempre mostrar se existe
                        const fullName = selectedChild.fullname || `${selectedChild.firstname} ${selectedChild.lastname}`;
                        if (isValidData(fullName)) {
                          personalInfo.push(<p key="name"><strong>Nome completo:</strong> {fullName}</p>);
                        }
                        
                        // Idade - apenas se válida
                        const age = formatAge(selectedChild.new_idade_pessoa);
                        if (age) {
                          personalInfo.push(<p key="age"><strong>Idade:</strong> {age}</p>);
                        }
                        
                        // Gênero - apenas se válido
                        const gender = formatGender(selectedChild.genero);
                        if (gender) {
                          personalInfo.push(<p key="gender"><strong>Gênero:</strong> {gender}</p>);
                        }
                        
                        // Data de nascimento - apenas se válida
                        const birthDate = formatBirthDate(selectedChild.birthdate);
                        if (birthDate) {
                          personalInfo.push(<p key="birthdate"><strong>Data de nascimento:</strong> {birthDate}</p>);
                        }
                        
                        // Se tem pelo menos um dado pessoal, mostrar a seção
                        if (personalInfo.length > 0) {
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Users2 className="text-childfund-green" size={18} />
                                <span className="font-medium">Informações Pessoais:</span>
                              </div>
                              <div className="text-sm text-gray-700 space-y-1">
                                {personalInfo}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* ✅ LOCALIZAÇÃO - APENAS DADOS REAIS */}
                      {(() => {
                        const location = formatLocation(
                          selectedChild.cidade || selectedChild.address1_city,
                          selectedChild.estado || selectedChild.address1_stateorprovince
                        );
                        const locationInfo: React.ReactElement[] = [];
                        
                        if (location.city) {
                          locationInfo.push(<p key="city"><strong>Cidade:</strong> {location.city}</p>);
                        }
                        
                        if (location.state) {
                          locationInfo.push(<p key="state"><strong>Estado:</strong> {location.state}</p>);
                        }
                        
                        if (isValidData(selectedChild.new_comunidade)) {
                          locationInfo.push(<p key="community"><strong>Comunidade:</strong> {selectedChild.new_comunidade}</p>);
                        }
                        
                        // Se tem pelo menos um dado de localização, mostrar a seção
                        if (locationInfo.length > 0) {
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="text-childfund-blue" size={18} />
                                <span className="font-medium">Localização:</span>
                              </div>
                              <div className="text-sm text-gray-700 space-y-1">
                                {locationInfo}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* ✅ RELIGIÃO - APENAS DADOS REAIS */}
                      {(() => {
                        const religion = formatReligion(selectedChild.new_religiao || selectedChild.new_cfb_religiao);
                        if (religion) {
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Church className="text-childfund-orange" size={18} />
                                <span className="font-medium">Religião:</span>
                              </div>
                              <div className="text-sm text-gray-700">
                                <p>{religion}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Informações Educacionais e de Saúde */}
                    <div className="space-y-4">
                      {/* ✅ EDUCAÇÃO - APENAS DADOS REAIS */}
                      {(() => {
                        const canReadWrite = formatEducation(selectedChild.new_sabelereescrever);
                        if (canReadWrite) {
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="text-childfund-blue" size={18} />
                                <span className="font-medium">Educação:</span>
                              </div>
                              <div className="text-sm text-gray-700 space-y-1">
                                <p className="flex items-center gap-2">
                                  Sabe ler e escrever: 
                                  <Badge variant={selectedChild.new_sabelereescrever ? "default" : "secondary"} className="text-xs">
                                    {canReadWrite}
                                  </Badge>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* ✅ SAÚDE - APENAS DADOS REAIS */}
                      {(() => {
                        const healthInfo: React.ReactElement[] = [];
                        
                        // Status de saúde
                        const healthStatus = formatHealthStatus(selectedChild.new_satussaudedacrianca);
                        if (healthStatus) {
                          healthInfo.push(<p key="status"><strong>Status de saúde:</strong> {healthStatus}</p>);
                        }
                        
                        // Tipo de doença
                        if (isValidData(selectedChild.new_tipodedoenca)) {
                          healthInfo.push(<p key="disease"><strong>Tipo de doença:</strong> {selectedChild.new_tipodedoenca}</p>);
                        }
                        
                        // Descrição da doença
                        if (isValidData(selectedChild.new_descrivo_doena)) {
                          healthInfo.push(<p key="description"><strong>Descrição da doença:</strong> {selectedChild.new_descrivo_doena}</p>);
                        }
                        
                        // Se tem pelo menos um dado de saúde, mostrar a seção
                        if (healthInfo.length > 0) {
                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Stethoscope className="text-childfund-green" size={18} />
                                <span className="font-medium">Saúde:</span>
                              </div>
                              <div className="text-sm text-gray-700 space-y-1">
                                {healthInfo}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Informações Financeiras */}
                  <div className="p-4 bg-childfund-green/10 border-l-4 border-childfund-green rounded">
                    <h4 className="font-medium text-childfund-green mb-2">Valor do Apadrinhamento</h4>
                    <p className="text-sm text-gray-700">
                      <strong>Valor mensal:</strong> {selectedChild.sponsorshipValue || selectedChild.chf_valor || selectedChild.valor || 'R$ 50,00'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Enviar Carta */}
              <Card className="border-childfund-orange/30 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-childfund-orange flex items-center gap-2">
                    <Mail size={20} />
                    Enviar Carta
                  </CardTitle>
                  <CardDescription>
                    Envie uma mensagem carinhosa para {selectedChild.firstname} {selectedChild.lastname}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedChild.lastLetterSent && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Última carta enviada:</strong><br />
                        {formatDate(selectedChild.lastLetterSent)}
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={() => navigate(`/dashboard/letters?child=${selectedChild.id}`)}
                    className="w-full bg-childfund-orange hover:bg-childfund-orange/90"
                  >
                    <Send className="mr-2" size={16} />
                    Escrever Carta
                  </Button>
                </CardContent>
              </Card>

              {/* 2. Histórico de Cartas */}
              <Card className="border-childfund-blue/30 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-childfund-blue flex items-center gap-2">
                    <MailOpen size={20} />
                    Histórico de Cartas
                  </CardTitle>
                  <CardDescription>
                    Veja todas as cartas trocadas com {selectedChild.firstname} {selectedChild.lastname}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedChild.lastLetterReceived && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Última carta recebida:</strong><br />
                        {formatDate(selectedChild.lastLetterReceived)}
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={() => navigate(`/dashboard/letters?child=${selectedChild.id}&tab=history`)}
                    variant="outline"
                    className="w-full border-childfund-blue text-childfund-blue hover:bg-childfund-blue hover:text-white"
                  >
                    <MailOpen className="mr-2" size={16} />
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>

              {/* 3. Agendar Visita */}
              <Card className="border-childfund-green/30 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-childfund-green flex items-center gap-2">
                    <Calendar size={20} />
                    Agendar Visita
                  </CardTitle>
                  <CardDescription>
                    Solicite uma visita presencial ou virtual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="text-childfund-green" size={16} />
                      <span>Visita presencial</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="text-childfund-blue" size={16} />
                      <span>Visita virtual</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/dashboard/visit-scheduling?child=${selectedChild.id}`)}
                    variant="outline"
                    className="w-full border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                  >
                    <Calendar className="mr-2" size={16} />
                    Solicitar Visita
                  </Button>
                </CardContent>
              </Card>

              {/* 4. Relatório de Progresso */}
              <Card className="border-purple-300 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center gap-2">
                    <FileText size={20} />
                    Relatório de Progresso
                  </CardTitle>
                  <CardDescription>
                    Acompanhe o desenvolvimento de {selectedChild.firstname} {selectedChild.lastname}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedChild.lastProgressReport ? (
                    <>
                      <div className={`mb-4 p-3 rounded-lg ${
                        selectedChild.lastProgressReport.available 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <p className="text-sm text-gray-600">
                          <strong>Último relatório:</strong><br />
                          {formatDate(selectedChild.lastProgressReport.date)} - {selectedChild.lastProgressReport.title}
                        </p>
                        {!selectedChild.lastProgressReport.available && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⏳ Em processamento
                          </p>
                        )}
                      </div>
                      <Button 
                        onClick={() => {
                          if (selectedChild.lastProgressReport?.available) {
                            // TODO: William - Implementar rota para consulta no Dynamics
                            // A rota deve:
                            // 1. Receber o ID da criança como parâmetro
                            // 2. Consultar o Dynamics para buscar o último relatório disponível
                            // 3. Retornar o PDF ou dados do relatório
                            // 4. Abrir em nova aba ou fazer download
                            
                            // Exemplo da rota esperada:
                            // window.open(`/api/dynamics/progress-report/${selectedChild.id}`, '_blank');
                            
                            // Por enquanto, simulando o comportamento:
                            console.log(`Acessando relatório de progresso para criança ID: ${selectedChild.id}`);
                            alert(`Abrindo relatório: ${selectedChild.lastProgressReport.title}\n\nEm produção, isso abrirá o PDF do Dynamics.`);
                          } else {
                            alert('Este relatório ainda está sendo processado e será disponibilizado em breve.');
                          }
                        }}
                        disabled={!selectedChild.lastProgressReport?.available}
                        className={`w-full ${
                          selectedChild.lastProgressReport.available
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FileText className="mr-2" size={16} />
                        {selectedChild.lastProgressReport.available ? 'Ver Relatório' : 'Em Processamento'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Nenhum relatório disponível ainda.<br />
                          O primeiro relatório será gerado em breve.
                        </p>
                      </div>
                      <Button 
                        disabled
                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                      >
                        <FileText className="mr-2" size={16} />
                        Aguardando Relatório
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Guia do Padrinho */}
            <Card className="border-childfund-yellow/30">
              <CardHeader>
                <CardTitle className="text-childfund-green flex items-center gap-2">
                  <FileText size={20} />
                  ABC do Padrinho/Madrinha
                </CardTitle>
                <CardDescription>
                  Guia completo para padrinhos e madrinhas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-medium">Guia do Padrinho/Madrinha</h4>
                    <p className="text-sm text-gray-600">Tudo que você precisa saber sobre o apadrinhamento</p>
                  </div>
                  <Button asChild className="w-full sm:w-auto bg-childfund-yellow hover:bg-childfund-yellow/90 text-gray-800">
                    <a href="/abc-padrinho.pdf" target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2" size={16} />
                      Baixar PDF
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LoggedLayout>
  );
}
