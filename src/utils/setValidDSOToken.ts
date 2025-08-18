/**
 * Define um token DSO válido para carregar dados do perfil
 */

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';

/**
 * Faz login e define token DSO válido
 */
async function setValidDSOToken() {
  console.log('🔐 [DSO Token] Fazendo login para obter token válido...');
  
  try {
    // Dados do usuário que sabemos que existe
    const loginData = {
      document: '67573755082',
      password: 'ChildFund@2025'
    };
    
    console.log('🔄 [DSO Token] Fazendo login no DSO...');
    
    const loginResponse = await fetch(`${DSO_HOST}api/v1/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📡 [DSO Token] Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      throw new Error(`Erro no login: ${loginResponse.status}`);
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ [DSO Token] Login bem-sucedido:', loginResult);
    
    const token = loginResult.access_token;
    if (!token) {
      throw new Error('Token não encontrado na resposta');
    }
    
    console.log('🍪 [DSO Token] Definindo token no cookie...');
    
    // Definir token no cookie via endpoint
    const setCookieResponse = await fetch('/api/essentials/coockies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });
    
    if (!setCookieResponse.ok) {
      throw new Error(`Erro ao definir cookie: ${setCookieResponse.status}`);
    }
    
    console.log('✅ [DSO Token] Token definido com sucesso!');
    console.log('🎯 [DSO Token] Token length:', token.length);
    
    // Verificar se foi definido corretamente
    const verifyResponse = await fetch('/api/essentials/coockies');
    const verifyData = await verifyResponse.json();
    
    console.log('✅ [DSO Token] Verificação:', verifyData);
    
    return {
      success: true,
      token,
      userData: loginResult
    };
    
  } catch (error) {
    console.error('❌ [DSO Token] Erro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Carrega perfil DSO completo após definir token
 */
async function loadFullDSOProfile() {
  console.log('👤 [DSO Profile] Carregando perfil completo...');
  
  try {
    // 1. Definir token válido
    const tokenResult = await setValidDSOToken();
    
    if (!tokenResult.success) {
      throw new Error(`Erro ao obter token: ${tokenResult.error}`);
    }
    
    console.log('✅ [DSO Profile] Token definido, carregando perfil...');
    
    // 2. Buscar perfil
    const profileResponse = await fetch(`${DSO_HOST}api/v1/my-profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenResult.token}`
      }
    });
    
    if (!profileResponse.ok) {
      throw new Error(`Erro ao buscar perfil: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ [DSO Profile] Perfil carregado:', profileData);
    
    // 3. Atualizar campos na página se estiver na página de perfil
    if (window.location.pathname.includes('/profile')) {
      console.log('📝 [DSO Profile] Atualizando campos da página...');
      
      const fields = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        cpf: profileData.document,
        birthDate: profileData.birthDate ? new Date(profileData.birthDate).toISOString().split('T')[0] : '',
        cep: profileData.cep,
        logradouro: profileData.street,
        numero: profileData.number,
        complemento: profileData.addressComplement || '',
        bairro: profileData.neighborhood,
        cidade: profileData.city,
        estado: profileData.state
      };
      
      // Atualizar campos DOM
      Object.entries(fields).forEach(([fieldId, value]) => {
        const element = document.getElementById(fieldId) as HTMLInputElement;
        if (element && value) {
          element.value = value;
          // Disparar evento para reagir às mudanças
          element.dispatchEvent(new Event('input', { bubbles: true }));
          console.log(`✅ [DSO Profile] ${fieldId}: ${value}`);
        }
      });
      
      console.log('🎉 [DSO Profile] Campos atualizados na página!');
    }
    
    return {
      success: true,
      data: profileData
    };
    
  } catch (error) {
    console.error('❌ [DSO Profile] Erro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Expor funções globalmente
if (typeof window !== 'undefined') {
  (window as any).setValidDSOToken = setValidDSOToken;
  (window as any).loadFullDSOProfile = loadFullDSOProfile;
  
  console.log('🔐 [DSO Token] Funções carregadas:');
  console.log('  - setValidDSOToken() - Fazer login e definir token');
  console.log('  - loadFullDSOProfile() - Carregar perfil completo');
}

export { setValidDSOToken, loadFullDSOProfile }; 