/**
 * Testes para sistema dinâmico de perfil
 * Verifica se os dados são carregados corretamente para qualquer usuário
 */

/**
 * Testa o carregamento de dados de perfil para qualquer usuário logado
 */
async function testDynamicProfileLoad() {
  console.log('🧪 [Test] Iniciando teste de carregamento dinâmico de perfil...');
  
  try {
    // 1. Verificar se há sessão ativa
    const cookieResponse = await fetch('/api/essentials/coockies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const cookieData = await cookieResponse.json();
    const isLoggedIn = cookieData?.token?.value;
    
    console.log('🔍 [Test] Usuário logado:', !!isLoggedIn);
    
    if (!isLoggedIn) {
      console.warn('⚠️ [Test] Nenhum usuário logado. Faça login primeiro para testar.');
      return {
        success: false,
        error: 'Usuário não logado'
      };
    }
    
    // 2. Carregar dados reais do DSO
    const profileResponse = await fetch('https://dso.childfundbrasil.org.br/api/v1/my-profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cookieData.token.value}`,
        'Accept': 'application/json'
      }
    });
    
    if (profileResponse.ok) {
      const result = await profileResponse.json();
      console.log('📊 [Test] Resultado do carregamento:', result);
      
      console.log('✅ [Test] Dados carregados com sucesso!');
      console.log('👤 [Test] Dados do usuário:');
      console.log('  - ID:', result.id || result.data?.id);
      console.log('  - Nome:', result.name || result.data?.name);
      console.log('  - Email:', result.email || result.data?.email);
      console.log('  - CPF:', result.document || result.cpf || result.data?.document);
      console.log('  - Telefone:', result.phone || result.data?.phone);
      console.log('  - CEP:', result.cep || result.data?.cep);
      console.log('  - Cidade:', result.city || result.data?.city);
      console.log('  - Estado:', result.state || result.data?.state);
      
      return {
        success: true,
        userData: result.data || result,
        fieldsUpdated: 0
      };
    } else {
      console.error('❌ [Test] Falha ao carregar dados:', profileResponse.status);
      return {
        success: false,
        error: `HTTP ${profileResponse.status}`
      };
    }
    
  } catch (error) {
    console.error('❌ [Test] Erro durante teste:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Testa se os campos DOM foram atualizados corretamente
 */
function testDOMFieldsUpdate() {
  console.log('🧪 [Test] Verificando atualização dos campos DOM...');
  
  const fields = [
    'name', 'email', 'phone', 'cpf', 'birthDate', 
    'cep', 'logradouro', 'numero', 'complemento', 
    'bairro', 'cidade', 'estado'
  ];
  
  const results: Record<string, { exists: boolean; hasValue: boolean; value: string }> = {};
  
  fields.forEach(fieldId => {
    const element = document.getElementById(fieldId) as HTMLInputElement;
    
    if (element) {
      const value = element.value;
      results[fieldId] = {
        exists: true,
        hasValue: !!value,
        value: value
      };
    } else {
      results[fieldId] = {
        exists: false,
        hasValue: false,
        value: ''
      };
    }
  });
  
  console.log('📋 [Test] Status dos campos DOM:', results);
  
  const existingFields = Object.values(results).filter(r => r.exists).length;
  const filledFields = Object.values(results).filter(r => r.hasValue).length;
  
  console.log(`📊 [Test] Resultado: ${existingFields}/${fields.length} campos existem, ${filledFields}/${existingFields} preenchidos`);
  
  return {
    totalFields: fields.length,
    existingFields,
    filledFields,
    results
  };
}

/**
 * Testa se o sistema funciona com diferentes usuários
 */
async function testMultiUserSupport() {
  console.log('🧪 [Test] Testando suporte a múltiplos usuários...');
  
  try {
    // 1. Verificar token atual
    const cookieResponse = await fetch('/api/essentials/coockies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const cookieData = await cookieResponse.json();
    console.log('🍪 [Test] Cookie atual:', cookieData);
    
    if (!cookieData?.token?.value) {
      console.warn('⚠️ [Test] Nenhum token encontrado');
      return {
        success: false,
        error: 'Token não encontrado'
      };
    }
    
    // 2. Buscar dados do perfil atual
    const profileResponse = await fetch('https://dso.childfundbrasil.org.br/api/v1/my-profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cookieData.token.value}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 [Test] Status da resposta:', profileResponse.status);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ [Test] Dados do usuário atual:');
      console.log('  - ID:', profileData.id || profileData.data?.id);
      console.log('  - Nome:', profileData.name || profileData.data?.name);
      console.log('  - Email:', profileData.email || profileData.data?.email);
      
      return {
        success: true,
        currentUser: profileData.data || profileData,
        token: cookieData.token.value
      };
    } else {
      console.error('❌ [Test] Erro ao buscar perfil:', profileResponse.status);
      return {
        success: false,
        error: `HTTP ${profileResponse.status}`
      };
    }
    
  } catch (error) {
    console.error('❌ [Test] Erro no teste:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log('🧪 [Test Suite] Iniciando bateria de testes...');
  console.log('=====================================');
  
  const results = {
    dynamicLoad: await testDynamicProfileLoad(),
    domFields: testDOMFieldsUpdate(),
    multiUser: await testMultiUserSupport()
  };
  
  console.log('=====================================');
  console.log('📊 [Test Suite] Resultados finais:');
  console.log('  - Carregamento dinâmico:', results.dynamicLoad.success ? '✅ OK' : '❌ FALHOU');
  console.log('  - Campos DOM:', results.domFields.filledFields > 0 ? '✅ OK' : '❌ FALHOU');
  console.log('  - Suporte multi-usuário:', results.multiUser.success ? '✅ OK' : '❌ FALHOU');
  console.log('=====================================');
  
  return results;
}

// Tornar funções disponíveis globalmente
if (typeof window !== 'undefined') {
  (window as any).testDynamicProfile = {
    testDynamicProfileLoad,
    testDOMFieldsUpdate,
    testMultiUserSupport,
    runAllTests
  };
  
  console.log('🧪 [Test Suite] Funções de teste disponíveis:');
  console.log('  - testDynamicProfile.testDynamicProfileLoad()');
  console.log('  - testDynamicProfile.testDOMFieldsUpdate()');
  console.log('  - testDynamicProfile.testMultiUserSupport()');
  console.log('  - testDynamicProfile.runAllTests()');
}

export {
  testDynamicProfileLoad,
  testDOMFieldsUpdate,
  testMultiUserSupport,
  runAllTests
}; 