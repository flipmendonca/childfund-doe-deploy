/**
 * Teste direto do endpoint /api/essentials/coockies
 */

// Função para testar o endpoint de cookies
async function testCookieEndpoint() {
  console.log('🧪 [Test Cookie] Testando endpoint /api/essentials/coockies...');
  
  try {
    console.log('🔄 [Test Cookie] Fazendo requisição GET...');
    
    const response = await fetch('/api/essentials/coockies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Não incluir Authorization para desenvolvimento
      }
    });
    
    console.log('📡 [Test Cookie] Status da resposta:', response.status);
    console.log('📡 [Test Cookie] Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📡 [Test Cookie] Resposta raw:', data);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ [Test Cookie] Resposta JSON:', jsonData);
      } catch (e) {
        console.log('⚠️ [Test Cookie] Resposta não é JSON válido');
      }
    } else {
      console.error('❌ [Test Cookie] Erro HTTP:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ [Test Cookie] Erro na requisição:', error);
  }
}

// Função para testar definir um token
async function testSetToken() {
  console.log('🧪 [Test Cookie] Testando POST para definir token...');
  
  try {
    const response = await fetch('/api/essentials/coockies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'test-token-123'
      })
    });
    
    console.log('📡 [Test Cookie] POST Status:', response.status);
    
    const data = await response.text();
    console.log('📡 [Test Cookie] POST Resposta:', data);
    
  } catch (error) {
    console.error('❌ [Test Cookie] Erro no POST:', error);
  }
}

// Disponibilizar globalmente
(window as any).testCookieEndpoint = {
  testGet: testCookieEndpoint,
  testPost: testSetToken,
  testAll: async () => {
    await testCookieEndpoint();
    await testSetToken();
    await testCookieEndpoint(); // Testar novamente após definir
  }
};

console.log('🧪 [Test Cookie] Funções disponíveis:');
console.log('  testCookieEndpoint.testGet() - Testar GET');
console.log('  testCookieEndpoint.testPost() - Testar POST');
console.log('  testCookieEndpoint.testAll() - Testar tudo');

export { testCookieEndpoint }; 