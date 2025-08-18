/**
 * DSOToken Singleton - Gerenciamento inteligente de tokens DSO
 * Baseado no padrão já usado para RDToken e DynamicsToken
 */

interface DSOCredentials {
  login: string;
  password: string;
}

interface DSOTokenData {
  token: string;
  user: any;
  expiresAt: number;
}

export class DSOToken {
  private static _instance: DSOTokenData | null = null;
  private static _generatedAt: number = 0;
  private static _expiresIn: number = 24 * 60 * 60; // 24 horas em segundos

  /**
   * Obtém um novo token do DSO
   */
  private static async _get_token(credentials: DSOCredentials): Promise<DSOTokenData> {
    console.log('🔄 [DSOToken] Obtendo novo token...');
    
    const host = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
    
    try {
      const response = await fetch(`${host}api/v1/authentication`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success === 'authenticated' && data.data?.token) {
        this._generatedAt = Math.floor(Date.now() / 1000);
        
        const tokenData: DSOTokenData = {
          token: data.data.token,
          user: data.data.user || data.data,
          expiresAt: this._generatedAt + this._expiresIn
        };

        console.log('✅ [DSOToken] Token obtido com sucesso');
        
        // Salva no cookie para compatibilidade
        this._saveToCookie(tokenData.token);
        
        return tokenData;
      }
      
      throw new Error(`Autenticação falhou: ${data.message || 'Resposta inválida'}`);
    } catch (error) {
      console.error('❌ [DSOToken] Erro ao obter token:', error);
      throw error;
    }
  }

  /**
   * Salva token no cookie para compatibilidade com sistema existente
   */
  private static _saveToCookie(token: string) {
    try {
      // Usa o nome correto do cookie conforme documentação
      document.cookie = `childfund-auth-token=${token}; path=/; max-age=${this._expiresIn}; SameSite=Strict; Secure`;
      console.log('🍪 [DSOToken] Token salvo no cookie');
    } catch (error) {
      console.warn('⚠️ [DSOToken] Não foi possível salvar cookie:', error);
    }
  }

  /**
   * Verifica se o token atual ainda é válido
   */
  private static _isTokenValid(): boolean {
    if (!this._instance) return false;
    
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const isValid = currentTimestamp < this._instance.expiresAt;
    
    if (!isValid) {
      console.log('⏰ [DSOToken] Token expirado, será renovado');
    }
    
    return isValid;
  }

  /**
   * Obtém token válido (singleton com renovação automática)
   */
  public static async singleton(credentials?: DSOCredentials): Promise<DSOTokenData | null> {
    try {
      // Se tem instância e está válida, retorna
      if (this._instance && this._isTokenValid()) {
        console.log('✅ [DSOToken] Usando token em cache válido');
        return this._instance;
      }

      // Token expirado ou não existe
      if (!credentials) {
        console.warn('⚠️ [DSOToken] Token expirado e sem credenciais para renovar');
        this._instance = null;
        return null;
      }

      // Renova o token
      console.log('🔄 [DSOToken] Renovando token expirado...');
      this._instance = await this._get_token(credentials);
      return this._instance;

    } catch (error) {
      console.error('❌ [DSOToken] Erro no singleton:', error);
      this._instance = null;
      return null;
    }
  }

  /**
   * Força renovação do token
   */
  public static async refresh(credentials: DSOCredentials): Promise<DSOTokenData | null> {
    console.log('🔄 [DSOToken] Forçando renovação do token...');
    
    try {
      this._instance = await this._get_token(credentials);
      return this._instance;
    } catch (error) {
      console.error('❌ [DSOToken] Erro ao forçar renovação:', error);
      this._instance = null;
      return null;
    }
  }

  /**
   * Obtém apenas o token (para compatibilidade)
   */
  public static async getToken(credentials?: DSOCredentials): Promise<string | null> {
    const tokenData = await this.singleton(credentials);
    return tokenData?.token || null;
  }

  /**
   * Obtém dados do usuário atual
   */
  public static async getUserData(credentials?: DSOCredentials): Promise<any | null> {
    const tokenData = await this.singleton(credentials);
    return tokenData?.user || null;
  }

  /**
   * Limpa o token (logout)
   */
  public static logout(): void {
    console.log('🚪 [DSOToken] Fazendo logout...');
    this._instance = null;
    this._generatedAt = 0;
    
    // Remove cookie
    try {
      document.cookie = 'childfund-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'dso-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (error) {
      console.warn('⚠️ [DSOToken] Erro ao limpar cookies:', error);
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  public static isAuthenticated(): boolean {
    return this._instance !== null && this._isTokenValid();
  }
} 