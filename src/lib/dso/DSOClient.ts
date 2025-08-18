/**
 * Cliente DSO (Donor Support Operations) - ChildFund Brasil
 * 
 * Cliente completo para comunicação com o sistema DSO existente,
 * permitindo reutilizar cadastros de usuários e dados históricos.
 * 
 * Baseado na documentação: docs/INTEGRACAO_DSO_PROJETO.md
 */

// Interfaces de dados
export interface DSOUser {
  id: string;
  email: string;
  name: string;
  document: string;
  phone: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface DSOLoginResponse {
  success: string;
  data?: {
    token: string;
    user: DSOUser;
  };
  message?: string;
  status?: number;
}

export interface DSOListResponse {
  users: DSOUser[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DSOSponsorship {
  childId: string;
  name: string;
  photo: string; // Base64 image data
  city?: string;
  state?: string;
  description?: string;
  sponsorshipValue?: string;
}

export interface DSOApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

/**
 * Cliente DSO para comunicação com o sistema existente
 */
export class DSOClient {
  private baseUrl: string;
  private timeout: number;
  private token?: string;
  private useProxy: boolean;
  private useMocks: boolean;
  private apiKey: string;

  constructor(baseUrl: string = 'https://dso.childfundbrasil.org.br/', timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    // Desabilitar proxy temporariamente para evitar erro 500
    this.useProxy = false; // TODO: Reativar quando proxy estiver funcionando
    
    // Chave de autorização interna para endpoints que requerem autenticação
    this.apiKey = 'c5e53b87-d315-427d-a9f0-1d80d5f65f56';
    
    // Sempre usar dados reais do DSO
    this.useMocks = false;
  }

  /**
   * Define o token de autenticação
   */
  setToken(token: string): void {
    console.log(`[DSO Client] setToken chamado com: ${token ? token.substring(0, 10) + '...' : 'null'}`);
    this.token = token;
    console.log(`[DSO Client] Token configurado: ${this.token ? 'sim' : 'não'}`);
  }

  /**
   * Remove o token de autenticação
   */
  clearToken(): void {
    this.token = undefined;
  }

  /**
   * Faz uma requisição HTTP para o DSO
   */
  private async makeRequest<T = any>(
    endpoint: string, 
    method: string = 'GET', 
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<DSOApiResponse<T>> {
    // Se mocks estão habilitados, retorna dados simulados
    if (this.useMocks) {
      console.log(`[DSO Client] Mock: ${method} ${endpoint}`);
      return this.getMockResponse(endpoint, method, body);
    }

    // Corrigir duplicidade de barras
    const cleanBaseUrl = this.baseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = this.useProxy 
      ? `/dso${cleanEndpoint}`
      : `${cleanBaseUrl}${cleanEndpoint}`;
      
    console.log(`[DSO Client] ${method} ${url} (${this.useProxy ? 'via proxy' : 'direto'})`);
      
    const headers: Record<string, string> = {
      'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
      'Accept': 'application/json; charset=utf-8',
      'Accept-Charset': 'utf-8',
      ...customHeaders
    };

    // Adiciona Content-Type apenas para requisições com body
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    // Adiciona token de autorização apenas se não foi explicitamente removido
    console.log(`[DSO Client] Token disponível: ${this.token ? 'sim' : 'não'}`);
    if (this.token && !customHeaders?.Authorization) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log(`[DSO Client] Header Authorization adicionado: Bearer ${this.token.substring(0, 10)}...`);
    } else {
      console.log(`[DSO Client] Token não adicionado - token: ${this.token ? 'sim' : 'não'}, customAuth: ${customHeaders?.Authorization ? 'sim' : 'não'}`);
    }

    const options: RequestInit = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Verifica se a resposta é JSON
      const contentType = response.headers.get('content-type');
      let responseData: any;

      if (contentType && contentType.includes('application/json')) {
        const textData = await response.text();
        try {
          // Garantir que o texto está sendo processado como UTF-8
          responseData = JSON.parse(textData);
        } catch (parseError) {
          console.error(`[DSO Client] JSON parse error:`, parseError);
          console.warn(`[DSO Client] Original text: ${textData.substring(0, 200)}...`);
          
          return {
            success: false,
            message: 'Erro ao processar resposta JSON do servidor',
            status: response.status,
            data: { rawResponse: textData.substring(0, 500), parseError: parseError.message } as any
          };
        }
      } else {
        // Se não for JSON, retorna o texto da resposta
        const textResponse = await response.text();
        console.warn(`[DSO Client] Resposta não-JSON recebida: ${textResponse.substring(0, 200)}...`);
        
        return {
          success: false,
          message: 'Resposta não-JSON do servidor',
          status: response.status,
          data: { rawResponse: textResponse.substring(0, 500) } as any
        };
      }

      console.log(`[DSO Client] Response: ${response.status} ${response.statusText}`);

      return {
        success: response.ok,
        data: response.ok ? responseData : undefined,
        message: responseData.message || response.statusText,
        status: response.status
      };
    } catch (error) {
      console.error(`[DSO Client] Error:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro de rede',
        status: 0
      };
    }
  }

  /**
   * Retorna respostas simuladas para desenvolvimento
   */
  private getMockResponse(endpoint: string, method: string, body?: any): DSOApiResponse<any> {
    // Simula delay de rede
    const delay = Math.random() * 500 + 100;
    
    // Endpoints de verificação de usuário
    if (endpoint.includes('/users/search')) {
      if (endpoint.includes('email=')) {
        const email = endpoint.split('email=')[1];
        // Simula que o email não existe (para permitir cadastro)
        return {
          success: true,
          data: null,
          message: 'Usuário não encontrado',
          status: 404
        };
      }
      if (endpoint.includes('document=')) {
        const document = endpoint.split('document=')[1];
        // Simula que o CPF não existe (para permitir cadastro)
        return {
          success: true,
          data: null,
          message: 'Usuário não encontrado',
          status: 404
        };
      }
    }

    // Endpoint de cadastro
    if (endpoint === '/user-public' && method === 'POST') {
      return {
        success: true,
        data: {
          id: 'mock-user-' + Date.now(),
          ...body,
          created_at: new Date().toISOString(),
          status: 'active'
        },
        message: 'Usuário criado com sucesso',
        status: 201
      };
    }

    // Endpoint de autenticação
    if (endpoint === '/authentication' && method === 'POST') {
      const { login, password } = body || {};
      
      // Simula autenticação bem-sucedida
      if (login && password) {
        return {
          success: true,
          data: {
            token: 'mock-token-' + Date.now(),
            user: {
              id: 'mock-user-123',
              email: login,
              name: 'Usuário Mock',
              document: '123.456.789-00',
              phone: '(11) 99999-9999',
              status: 'active'
            }
          },
          message: 'Login realizado com sucesso',
          status: 200
        };
      }
    }

    // Endpoint de health check
    if (endpoint === '/health' || endpoint === '/v1/health') {
      return {
        success: true,
        data: { status: 'ok', timestamp: new Date().toISOString() },
        message: 'Serviço funcionando',
        status: 200
      };
    }

    // Endpoint padrão
    return {
      success: true,
      data: { message: 'Mock response', endpoint, method },
      message: 'Resposta simulada',
      status: 200
    };
  }

  /**
   * Testa a conectividade com o DSO
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.makeRequest('/api/v1/health');
      if (!result.success) {
        // Tenta endpoint alternativo
        const altResult = await this.makeRequest('/api/v1/authentication', 'POST', {
          login: 'test@test.com',
          password: 'test'
        });
        return altResult.status === 401; // 401 indica que o endpoint existe mas credenciais são inválidas
      }
      return result.success;
    } catch (error) {
      console.error('DSO: Erro no teste de conectividade:', error);
      return false;
    }
  }

  /**
   * Autentica um usuário no DSO
   */
  async authenticate(login: string, password: string): Promise<DSOLoginResponse> {
    const response = await this.makeRequest<DSOLoginResponse>('/api/v1/authentication', 'POST', {
      login,
      password
    });

    if (response.success && response.data?.data?.token) {
      this.setToken(response.data.data.token);
    }

    return response.data || {
      success: 'failed',
      message: response.message || 'Falha na autenticação'
    };
  }

  /**
   * Verifica se um usuário existe por email
   */
  async checkUserExists(email: string): Promise<DSOApiResponse<any>> {
    return this.makeRequest(`/api/v1/users/search?email=${encodeURIComponent(email)}`, 'GET', undefined, {
      'Authorization': `Bearer ${this.apiKey}`
    });
  }

  /**
   * Verifica se um usuário existe por CPF/CNPJ
   */
  async getUserByDocument(document: string): Promise<DSOApiResponse<any>> {
    return this.makeRequest(`/api/v1/users/search?document=${encodeURIComponent(document)}`, 'GET', undefined, {
      'Authorization': `Bearer ${this.apiKey}`
    });
  }

  /**
   * Faz login no DSO
   */
  async login(login: string, password: string): Promise<DSOApiResponse<any>> {
    console.log('[DSOClient] Login chamado com:', {
      login: login,
      password: password ? '***' : 'vazio'
    });
    
    const result = await this.makeRequest('/api/v1/authentication', 'POST', { login, password });
    
    console.log('[DSOClient] Resultado do login:', {
      success: result.success,
      status: result.status,
      message: result.message,
      hasData: !!result.data
    });
    
    return result;
  }

  /**
   * Registra um novo usuário
   */
  async register(userData: any): Promise<DSOApiResponse<any>> {
    // Endpoint público - não deve enviar token de autorização
    return this.makeRequest('/api/v1/user-public', 'POST', userData, {
      'Authorization': '' // Força remoção do header de autorização
    });
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(userId: string): Promise<DSOApiResponse<any>> {
    return this.makeRequest(`/api/v1/users/${userId}`, 'GET');
  }

  /**
   * Busca dados completos do usuário por documento (CPF)
   */
  async getUserByDocumentComplete(document: string): Promise<DSOApiResponse<any>> {
    return this.makeRequest(`/api/v1/users/search?document=${encodeURIComponent(document)}`, 'GET');
  }

  /**
   * Atualiza dados do usuário
   */
  async updateUser(userId: string, userData: any): Promise<DSOApiResponse<any>> {
    return this.makeRequest(`/api/v1/users/${userId}`, 'PUT', userData);
  }

  /**
   * Deleta um usuário
   */
  async deleteUser(userId: string): Promise<DSOApiResponse<any>> {
    return this.makeRequest(`/api/v1/users/${userId}`, 'DELETE');
  }

  /**
   * Lista todos os usuários
   */
  async listUsers(): Promise<DSOApiResponse<any>> {
    return this.makeRequest('/api/v1/users', 'GET');
  }

  /**
   * Verifica saúde do serviço
   */
  async healthCheck(): Promise<DSOApiResponse<any>> {
    return this.makeRequest('/api/v1/health');
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string, token?: string): Promise<DSOUser | null> {
    if (token) this.setToken(token);
    
    const response = await this.makeRequest<DSOUser>(`/api/v1/users/search?email=${encodeURIComponent(email)}`, 'GET');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  }

  /**
   * Exporta usuários em diferentes formatos
   */
  async exportUsers(token?: string, format: string = 'json'): Promise<any> {
    if (token) this.setToken(token);
    
    const response = await this.makeRequest(`/api/v1/users/export?format=${format}`, 'GET');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  }

  /**
   * Busca apadrinhamentos de um usuário
   */
  async getSponsorships(contactId?: string, token?: string): Promise<DSOSponsorship[]> {
    if (token) this.setToken(token);
    
    // Conforme RELATORIO_TESTE_USUARIOS.md: endpoint é GET, não POST
    // NOTA: API retorna "sponsonships" (com typo), não "sponsorships"
    const response = await this.makeRequest<{ sponsonships: DSOSponsorship[] }>('/api/v1/sponsorships', 'GET');
    
    console.log('🔍 [DSOClient] Response de sponsorships:', response);
    
    if (response.success && response.data?.sponsonships) {
      console.log('✅ [DSOClient] Sponsorships encontrados:', response.data.sponsonships);
      return response.data.sponsonships;
    }
    
    return [];
  }

  /**
   * Solicita redefinição de senha
   */
  async requestPasswordReset(email: string): Promise<DSOApiResponse> {
    const response = await this.makeRequest('/api/v1/request-password-reset', 'POST', { email });
    return response;
  }

  /**
   * Redefine senha do usuário
   */
  async resetPassword(token: string, newPassword: string): Promise<DSOApiResponse> {
    const response = await this.makeRequest('/api/v1/reset-my-password', 'POST', { 
      password: newPassword 
    }, {
      'Authorization': `Bearer ${token}`
    });
    return response;
  }

  /**
   * Explora APIs disponíveis no DSO
   */
  async exploreAPIs(): Promise<any> {
    const endpoints = [
      '/v1/health',
      '/v1/authentication',
      '/v1/user-public',
      '/v1/users/search',
      '/v1/users',
      '/v1/users/export',
      '/v1/sponsorships',
      '/v1/request-password-reset',
      '/v1/reset-password'
    ];

    const results: Record<string, any> = {};

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint);
        results[endpoint] = {
          available: response.success,
          status: response.status,
          message: response.message
        };
      } catch (error) {
        results[endpoint] = {
          available: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
    }

    return results;
  }

  /**
   * Valida se o token atual é válido
   */
  async validateToken(token?: string): Promise<boolean> {
    if (token) this.setToken(token);
    
    if (!this.token) return false;
    
    try {
      const response = await this.makeRequest('/v1/users?page=1&limit=1');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Busca estatísticas do DSO
   */
  async getStatistics(token?: string): Promise<any> {
    if (token) this.setToken(token);
    
    const response = await this.makeRequest('/v1/statistics');
    return response.data || null;
  }

  /**
   * Busca logs de auditoria
   */
  async getAuditLogs(token?: string, page: number = 1, limit: number = 50): Promise<any> {
    if (token) this.setToken(token);
    
    const response = await this.makeRequest(`/v1/audit-logs?page=${page}&limit=${limit}`);
    return response.data || null;
  }
}

// Instância singleton para uso global
export const dsoClient = new DSOClient(); 