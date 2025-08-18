/**
 * Teste direto para carregar perfil DSO na página de perfil
 */

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';

/**
 * Carrega dados DSO diretamente e atualiza a página
 */
async function loadDSOProfileDirect() {
  console.log('🔄 [DSO Profile Direct] Iniciando carregamento direto...');
  
  try {
    // 1. Obter token DSO
    console.log('🍪 [DSO Profile Direct] Obtendo token...');
    
    const cookieResponse = await fetch('/api/essentials/coockies', {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!cookieResponse.ok) {
      throw new Error(`Erro ao obter cookie: ${cookieResponse.status}`);
    }
    
    const cookieData = await cookieResponse.json();
    console.log('🍪 [DSO Profile Direct] Cookie response:', cookieData);
    
    const token = cookieData?.token?.value;
    
    if (!token) {
      throw new Error('Token não encontrado no cookie');
    }
    
    console.log('✅ [DSO Profile Direct] Token obtido, length:', token.length);
    
    // 2. Buscar perfil DSO
    console.log('👤 [DSO Profile Direct] Buscando perfil...');
    
    const profileResponse = await fetch(`${DSO_HOST}api/v1/my-profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('📡 [DSO Profile Direct] Profile response status:', profileResponse.status);
    
    if (!profileResponse.ok) {
      throw new Error(`Erro ao buscar perfil: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ [DSO Profile Direct] Perfil obtido:', profileData);
    
    // 3. Atualizar campos na página
    console.log('📝 [DSO Profile Direct] Atualizando campos...');
    
    const fields = {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
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
    for (const [fieldId, value] of Object.entries(fields)) {
      const element = document.getElementById(fieldId) as HTMLInputElement;
      if (element && value) {
        element.value = value;
        console.log(`✅ [DSO Profile Direct] Campo ${fieldId}: ${value}`);
      } else if (!element) {
        console.warn(`⚠️ [DSO Profile Direct] Campo ${fieldId} não encontrado no DOM`);
      }
    }
    
    console.log('🎉 [DSO Profile Direct] Atualização concluída!');
    
    return {
      success: true,
      data: profileData,
      fieldsUpdated: Object.keys(fields).length
    };
    
  } catch (error) {
    console.error('❌ [DSO Profile Direct] Erro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Monitora e força carregamento de dados DSO
 */
async function monitorAndLoadDSO() {
  console.log('🔍 [DSO Monitor] Iniciando monitoramento...');
  
  // Verificar estado atual
  const authContext = (window as any).React?.useState;
  console.log('🔍 [DSO Monitor] React disponível:', !!authContext);
  
  // Verificar se estamos na página de perfil
  const isProfilePage = window.location.pathname.includes('/profile');
  console.log('🔍 [DSO Monitor] Na página de perfil:', isProfilePage);
  
  if (isProfilePage) {
    console.log('📋 [DSO Monitor] Executando carregamento direto...');
    const result = await loadDSOProfileDirect();
    
    if (result.success) {
      console.log('✅ [DSO Monitor] Carregamento bem-sucedido!');
    } else {
      console.error('❌ [DSO Monitor] Carregamento falhou:', result.error);
    }
    
    return result;
  } else {
    console.log('⏭️ [DSO Monitor] Não é página de perfil, pulando...');
    return { success: false, error: 'Não é página de perfil' };
  }
}

/**
 * Verifica estado do sistema de autenticação
 */
function debugAuthState() {
  console.log('🔍 [Auth Debug] === ESTADO DO SISTEMA ===');
  
  // Verificar localStorage
  const localData = Object.keys(localStorage).filter(key => 
    key.includes('auth') || key.includes('dso') || key.includes('user')
  );
  console.log('💾 [Auth Debug] Dados no localStorage:', localData);
  
  // Verificar sessionStorage
  const sessionData = Object.keys(sessionStorage).filter(key => 
    key.includes('auth') || key.includes('dso') || key.includes('user')
  );
  console.log('💾 [Auth Debug] Dados no sessionStorage:', sessionData);
  
  // Verificar cookies
  console.log('🍪 [Auth Debug] Cookies:', document.cookie);
  
  // Verificar URL atual
  console.log('🌐 [Auth Debug] URL atual:', window.location.href);
  
  // Verificar elementos DOM
  const nameField = document.getElementById('name') as HTMLInputElement;
  const emailField = document.getElementById('email') as HTMLInputElement;
  
  console.log('📋 [Auth Debug] Campos DOM:');
  console.log('  - Nome:', nameField?.value || 'VAZIO');
  console.log('  - Email:', emailField?.value || 'VAZIO');
  
  return {
    localStorage: localData,
    sessionStorage: sessionData,
    cookies: document.cookie,
    url: window.location.href,
    domFields: {
      name: nameField?.value || '',
      email: emailField?.value || ''
    }
  };
}

// Expor funções globalmente
if (typeof window !== 'undefined') {
  (window as any).testDSOProfile = {
    loadDSOProfileDirect,
    monitorAndLoadDSO,
    debugAuthState
  };
  
  console.log('🧪 [DSO Profile Test] Funções carregadas:');
  console.log('  - testDSOProfile.loadDSOProfileDirect() - Carregar dados direto');
  console.log('  - testDSOProfile.monitorAndLoadDSO() - Monitor automático');
  console.log('  - testDSOProfile.debugAuthState() - Debug estado auth');
  
  // Auto-executar se estiver na página de perfil
  if (window.location.pathname.includes('/profile')) {
    setTimeout(() => {
      console.log('🔄 [DSO Profile Test] Auto-executando carregamento...');
      monitorAndLoadDSO();
    }, 2000);
  }
}

export { loadDSOProfileDirect, monitorAndLoadDSO, debugAuthState }; 