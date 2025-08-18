/**
 * Teste simples para verificar conectividade DSO
 */

export async function testDSOConnection() {
  const DSO_HOST = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
  
  try {
    console.log('🔍 Testando conectividade DSO...', DSO_HOST);
    
    // Teste básico de conectividade
    const response = await fetch(DSO_HOST, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'User-Agent': 'ChildFund-Brasil-Test/1.0'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ DSO conectividade OK');
      return true;
    } else {
      console.warn('⚠️ DSO retornou status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro de conectividade DSO:', error);
    return false;
  }
}

export async function testDSOLogin(email: string, password: string) {
  const DSO_HOST = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
  
  try {
    console.log('🔐 Testando login DSO...');
    
    const response = await fetch(`${DSO_HOST}api/v1/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        login: email,
        password: password
      })
    });
    
    console.log('📡 Login response status:', response.status);
    
    const data = await response.json();
    console.log('📡 Login response data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Erro no teste de login DSO:', error);
    return null;
  }
}

export async function debugCurrentUser() {
  console.log('🔍 [DEBUG] Estado atual da aplicação:');
  
  // Verificar localStorage
  const authData = localStorage.getItem('childfund-auth-data');
  const dsoToken = localStorage.getItem('dso-token');
  
  console.log('📦 localStorage:');
  console.log('  - childfund-auth-data:', authData ? 'presente' : 'ausente');
  console.log('  - dso-token:', dsoToken ? 'presente' : 'ausente');
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('  - dados auth:', parsed);
    } catch (e) {
      console.log('  - erro ao parsear auth data');
    }
  }
  
  // Verificar cookies
  try {
    const response = await fetch('/api/essentials/cookies', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🍪 Cookies:', data);
    } else {
      console.log('🍪 Cookies endpoint não disponível:', response.status);
    }
  } catch (e) {
    console.log('🍪 Erro ao acessar cookies:', e);
  }
  
  return {
    hasAuthData: !!authData,
    hasDSOToken: !!dsoToken,
    authData: authData ? JSON.parse(authData) : null
  };
}

export async function testUserCPF(cpf: string, password: string = "teste123") {
  console.log(`🔍 Testando usuário CPF: ${cpf}`);
  
  const DSO_HOST = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
  
  // Primeiro, testar se conseguimos fazer login
  try {
    const response = await fetch(`${DSO_HOST}api/v1/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        login: cpf,
        password: password
      })
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📡 Response data:', data);
    
    if (data.success === 'authenticated') {
      console.log('✅ Login bem-sucedido! Token:', data.data.token);
      
      // Salvar token para testes
      localStorage.setItem('dso-token', data.data.token);
      
      return data;
    } else {
      console.log('❌ Login falhou:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro no teste de login:', error);
    return null;
  }
}

export async function testDSOEndpoints() {
  console.log('🔍 Testando endpoints DSO...');
  
  const DSO_HOST = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
  
  const endpoints = [
    { name: 'Root', url: DSO_HOST },
    { name: 'Authentication (POST)', url: `${DSO_HOST}api/v1/authentication`, method: 'POST', body: {login: 'test', password: 'test'} },
    { name: 'My Profile (GET)', url: `${DSO_HOST}api/v1/my-profile` },
    { name: 'Users Search (GET)', url: `${DSO_HOST}api/v1/users/search?document=13411086785` },
    { name: 'Users (GET)', url: `${DSO_HOST}api/v1/users` }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testando: ${endpoint.name}`);
      
      const options: RequestInit = {
        method: endpoint.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(endpoint.url, options);
      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText.substring(0, 200);
      }
      
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      };
      
      results.push(result);
      console.log(`  Status: ${response.status} ${response.statusText}`);
      console.log(`  Data:`, responseData);
      
    } catch (error) {
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      
      results.push(result);
      console.error(`  Erro:`, error);
    }
  }
  
  console.log('📊 Resumo dos testes:', results);
  return results;
}

export async function analyzeUserInDSO(cpf: string) {
  console.log(`🔍 Analisando usuário ${cpf} no DSO...`);
  
  const results = {
    userExists: false,
    loginPossible: false,
    commonPasswords: ['123456', 'password', 'teste123', cpf, cpf.substring(0, 6)],
    authenticationAttempts: [],
    searchAttempts: []
  };
  
  const DSO_HOST = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
  
  // Tentar algumas senhas comuns (apenas para teste, em produção isso não seria apropriado)
  console.log('🔐 Testando autenticação com senhas comuns...');
  
  for (const password of results.commonPasswords) {
    try {
      const response = await fetch(`${DSO_HOST}api/v1/authentication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          login: cpf,
          password: password
        })
      });
      
      const data = await response.json();
      
      const attempt = {
        password: password.replace(/./g, '*'), // Mascarar senha nos logs
        status: response.status,
        success: data.success === 'authenticated',
        message: data.message || data.error || 'Sem mensagem'
      };
      
      results.authenticationAttempts.push(attempt);
      console.log(`  Senha ${password.replace(/./g, '*')}: ${response.status} - ${attempt.message}`);
      
      if (data.success === 'authenticated') {
        results.loginPossible = true;
        results.userExists = true;
        console.log('✅ Login bem-sucedido encontrado!');
        localStorage.setItem('dso-token', data.data.token);
        break;
      } else if (response.status === 401 || data.message?.includes('senha')) {
        results.userExists = true; // Usuário existe, mas senha incorreta
      }
      
    } catch (error) {
      console.error(`Erro ao testar senha:`, error);
    }
    
    // Delay para não sobrecarregar o servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('📊 Análise concluída:', results);
  return results;
}

export async function loginRealUser() {
  console.log('🚀 [testDSO] === LOGIN COM USUÁRIO REAL ===');
  
  const DSO_HOST = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
  
  try {
    // Limpar tokens anteriores
    localStorage.removeItem('dso-token');
    console.log('🗑️ [testDSO] Tokens anteriores removidos');
    
    console.log('🔐 [testDSO] Fazendo requisição de login para:', `${DSO_HOST}api/v1/authentication`);
    
    const response = await fetch(`${DSO_HOST}api/v1/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        login: "13411086785",
        password: "F1lipe26!"
      })
    });
    
    console.log('📡 [testDSO] Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [testDSO] Login response:', {
        success: data.success,
        hasToken: !!data.data?.token,
        hasUser: !!data.data?.user,
        tokenLength: data.data?.token?.length
      });
      
      // Salvar token se presente
      if (data.data?.token) {
        localStorage.setItem('dso-token', data.data.token);
        console.log('✅ [testDSO] Token salvo no localStorage:', data.data.token.substring(0, 20) + '...');
        
        // Tentar buscar perfil
        console.log('👤 [testDSO] Buscando perfil do usuário...');
        const profileResponse = await fetch(`${DSO_HOST}api/v1/my-profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${data.data.token}`
          },
          credentials: 'include'
        });
        
        console.log('📡 [testDSO] Profile response status:', profileResponse.status);
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ [testDSO] Dados completos do perfil:');
          console.log('  - ID:', profileData.data?.id);
          console.log('  - Nome:', profileData.data?.name);
          console.log('  - Email:', profileData.data?.email);
          console.log('  - Documento:', profileData.data?.document);
          console.log('  - Telefone:', profileData.data?.phone);
          console.log('  - Endereço:', profileData.data?.address);
          console.log('  - Cidade:', profileData.data?.city);
          console.log('  - Estado:', profileData.data?.state);
          console.log('  - CEP:', profileData.data?.cep);
          
          return { 
            success: true, 
            token: data.data.token, 
            user: profileData.data,
            rawProfile: profileData
          };
        } else {
          const errorText = await profileResponse.text();
          console.error('❌ [testDSO] Erro ao buscar perfil:', profileResponse.status, errorText);
          return { 
            success: true, 
            token: data.data.token, 
            profileError: errorText
          };
        }
      } else {
        console.warn('⚠️ [testDSO] Token não encontrado na resposta:', data);
      }
      
      return { success: true, data };
    } else {
      const errorData = await response.json();
      console.error('❌ [testDSO] Login falhou:', response.status, errorData);
      return { success: false, error: errorData, status: response.status };
    }
  } catch (error) {
    console.error('❌ [testDSO] Erro no login:', error);
    return { success: false, error };
  }
}

export async function testUpdateProfile() {
  console.log('💾 Testando atualização de perfil...');
  
  const token = localStorage.getItem('dso-token');
  if (!token) {
    console.error('❌ Token não encontrado. Execute loginRealUser() primeiro.');
    return false;
  }
  
  const DSO_HOST = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
  
  const testData = {
    name: "Filipe Almeida - Teste Atualização",
    phone: "21995864005"
  };
  
  try {
    const response = await fetch(`${DSO_HOST}api/v1/my-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Perfil atualizado com sucesso:', data);
      return true;
    } else {
      const errorData = await response.text();
      console.error('❌ Erro na atualização:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    return false;
  }
}

// Disponibilizar no window para teste manual no browser
if (typeof window !== 'undefined') {
  (window as any).testDSO = {
    testConnection: testDSOConnection,
    testLogin: testDSOLogin,
    debugCurrentUser: debugCurrentUser,
    testUserCPF: testUserCPF,
    testDSOEndpoints: testDSOEndpoints,
    analyzeUserInDSO: analyzeUserInDSO,
    loginRealUser: loginRealUser,
    testUpdateProfile: testUpdateProfile
  };
}