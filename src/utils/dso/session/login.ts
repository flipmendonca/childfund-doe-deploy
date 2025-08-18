/**
 * Função de login DSO - EXATAMENTE como na produção
 * Baseado em: src/utils/childfund/dso/session/login.ts
 */

export interface LoginData {
  login: string;
  password: string;
}

export interface LoginResponse {
  success: string;
  data?: {
    token: string;
    name: string;
    user_id: number;
    position: any;
  };
  message?: string;
  error?: string;
}

/**
 * Realiza login no DSO - EXATO como na produção
 */
export async function login(host: string, data: LoginData, key: string | undefined) {
  console.log('🔐 [DSO Login] Iniciando login...', {
    host,
    login: data.login,
    hasKey: !!key
  });

  try {
    const response = await fetch(`${host}api/v1/authentication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: data?.login,
        password: data?.password,
      }),
      credentials: 'include',
    });

    console.log('📡 [DSO Login] Response status:', response.status);

    const res = await response.json() as LoginResponse;
    console.log('📡 [DSO Login] Response data:', res);

    // Se autenticação bem-sucedida, salva token
    if (res.success === 'authenticated' && res?.data?.token) {
      console.log('✅ [DSO Login] Login bem-sucedido, salvando token...');
      
      try {
        // Salvar token no cookie via API server
        const cookieResponse = await fetch('/api/essentials/coockies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: res?.data?.token }),
        });
        
        const cookieResult = await cookieResponse.json();
        console.log('🍪 [DSO Login] Cookie result:', cookieResult);
        
        if (cookieResult.success) {
          console.log('✅ [DSO Login] Token salvo com sucesso no cookie');
        } else {
          console.warn('⚠️ [DSO Login] Falha ao salvar token no cookie:', cookieResult);
        }
      } catch (cookieError) {
        console.error('❌ [DSO Login] Erro ao salvar cookie:', cookieError);
      }
    }

    return res;
  } catch (error) {
    console.error('❌ [DSO Login] Erro na requisição:', error);
    
    if (error instanceof Error) {
      throw new Error(error?.message);
    }
    throw new Error('Internal Server Error');
  }
} 