interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  ext_expires_in: number;
  access_token_expires_on: number;
}

export class DynamicsToken {
  private static instance: DynamicsToken;
  private token: string | null = null;
  private tokenExpiresAt = 0;

  private constructor() {}

  public static getInstance(): DynamicsToken {
    if (!DynamicsToken.instance) {
      DynamicsToken.instance = new DynamicsToken();
    }
    return DynamicsToken.instance;
  }

  public async getValidToken(): Promise<string> {
    // Verifica se o token ainda é válido (com margem de 5 minutos)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (this.token && now < (this.tokenExpiresAt - fiveMinutes)) {
      return this.token;
    }

    // Renova o token
    return this.renewToken();
  }

  private async renewToken(): Promise<string> {
    try {
      const tenantId = import.meta.env.VITE_DYNAMICS_TENANT_ID;
      const clientId = import.meta.env.VITE_DYNAMICS_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_DYNAMICS_CLIENT_SECRET;
      const resource = import.meta.env.VITE_DYNAMICS_RESOURCE;

      if (!tenantId || !clientId || !clientSecret || !resource) {
        throw new Error('Configurações OAuth não encontradas nas variáveis de ambiente');
      }

      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;
      
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        resource: resource
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OAuth token request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      
      this.token = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

      console.log('Token OAuth renovado com sucesso');
      return this.token;

    } catch (error) {
      console.error('Erro ao renovar token OAuth:', error);
      throw error;
    }
  }

  public clearToken(): void {
    this.token = null;
    this.tokenExpiresAt = 0;
  }
} 