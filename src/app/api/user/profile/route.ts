import { NextRequest, NextResponse } from 'next/server';

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';

/**
 * GET /api/user/profile
 * Busca dados do perfil do usuário com debug detalhado
 */
export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    requestHeaders: Object.fromEntries(request.headers.entries()),
    steps: []
  };

  try {
    console.log('🔍 [PROFILE DEBUG] Iniciando busca de perfil do usuário...');
    
    // Passo 1: Verificar parâmetros da requisição
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const document = searchParams.get('document');  
    const email = searchParams.get('email');

    debugInfo.steps.push({
      step: 1,
      name: 'Verificar parâmetros',
      params: { userId, document, email },
      timestamp: new Date().toISOString()
    });

    console.log('📋 [PROFILE DEBUG] Parâmetros recebidos:', { userId, document, email });

    // Passo 2: Tentar usar dados do cabeçalho de autorização
    const authHeader = request.headers.get('authorization');
    const userAgent = request.headers.get('user-agent');

    debugInfo.steps.push({
      step: 2,
      name: 'Verificar autenticação',
      hasAuth: !!authHeader,
      authPreview: authHeader?.substring(0, 20) + '...',
      userAgent,
      timestamp: new Date().toISOString()
    });

    console.log('🔐 [PROFILE DEBUG] Autenticação:', { 
      hasAuth: !!authHeader, 
      userAgent 
    });

    // Passo 3: Determinar estratégia de busca
    let searchStrategy = 'none';
    let searchUrl = '';

    if (userId) {
      searchStrategy = 'my-profile';
      searchUrl = `${DSO_HOST}api/v1/my-profile`;
    } else if (document) {
      searchStrategy = 'search-by-document';
      searchUrl = `${DSO_HOST}api/v1/users/search?document=${encodeURIComponent(document)}`;
    } else if (email) {
      searchStrategy = 'search-by-email';
      searchUrl = `${DSO_HOST}api/v1/users/search?email=${encodeURIComponent(email)}`;
    } else {
      // Tentar buscar perfil atual
      searchStrategy = 'current-profile';
      searchUrl = `${DSO_HOST}api/v1/my-profile`;
    }

    debugInfo.steps.push({
      step: 3,
      name: 'Determinar estratégia',
      strategy: searchStrategy,
      url: searchUrl,
      timestamp: new Date().toISOString()
    });

    console.log('📍 [PROFILE DEBUG] Estratégia de busca:', { searchStrategy, searchUrl });

    // Passo 4: Fazer requisição ao DSO
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
      'Accept': 'application/json'
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    debugInfo.steps.push({
      step: 4,
      name: 'Preparar requisição DSO',
      headers: Object.keys(headers),
      timestamp: new Date().toISOString()
    });

    console.log('📤 [PROFILE DEBUG] Fazendo requisição para:', searchUrl);

    const dsoResponse = await fetch(searchUrl, {
      method: 'GET',
      headers,
    });

    debugInfo.steps.push({
      step: 5,
      name: 'Resposta DSO',
      status: dsoResponse.status,
      statusText: dsoResponse.statusText,
      headers: Object.fromEntries(dsoResponse.headers.entries()),
      timestamp: new Date().toISOString()
    });

    console.log('📥 [PROFILE DEBUG] Resposta DSO:', {
      status: dsoResponse.status,
      statusText: dsoResponse.statusText,
      contentType: dsoResponse.headers.get('content-type')
    });

    // Passo 5: Processar resposta
    let responseData: any = null;
    let responseText = '';

    try {
      responseText = await dsoResponse.text();
      debugInfo.steps.push({
        step: 6,
        name: 'Ler resposta texto',
        textLength: responseText.length,
        textPreview: responseText.substring(0, 200),
        timestamp: new Date().toISOString()
      });

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
          debugInfo.steps.push({
            step: 7,
            name: 'Parse JSON',
            success: true,
            dataKeys: Object.keys(responseData),
            timestamp: new Date().toISOString()
          });
        } catch (jsonError) {
          debugInfo.steps.push({
            step: 7,
            name: 'Parse JSON',
            success: false,
            error: jsonError instanceof Error ? jsonError.message : 'Erro JSON',
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (textError) {
      debugInfo.steps.push({
        step: 6,
        name: 'Ler resposta texto',
        success: false,
        error: textError instanceof Error ? textError.message : 'Erro ao ler texto',
        timestamp: new Date().toISOString()
      });
    }

    // Passo 6: Análise final
    if (dsoResponse.ok && responseData) {
      console.log('✅ [PROFILE DEBUG] Dados obtidos com sucesso do DSO');
      
      return NextResponse.json({
        success: true,
        data: {
          dso: responseData,
          metadata: {
            lastSync: new Date().toISOString(),
            sources: ['DSO'],
            hasDSOData: true,
            hasDynamicsData: false,
            strategy: searchStrategy
          }
        },
        message: 'Perfil obtido com sucesso do DSO',
        debugInfo
      });
    } else {
      console.log('❌ [PROFILE DEBUG] Falha ao obter dados do DSO');
      
      return NextResponse.json({
        success: false,
        error: `DSO retornou ${dsoResponse.status}: ${dsoResponse.statusText}`,
        details: responseText.substring(0, 500),
        debugInfo
      }, { status: dsoResponse.status });
    }

  } catch (error) {
    console.error('❌ [PROFILE DEBUG] Erro crítico:', error);
    
    debugInfo.steps.push({
      step: 'error',
      name: 'Erro crítico',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      debugInfo
    }, { status: 500 });
  }
}

/**
 * POST /api/user/profile
 * Atualiza o perfil do usuário logado diretamente no DSO
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileData } = body;

    console.log('🔍 Atualizando perfil do usuário no DSO...', profileData);

    // Buscar token de autenticação
    const authHeader = request.headers.get('authorization');
    const cookies = request.headers.get('cookie') || '';
    
    // Extrair token do cookie se não estiver no header
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const tokenMatch = cookies.match(/childfund-auth-token=([^;]+)/);
      if (tokenMatch) {
        token = tokenMatch[1];
      }
    }

    if (!token) {
      console.error('❌ Token de autenticação não encontrado');
      return NextResponse.json({
        success: false,
        error: 'Token de autenticação não encontrado'
      }, { status: 401 });
    }

    // Fazer requisição direta para o DSO
    const dsoResponse = await fetch(`${DSO_HOST}api/v1/my-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    console.log('📥 Resposta DSO atualização:', {
      status: dsoResponse.status,
      statusText: dsoResponse.statusText
    });

    if (!dsoResponse.ok) {
      const errorText = await dsoResponse.text();
      console.error('❌ Erro DSO:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `Erro ao atualizar perfil: ${dsoResponse.status}`,
        details: errorText
      }, { status: dsoResponse.status });
    }

    const data = await dsoResponse.json();
    console.log('✅ Perfil atualizado com sucesso:', data);
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil do usuário:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}