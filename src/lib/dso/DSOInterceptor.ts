/**
 * Interceptor HTTP para DSO - Renovação automática de tokens
 * Baseado na documentação MAPEAMENTO_DSO_PRODUCAO.md
 */

import { DSOToken } from '@/services/DSOToken';

interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: any;
  credentials?: RequestCredentials;
}

interface DSOResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  needsLogin?: boolean;
  error?: string;
}

/**
 * Cliente HTTP inteligente para DSO com retry automático
 */
export class DSOInterceptor {
  private static maxRetries = 2;
  private static baseURL = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';

  /**
   * Faz requisição HTTP com retry automático em caso de token expirado
   */
  static async request<T = any>(
    config: RequestConfig, 
    credentials?: { login: string; password: string },
    retryCount = 0
  ): Promise<DSOResponse<T>> {
    
    console.log(`🔄 [DSO Interceptor] ${config.method} ${config.url} (tentativa ${retryCount + 1})`);

    try {
      // Obtém token válido
      const tokenData = await DSOToken.singleton(credentials);
      
      if (!tokenData) {
        console.warn('⚠️ [DSO Interceptor] Token não disponível');
        return {
          data: {} as T,
          status: 401,
          success: false,
          needsLogin: true,
          error: 'Token não disponível'
        };
      }

      // Prepara headers com token
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.token}`,
        ...config.headers
      };

      // Faz a requisição
      const response = await fetch(`${this.baseURL}${config.url}`, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        credentials: config.credentials || 'include',
      });

      console.log(`📡 [DSO Interceptor] Response: ${response.status} ${response.statusText}`);

      // Se token expirou (401/403), tenta renovar
      if ((response.status === 401 || response.status === 403) && retryCount < this.maxRetries) {
        console.log('🔄 [DSO Interceptor] Token expirado, renovando...');
        
        if (credentials) {
          // Força renovação do token
          await DSOToken.refresh(credentials);
          
          // Retry da requisição
          return this.request(config, credentials, retryCount + 1);
        } else {
          console.warn('⚠️ [DSO Interceptor] Token expirado mas sem credenciais para renovar');
          return {
            data: {} as T,
            status: response.status,
            success: false,
            needsLogin: true,
            error: 'Token expirado e sem credenciais'
          };
        }
      }

      // Se ainda falhou após retries
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [DSO Interceptor] Erro ${response.status}:`, errorText);
        
        return {
          data: {} as T,
          status: response.status,
          success: false,
          needsLogin: response.status === 401 || response.status === 403,
          error: `Erro ${response.status}: ${response.statusText}`
        };
      }

      // Sucesso - processa resposta
      const data = await response.json();
      
      return {
        data: data.data || data,
        status: response.status,
        success: true
      };

    } catch (error) {
      console.error('❌ [DSO Interceptor] Erro na requisição:', error);
      
      // Em caso de erro de rede, tenta retry se ainda há tentativas
      if (retryCount < this.maxRetries) {
        console.log(`🔄 [DSO Interceptor] Erro de rede, tentativa ${retryCount + 2}...`);
        return this.request(config, credentials, retryCount + 1);
      }
      
      return {
        data: {} as T,
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * GET com retry automático
   */
  static async get<T = any>(
    url: string, 
    credentials?: { login: string; password: string },
    headers?: HeadersInit
  ): Promise<DSOResponse<T>> {
    return this.request<T>({ url, method: 'GET', headers }, credentials);
  }

  /**
   * POST com retry automático
   */
  static async post<T = any>(
    url: string, 
    body: any,
    credentials?: { login: string; password: string },
    headers?: HeadersInit
  ): Promise<DSOResponse<T>> {
    return this.request<T>({ url, method: 'POST', body, headers }, credentials);
  }

  /**
   * PUT com retry automático
   */
  static async put<T = any>(
    url: string, 
    body: any,
    credentials?: { login: string; password: string },
    headers?: HeadersInit
  ): Promise<DSOResponse<T>> {
    return this.request<T>({ url, method: 'PUT', body, headers }, credentials);
  }

  /**
   * DELETE com retry automático
   */
  static async delete<T = any>(
    url: string, 
    credentials?: { login: string; password: string },
    headers?: HeadersInit
  ): Promise<DSOResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', headers }, credentials);
  }

  /**
   * Busca perfil do usuário atual com retry automático
   */
  static async getProfile(credentials?: { login: string; password: string }): Promise<DSOResponse> {
    console.log('👤 [DSO Interceptor] Buscando perfil do usuário...');
    return this.get('api/v1/my-profile', credentials);
  }

  /**
   * Atualiza perfil do usuário com retry automático
   */
  static async updateProfile(
    profileData: any, 
    credentials?: { login: string; password: string }
  ): Promise<DSOResponse> {
    console.log('📝 [DSO Interceptor] Atualizando perfil do usuário...');
    return this.put('api/v1/my-profile', profileData, credentials);
  }

  /**
   * Verifica se token está ativo
   */
  static async checkTokenStatus(credentials?: { login: string; password: string }): Promise<DSOResponse> {
    console.log('🔍 [DSO Interceptor] Verificando status do token...');
    return this.get('api/v1/is-active', credentials);
  }

  /**
   * Busca dados de usuário específico (por ID)
   */
  static async getUser(
    userId: string, 
    credentials?: { login: string; password: string }
  ): Promise<DSOResponse> {
    console.log(`👤 [DSO Interceptor] Buscando usuário: ${userId}`);
    return this.get(`api/v1/users/${userId}`, credentials);
  }

  /**
   * Busca crianças disponíveis para apadrinhamento
   */
  static async getAvailableChildren(
    credentials?: { login: string; password: string }
  ): Promise<DSOResponse> {
    console.log('👶 [DSO Interceptor] Buscando crianças disponíveis...');
    return this.get('api/v1/children/available', credentials);
  }

  /**
   * Busca crianças apadrinhadas pelo usuário
   */
  static async getSponsoredChildren(
    credentials?: { login: string; password: string }
  ): Promise<DSOResponse> {
    console.log('👶 [DSO Interceptor] Buscando crianças apadrinhadas...');
    return this.get('api/v1/my-children', credentials);
  }

  /**
   * Força logout e limpa tokens
   */
  static logout(): void {
    console.log('🚪 [DSO Interceptor] Fazendo logout...');
    DSOToken.logout();
  }

  /**
   * Verifica se usuário está autenticado
   */
  static isAuthenticated(): boolean {
    return DSOToken.isAuthenticated();
  }
}

/**
 * Funções de conveniência para uso global
 */

// Obtém credenciais do localStorage para uso automático
function getStoredCredentials(): { login: string; password: string } | undefined {
  try {
    // Primeiro, verificar no local correto onde o AuthContext salva
    const authData = localStorage.getItem('childfund-auth-data');
    if (authData) {
      const parsed = JSON.parse(authData);
      
      // Verificar se as credenciais estão no objeto credentials
      if (parsed.credentials && parsed.credentials.login && parsed.credentials.password) {
        console.log('🔍 [DSO Interceptor] Credenciais encontradas em childfund-auth-data');
        return { 
          login: parsed.credentials.login, 
          password: parsed.credentials.password 
        };
      }
      
      // Fallback para estrutura antiga
      if (parsed.login && parsed.password) {
        console.log('🔍 [DSO Interceptor] Credenciais encontradas em formato legado');
        return { login: parsed.login, password: parsed.password };
      }
    }
    
    // Fallback para dados de teste
    const testData = localStorage.getItem('dso-user-data');
    if (testData) {
      const parsed = JSON.parse(testData);
      if (parsed.login && parsed.password) {
        console.log('🔍 [DSO Interceptor] Credenciais encontradas em dso-user-data');
        return { login: parsed.login, password: parsed.password };
      }
    }
    
    console.warn('⚠️ [DSO Interceptor] Nenhuma credencial encontrada no localStorage');
    return undefined;
  } catch (error) {
    console.error('❌ [DSO Interceptor] Erro ao buscar credenciais:', error);
    return undefined;
  }
}

/**
 * Cliente DSO simplificado para uso comum
 */
export const dsoClient = {
  async getProfile() {
    const credentials = getStoredCredentials();
    return DSOInterceptor.getProfile(credentials);
  },

  async updateProfile(data: any) {
    const credentials = getStoredCredentials();
    return DSOInterceptor.updateProfile(data, credentials);
  },

  async getAvailableChildren() {
    const credentials = getStoredCredentials();
    return DSOInterceptor.getAvailableChildren(credentials);
  },

  async getSponsoredChildren() {
    const credentials = getStoredCredentials();
    return DSOInterceptor.getSponsoredChildren(credentials);
  },

  async checkStatus() {
    const credentials = getStoredCredentials();
    return DSOInterceptor.checkTokenStatus(credentials);
  },

  logout() {
    DSOInterceptor.logout();
  },

  isAuthenticated() {
    return DSOInterceptor.isAuthenticated();
  }
};

// Disponibiliza globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).DSOInterceptor = DSOInterceptor;
  (window as any).dsoClient = dsoClient;
  
  console.log('🔧 [DSO Interceptor] Cliente DSO disponível:');
  console.log('  - DSOInterceptor.get/post/put/delete() - Métodos HTTP');
  console.log('  - dsoClient.getProfile() - Buscar perfil');
  console.log('  - dsoClient.updateProfile(data) - Atualizar perfil');
  console.log('  - dsoClient.getAvailableChildren() - Crianças disponíveis');
  console.log('  - dsoClient.getSponsoredChildren() - Crianças apadrinhadas');
  console.log('  - dsoClient.checkStatus() - Verificar token');
  console.log('  - dsoClient.logout() - Logout');
} 