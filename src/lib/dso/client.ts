/**
 * DSOClient - Cliente para integração com DSO ChildFund Brasil
 * Baseado na implementação de produção mapeada
 */

export interface DSOUser {
  id: string;
  email: string;
  name: string;
  document: string;        // CPF
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface DSOLoginResponse {
  success: "authenticated" | "failed";
  data: {
    token: string;
    user: DSOUser;
  };
  status: number;
}

export interface DSOLoginRequest {
  login: string;    // email
  password: string;
}

export interface DSOProfileResponse {
  data: DSOUser;
  status: number;
}

class DSOClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    // Configuração baseada na produção (usando variáveis Vite para client-side)
    this.baseUrl = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
    this.apiKey = import.meta.env.VITE_NEXT_KEY || 'c5e53b87-d315-427d-a9f0-1d80d5f65f56';
  }

  /**
   * Realiza login no DSO
   */
  async login(credentials: DSOLoginRequest): Promise<DSOLoginResponse> {
    try {
      console.log('🔐 [DSO] Iniciando login...');
      
      const response = await fetch(`${this.baseUrl}api/v1/authentication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Para cookies
        body: JSON.stringify({
          login: credentials.login,
          password: credentials.password
        })
      });

      const data = await response.json() as DSOLoginResponse;
      
      if (data.success === 'authenticated') {
        console.log('✅ [DSO] Login realizado com sucesso');
        
        // Salvar token nos cookies (baseado na implementação de produção)
        await this.saveTokenToCookies(data.data.token);
        
        return data;
      } else {
        console.error('❌ [DSO] Falha no login:', data);
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('❌ [DSO] Erro no login:', error);
      throw error;
    }
  }

  /**
   * Busca perfil do usuário logado
   */
  async getMyProfile(): Promise<DSOUser> {
    try {
      console.log('👤 [DSO] Buscando perfil do usuário...');
      
      const token = await this.getTokenFromCookies();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${this.baseUrl}api/v1/my-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expirado ou inválido');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json() as DSOProfileResponse;
      console.log('✅ [DSO] Perfil obtido com sucesso');
      
      return data.data;
    } catch (error) {
      console.error('❌ [DSO] Erro ao buscar perfil:', error);
      throw error;
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(profileData: Partial<DSOUser>): Promise<DSOUser> {
    try {
      console.log('💾 [DSO] Atualizando perfil...');
      
      const token = await this.getTokenFromCookies();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${this.baseUrl}api/v1/my-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json() as DSOProfileResponse;
      console.log('✅ [DSO] Perfil atualizado com sucesso');
      
      return data.data;
    } catch (error) {
      console.error('❌ [DSO] Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por documento (CPF) ou email
   */
  async searchUser(query: { document?: string; email?: string }): Promise<DSOUser[]> {
    try {
      console.log('🔍 [DSO] Buscando usuário...', query);
      
      const token = await this.getTokenFromCookies();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const searchParams = new URLSearchParams();
      if (query.document) searchParams.append('document', query.document);
      if (query.email) searchParams.append('email', query.email);

      const response = await fetch(`${this.baseUrl}api/v1/users/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [DSO] Busca realizada com sucesso');
      
      return Array.isArray(data.data) ? data.data : [data.data];
    } catch (error) {
      console.error('❌ [DSO] Erro na busca:', error);
      throw error;
    }
  }

  /**
   * Salva token nos cookies (simulando o endpoint /essentials/coockies)
   */
  private async saveTokenToCookies(token: string): Promise<void> {
    try {
      console.log('💾 [DSO] Salvando token...', { tokenLength: token?.length });
      
      // Salvar no localStorage como fallback
      localStorage.setItem('dso-token', token);
      console.log('✅ [DSO] Token salvo no localStorage');
      
      // Tentar salvar via endpoint de coockies (duplo 'o' - produção)
      try {
        const response = await fetch('/api/essentials/coockies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'c5e53b87-d315-427d-a9f0-1d80d5f65f56', // NEXTKEY conforme produção
          },
          body: JSON.stringify({ token })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ [DSO] Token salvo via coockies endpoint:', data);
        } else {
          console.warn('⚠️ [DSO] Coockies endpoint retornou:', response.status);
        }
      } catch (e) {
        console.warn('⚠️ [DSO] Endpoint de coockies não disponível:', e);
      }
    } catch (error) {
      console.error('❌ [DSO] Erro ao salvar token:', error);
    }
  }

  /**
   * Recupera token dos cookies
   */
  private async getTokenFromCookies(): Promise<string | null> {
    try {
      console.log('🔍 [DSO] Recuperando token...');
      
      // Tentar buscar via endpoint de coockies (duplo 'o' - produção)
      try {
        const response = await fetch('/api/essentials/coockies', {
          method: 'GET',
          credentials: 'include'
        });
        
        console.log('🔍 [DSO] Response coockies endpoint:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 [DSO] Dados do coockies endpoint:', data);
          if (data.token?.value) {
            console.log('🔍 [DSO] Token encontrado via coockies');
            return data.token.value;
          }
        }
      } catch (e) {
        console.warn('⚠️ [DSO] Endpoint de coockies não disponível:', e);
      }

      // Fallback para localStorage
      const token = localStorage.getItem('dso-token');
      console.log('🔍 [DSO] Token localStorage:', token ? 'encontrado' : 'não encontrado');
      return token;
    } catch (error) {
      console.error('❌ [DSO] Erro ao recuperar token:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getTokenFromCookies();
      if (!token) return false;

      // Tentar fazer uma requisição simples para verificar se o token é válido
      const response = await fetch(`${this.baseUrl}api/v1/my-profile`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      return response.ok;
    } catch (error) {
      console.error('❌ [DSO] Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Faz logout removendo o token
   */
  async logout(): Promise<void> {
    try {
      localStorage.removeItem('dso-token');
      
      // Tentar limpar coockies via endpoint se disponível
      try {
        await fetch('/api/essentials/coockies', {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (e) {
        console.warn('⚠️ [DSO] Endpoint de coockies não disponível para logout');
      }
      
      console.log('✅ [DSO] Logout realizado');
    } catch (error) {
      console.error('❌ [DSO] Erro no logout:', error);
    }
  }
}

// Instância singleton
export const dsoClient = new DSOClient();
export default dsoClient;