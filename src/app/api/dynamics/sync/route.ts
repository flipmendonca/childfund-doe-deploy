import { NextRequest, NextResponse } from 'next/server';

// Simular DynamicsToken para este endpoint (já que é server-side)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personalData, transactionData, donationType } = body;
    
    console.log('🔄 [Dynamics Sync Vercel] Recebendo dados para sincronização:', body);
    
    if (!personalData || !transactionData) {
      return NextResponse.json({
        success: false,
        error: 'personalData e transactionData são obrigatórios'
      }, { status: 400 });
    }
    
    // Integração real com Dynamics CRM
    try {
      console.log('🔄 [Dynamics] Iniciando sincronização real...');
      
      const baseUrl = process.env.DYNAMICS_BASE_URL;
      if (!baseUrl) {
        console.warn('⚠️ [Dynamics] DYNAMICS_BASE_URL não encontrada, modo simulação');
        console.log('✅ [Dynamics Sync Vercel] Dados sincronizados (simulação):', {
          type: donationType,
          personalData: { name: personalData.fullName, email: personalData.email },
          timestamp: new Date().toISOString()
        });
        
        return NextResponse.json({
          success: true,
          message: 'Dados sincronizados com Dynamics CRM (simulação)',
          mode: 'simulation',
          data: {
            syncId: `sync_${Date.now()}`,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Obter token de acesso
      const token = await SimpleDynamicsToken.getValidToken();
      console.log('✅ [Dynamics] Token obtido com sucesso');

      // Preparar dados do contato
      const contactData = {
        fullname: personalData.fullName || personalData.name,
        emailaddress1: personalData.email,
        telephone1: personalData.phone,
        birthdate: personalData.birthDate,
        address1_line1: personalData.address,
        address1_city: personalData.city,
        address1_stateorprovince: personalData.state,
        address1_postalcode: personalData.zipCode,
        address1_country: 'Brasil',
        chf_cpf: personalData.cpf,
        chf_donation_type: donationType,
        chf_sponsor_value: transactionData.amount,
        chf_payment_method: transactionData.paymentMethod || 'credit_card'
      };

      // Verificar se o contato já existe (por email)
      const checkUrl = `${baseUrl}contacts?$filter=emailaddress1 eq '${personalData.email}'&$select=contactid,fullname`;
      
      const checkResponse = await fetch(checkUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0'
        }
      });

      if (!checkResponse.ok) {
        throw new Error(`Erro ao verificar contato: ${checkResponse.status}`);
      }

      const checkResult = await checkResponse.json();
      let contactId: string;

      if (checkResult.value && checkResult.value.length > 0) {
        // Contato existe, atualizar
        contactId = checkResult.value[0].contactid;
        console.log(`🔄 [Dynamics] Atualizando contato existente: ${contactId}`);
        
        const updateResponse = await fetch(`${baseUrl}contacts(${contactId})`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
          },
          body: JSON.stringify(contactData)
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Erro ao atualizar contato: ${updateResponse.status} - ${errorText}`);
        }

        console.log('✅ [Dynamics] Contato atualizado com sucesso');
      } else {
        // Criar novo contato
        console.log('🔄 [Dynamics] Criando novo contato...');
        
        const createResponse = await fetch(`${baseUrl}contacts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(contactData)
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Erro ao criar contato: ${createResponse.status} - ${errorText}`);
        }

        const newContact = await createResponse.json();
        contactId = newContact.contactid;
        console.log('✅ [Dynamics] Novo contato criado:', contactId);
      }

      return NextResponse.json({
        success: true,
        message: 'Dados sincronizados com Dynamics CRM',
        mode: 'production',
        data: {
          syncId: contactId,
          contactId: contactId,
          timestamp: new Date().toISOString(),
          action: checkResult.value?.length > 0 ? 'updated' : 'created'
        }
      });

    } catch (dynamicsError) {
      console.error('❌ [Dynamics] Erro na integração:', dynamicsError);
      
      // Retornar sucesso mesmo com erro para não quebrar o fluxo
      return NextResponse.json({
        success: true,
        message: 'Dados processados (erro na integração Dynamics)',
        warning: dynamicsError instanceof Error ? dynamicsError.message : 'Erro desconhecido',
        data: {
          syncId: `sync_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('❌ [Dynamics Sync Vercel] Erro:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
