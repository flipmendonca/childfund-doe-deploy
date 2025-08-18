import { NextRequest, NextResponse } from 'next/server';

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';
const DYNAMICS_HOST = 'https://childfundbrasil.api.crm2.dynamics.com';

interface ConsolidatedUserData {
  // Dados do DSO
  dso: {
    email: string;
    name: string;
    products: Array<any>;
    institution: boolean;
    document: string;
    phone: string;
    type_document: string;
    companyName: string;
    isAuthorizedToPurchase?: boolean;
    street: string;
    number: string;
    addressComplement: string;
    neighborhood: string;
    state: string;
    profission: string;
    cep: string;
    city: string;
    country: string;
    birthDate: string;
    pronouns: string;
    gender: string;
    dynamicsId: string;
  };
  // Dados do Dynamics CRM
  dynamics?: {
    contactid: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      complement: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    birthDate: string;
    gender: string;
    jobTitle: string;
    parentCustomerId: string;
    createdOn: string;
    modifiedOn: string;
  };
  // Metadados
  metadata: {
    lastSync: string;
    sources: string[];
    hasDynamicsData: boolean;
    hasDSOData: boolean;
  };
}

/**
 * GET /api/dso/user/consolidated
 * Busca dados consolidados do usuário (DSO + Dynamics CRM)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const document = searchParams.get('document');
    const email = searchParams.get('email');
    const dynamicsId = searchParams.get('dynamicsId');

    if (!userId && !document && !email && !dynamicsId) {
      return NextResponse.json(
        { error: 'É necessário fornecer userId, document, email ou dynamicsId' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando dados consolidados do usuário:', { userId, document, email, dynamicsId });

    const consolidatedData: Partial<ConsolidatedUserData> = {
      metadata: {
        lastSync: new Date().toISOString(),
        sources: [],
        hasDynamicsData: false,
        hasDSOData: false,
      }
    };

    // 1. Buscar dados do DSO
    try {
      let dsoSearchUrl = '';
      if (userId) {
        dsoSearchUrl = `${DSO_HOST}api/v1/users/${userId}`;
      } else if (document) {
        dsoSearchUrl = `${DSO_HOST}api/v1/users/search?document=${encodeURIComponent(document)}`;
      } else if (email) {
        dsoSearchUrl = `${DSO_HOST}api/v1/users/search?email=${encodeURIComponent(email)}`;
      }

      if (dsoSearchUrl) {
        const dsoResponse = await fetch(dsoSearchUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
          },
        });

        if (dsoResponse.ok) {
          const dsoData = await dsoResponse.json();
          consolidatedData.dso = {
            email: dsoData.email || '',
            name: dsoData.name || '',
            products: dsoData.products || [],
            institution: dsoData.institution || false,
            document: dsoData.document || dsoData.cpf || '',
            phone: dsoData.phone || '',
            type_document: dsoData.type_document || 'cpf',
            companyName: dsoData.companyName || '',
            isAuthorizedToPurchase: dsoData.isAuthorizedToPurchase || false,
            street: dsoData.street || dsoData.address || '',
            number: dsoData.number || dsoData.addressNumber || '',
            addressComplement: dsoData.addressComplement || dsoData.complement || '',
            neighborhood: dsoData.neighborhood || dsoData.bairro || '',
            state: dsoData.state || '',
            profission: dsoData.profission || dsoData.profession || '',
            cep: dsoData.cep || dsoData.zipCode || '',
            city: dsoData.city || '',
            country: dsoData.country || 'Brasil',
            birthDate: dsoData.birthDate || dsoData.birthdate || '',
            pronouns: dsoData.pronouns || '',
            gender: dsoData.gender || '',
            dynamicsId: dsoData.dynamicsId || dsoData.contactid || dsoData.id || '',
          };
          consolidatedData.metadata!.sources.push('DSO');
          consolidatedData.metadata!.hasDSOData = true;
          console.log('✅ Dados do DSO obtidos');
        } else {
          console.warn('⚠️ Erro ao buscar dados do DSO:', dsoResponse.status);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar dados do DSO:', error);
    }

    // 2. Buscar dados do Dynamics CRM
    try {
      let dynamicsIdToUse = dynamicsId;
      
      // Se não temos dynamicsId mas temos dados do DSO, usar o dynamicsId do DSO
      if (!dynamicsIdToUse && consolidatedData.dso?.dynamicsId) {
        dynamicsIdToUse = consolidatedData.dso.dynamicsId;
      }

      if (dynamicsIdToUse) {
        const dynamicsResponse = await fetch(`${DYNAMICS_HOST}/api/data/v9.2/contacts(${dynamicsIdToUse})`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
          },
        });

        if (dynamicsResponse.ok) {
          const dynamicsData = await dynamicsResponse.json();
          consolidatedData.dynamics = {
            contactid: dynamicsData.contactid,
            name: `${dynamicsData.firstname || ''} ${dynamicsData.lastname || ''}`.trim(),
            firstName: dynamicsData.firstname || '',
            lastName: dynamicsData.lastname || '',
            email: dynamicsData.emailaddress1 || '',
            phone: dynamicsData.telephone1 || '',
            address: {
              street: dynamicsData.address1_line1 || '',
              complement: dynamicsData.address1_line2 || '',
              city: dynamicsData.address1_city || '',
              state: dynamicsData.address1_stateorprovince || '',
              postalCode: dynamicsData.address1_postalcode || '',
              country: dynamicsData.address1_country || '',
            },
            birthDate: dynamicsData.birthdate || '',
            gender: dynamicsData.gendercode === 1 ? 'M' : dynamicsData.gendercode === 2 ? 'F' : '',
            jobTitle: dynamicsData.jobtitle || '',
            parentCustomerId: dynamicsData._parentcustomerid_value || '',
            createdOn: dynamicsData.createdon || '',
            modifiedOn: dynamicsData.modifiedon || '',
          };
          consolidatedData.metadata!.sources.push('Dynamics CRM');
          consolidatedData.metadata!.hasDynamicsData = true;
          console.log('✅ Dados do Dynamics CRM obtidos');
        } else {
          console.warn('⚠️ Erro ao buscar dados do Dynamics CRM:', dynamicsResponse.status);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar dados do Dynamics CRM:', error);
    }

    // Verificar se temos pelo menos alguns dados
    if (!consolidatedData.dso && !consolidatedData.dynamics) {
      return NextResponse.json(
        { error: 'Usuário não encontrado em nenhum dos sistemas' },
        { status: 404 }
      );
    }

    console.log('✅ Dados consolidados obtidos com sucesso');

    return NextResponse.json({
      success: true,
      data: consolidatedData,
      message: 'Dados consolidados do usuário obtidos com sucesso',
      sources: consolidatedData.metadata!.sources
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados consolidados do usuário:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 