/**
 * Testa se as credenciais são preservadas durante sincronização DSO
 */

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export async function testCredentialsPersistence(): Promise<TestResult> {
  try {
    console.log('🧪 [Credentials Test] Iniciando teste de persistência de credenciais...');
    
    // 1. Verificar se há dados no localStorage
    const authData = localStorage.getItem('childfund-auth-data');
    if (!authData) {
      return {
        success: false,
        message: 'Nenhum dado de autenticação encontrado no localStorage'
      };
    }
    
    // 2. Verificar estrutura dos dados
    const parsed = JSON.parse(authData);
    console.log('📊 [Credentials Test] Dados atuais:', {
      hasUser: !!parsed.user,
      hasToken: !!parsed.token,
      hasCredentials: !!parsed.credentials,
      credentialsStructure: parsed.credentials ? {
        hasLogin: !!parsed.credentials.login,
        hasPassword: !!parsed.credentials.password
      } : null,
      timestamp: parsed.timestamp,
      isMock: parsed.isMock
    });
    
    // 3. Verificar se as credenciais estão completas
    if (!parsed.credentials) {
      return {
        success: false,
        message: 'Credenciais não encontradas na estrutura de dados',
        details: parsed
      };
    }
    
    if (!parsed.credentials.login || !parsed.credentials.password) {
      return {
        success: false,
        message: 'Credenciais incompletas (faltando login ou password)',
        details: parsed.credentials
      };
    }
    
    // 4. Testar se o DSOInterceptor consegue acessar as credenciais
    const { DSOInterceptor } = await import('../lib/dso/DSOInterceptor');
    
    // Simular um teste de acesso às credenciais
    const testResult = await DSOInterceptor.checkTokenStatus();
    
    console.log('✅ [Credentials Test] Teste concluído com sucesso');
    return {
      success: true,
      message: 'Credenciais preservadas corretamente',
      details: {
        credentials: {
          login: parsed.credentials.login,
          password: '***'
        },
        tokenStatus: testResult.status,
        canRenewToken: testResult.status === 401 ? 'Sim (token expirado, mas credenciais disponíveis)' : 'Token válido'
      }
    };
    
  } catch (error) {
    console.error('❌ [Credentials Test] Erro no teste:', error);
    return {
      success: false,
      message: `Erro durante o teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: error
    };
  }
}

export function simulateTokenRenewal(): Promise<TestResult> {
  return new Promise(async (resolve) => {
    try {
      console.log('🧪 [Token Renewal Test] Iniciando simulação de renovação de token...');
      
             // 1. Verificar credenciais
       const credentialsTest = await testCredentialsPersistence();
       if (!credentialsTest.success) {
         resolve({
           success: false,
           message: 'Falha na verificação de credenciais: ' + credentialsTest.message
         });
         return;
       }
      
      // 2. Simular requisição que resultaria em 401
      const { DSOInterceptor } = await import('../lib/dso/DSOInterceptor');
      
      console.log('🔄 [Token Renewal Test] Simulando requisição que expira token...');
      const result = await DSOInterceptor.getProfile();
      
      console.log('📊 [Token Renewal Test] Resultado da requisição:', {
        status: result.status,
        success: result.success,
        needsLogin: result.needsLogin,
        hasError: !!result.error
      });
      
      if (result.status === 401 && result.needsLogin) {
        resolve({
          success: false,
          message: 'Token expirado e não foi possível renovar automaticamente',
          details: result
        });
      } else if (result.success) {
        resolve({
          success: true,
          message: 'Token renovado com sucesso ou ainda válido',
          details: result
        });
      } else {
        resolve({
          success: false,
          message: 'Erro inesperado durante teste de renovação',
          details: result
        });
      }
      
    } catch (error) {
      console.error('❌ [Token Renewal Test] Erro no teste:', error);
      resolve({
        success: false,
        message: `Erro durante simulação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error
      });
    }
  });
}

// Função para ser chamada no console
export async function runCredentialsTests() {
  console.log('🧪 [Credentials Tests] Executando testes de credenciais...');
  
  // Teste 1: Verificar persistência
  const persistenceTest = await testCredentialsPersistence();
  console.log('📊 [Test 1] Persistência de credenciais:', persistenceTest);
  
  // Teste 2: Simular renovação de token
  const renewalTest = await simulateTokenRenewal();
  console.log('📊 [Test 2] Renovação de token:', renewalTest);
  
  // Resumo final
  console.log('📋 [Resumo dos Testes]');
  console.log('  ✅ Persistência:', persistenceTest.success ? 'PASSOU' : 'FALHOU');
  console.log('  ✅ Renovação:', renewalTest.success ? 'PASSOU' : 'FALHOU');
  
  if (persistenceTest.success && renewalTest.success) {
    console.log('🎉 [Credentials Tests] Todos os testes passaram! Sistema funcionando corretamente.');
  } else {
    console.log('⚠️ [Credentials Tests] Alguns testes falharam. Verifique os detalhes acima.');
  }
} 