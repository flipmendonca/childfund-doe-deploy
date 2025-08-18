import { NextRequest, NextResponse } from 'next/server';

// Simular DynamicsToken para este endpoint
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
      const errorText = await response.text();
      throw new Error(`OAuth token request failed: ${response.status} - ${errorText}`);
    }

    const data: TokenResponse = await response.json();
    
    this.token = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    return this.token;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    
    console.log('🔍 [Dynamics Search] Buscando contato:', { email, name });
    
    if (!email && !name) {
      return NextResponse.json({
        success: false,
        error: 'Email ou nome são obrigatórios para busca'
      }, { status: 400 });
    }
    
    const baseUrl = process.env.DYNAMICS_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DYNAMICS_BASE_URL não encontrada'
      }, { status: 500 });
    }

    // Obter token de acesso
    const token = await SimpleDynamicsToken.getValidToken();
    console.log('✅ [Dynamics Search] Token obtido');

    // Construir filtro de busca
    let filter = '';
    if (email) {
      filter = `emailaddress1 eq '${email}'`;
    } else if (name) {
      filter = `contains(fullname, '${name}')`;
    }

    const searchUrl = `${baseUrl}contacts?$filter=${filter}&$select=contactid,fullname,emailaddress1,telephone1,createdon,modifiedon,chf_cpf,chf_donation_type&$top=10`;
    
    console.log('🔍 [Dynamics Search] URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Dynamics Search] Erro na busca:', response.status, errorText);
      throw new Error(`Erro na busca: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ [Dynamics Search] Encontrados ${result.value?.length || 0} contatos`);

    return NextResponse.json({
      success: true,
      message: `Encontrados ${result.value?.length || 0} contatos`,
      data: {
        contacts: result.value,
        total: result.value?.length || 0,
        searchCriteria: { email, name }
      }
    });

  } catch (error) {
    console.error('❌ [Dynamics Search] Erro:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
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