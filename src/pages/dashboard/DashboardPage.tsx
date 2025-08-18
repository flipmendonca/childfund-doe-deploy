import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Users, Calendar, Gift, MapPin, Clock, Sparkles, Star, CreditCard, HelpCircle, User, TrendingUp, Mail, MailOpen, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDonorData } from "../../hooks/useDonorData";
import LoggedLayout from "../../components/layout/LoggedLayout";
import { MockUser } from "../../mocks/userProfiles";
import CampaignBanner from "../../components/CampaignBanner";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ViewType = "padrinho" | "guardiao" | "unico";

export default function DashboardPage() {
  const { user, isLoading, isMockMode } = useAuth();
  const navigate = useNavigate();
  const donorData = useDonorData();
  const [activeView, setActiveView] = useState<ViewType>("padrinho");

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    // Set page title
    document.title = "Área do Doador - ChildFund Brasil";
    
    // Set initial view based on user profile - always prioritize user's main profile
    if (donorData?.profile) {
      setActiveView(donorData.profile);
      console.log(`[Dashboard] Setting active view to: ${donorData.profile}`);
    }
  }, [user, isLoading, navigate, donorData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  // Loading state durante troca de usuário ou carregamento inicial
  if (isLoading || !user || !donorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-childfund-green to-childfund-blue flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">
            {isLoading ? 'Carregando sua área...' : 'Preparando dados do usuário...'}
          </h2>
          <p className="text-white/80">
            {isLoading ? 'Aguarde enquanto carregamos suas informações' : 'Sincronizando dados...'}
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Usar dados reais do doador
  const realSponsorships = (donorData as any).sponsorships || [];
  const realDonations = donorData.donations || [];
  const realSponsoredChild = (donorData as any).sponsoredChild;

  const getAvailableTabs = () => {
    // Sempre mostrar todas as 3 abas, independente do histórico do usuário
    return ["padrinho", "guardiao", "unico"];
  };

  const availableTabs = getAvailableTabs();

  // Verificar se usuário tem apadrinhamentos ativos
  const hasActiveSponsorships = realSponsorships && realSponsorships.length > 0;
  
  // Verificar se usuário tem doações mensais ativas (guardião)
  const hasMonthlyDonations = donorData?.monthlyDonation?.status === 'active' || false;
  
  // Verificar se usuário tem histórico de doações únicas
  const hasOneTimeDonations = realDonations && realDonations.length > 0;

  // Renderizar avisos sobre funcionalidades não disponíveis
  const renderWarnings = () => {
    if (isMockMode || !(donorData as any).warnings || (donorData as any).warnings.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 space-y-3">
        <div className="grid gap-2">
          {(donorData as any).warnings.map((warning: string, index: number) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-yellow-800">{warning}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPadrinhoContent = () => (
    <div className="space-y-6">
      {/* Resumo do Afilhado com destaque para cartas */}
      <Card className="border-childfund-green/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Seus Afilhados</h3>
            <p className="text-4xl font-bold text-childfund-orange mb-2">{realSponsorships.length} {realSponsorships.length === 1 ? 'criança' : 'crianças'}</p>
            <p className="text-gray-600">
              {realSponsorships.length > 0 
                ? `Você transforma a vida de ${realSponsorships.length} ${realSponsorships.length === 1 ? 'criança' : 'crianças'} todos os meses.`
                : 'Você ainda não tem afilhados. Que tal apadrinhar uma criança?'
              }
            </p>
          </div>
          
          {/* Informações de cartas em destaque - só aparecem para padrinhos com afilhados */}
          {hasActiveSponsorships && donorData.letters && donorData.letters.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-childfund-green-light/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MailOpen className="text-childfund-green" size={20} />
                <div>
                  <p className="font-medium text-childfund-green">Última carta enviada</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(donorData.letters[0].date)} {realSponsoredChild ? `para ${realSponsoredChild.name}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-childfund-orange" size={20} />
                <div>
                  <p className="font-medium text-childfund-green">Última carta recebida</p>
                  <p className="text-sm text-gray-600">
                    {donorData.letters.length > 1 ? formatDate(donorData.letters[1].date) : 'Nenhuma carta recebida ainda'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Preview dos afilhados */}
          <div className="space-y-4 mb-6">
            {realSponsorships.length > 0 ? (
              realSponsorships.map((sponsorship, index) => (
                <button
                  key={index}
                  onClick={() => navigate(`/dashboard/sponsored?childId=${sponsorship.childId}`)}
                  className="w-full flex items-center gap-4 p-3 bg-white rounded-lg border border-childfund-green/20 hover:border-childfund-green hover:bg-childfund-green/5 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-childfund-green/20 rounded-full flex items-center justify-center overflow-hidden">
                    <User className="text-childfund-green" size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-childfund-green">{sponsorship.childName}</p>
                    <p className="text-sm text-gray-600">Apadrinhamento desde {formatDate(sponsorship.startDate)}</p>
                  </div>
                  <ArrowRight className="text-childfund-green" size={16} />
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="mx-auto mb-2" size={32} />
                <p>Você ainda não tem afilhados</p>
                <Button 
                  onClick={() => navigate('/apadrinhamento')}
                  className="mt-4 bg-childfund-green hover:bg-childfund-green/90"
                >
                  Apadrinhar uma criança
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-3">
            {hasActiveSponsorships ? (
              <>
                <Button 
                  onClick={() => navigate('/dashboard/sponsored')}
                  className="bg-childfund-green hover:bg-childfund-green/90 text-white font-bold"
                >
                  Ver afilhados <ArrowRight className="ml-2" size={16} />
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/letters')}
                  className="bg-childfund-orange hover:bg-childfund-orange/90 text-white font-bold"
                >
                  <Mail className="mr-2" size={16} />
                  Enviar Carta
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/visit-scheduling')}
                  variant="outline"
                  className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white font-bold"
                >
                  <Calendar className="mr-2" size={16} />
                  Agendar Visita
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/apadrinhamento')}
                  className="bg-childfund-green hover:bg-childfund-green/90 text-white font-bold md:col-span-2"
                >
                  <Heart className="mr-2" size={16} />
                  Apadrinhar uma criança
                </Button>
                <Button 
                  onClick={() => navigate('/apadrinhamento')}
                  variant="outline"
                  className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white font-bold"
                >
                  <Users className="mr-2" size={16} />
                  Ver crianças
                </Button>
              </>
            )}
          </div>

          {/* Sugestões de ação para padrinhos */}
          <div className="mt-6 p-4 bg-gradient-to-r from-childfund-orange-light to-childfund-yellow/20 rounded-lg border-l-4 border-childfund-orange">
            <h4 className="font-semibold text-childfund-green mb-3">Amplie ainda mais seu impacto:</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/apadrinhamento')}
                className="w-full justify-start border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
              >
                <Heart className="mr-2" size={16} />
                Apadrinhar mais uma criança
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/doacao-mensal')}
                className="w-full justify-start border-childfund-yellow text-gray-700 hover:bg-childfund-yellow hover:text-gray-800"
              >
                <Star className="mr-2" size={16} />
                Tornar-se Guardião da Infância
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/doacao-unica')}
                className="w-full justify-start border-childfund-orange text-childfund-orange hover:bg-childfund-orange hover:text-white"
              >
                <Gift className="mr-2" size={16} />
                Fazer doação pontual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGuardiaoContent = () => (
    <div className="space-y-6">
      <Card className="border-childfund-green/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total em Programas Comunitários</h3>
            {donorData.monthlyDonation ? (
              <>
                <p className="text-4xl font-bold text-childfund-orange mb-2">
                  {formatCurrency(donorData.monthlyDonation.amount)}
                </p>
                <p className="text-gray-600">
                  Você contribui para programas comunitários mensalmente.
                </p>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                  <p className="text-blue-800 font-medium mb-1">Histórico em desenvolvimento</p>
                  <p className="text-blue-700 text-sm">
                    Se você tem contribuições ativas, elas continuam funcionando normalmente. 
                    O histórico detalhado será disponibilizado em breve.
                  </p>
                </div>
                <p className="text-gray-600">
                  Você ainda não tem programas comunitários ativos.
                </p>
              </>
            )}
          </div>
          
          {/* Preview dos programas */}
          <div className="space-y-4 mb-6">
            {donorData.monthlyDonation ? (
              <div className="flex items-center justify-between p-3 bg-childfund-green-light rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="text-childfund-green" size={20} />
                  <div>
                    <p className="font-medium text-childfund-green">Programa Comunitário</p>
                    <p className="text-sm text-gray-600">Contribuição mensal ativa</p>
                  </div>
                </div>
                <p className="font-bold text-childfund-orange">{formatCurrency(donorData.monthlyDonation.amount)}/mês</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto mb-2" size={32} />
                <p>Você ainda não tem programas comunitários ativos</p>
                <Button 
                  onClick={() => navigate('/doacao-mensal')}
                  className="mt-4 bg-childfund-green hover:bg-childfund-green/90"
                >
                  Começar programa mensal
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {hasMonthlyDonations ? (
              <>
                <Button 
                  onClick={() => navigate('/dashboard/reports')}
                  className="bg-childfund-green hover:bg-childfund-green/90 text-white font-bold"
                >
                  Relatórios de Impacto <ArrowRight className="ml-2" size={16} />
                </Button>
                <Button 
                  onClick={() => navigate('/relatorios/sustentabilidade')}
                  variant="outline"
                  className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                >
                  Carta Comunitária
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/doacao-mensal')}
                  className="bg-childfund-green hover:bg-childfund-green/90 text-white font-bold"
                >
                  <Star className="mr-2" size={16} />
                  Começar doação mensal
                </Button>
                <Button 
                  onClick={() => navigate('/doacao-mensal')}
                  variant="outline"
                  className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                >
                  <TrendingUp className="mr-2" size={16} />
                  Ver programas
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUnicoContent = () => (
    <div className="space-y-6">
      <Card className="border-childfund-green/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total em Doações Únicas</h3>
            {realDonations.length > 0 ? (
              <>
                <p className="text-4xl font-bold text-childfund-orange mb-2">
                  {formatCurrency(totalDonated)}
                </p>
                <p className="text-gray-600">
                  Você já fez {realDonations.length} {realDonations.length === 1 ? 'doação' : 'doações'} que transformam vidas.
                </p>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                  <p className="text-blue-800 font-medium mb-1">Histórico em desenvolvimento</p>
                  <p className="text-blue-700 text-sm">
                    Se você já fez doações pelo site, elas foram processadas com sucesso. 
                    O histórico detalhado será disponibilizado em breve.
                  </p>
                </div>
                <p className="text-gray-600">
                  Suas contribuições estão ativas e fazendo a diferença!
                </p>
              </>
            )}
          </div>
          
          {/* Preview das doações */}
          <div className="space-y-4 mb-6">
            {realDonations.length > 0 ? (
              realDonations.slice(0, 3).map((donation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-childfund-green-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <Gift className="text-childfund-green" size={20} />
                    <div>
                      <p className="font-medium text-childfund-green">{donation.description || 'Doação única'}</p>
                      <p className="text-sm text-gray-600">{formatDate(donation.date)}</p>
                    </div>
                  </div>
                  <p className="font-bold text-childfund-orange">{formatCurrency(donation.amount)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Gift className="mx-auto mb-3 text-gray-400" size={32} />
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">Histórico de doações em desenvolvimento</p>
                  <p className="text-sm text-gray-500">
                    Se você já fez doações pelo site, elas foram processadas com sucesso. 
                    <br />O histórico detalhado será disponibilizado em breve.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Suas doações estão ativas!</strong> Esta funcionalidade está sendo desenvolvida para mostrar seu histórico completo.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/doacao-unica')}
                  className="bg-childfund-green hover:bg-childfund-green/90"
                >
                  Fazer nova doação
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            <Button 
              onClick={() => navigate('/doacao-unica')}
              className="bg-childfund-yellow hover:bg-childfund-yellow/90 text-gray-800 font-bold"
            >
              <Gift className="mr-2" size={16} />
              {hasOneTimeDonations ? 'Fazer nova doação' : 'Fazer primeira doação'}
            </Button>
            {hasOneTimeDonations && (
              <Button 
                onClick={() => navigate('/dashboard/donations')}
                variant="outline"
                className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
              >
                <TrendingUp className="mr-2" size={16} />
                Ver histórico
              </Button>
            )}
            {!hasOneTimeDonations && (
              <Button 
                onClick={() => navigate('/doacao-unica')}
                variant="outline"
                className="border-childfund-yellow text-gray-700 hover:bg-childfund-yellow hover:text-gray-800"
              >
                <Heart className="mr-2" size={16} />
                Ver causas
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incentivo ao apadrinhamento para doadores únicos */}
      <Card className="border-childfund-green/30 shadow-lg bg-gradient-to-r from-childfund-green-light/20 to-white">
        <CardHeader>
          <CardTitle className="text-childfund-green flex items-center gap-2">
            <Heart className="text-childfund-green" size={20} />
            Que tal criar um vínculo especial?
          </CardTitle>
          <CardDescription>
            Você já conhece a alegria de doar! Que tal dar o próximo passo e apadrinhar uma criança? 
            Crie um laço único e acompanhe de perto a transformação que sua generosidade gera.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="text-childfund-green" size={16} />
              <span>Acompanhe o crescimento de uma criança</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="text-childfund-orange" size={16} />
              <span>Troque cartas e crie memórias</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="text-childfund-yellow" size={16} />
              <span>Veja seu impacto direto na vida de alguém</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Button 
              onClick={() => navigate('/apadrinhamento')}
              className="bg-childfund-green hover:bg-childfund-green/90 text-white font-bold"
            >
              <Heart className="mr-2" size={16} />
              Conhecer crianças
            </Button>
            <Button 
              onClick={() => navigate('/doacao-unica')}
              variant="outline"
              className="border-childfund-orange text-childfund-orange hover:bg-childfund-orange hover:text-white font-bold"
            >
              <Gift className="mr-2" size={16} />
              Fazer nova doação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Componente "Espalhe mais esperança" para doações únicas */}
      <Card className="border-childfund-orange/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-childfund-green">Espalhe mais esperança</CardTitle>
          <CardDescription>
            Suas doações únicas permitem ampliar pontualmente o trabalho do ChildFund, 
            atendendo emergências e necessidades específicas das comunidades.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="text-childfund-yellow" size={16} />
              <span>Resposta rápida a emergências</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="text-childfund-orange" size={16} />
              <span>Apoio a projetos especiais</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="text-childfund-green" size={16} />
              <span>Impacto direto nas comunidades</span>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/doacao-unica')}
            className="w-full bg-childfund-orange hover:bg-childfund-orange/90 text-white font-bold"
          >
            <Gift className="mr-2" size={16} />
            Fazer nova doação
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const totalDonated = Array.isArray(donorData.donations)
    ? (donorData.donations as { amount: number }[]).reduce((sum, donation) => sum + (donation.amount || 0), 0)
    : 0;
  
  // Estatísticas baseadas no perfil e se tem apadrinhamentos ativos
  const childrenHelped = donorData.profile === "padrinho" && hasActiveSponsorships ? realSponsorships.length : 
                         donorData.profile === "guardiao" && hasMonthlyDonations ? 135 : 0;
  const communitiesImpacted = donorData.profile === "padrinho" && hasActiveSponsorships ? 1 : 
                              donorData.profile === "guardiao" && hasMonthlyDonations ? 28 : 0; // 28 OSPs/municípios onde atuamos

  // Determinar se deve mostrar estatísticas de impacto
  const shouldShowImpactStats = (donorData.profile === "padrinho" && hasActiveSponsorships) ||
                               (donorData.profile === "guardiao" && hasMonthlyDonations) ||
                               (donorData.profile === "unico" && hasOneTimeDonations);

  return (
    <LoggedLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Campaign Banner */}
        <CampaignBanner 
          userProfile={donorData.profile}
          hasActiveDonation={hasActiveSponsorships || hasMonthlyDonations || hasOneTimeDonations}
          isMultipleDonor={(hasActiveSponsorships && hasMonthlyDonations) || (hasActiveSponsorships && hasOneTimeDonations) || (hasMonthlyDonations && hasOneTimeDonations)}
        />

        {/* Avisos sobre funcionalidades não disponíveis */}
        {renderWarnings()}

        {/* Welcome Section */}
        <Card className="border-childfund-green/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-childfund-green text-2xl md:text-3xl">
              Olá, {donorData.name}! 👋
            </CardTitle>
            <CardDescription className="text-lg">
              Bem-vindo à sua área do doador. Aqui você pode acompanhar seu impacto e gerenciar suas contribuições.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Seletor de Visão - destacado e explicativo */}
        <Card className="border-2 border-childfund-green/30 bg-gradient-to-r from-childfund-green-light/30 to-white shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-childfund-green rounded-full flex items-center justify-center">
                <Users className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-xl text-childfund-green">O que você quer ver hoje?</CardTitle>
                <CardDescription className="text-base">
                  Escolha uma das opções abaixo para visualizar informações específicas dos seus planos e contribuições
                </CardDescription>
              </div>
            </div>
            
            {/* Indicador visual de que há conteúdo em cada aba */}
            <div className="bg-childfund-orange/10 p-4 rounded-lg border-l-4 border-childfund-orange">
              <p className="text-sm text-childfund-green font-medium">
                💡 <strong>Dica:</strong> Cada aba mostra um resumo completo dos seus planos ativos, histórico e próximas ações disponíveis.
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ViewType)} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-white border-2 border-childfund-green/20 p-2 rounded-xl shadow-sm min-h-[240px] md:min-h-[90px] gap-2 md:gap-0">
                <TabsTrigger 
                  value="padrinho" 
                  className="data-[state=active]:bg-childfund-green data-[state=active]:text-white data-[state=active]:shadow-lg text-childfund-green font-semibold py-3 px-2 md:py-4 md:px-3 rounded-lg transition-all duration-300 hover:bg-childfund-green/10 flex flex-col items-center gap-1 md:gap-2 min-h-[70px]"
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    <Users size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="font-semibold text-xs md:text-sm">Meus Afilhados</span>
                  </div>
                  <div className="text-[10px] md:text-xs opacity-80 text-center">
                    <span className="hidden sm:inline">
                      {hasActiveSponsorships ? `${realSponsorships.length} criança${realSponsorships.length > 1 ? 's' : ''}` : 'Apadrinhar criança'}
                    </span>
                    <span className="sm:hidden">
                      {hasActiveSponsorships ? `${realSponsorships.length} criança${realSponsorships.length > 1 ? 's' : ''}` : 'Apadrinhar'}
                    </span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="guardiao" 
                  className="data-[state=active]:bg-childfund-green data-[state=active]:text-white data-[state=active]:shadow-lg text-childfund-green font-semibold py-3 px-2 md:py-4 md:px-3 rounded-lg transition-all duration-300 hover:bg-childfund-green/10 flex flex-col items-center gap-1 md:gap-2 min-h-[70px]"
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    <Star size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="font-semibold text-xs md:text-sm">Guardião</span>
                  </div>
                  <div className="text-[10px] md:text-xs opacity-80 text-center">
                    <span className="hidden sm:inline">
                      {hasMonthlyDonations ? 'Doação mensal ativa' : 'Contribuição mensal'}
                    </span>
                    <span className="sm:hidden">
                      {hasMonthlyDonations ? 'Ativo' : 'Contribuir'}
                    </span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="unico" 
                  className="data-[state=active]:bg-childfund-green data-[state=active]:text-white data-[state=active]:shadow-lg text-childfund-green font-semibold py-3 px-2 md:py-4 md:px-3 rounded-lg transition-all duration-300 hover:bg-childfund-green/10 flex flex-col items-center gap-1 md:gap-2 min-h-[70px]"
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    <Gift size={16} className="md:w-[18px] md:h-[18px]" />
                    <span className="font-semibold text-xs md:text-sm">Doações Únicas</span>
                  </div>
                  <div className="text-[10px] md:text-xs opacity-80 text-center">
                    <span className="hidden sm:inline">
                      {hasOneTimeDonations ? `${realDonations.length} doação${realDonations.length > 1 ? 'ões' : ''}` : 'Fazer doação'}
                    </span>
                    <span className="sm:hidden">
                      {hasOneTimeDonations ? `${realDonations.length} doaç${realDonations.length > 1 ? 'ões' : 'ão'}` : 'Doar'}
                    </span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="padrinho" className="mt-6">
                {renderPadrinhoContent()}
              </TabsContent>

              <TabsContent value="guardiao" className="mt-6">
                {renderGuardiaoContent()}
              </TabsContent>

              <TabsContent value="unico" className="mt-6">
                {renderUnicoContent()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Impact Stats - mostra apenas estatísticas relevantes para cada perfil */}
        {shouldShowImpactStats && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Total investido - sempre mostra se tem doações */}
            {totalDonated > 0 && (
              <Card className="border-childfund-green/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="mb-3">
                    <Heart className="text-childfund-orange mx-auto animate-pulse" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-childfund-green mb-2">{formatCurrency(totalDonated)}</p>
                  <p className="text-gray-600">Você já investiu em futuros brilhantes</p>
                </CardContent>
              </Card>
            )}
            
            {/* Crianças - só para padrinhos com afilhados ou guardiões com doações mensais */}
            {childrenHelped > 0 && (
              <Card className="border-childfund-yellow/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="mb-3">
                    <Users className="text-childfund-yellow mx-auto" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-childfund-orange mb-2">{childrenHelped}</p>
                  <p className="text-gray-600">
                    {donorData.profile === "guardiao" ? "Crianças impactadas pelos programas" : "Criança(s) apadrinhada(s)"}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Comunidades/OSPs - só para padrinhos com afilhados ou guardiões com doações mensais */}
            {communitiesImpacted > 0 && (
              <Card className="border-childfund-orange/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="mb-3">
                    <Sparkles className="text-childfund-green mx-auto" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-childfund-green mb-2">{communitiesImpacted}</p>
                  <p className="text-gray-600">
                    {donorData.profile === "guardiao" ? "OSPs/Municípios onde atuamos" : `Comunidade${communitiesImpacted > 1 ? 's' : ''} impactada${communitiesImpacted > 1 ? 's' : ''}`}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Para doadores únicos, mostra número de doações se tiver mais que 1 */}
            {donorData.profile === "unico" && realDonations.length > 1 && (
              <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="mb-3">
                    <Gift className="text-purple-600 mx-auto" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-purple-600 mb-2">{realDonations.length}</p>
                  <p className="text-gray-600">Doação{realDonations.length > 1 ? 'ões' : ''} realizada{realDonations.length > 1 ? 's' : ''}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}



        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-childfund-green/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-childfund-green flex items-center gap-2">
                <CreditCard className="text-childfund-green" size={20} />
                Sua jornada de generosidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Reviva cada momento especial das suas contribuições e veja o impacto que você gerou.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/donations')}
                className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white transition-all duration-300"
              >
                Ver minha história
              </Button>
            </CardContent>
          </Card>
          
          {/* Substituído "Benefícios Exclusivos" por "Atualizar Pagamento" */}
          <Card className="border-childfund-yellow/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-childfund-green flex items-center gap-2">
                <Settings className="text-childfund-yellow" size={20} />
                Atualizar Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Atualize seu cartão de crédito ou conta bancária de forma rápida e segura.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/payment')}
                className="border-childfund-yellow text-childfund-yellow hover:bg-childfund-yellow hover:text-gray-800 transition-all duration-300"
              >
                Gerenciar pagamento
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-childfund-orange/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-childfund-green flex items-center gap-2">
                <HelpCircle className="text-childfund-orange" size={20} />
                Estamos aqui por você
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Nossa equipe está pronta para atender você com carinho e dedicação.</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/help')}
                className="border-childfund-orange text-childfund-orange hover:bg-childfund-orange hover:text-white transition-all duration-300"
              >
                Falar conosco
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </LoggedLayout>
  );
}

