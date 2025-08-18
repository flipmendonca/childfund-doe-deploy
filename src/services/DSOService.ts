import { Child, ChildFilters } from '@/types/Child';
import { dsoClient } from '@/lib/dso/DSOClient';
import { 
  UserOrderGeneratorData, 
  GeneratorOrdersData, 
  DebitPaymentData, 
  AuthenticationData, 
  AuthenticationResponse,
  UserProfile,
  SimpleDSOResponse
} from '@/types/DSO';

interface DSOResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Definições para cadastro de usuários
interface RegisterData {
  email: string;
  name: string;
  document: string;
  phone: string;
  password: string;
  address: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  country: string;
  gender: string;
  birthDate: string;
  type_document: string;
}

interface RegisterResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  isMock?: boolean;
  warning?: string;
}

interface DSOResponse {
  '@odata.context': string;
  '@odata.count': number;
  value: Array<{
    '@search.score': number;
    contactid: string;
    id: string;
    nome: string;
    genero: string;
    datadenascimento: string;
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    imagefotoperfil: string | null;
    descricao: string;
    statuscode: number;
    statecode: number;
    sinkcreatedon: string;
    sinkmodifiedon: string;
  }>;
}

interface DSORequestParams {
  limit?: number;
  page?: number;
  genero?: string;
  nome?: string;
}

// Constante para URL base do DSO
const DSO_HOST = 'https://dso.childfundbrasil.org.br/';

/**
 * Serviço para comunicação com o endpoint DSO
 */
export class DSOService {
  private static readonly BASE_URL = 'https://dso.childfundbrasil.org.br/';
  
  // Flag para controlar logs repetitivos
  private static hasLoggedLettersError = false;

  /**
   * Configura headers específicos para o ambiente Vercel
   */
  private static getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Headers específicos para ambiente Vercel
    if (typeof window !== 'undefined') {
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    return headers;
  }

  /**
   * Busca perfil do doador DSO
   */
  static async getDonorProfile(userId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      console.log('🔍 [DSOService] Buscando perfil do doador via my-profile...');
      console.log('🔍 [DSOService] UserID:', userId);
      console.log('🔍 [DSOService] Ambiente:', typeof window !== 'undefined' ? 'Browser' : 'Server');
      
      // Verificar se há token configurado
      const token = localStorage.getItem('auth-token') || localStorage.getItem('childfund-auth-token');
      console.log('🔍 [DSOService] Token encontrado:', token ? 'Sim' : 'Não');
      if (token) {
        console.log('🔍 [DSOService] Token (primeiros 20 chars):', token.substring(0, 20) + '...');
      }
      
      if (!token) {
        console.warn('⚠️ [DSOService] Token não encontrado para buscar perfil');
        return {
          success: false,
          message: 'Token de autenticação não encontrado'
        };
      }
      
      // Usar endpoint /api/v1/my-profile que retorna dados completos do usuário logado
      const url = `${this.BASE_URL}api/v1/my-profile`;
      console.log('🔍 [DSOService] Fazendo requisição para:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(token),
        credentials: 'include'
      });

      console.log('📡 [DSOService] Status da resposta:', response.status);
      console.log('📡 [DSOService] Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [DSOService] Perfil do doador encontrado via my-profile:', data);
        
        // ⚠️ DEBUG: Log detalhado dos campos recebidos
        console.group('🔍 [DSOService] DEBUG - Dados recebidos do DSO');
        console.log('📋 Dados completos:', data);
        console.log('🏠 Campos de endereço:');
        console.log('  - street:', data.street, typeof data.street);
        console.log('  - number:', data.number, typeof data.number);
        console.log('  - neighborhood:', data.neighborhood, typeof data.neighborhood);
        console.log('  - city:', data.city, typeof data.city);
        console.log('  - state:', data.state, typeof data.state);
        console.log('  - cep:', data.cep, typeof data.cep);
        console.log('  - addressComplement:', data.addressComplement, typeof data.addressComplement);
        console.log('  - country:', data.country, typeof data.country);
        console.log('  - birthDate:', data.birthDate, typeof data.birthDate);
        console.groupEnd();
        
        return {
          success: true,
          data: data
        };
      } else {
        const errorText = await response.text();
        console.warn('⚠️ [DSOService] Erro ao buscar perfil:', response.status, errorText);
        
        // Log específico para debug no Vercel
        console.error('❌ [DSOService] Erro HTTP:', response.status);
        console.error('❌ [DSOService] Response text:', errorText);
        
        return {
          success: false,
          message: errorText || `Erro HTTP ${response.status}`
        };
      }
    } catch (error) {
      console.error('❌ [DSOService] Erro ao buscar perfil do doador:', error);
      console.error('❌ [DSOService] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca perfil do doador por email (dados mais completos)
   */
  static async getDonorProfileByEmail(email: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      console.log('🔍 DSO: Buscando perfil do doador por email:', email);
      
      // Verificar se há token configurado
      const token = localStorage.getItem('auth-token') || localStorage.getItem('childfund-auth-token');
      if (token) {
        dsoClient.setToken(token);
      }
      
      // Buscar dados do usuário por email
      const userData = await dsoClient.getUserByEmail(email);
      
      if (userData) {
        console.log('✅ DSO: Perfil do doador encontrado por email:', userData);
        return {
          success: true,
          data: userData
        };
      } else {
        console.warn('⚠️ DSO: Perfil do doador não encontrado por email');
        return {
          success: false,
          message: 'Perfil não encontrado por email'
        };
      }
    } catch (error) {
      console.error('❌ DSO: Erro ao buscar perfil do doador por email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno'
      };
    }
  }
      
  /**
   * Busca apadrinhamentos enriquecidos do doador
   */
  static async getEnrichedSponsorships(userId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      console.log('🔍 DSO: Buscando apadrinhamentos do doador:', userId);

      // Verificar se há token configurado
      const token = localStorage.getItem('auth-token') || localStorage.getItem('childfund-auth-token');
      if (token) {
        dsoClient.setToken(token);
      }

      // Buscar apadrinhamentos do usuário (endpoint GET conforme relatório)
      const response = await dsoClient.getSponsorships();
      
      if (response && response.length > 0) {
        console.log('✅ DSO: Apadrinhamentos encontrados:', response);
        return {
          success: true,
          data: {
            sponsorships: response.map((sponsorship: any) => ({
              childId: sponsorship.childId,
              childName: sponsorship.name,
              childAge: sponsorship.age || 0,
              childLocation: sponsorship.city && sponsorship.state ? `${sponsorship.city}, ${sponsorship.state}` : sponsorship.city || sponsorship.state || '',
              // Suporte a imagem Base64 conforme relatório
              childImage: sponsorship.photo && sponsorship.photo.startsWith('/9j/') 
                ? `data:image/jpeg;base64,${sponsorship.photo}` 
                : sponsorship.photo || '/placeholder-child.jpg',
              childStory: sponsorship.description || 'História da criança apadrinhada',
              childNeeds: ['Educação', 'Saúde', 'Nutrição'], // Dados padrão
              childGender: sponsorship.gender || 'M',
              startDate: sponsorship.startDate || new Date().toISOString(),
              monthlyAmount: parseFloat(sponsorship.sponsorshipValue || '0') || 74.00, // Valor padrão baseado no relatório
              status: sponsorship.status || 'active'
            }))
          }
        };
      } else {
        console.log('ℹ️ DSO: Nenhum apadrinhamento encontrado');
        return {
          success: true,
          data: {
            sponsorships: []
          }
        };
        }
    } catch (error) {
      console.error('❌ DSO: Erro ao buscar apadrinhamentos:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }



  /**
   * Busca histórico de doações do doador
   */
  static async getDonorDonations(userId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      console.log('🔍 DSO: Buscando histórico de doações do doador:', userId);
      
      // Por enquanto, retornar dados vazios pois o endpoint não está documentado
      // TODO: Implementar quando o endpoint estiver disponível
      console.log('ℹ️ DSO: Endpoint de doações não implementado ainda');
      
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('❌ DSO: Erro ao buscar doações:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca resumo financeiro do doador
   */
  static async getDonorFinancialSummary(userId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      console.log('🔍 DSO: Buscando resumo financeiro do doador:', userId);
      
      // Por enquanto, retornar dados vazios pois o endpoint não está documentado
      // TODO: Implementar quando o endpoint estiver disponível
      console.log('ℹ️ DSO: Endpoint de resumo financeiro não implementado ainda');
      
      return {
        success: true,
        data: {
          totalDonated: 0,
          totalDonations: 0,
          monthlyAmount: 0,
          lastDonationDate: null,
          nextDonationDate: null,
          paymentMethod: 'Não disponível'
        }
      };
    } catch (error) {
      console.error('❌ DSO: Erro ao buscar resumo financeiro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca histórico de visitas do doador
   */
  static async getDonorVisits(userId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      console.log('🔍 DSO: Buscando histórico de visitas do doador:', userId);
      
      // Por enquanto, retornar dados vazios pois o endpoint não está documentado
      // TODO: Implementar quando o endpoint estiver disponível
      console.log('ℹ️ DSO: Endpoint de visitas não implementado ainda');
      
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('❌ DSO: Erro ao buscar visitas:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca apadrinhamentos do doador
   */
  static async getDonorSponsorships(contactId: string): Promise<any> {
    try {
      console.log('🔍 Buscando apadrinhamentos do doador:', contactId);
      
      // Endpoint correto baseado na documentação
      const response = await fetch(`/dso/sponsorships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactid: contactId }),
      });

      if (!response.ok) {
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Apadrinhamentos obtidos:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar apadrinhamentos:', error);
      throw error;
    }
  }

  /**
   * Obtém histórico de cartas do doador
   */
  /**
   * EXPERIMENTAL: Tenta buscar histórico de doações/orders do usuário
   * Endpoint não documentado - tentativa baseada no padrão do letters-history
   */
  static async getDonationHistory(contactId?: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
    isNotImplemented?: boolean;
    hasError?: boolean;
  }> {
    try {
      console.log('🔍 [DSOService] EXPERIMENTAL: Buscando histórico de doações...');
      
      const token = localStorage.getItem('auth-token') || localStorage.getItem('childfund-auth-token');
      if (!token) {
        return {
          success: false,
          message: 'Token de autenticação necessário',
          hasError: true
        };
      }

      // Tentar diferentes endpoints possíveis
      const possibleEndpoints = [
        'api/v1/childfund/relationship/donation-history',
        'api/v1/childfund/relationship/order-history', 
        'api/v1/childfund/relationship/payment-history',
        'api/v1/user/donations',
        'api/v1/user/orders',
        'api/v1/my-donations',
        'api/v1/my-orders'
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          const url = contactId 
            ? `${this.BASE_URL}${endpoint}?contactId=${contactId}`
            : `${this.BASE_URL}${endpoint}`;
          
          console.log(`🔍 Testando endpoint: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Endpoint funcionou: ${endpoint}`, data);
            return {
              success: true,
              data: data,
              message: `Dados encontrados em: ${endpoint}`
            };
          } else if (response.status !== 404) {
            console.log(`⚠️ Endpoint ${endpoint}: ${response.status} - ${response.statusText}`);
          }
        } catch (error) {
          // Silenciar erros individuais de endpoints
        }
      }

      return {
        success: false,
        message: 'Nenhum endpoint de histórico encontrado',
        isNotImplemented: true
      };

    } catch (error) {
      console.error('❌ Erro ao buscar histórico de doações:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        hasError: true
      };
    }
  }

  static async getDonorLetters(): Promise<any> {
    try {
      console.log('🔍 Buscando histórico de cartas do doador');
      
      const token = await this.getAuthToken();
      
      // Se não há token, retornar dados mockados
      if (!token) {
        console.warn('⚠️ Sem token de autenticação - retornando cartas mockadas');
        return {
          success: true,
          letters: [
            {
              letterId: 'mock-1',
              sentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              message: 'Olá! Como você está? Espero que esteja bem.',
              status: 1
            },
            {
              letterId: 'mock-2', 
              sentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              message: 'Obrigado por todo o apoio!',
              status: 1
            }
          ],
          message: 'Histórico de cartas mockado (sem autenticação DSO)'
        };
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const contactId = user.id || '1234';
      
      const response = await fetch(`${this.BASE_URL}api/v1/childfund/relationship/letters-history?contactId=${contactId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Se o endpoint não existir (404), retornar dados vazios silenciosamente
        if (response.status === 404) {
          console.log('ℹ️ Endpoint de histórico de cartas não implementado no backend DSO');
          return {
            success: true,
            data: [],
            message: 'Endpoint não implementado no backend',
            isNotImplemented: true
          };
        }
        
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Histórico de cartas obtido:', data);
      return {
        success: true,
        data: data,
        message: 'Dados reais do DSO'
      };
    } catch (error) {
      // Log silencioso apenas uma vez para evitar spam no console
      if (!this.hasLoggedLettersError) {
        console.warn('⚠️ Erro ao buscar histórico de cartas (log será silenciado):', error);
        this.hasLoggedLettersError = true;
      }
      
      // Fallback silencioso para dados vazios
      return {
        success: true,
        data: [],
        message: 'Erro na busca - endpoint não disponível',
        hasError: true
      };
    }
  }



  /**
   * Altera cartão de crédito do usuário
   */
  static async changeCreditCard(cardData: {
    numero: string;
    mesexp: string;
    anoexp: string;
    cvc: string;
    ownername: string;
  }): Promise<any> {
    try {
      console.log('🔍 Alterando cartão de crédito');
      
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.BASE_URL}api/v1/childfund/payment/change-credit-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Cartão alterado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao alterar cartão:', error);
      throw error;
    }
  }

  /**
   * Altera conta bancária do usuário
   */
  static async changeBankAccount(bankData: {
    payName: string;
    doc: string;
    bankCode: string;
    accountNumber: string;
    payDigitaccountnumber: string;
    branchcode: string;
    digitBranchCode: string;
  }): Promise<any> {
    try {
      console.log('🔍 Alterando conta bancária');
      
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.BASE_URL}api/v1/childfund/payment/change-debit-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bankData),
      });

      if (!response.ok) {
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Conta bancária alterada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao alterar conta bancária:', error);
      throw error;
    }
  }

  /**
   * Redefine senha do usuário logado
   */
  static async resetPassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<any> {
    try {
      console.log('🔍 Redefinindo senha do usuário');
      
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.BASE_URL}api/v1/my-profile/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Senha redefinida com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }

  /**
   * Atualiza dados do perfil do usuário
   */
  static async updateProfile(profileData: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    [key: string]: any;
  }): Promise<any> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }
      
      // Filtrar apenas campos aceitos pelo DSO para atualização (conforme documentação)
      const allowedFields = [
        'name', 'email', 'document', 'phone', 'birthDate', 'gender', 'pronoun', 
        'profession', 'deficiency', 'street', 'number', 'addressComplement', 
        'neighborhood', 'city', 'state', 'country', 'cep'
      ];
      
      const filteredData: any = {};
      Object.keys(profileData).forEach(key => {
        if (allowedFields.includes(key) && profileData[key] !== undefined && profileData[key] !== '') {
          // Validação específica para o campo gender
          if (key === 'gender') {
            if (profileData[key] === 'M' || profileData[key] === 'F') {
              filteredData[key] = profileData[key];
            } else {
              console.warn('⚠️ DSO: Valor inválido para gender:', profileData[key]);
              // Não incluir gender se for inválido
            }
          } else {
            filteredData[key] = profileData[key];
          }
        }
      });
      
      console.log('🔍 DSO: Dados filtrados para atualização:', filteredData);
      
      // Fazer requisição direta para o DSO
      const response = await fetch(`${this.BASE_URL}api/v1/my-profile`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(filteredData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DSO: Erro na resposta:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        // Tentar parsear erro JSON se possível
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            throw new Error(`Erro na atualização: ${response.status} - ${errorJson.message}`);
          }
        } catch (parseError) {
          // Se não conseguir parsear JSON, usar texto direto
          throw new Error(`Erro na atualização: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ DSO: Perfil atualizado com sucesso:', data);
      
      // Retornar formato padronizado para o frontend
      return {
        success: true,
        data: data,
        message: 'Perfil atualizado com sucesso'
      };
    } catch (error) {
      console.error('❌ DSO: Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Busca dados de uma criança específica no Dynamics CRM
   */
  static async getChildDetails(childId: string): Promise<any> {
    try {
      console.log('🔍 Buscando detalhes da criança:', childId);
      
      const response = await fetch(`/dynamics/child`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'c5e53b87-d315-427d-a9f0-1d80d5f65f56', // NEXTKEY
        },
        body: JSON.stringify({ contactid: childId }),
      });

      if (!response.ok) {
        throw new Error(`Dynamics API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Detalhes da criança obtidos:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar detalhes da criança:', error);
      throw error;
    }
  }

  /**
   * Obtém token de autenticação do cookie ou localStorage
   */
  private static async getAuthToken(): Promise<string | null> {
    try {
      // 1. Tentar buscar do cookie (prioridade)
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => 
        cookie.trim().startsWith('childfund-auth-token=')
      );
      
      if (authCookie) {
        const token = authCookie.split('=')[1];
        console.log('🔍 Token encontrado em cookie:', token ? 'Sim' : 'Não');
        if (token) {
          console.log('✅ Token encontrado no cookie:', token.substring(0, 20) + '...');
          return token;
        }
      }
      
      // 2. Tentar buscar do localStorage de múltiplas formas para compatibilidade
      let token = null;
      
      // Buscar do loginData (estrutura atual do AuthContext)
      const loginData = localStorage.getItem('childfund-auth-data');
      if (loginData) {
        try {
          const parsed = JSON.parse(loginData);
          token = parsed.token;
          console.log('🔍 Token encontrado em childfund-auth-data:', token ? 'Sim' : 'Não');
        } catch (e) {
          console.warn('⚠️ Erro ao parsear childfund-auth-data');
        }
      }
      
      // 3. Tentar buscar de chaves diretas (fallback)
      if (!token) {
        token = localStorage.getItem('auth-token') || 
                localStorage.getItem('childfund-auth-token') ||
                localStorage.getItem('dso-token');
        console.log('🔍 Token encontrado em chaves diretas:', token ? 'Sim' : 'Não');
      }
      
      // 4. Tentar buscar de estrutura user (legado)
      if (!token) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          token = user.token || user.accessToken;
          console.log('🔍 Token encontrado em user:', token ? 'Sim' : 'Não');
        } catch (e) {
          console.warn('⚠️ Erro ao parsear user');
        }
      }
      
      if (!token) {
        console.warn('⚠️ Token de autenticação não encontrado');
        console.log('🔍 Cookies disponíveis:', document.cookie);
        console.log('🔍 Chaves disponíveis no localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('auth') || key && key.includes('token') || key && key.includes('user')) {
            console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
          }
        }
        return null;
      }
      
      console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.error('Erro ao obter token de autenticação:', error);
      return null;
    }
  }

  /**
   * Cadastra um novo usuário no sistema DSO
   */
  static async registerUser(data: RegisterData): Promise<RegisterResponse> {
    try {
      console.log('🔍 Tentando cadastro real no DSO...');
      
      // Formatar dados conforme especificação do DSO
      const formattedData = {
        type_document: data.type_document,
        name: data.name,
        phone: data.phone, // Manter formato brasileiro (XX) XXXXX-XXXX
        address: data.address,
        addressNumber: data.addressNumber,
        complement: data.addressComplement || '', // Campo opcional
        birthDate: data.birthDate,
        cep: data.cep, // Manter formato com hífen XXXXX-XXX
        city: data.city,
        confirm: data.password, // Campo de confirmação da senha
        country: data.country,
        document: data.document.replace(/[.-]/g, ''), // Remover pontos e traço do CPF
        email: data.email,
        gender: data.gender,
        neighborhood: data.neighborhood,
        password: data.password,
        state: data.state
      };

      console.log('📝 Dados formatados para DSO:', formattedData);
      
      const response = await fetch(`${DSO_HOST}api/v1/user-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('✅ Cadastro real realizado com sucesso!');
        return {
          success: true,
          data: responseData,
          message: 'Usuário cadastrado com sucesso',
          isMock: false
        };
      }

      // Verificar se é o erro específico do código IBGE
      if (response.status === 400 && responseData.message?.includes('new_cidade.new_cdigoibge')) {
        console.warn('⚠️ Erro de código IBGE detectado - usando fallback temporário');
        
        // Fallback temporário devido ao problema de código IBGE no DSO
        return {
          success: true,
          data: {
            id: `temp-user-${Date.now()}`,
            email: data.email,
            name: data.name,
            document: data.document,
            status: 'pending_validation'
          },
          message: 'Cadastro realizado com sucesso (aguardando validação do código IBGE)',
          isMock: true,
          warning: 'Código IBGE da cidade não encontrado no sistema DSO. Cadastro realizado em modo temporário.'
        };
      }

      // Verificar se é erro de usuário já existente
      if (response.status === 409) {
        console.warn('⚠️ Usuário já existe no sistema');
        return {
          success: false,
          error: 'Usuário já cadastrado no sistema',
          isMock: false
        };
      }

      console.error('❌ Erro no cadastro real:', responseData);
      return {
        success: false,
        error: responseData.message || 'Erro desconhecido no cadastro',
        isMock: false
      };

    } catch (error) {
      console.error('❌ Erro de conexão com DSO:', error);
      
      // Fallback para erro de conexão
      return {
        success: true,
        data: {
          id: `temp-user-${Date.now()}`,
          email: data.email,
          name: data.name,
          document: data.document,
          status: 'pending_connection'
        },
        message: 'Cadastro realizado com sucesso (aguardando conexão com DSO)',
        isMock: true,
        warning: 'Sistema DSO temporariamente indisponível. Cadastro realizado em modo temporário.'
      };
    }
  }

  /**
   * Mapeia dados do DSO para interface Child
   */
  private static mapDSOToChild(item: DSOResponse['value'][0]): Child {
    console.log('🔍 DSO: Mapeando item completo:', item);
    console.log('🔍 DSO: Campos principais:', {
      contactid: item.contactid,
      nome: item.nome,
      genero: item.genero,
      datadenascimento: item.datadenascimento,
      imagefotoperfil: item.imagefotoperfil ? 'tem imagem' : 'sem imagem',
      descricao: item.descricao?.substring(0, 50) + '...',
      cidade: item.cidade,
      estado: item.estado
    });

    const calculateAge = (birthDate: string): number => {
      if (!birthDate) {
        console.log('🔍 DSO: Data de nascimento vazia');
        return 0;
      }
      
      const birth = new Date(birthDate);
      
      // Verificar se a data é válida
      if (isNaN(birth.getTime())) {
        console.log('🔍 DSO: Data de nascimento inválida:', birthDate);
        return 0;
      }
      
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      // Verificar se a idade calculada é razoável
      if (age < 0 || age > 25) {
        console.log('🔍 DSO: Idade calculada suspeita:', age, 'para data:', birthDate);
        // Se a idade for muito alta ou negativa, pode ser um problema com o formato da data
        return Math.max(0, Math.min(age, 18)); // Limitar entre 0 e 18 anos
      }
      
      console.log('🔍 DSO: Idade calculada:', age, 'para data:', birthDate);
      return age;
    };

    const mapGender = (genero: string): 'M' | 'F' => {
      if (genero && genero.toLowerCase().includes('masculino')) return 'M';
      if (genero && genero.toLowerCase().includes('feminino')) return 'F';
      return 'M'; // fallback para não filtrar ninguém
    };

    // Extrair apenas o primeiro nome
    const primeiroNome = item.nome ? item.nome.split(' ')[0] : '';
    const gender = mapGender(item.genero);
    const age = calculateAge(item.datadenascimento);

    console.log('🔍 DSO: Valores calculados:', {
      primeiroNome,
      gender,
      age,
      location: item.cidade && item.estado ? `${item.cidade}, ${item.estado}` : item.cidade || item.estado || ''
    });

    // Corrigir imagem: tratar base64 e placeholder
    let imageUrl = '/placeholder-child.jpg';
    if (item.imagefotoperfil) {
      if (item.imagefotoperfil.startsWith('/9j/')) {
        imageUrl = `data:image/jpeg;base64,${item.imagefotoperfil}`;
      } else if (item.imagefotoperfil.startsWith('data:image')) {
        imageUrl = item.imagefotoperfil;
      } else if (item.imagefotoperfil.startsWith('http')) {
        imageUrl = item.imagefotoperfil;
      }
    }

    // Sortear necessidades variadas para cada criança
    const ALL_NEEDS = [
      'Apoio educacional',
      'Apoio nutricional',
      'Cuidados de saúde',
      'Desenvolvimento social',
      'Desenvolvimento artístico',
      'Proteção',
      'Educação',
      'Saúde'
    ];
    function getRandomNeeds() {
      const shuffled = ALL_NEEDS.sort(() => 0.5 - Math.random());
      const count = Math.floor(Math.random() * 3) + 2; // 2 a 4 necessidades
      return shuffled.slice(0, count);
    }

    const child = {
      id: item.contactid,
      contactid: item.contactid,
      name: primeiroNome,
      nome: item.nome,
      age: age,
      birthdate: item.datadenascimento,
      gender: gender,
      genero: item.genero,
      image: imageUrl,
      description: item.descricao,
      story: item.descricao,
      location: item.cidade && item.estado ? `${item.cidade}, ${item.estado}` : item.cidade || item.estado || '',
      cep: item.cep,
      logradouro: item.logradouro,
      numero: item.numero,
      complemento: item.complemento,
      bairro: item.bairro,
      cidade: item.cidade,
      estado: item.estado,
      statuscode: item.statuscode,
      statecode: item.statecode,
      sinkcreatedon: item.sinkcreatedon,
      sinkmodifiedon: item.sinkmodifiedon,
      needs: getRandomNeeds(),
      dynamicsData: {
        contactId: item.contactid,
        statusBloqueado: item.statecode !== 0,
        statusApadrinhamento: item.statuscode,
        genderCode: item.genero === 'Masculino' ? 1 : item.genero === 'Feminino' ? 2 : null,
        customGender: item.genero === 'Masculino' ? 1 : item.genero === 'Feminino' ? 2 : 0,
        estado: item.estado,
        cidade: item.cidade,
        dataUltimaAtualizacao: item.sinkmodifiedon
      }
    };

    console.log('🔍 DSO: Child mapeado:', {
      id: child.id,
      name: child.name,
      gender: child.gender,
      age: child.age,
      location: child.location
    });

    return child;
  }

  /**
   * Converte filtros do ChildFilters para parâmetros DSO
   */
  private static convertFiltersToDSOParams(filters: ChildFilters): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.gender && filters.gender !== 'all') {
      params.genero = filters.gender === 'M' ? 'Masculino' : 'Feminino';
    }

    if (filters.search) {
      params.nome = filters.search;
    }

    return params;
  }

  /**
   * Filtra crianças disponíveis para apadrinhamento
   * Exclui crianças com statuscode que indica que já estão apadrinhadas
   */
  private static filterAvailableChildren(children: Child[]): Child[] {
    console.log('🔍 DSO: Iniciando filtragem de crianças disponíveis');
    console.log('🔍 DSO: Total de crianças antes da filtragem:', children.length);
    
    // Log detalhado de todas as crianças para debug
    children.forEach((child, index) => {
      console.log(`🔍 DSO: Criança ${index + 1}:`, {
        id: child.id,
        name: child.name,
        statuscode: child.statuscode,
        statecode: child.statecode,
        statusBloqueado: child.dynamicsData?.statusBloqueado,
        tipoStatuscode: typeof child.statuscode,
        tipoStatecode: typeof child.statecode
      });
    });

    // Filtrar crianças disponíveis para apadrinhamento
    // Baseado nos valores reais do DSO:
    // statuscode 100000002 = Disponível para apadrinhamento
    // statecode 0 = Ativo
    const availableChildren = children.filter(child => {
      const isStatusAvailable = child.statuscode === 100000002;
      const isStateActive = child.statecode === 0;
      
      console.log('🔍 DSO: Verificando disponibilidade da criança:', {
        id: child.id,
        name: child.name,
        statuscode: child.statuscode,
        statecode: child.statecode,
        isStatusAvailable,
        isStateActive,
        isAvailable: isStatusAvailable && isStateActive
      });
      
      return isStatusAvailable && isStateActive;
    });

    console.log('🔍 DSO: Crianças disponíveis após filtragem:', availableChildren.length);
    return availableChildren;
  }

  /**
   * Lista crianças disponíveis para apadrinhamento
   * Implementação real usando endpoint DSO conforme documentação
   */
  static async listChildren(options: {
    filters?: ChildFilters;
    limit?: number;
    page?: number;
  } = {}): Promise<{
    children: Child[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      console.log('🔍 DSO: Iniciando busca de crianças reais do DSO');
      
      const { filters = {}, limit = 50, page = 1 } = options;

      // Construir parâmetros da query conforme documentação
      const queryParams = new URLSearchParams();
      
      // Parâmetros básicos
      if (limit) queryParams.set('limit', limit.toString());
      if (page) queryParams.set('page', page.toString());
      
      // Converter filtros para parâmetros DSO
      if (filters.gender) {
        const genderMap = { 'M': 'Masculino', 'F': 'Feminino' };
        queryParams.set('genero', genderMap[filters.gender as keyof typeof genderMap] || filters.gender);
      }
      
      if (filters.search) {
        queryParams.set('nome', filters.search);
      }
      
      // Endpoint real do DSO conforme documentação
      const url = `${this.BASE_URL}api/v1/childfund/list-children?${queryParams.toString()}`;
      console.log('🔍 DSO: URL da requisição:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('🔍 DSO: Status da resposta:', response.status);
      
      if (!response.ok) {
        // Se o endpoint não existir, tentar endpoint alternativo
        if (response.status === 404) {
          console.log('⚠️ Endpoint /list-children não encontrado, tentando endpoint alternativo...');
          
          // Tentar endpoint alternativo do DSO
          const alternativeUrl = `${this.BASE_URL}api/v1/children?${queryParams.toString()}`;
          console.log('🔍 DSO: Tentando endpoint alternativo:', alternativeUrl);
          
          const altResponse = await fetch(alternativeUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          
          if (!altResponse.ok) {
            throw new Error(`DSO API error: ${altResponse.status} ${altResponse.statusText}`);
          }
          
          const altData = await altResponse.json();
          console.log('🔍 DSO: Dados recebidos do endpoint alternativo:', altData);
          
          // Mapear dados do endpoint alternativo
          const children = this.mapAlternativeResponseToChildren(altData);
          const filteredChildren = this.filterAvailableChildren(children);

      return {
            children: filteredChildren,
            totalCount: filteredChildren.length,
            hasMore: false
          };
        }
        
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }
      
      const data: DSOResponse = await response.json();
      console.log('🔍 DSO: Dados recebidos do DSO:', {
        totalCount: data['@odata.count'],
        childrenCount: data.value?.length || 0
      });
      
      // Mapear dados DSO para interface Child
      const children = data.value?.map(item => this.mapDSOToChild(item)) || [];
      console.log('🔍 DSO: Crianças mapeadas:', children.length);
      
      // Filtrar crianças disponíveis para apadrinhamento
      const availableChildren = this.filterAvailableChildren(children);
      console.log('🔍 DSO: Crianças disponíveis após filtragem:', availableChildren.length);
      
      // Calcular se há mais páginas
      const hasMore = (page * limit) < (data['@odata.count'] || 0);
      
      return {
        children: availableChildren,
        totalCount: data['@odata.count'] || 0,
        hasMore
      };

    } catch (error) {
      console.error('❌ Erro ao consultar DSO:', error);
      
      // Em caso de erro, retornar array vazio em vez de dados mockados
      console.log('⚠️ Retornando array vazio devido a erro na API DSO');
      return {
        children: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  /**
   * Mapeia resposta alternativa do DSO para interface Child
   */
  private static mapAlternativeResponseToChildren(data: any): Child[] {
    if (!data || !Array.isArray(data)) {
      console.log('🔍 DSO: Resposta alternativa inválida:', data);
      return [];
    }
    
    return data.map((item: any) => ({
      id: item.contactid || item.id || Math.random().toString(),
      contactid: item.contactid || item.id || Math.random().toString(),
      name: item.nome?.split(' ')[0] || item.firstname || 'Criança',
      nome: item.nome || `${item.firstname || ''} ${item.lastname || ''}`.trim(),
      age: this.calculateAge(item.datadenascimento || item.birthdate),
      birthdate: item.datadenascimento || item.birthdate,
      gender: this.mapGender(item.genero || item.gendercode),
      genero: item.genero || (item.gendercode === 1 ? 'Feminino' : 'Masculino'),
      location: item.cidade && item.estado ? `${item.cidade}, ${item.estado}` : item.cidade || item.estado || '',
      needs: ['Educação', 'Saúde', 'Proteção'],
      image: item.imagefotoperfil || item.chf_fotocrianca_url || '/placeholder-child.jpg',
      description: item.descricao || 'Uma criança especial aguardando por alguém que possa fazer a diferença em sua vida.',
      story: item.descricao || 'Esta criança faz parte do programa ChildFund Brasil e está aguardando um padrinho ou madrinha.',
      statuscode: item.statuscode || 100000002,
      statecode: item.statecode || 0,
      cep: item.cep,
      logradouro: item.logradouro,
      numero: item.numero,
      complemento: item.complemento,
      bairro: item.bairro,
      cidade: item.cidade,
      estado: item.estado,
      sinkcreatedon: item.sinkcreatedon,
      sinkmodifiedon: item.sinkmodifiedon,
      dynamicsData: {
        contactId: item.contactid || item.id,
        statusBloqueado: item.new_statusbloqueado || false,
        statusApadrinhamento: item.new_statusapadrinhamento,
        genderCode: item.gendercode,
        customGender: item.new_genero,
        estado: item.estado,
        cidade: item.cidade,
        dataUltimaAtualizacao: item.sinkmodifiedon
      }
    }));
    }

  /**
   * Calcula idade baseada na data de nascimento
   */
  private static calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Mapeia gênero do DSO para formato interno
   */
  private static mapGender(genero: string | number): 'M' | 'F' {
    if (typeof genero === 'number') {
      return genero === 1 ? 'F' : 'M';
    }
    
    if (genero && genero.toLowerCase().includes('masculino')) return 'M';
    if (genero && genero.toLowerCase().includes('feminino')) return 'F';
    return 'M'; // fallback
  }

  /**
   * Testa a conectividade com o DSO
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 DSO: Testando conectividade com endpoint de crianças...');
      
      // Testar endpoint de crianças que é o mais importante
      const response = await fetch(`${this.BASE_URL}api/v1/childfund/list-children?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('🔍 DSO: Status da resposta do teste:', response.status);
      
      // Se retorna 200, 401 ou 404, significa que a API está funcionando
      // Se retorna HTML, significa que a API não está disponível
      const contentType = response.headers.get('content-type');
      const isHTML = contentType?.includes('text/html');
      
      console.log('🔍 DSO: Content-Type da resposta:', contentType);
      
      // Se retorna HTML, a API não está disponível
      if (isHTML) {
        console.log('❌ DSO: API retornou HTML - não disponível');
        return false;
      }
      
      // Se retorna 200, a API está funcionando perfeitamente
      if (response.status === 200) {
        console.log('✅ DSO: API funcionando perfeitamente');
        return true;
      }
      
      // Se retorna 401 ou 404, a API está funcionando mas pode ter problemas de autenticação ou endpoint
      if (response.status === 401 || response.status === 404) {
        console.log('⚠️ DSO: API funcionando mas com problemas de autenticação/endpoint');
        return true; // Consideramos que está funcionando
      }
      
      console.log('❌ DSO: Status inesperado:', response.status);
      return false;
    } catch (error) {
      console.error('❌ DSO: Falha no teste de conectividade:', error);
      return false;
    }
  }

  /**
   * Envia presente para criança
   */


  // ========== ENDPOINTS CRÍTICOS CONFORME DOCUMENTAÇÃO ==========

  /**
   * Endpoint para usuários NOVOS (sem cadastro)
   * Processa pagamento + cria usuário automaticamente
   * Conforme documentação: POST /api/v1/user-order-generator
   */
  static async userOrderGenerator(data: UserOrderGeneratorData): Promise<SimpleDSOResponse> {
    try {
      console.log('🔍 [DSOService] Processando user-order-generator (usuário novo)');
      console.log('📋 [DSOService] URL da requisição:', `${this.BASE_URL}api/v1/user-order-generator`);
      
      // 🔧 VALIDAÇÃO CRÍTICA: Verificar estrutura de arrays antes do envio
      if (data.childs && !Array.isArray(data.childs)) {
        console.warn('⚠️ [DSOService] CORREÇÃO: childs deve ser array, convertendo...');
        data.childs = Array.isArray(data.childs) ? data.childs : [];
      }
      
      // Garantir que campos críticos não sejam undefined
      const sanitizedData = {
        ...data,
        childs: data.childs || [],
        addressNumber: data.addressNumber || '0',
        addressComplement: data.addressComplement || '',
        pay_digitaccountnumber: data.pay_digitaccountnumber || '0',
        pay_digitbranchcode: data.pay_digitbranchcode || '0'
      };
      
      console.log('📋 [DSOService] Dados sanitizados (COMPLETOS):', JSON.stringify(sanitizedData, null, 2));

      const response = await fetch(`${this.BASE_URL}api/v1/user-order-generator`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(sanitizedData),
        credentials: 'include'
      });

      console.log('📡 [DSOService] Status da resposta user-order-generator:', response.status);
      console.log('📡 [DSOService] Status text:', response.statusText);
      console.log('📡 [DSOService] Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DSOService] Erro user-order-generator:', response.status, errorText);
        
        // Log detalhado para debug do 422 e 500
        if (response.status === 422 || response.status === 500) {
          console.error(`🔍 [DEBUG ${response.status}] Dados enviados que causaram erro:`, JSON.stringify(sanitizedData, null, 2));
          console.error(`🔍 [DEBUG ${response.status}] Headers enviados:`, Object.fromEntries(Object.entries(this.getHeaders())));
          
          // Tentar parsear a resposta de erro para mais detalhes
          try {
            const errorJson = JSON.parse(errorText);
            console.error(`🔍 [DEBUG ${response.status}] Detalhes do erro:`, errorJson);
            
            // Para erro 500, verificar campos que podem estar undefined
            if (response.status === 500) {
              console.error('🔍 [DEBUG 500] Verificando campos que podem estar undefined:');
              console.error('🔍 [DEBUG 500] Campos críticos:', {
                email: sanitizedData.email || 'UNDEFINED',
                phone: sanitizedData.phone || 'UNDEFINED', 
                address: sanitizedData.address || 'UNDEFINED',
                addressNumber: sanitizedData.addressNumber || 'UNDEFINED',
                neighborhood: sanitizedData.neighborhood || 'UNDEFINED',
                city: sanitizedData.city || 'UNDEFINED',
                state: sanitizedData.state || 'UNDEFINED',
                cep: sanitizedData.cep || 'UNDEFINED',
                childs: Array.isArray(sanitizedData.childs) ? `array[${sanitizedData.childs.length}]` : 'NOT_ARRAY'
              });
            }
          } catch (e) {
            console.error(`🔍 [DEBUG ${response.status}] Erro não é JSON válido:`, errorText);
          }
        }
        
        throw new Error(`Erro no processamento: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ [DSOService] user-order-generator sucesso:', responseData);

      return {
        success: true,
        data: responseData,
        message: 'Doação processada com sucesso'
      };
    } catch (error) {
      console.error('❌ [DSOService] Erro user-order-generator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Endpoint para Cartão de Crédito (logado ou não logado)
   * Conforme documentação: POST /api/v1/generator-orders
   */
  static async generatorOrders(data: GeneratorOrdersData): Promise<SimpleDSOResponse> {
    try {
      console.log('🔍 [DSOService] Processando generator-orders (cartão de crédito)');
      console.log('📋 [DSOService] URL da requisição:', `${this.BASE_URL}api/v1/generator-orders`);
      console.log('📋 [DSOService] Dados enviados:', data);
      
      const token = await this.getAuthToken();
      console.log('🔍 [DSOService] Token encontrado:', token ? 'Sim' : 'Não');

      // Preparar headers - se tem token, incluir Authorization
      const headers = this.getHeaders(token || undefined);

      const response = await fetch(`${this.BASE_URL}api/v1/generator-orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        credentials: 'include'
      });

      console.log('📡 [DSOService] Status da resposta generator-orders:', response.status);
      console.log('📡 [DSOService] Status text:', response.statusText);
      console.log('📡 [DSOService] Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DSOService] Erro generator-orders:', response.status, errorText);
        throw new Error(`Erro no processamento: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ [DSOService] generator-orders sucesso:', responseData);

      return {
        success: true,
        data: responseData,
        message: 'Pagamento processado com sucesso'
      };
    } catch (error) {
      console.error('❌ [DSOService] Erro generator-orders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Endpoint para Débito Automático (logado ou não logado)
   * Conforme documentação: POST /api/v1/childfund/payment/debit
   */
  static async childfundPaymentDebit(data: DebitPaymentData): Promise<SimpleDSOResponse> {
    try {
      console.log('🔍 [DSOService] Processando payment/debit (débito automático)');
      console.log('📋 [DSOService] URL da requisição:', `${this.BASE_URL}api/v1/childfund/payment/debit`);
      console.log('📋 [DSOService] Dados enviados:', data);
      
      const token = await this.getAuthToken();
      console.log('🔍 [DSOService] Token encontrado:', token ? 'Sim' : 'Não');
      
      if (token) {
        console.log('🔍 [DSOService] Token preview:', token.substring(0, 20) + '...');
      } else {
        console.warn('⚠️ [DSOService] DÉBITO SEM TOKEN - Endpoint pode exigir autenticação');
      }

      // Preparar headers conforme documentação - incluir header obrigatório para débito
      const headers = {
        ...this.getHeaders(token || undefined),
        'Prefer': 'return=representation' // Header obrigatório conforme documentação
      };
      
      console.log('🔍 [DSOService] Headers preparados:', Object.keys(headers));

      const response = await fetch(`${this.BASE_URL}api/v1/childfund/payment/debit`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        credentials: 'include'
      });

      console.log('📡 [DSOService] Status da resposta payment/debit:', response.status);
      console.log('📡 [DSOService] Status text:', response.statusText);
      console.log('📡 [DSOService] Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DSOService] Erro payment/debit:', response.status, errorText);
        
        // Log específico para erro 401 (não autorizado)
        if (response.status === 401) {
          console.error('🔍 [DEBUG 401] Erro de autenticação no débito automático');
          console.error('🔍 [DEBUG 401] Token usado:', token ? token.substring(0, 20) + '...' : 'NENHUM');
          console.error('🔍 [DEBUG 401] Sugestão: Use userOrderGenerator para usuários não logados');
        }
        
        throw new Error(`Erro no processamento: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ [DSOService] payment/debit sucesso:', responseData);

      return {
        success: true,
        data: responseData,
        message: 'Débito automático processado com sucesso'
      };
    } catch (error) {
      console.error('❌ [DSOService] Erro payment/debit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Endpoint de autenticação
   * Conforme documentação: POST /api/v1/authentication
   */
  static async authentication(data: AuthenticationData): Promise<AuthenticationResponse> {
    try {
      console.log('🔍 [DSOService] Processando authentication');
      console.log('📋 [DSOService] Login:', data.login);

      const response = await fetch(`${this.BASE_URL}api/v1/authentication`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });

      console.log('📡 [DSOService] Status da resposta authentication:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DSOService] Erro authentication:', response.status, errorText);
        throw new Error(`Erro na autenticação: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ [DSOService] authentication sucesso:', {
        success: responseData.success,
        userId: responseData.data?.user?.id,
        hasToken: !!responseData.data?.token
      });

      return responseData;
    } catch (error) {
      console.error('❌ [DSOService] Erro authentication:', error);
      throw error;
    }
  }

  /**
   * Endpoint de perfil do usuário logado
   * Conforme documentação: GET /api/v1/my-profile
   */
  static async myProfile(): Promise<UserProfile> {
    try {
      console.log('🔍 [DSOService] Buscando my-profile');
      
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${this.BASE_URL}api/v1/my-profile`, {
        method: 'GET',
        headers: this.getHeaders(token),
        credentials: 'include'
      });

      console.log('📡 [DSOService] Status da resposta my-profile:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DSOService] Erro my-profile:', response.status, errorText);
        throw new Error(`Erro ao buscar perfil: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ [DSOService] my-profile sucesso:', {
        name: responseData.name,
        email: responseData.email,
        hasContactId: !!responseData.contactid
      });

      return responseData;
    } catch (error) {
      console.error('❌ [DSOService] Erro my-profile:', error);
      throw error;
    }
  }

  /**
   * Processar doação/apadrinhamento usando endpoints corretos do DSO
   * Os endpoints são os mesmos para usuários logados e não logados
   * A diferença é apenas se enviamos o token de autenticação
   */
  static async processDonation(donationData: {
    childId?: string;
    amount: number;
    type: 'sponsorship' | 'donation';
    frequency: 'monthly' | 'once';
    paymentMethod: 'credit_card' | 'bank_transfer';
    // Dados do cartão (se aplicável)
    cardNumber?: string;
    cardHolderName?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    // Dados bancários (se aplicável)
    payName?: string;
    doc?: string;
    bankCode?: string;
    accountNumber?: string;
    payDigitaccountnumber?: string;
    branchcode?: string;
    digitBranchCode?: string;
  }): Promise<any> {
    try {
      console.log('🔍 [DSOService] Processando doação');
      console.log('📋 [DSOService] Dados da doação:', {
        type: donationData.type,
        amount: donationData.amount,
        paymentMethod: donationData.paymentMethod,
        childId: donationData.childId
      });
      
      const token = await this.getAuthToken();
      console.log('🔍 [DSOService] Token encontrado:', token ? 'Sim' : 'Não');

      if (donationData.paymentMethod === 'credit_card') {
        // CARTÃO DE CRÉDITO - usar /api/v1/generator-orders
        console.log('🔍 [DSOService] Debug dados recebidos:', {
          cardHolderName: donationData.cardHolderName,
          cardNumber: donationData.cardNumber,
          expiryMonth: donationData.expiryMonth,
          expiryYear: donationData.expiryYear,
          cvv: donationData.cvv
        });

        const generatorData: any = {
          childid: donationData.childId,
          donate_type: donationData.type === 'sponsorship' ? 'sponsorship' : 'donate',
          paymentMethod: 'credit_card',
          installments: 1,
          value: donationData.amount,
          // Manter campos flat para compatibilidade
          ownername: donationData.cardHolderName || '',
          numero: donationData.cardNumber?.replace(/\s/g, '') || '',
          mesexp: donationData.expiryMonth || '',
          anoexp: donationData.expiryYear || '',
          cvc: donationData.cvv || '',
          region: 1, // Campo obrigatório conforme API
          pay_duo_date: '10', // Dia padrão
          // Adicionar estrutura nested que a API pode estar esperando
          credit_card: {
            ownername: donationData.cardHolderName || '',
            numero: donationData.cardNumber?.replace(/\s/g, '') || '',
            mesexp: donationData.expiryMonth || '',
            anoexp: donationData.expiryYear || '',
            cvc: donationData.cvv || ''
          }
        };

        console.log('🔍 [DSOService] Debug generatorData mapeado:', generatorData);
        
        console.log('🔍 [DSOService] Usando /api/v1/generator-orders para cartão de crédito');
        return await this.generatorOrders(generatorData);
        
      } else {
        // DÉBITO AUTOMÁTICO - usar /api/v1/childfund/payment/debit
        const debitData: DebitPaymentData = {
          donate_type: 'sponsorship',
          childs: donationData.childId ? [donationData.childId] : [],
          pay_name: donationData.payName || '',
          pay_doc: donationData.doc?.replace(/[.-]/g, '') || '',
          pay_bankcode: donationData.bankCode || '',
          pay_accountnumber: donationData.accountNumber || '',
          pay_digitaccountnumber: donationData.payDigitaccountnumber || '',
          pay_branchcode: donationData.branchcode || '',
          pay_digitbranchcode: donationData.digitBranchCode || '',
          pay_duo_date: '10', // Dia padrão
          pay_type: 'debit',
          pay_value: donationData.amount
        };
        
        console.log('🔍 [DSOService] Usando /api/v1/childfund/payment/debit para débito automático');
        return await this.childfundPaymentDebit(debitData);
      }
      
    } catch (error) {
      console.error('❌ [DSOService] Erro ao processar doação:', error);
      throw error;
    }
  }

  // ===============================
  // REMOVIDO: getCurrentPaymentMethod() 
  // O endpoint não será construído neste momento e não queremos 
  // mostrar dados mockados para não confundir o usuário.

  // ===============================
  // RELACIONAMENTOS COM CRIANÇAS
  // ===============================

  /**
   * Agendamento de visita com criança apadrinhada
   * Conforme produção: POST /api/v1/childfund/relationship/schedule-visit
   */
  static async scheduleVisit(visitData: {
    childId: string;
    visitDate: string;
    visitHour: string;
    message: string;
  }): Promise<any> {
    try {
      console.log('🔍 Agendando visita com criança:', visitData);
      
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.BASE_URL}api/v1/childfund/relationship/schedule-visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(visitData),
      });

      if (!response.ok) {
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Visita agendada com sucesso:', data);
      
      // Retornar no formato da produção
      return {
        success: 'send invite',
        note: data?.message || 'Solicitação de visita enviada com sucesso',
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('❌ Erro ao agendar visita:', error);
      throw error;
    }
  }

  /**
   * Envio de carta para criança apadrinhada
   * Conforme documentação: POST /api/v1/childfund/relationship/send-letter
   */
  static async sendLetter(letterData: {
    childId: string;
    title: string;
    message: string;
    attachments?: string[];
  }): Promise<any> {
    try {
      console.log('🔍 Enviando carta para criança:', letterData);
      
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.BASE_URL}api/v1/childfund/relationship/send-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(letterData),
      });

      if (!response.ok) {
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Carta enviada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao enviar carta:', error);
      throw error;
    }
  }

  /**
   * Envio de presente para criança apadrinhada
   * Conforme documentação: POST /api/v1/childfund/relationship/send-gift
   */
  static async sendGift(giftData: {
    childId: string;
    title: string;
    type: string;
    value: number;
    message: string;
  }): Promise<any> {
    try {
      console.log('🔍 Enviando presente para criança:', giftData);
      
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.BASE_URL}api/v1/childfund/relationship/send-gift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(giftData),
      });

      if (!response.ok) {
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Presente enviado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao enviar presente:', error);
      throw error;
    }
  }

  /**
   * Histórico de cartas enviadas/recebidas
   * Conforme produção: GET /api/v1/childfund/relationship/list-all-letters
   */
  static async getLettersHistory(childId?: string): Promise<any> {
    try {
      console.log('🔍 Buscando histórico de cartas', childId ? `para criança ${childId}` : '');
      
      const token = await this.getAuthToken();
      
      // Usar mesmo endpoint da produção
      const response = await fetch(`${this.BASE_URL}api/v1/childfund/relationship/list-all-letters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`DSO API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Histórico de cartas carregado:', data);
      
      // Retornar no formato esperado pela produção
      return {
        success: 'letters',
        status: response.status,
        data: {
          letters: data.letters || data.data?.letters || []
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar histórico de cartas:', error);
      return {
        message: 'Erro ao buscar cartas, tente novamente mais tarde ou recarregue a página',
        error: error
      };
    }
  }

  // ===============================
  // CONTATO COM CHILDFUND
  // ===============================

  /**
   * Criar ticket de suporte no Dynamics CRM via API server
   * Usando a rota de dev conforme solicitado
   */
  static async contactChildFund(subject: string, message: string): Promise<any> {
    try {
      console.log('🔍 Criando ticket de suporte no Dynamics CRM:', { subject, message });
      
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      // Usar a API server que integra com Dynamics CRM
      const response = await fetch('/api/dynamics/support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          description: message,
          customerEmail: 'user-email@temp.com', // TODO: Usar email real do usuário logado
          priority: 'normal',
          source: 'portal-web'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Ticket criado com sucesso no Dynamics:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar ticket de suporte:', error);
      throw error;
    }
  }

} 