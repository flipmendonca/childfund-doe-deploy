/**
 * Serviço para gerenciar dados de perfil do usuário
 * Integra DSO e Dynamics CRM
 */

export interface DSOUser {
  email: string;
  name: string;
  products: Array<any>;
  institution: boolean;
  document: string;
  phone: string;
  type_document: string;
  companyName: string;
  isAuthorizedToPurchase?: boolean;
  street: string;
  number: string;
  addressComplement: string;
  neighborhood: string;
  state: string;
  profission: string;
  cep: string;
  city: string;
  country: string;
  birthDate: string;
  pronouns: string;
  gender: string;
  dynamicsId: string;
}

export interface DynamicsContact {
  contactid: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    complement: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  birthDate: string;
  gender: string;
  jobTitle: string;
  parentCustomerId: string;
  createdOn: string;
  modifiedOn: string;
}

export interface ConsolidatedUserData {
  dso?: DSOUser;
  dynamics?: DynamicsContact;
  metadata: {
    lastSync: string;
    sources: string[];
    hasDynamicsData: boolean;
    hasDSOData: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  sources?: string[];
}

class UserProfileService {
  private baseUrl = '/api/dso/user';

  /**
   * Busca perfil do usuário no DSO
   */
  async getDSOProfile(params: {
    userId?: string;
    document?: string;
    email?: string;
  }): Promise<ApiResponse<DSOUser>> {
    try {
      const searchParams = new URLSearchParams();
      if (params.userId) searchParams.append('userId', params.userId);
      if (params.document) searchParams.append('document', params.document);
      if (params.email) searchParams.append('email', params.email);

      const response = await fetch(`${this.baseUrl}/profile?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Garantir envio de cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar perfil no DSO');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil no DSO:', error);
      throw error;
    }
  }

  /**
   * Atualiza perfil do usuário no DSO
   */
  async updateDSOProfile(userId: string, profileData: Partial<DSOUser>): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileData,
        }),
        credentials: 'include', // Garantir envio de cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil no DSO');
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil no DSO:', error);
      throw error;
    }
  }

  /**
   * Busca dados do usuário no Dynamics CRM
   */
  async getDynamicsData(params: {
    dynamicsId?: string;
    contactId?: string;
  }): Promise<ApiResponse<DynamicsContact>> {
    try {
      const searchParams = new URLSearchParams();
      if (params.dynamicsId) searchParams.append('dynamicsId', params.dynamicsId);
      if (params.contactId) searchParams.append('contactId', params.contactId);

      const response = await fetch(`${this.baseUrl}/dynamics?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Garantir envio de cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar dados no Dynamics CRM');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar dados no Dynamics CRM:', error);
      throw error;
    }
  }

  /**
   * Atualiza dados do usuário no Dynamics CRM
   */
  async updateDynamicsData(contactId: string, contactData: Partial<DynamicsContact>): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/dynamics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId,
          contactData,
        }),
        credentials: 'include', // Garantir envio de cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar dados no Dynamics CRM');
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar dados no Dynamics CRM:', error);
      throw error;
    }
  }

  /**
   * Busca dados consolidados do usuário (DSO + Dynamics CRM)
   */
  async getConsolidatedData(params: {
    userId?: string;
    document?: string;
    email?: string;
    dynamicsId?: string;
  }): Promise<ApiResponse<ConsolidatedUserData>> {
    try {
      const searchParams = new URLSearchParams();
      if (params.userId) searchParams.append('userId', params.userId);
      if (params.document) searchParams.append('document', params.document);
      if (params.email) searchParams.append('email', params.email);
      if (params.dynamicsId) searchParams.append('dynamicsId', params.dynamicsId);

      const response = await fetch(`${this.baseUrl}/consolidated?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Garantir envio de cookies
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn('Erro ao parsear JSON da resposta consolidada:', jsonError);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao buscar dados consolidados');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar dados consolidados:', error);
      throw error;
    }
  }

  /**
   * Busca perfil do usuário logado
   */
  async getCurrentUserProfile(): Promise<ApiResponse<ConsolidatedUserData>> {
    try {
      console.log('🔍 Buscando perfil do usuário atual...');

      // Usar endpoint simplificado que já tem a lógica de autenticação
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Garantir envio de cookies
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn('Erro ao parsear JSON da resposta:', jsonError);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao buscar perfil do usuário atual');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário atual:', error);
      
      // Fallback: tentar buscar dados do localStorage
      try {
        let user: any = {};
        
        try {
          const authData = localStorage.getItem('childfund-auth-data');
          if (authData) {
            const parsedData = JSON.parse(authData);
            user = parsedData.user || {};
          }
        } catch (e) {
          // Fallback para estrutura antiga
          user = JSON.parse(localStorage.getItem('user') || '{}');
        }
        
        console.log('🔍 Fallback: Usando dados do localStorage:', user);
        
        if (user.id || user.cpf || user.email || user.document) {
          // Tentar buscar dados consolidados como fallback
          return await this.getConsolidatedData({
            userId: user.id,
            document: user.cpf || user.document,
            email: user.email,
            dynamicsId: user.dynamicsId,
          });
        }
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }
      
      throw error;
    }
  }

  /**
   * Sincroniza dados entre DSO e Dynamics CRM
   */
  async syncUserData(userId: string): Promise<ApiResponse<any>> {
    try {
      // 1. Buscar dados consolidados
      const consolidatedData = await this.getConsolidatedData({ userId });
      
      if (!consolidatedData.data) {
        throw new Error('Dados do usuário não encontrados');
      }

      const { dso, dynamics } = consolidatedData.data;

      // 2. Se temos dados do DSO mas não do Dynamics, criar no Dynamics
      if (dso && !dynamics && dso.dynamicsId) {
        // Implementar criação no Dynamics se necessário
        console.log('Dados do DSO encontrados, mas não no Dynamics CRM');
      }

      // 3. Se temos dados do Dynamics mas não do DSO, criar no DSO
      if (dynamics && !dso) {
        // Implementar criação no DSO se necessário
        console.log('Dados do Dynamics encontrados, mas não no DSO');
      }

      return {
        success: true,
        message: 'Sincronização concluída',
        data: consolidatedData.data,
      };
    } catch (error) {
      console.error('Erro ao sincronizar dados do usuário:', error);
      throw error;
    }
  }
}

// Exportar instância singleton
export const userProfileService = new UserProfileService(); 