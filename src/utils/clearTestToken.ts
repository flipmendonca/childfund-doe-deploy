/**
 * Utilitário para limpar token de teste e explicar o problema
 */

/**
 * Limpa o token de teste que está causando erro 401
 */
export async function clearTestToken(): Promise<void> {
  console.log('🧹 [Clear Test Token] Limpando token de teste...');
  
  try {
    // 1. Verificar token atual
    const checkResponse = await fetch('/api/essentials/coockies');
    const checkData = await checkResponse.json();
    
    console.log('🔍 [Clear Test Token] Token atual:', checkData);
    
    if (checkData.token?.value?.includes('test-token')) {
      console.log('⚠️ [Clear Test Token] Token de teste detectado!');
      
      // 2. Remover token de teste
      const deleteResponse = await fetch('/api/essentials/coockies', {
        method: 'DELETE'
      });
      
      const deleteData = await deleteResponse.json();
      console.log('✅ [Clear Test Token] Token removido:', deleteData);
      
      // 3. Limpar também do localStorage
      localStorage.removeItem('childfund-auth-token');
      localStorage.removeItem('auth-token');
      
      console.log('✅ [Clear Test Token] Token de teste removido do localStorage também');
      
      console.log('📋 [Clear Test Token] Próximos passos:');
      console.log('   1. Faça logout da aplicação');
      console.log('   2. Faça login real com suas credenciais');
      console.log('   3. O token JWT real será salvo automaticamente');
      console.log('   4. A edição de perfil funcionará corretamente');
      
    } else {
      console.log('✅ [Clear Test Token] Nenhum token de teste encontrado');
    }
    
  } catch (error) {
    console.error('❌ [Clear Test Token] Erro:', error);
  }
}

/**
 * Explica o problema do token de teste
 */
export function explainTestTokenProblem(): void {
  console.group('🔍 [Test Token Problem] Explicação do Problema');
  console.log('❌ PROBLEMA: O token salvo no cookie é um valor de teste');
  console.log('   - Token atual: "test-token-1752427660042"');
  console.log('   - Token esperado: JWT real do DSO (eyJhbGciOiJIUzI1NiIs...)');
  console.log('');
  console.log('🔍 CAUSA: Scripts de teste executados anteriormente');
  console.log('   - testTokenPersistence.ts salvou token de teste');
  console.log('   - testCookieEndpoint.ts salvou token de teste');
  console.log('   - Esses tokens não são válidos para o DSO');
  console.log('');
  console.log('✅ SOLUÇÃO:');
  console.log('   1. Execute: clearTestToken()');
  console.log('   2. Faça logout da aplicação');
  console.log('   3. Faça login real com suas credenciais');
  console.log('   4. O token JWT real será salvo automaticamente');
  console.log('   5. A edição de perfil funcionará corretamente');
  console.groupEnd();
}

// Auto-executar explicação se chamado diretamente
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.clearTestToken = clearTestToken;
  // @ts-ignore
  window.explainTestTokenProblem = explainTestTokenProblem;
  
  console.log('🧹 [Clear Test Token] Utilitários carregados:');
  console.log('   - clearTestToken() - Remove token de teste');
  console.log('   - explainTestTokenProblem() - Explica o problema');
} 