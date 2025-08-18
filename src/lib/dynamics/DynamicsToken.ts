export interface InstanceToken {
  token_type: string;
  expires_in: string;
  ext_expires_in: string;
  expires_on: string;
  not_before: string;
  resource: string;
  access_token: string;
}

export class DynamicsToken {
  private static _instance: InstanceToken | null = null;

  /**
   * Verifica se está executando no servidor
   */
  private static isServer(): boolean {
    return typeof window === 'undefined';
  }

  /**
   * Obtém um novo token OAuth do Azure AD (apenas no servidor)
   */
  private static async _get_token(): Promise<InstanceToken> {
    if (!this.isServer()) {
      throw new Error('DynamicsToken can only be used on the server side');
    }

    const tokenUrl = `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_DYNAMICS_TENANT_ID}/oauth2/token`;
    
    const body = new URLSearchParams({
      grant_type: process.env.NEXT_PUBLIC_DYNAMICS_GRANT_TYPE || 'client_credentials',
      client_id: process.env.NEXT_PUBLIC_DYNAMICS_CLIENT_ID || '',
      resource: process.env.NEXT_PUBLIC_DYNAMICS_RESOURCE || '',
      client_secret: process.env.DYNAMICS_CLIENT_SECRET || '',
    });

    try {
      console.log('Obtaining new Dynamics token...');
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData: InstanceToken = await response.json();
      
      console.log('Dynamics token obtained successfully');
      return tokenData;

    } catch (error) {
      console.error('Failed to obtain Dynamics token:', error);
      throw error;
    }
  }

  /**
   * Verifica se o token atual ainda é válido
   */
  private static _is_token_valid(token: InstanceToken): boolean {
    if (!token || !token.expires_on) return false;
    
    const expirationTime = parseInt(token.expires_on) * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    return currentTime < (expirationTime - bufferTime);
  }

  /**
   * Obtém o token atual ou gera um novo se necessário (Singleton)
   */
  public static async singleton(): Promise<InstanceToken> {
    if (!this.isServer()) {
      throw new Error('DynamicsToken can only be used on the server side. Use API routes instead.');
    }

    try {
      // Se não há token ou está expirado, obter novo
      if (!this._instance || !this._is_token_valid(this._instance)) {
        console.log('Token expired or not found, obtaining new token...');
        this._instance = await this._get_token();
      }

      return this._instance;
    } catch (error) {
      console.error('Error in DynamicsToken singleton:', error);
      throw error;
    }
  }

  /**
   * Força a renovação do token
   */
  public static async refresh(): Promise<InstanceToken> {
    if (!this.isServer()) {
      throw new Error('DynamicsToken can only be used on the server side');
    }

    console.log('Forcing token refresh...');
    this._instance = null;
    return this.singleton();
  }

  /**
   * Obtém informações do token atual sem fazer novas requisições
   */
  public static getTokenInfo(): { hasToken: boolean; isValid: boolean; expiresAt?: number } {
    if (!this.isServer()) {
      return { hasToken: false, isValid: false };
    }

    if (!this._instance) {
      return { hasToken: false, isValid: false };
    }

    const isValid = this._is_token_valid(this._instance);
    const expiresAt = parseInt(this._instance.expires_on) * 1000;

    return {
      hasToken: true,
      isValid,
      expiresAt
    };
  }

  /**
   * Limpa o token armazenado
   */
  public static clear(): void {
    if (!this.isServer()) return;
    
    this._instance = null;
    console.log('Dynamics token cleared');
  }
} 