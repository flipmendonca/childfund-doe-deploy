/**
 * Teste que simula EXATAMENTE o fluxo de produção
 * Baseado nos dados reais que funcionam em produção
 */

interface ProductionTestResult {
  success: boolean;
  step: string;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Testa o fluxo completo de produção
 */
export async function testProductionFlow(login: string, password: string): Promise<ProductionTestResult[]> {
  const results: ProductionTestResult[] = [];
  
  console.log('🧪 [Production Flow] Iniciando teste do fluxo de produção...');
  
  // Passo 1: Login DSO
  try {
    console.log('🔐 [Production Flow] Passo 1: Login DSO');
    
    const loginResponse = await fetch('https://dso.childfundbrasil.org.br/api/v1/authentication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: login,
        password: password
      }),
      credentials: 'include'
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success === 'authenticated' && loginData.data?.token) {
      results.push({
        success: true,
        step: 'login',
        message: 'Login DSO bem-sucedido',
        data: {
          token: loginData.data.token.substring(0, 20) + '...',
          user_id: loginData.data.user_id,
          name: loginData.data.name
        }
      });
      
      // Passo 2: Salvar token nos cookies
      console.log('🍪 [Production Flow] Passo 2: Salvar token nos cookies');
      
      try {
        const cookieResponse = await fetch('/api/essentials/coockies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: loginData.data.token })
        });
        
        const cookieResult = await cookieResponse.json();
        
        if (cookieResult.success) {
          results.push({
            success: true,
            step: 'save_token',
            message: 'Token salvo nos cookies com sucesso',
            data: cookieResult
          });
          
          // Passo 3: Verificar se token foi salvo
          console.log('🔍 [Production Flow] Passo 3: Verificar token salvo');
          
          const verifyResponse = await fetch('/api/essentials/coockies');
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.success && verifyResult.token) {
            results.push({
              success: true,
              step: 'verify_token',
              message: 'Token encontrado nos cookies',
              data: {
                tokenFound: true,
                tokenValue: verifyResult.token.value.substring(0, 20) + '...'
              }
            });
            
            // Passo 4: Carregar perfil usando token
            console.log('👤 [Production Flow] Passo 4: Carregar perfil DSO');
            
            const profileResponse = await fetch('https://dso.childfundbrasil.org.br/api/v1/my-profile', {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${verifyResult.token.value}`
              }
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              
              results.push({
                success: true,
                step: 'load_profile',
                message: 'Perfil carregado com sucesso',
                data: {
                  name: profileData.name,
                  email: profileData.email,
                  document: profileData.document,
                  phone: profileData.phone,
                  hasAddress: !!(profileData.street || profileData.address)
                }
              });
              
              // Passo 5: Verificar status ativo
              console.log('✅ [Production Flow] Passo 5: Verificar status ativo');
              
              const statusResponse = await fetch('https://dso.childfundbrasil.org.br/api/v1/is-active', {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${verifyResult.token.value}`
                }
              });
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                
                results.push({
                  success: true,
                  step: 'check_status',
                  message: 'Status verificado com sucesso',
                  data: statusData
                });
              } else {
                results.push({
                  success: false,
                  step: 'check_status',
                  message: `Erro ao verificar status: ${statusResponse.status}`,
                  error: statusResponse.statusText
                });
              }
            } else {
              results.push({
                success: false,
                step: 'load_profile',
                message: `Erro ao carregar perfil: ${profileResponse.status}`,
                error: profileResponse.statusText
              });
            }
          } else {
            results.push({
              success: false,
              step: 'verify_token',
              message: 'Token não encontrado após salvamento',
              error: 'Token não persistiu nos cookies'
            });
          }
        } else {
          results.push({
            success: false,
            step: 'save_token',
            message: 'Erro ao salvar token nos cookies',
            error: cookieResult.error || 'Erro desconhecido'
          });
        }
      } catch (error) {
        results.push({
          success: false,
          step: 'save_token',
          message: 'Erro ao salvar token nos cookies',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    } else {
      results.push({
        success: false,
        step: 'login',
        message: 'Falha no login DSO',
        error: loginData.message || 'Credenciais inválidas'
      });
    }
  } catch (error) {
    results.push({
      success: false,
      step: 'login',
      message: 'Erro na requisição de login',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
  
  return results;
}

/**
 * Exibe resultado do teste de forma organizada
 */
export function displayTestResults(results: ProductionTestResult[]): void {
  console.log('\n🧪 [Production Flow] Resultado do Teste:');
  console.log('=====================================');
  
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
    console.log('🎉 Todos os passos funcionaram! Sistema está funcionando como em produção.');
  } else {
    console.log('⚠️ Alguns passos falharam. Verifique os erros acima.');
  }
}

// Função para ser chamada no console
export function runProductionFlowTest(login: string, password: string) {
  console.log('🧪 [Production Flow] Executando teste do fluxo de produção...');
  
  testProductionFlow(login, password).then(results => {
    displayTestResults(results);
  }).catch(error => {
    console.error('❌ [Production Flow] Erro no teste:', error);
  });
}

// Disponibilizar no console
(window as any).runProductionFlowTest = runProductionFlowTest; 