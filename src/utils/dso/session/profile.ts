/**
 * Função de busca de perfil DSO - COM RENOVAÇÃO AUTOMÁTICA DE TOKEN
 * Baseado em: src/utils/childfund/dso/session/profile.ts
 */

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  document: string;
  phone: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string; // Adicionado
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  zipCode?: string;
  birthDate?: string; // Adicionado
  gender?: 'M' | 'F'; // Adicionado
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface ProfileResponse {
  data: ProfileData;
}

/**
 * Busca perfil do usuário logado - COM RENOVAÇÃO AUTOMÁTICA DE TOKEN
 */
export async function profile(host: string, retryCount: number = 0): Promise<{ data: ProfileData | {} }> {
  console.log(`👤 [DSO Profile] Buscando perfil do usuário... (tentativa ${retryCount + 1})`);

  try {
    // Recupera token do cookie - EXATO como na produção
    const cookie = await fetch('/api/essentials/coockies', {
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json());

    console.log('🍪 [DSO Profile] Cookie response:', cookie);

    const token = cookie?.token?.value;

    if (!token) {
      console.warn('⚠️ [DSO Profile] Token não encontrado');
      return { data: {} };
    }

    console.log('✅ [DSO Profile] Token encontrado, buscando perfil...');

    // Buscar dados do perfil
    const response = await fetch(`${host}api/v1/my-profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📡 [DSO Profile] Response status:', response.status);

    // Se token expirou (401) e ainda não tentou renovar
    if (response.status === 401 && retryCount === 0) {
      console.log('🔄 [DSO Profile] Token expirado (401), tentando renovar...');
      
      // Tentar renovar token usando credenciais salvas
      const savedCredentials = getSavedCredentials();
      if (savedCredentials) {
        console.log('🔄 [DSO Profile] Credenciais encontradas, renovando token...');
        
        const renewSuccess = await renewToken(host, savedCredentials);
        if (renewSuccess) {
          console.log('✅ [DSO Profile] Token renovado com sucesso, tentando novamente...');
          // Retry com token renovado
          return profile(host, retryCount + 1);
        }
      }
      
      console.error('❌ [DSO Profile] Não foi possível renovar token - credenciais não disponíveis');
      return { data: {} };
    }

    if (!response.ok) {
      console.error(`❌ [DSO Profile] Erro HTTP ${response.status}: ${response.statusText}`);
      return { data: {} };
    }

    const data = await response.json() as ProfileResponse;
    console.log('✅ [DSO Profile] Perfil obtido com sucesso:', data);

    return data;
  } catch (error) {
    console.error('❌ [DSO Profile] Erro ao buscar perfil:', error);
    return { data: {} };
  }
}

/**
 * Recupera credenciais salvas no localStorage
 */
function getSavedCredentials(): { login: string; password: string } | null {
  try {
    const loginData = localStorage.getItem('childfund-login-data');
    if (loginData) {
      const parsed = JSON.parse(loginData);
      if (parsed.credentials) {
        return parsed.credentials;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ [DSO Profile] Erro ao recuperar credenciais:', error);
    return null;
  }
}

/**
 * Renova token usando credenciais salvas
 */
async function renewToken(host: string, credentials: { login: string; password: string }): Promise<boolean> {
  try {
    console.log('🔄 [DSO Profile] Renovando token...');
    
    const response = await fetch(`${host}api/v1/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('❌ [DSO Profile] Erro ao renovar token:', response.status);
      return false;
    }

    const data = await response.json();
    
    if (data.success === 'authenticated' && data.data?.token) {
      console.log('✅ [DSO Profile] Token renovado com sucesso');
      
      // Salvar novo token no cookie
      await saveTokenToCookie(data.data.token);
      
      return true;
    }
    
    console.error('❌ [DSO Profile] Resposta de renovação inválida:', data);
    return false;
  } catch (error) {
    console.error('❌ [DSO Profile] Erro ao renovar token:', error);
    return false;
  }
}

/**
 * Salva token no cookie usando o endpoint
 */
async function saveTokenToCookie(token: string): Promise<void> {
  try {
    const response = await fetch('/api/essentials/coockies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      console.log('✅ [DSO Profile] Token salvo no cookie');
    } else {
      console.warn('⚠️ [DSO Profile] Erro ao salvar token no cookie:', response.status);
    }
  } catch (error) {
    console.warn('⚠️ [DSO Profile] Erro ao salvar token no cookie:', error);
  }
} 