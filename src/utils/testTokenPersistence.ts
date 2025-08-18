/**
 * Teste específico para verificar persistência de token nos cookies
 * Baseado no fluxo que funciona em produção
 */

interface TokenTestResult {
  success: boolean;
  step: string;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Testa se o token está sendo salvo e recuperado corretamente
 */
export async function testTokenPersistence(): Promise<TokenTestResult[]> {
  const results: TokenTestResult[] = [];
  
  console.log('🧪 [Token Persistence] Iniciando teste de persistência de token...');
  
  // Passo 1: Verificar estado inicial dos cookies
  console.log('🔍 [Token Persistence] Passo 1: Verificar estado inicial');
  
  try {
    const initialResponse = await fetch('/api/essentials/coockies');
    const initialData = await initialResponse.json();
    
    results.push({
      success: true,
      step: 'check_initial_state',
      message: `Estado inicial: ${initialData.success ? 'Token encontrado' : 'Nenhum token'}`,
      data: {
        hasToken: initialData.success,
        tokenValue: initialData.token?.value?.substring(0, 20) + '...' || null,
        availableCookies: initialData.debug?.availableCookies || []
      }
    });
  } catch (error) {
    results.push({
      success: false,
      step: 'check_initial_state',
      message: 'Erro ao verificar estado inicial',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
  
  // Passo 2: Salvar token de teste
  console.log('💾 [Token Persistence] Passo 2: Salvar token de teste');
  
  const testToken = `test-token-${Date.now()}`;
  
  try {
    const saveResponse = await fetch('/api/essentials/coockies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: testToken })
    });
    
    const saveData = await saveResponse.json();
    
    if (saveData.success) {
      results.push({
        success: true,
        step: 'save_token',
        message: 'Token salvo com sucesso',
        data: {
          tokenLength: testToken.length,
          response: saveData
        }
      });
    } else {
      results.push({
        success: false,
        step: 'save_token',
        message: 'Falha ao salvar token',
        error: saveData.error || 'Erro desconhecido'
      });
    }
  } catch (error) {
    results.push({
      success: false,
      step: 'save_token',
      message: 'Erro ao salvar token',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
  
  // Passo 3: Verificar se token foi salvo
  console.log('🔍 [Token Persistence] Passo 3: Verificar se token foi salvo');
  
  try {
    // Aguardar um pouco para garantir que o cookie foi definido
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const verifyResponse = await fetch('/api/essentials/coockies');
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success && verifyData.token) {
      const tokenMatches = verifyData.token.value === testToken;
      
      results.push({
        success: tokenMatches,
        step: 'verify_token',
        message: tokenMatches ? 'Token encontrado e corresponde' : 'Token encontrado mas não corresponde',
        data: {
          expectedToken: testToken.substring(0, 20) + '...',
          actualToken: verifyData.token.value.substring(0, 20) + '...',
          tokenName: verifyData.token.name,
          matches: tokenMatches
        }
      });
    } else {
      results.push({
        success: false,
        step: 'verify_token',
        message: 'Token não encontrado após salvamento',
        error: 'Token não persistiu nos cookies'
      });
    }
  } catch (error) {
    results.push({
      success: false,
      step: 'verify_token',
      message: 'Erro ao verificar token',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
  
  // Passo 4: Testar múltiplas verificações
  console.log('🔄 [Token Persistence] Passo 4: Testar múltiplas verificações');
  
  try {
    const multipleChecks = [];
    
    for (let i = 0; i < 3; i++) {
      const checkResponse = await fetch('/api/essentials/coockies');
      const checkData = await checkResponse.json();
      
      multipleChecks.push({
        attempt: i + 1,
        success: checkData.success,
        hasToken: !!checkData.token,
        tokenValue: checkData.token?.value?.substring(0, 20) + '...' || null
      });
      
      // Aguardar um pouco entre verificações
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const allSuccessful = multipleChecks.every(check => check.success);
    
    results.push({
      success: allSuccessful,
      step: 'multiple_checks',
      message: `Múltiplas verificações: ${allSuccessful ? 'Todas bem-sucedidas' : 'Algumas falharam'}`,
      data: {
        checks: multipleChecks,
        allSuccessful
      }
    });
  } catch (error) {
    results.push({
      success: false,
      step: 'multiple_checks',
      message: 'Erro nas múltiplas verificações',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
  
  // Passo 5: Limpar token de teste
  console.log('🧹 [Token Persistence] Passo 5: Limpar token de teste');
  
  try {
    const deleteResponse = await fetch('/api/essentials/coockies', {
      method: 'DELETE'
    });
    
    const deleteData = await deleteResponse.json();
    
    if (deleteData.success) {
      // Verificar se foi realmente removido
      const finalCheckResponse = await fetch('/api/essentials/coockies');
      const finalCheckData = await finalCheckResponse.json();
      
      results.push({
        success: !finalCheckData.success,
        step: 'cleanup_token',
        message: !finalCheckData.success ? 'Token removido com sucesso' : 'Token ainda presente após remoção',
        data: {
          deleteResponse: deleteData,
          finalCheck: finalCheckData
        }
      });
    } else {
      results.push({
        success: false,
        step: 'cleanup_token',
        message: 'Falha ao remover token',
        error: deleteData.error || 'Erro desconhecido'
      });
    }
  } catch (error) {
    results.push({
      success: false,
      step: 'cleanup_token',
      message: 'Erro ao limpar token',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
  
  return results;
}

/**
 * Exibe resultado do teste de persistência
 */
export function displayTokenTestResults(results: TokenTestResult[]): void {
  console.log('\n🧪 [Token Persistence] Resultado do Teste:');
  console.log('==========================================');
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} Passo ${index + 1} (${result.step}): ${result.message}`);
    
    if (result.data) {
      console.log('   📊 Dados:', result.data);
    }
    
    if (result.error) {
      console.log('   🔴 Erro:', result.error);
    }
    
    console.log('');
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`📊 Resumo: ${successCount}/${totalCount} passos bem-sucedidos`);
  
  if (successCount === totalCount) {
    console.log('🎉 Sistema de persistência de token está funcionando corretamente!');
  } else {
    console.log('⚠️ Problemas encontrados na persistência de token.');
    
    // Diagnóstico
    const failedSteps = results.filter(r => !r.success).map(r => r.step);
    console.log('🔧 Passos que falharam:', failedSteps.join(', '));
    
    if (failedSteps.includes('save_token')) {
      console.log('💡 Sugestão: Verificar se o endpoint POST /api/essentials/coockies está funcionando');
    }
    
    if (failedSteps.includes('verify_token')) {
      console.log('💡 Sugestão: Verificar se os cookies estão sendo definidos corretamente');
    }
  }
}

// Função para ser chamada no console
export function runTokenPersistenceTest() {
  console.log('🧪 [Token Persistence] Executando teste de persistência...');
  
  testTokenPersistence().then(results => {
    displayTokenTestResults(results);
  }).catch(error => {
    console.error('❌ [Token Persistence] Erro no teste:', error);
  });
}

// Disponibilizar no console
(window as any).runTokenPersistenceTest = runTokenPersistenceTest; 