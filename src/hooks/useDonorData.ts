import { useAuth } from "../contexts/AuthContext";
import { mockUsers } from "../mocks/userProfiles";
import { DSOService } from "../services/DSOService";
import { useState, useEffect } from "react";
import { useLocalDonations } from "../contexts/LocalDonationsContext";

export interface MonthlyDonation {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "failed";
}

export interface OneTimeDonation {
  id: string;
  date: string;
  amount: number;
  purpose: string;
}

export interface SponsorshipInfo {
  childName: string;
  childAge: number;
  childLocation: string;
  childPhoto: string;
  sponsorshipStart: string;
  monthlyAmount: number;
  lastLetter: string;
}

export interface DonorProfile {
  type: "monthly" | "once" | "sponsor";
  monthlyPlan?: {
    amount: number;
    startDate: string;
    nextPayment: string;
  };
  recentDonations?: OneTimeDonation[];
  sponsorship?: SponsorshipInfo;
  totalDonated: number;
  impactStats: {
    childrenHelped: number;
    communitiesImpacted: number;
  };
}

// Interface para dados reais do DSO
export interface RealDonorData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  profile: "padrinho" | "guardiao" | "unico";
  donorType: "sponsor" | "monthly" | "single";
  donations: Array<{
    id: string;
    date: string;
    amount: number;
    type: "monthly" | "single" | "sponsorship";
    status: "completed" | "pending" | "cancelled";
    description: string;
  }>;
  letters?: Array<{
    id: string;
    date: string;
    type: "sent" | "received";
    content: string;
    status: "delivered" | "pending" | "received";
  }>;
  visits?: Array<{
    id: string;
    date: string;
    status: "scheduled" | "completed" | "cancelled";
    location: string;
  }>;
  monthlyDonation?: {
    amount: number;
    nextPayment: string;
    status: "active" | "pending" | "cancelled";
    paymentMethod: "credit_card" | "pix" | "bank_transfer";
  };
  sponsoredChild?: {
    id: string;
    name: string;
    age: number;
    location: string;
    image: string;
    story: string;
    needs: string[];
    gender: "M" | "F";
  };
  // Dados financeiros reais
  financialSummary?: {
    totalDonated: number;
    totalDonations: number;
    monthlyAmount: number;
    lastDonationDate: string;
    nextDonationDate?: string;
    paymentMethod: string;
  };
  // Apadrinhamentos reais
  sponsorships?: Array<{
    childId: string;
    childName: string;
    startDate: string;
    monthlyAmount: number;
    status: "active" | "paused" | "cancelled";
  }>;
  // Avisos sobre funcionalidades não disponíveis
  warnings?: string[];
}

export function useDonorData() {
  const { mockProfile, isMockMode, user } = useAuth();
  const { localDonations } = useLocalDonations();
  const [realDonorData, setRealDonorData] = useState<RealDonorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  
  // Se estiver em modo mockado, retornar dados mockados
  if (isMockMode) {
  return mockUsers[mockProfile];
  }
  
  // Resetar cache quando o usuário muda
  useEffect(() => {
    console.log('🔄 useDonorData: Usuário mudou, resetando cache...', {
      userId: user?.id,
      isMockMode,
      isMockUser: user?.isMockUser
    });
    
    // Limpar dados anteriores
    setRealDonorData(null);
    setError(null);
    setHasAttemptedLoad(false);
    setLoading(false);
  }, [user?.id]); // Resetar sempre que o ID do usuário mudar

  // Se não estiver em modo mockado, buscar dados reais
  useEffect(() => {
    // Só tentar buscar dados reais se:
    // 1. Não estiver em modo mockado
    // 2. Tiver um usuário com ID
    // 3. Não tiver tentado carregar ainda
    // 4. Não estiver carregando
    // 5. O usuário não for mockado
    if (!isMockMode && 
        user?.id && 
        !hasAttemptedLoad && 
        !loading && 
        !user?.isMockUser) {
      console.log('🔍 useDonorData: Iniciando carregamento dos dados reais...', user.id);
      setHasAttemptedLoad(true);
      loadRealDonorData();
    }
  }, [isMockMode, user?.id, user?.isMockUser, hasAttemptedLoad, loading]);

  const loadRealDonorData = async () => {
    if (!user?.id) {
      console.log('⚠️ useDonorData: Usuário sem ID, não carregando dados');
      return;
    }
    
    // Throttle: só executar se passou pelo menos 5 segundos da última execução
    const now = Date.now();
    if (now - lastLoadTime < 5000) {
      console.log('⚠️ useDonorData: Throttled - aguardando intervalo mínimo');
      return;
    }
    
    setLastLoadTime(now);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 useDonorData: Carregando dados reais do doador:', user.id);
      console.log('🔍 useDonorData: Dados do usuário:', {
        id: user.id,
        name: user.name,
        email: user.email,
        isMockUser: user.isMockUser
      });
      
      const warnings: string[] = [];
      
      // Buscar dados do perfil
      let profileData = null;
      try {
        console.log('🔍 useDonorData: Buscando perfil do doador...');
        profileData = await DSOService.getDonorProfile(user.id);
        console.log('✅ useDonorData: Perfil do doador carregado:', profileData);
        
        // ⚠️ DEBUG: Log detalhado dos produtos recebidos
        if (profileData?.success && profileData?.data) {
          console.group('🔍 [useDonorData] DEBUG - Análise de produtos/doações');
          console.log('📋 Dados completos do perfil:', profileData.data);
          console.log('🛍️ Campo products:', profileData.data.products);
          console.log('🛍️ Tipo do campo products:', typeof profileData.data.products);
          console.log('🛍️ Array.isArray(products):', Array.isArray(profileData.data.products));
          console.log('🛍️ Length dos products:', profileData.data.products?.length);
          
          // Verificar outros campos que podem conter informações sobre doações
          const potentialFields = [
            'subscriptions', 'memberships', 'plans', 'services', 'donations',
            'orders', 'transactions', 'payments', 'history', 'purchases',
            'contributions', 'sponsorships_data', 'financial_history',
            'payment_history', 'order_history', 'donation_history'
          ];
          potentialFields.forEach(field => {
            if (profileData.data[field]) {
              console.log(`🔍 Campo ${field} encontrado:`, profileData.data[field]);
            }
          });
          
          // Log de TODOS os campos disponíveis para análise
          console.log('🔍 TODOS os campos do perfil:', Object.keys(profileData.data));
          console.log('🔍 Dados completos (estrutura):', JSON.stringify(profileData.data, null, 2).slice(0, 2000) + '...');
          console.groupEnd();
        }
      } catch (error) {
        console.warn('⚠️ useDonorData: Perfil do doador não disponível:', error);
        warnings.push('Perfil do doador não está disponível no momento');
      }
      
      // Buscar apadrinhamentos
      let sponsorshipsData = null;
      try {
        console.log('🔍 useDonorData: Buscando apadrinhamentos...');
        sponsorshipsData = await DSOService.getEnrichedSponsorships(user.id);
        console.log('✅ useDonorData: Apadrinhamentos carregados:', sponsorshipsData);
      } catch (error) {
        console.warn('⚠️ useDonorData: Apadrinhamentos não disponíveis:', error);
        warnings.push('Dados de apadrinhamentos não estão disponíveis no momento');
      }
      
      // ⚠️ EXPERIMENTAL: Tentar buscar histórico de doações
      let donationHistoryData = null;
      try {
        console.log('🔍 useDonorData: EXPERIMENTAL - Buscando histórico de doações...');
        donationHistoryData = await DSOService.getDonationHistory(user.id);
        
        if (donationHistoryData?.success) {
          console.log('✅ useDonorData: Histórico de doações encontrado!', donationHistoryData);
        } else if (donationHistoryData?.isNotImplemented) {
          console.log('ℹ️ useDonorData: Endpoints de histórico não implementados');
        } else {
          console.log('⚠️ useDonorData: Histórico de doações não disponível');
        }
      } catch (error) {
        console.warn('⚠️ useDonorData: Erro ao buscar histórico de doações:', error);
      }

      // Buscar histórico de cartas (agora com tratamento silencioso de erro)
      let lettersData = null;
      try {
        console.log('🔍 useDonorData: Buscando histórico de cartas...');
        lettersData = await DSOService.getDonorLetters();
        
        // Verificar se o endpoint não está implementado
        if (lettersData?.isNotImplemented) {
          console.log('ℹ️ useDonorData: Endpoint de cartas não implementado');
          // ✅ Mensagem específica removida - será substituída por mensagem geral
        } else if (lettersData?.hasError) {
          // ✅ Mensagem específica removida - será substituída por mensagem geral
        } else {
          console.log('✅ useDonorData: Histórico de cartas carregado:', lettersData);
        }
      } catch (error) {
        // Este catch não deve mais ser executado, mas mantemos por segurança
        console.warn('⚠️ useDonorData: Histórico de cartas não disponível:', error);
        // ✅ Mensagem específica removida - será substituída por mensagem geral
      }
      
      // ✅ MENSAGEM GERAL MELHORADA
      warnings.push('Algumas funcionalidades estão sendo desenvolvidas e estarão disponíveis em breve para enriquecer sua experiência como doador.');
      
      // Mapear dados para interface RealDonorData
      const mappedData: RealDonorData = {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        profile: determineProfile(profileData, sponsorshipsData),
        donorType: determineDonorType(profileData, sponsorshipsData),
        donations: mapDonations(profileData, donationHistoryData), // Mapear com base nos produtos + histórico
        letters: mapLetters(lettersData),
        visits: [], // ⚠️ Não disponível na documentação
        monthlyDonation: mapMonthlyDonation(profileData), // Mapear com base nos produtos
        sponsoredChild: mapSponsoredChild(sponsorshipsData),
        financialSummary: mapFinancialSummary(profileData), // Mapear com base nos produtos
        sponsorships: mapSponsorships(sponsorshipsData),
        warnings: warnings.length > 0 ? warnings : undefined,
      };
      
      setRealDonorData(mappedData);
      console.log('✅ Dados reais do doador carregados:', mappedData);
      
      if (warnings.length > 0) {
        console.warn('⚠️ Avisos sobre funcionalidades não disponíveis:', warnings);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados reais do doador:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback para dados básicos
      setRealDonorData({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        profile: "unico",
        donorType: "single",
        donations: [],
        letters: [],
        visits: [],
        warnings: [
          'Erro ao carregar dados do servidor',
          'Algumas funcionalidades estão sendo desenvolvidas e estarão disponíveis em breve para enriquecer sua experiência como doador.',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções auxiliares para mapear dados
  const determineProfile = (profileData: any, sponsorshipsData: any): "padrinho" | "guardiao" | "unico" => {
    // Verificar apadrinhamentos usando a estrutura correta
    if (sponsorshipsData?.data?.sponsorships?.length > 0) {
      console.log('🔍 determineProfile: Usuário tem apadrinhamentos - perfil: padrinho');
      return "padrinho";
    }
    if (profileData?.data?.products?.some((p: any) => p.type === 'monthly')) {
      console.log('🔍 determineProfile: Usuário tem produto mensal - perfil: guardiao');
      return "guardiao";
    }
    console.log('🔍 determineProfile: Usuário sem histórico - perfil: unico');
    return "unico";
  };

  const determineDonorType = (profileData: any, sponsorshipsData: any): "sponsor" | "monthly" | "single" => {
    // Verificar apadrinhamentos usando a estrutura correta
    if (sponsorshipsData?.data?.sponsorships?.length > 0) {
      console.log('🔍 determineDonorType: Usuário tem apadrinhamentos - tipo: sponsor');
      return "sponsor";
    }
    if (profileData?.data?.products?.some((p: any) => p.type === 'monthly')) {
      console.log('🔍 determineDonorType: Usuário tem produto mensal - tipo: monthly');
      return "monthly";
    }
    console.log('🔍 determineDonorType: Usuário sem histórico - tipo: single');
    return "single";
  };

  const mapLetters = (lettersData: any): RealDonorData['letters'] => {
    // Se não há dados ou há erro, retornar array vazio
    if (!lettersData?.success || !lettersData?.data || lettersData?.hasError || lettersData?.isNotImplemented) {
      return [];
    }
    
    // Se os dados vêm do formato antigo (letters)
    if (lettersData.letters && Array.isArray(lettersData.letters)) {
      return lettersData.letters.map((letter: any) => ({
        id: letter.letterId || letter.id || Math.random().toString(),
        date: letter.sentDate || letter.date || new Date().toISOString(),
        type: 'received',
        content: letter.message || letter.content || 'Carta não disponível',
        status: letter.status === 1 ? 'delivered' : 'pending'
      }));
    }
    
    // Se os dados vêm no formato novo (data)
    if (Array.isArray(lettersData.data)) {
      return lettersData.data.map((letter: any) => ({
        id: letter.id || Math.random().toString(),
        date: letter.date || new Date().toISOString(),
        type: letter.type || 'received',
        content: letter.content || 'Carta não disponível',
        status: letter.status || 'delivered'
      }));
    }
    
    return [];
  };

  const mapSponsoredChild = (sponsorshipsData: any): RealDonorData['sponsoredChild'] => {
    // Verificar se temos dados reais de apadrinhamento
    if (!sponsorshipsData?.data?.sponsorships?.length) return undefined;
    
    const firstSponsorship = sponsorshipsData.data.sponsorships[0];
    console.log('🔍 mapSponsoredChild: Processando criança:', firstSponsorship);
    
    return {
      id: firstSponsorship.childId || 'unknown',
      name: firstSponsorship.childName || 'Criança',
      age: firstSponsorship.childAge || 0,
      location: firstSponsorship.childLocation || '',
      image: firstSponsorship.childImage || '/placeholder-child.jpg',
      story: firstSponsorship.childStory || 'História da criança apadrinhada',
      needs: firstSponsorship.childNeeds || ['Educação', 'Saúde', 'Nutrição'],
      gender: firstSponsorship.childGender || 'M'
    };
  };

  const mapSponsorships = (sponsorshipsData: any): RealDonorData['sponsorships'] => {
    // Verificar se temos dados reais de apadrinhamento
    if (!sponsorshipsData?.data?.sponsorships?.length) return [];
    
    console.log('🔍 mapSponsorships: Processando apadrinhamentos:', sponsorshipsData.data.sponsorships);
    
    return sponsorshipsData.data.sponsorships.map((sponsorship: any) => ({
      childId: sponsorship.childId || 'unknown',
      childName: sponsorship.childName || 'Criança',
      startDate: sponsorship.startDate || new Date().toISOString(),
      monthlyAmount: sponsorship.monthlyAmount || 74.00, // Valor padrão baseado no relatório
      status: sponsorship.status || 'active'
    }));
  };

  const mapDonations = (profileData: any, donationHistoryData?: any): RealDonorData['donations'] => {
    // 1. Doações do servidor (products do perfil)
    const serverDonations = [];
    if (profileData?.success && profileData?.data?.products) {
      const products = profileData.data.products;
      console.log('🔍 mapDonations: Produtos encontrados no perfil:', products);
      
      products.forEach((product: any, index: number) => {
        serverDonations.push({
          id: product.id || `server_product_${index}`,
          date: product.created_at || product.startDate || new Date().toISOString(),
          amount: product.amount || product.value || 0,
          type: product.type || 'single',
          status: product.status || 'completed',
          description: product.description || product.name || 'Doação'
        });
      });
    }

    // 2. Doações do histórico (se disponível)
    const historyDonations = [];
    if (donationHistoryData?.success && donationHistoryData?.data) {
      console.log('🔍 mapDonations: Histórico encontrado:', donationHistoryData.data);
      
      // Tentar diferentes estruturas de dados que podem vir do histórico
      let historyItems = [];
      
      if (Array.isArray(donationHistoryData.data)) {
        historyItems = donationHistoryData.data;
      } else if (donationHistoryData.data.donations && Array.isArray(donationHistoryData.data.donations)) {
        historyItems = donationHistoryData.data.donations;
      } else if (donationHistoryData.data.orders && Array.isArray(donationHistoryData.data.orders)) {
        historyItems = donationHistoryData.data.orders;
      } else if (donationHistoryData.data.transactions && Array.isArray(donationHistoryData.data.transactions)) {
        historyItems = donationHistoryData.data.transactions;
      }
      
      historyItems.forEach((item: any, index: number) => {
        historyDonations.push({
          id: item.id || item.orderId || item.transactionId || `history_${index}`,
          date: item.date || item.created_at || item.transaction_date || new Date().toISOString(),
          amount: item.amount || item.value || item.total || 0,
          type: item.type || item.donation_type || 'single',
          status: item.status || 'completed',
          description: item.description || item.purpose || 'Doação histórica'
        });
      });
      
      console.log('🔍 mapDonations: Doações do histórico processadas:', historyDonations);
    }
    
    // Doações locais (da sessão atual)
    const localDonationsFormatted = localDonations.map(donation => ({
      id: donation.id,
      date: donation.date,
      amount: donation.amount,
      type: donation.type,
      status: donation.status,
      description: donation.description
    }));
    
    // 3. Combinar todas as doações e remover duplicatas
    const allDonations = [...localDonationsFormatted, ...historyDonations, ...serverDonations];
    const uniqueDonations = allDonations.filter((donation, index, self) => 
      index === self.findIndex(d => d.id === donation.id)
    );
    
    console.log('🔍 mapDonations: Doações combinadas:', {
      servidor: serverDonations.length,
      historico: historyDonations.length,
      locais: localDonationsFormatted.length,
      total: uniqueDonations.length,
      donations: uniqueDonations
    });
    
    return uniqueDonations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const mapMonthlyDonation = (profileData: any): RealDonorData['monthlyDonation'] => {
    if (!profileData?.success || !profileData?.data?.products) return undefined;
    
    const monthlyProduct = profileData.data.products.find((p: any) => 
      p.type === 'monthly' || p.frequency === 'monthly' || p.recurring === true
    );
    
    if (!monthlyProduct) return undefined;
    
    console.log('🔍 mapMonthlyDonation: Produto mensal encontrado:', monthlyProduct);
    
    return {
      amount: monthlyProduct.amount || monthlyProduct.value || 0,
      nextPayment: monthlyProduct.nextPayment || '',
      status: monthlyProduct.status === 'active' ? 'active' : 'pending',
      paymentMethod: monthlyProduct.paymentMethod || 'credit_card'
    };
  };

  const mapFinancialSummary = (profileData: any): RealDonorData['financialSummary'] => {
    if (!profileData?.success || !profileData?.data?.products) return undefined;
    
    const products = profileData.data.products;
    if (!products.length) return undefined;
    
    const totalDonated = products.reduce((sum: number, product: any) => 
      sum + (product.amount || product.value || 0), 0
    );
    
    const monthlyProduct = products.find((p: any) => 
      p.type === 'monthly' || p.frequency === 'monthly' || p.recurring === true
    );
    
    console.log('🔍 mapFinancialSummary: Produtos processados:', products);
    
    return {
      totalDonated,
      totalDonations: products.length,
      monthlyAmount: monthlyProduct?.amount || monthlyProduct?.value || 0,
      lastDonationDate: products[products.length - 1]?.created_at || '',
      nextDonationDate: monthlyProduct?.nextPayment || '',
      paymentMethod: monthlyProduct?.paymentMethod || 'Não definido'
    };
  };

  // Retornar dados reais se disponíveis, senão retornar dados básicos do usuário
  if (realDonorData) {
    return realDonorData;
  }

  // Fallback para dados básicos do usuário autenticado
  if (user && !user.isMockUser) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      profile: "unico" as const,
      donorType: user.donorType,
      donations: [],
      letters: [],
      visits: [],
      monthlyDonation: undefined,
      warnings: [
        'Carregando dados do servidor...',
        'Algumas funcionalidades estão sendo desenvolvidas e estarão disponíveis em breve para enriquecer sua experiência como doador.',
      ],
    };
  }

  // Se não há usuário ou está carregando, retornar dados vazios
  return {
    id: '',
    name: '',
    email: '',
    cpf: '',
    profile: "unico" as const,
    donorType: "single",
    donations: [],
    letters: [],
    visits: [],
    monthlyDonation: undefined,
    warnings: ['Usuário não autenticado'],
  };
}
