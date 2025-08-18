/**
 * Teste direto de cadastro e login DSO
 * Não salva nada localmente - apenas testa os endpoints
 */

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';
const DSO_KEY = 'c5e53b87-d315-427d-a9f0-1d80d5f65f56';

// Dados do teste fornecidos pelo usuário
const TEST_USER_DATA = {
  cpf: '67573755082',
  password: 'ChildFund@2025',
  cep: '20261000'
};

/**
 * Busca dados de endereço pelo CEP
 */
async function getAddressByCEP(cep: string) {
  try {
    console.log(`🔍 [CEP] Buscando endereço para CEP: ${cep}`);
    
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao consultar CEP');
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    console.log('✅ [CEP] Endereço encontrado:', data);
    return data;
  } catch (error) {
    console.error('❌ [CEP] Erro:', error);
    throw error;
  }
}

/**
 * Cadastra usuário no DSO - teste direto
 */
async function testDSORegister() {
  console.log('🚀 [Teste Cadastro] === CADASTRO DIRETO DSO ===');
  
  try {
    // 1. BUSCAR DADOS DO CEP
    console.log('📍 [Teste Cadastro] 1. Buscando dados do CEP...');
    const addressData = await getAddressByCEP(TEST_USER_DATA.cep);
    
    // 2. PREPARAR DADOS DO USUÁRIO
    const userData = {
      type_document: 'cpf',
      name: 'João Silva Santos', // Nome genérico
      phone: '(21) 99567-8901', // Telefone genérico baseado no DDD do RJ
      address: addressData.logradouro || 'Rua Exemplo',
      addressNumber: '123', // Número genérico
      complement: '', // Vazio
      birthDate: '1990-05-15', // Data genérica
      cep: `${TEST_USER_DATA.cep.substring(0, 5)}-${TEST_USER_DATA.cep.substring(5)}`, // Formatar CEP
      city: addressData.localidade || 'Rio de Janeiro',
      confirm: TEST_USER_DATA.password, // Confirmação da senha
      country: 'BR',
      document: TEST_USER_DATA.cpf, // CPF sem formatação
      email: `joao.teste.${Date.now()}@gmail.com`, // Email único para teste
      gender: 'M',
      neighborhood: addressData.bairro || 'Centro',
      password: TEST_USER_DATA.password,
      state: addressData.uf || 'RJ'
    };

    console.log('📝 [Teste Cadastro] 2. Dados preparados:', {
      document: userData.document,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      address: `${userData.address}, ${userData.addressNumber}`,
      neighborhood: userData.neighborhood,
      city: userData.city,
      state: userData.state,
      cep: userData.cep,
      password: '***'
    });

    // 3. FAZER REQUISIÇÃO DE CADASTRO
    console.log('📤 [Teste Cadastro] 3. Enviando requisição de cadastro...');
    
    const registerResponse = await fetch(`${DSO_HOST}api/v1/user-public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    console.log('📡 [Teste Cadastro] Status da resposta:', registerResponse.status);

    const registerData = await registerResponse.json();
    console.log('📡 [Teste Cadastro] Dados da resposta:', registerData);

    if (registerResponse.ok) {
      console.log('✅ [Teste Cadastro] Cadastro realizado com sucesso!');
      console.log('📄 [Teste Cadastro] Detalhes:', {
        id: registerData.id,
        message: registerData.message,
        status: registerResponse.status
      });
      
      return {
        success: true,
        data: registerData,
        userData,
        timestamp: new Date().toISOString()
      };
    } else {
      console.error('❌ [Teste Cadastro] Cadastro falhou');
      console.error('📄 [Teste Cadastro] Erro:', registerData);
      
      // Se erro 409 (já existe), ainda consideramos "sucesso" para o teste de login
      if (registerResponse.status === 409) {
        console.log('⚠️ [Teste Cadastro] Usuário já existe - continuando para teste de login');
        return {
          success: true,
          data: { message: 'Usuário já existe', existingUser: true },
          userData,
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: false,
        error: registerData.message || 'Erro desconhecido',
        userData,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error('❌ [Teste Cadastro] Erro geral:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Testa login no DSO - teste direto
 */
async function testDSOLogin() {
  console.log('🔐 [Teste Login] === LOGIN DIRETO DSO ===');
  
  try {
    // 1. FAZER REQUISIÇÃO DE LOGIN
    console.log('📤 [Teste Login] 1. Enviando requisição de login...');
    console.log('📝 [Teste Login] Credenciais:', {
      login: TEST_USER_DATA.cpf,
      password: '***'
    });
    
    const loginResponse = await fetch(`${DSO_HOST}api/v1/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        login: TEST_USER_DATA.cpf,
        password: TEST_USER_DATA.password
      })
    });

    console.log('📡 [Teste Login] Status da resposta:', loginResponse.status);

    const loginData = await loginResponse.json();
    console.log('📡 [Teste Login] Dados da resposta:', loginData);

    if (loginData.success === 'authenticated') {
      console.log('✅ [Teste Login] Login realizado com sucesso!');
      console.log('📄 [Teste Login] Detalhes:', {
        hasToken: !!loginData.data?.token,
        userName: loginData.data?.name,
        userId: loginData.data?.user_id,
        tokenLength: loginData.data?.token?.length
      });
      
      return {
        success: true,
        data: loginData,
        timestamp: new Date().toISOString()
      };
    } else {
      console.error('❌ [Teste Login] Login falhou');
      console.error('📄 [Teste Login] Erro:', loginData);
      
      return {
        success: false,
        error: loginData.message || 'Credenciais inválidas',
        data: loginData,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error('❌ [Teste Login] Erro geral:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Testa busca de perfil após login
 */
async function testDSOProfile(token: string) {
  console.log('👤 [Teste Perfil] === PERFIL DSO ===');
  
  try {
    console.log('📤 [Teste Perfil] 1. Buscando perfil com token...');
    
    const profileResponse = await fetch(`${DSO_HOST}api/v1/my-profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 [Teste Perfil] Status da resposta:', profileResponse.status);

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ [Teste Perfil] Perfil obtido com sucesso!');
      console.log('📄 [Teste Perfil] Dados:', profileData);
      
      return {
        success: true,
        data: profileData,
        timestamp: new Date().toISOString()
      };
    } else {
      const errorData = await profileResponse.json();
      console.error('❌ [Teste Perfil] Erro ao buscar perfil:', errorData);
      
      return {
        success: false,
        error: errorData.message || `HTTP ${profileResponse.status}`,
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error('❌ [Teste Perfil] Erro geral:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Executa teste completo: cadastro → login → perfil
 */
export async function testCompleteFlowDSO() {
  console.log('🎯 [Teste Completo] === FLUXO COMPLETO DSO ===');
  console.log('📋 [Teste Completo] Dados do teste:', {
    cpf: TEST_USER_DATA.cpf,
    cep: TEST_USER_DATA.cep,
    password: '***'
  });
  
  const results = {
    register: null as any,
    login: null as any,
    profile: null as any,
    success: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // 1. TESTE DE CADASTRO
    console.log('\n📝 [Teste Completo] === ETAPA 1: CADASTRO ===');
    results.register = await testDSORegister();
    
    // 2. TESTE DE LOGIN
    console.log('\n🔐 [Teste Completo] === ETAPA 2: LOGIN ===');
    results.login = await testDSOLogin();
    
    // 3. TESTE DE PERFIL (se login foi bem-sucedido)
    if (results.login.success && results.login.data?.data?.token) {
      console.log('\n👤 [Teste Completo] === ETAPA 3: PERFIL ===');
      results.profile = await testDSOProfile(results.login.data.data.token);
    } else {
      console.log('\n⏭️ [Teste Completo] Pulando teste de perfil (login falhou)');
    }
    
    // 4. RESULTADO FINAL
    results.success = (
      results.login.success && 
      (results.profile ? results.profile.success : true)
    );
    
    console.log('\n🎯 [Teste Completo] === RESULTADO FINAL ===');
    console.log(`Status Geral: ${results.success ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log('Detalhes por etapa:');
    console.log(`  📝 Cadastro: ${results.register?.success ? '✅' : '❌'} ${results.register?.error || results.register?.data?.message || ''}`);
    console.log(`  🔐 Login: ${results.login.success ? '✅' : '❌'} ${results.login.error || ''}`);
    console.log(`  👤 Perfil: ${results.profile ? (results.profile.success ? '✅' : '❌') : '⏭️ Não testado'} ${results.profile?.error || ''}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ [Teste Completo] Erro geral:', error);
    results.success = false;
    return results;
  }
}

/**
 * Verifica se o usuário realmente existe no DSO fazendo login direto
 */
async function verifyUserExistsInDSO() {
  console.log('🔍 [Verificação] === VERIFICANDO SE USUÁRIO EXISTE NO DSO ===');
  
  try {
    console.log('📤 [Verificação] Testando login para confirmar existência...');
    console.log('📝 [Verificação] CPF:', TEST_USER_DATA.cpf);
    
    const loginResponse = await fetch(`${DSO_HOST}api/v1/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        login: TEST_USER_DATA.cpf,
        password: TEST_USER_DATA.password
      })
    });

    console.log('📡 [Verificação] Status da resposta:', loginResponse.status);

    const loginData = await loginResponse.json();
    console.log('📡 [Verificação] Dados da resposta:', loginData);

    // DSO retorna token diretamente, não success: 'authenticated'
    if (loginData.token && loginData.user_id) {
      console.log('✅ [Verificação] CONFIRMADO: Usuário existe e login funciona!');
      console.log('📄 [Verificação] Dados do usuário autenticado:', {
        id: loginData.user_id,
        name: loginData.name,
        email: loginData.email,
        hasToken: !!loginData.token
      });

      // Se conseguiu fazer login, vamos buscar o perfil para mais detalhes
      if (loginData.token) {
        console.log('👤 [Verificação] Buscando perfil completo...');
        
        const profileResponse = await fetch(`${DSO_HOST}api/v1/my-profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ [Verificação] Perfil completo obtido:', profileData);
          
                      return {
              exists: true,
              canLogin: true,
              hasProfile: true,
              userData: loginData,
              profileData: profileData,
              timestamp: new Date().toISOString()
            };
        } else {
          console.log('⚠️ [Verificação] Login OK, mas erro ao buscar perfil');
          return {
            exists: true,
            canLogin: true,
            hasProfile: false,
            userData: loginData,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      return {
        exists: true,
        canLogin: true,
        hasProfile: false,
        userData: loginData,
        timestamp: new Date().toISOString()
      };
      
    } else {
      console.log('❌ [Verificação] Usuário NÃO existe ou credenciais inválidas');
      console.log('📄 [Verificação] Detalhes do erro:', loginData);
      
      return {
        exists: false,
        canLogin: false,
        hasProfile: false,
        error: loginData.message || 'Credenciais inválidas',
        timestamp: new Date().toISOString()
      };
    }
    
  } catch (error) {
    console.error('❌ [Verificação] Erro durante verificação:', error);
    return {
      exists: false,
      canLogin: false,
      hasProfile: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Teste completo: verifica se usuário existe + tenta cadastrar novamente
 */
async function testUserStatusAndRegister() {
  console.log('🎯 [Status Completo] === VERIFICAÇÃO COMPLETA DO USUÁRIO ===');
  
  const results = {
    verification: null as any,
    registration: null as any,
    finalStatus: null as any,
    timestamp: new Date().toISOString()
  };
  
  try {
    // 1. VERIFICAR SE USUÁRIO JÁ EXISTE
    console.log('\n🔍 [Status Completo] === ETAPA 1: VERIFICAÇÃO DE EXISTÊNCIA ===');
    results.verification = await verifyUserExistsInDSO();
    
    // 2. TENTAR CADASTRAR NOVAMENTE PARA VER O COMPORTAMENTO
    console.log('\n📝 [Status Completo] === ETAPA 2: TESTE DE CADASTRO ===');
    results.registration = await testDSORegister();
    
    // 3. VERIFICAÇÃO FINAL
    console.log('\n🔍 [Status Completo] === ETAPA 3: VERIFICAÇÃO FINAL ===');
    results.finalStatus = await verifyUserExistsInDSO();
    
    // 4. ANÁLISE DOS RESULTADOS
    console.log('\n📊 [Status Completo] === ANÁLISE DOS RESULTADOS ===');
    
    const userExistsBefore = results.verification.exists;
    const registrationSuccess = results.registration.success;
    const userExistsAfter = results.finalStatus.exists;
    
    console.log('Resultados da análise:');
    console.log(`  🔍 Usuário existia antes: ${userExistsBefore ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`  📝 Cadastro executado: ${registrationSuccess ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`  🔍 Usuário existe depois: ${userExistsAfter ? '✅ SIM' : '❌ NÃO'}`);
    
    if (userExistsBefore && userExistsAfter) {
      console.log('📋 CONCLUSÃO: Usuário JÁ EXISTIA no DSO (cadastro anterior válido)');
    } else if (!userExistsBefore && userExistsAfter && registrationSuccess) {
      console.log('📋 CONCLUSÃO: Usuário foi CADASTRADO com SUCESSO neste teste');
    } else if (!userExistsBefore && !userExistsAfter) {
      console.log('📋 CONCLUSÃO: Usuário NÃO EXISTE e cadastro FALHOU');
    } else {
      console.log('📋 CONCLUSÃO: Estado inconsistente - verificar logs detalhados');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ [Status Completo] Erro geral:', error);
    return results;
  }
}

// Expor funções globalmente para uso no console
if (typeof window !== 'undefined') {
  (window as any).testDirectDSO = {
    testCompleteFlowDSO,
    testDSORegister,
    testDSOLogin,
    testDSOProfile,
    verifyUserExistsInDSO,
    testUserStatusAndRegister,
    getAddressByCEP,
    TEST_USER_DATA
  };
  
  console.log('🧪 [Dev] Funções de teste direto DSO carregadas:');
  console.log('  - testDirectDSO.testCompleteFlowDSO() - Teste completo');
  console.log('  - testDirectDSO.verifyUserExistsInDSO() - Verificar se usuário existe');
  console.log('  - testDirectDSO.testUserStatusAndRegister() - Análise completa');
  console.log('  - testDirectDSO.testDSORegister() - Apenas cadastro');
  console.log('  - testDirectDSO.testDSOLogin() - Apenas login');
  console.log('  - testDirectDSO.TEST_USER_DATA - Dados do teste');
} 