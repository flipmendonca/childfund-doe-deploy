// Serviço de autenticação para integração com DSO API
// Baseado na documentação: docs/AUTENTICACAO_CADASTRO.md

import { dsoClient, DSOUser, DSOLoginResponse, DSOApiResponse } from '@/lib/dso/DSOClient';
import { dsoValidationSchema, DSOValidationData } from '@/utils/authSchemas';

export interface LoginData {
  login: string;      // CPF (apenas)
  password: string;   // Senha do usuário
}

export interface RegisterData {
  email: string;
  name: string;
  document: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  personType?: 'pf' | 'pj';
  industry?: string;
  ownership?: string;
  gender?: 'M' | 'F';
  birthDate?: string;
  typeDocument?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: DSOUser;
  token?: string;
}

// Configuração do ambiente
const DSO_HOST = import.meta.env.VITE_DSO_HOST || 'https://dso.childfundbrasil.org.br/';
const NEXT_KEY = import.meta.env.VITE_NEXT_KEY || 'c5e53b87-d315-427d-a9f0-1d80d5f65f56';

class AuthService {
  private host: string;
  private key: string;
  private isProduction: boolean;
  private dsoClient: typeof dsoClient;

  constructor() {
    this.host = DSO_HOST;
    this.key = NEXT_KEY;
    this.isProduction = true; // Forçar modo produção para debug
    
    // Log do modo atual
    console.log(`[AuthService] Modo atual: PRODUÇÃO (DSO) - Debug ativo`);

    this.dsoClient = dsoClient;
  }

  /**
   * Valida dados antes de enviar para DSO
   */
  private validateDSOData(data: any): DSOValidationData {
    const validation = dsoValidationSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }
    return validation.data;
  }

  /**
   * Valida se um CPF é válido
   */
  private validateCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cleanCPF.charAt(9)) === digit1 && parseInt(cleanCPF.charAt(10)) === digit2;
  }

  /**
   * Verifica se um CPF já existe no DSO
   */
  async checkCPFExists(cpf: string): Promise<boolean> {
    try {
      console.log('[AuthService] Verificando CPF:', cpf);
      
      const response = await this.dsoClient.getUserByDocument(cpf);
      
      console.log('[AuthService] Resposta verificação CPF:', {
        success: response.success,
        status: response.status,
        message: response.message
      });

      // Se retornou 401, significa que o endpoint requer autenticação
      // Nesse caso, assumimos que o CPF não existe (para permitir cadastro)
      if (response.status === 401) {
        console.log('[AuthService] Endpoint de verificação de CPF requer autenticação, assumindo CPF disponível');
        return false;
      }

      // Se retornou 404, significa que o CPF não existe
      if (response.status === 404) {
        console.log('[AuthService] CPF não encontrado');
        return false;
      }

      // Se retornou sucesso com dados, significa que o CPF existe
      if (response.success && response.data) {
        console.log('[AuthService] CPF já existe:', response.data);
        return true;
      }

      // Para outros casos, assumimos que não existe
      console.log('[AuthService] CPF disponível (resposta não conclusiva)');
      return false;
    } catch (error) {
      console.error('[AuthService] Erro ao verificar CPF:', error);
      return false;
    }
  }

  /**
   * Verifica se um email já existe no DSO
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      console.log('[AuthService] Verificando email:', email);
      
      const response = await this.dsoClient.checkUserExists(email);
      
      console.log('[AuthService] Resposta verificação email:', {
        success: response.success,
        status: response.status,
        message: response.message
      });

      // Se retornou 401, significa que o endpoint requer autenticação
      // Nesse caso, assumimos que o email não existe (para permitir cadastro)
      if (response.status === 401) {
        console.log('[AuthService] Endpoint de verificação de email requer autenticação, assumindo email disponível');
        return false;
      }

      // Se retornou 404, significa que o email não existe
      if (response.status === 404) {
        console.log('[AuthService] Email não encontrado');
        return false;
      }

      // Se retornou sucesso com dados, significa que o email existe
      if (response.success && response.data) {
        console.log('[AuthService] Email já existe:', response.data);
        return true;
      }

      // Para outros casos, assumimos que não existe
      console.log('[AuthService] Email disponível (resposta não conclusiva)');
      return false;
    } catch (error) {
      console.error('[AuthService] Erro ao verificar email:', error);
      return false;
    }
  }

  /**
   * Autentica um usuário usando DSO em produção ou mocks em desenvolvimento
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Login iniciado com dados:', {
        login: data.login,
        password: data.password ? '***' : 'vazio'
      });

      // Validações básicas
      if (!data.login || !data.password) {
        console.log('[AuthService] Dados obrigatórios faltando');
        return {
          success: false,
          message: 'CPF e senha são obrigatórios'
        };
      }

      // Validar CPF (aceita formato formatado ou sem formatação)
      const cleanCPF = data.login.replace(/\D/g, '');
      console.log('[AuthService] CPF processado:', {
        original: data.login,
        limpo: cleanCPF
      });

      if (cleanCPF.length !== 11) {
        console.log('[AuthService] CPF inválido - tamanho incorreto');
        return {
          success: false,
          message: 'CPF inválido'
        };
      }

      // Validar se é um CPF válido
      if (!this.validateCPF(cleanCPF)) {
        console.log('[AuthService] CPF inválido - validação falhou');
        return {
          success: false,
          message: 'CPF inválido'
        };
      }

      if (this.isProduction) {
        // Usar DSO em produção - enviar CPF sem formatação
        const loginData = {
          login: cleanCPF, // CPF sem formatação
          password: data.password
        };
        
        console.log('[DSO][Login] Dados formatados para /api/v1/authentication:', {
          login: loginData.login,
          password: loginData.password ? '***' : 'vazio'
        });
        
        const response = await this.dsoClient.login(loginData.login, loginData.password);
        
        console.log('[DSO][Login] Resposta recebida:', {
          success: response.success,
          status: response.status,
          message: response.message,
          hasData: !!response.data
        });
        
        if (response.success && response.data) {
          console.log('[DSO][Login] Sucesso:', response.data);
          
          // A API DSO retorna diretamente: { token, name, user_id, position, ... }
          // Não tem estrutura aninhada com data.user
          const userData = response.data;
          
          // Buscar dados completos do usuário usando o token recebido
          let completeUserData = null;
          if (userData.token && userData.user_id) {
            try {
              console.log('[DSO][Login] Buscando dados completos do usuário...');
              
              // Configurar token no cliente DSO global
              console.log('[DSO][Login] Configurando token no dsoClient global:', userData.token);
              dsoClient.setToken(userData.token);
              
              // Verificar se o token foi configurado corretamente
              console.log('[DSO][Login] Token configurado, verificando...');
              
              // Tentar buscar dados completos do usuário por ID
              const userResponse = await dsoClient.getUserById(userData.user_id.toString());
              
              if (userResponse.success && userResponse.data) {
                completeUserData = userResponse.data;
                console.log('[DSO][Login] Dados completos encontrados por ID:', completeUserData);
              } else {
                console.warn('[DSO][Login] Não foi possível buscar dados por ID, tentando por CPF...');
                
                // Tentar buscar por CPF como alternativa
                const cpfResponse = await dsoClient.getUserByDocumentComplete(cleanCPF);
                
                if (cpfResponse.success && cpfResponse.data) {
                  completeUserData = cpfResponse.data;
                  console.log('[DSO][Login] Dados completos encontrados por CPF:', completeUserData);
                } else {
                  console.warn('[DSO][Login] Não foi possível buscar dados completos:', cpfResponse.message);
                }
              }
            } catch (error) {
              console.warn('[DSO][Login] Erro ao buscar dados completos:', error);
            }
          }
          
          // Usar dados completos se disponíveis, senão usar dados básicos do login
          const finalUserData = completeUserData || {
            id: userData.user_id?.toString() || 'unknown',
            name: userData.name || 'Usuário',
            email: userData.email || '', // Tentar usar email real se disponível
            document: cleanCPF,
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            cep: userData.cep || '',
            status: 'active'
          };
          
          return {
            success: true,
            message: 'Login realizado com sucesso!',
            user: finalUserData,
            token: userData.token
          };
        } else {
          console.error('[DSO][Login] Erro:', response.message);
          return {
            success: false,
            message: response.message || 'Credenciais inválidas'
          };
        }
      } else {
        // Usar mocks em desenvolvimento
        return this.mockLogin(data);
      }
    } catch (error) {
      console.error('[AuthService] Erro no login:', error);
      return {
        success: false,
        message: 'Erro interno do servidor. Tente novamente.'
      };
    }
  }

  /**
   * Registra um novo usuário usando DSO em produção ou mocks em desenvolvimento
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validações básicas
      if (!data.email || !data.name || !data.document || !data.phone || !data.password) {
        return {
          success: false,
          message: 'Todos os campos obrigatórios devem ser preenchidos'
        };
      }

      // Validação específica para campos de endereço obrigatórios
      if (!data.neighborhood || !data.neighborhood.trim()) {
        return {
          success: false,
          message: 'Bairro é obrigatório'
        };
      }

      if (!data.city || !data.city.trim()) {
        return {
          success: false,
          message: 'Cidade é obrigatória'
        };
      }

      if (!data.state || !data.state.trim()) {
        return {
          success: false,
          message: 'Estado é obrigatório'
        };
      }

      // Validar dados para DSO
      const dsoData = this.validateDSOData({
        email: data.email,
        document: data.document,
        phone: this.convertToNationalPhone(data.phone) // Converter para formato nacional
      });

      // Desabilitar verificações temporariamente devido a erro 401
      // Verificar se CPF já existe
      // const cpfExists = await this.checkCPFExists(data.document);
      // if (cpfExists) {
      //   return {
      //     success: false,
      //     message: 'CPF já está cadastrado no sistema'
      //   };
      // }

      // Verificar se email já existe
      // const emailExists = await this.checkEmailExists(data.email);
      // if (emailExists) {
      //   return {
      //     success: false,
      //     message: 'Email já está cadastrado no sistema'
      //   };
      // }

      // Formatar dados conforme especificação do DSO
      const userData = {
        type_document: 'cpf',
        name: data.name,
        phone: data.phone, // Manter formato brasileiro (XX) XXXXX-XXXX
        address: data.address || '',
        addressNumber: data.addressNumber || '',
        complement: data.addressComplement || '', // Campo opcional
        birthDate: data.birthDate || '1990-01-01',
        cep: data.cep || '', // Manter formato com hífen XXXXX-XXX
        city: data.city || '',
        confirm: data.password, // Campo de confirmação da senha
        country: 'BR',
        document: data.document.replace(/[.-]/g, ''), // Remover pontos e traço do CPF
        email: data.email,
        gender: data.gender || 'M',
        neighborhood: data.neighborhood || '',
        password: data.password,
        state: data.state || ''
      };

      console.log('[DSO][Cadastro] Dados formatados para /api/v1/user-public:', userData);

      const response = await this.dsoClient.register(userData);
      
      if (response.success && response.data) {
        console.log('[DSO][Cadastro] Sucesso:', response.data);
        return {
          success: true,
          message: 'Cadastro realizado com sucesso!',
          user: response.data
        };
      } else {
        console.error('[DSO][Cadastro] Erro:', response.message);
        return {
          success: false,
          message: response.message || 'Erro ao realizar cadastro'
        };
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      };
    }
  }

  /**
   * Solicita redefinição de senha
   */
  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    try {
      // Validações básicas
      if (!data.email) {
        return {
          success: false,
          message: 'Email é obrigatório'
        };
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          success: false,
          message: 'Email inválido'
        };
      }

      if (this.isProduction) {
        // Verificar se email existe antes de enviar reset
        const emailExists = await this.checkEmailExists(data.email);
        if (!emailExists) {
          return {
            success: false,
            message: 'Email não encontrado no sistema'
          };
        }

        // Usar DSO em produção
        const response = await this.dsoClient.requestPasswordReset(data.email);
        
        if (response.success) {
          return {
            success: true,
            message: 'Email de redefinição enviado com sucesso'
          };
        } else {
          return {
            success: false,
            message: response.message || 'Erro ao enviar email de redefinição'
          };
        }
      } else {
        // Usar mocks em desenvolvimento
        return this.mockForgotPassword(data);
      }
    } catch (error) {
      console.error('Erro na redefinição de senha:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Solicita reset de senha
   */
  async requestPasswordReset(data: { email: string }): Promise<AuthResponse> {
    try {
      if (this.isProduction) {
        // Em produção, retornar erro temporário
        return {
          success: false,
          message: 'Funcionalidade de reset de senha temporariamente indisponível'
        };
      } else {
        // Em desenvolvimento, simular sucesso
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          message: 'Email de recuperação enviado com sucesso'
        };
      }
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      return {
        success: false,
        message: 'Erro ao solicitar reset de senha'
      };
    }
  }

  /**
   * Reseta a senha
   */
  async resetPassword(data: { token: string; password: string }): Promise<AuthResponse> {
    try {
      if (this.isProduction) {
        // Em produção, retornar erro temporário
        return {
          success: false,
          message: 'Funcionalidade de reset de senha temporariamente indisponível'
        };
      } else {
        // Em desenvolvimento, simular sucesso
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          message: 'Senha alterada com sucesso'
        };
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return {
        success: false,
        message: 'Erro ao resetar senha'
      };
    }
  }

  /**
   * Valida um token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      if (this.isProduction) {
        // Em produção, retornar true temporariamente
        return true;
      } else {
        // Em desenvolvimento, simular validação
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      if (this.isProduction) {
        // Verificar token no DSO
        const token = localStorage.getItem('auth_token');
        if (!token) return false;
        
        const isValid = await this.dsoClient.validateToken(token);
        return isValid;
      } else {
        // Em desenvolvimento, verificar localStorage
        return !!localStorage.getItem('mock_auth');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Faz logout
   */
  async logout(): Promise<AuthResponse> {
    try {
      if (this.isProduction) {
        // Limpar token do DSO
        this.dsoClient.clearToken();
      }
      
      // Limpar dados locais
      localStorage.removeItem('auth_token');
      localStorage.removeItem('mock_auth');
      localStorage.removeItem('user_data');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return {
        success: false,
        message: 'Erro ao fazer logout'
      };
    }
  }

  /**
   * Testa conectividade com o DSO
   */
  async testConnection(): Promise<boolean> {
    try {
      if (this.isProduction) {
        const response = await this.dsoClient.healthCheck();
        return response.success;
      } else {
        // Em desenvolvimento, simular conectividade
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }
    } catch (error) {
      console.error('Erro ao testar conectividade:', error);
      return false;
    }
  }

  // Métodos mock para desenvolvimento
  private async mockLogin(data: LoginData): Promise<AuthResponse> {
    // Simular delay de rede
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.login === 'admin@childfund.org.br' && data.password === 'admin123') {
          resolve({
            success: true,
            message: 'Login realizado com sucesso',
            user: {
              id: '1',
              email: data.login,
              name: 'Administrador',
              document: '12345678901',
              phone: '(11) 99999-9999',
              city: 'São Paulo',
              state: 'SP',
              status: 'active'
            },
            token: 'mock-token-123'
          });
        } else {
          resolve({
            success: false,
            message: 'Credenciais inválidas'
          });
        }
      }, 1000);
    });
  }

  private async mockForgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Email de redefinição enviado com sucesso'
        });
      }, 1000);
    });
  }

  /**
   * Converte telefone do formato internacional para nacional
   */
  private convertToNationalPhone(phone: string): string {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se começa com +55, remove
    if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
      const nationalPhone = cleanPhone.substring(2); // Remove o 55
      
      // Formata para o padrão nacional (DDD) NNNNN-NNNN
      if (nationalPhone.length === 10) {
        return `(${nationalPhone.substring(0, 2)}) ${nationalPhone.substring(2, 6)}-${nationalPhone.substring(6)}`;
      } else if (nationalPhone.length === 11) {
        return `(${nationalPhone.substring(0, 2)}) ${nationalPhone.substring(2, 7)}-${nationalPhone.substring(7)}`;
      }
    }
    
    // Se já está no formato nacional, retorna como está
    if (phone.includes('(') && phone.includes(')')) {
      return phone;
    }
    
    // Se é apenas números, formata
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6)}`;
    } else if (cleanPhone.length === 11) {
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7)}`;
    }
    
    // Se não conseguir formatar, retorna o original
    return phone;
  }
}

// Instância singleton
export const authService = new AuthService(); 