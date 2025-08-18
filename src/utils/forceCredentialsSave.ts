/**
 * Função utilitária para forçar o salvamento das credenciais no localStorage
 * Útil para debug e testes
 */

export function forceCredentialsSave(login: string, password: string): void {
  console.log('🔧 [Force Credentials] Forçando salvamento das credenciais...');
  
  try {
    // Buscar dados existentes
    const existingData = localStorage.getItem('childfund-auth-data');
    
    if (!existingData) {
      console.error('❌ [Force Credentials] Dados de login não encontrados');
      return;
    }
    
    const parsed = JSON.parse(existingData);
    
    // Adicionar credenciais
    const updatedData = {
      ...parsed,
      credentials: {
        login: login,
        password: password
      }
    };
    
    // Salvar de volta
    localStorage.setItem('childfund-auth-data', JSON.stringify(updatedData));
    
    console.log('✅ [Force Credentials] Credenciais salvas com sucesso:', {
      login: login,
      password: password ? '***' : 'null'
    });
    
    // Verificar se foi salvo corretamente
    const verification = JSON.parse(localStorage.getItem('childfund-auth-data') || '{}');
    console.log('🔍 [Force Credentials] Verificação:', {
      hasCredentials: !!verification.credentials,
      hasLogin: !!verification.credentials?.login,
      hasPassword: !!verification.credentials?.password
    });
    
  } catch (error) {
    console.error('❌ [Force Credentials] Erro ao salvar credenciais:', error);
  }
}

/**
 * Função para verificar o estado atual das credenciais
 */
export function checkCredentialsState(): void {
  console.log('🔍 [Check Credentials] Verificando estado das credenciais...');
  
  try {
    const data = localStorage.getItem('childfund-auth-data');
    
    if (!data) {
      console.log('❌ [Check Credentials] Nenhum dado de login encontrado');
      return;
    }
    
    const parsed = JSON.parse(data);
    
    console.log('📊 [Check Credentials] Estado atual:', {
      hasUser: !!parsed.user,
      hasToken: !!parsed.token,
      isMock: parsed.isMock,
      hasCredentials: !!parsed.credentials,
      credentialsStructure: parsed.credentials ? {
        hasLogin: !!parsed.credentials.login,
        hasPassword: !!parsed.credentials.password,
        login: parsed.credentials.login,
        password: parsed.credentials.password ? '***' : 'null'
      } : null,
      timestamp: new Date(parsed.timestamp).toLocaleString()
    });
    
  } catch (error) {
    console.error('❌ [Check Credentials] Erro ao verificar credenciais:', error);
  }
}

// Disponibilizar no console para debug
if (typeof window !== 'undefined') {
  (window as any).forceCredentialsSave = forceCredentialsSave;
  (window as any).checkCredentialsState = checkCredentialsState;
  
  console.log('🧪 [Force Credentials] Funções disponíveis no console:');
  console.log('  - forceCredentialsSave(login, password) - Forçar salvamento');
  console.log('  - checkCredentialsState() - Verificar estado atual');
} 