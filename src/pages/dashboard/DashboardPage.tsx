import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Users, Calendar, Gift, MapPin, Clock, Sparkles, Star, CreditCard, HelpCircle, User, TrendingUp, Mail, MailOpen, Settings, AlertTriangle, Loader2 } from "lucide-react";
import { testPaymentMethodsWithDSOLogin } from '../../utils/testDSOLogin';
import { useToast } from '@/hooks/use-toast';
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
  
  // Estados para carregar dados reais
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [realInvoicesData, setRealInvoicesData] = useState<any>(null);
  const [realDataError, setRealDataError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Função para categorizar dados das faturas/doações (igual à DonationsPage)
  const categorizeInvoiceData = (invoicesArray: any[]) => {
    console.log('🔍 [categorizeInvoiceData] Estrutura dos dados recebidos:', {
      isArray: Array.isArray(invoicesArray),
      length: invoicesArray?.length || 0,
      firstItem: invoicesArray?.[0] || null
    });

    const categorized = {
      sponsorships: 0,
      monthlyDonations: 0,
      singleDonations: 0,
      totalValue: 0,
      activePlans: 0,
      totalSingleDonationsValue: 0,
      totalMonthlyValue: 0
    };

    // Processar array de faturas diretamente (como na DonationsPage)
    if (Array.isArray(invoicesArray)) {
      invoicesArray.forEach((invoice: any) => {
        const invoiceType = determineInvoiceType(invoice);
        const amount = invoice.totalamount || 0;
        
        categorized.totalValue += amount;
        
        switch (invoiceType) {
          case 'sponsorship':
            categorized.sponsorships++;
            break;
          case 'monthly':
            categorized.monthlyDonations++;
            categorized.totalMonthlyValue += amount;
            break;
          case 'once':
            categorized.singleDonations++;
            categorized.totalSingleDonationsValue += amount;
            break;
        }
      });
    }

    return categorized;
  };

  // Função para determinar o tipo de uma fatura específica
  const determineInvoiceType = (invoice: any): 'monthly' | 'once' | 'sponsorship' => {
    if (invoice.invoice_details && invoice.invoice_details.length > 0) {
      const productName = invoice.invoice_details[0].productname?.toLowerCase() || '';
      const invoiceDetailName = invoice.invoice_details[0].invoicedetailname?.toLowerCase() || '';
      
      // Apadrinhamento
      if (productName.includes('apadrinhamento') || invoiceDetailName.includes('apadrinhamento') ||
          productName.includes('sponsorship') || invoiceDetailName.includes('sponsorship')) {
        return 'sponsorship';
      }
      
      // Doação Regular (Guardião)
      if (productName.includes('regular') || productName.includes('doação regular') || 
          invoiceDetailName.includes('regular') || invoiceDetailName.includes('doação regular') ||
          productName.includes('mensal') || productName.includes('recorrente') ||
          productName.includes('guardian') || productName.includes('guardião') ||
          invoiceDetailName.includes('mensal') || invoiceDetailName.includes('recorrente') ||
          invoiceDetailName.includes('guardian') || invoiceDetailName.includes('guardião')) {
        return 'monthly';
      }
    }
    
    // Padrão: Doação Única
    return 'once';
  };

  // Função para carregar dados reais usando o mesmo fluxo que funciona em test-payment-methods
  const loadRealDashboardData = async () => {
    if (!user) return;

    setIsLoadingRealData(true);
    setRealDataError(null);

    try {
      console.log('🔍 [Dashboard] Carregando dados reais para:', user.email);
      
      // Verificar se temos as credenciais necessárias
      const userCpf = user.cpf || user.document;
      console.log('🔍 [Dashboard] Dados do usuário:', {
        email: user.email,
        dynamicsId: user.dynamicsId,
        contactId: user.contactId,
        cpf: userCpf,
        hasCredentials: !!userCpf
      });

      let contactId = user.dynamicsId || user.contactId;
      
      if (!contactId) {
        console.warn('⚠️ [Dashboard] ContactId não disponível no usuário. Usuário pode precisar fazer login novamente.');
        throw new Error('ContactId não disponível. Faça login novamente para atualizar seus dados.');
      }

      console.log('🎯 [Dashboard] Usando contactId:', contactId);

      // Usar endpoint direto que já funciona
      // Testar conectividade com o servidor
      console.log('🔄 [Dashboard] Testando conectividade com servidor...');
      try {
        // Primeiro, testar um endpoint simples para verificar se o servidor está rodando
        const testResponse = await fetch('http://localhost:3000/api/test', { method: 'GET' });
        console.log('🏥 [Dashboard] Teste de conectividade:', testResponse.status);
        if (!testResponse.ok) {
          throw new Error(`Servidor respondeu com status ${testResponse.status}`);
        }
      } catch (healthError) {
        console.error('💀 [Dashboard] Servidor não está respondendo:', healthError);
        throw new Error(`Servidor local não está acessível: ${healthError.message}`);
      }

      const endpointUrl = `http://localhost:3000/api/dynamics/direct-data/${contactId}`;
      console.log('🔄 [Dashboard] Fazendo requisição para:', endpointUrl);
      
      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 [Dashboard] Status da resposta:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ [Dashboard] Erro na requisição:', errorData);
        console.error('❌ [Dashboard] URL que falhou:', endpointUrl);
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const directData = await response.json();
      console.log('✅ [Dashboard] Dados diretos carregados:', {
        success: directData.success,
        hasData: !!directData.data,
        dataKeys: directData.data ? Object.keys(directData.data) : null,
        dataStructure: directData
      });
      
      if (directData.success && directData.data) {
        console.log('✅ [Dashboard] Dados recebidos do endpoint direto:', {
          success: directData.success,
          hasData: !!directData.data,
          hasInvoices: !!directData.data.invoices,
          hasInvoicesAll: !!directData.data.invoices?.all,
          invoicesAllLength: directData.data.invoices?.all?.length || 0,
          hasCategories: !!directData.data.invoices?.categories,
          activePlans: directData.data.invoices?.categories?.activePlans?.length || 0,
          donationHistory: directData.data.invoices?.categories?.donationHistory?.length || 0
        });

        // Extrair dados do endpoint direct-data
        let invoicesArray = [];
        
        // O endpoint direct-data retorna a estrutura: data.invoices.all
        if (directData.data.invoices && directData.data.invoices.all && Array.isArray(directData.data.invoices.all)) {
          invoicesArray = directData.data.invoices.all;
          console.log('✅ [Dashboard] Usando data.invoices.all:', invoicesArray.length, 'faturas');
        } else if (Array.isArray(directData.data.invoices)) {
          // Fallback: se for array direto
          invoicesArray = directData.data.invoices;
          console.log('✅ [Dashboard] Usando data.invoices como array:', invoicesArray.length, 'faturas');
        } else {
          console.error('❌ [Dashboard] Estrutura de dados não reconhecida:', directData.data.invoices);
        }
        
        console.log('🔍 [Dashboard] Faturas processadas:', {
          originalType: typeof directData.data.invoices,
          processedArray: invoicesArray,
          arrayLength: invoicesArray.length,
          firstItem: invoicesArray[0] || null
        });

        // Salvar array processado
        setRealInvoicesData(invoicesArray);
        
        // Determinar a aba ativa baseada nos dados reais
        const categorizedData = categorizeInvoiceData(invoicesArray);
        
        console.log('📊 Dashboard categorizado:', categorizedData);
        
        // Priorizar: Apadrinhamento > Guardião > Único > Padrão
        if (categorizedData.sponsorships > 0) {
          setActiveView("padrinho");
          console.log('📍 [Dashboard] Definindo aba: PADRINHO (apadrinhamentos encontrados)');
        } else if (categorizedData.monthlyDonations > 0) {
          setActiveView("guardiao");
          console.log('📍 [Dashboard] Definindo aba: GUARDIÃO (doações mensais encontradas)');
        } else if (categorizedData.singleDonations > 0) {
          setActiveView("unico");
          console.log('📍 [Dashboard] Definindo aba: ÚNICO (doações únicas encontradas)');
        } else {
          setActiveView("padrinho");
          console.log('📍 [Dashboard] Definindo aba: PADRINHO (padrão - sem dados)');
        }
      } else {
        throw new Error(directData.error || 'Dados não encontrados');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setRealDataError(errorMessage);
      
      console.error('❌ [Dashboard] Erro ao carregar dados reais:', error);
      
      toast({
        title: "Erro ao carregar dashboard",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoadingRealData(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      navigate("/auth/login");
      return;
    }
    
    // Set page title
    document.title = "Área do Doador - ChildFund Brasil";
    
    // Set initial view based on user profile ONLY if no real data has been loaded yet
    if (donorData?.profile && !realInvoicesData) {
      setActiveView(donorData.profile);
      console.log(`[Dashboard] Setting initial view to: ${donorData.profile} (from donorData)`);
    }
  }, [user, isLoading, navigate, donorData]);

  // Carregar dados quando o usuário estiver autenticado
  useEffect(() => {
    if (user && !isLoading && !realInvoicesData && !isLoadingRealData && !isMockMode) {
      console.log('🔄 [Dashboard] Usuário autenticado, carregando dados...');
      loadRealDashboardData();
    }
  }, [user, isLoading, isMockMode]);

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    navigate("/auth/login");
    return null;
  }

  // Show nothing while loading to avoid flash
  if (isLoading || !donorData) {
    return null;
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

  // Obter dados consolidados das faturas/doações reais
  const getConsolidatedData = () => {
    console.log('🔍 [getConsolidatedData] Estado atual:', {
      hasRealInvoicesData: !!realInvoicesData,
      realInvoicesDataType: typeof realInvoicesData,
      isArray: Array.isArray(realInvoicesData),
      length: realInvoicesData?.length || 0,
      donorDataDonations: donorData?.donations?.length || 0
    });

    if (!realInvoicesData || !Array.isArray(realInvoicesData) || realInvoicesData.length === 0) {
      // Se não temos dados reais, calcular baseado nos dados do donorData (se existirem)
      console.log('⚠️ [getConsolidatedData] Sem dados reais, calculando do donorData');
      
      const fallbackDonations = donorData?.donations || [];
      let fallbackSponsorships = 0;
      let fallbackMonthly = 0; 
      let fallbackSingle = 0;
      let fallbackTotalValue = 0;
      let fallbackSingleValue = 0;
      let fallbackMonthlyValue = 0;
      
      // SEM dados mockados - usar apenas dados reais do donorData se existirem
      if (fallbackDonations.length > 0) {
        fallbackSingle = fallbackDonations.length;
        fallbackSingleValue = fallbackDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
      }
      
      // Não adicionar dados fictícios - se não tiver dados reais, mostrar 0
      console.log('🔍 [Dashboard] Fallback baseado apenas em dados reais do donorData:', {
        profile: donorData?.profile,
        realDonationsCount: fallbackDonations.length,
        realDonationsValue: fallbackSingleValue
      });
      
      fallbackTotalValue = fallbackSingleValue + fallbackMonthlyValue;
      
      return {
        sponsorships: (donorData as any).sponsorships || [],
        monthlyDonations: [],
        singleDonations: fallbackDonations,
        totalValue: fallbackTotalValue,
        activePlans: fallbackMonthly,
        categorized: {
          sponsorships: fallbackSponsorships,
          monthlyDonations: fallbackMonthly,
          singleDonations: fallbackSingle,
          totalValue: fallbackTotalValue,
          activePlans: fallbackMonthly,
          totalSingleDonationsValue: fallbackSingleValue,
          totalMonthlyValue: fallbackMonthlyValue
        }
      };
    }

    const categorizedData = categorizeInvoiceData(realInvoicesData);
    console.log('✅ [getConsolidatedData] Dados categorizados:', categorizedData);
    
    return {
      sponsorships: realInvoicesData.filter((inv: any) => determineInvoiceType(inv) === 'sponsorship'),
      monthlyDonations: realInvoicesData.filter((inv: any) => determineInvoiceType(inv) === 'monthly'),
      singleDonations: realInvoicesData.filter((inv: any) => determineInvoiceType(inv) === 'once'),
      totalValue: categorizedData.totalValue,
      activePlans: categorizedData.activePlans,
      categorized: categorizedData
    };
  };

  const consolidatedData = getConsolidatedData();
  
  // Dados para uso nas abas
  const realSponsorships = consolidatedData.sponsorships;
  const realDonations = consolidatedData.singleDonations;
  const realSponsoredChild = (donorData as any).sponsoredChild;
  
  // Totalizadores baseados nos dados reais
  const totalDonated = consolidatedData.totalValue;
  const activePlansCount = consolidatedData.activePlans;
  const donationsCount = consolidatedData.categorized.singleDonations;

  const getAvailableTabs = () => {
    // Sempre mostrar todas as 3 abas, independente do histórico do usuário
    return ["padrinho", "guardiao", "unico"];
  };

  const availableTabs = getAvailableTabs();

  // Verificar se usuário tem apadrinhamentos ativos
  const hasActiveSponsorships = consolidatedData.categorized.sponsorships > 0 || (realSponsorships && realSponsorships.length > 0);
  
  // Verificar se usuário tem doações mensais ativas (guardião)
  const hasMonthlyDonations = consolidatedData.categorized.monthlyDonations > 0 || donorData?.monthlyDonation?.status === 'active' || activePlansCount > 0;
  
  // Verificar se usuário tem histórico de doações únicas
  const hasOneTimeDonations = consolidatedData.categorized.singleDonations > 0 || (realDonations && realDonations.length > 0);

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

  const renderGuardiaoContent = () => {
    // Usar dados já processados
    const monthlyDonationsData = consolidatedData.monthlyDonations;
    const hasRealMonthlyData = consolidatedData.categorized.monthlyDonations > 0;
    const totalMonthlyAmount = consolidatedData.categorized.totalMonthlyValue;
    
    console.log('🔍 [Dashboard Guardião] Dados processados:', {
      count: consolidatedData.categorized.monthlyDonations,
      totalValue: totalMonthlyAmount,
      hasData: hasRealMonthlyData,
      invoicesArray: Array.isArray(realInvoicesData),
      invoicesLength: realInvoicesData?.length || 0
    });

    return (
      <div className="space-y-6">
        <Card className="border-childfund-green/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            {hasRealMonthlyData ? (
              <>
                {/* Header com impacto valorizado */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-childfund-green to-childfund-blue rounded-full flex items-center justify-center">
                      <Star className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-childfund-green">Guardião da Infância</h3>
                      <p className="text-sm text-gray-600">Transformando vidas todos os meses</p>
                    </div>
                  </div>
                  
                  {/* Estatísticas principais */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-childfund-green/10 to-childfund-blue/10 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-childfund-green">
                        {consolidatedData.categorized.monthlyDonations || activePlansCount}
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        Plano{(consolidatedData.categorized.monthlyDonations || activePlansCount) > 1 ? 's' : ''} Ativo{(consolidatedData.categorized.monthlyDonations || activePlansCount) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-childfund-blue">
                        {totalMonthlyAmount > 0 ? formatCurrency(totalMonthlyAmount) : 'R$ 0,00'}
                      </p>
                      <p className="text-sm font-medium text-gray-700">Total Mensal</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mt-4 italic">
                    "Sua constância constrói futuros. Cada mês você semeia esperança e colhe transformação."
                  </p>
                </div>

                {/* Preview dos planos ativos */}
                {monthlyDonationsData.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-childfund-green flex items-center gap-2">
                      <Calendar size={16} />
                      Seus Planos Ativos
                    </h4>
                    {monthlyDonationsData.slice(0, 3).map((invoice: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-childfund-green-light/30 rounded-lg border border-childfund-green/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-childfund-green/20 rounded-full flex items-center justify-center">
                            <Star className="text-childfund-green" size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-childfund-green">
                              {invoice.invoice_details?.[0]?.productname || 'Guardião da Infância'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Ativo desde {invoice.createdon ? formatDate(invoice.createdon) : 'Data não disponível'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-childfund-blue">
                            {formatCurrency(invoice.totalamount || 0)}
                          </p>
                          <p className="text-xs text-gray-500">Muito obrigado! 🌟</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Impacto estimado */}
                <div className="bg-gradient-to-r from-childfund-green/5 to-childfund-blue/5 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-childfund-green mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Seu Impacto Contínuo
                  </h4>
                  <p className="text-sm text-gray-600">
                    Com suas doações mensais, você está ajudando aproximadamente{' '}
                    <span className="font-bold text-childfund-green">
                      {Math.min(consolidatedData.categorized.monthlyDonations * 15, 200)} crianças
                    </span>{' '}
                    em programas educacionais, de saúde e desenvolvimento comunitário.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-childfund-green/20 to-childfund-blue/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-childfund-green" size={40} />
                </div>
                <h3 className="text-xl font-bold text-childfund-green mb-2">Torne-se um Guardião da Infância</h3>
                <p className="text-gray-600 mb-6">
                  Com uma doação mensal, você cria um impacto constante e transformador na vida de crianças e comunidades.
                </p>
                <Button 
                  onClick={() => navigate('/doacao-mensal')}
                  className="bg-gradient-to-r from-childfund-green to-childfund-blue hover:from-childfund-green/90 hover:to-childfund-blue/90 text-white font-bold px-8 py-3"
                >
                  <Star className="mr-2" size={18} />
                  Começar Minha Jornada
                </Button>
              </div>
            )}
            
            {/* Ações */}
            {hasRealMonthlyData && (
              <div className="grid md:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => navigate('/dashboard/donations')}
                  className="bg-childfund-green hover:bg-childfund-green/90 text-white font-bold"
                >
                  <TrendingUp className="mr-2" size={16} />
                  Ver Histórico Completo
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/payment')}
                  variant="outline"
                  className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                >
                  <CreditCard className="mr-2" size={16} />
                  Atualizar Pagamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUnicoContent = () => {
    // Usar dados já processados
    const singleDonationsData = consolidatedData.singleDonations;
    const hasRealSingleData = consolidatedData.categorized.singleDonations > 0;
    const totalSingleValue = consolidatedData.categorized.totalSingleDonationsValue;
    
    console.log('🔍 [Dashboard Único] Dados processados:', {
      count: consolidatedData.categorized.singleDonations,
      totalValue: totalSingleValue,
      hasData: hasRealSingleData,
      invoicesArray: Array.isArray(realInvoicesData),
      invoicesLength: realInvoicesData?.length || 0
    });

    return (
      <div className="space-y-6">
        <Card className="border-childfund-green/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            {hasRealSingleData ? (
              <>
                {/* Header com impacto valorizado */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-childfund-orange to-childfund-yellow rounded-full flex items-center justify-center">
                      <Gift className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-childfund-green">Sua Generosidade em Ação</h3>
                      <p className="text-sm text-gray-600">Doações pontuais que fazem a diferença</p>
                    </div>
                  </div>
                  
                  {/* Estatísticas principais */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-childfund-orange/10 to-childfund-yellow/20 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-childfund-orange">
                        {consolidatedData.categorized.singleDonations}
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        Doaç{consolidatedData.categorized.singleDonations > 1 ? 'ões' : 'ão'} Realizada{consolidatedData.categorized.singleDonations > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-childfund-green">
                        {totalSingleValue > 0 ? formatCurrency(totalSingleValue) : 'R$ 0,00'}
                      </p>
                      <p className="text-sm font-medium text-gray-700">Total Doado</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mt-4 italic">
                    "Cada doação sua planta uma semente de esperança que floresce em oportunidades reais."
                  </p>
                </div>

                {/* Preview das doações mais recentes */}
                {singleDonationsData.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-childfund-green flex items-center gap-2">
                      <Clock size={16} />
                      Suas Contribuições Recentes
                    </h4>
                    {singleDonationsData.slice(0, 3).map((invoice: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-childfund-green-light/30 rounded-lg border border-childfund-green/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-childfund-orange/20 rounded-full flex items-center justify-center">
                            <Gift className="text-childfund-orange" size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-childfund-green">
                              {invoice.invoice_details?.[0]?.productname || 'Contribuição para o ChildFund'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {invoice.createdon ? formatDate(invoice.createdon) : 'Data não disponível'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-childfund-orange">
                            {formatCurrency(invoice.totalamount || 0)}
                          </p>
                          <p className="text-xs text-gray-500">Obrigado! 💚</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-childfund-orange/20 to-childfund-yellow/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="text-childfund-orange" size={40} />
                </div>
                <h3 className="text-xl font-bold text-childfund-green mb-2">Transforme Vidas com Sua Generosidade</h3>
                <p className="text-gray-600 mb-6">
                  Cada doação única é uma oportunidade de criar impacto imediato na vida de crianças e famílias.
                </p>
                <Button 
                  onClick={() => navigate('/doacao-unica')}
                  className="bg-gradient-to-r from-childfund-orange to-childfund-yellow hover:from-childfund-orange/90 hover:to-childfund-yellow/90 text-white font-bold px-8 py-3"
                >
                  <Heart className="mr-2" size={18} />
                  Fazer Minha Primeira Doação
                </Button>
              </div>
            )}
            
            {/* Ações */}
            {hasRealSingleData && (
              <div className="grid md:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => navigate('/doacao-unica')}
                  className="bg-gradient-to-r from-childfund-orange to-childfund-yellow hover:from-childfund-orange/90 hover:to-childfund-yellow/90 text-white font-bold"
                >
                  <Gift className="mr-2" size={16} />
                  Fazer Nova Doação
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard/donations')}
                  variant="outline"
                  className="border-childfund-green text-childfund-green hover:bg-childfund-green hover:text-white"
                >
                  <TrendingUp className="mr-2" size={16} />
                  Ver Histórico Completo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const finalTotalDonated = consolidatedData.totalValue > 0 ? consolidatedData.totalValue : (Array.isArray(donorData.donations)
    ? (donorData.donations as { amount: number }[]).reduce((sum, donation) => sum + (donation.amount || 0), 0)
    : 0);
  
  // Estatísticas baseadas nos dados reais (não no perfil mockado)
  const childrenHelped = hasActiveSponsorships ? (consolidatedData.categorized.sponsorships || realSponsorships.length) : 
                         hasMonthlyDonations ? Math.min(consolidatedData.categorized.monthlyDonations * 15, 135) : // Estimativa: cada doação mensal impacta ~15 crianças
                         hasOneTimeDonations ? Math.min(consolidatedData.categorized.singleDonations * 3, 50) : 0; // Estimativa: cada doação única impacta ~3 crianças
  const communitiesImpacted = hasActiveSponsorships ? Math.min(consolidatedData.categorized.sponsorships, 5) : // Máximo 5 comunidades por apadrinhamento
                              hasMonthlyDonations ? Math.min(Math.ceil(consolidatedData.categorized.monthlyDonations / 2), 28) : // Estimativa: cada 2 doações mensais = 1 comunidade
                              hasOneTimeDonations ? Math.min(Math.ceil(consolidatedData.categorized.singleDonations / 5), 10) : 0; // Estimativa: cada 5 doações = 1 comunidade

  // Determinar se deve mostrar estatísticas de impacto baseado apenas em dados reais
  const shouldShowImpactStats = hasActiveSponsorships || hasMonthlyDonations || hasOneTimeDonations;

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

        {/* Loading indicator para dados reais */}
        {isLoadingRealData && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Carregando seus dados...</p>
                  <p className="text-sm text-blue-700">Buscando histórico de doações e planos ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Erro ao carregar dados reais */}
        {realDataError && !isMockMode && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Dados em modo de desenvolvimento</p>
                    <p className="text-sm text-yellow-700">Usando dados de exemplo. Erro: {realDataError}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadRealDashboardData}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                      {hasActiveSponsorships ? `${consolidatedData.categorized.sponsorships || realSponsorships.length} apadrinhamento${(consolidatedData.categorized.sponsorships || realSponsorships.length) > 1 ? 's' : ''}` : 'Apadrinhar criança'}
                    </span>
                    <span className="sm:hidden">
                      {hasActiveSponsorships ? `${consolidatedData.categorized.sponsorships || realSponsorships.length} criança${(consolidatedData.categorized.sponsorships || realSponsorships.length) > 1 ? 's' : ''}` : 'Apadrinhar'}
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
                      {hasMonthlyDonations ? 
                        (consolidatedData.categorized.monthlyDonations || activePlansCount) === 1 
                          ? '1 doação mensal ativa' 
                          : `${consolidatedData.categorized.monthlyDonations || activePlansCount} doações mensais ativas`
                        : 'Contribuição mensal'}
                    </span>
                    <span className="sm:hidden">
                      {hasMonthlyDonations ? `${consolidatedData.categorized.monthlyDonations || activePlansCount} ativa${(consolidatedData.categorized.monthlyDonations || activePlansCount) > 1 ? 's' : ''}` : 'Contribuir'}
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
                      {hasOneTimeDonations ? 
                        (consolidatedData.categorized.singleDonations || realDonations.length) === 1 
                          ? '1 doação realizada' 
                          : `${consolidatedData.categorized.singleDonations || realDonations.length} doações realizadas`
                        : 'Fazer doação'}
                    </span>
                    <span className="sm:hidden">
                      {hasOneTimeDonations ? `${consolidatedData.categorized.singleDonations || realDonations.length} realizada${(consolidatedData.categorized.singleDonations || realDonations.length) > 1 ? 's' : ''}` : 'Doar'}
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
            {finalTotalDonated > 0 && (
              <Card className="border-childfund-green/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="mb-3">
                    <Heart className="text-childfund-orange mx-auto animate-pulse" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-childfund-green mb-2">{formatCurrency(finalTotalDonated)}</p>
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
                    {hasActiveSponsorships ? `Criança${childrenHelped > 1 ? 's' : ''} apadrinhada${childrenHelped > 1 ? 's' : ''}` : 
                     hasMonthlyDonations ? "Crianças impactadas pelos programas" : 
                     "Crianças impactadas pelas doações"}
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
                    {hasActiveSponsorships ? `Comunidade${communitiesImpacted > 1 ? 's' : ''} com apadrinhamento${communitiesImpacted > 1 ? 's' : ''}` :
                     hasMonthlyDonations ? "OSPs/Municípios onde atuamos" : 
                     `Comunidade${communitiesImpacted > 1 ? 's' : ''} impactada${communitiesImpacted > 1 ? 's' : ''}`}
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

