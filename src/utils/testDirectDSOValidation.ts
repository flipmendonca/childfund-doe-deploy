/**
 * VALIDAÇÃO DEFINITIVA: Verificar se cadastro DSO foi real
 * Arquivo simplificado e corrigido
 */

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';
const TEST_CPF = '67573755082';
const TEST_PASSWORD = 'ChildFund@2025';

/**
 * TESTE DEFINITIVO: Verifica se usuário existe no DSO
 */
async function validateDSOUser() {
  console.log('🔍 === VALIDAÇÃO DEFINITIVA DSO ===');
  console.log('📋 CPF:', TEST_CPF);
  
  try {
    const response = await fetch(`${DSO_HOST}api/v1/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        login: TEST_CPF,
        password: TEST_PASSWORD
      })
    });

    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Resposta completa:', data);
      
      // Verificar se tem token (indicativo de login bem-sucedido)
      if (data.token && data.user_id) {
        console.log('✅ CONFIRMADO: Usuário existe no DSO!');
        console.log('👤 Dados do usuário:', {
          id: data.user_id,
          nome: data.name,
          email: data.email,
          hasToken: true,
          tokenLength: data.token.length
        });
        
        // Tentar buscar perfil para confirmar
        try {
          const profileResponse = await fetch(`${DSO_HOST}api/v1/my-profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('👤 Perfil completo:', profileData);
            
            return {
              userExists: true,
              loginSuccess: true,
              profileSuccess: true,
              userData: data,
              profileData: profileData
            };
          } else {
            console.log('⚠️ Login OK, mas perfil falhou');
            return {
              userExists: true,
              loginSuccess: true,
              profileSuccess: false,
              userData: data
            };
          }
        } catch (profileError) {
          console.log('⚠️ Erro ao buscar perfil:', profileError);
          return {
            userExists: true,
            loginSuccess: true,
            profileSuccess: false,
            userData: data
          };
        }
        
      } else {
        console.log('❌ Login retornou dados inesperados');
        console.log('📄 Dados recebidos:', data);
        return {
          userExists: false,
          loginSuccess: false,
          profileSuccess: false,
          error: 'Formato de resposta inesperado'
        };
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Login falhou');
      console.log('📄 Erro:', errorData);
      return {
        userExists: false,
        loginSuccess: false,
        profileSuccess: false,
        error: errorData.message || `HTTP ${response.status}`
      };
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    return {
      userExists: false,
      loginSuccess: false,
      profileSuccess: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * TESTE DEFINITIVO: Mostra conclusão clara
 */
async function runFinalValidation() {
  console.log('🎯 INICIANDO VALIDAÇÃO FINAL DO CADASTRO DSO');
  console.log('=' .repeat(50));
  
  const result = await validateDSOUser();
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log('=' .repeat(50));
  
  if (result.userExists && result.loginSuccess) {
    console.log('🎉 SUCESSO: O cadastro foi REALMENTE feito no DSO!');
    console.log('✅ Usuário existe');
    console.log('✅ Login funciona');
    console.log(`${result.profileSuccess ? '✅' : '⚠️'} Perfil ${result.profileSuccess ? 'acessível' : 'com problema'}`);
    
    if (result.userData) {
      console.log('\n👤 DADOS DO USUÁRIO CONFIRMADO:');
      console.log(`   ID: ${result.userData.user_id}`);
      console.log(`   Nome: ${result.userData.name}`);
      console.log(`   Email: ${result.userData.email || 'N/A'}`);
    }
    
  } else {
    console.log('❌ FALHA: Usuário NÃO existe no DSO');
    console.log(`   Erro: ${result.error}`);
  }
  
  console.log('=' .repeat(50));
  return result;
}

// Expor função globalmente
if (typeof window !== 'undefined') {
  (window as any).validateDSO = {
    runFinalValidation,
    validateDSOUser
  };
  
  console.log('🧪 VALIDAÇÃO DSO carregada! Execute:');
  console.log('   validateDSO.runFinalValidation()');
}

export { runFinalValidation, validateDSOUser }; 