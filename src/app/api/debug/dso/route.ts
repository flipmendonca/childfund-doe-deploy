import { NextRequest, NextResponse } from 'next/server';

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';

/**
 * GET /api/debug/dso
 * Debug detalhado da integração DSO
 */
export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    dsoHost: DSO_HOST,
    tests: [],
    authInfo: {},
    userInfo: {}
  };

  try {
    console.log('🔍 [DSO DEBUG] Iniciando debug detalhado do DSO...');

    // Teste 1: Verificar conectividade básica com DSO
    debugInfo.tests.push({
      name: 'Conectividade DSO',
      status: 'testing',
      url: DSO_HOST,
      description: 'Testando conectividade básica com o servidor DSO'
    });

    try {
      const pingResponse = await fetch(DSO_HOST, {
        method: 'GET',
        headers: {
          'User-Agent': 'ChildFund-Brasil-Debug/1.0',
        },
      });

      debugInfo.tests[0].status = pingResponse.ok ? 'success' : 'failed';
      debugInfo.tests[0].httpStatus = pingResponse.status;
      debugInfo.tests[0].headers = Object.fromEntries(pingResponse.headers.entries());
      
      console.log(`🔍 [DSO DEBUG] Conectividade DSO: ${pingResponse.status} ${pingResponse.statusText}`);
    } catch (error) {
      debugInfo.tests[0].status = 'error';
      debugInfo.tests[0].error = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🔍 [DSO DEBUG] Erro de conectividade:', error);
    }

    // Teste 2: Verificar endpoint /api/v1/my-profile (sem autenticação)
    const profileEndpoint = `${DSO_HOST}api/v1/my-profile`;
    debugInfo.tests.push({
      name: 'Endpoint my-profile (sem auth)',
      status: 'testing',
      url: profileEndpoint,
      description: 'Testando endpoint /api/v1/my-profile sem autenticação'
    });

    try {
      const profileResponse = await fetch(profileEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ChildFund-Brasil-Debug/1.0',
        },
      });

      debugInfo.tests[1].status = profileResponse.ok ? 'success' : 'failed';
      debugInfo.tests[1].httpStatus = profileResponse.status;
      debugInfo.tests[1].headers = Object.fromEntries(profileResponse.headers.entries());
      
      try {
        const responseText = await profileResponse.text();
        debugInfo.tests[1].responseText = responseText.substring(0, 500);
        
        // Tentar parsear como JSON
        try {
          debugInfo.tests[1].responseJson = JSON.parse(responseText);
        } catch (e) {
          debugInfo.tests[1].note = 'Resposta não é JSON válido';
        }
      } catch (e) {
        debugInfo.tests[1].note = 'Erro ao ler resposta';
      }

      console.log(`🔍 [DSO DEBUG] Endpoint my-profile: ${profileResponse.status} ${profileResponse.statusText}`);
    } catch (error) {
      debugInfo.tests[1].status = 'error';
      debugInfo.tests[1].error = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🔍 [DSO DEBUG] Erro no endpoint my-profile:', error);
    }

    // Teste 3: Verificar endpoint /api/v1/users/search
    const searchEndpoint = `${DSO_HOST}api/v1/users/search?document=123456789`;
    debugInfo.tests.push({
      name: 'Endpoint users/search',
      status: 'testing',
      url: searchEndpoint,
      description: 'Testando endpoint /api/v1/users/search'
    });

    try {
      const searchResponse = await fetch(searchEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ChildFund-Brasil-Debug/1.0',
        },
      });

      debugInfo.tests[2].status = searchResponse.ok ? 'success' : 'failed';
      debugInfo.tests[2].httpStatus = searchResponse.status;
      debugInfo.tests[2].headers = Object.fromEntries(searchResponse.headers.entries());
      
      try {
        const responseText = await searchResponse.text();
        debugInfo.tests[2].responseText = responseText.substring(0, 500);
        
        try {
          debugInfo.tests[2].responseJson = JSON.parse(responseText);
        } catch (e) {
          debugInfo.tests[2].note = 'Resposta não é JSON válido';
        }
      } catch (e) {
        debugInfo.tests[2].note = 'Erro ao ler resposta';
      }

      console.log(`🔍 [DSO DEBUG] Endpoint users/search: ${searchResponse.status} ${searchResponse.statusText}`);
    } catch (error) {
      debugInfo.tests[2].status = 'error';
      debugInfo.tests[2].error = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🔍 [DSO DEBUG] Erro no endpoint users/search:', error);
    }

    // Análise de autenticação
    debugInfo.authInfo = {
      hasAuthHeader: !!request.headers.get('authorization'),
      authHeader: request.headers.get('authorization')?.substring(0, 20) + '...',
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    };

    // Verificar dados do usuário no localStorage (simulado)
    debugInfo.userInfo = {
      note: 'Para verificar dados do localStorage, use o console do browser',
      instructions: [
        'Abra o console do browser (F12)',
        'Execute: localStorage.getItem("childfund-auth-data")',
        'Execute: localStorage.getItem("user")',
        'Verifique se há dados de autenticação salvos'
      ]
    };

    console.log('✅ [DSO DEBUG] Debug completo finalizado');

    return NextResponse.json({
      success: true,
      debugInfo,
      summary: {
        totalTests: debugInfo.tests.length,
        successfulTests: debugInfo.tests.filter((t: any) => t.status === 'success').length,
        failedTests: debugInfo.tests.filter((t: any) => t.status === 'failed').length,
        errorTests: debugInfo.tests.filter((t: any) => t.status === 'error').length,
      }
    });

  } catch (error) {
    console.error('❌ [DSO DEBUG] Erro crítico no debug:', error);
    
    debugInfo.criticalError = {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    };

    return NextResponse.json({
      success: false,
      error: 'Erro crítico durante debug',
      debugInfo
    }, { status: 500 });
  }
}