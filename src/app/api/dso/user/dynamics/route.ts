import { NextRequest, NextResponse } from 'next/server';

const DYNAMICS_HOST = 'https://childfundbrasil.api.crm2.dynamics.com';

interface DynamicsContact {
  contactid: string;
  firstname: string;
  lastname: string;
  emailaddress1: string;
  telephone1: string;
  address1_line1: string;
  address1_line2: string;
  address1_city: string;
  address1_stateorprovince: string;
  address1_postalcode: string;
  address1_country: string;
  birthdate: string;
  gendercode: number;
  jobtitle: string;
  _parentcustomerid_value: string;
  createdon: string;
  modifiedon: string;
}

/**
 * GET /api/dso/user/dynamics
 * Busca dados do usuário no Dynamics CRM usando o dynamicsId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dynamicsId = searchParams.get('dynamicsId');
    const contactId = searchParams.get('contactId');

    if (!dynamicsId && !contactId) {
      return NextResponse.json(
        { error: 'É necessário fornecer dynamicsId ou contactId' },
        { status: 400 }
      );
    }

    const id = dynamicsId || contactId;
    console.log('🔍 Buscando dados do usuário no Dynamics CRM:', id);

    // Buscar dados do contato no Dynamics CRM
    const response = await fetch(`${DYNAMICS_HOST}/api/data/v9.2/contacts(${id})`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
      },
    });

    if (!response.ok) {
      console.error('❌ Erro na API Dynamics:', response.status, response.statusText);
      
      // Se não encontrou, retornar erro específico
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Contato não encontrado no Dynamics CRM' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: `Erro na API Dynamics: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data: DynamicsContact = await response.json();
    console.log('✅ Dados do usuário obtidos do Dynamics CRM');

    // Mapear dados para formato padronizado
    const contactData = {
      contactid: data.contactid,
      name: `${data.firstname || ''} ${data.lastname || ''}`.trim(),
      firstName: data.firstname || '',
      lastName: data.lastname || '',
      email: data.emailaddress1 || '',
      phone: data.telephone1 || '',
      address: {
        street: data.address1_line1 || '',
        complement: data.address1_line2 || '',
        city: data.address1_city || '',
        state: data.address1_stateorprovince || '',
        postalCode: data.address1_postalcode || '',
        country: data.address1_country || '',
      },
      birthDate: data.birthdate || '',
      gender: data.gendercode === 1 ? 'M' : data.gendercode === 2 ? 'F' : '',
      jobTitle: data.jobtitle || '',
      parentCustomerId: data._parentcustomerid_value || '',
      createdOn: data.createdon || '',
      modifiedOn: data.modifiedon || '',
    };

    return NextResponse.json({
      success: true,
      data: contactData,
      message: 'Dados do usuário obtidos com sucesso do Dynamics CRM',
      source: 'Dynamics CRM'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados do usuário no Dynamics:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dso/user/dynamics
 * Atualiza dados do usuário no Dynamics CRM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId, contactData } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: 'contactId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Atualizando dados do usuário no Dynamics CRM:', contactId);

    // Atualizar dados do contato no Dynamics CRM
    const response = await fetch(`${DYNAMICS_HOST}/api/data/v9.2/contacts(${contactId})`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      console.error('❌ Erro ao atualizar dados no Dynamics:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erro na API Dynamics: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    console.log('✅ Dados do usuário atualizados no Dynamics CRM');

    return NextResponse.json({
      success: true,
      message: 'Dados do usuário atualizados com sucesso no Dynamics CRM',
      source: 'Dynamics CRM'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar dados do usuário no Dynamics:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 