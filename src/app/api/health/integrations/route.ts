import { NextRequest, NextResponse } from 'next/server';

// Token para Dynamics
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class SimpleDynamicsToken {
  private static token: string | null = null;
  private static tokenExpiresAt = 0;

  static async getValidToken(): Promise<string> {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (this.token && now < (this.tokenExpiresAt - fiveMinutes)) {
      return this.token;
    }

    return this.renewToken();
  }

  private static async renewToken(): Promise<string> {
    const tenantId = process.env.DYNAMICS_TENANT_ID;
    const clientId = process.env.DYNAMICS_CLIENT_ID;
    const clientSecret = process.env.DYNAMICS_CLIENT_SECRET;
    const resource = process.env.DYNAMICS_RESOURCE;

    if (!tenantId || !clientId || !clientSecret || !resource) {
      throw new Error('Configurações OAuth do Dynamics não encontradas');
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
      throw new Error(`OAuth token request failed: ${response.status}`);
    }

    const data: TokenResponse = await response.json();
    
    this.token = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    return this.token;
  }
}

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    overall_status: 'unknown',
    services: {
      rdstation: {
        status: 'unknown',
        message: '',
        credentials: false,
        api_reachable: false
      },
      dynamics: {
        status: 'unknown',
        message: '',
        credentials: false,
        api_reachable: false,
        token_valid: false
      }
    }
  };

  console.log('🔍 [Health Check] Iniciando verificação de integrações...');

  // 1. Verificar RD Station
  try {
    const rdClientId = process.env.RD_CLIENT_ID;
    const rdClientSecret = process.env.RD_CLIENT_SECRET;
    
    if (rdClientId && rdClientSecret) {
      results.services.rdstation.credentials = true;
      
      // Testar ping na API do RD Station
      try {
        const pingResponse = await fetch('https://api.rd.services/platform/conversions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${rdClientId}:${rdClientSecret}`).toString('base64')}`
          },
          body: JSON.stringify({
            conversion_identifier: 'health_check',
            email: 'healthcheck@test.com'
          })
        });

        if (pingResponse.status === 400 || pingResponse.status === 422) {
          // Erro esperado para dados de teste, mas API está respondendo
          results.services.rdstation.api_reachable = true;
          results.services.rdstation.status = 'healthy';
          results.services.rdstation.message = 'API respondendo corretamente';
        } else if (pingResponse.ok) {
          results.services.rdstation.api_reachable = true;
          results.services.rdstation.status = 'healthy';
          results.services.rdstation.message = 'API funcionando normalmente';
        } else {
          results.services.rdstation.status = 'warning';
          results.services.rdstation.message = `API retornou ${pingResponse.status}`;
        }
      } catch (apiError) {
        results.services.rdstation.status = 'error';
        results.services.rdstation.message = `Erro ao conectar: ${apiError instanceof Error ? apiError.message : 'Desconhecido'}`;
      }
    } else {
      results.services.rdstation.status = 'error';
      results.services.rdstation.message = 'Credenciais não encontradas';
    }
  } catch (error) {
    results.services.rdstation.status = 'error';
    results.services.rdstation.message = `Erro geral: ${error instanceof Error ? error.message : 'Desconhecido'}`;
  }

  // 2. Verificar Dynamics CRM
  try {
    const dynamicsBaseUrl = process.env.DYNAMICS_BASE_URL;
    const tenantId = process.env.DYNAMICS_TENANT_ID;
    const clientId = process.env.DYNAMICS_CLIENT_ID;
    const clientSecret = process.env.DYNAMICS_CLIENT_SECRET;
    
    if (dynamicsBaseUrl && tenantId && clientId && clientSecret) {
      results.services.dynamics.credentials = true;
      
      try {
        // Testar obtenção de token
        const token = await SimpleDynamicsToken.getValidToken();
        results.services.dynamics.token_valid = true;
        
        // Testar uma consulta simples
        const testResponse = await fetch(`${dynamicsBaseUrl}contacts?$top=1&$select=contactid`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
          }
        });
        
        if (testResponse.ok) {
          results.services.dynamics.api_reachable = true;
          results.services.dynamics.status = 'healthy';
          results.services.dynamics.message = 'API funcionando normalmente';
        } else {
          results.services.dynamics.status = 'warning';
          results.services.dynamics.message = `API retornou ${testResponse.status}`;
        }
      } catch (tokenError) {
        results.services.dynamics.status = 'error';
        results.services.dynamics.message = `Erro de autenticação: ${tokenError instanceof Error ? tokenError.message : 'Desconhecido'}`;
      }
    } else {
      results.services.dynamics.status = 'error';
      results.services.dynamics.message = 'Credenciais incompletas';
    }
  } catch (error) {
    results.services.dynamics.status = 'error';
    results.services.dynamics.message = `Erro geral: ${error instanceof Error ? error.message : 'Desconhecido'}`;
  }

  // 3. Determinar status geral
  const statuses = [results.services.rdstation.status, results.services.dynamics.status];
  
  if (statuses.every(s => s === 'healthy')) {
    results.overall_status = 'healthy';
  } else if (statuses.some(s => s === 'error')) {
    results.overall_status = 'error';
  } else {
    results.overall_status = 'warning';
  }

  console.log('✅ [Health Check] Verificação concluída:', results.overall_status);

  return NextResponse.json(results, {
    status: results.overall_status === 'error' ? 503 : 200
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}