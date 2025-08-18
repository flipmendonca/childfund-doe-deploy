import { NextRequest, NextResponse } from 'next/server';

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';

interface DSOUser {
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
}

/**
 * GET /api/dso/user/profile
 * Busca o perfil completo do usuário no DSO
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const document = searchParams.get('document');
    const email = searchParams.get('email');

    if (!userId && !document && !email) {
      return NextResponse.json(
        { error: 'É necessário fornecer userId, document ou email' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando perfil do usuário no DSO:', { userId, document, email });

    // Construir URL de busca baseada nos parâmetros fornecidos
    // Baseado na documentação, o endpoint correto é /api/v1/my-profile para dados do usuário logado
    let searchUrl = '';
    if (userId) {
      searchUrl = `${DSO_HOST}api/v1/my-profile`;
    } else if (document) {
      searchUrl = `${DSO_HOST}api/v1/users/search?document=${encodeURIComponent(document)}`;
    } else if (email) {
      searchUrl = `${DSO_HOST}api/v1/users/search?email=${encodeURIComponent(email)}`;
    }

    // Buscar token de autenticação do localStorage ou cookies
    let authToken = '';
    try {
      // Para endpoints autenticados, precisamos do token
      if (searchUrl.includes('/my-profile')) {
        // Aqui você pode implementar a lógica para obter o token
        // Por exemplo, do cabeçalho da requisição ou de um cookie
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
          authToken = authHeader.replace('Bearer ', '');
        }
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível obter token de autenticação');
    }

    // Buscar dados do usuário no DSO
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('❌ Erro na API DSO:', response.status, response.statusText);
      
      // Se não encontrou, retornar erro específico
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Usuário não encontrado no sistema DSO' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: `Erro na API DSO: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Perfil do usuário obtido do DSO');

    // Mapear dados para interface DSOUser
    const userProfile: DSOUser = {
      email: data.email || '',
      name: data.name || '',
      products: data.products || [],
      institution: data.institution || false,
      document: data.document || data.cpf || '',
      phone: data.phone || '',
      type_document: data.type_document || 'cpf',
      companyName: data.companyName || '',
      isAuthorizedToPurchase: data.isAuthorizedToPurchase || false,
      street: data.street || data.address || '',
      number: data.number || data.addressNumber || '',
      addressComplement: data.addressComplement || data.complement || '',
      neighborhood: data.neighborhood || data.bairro || '',
      state: data.state || '',
      profission: data.profission || data.profession || '',
      cep: data.cep || data.zipCode || '',
      city: data.city || '',
      country: data.country || 'Brasil',
      birthDate: data.birthDate || data.birthdate || '',
      pronouns: data.pronouns || '',
      gender: data.gender || '',
      dynamicsId: data.dynamicsId || data.contactid || data.id || '',
    };

    return NextResponse.json({
      success: true,
      data: userProfile,
      message: 'Perfil do usuário obtido com sucesso',
      source: 'DSO'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar perfil do usuário:', error);
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
 * POST /api/dso/user/profile
 * Atualiza o perfil do usuário no DSO
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profileData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Atualizando perfil do usuário no DSO:', userId);

    // Atualizar dados do usuário no DSO
    const response = await fetch(`${DSO_HOST}api/v1/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      console.error('❌ Erro ao atualizar perfil:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erro na API DSO: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Perfil do usuário atualizado no DSO');

    return NextResponse.json({
      success: true,
      data,
      message: 'Perfil do usuário atualizado com sucesso',
      source: 'DSO'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil do usuário:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 