/**
 * Teste simples para verificar funcionalidade de atualização de perfil DSO
 */

import { DSOService } from '../services/DSOService';

export async function testProfileUpdate() {
  console.log('🧪 [Profile Update Test] Iniciando teste de atualização de perfil...');
  
  try {
    // Verificar se há token DSO
    const token = localStorage.getItem('childfund-auth-token') || localStorage.getItem('auth-token');
    if (!token) {
      console.warn('⚠️ [Profile Update Test] Token DSO não encontrado. Faça login primeiro.');
      return {
        success: false,
        error: 'Token não encontrado'
      };
    }

    console.log('✅ [Profile Update Test] Token encontrado:', token.substring(0, 20) + '...');

    // Dados de teste para atualização
    const testData = {
      name: 'Teste Atualização Profile',
      phone: '21987654321'
    };

    console.log('🔍 [Profile Update Test] Testando atualização com dados:', testData);

    // Testar atualização via DSOService
    const response = await DSOService.updateProfile(testData);
    
    console.log('📡 [Profile Update Test] Resposta da atualização:', response);

    if (response && (response.success || response.data)) {
      console.log('✅ [Profile Update Test] Atualização bem-sucedida!');
      return {
        success: true,
        data: response
      };
    } else {
      console.error('❌ [Profile Update Test] Falha na atualização:', response);
      return {
        success: false,
        error: 'Resposta inválida do servidor'
      };
    }

  } catch (error) {
    console.error('❌ [Profile Update Test] Erro no teste:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para testar atualização de endereço
export async function testAddressUpdate() {
  console.log('🧪 [Address Update Test] Iniciando teste de atualização de endereço...');
  
  try {
    const token = localStorage.getItem('childfund-auth-token') || localStorage.getItem('auth-token');
    if (!token) {
      console.warn('⚠️ [Address Update Test] Token DSO não encontrado. Faça login primeiro.');
      return {
        success: false,
        error: 'Token não encontrado'
      };
    }

    // Dados de teste para atualização de endereço
    const testAddressData = {
      cep: '20261065', // CEP sem formatação
      street: 'Rua do Bispo - Teste',
      number: '222',
      addressComplement: 'Teste de atualização',
      neighborhood: 'Rio Comprido',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'BR'
    };

    console.log('🔍 [Address Update Test] Testando atualização com dados:', testAddressData);

    const response = await DSOService.updateProfile(testAddressData);
    
    console.log('📡 [Address Update Test] Resposta da atualização:', response);

    if (response && (response.success || response.data)) {
      console.log('✅ [Address Update Test] Atualização de endereço bem-sucedida!');
      return {
        success: true,
        data: response
      };
    } else {
      console.error('❌ [Address Update Test] Falha na atualização de endereço:', response);
      return {
        success: false,
        error: 'Resposta inválida do servidor'
      };
    }

  } catch (error) {
    console.error('❌ [Address Update Test] Erro no teste:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para testar busca de perfil atual
export async function testProfileFetch() {
  console.log('🧪 [Profile Fetch Test] Iniciando teste de busca de perfil...');
  
  try {
    const token = localStorage.getItem('childfund-auth-token') || localStorage.getItem('auth-token');
    if (!token) {
      console.warn('⚠️ [Profile Fetch Test] Token DSO não encontrado. Faça login primeiro.');
      return {
        success: false,
        error: 'Token não encontrado'
      };
    }

    console.log('🔍 [Profile Fetch Test] Buscando perfil atual...');

    const response = await DSOService.getDonorProfile('current');
    
    console.log('📡 [Profile Fetch Test] Resposta da busca:', response);

    if (response && response.success && response.data) {
      console.log('✅ [Profile Fetch Test] Busca de perfil bem-sucedida!');
      console.log('👤 [Profile Fetch Test] Dados do perfil:', response.data);
      return {
        success: true,
        data: response.data
      };
    } else {
      console.error('❌ [Profile Fetch Test] Falha na busca de perfil:', response);
      return {
        success: false,
        error: 'Resposta inválida do servidor'
      };
    }

  } catch (error) {
    console.error('❌ [Profile Fetch Test] Erro no teste:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Testa a obtenção do token de autenticação
 */
export async function testTokenRetrieval(): Promise<void> {
  console.log('🧪 [TEST] Testando obtenção do token...');
  
  try {
    // Verificar todas as chaves do localStorage
    console.log('🔍 Chaves disponíveis no localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        console.log(`  - ${key}: ${value?.substring(0, 100)}...`);
      }
    }
    
    // Testar busca do token
    const { DSOService } = await import('../services/DSOService');
    
    // Acessar método privado via reflection (para teste)
    const token = await (DSOService as any).getAuthToken();
    
    if (token) {
      console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ Token não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar token:', error);
  }
}

/**
 * Testa a atualização de perfil com token
 */
export async function testProfileUpdateWithToken(): Promise<void> {
  console.log('🧪 [TEST] Testando atualização de perfil com token...');
  
  try {
    const { DSOService } = await import('../services/DSOService');
    
    // Dados de teste
    const testData = {
      name: 'Teste Atualização',
      phone: '(11) 99999-9999'
    };
    
    console.log('📝 Dados de teste:', testData);
    
    const result = await DSOService.updateProfile(testData);
    console.log('✅ Resultado da atualização:', result);
    
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
  }
}

// Função para executar todos os testes
export async function runAllProfileTests() {
  console.log('🚀 [Profile Tests] Executando todos os testes de perfil...');
  
  const results = {
    fetch: await testProfileFetch(),
    updatePersonal: await testProfileUpdate(),
    updateAddress: await testAddressUpdate()
  };

  console.log('📊 [Profile Tests] Resultados dos testes:', results);
  
  const successCount = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`🎯 [Profile Tests] Resumo: ${successCount}/${totalTests} testes bem-sucedidos`);
  
  return results;
}

// Disponibilizar funções globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).testProfileUpdate = testProfileUpdate;
  (window as any).testAddressUpdate = testAddressUpdate;
  (window as any).testProfileFetch = testProfileFetch;
  (window as any).runAllProfileTests = runAllProfileTests;
  
  console.log('🧪 [Profile Tests] Funções de teste disponíveis globalmente:');
  console.log('  - testProfileUpdate()');
  console.log('  - testAddressUpdate()');
  console.log('  - testProfileFetch()');
  console.log('  - runAllProfileTests()');
} 