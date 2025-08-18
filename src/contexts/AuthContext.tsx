import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { UserProfile, mockUsers } from "../mocks/userProfiles";
import { authService, LoginData, RegisterData, AuthResponse } from "../services/authService";
import { DSOService } from "../services/DSOService";
import { useProductionDSO } from "../hooks/useProductionDSO";
import { ProfileData } from "../utils/dso/session/profile";
import { useQueryClient } from "@tanstack/react-query";
// import { useLocalDonations } from "./LocalDonationsContext"; // Removido para evitar dependência circular

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  document?: string; // Alias for cpf
  donorType: "sponsor" | "monthly" | "single";
  phone?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  pronoun?: string; // Novo campo: pronome
  profession?: string; // Novo campo: profissão
  deficiency?: string; // Novo campo: deficiência
  createdAt: string;
  sponsoredChildren?: Array<{
    id: string;
    name: string;
  }>;
  isMockUser?: boolean; // Flag para identificar usuários mockados
  isDSOUser?: boolean; // Flag para identificar usuários do DSO
}

/**
 * Mapa de caracteres corrompidos comuns para suas versões corretas em português
 */
const UTF8_FIX_MAP = {
  '\uFFFD': 'ç',  // Replacement character
  'Ã§': 'ç',      // Dupla codificação de ç
  'Ã¡': 'á',      // Dupla codificação de á
  'Ã©': 'é',      // Dupla codificação de é
  'Ã­': 'í',      // Dupla codificação de í
  'Ã³': 'ó',      // Dupla codificação de ó
  'Ãº': 'ú',      // Dupla codificação de ú
  'Ã ': 'à',      // Dupla codificação de à
  'Ãª': 'ê',      // Dupla codificação de ê
  'Ã´': 'ô',      // Dupla codificação de ô
  'Ã¢': 'â',      // Dupla codificação de â
  'Ã¨': 'è',      // Dupla codificação de è
  'Ã¼': 'ü',      // Dupla codificação de ü
  'Ã§Ã£o': 'ção', // Casos específicos
  'Ã§Ã¢o': 'ção'
};

/**
 * Sanitiza strings para garantir UTF-8 correto, focando em caracteres portugueses
 */
function sanitizeUTF8(str: string | undefined | null): string {
  if (!str) return '';
  
  try {
    let cleaned = str;
    let hasChanges = false;
    
    // Aplicar mapeamento de correções conhecidas
    for (const [corrupted, correct] of Object.entries(UTF8_FIX_MAP)) {
      if (cleaned.includes(corrupted)) {
        const newCleaned = cleaned.replace(new RegExp(corrupted, 'g'), correct);
        if (newCleaned !== cleaned) {
          console.log(`[UTF-8 Fix] Correção "${corrupted}" -> "${correct}": "${cleaned}" -> "${newCleaned}"`);
          cleaned = newCleaned;
          hasChanges = true;
        }
      }
    }
    
    // Log apenas se houve mudanças
    if (hasChanges) {
      console.log(`[UTF-8 Fix] String corrigida: "${str}" -> "${cleaned}"`);
    }
    
    return cleaned.trim();
  } catch (error) {
    console.error(`[UTF-8 Fix] Erro ao sanitizar string: "${str}"`, error);
    return str || '';
  }
}

/**
 * Sanitiza objeto User para garantir UTF-8 correto em todos os campos de texto
 */
function sanitizeUserUTF8(user: User): User {
  console.log('[UTF-8 Fix] Sanitizando objeto User...');
  
  const sanitizedUser: User = {
    ...user,
    name: sanitizeUTF8(user.name),
    email: sanitizeUTF8(user.email),
    cpf: sanitizeUTF8(user.cpf),
    phone: sanitizeUTF8(user.phone),
    address: sanitizeUTF8(user.address),
    addressNumber: sanitizeUTF8(user.addressNumber),
    addressComplement: sanitizeUTF8(user.addressComplement),
    neighborhood: sanitizeUTF8(user.neighborhood),
    city: sanitizeUTF8(user.city),
    state: sanitizeUTF8(user.state),
    zipCode: sanitizeUTF8(user.zipCode),
    birthDate: sanitizeUTF8(user.birthDate),
    pronoun: sanitizeUTF8(user.pronoun),
    profession: sanitizeUTF8(user.profession),
    deficiency: sanitizeUTF8(user.deficiency),
  };
  
  // Log detalhado de correções importantes
  const importantFields = ['name', 'city', 'state', 'address', 'neighborhood'] as const;
  importantFields.forEach(field => {
    const original = user[field] as string;
    const sanitized = sanitizedUser[field] as string;
    if (original && sanitized && original !== sanitized) {
      console.log(`[UTF-8 Fix] Campo ${field} corrigido: "${original}" -> "${sanitized}"`);
    }
  });
  
  return sanitizedUser;
}

/**
 * Converte ProfileData para User (compatibilidade)
 */
function convertDSOUserToUser(profileData: ProfileData): User {
  console.log('🔄 [AuthContext] Convertendo dados DSO para User...');
  console.log('📋 [AuthContext] ProfileData original:', profileData);
  
  // ⚠️ DEBUG: Log específico dos campos de endereço recebidos do DSO na conversão
  console.group('🔍 [convertDSOUserToUser] DEBUG - Dados do DSO recebidos');
  console.log('📋 ProfileData completo:', profileData);
  console.log('🏠 Campos de endereço do DSO na conversão:');
  console.log('  - street (DSO):', profileData.street, typeof profileData.street);
  console.log('  - address (DSO):', profileData.address, typeof profileData.address);
  console.log('  - number (DSO):', profileData.number, typeof profileData.number);
  console.log('  - addressNumber (DSO):', profileData.addressNumber, typeof profileData.addressNumber);
  console.log('  - addressComplement (DSO):', profileData.addressComplement, typeof profileData.addressComplement);
  console.log('  - complement (DSO):', profileData.complement, typeof profileData.complement);
  console.log('  - neighborhood (DSO):', profileData.neighborhood, typeof profileData.neighborhood);
  console.log('  - city (DSO):', profileData.city, typeof profileData.city);
  console.log('  - state (DSO):', profileData.state, typeof profileData.state);
  console.log('  - cep (DSO):', profileData.cep, typeof profileData.cep);
  console.log('  - zipCode (DSO):', profileData.zipCode, typeof profileData.zipCode);
  console.log('  - birthDate (DSO):', profileData.birthDate, typeof profileData.birthDate);
  
  // Verificar TODOS os campos disponíveis no profileData
  console.log('🔍 TODOS os campos disponíveis no profileData:');
  const profileDataKeys = Object.keys(profileData);
  profileDataKeys.forEach(key => {
    const value = profileData[key as keyof ProfileData];
    if (typeof value === 'string' && value.trim() !== '') {
      console.log(`  - ${key}: "${value}" (${typeof value})`);
    } else {
      console.log(`  - ${key}: ${value} (${typeof value}) - ${value ? 'com valor' : 'vazio/null'}`);
    }
  });
  
  // Buscar campos que podem conter endereço (busca case-insensitive)
  console.log('🔍 Campos que podem conter endereço na conversão:');
  profileDataKeys.forEach(key => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('address') || lowerKey.includes('street') || lowerKey.includes('rua') || 
        lowerKey.includes('number') || lowerKey.includes('numero') || lowerKey.includes('cep') || 
        lowerKey.includes('zip') || lowerKey.includes('city') || lowerKey.includes('cidade') ||
        lowerKey.includes('state') || lowerKey.includes('estado') || lowerKey.includes('neighbor') ||
        lowerKey.includes('bairro') || lowerKey.includes('birth') || lowerKey.includes('nascimento')) {
      console.log(`  - ${key}: ${profileData[key as keyof ProfileData]} (possível campo de endereço/data)`);
    }
  });
  console.groupEnd();
  
  const user: User = {
    id: sanitizeUTF8(profileData.id),
    name: sanitizeUTF8(profileData.name),
    email: sanitizeUTF8(profileData.email),
    cpf: sanitizeUTF8(profileData.document),
    donorType: "sponsor", // Padrão
    phone: sanitizeUTF8(profileData.phone),
    // ⚠️ CORREÇÃO: Mapear corretamente campos de endereço DSO para frontend com sanitização UTF-8
    address: sanitizeUTF8(profileData.street || profileData.address), // DSO usa 'street', frontend usa 'address'
    addressNumber: sanitizeUTF8(profileData.number || profileData.addressNumber), // DSO usa 'number', frontend usa 'addressNumber'
    addressComplement: sanitizeUTF8(profileData.addressComplement || profileData.complement), // Suportar ambos os campos
    neighborhood: sanitizeUTF8(profileData.neighborhood),
    city: sanitizeUTF8(profileData.city),
    state: sanitizeUTF8(profileData.state),
    zipCode: sanitizeUTF8(profileData.cep || profileData.zipCode), // DSO usa 'cep', frontend usa 'zipCode'
    birthDate: sanitizeUTF8(profileData.birthDate),
    gender: (sanitizeUTF8(profileData.gender) as 'M' | 'F') || 'M',
    pronoun: sanitizeUTF8((profileData as any).pronoun), // Novo campo
    profession: sanitizeUTF8((profileData as any).profession), // Novo campo
    deficiency: sanitizeUTF8((profileData as any).deficiency), // Novo campo
    createdAt: profileData.created_at || new Date().toISOString(),
    isDSOUser: true,
    isMockUser: false
  };
  
  // Debug específico dos campos de endereço
  console.log('🏠 [AuthContext] Debug mapeamento de endereço:');
  console.log('  - DSO street → frontend address:', profileData.street, '→', user.address);
  console.log('  - DSO number → frontend addressNumber:', profileData.number, '→', user.addressNumber);
  console.log('  - DSO cep → frontend zipCode:', profileData.cep, '→', user.zipCode);
  console.log('  - neighborhood:', user.neighborhood);
  console.log('  - city:', user.city);
  console.log('  - state:', user.state);
  console.log('  - birthDate:', user.birthDate);
  
  // ⚠️ DEBUG: Log específico do mapeamento realizado na conversão
  console.group('🔄 [convertDSOUserToUser] DEBUG - Mapeamento realizado');
  console.log('📋 Campos mapeados na conversão:');
  console.log('  - address:', user.address, '(de:', profileData.address, 'ou', profileData.street, ')');
  console.log('  - addressNumber:', user.addressNumber, '(de:', profileData.addressNumber, 'ou', profileData.number, ')');
  console.log('  - neighborhood:', user.neighborhood, '(de:', profileData.neighborhood, ')');
  console.log('  - city:', user.city, '(de:', profileData.city, ')');
  console.log('  - state:', user.state, '(de:', profileData.state, ')');
  console.log('  - zipCode:', user.zipCode, '(de:', profileData.zipCode, 'ou', profileData.cep, ')');
  console.log('  - birthDate:', user.birthDate, '(de:', profileData.birthDate, ')');
  console.groupEnd();
  
  console.log('✅ [AuthContext] Usuário convertido:', user);
  
  return user;
}

/**
 * Converte User para ProfileData (para atualizações)
 */
function convertUserToDSOUser(user: User): Partial<ProfileData> {
  return {
    name: user.name,
    email: user.email,
    document: user.cpf,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    cep: user.zipCode
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (document: string, password: string, isMockMode?: boolean) => Promise<void>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    document: string,
    phone: string,
    password: string,
    address: string,
    addressNumber: string,
    addressComplement: string,
    neighborhood: string,
    city: string,
    state: string,
    cep: string,
    personType: 'pf' | 'pj',
    industry?: string,
    ownership?: string,
    gender?: 'M' | 'F',
    birthDate?: string,
    typeDocument?: string
  ) => Promise<void>;
  mockProfile: UserProfile;
  changeMockProfile: (profile: UserProfile) => void;
  isAuthenticated: boolean;
  isMockMode: boolean; // Flag para indicar se está em modo mockado
  isDSOMode: boolean; // Flag para indicar se está usando dados DSO
  refreshProfile: () => Promise<void>; // Atualizar perfil DSO
  updateProfile: (profileData: Partial<User>) => Promise<boolean>; // Atualizar perfil
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constantes para persistência do login
const LOGIN_EXPIRATION_TIME = 20 * 60 * 1000; // 20 minutos em millisegundos
const LOGIN_STORAGE_KEY = 'childfund-auth-data';
const LOGIN_TIMESTAMP_KEY = 'childfund-auth-timestamp';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mockProfile, setMockProfile] = useState<UserProfile>('padrinho');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isDSOMode, setIsDSOMode] = useState(false);

  // Hook DSO de produção
  const dsoAuth = useProductionDSO();

  // Configuração do ambiente
  const isDevelopment = import.meta.env.VITE_APP_MODE === 'development' || 
                       (!import.meta.env.VITE_APP_MODE && !import.meta.env.PROD);

  // Inicializar o mockProfile do localStorage quando o componente montar
  useEffect(() => {
    const savedProfile = localStorage.getItem('mockProfile');
    if (savedProfile && (savedProfile === 'padrinho' || savedProfile === 'guardiao' || savedProfile === 'unico')) {
      setMockProfile(savedProfile as UserProfile);
    }
  }, []);

  // Memoizar o usuário mockado para evitar recriações desnecessárias
  const mockUser = useMemo(() => mockUsers[mockProfile], [mockProfile]);

  useEffect(() => {
    // Salva no localStorage quando mudar
    localStorage.setItem('mockProfile', mockProfile);
  }, [mockProfile]);

  // Sincronizar dados DSO com o estado do AuthContext
  useEffect(() => {
    console.log('🔄 [AuthContext] DSO state changed:', {
      isAuthenticated: dsoAuth.isAuthenticated,
      hasUser: !!dsoAuth.user,
      isLoading: dsoAuth.isLoading,
      error: dsoAuth.error
    });
    
    if (dsoAuth.isAuthenticated && dsoAuth.user) {
      console.log('🔄 [AuthContext] Sincronizando dados DSO com AuthContext...');
      console.log('🔄 [AuthContext] Dados DSO:', dsoAuth.user);
      
      const convertedUser = convertDSOUserToUser(dsoAuth.user);
      console.log('🔄 [AuthContext] Usuário convertido:', convertedUser);
      
      setUser(convertedUser);
      setIsAuthenticated(true);
      setIsDSOMode(true);
      setIsMockMode(false);
      
      // Salvar dados DSO no localStorage para persistência, preservando credenciais existentes
      const existingCredentials = getExistingCredentials();
      saveLoginData(convertedUser, undefined, false, existingCredentials || undefined);
      
      console.log('✅ [AuthContext] Sincronização DSO completa');
    } else if (!dsoAuth.isLoading && !dsoAuth.isAuthenticated) {
      // DSO não autenticado, verificar se há dados locais
      console.log('🔍 [AuthContext] DSO não autenticado, verificando dados locais...');
      if (!user || user.isDSOUser) {
        // Se não há usuário ou o usuário atual é DSO, limpar
        console.log('🔍 [AuthContext] Limpando estado DSO');
        setIsDSOMode(false);
      }
    }
  }, [dsoAuth.isAuthenticated, dsoAuth.user, dsoAuth.isLoading, dsoAuth.error]);

  // Sincronizar loading state
  useEffect(() => {
    if (isDSOMode) {
      setIsLoading(dsoAuth.isLoading);
    }
  }, [dsoAuth.isLoading, isDSOMode]);

  /**
   * Verifica se o login ainda é válido baseado no timestamp
   */
  const isLoginValid = (): boolean => {
    const loginTimestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY);
    if (!loginTimestamp) return false;

    const loginTime = parseInt(loginTimestamp);
    const currentTime = Date.now();
    const timeDiff = currentTime - loginTime;

    // Se passou mais de 20 minutos, login expirou
    if (timeDiff > LOGIN_EXPIRATION_TIME) {
      console.log('🔍 Login expirado após 20 minutos de inatividade');
      return false;
    }

    return true;
  };

  /**
   * Obtém credenciais existentes do localStorage
   */
  const getExistingCredentials = (): { login: string; password: string } | null => {
    try {
      const authData = localStorage.getItem(LOGIN_STORAGE_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.credentials || null;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter credenciais existentes:', error);
      return null;
    }
  };

  /**
   * Salva dados do login no localStorage e cookie com timestamp
   */
  const saveLoginData = (userData: User, token?: string, isMock: boolean = false, credentials?: { login: string; password: string }) => {
    // Sanitizar dados antes de salvar no localStorage
    const sanitizedUser = sanitizeUserUTF8(userData);
    
    const loginData = {
      user: sanitizedUser,
      token: token,
      isMock: isMock,
      timestamp: Date.now(),
      credentials: credentials || null // Salvar credenciais para renovação automática
    };

    localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(loginData));
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
    
    // Salvar token também separadamente para compatibilidade
    if (token) {
      localStorage.setItem('auth-token', token);
      localStorage.setItem('childfund-auth-token', token);
      
      // ✅ CORREÇÃO: Salvar token no cookie para que o backend possa acessá-lo
      document.cookie = `childfund-auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
    
    console.log('✅ Dados do login salvos no localStorage e cookie');
  };

  /**
   * Carrega dados do login do localStorage
   */
  const loadLoginData = (): { user: User; token?: string; isMock: boolean } | null => {
    try {
      const loginData = localStorage.getItem(LOGIN_STORAGE_KEY);
      if (!loginData) return null;

      const parsedData = JSON.parse(loginData);
      
      // Verificar se o login ainda é válido
      if (!isLoginValid()) {
        console.log('🔍 Login expirado, removendo dados do localStorage');
        clearLoginData();
        return null;
      }

      // Não sanitizar dados do localStorage para preservar compatibilidade com produção

      console.log('✅ Dados do login carregados do localStorage');
      return parsedData;
    } catch (error) {
      console.error('❌ Erro ao carregar dados do login:', error);
      return null;
    }
  };

  /**
   * Limpa dados do login do localStorage
   */
  const clearLoginData = () => {
    localStorage.removeItem(LOGIN_STORAGE_KEY);
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-id');
    localStorage.removeItem('user-data');
    localStorage.removeItem('childfund-auth-token');
    
    // Invalidar cache específico do usuário no React Query
    queryClient.removeQueries({ queryKey: ['donor-data'] });
    queryClient.removeQueries({ queryKey: ['user-profile'] });
    
    console.log('✅ Dados do login e cache removidos');
  };

  /**
   * Processa dados do usuário vindos do DSO
   */
  const processUserData = (userData: any, userId: string): User => {
    // ⚠️ DEBUG: Log específico dos campos de endereço recebidos do DSO
    console.group('🔍 [AuthContext] DEBUG - Dados do DSO recebidos');
    console.log('📋 userData completo:', userData);
    console.log('🏠 Campos de endereço do DSO:');
    console.log('  - street (DSO):', userData.street, typeof userData.street);
    console.log('  - address (DSO):', userData.address, typeof userData.address);
    console.log('  - number (DSO):', userData.number, typeof userData.number);
    console.log('  - addressNumber (DSO):', userData.addressNumber, typeof userData.addressNumber);
    console.log('  - addressComplement (DSO):', userData.addressComplement, typeof userData.addressComplement);
    console.log('  - complement (DSO):', userData.complement, typeof userData.complement);
    console.log('  - neighborhood (DSO):', userData.neighborhood, typeof userData.neighborhood);
    console.log('  - city (DSO):', userData.city, typeof userData.city);
    console.log('  - state (DSO):', userData.state, typeof userData.state);
    console.log('  - cep (DSO):', userData.cep, typeof userData.cep);
    console.log('  - zipCode (DSO):', userData.zipCode, typeof userData.zipCode);
    console.log('  - birthDate (DSO):', userData.birthDate, typeof userData.birthDate);
    console.log('  - document (DSO):', userData.document, typeof userData.document);
    console.log('  - cpf (DSO):', userData.cpf, typeof userData.cpf);
    
    // Verificar TODOS os campos disponíveis no userData
    console.log('🔍 TODOS os campos disponíveis no userData:');
    const userDataKeys = Object.keys(userData);
    userDataKeys.forEach(key => {
      const value = userData[key];
      if (typeof value === 'string' && value.trim() !== '') {
        console.log(`  - ${key}: "${value}" (${typeof value})`);
      } else {
        console.log(`  - ${key}: ${value} (${typeof value}) - ${value ? 'com valor' : 'vazio/null'}`);
      }
    });
    
    // Buscar campos que podem conter endereço (busca case-insensitive)
    console.log('🔍 Campos que podem conter endereço:');
    userDataKeys.forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('address') || lowerKey.includes('street') || lowerKey.includes('rua') || 
          lowerKey.includes('number') || lowerKey.includes('numero') || lowerKey.includes('cep') || 
          lowerKey.includes('zip') || lowerKey.includes('city') || lowerKey.includes('cidade') ||
          lowerKey.includes('state') || lowerKey.includes('estado') || lowerKey.includes('neighbor') ||
          lowerKey.includes('bairro') || lowerKey.includes('birth') || lowerKey.includes('nascimento')) {
        console.log(`  - ${key}: ${userData[key]} (possível campo de endereço/data)`);
      }
    });
    
    console.groupEnd();

    // Mapear dados do DSO para interface User
    const mappedUser: User = {
      id: userData.id || userData.dynamicsId || userId,
      name: userData.name || 'Usuário',
      email: userData.email || '',
      cpf: userData.document || userData.cpf || '',
      donorType: determineDonorType(userData),
      phone: userData.phone || '',
      // ✅ CORREÇÃO: DSO retorna 'street' não 'address'
      address: userData.street || userData.address || '',
      // ✅ CORREÇÃO: DSO retorna 'number' não 'addressNumber'
      addressNumber: userData.number || userData.addressNumber || '',
      // ✅ CORREÇÃO: DSO retorna 'addressComplement' corretamente
      addressComplement: userData.addressComplement || userData.complement || '',
      // ✅ CORREÇÃO: DSO retorna 'neighborhood' corretamente
      neighborhood: userData.neighborhood || '',
      // ✅ CORREÇÃO: DSO retorna 'city' corretamente
      city: userData.city || '',
      // ✅ CORREÇÃO: DSO retorna 'state' corretamente
      state: userData.state || '',
      // ✅ CORREÇÃO: DSO retorna 'cep' não 'zipCode'
      zipCode: userData.cep || userData.zipCode || '',
      // ✅ CORREÇÃO: DSO retorna 'birthDate' corretamente
      birthDate: userData.birthDate || '',
      gender: userData.gender || 'M',
      pronoun: (userData as any).pronoun || '', // Novo campo
      profession: (userData as any).profession || '', // Novo campo
      deficiency: (userData as any).deficiency || '', // Novo campo
      createdAt: userData.created_at || new Date().toISOString(),
      isMockUser: false,
      isDSOUser: true, // Marcar como usuário DSO
    };
    
    // ⚠️ DEBUG: Log específico do mapeamento realizado
    console.group('🔄 [AuthContext] DEBUG - Mapeamento realizado');
    console.log('📋 Campos mapeados:');
    console.log('  - address:', mappedUser.address, '(de userData.street:', userData.street, ')');
    console.log('  - addressNumber:', mappedUser.addressNumber, '(de userData.number:', userData.number, ')');
    console.log('  - addressComplement:', mappedUser.addressComplement, '(de userData.addressComplement:', userData.addressComplement, ')');
    console.log('  - neighborhood:', mappedUser.neighborhood, '(de userData.neighborhood:', userData.neighborhood, ')');
    console.log('  - city:', mappedUser.city, '(de userData.city:', userData.city, ')');
    console.log('  - state:', mappedUser.state, '(de userData.state:', userData.state, ')');
    console.log('  - zipCode:', mappedUser.zipCode, '(de userData.cep:', userData.cep, ')');
    console.log('  - birthDate:', mappedUser.birthDate, '(de userData.birthDate:', userData.birthDate, ')');
    console.log('  - gender:', mappedUser.gender, '(de userData.gender:', userData.gender, ')');
    console.groupEnd();

    return mappedUser;
  };

  /**
   * Busca dados reais do usuário no DSO
   */
  const fetchRealUserData = async (userId: string, token?: string, userEmail?: string): Promise<User | null> => {
    try {
      console.log('🔍 [AuthContext] Buscando dados reais do usuário no DSO:', userId);
      console.log('🔍 [AuthContext] Token disponível:', token ? 'Sim' : 'Não');
      console.log('🔍 [AuthContext] Email disponível:', userEmail || 'Não');
      
      // Buscar perfil completo do usuário por ID
      console.log('🔍 [AuthContext] Tentando buscar perfil por ID...');
      const profileResponse = await DSOService.getDonorProfile(userId);
      
      console.log('📡 [AuthContext] Resposta do getDonorProfile:', profileResponse);
      
      if (!profileResponse.success) {
        console.warn('⚠️ [AuthContext] Não foi possível buscar perfil do usuário por ID:', profileResponse.message);
        
        // Se falhou por ID e temos email, tentar por email
        if (userEmail) {
          console.log('🔍 [AuthContext] Tentando buscar por email:', userEmail);
          const emailResponse = await DSOService.getDonorProfileByEmail(userEmail);
          
          console.log('📡 [AuthContext] Resposta do getDonorProfileByEmail:', emailResponse);
          
          if (emailResponse.success && emailResponse.data) {
            console.log('✅ [AuthContext] Perfil encontrado por email, usando esses dados');
            const userData = emailResponse.data;
            
            // ⚠️ DEBUG: Log específico dos dados obtidos por email
            console.group('🔍 [AuthContext] DEBUG - Dados do DSO por EMAIL');
            console.log('📋 userData completo (por email):', userData);
            console.log('🏠 Campos de endereço do DSO (por email):');
            console.log('  - street (DSO):', userData.street, typeof userData.street);
            console.log('  - address (DSO):', userData.address, typeof userData.address);
            console.log('  - number (DSO):', userData.number, typeof userData.number);
            console.log('  - addressNumber (DSO):', userData.addressNumber, typeof userData.addressNumber);
            console.log('  - cep (DSO):', userData.cep, typeof userData.cep);
            console.log('  - zipCode (DSO):', userData.zipCode, typeof userData.zipCode);
            console.log('  - birthDate (DSO):', userData.birthDate, typeof userData.birthDate);
            console.groupEnd();
            
            // Continuar com o processamento usando dados do email
            return processUserData(userData, userId);
          } else {
            console.warn('⚠️ [AuthContext] Falha ao buscar por email também:', emailResponse.message);
          }
        }
        
        console.warn('⚠️ [AuthContext] Não foi possível obter dados do usuário por nenhum método');
        return null;
      }

      const userData = profileResponse.data;
      console.log('✅ [AuthContext] Dados reais do usuário obtidos por ID:', userData);
      
      return processUserData(userData, userId);
    } catch (error) {
      console.error('❌ [AuthContext] Erro ao buscar dados reais do usuário:', error);
      console.error('❌ [AuthContext] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      return null;
    }
  };

  /**
   * Determina o tipo de doador baseado nos dados do DSO
   */
  const determineDonorType = (userData: any): "sponsor" | "monthly" | "single" => {
    // Verificar se tem apadrinhamentos ativos
    if (userData.sponsorships && userData.sponsorships.length > 0) {
      return "sponsor";
    }
    
    // Verificar se tem doação mensal ativa
    if (userData.products && userData.products.some((p: any) => p.type === 'monthly')) {
      return "monthly";
    }
    
    // Padrão para doador único
    return "single";
  };

  useEffect(() => {
    // Verificar autenticação inicial
    const checkAuth = async () => {
      try {
        console.log('🔍 Verificando autenticação inicial...');
        
        // Primeiro verificar se há dados salvos no localStorage
        const savedLoginData = loadLoginData();
        
        if (savedLoginData) {
          console.log('🔍 Dados de login encontrados no localStorage');
          
          // Verificar se o login ainda é válido
          if (isLoginValid()) {
            console.log('✅ Login válido, restaurando sessão');
            
            setUser(savedLoginData.user);
            setIsAuthenticated(true);
            setIsMockMode(savedLoginData.isMock);
            
            // Se não for mock, tentar buscar dados atualizados do DSO
            if (!savedLoginData.isMock && savedLoginData.token) {
              console.log('🔍 Buscando dados atualizados do DSO...');
              const updatedUserData = await fetchRealUserData(savedLoginData.user.id, savedLoginData.token, savedLoginData.user.email);
          
              if (updatedUserData) {
                setUser(updatedUserData);
                // Atualizar dados salvos preservando credenciais existentes
                const existingCredentials = getExistingCredentials();
                saveLoginData(updatedUserData, savedLoginData.token, false, existingCredentials || undefined);
              }
            }
          } else {
            console.log('⚠️ Login expirado, limpando dados');
            clearLoginData();
            setUser(null);
            setIsAuthenticated(false);
            setIsMockMode(false);
          }
        } else {
          console.log('ℹ️ Nenhum dado de login encontrado');
          setUser(null);
          setIsAuthenticated(false);
          setIsMockMode(false);
            }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAuthenticated(false);
        setIsMockMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (document: string, password: string, isMockMode: boolean = false) => {
    setIsLoading(true);
    try {
      // Limpar o documento para busca (remover formatação)
      const cleanDocument = document.replace(/\D/g, '');
      
      if (isMockMode) {
        // Modo mockado - usar dados mockados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Buscar usuário mockado
        let foundUser = Object.values(mockUsers).find(user => 
          user.cpf === cleanDocument || user.cpf === document
        );
        
        if (!foundUser) {
          // Criar usuário mockado padrão se não encontrado
          foundUser = {
            id: `user_${cleanDocument}`,
            name: "Usuário Teste",
            email: `${cleanDocument.substring(0, 3)}@test.com`,
            cpf: cleanDocument,
            profile: "unico" as const,
            donorType: "single" as const,
            donations: []
          };
        }
        
        const mockUserData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          cpf: foundUser.cpf,
          donorType: foundUser.donorType,
          createdAt: "",
          isMockUser: true,
        };
        
        setUser(mockUserData);
        setIsAuthenticated(true);
        setIsMockMode(true);
        
        // Salvar dados do login mockado
        saveLoginData(mockUserData, undefined, true);
        
      } else {
        // Usar função de login de produção
        console.log('🔍 [AuthContext] Fazendo login DSO (padrão produção)...');
        
        try {
          const { login: dsoLogin } = await import('../utils/dso/session/login');
          const { profile } = await import('../utils/dso/session/profile');
          
          const HOST = 'https://dso.childfundbrasil.org.br/';
          const KEY = 'c5e53b87-d315-427d-a9f0-1d80d5f65f56';
          
          // Login exato como na produção
          const loginResult = await dsoLogin(HOST, {
            login: cleanDocument, // CPF sem formatação
            password: password
          }, KEY);
          
          console.log('📡 [AuthContext] Resultado do login DSO:', loginResult);
          
          if (loginResult.success === 'authenticated') {
            console.log('✅ [AuthContext] Login DSO bem-sucedido');
            
            // Buscar dados completos do perfil
            const profileResult = await profile(HOST);
            console.log('👤 [AuthContext] Dados do perfil:', profileResult);
            
            if (profileResult.data && Object.keys(profileResult.data).length > 0) {
              // Verificar se tem dados válidos (não é objeto vazio)
              const profileData = profileResult.data as any; // Type assertion para contornar verificação
              
              // Criar usuário com dados completos
              const userData: User = {
                id: profileData.id || loginResult.data?.user_id?.toString() || 'unknown',
                name: profileData.name || loginResult.data?.name || 'Usuário',
                email: profileData.email || '',
                cpf: profileData.document || cleanDocument,
                donorType: "single",
                phone: profileData.phone || '',
                address: profileData.address || profileData.street || '', // Mapear street para address
                addressNumber: profileData.addressNumber || profileData.number || '', // Mapear number para addressNumber
                addressComplement: profileData.addressComplement || profileData.complement || '', // Suportar ambos os campos
                neighborhood: profileData.neighborhood || '',
                city: profileData.city || '',
                state: profileData.state || '',
                zipCode: profileData.zipCode || profileData.cep || '', // Mapear cep para zipCode
                birthDate: profileData.birthDate || '',
                gender: profileData.gender || 'M',
                pronoun: (profileData as any).pronoun || '', // Novo campo
                profession: (profileData as any).profession || '', // Novo campo
                deficiency: (profileData as any).deficiency || '', // Novo campo
                createdAt: profileData.created_at || new Date().toISOString(),
                isMockUser: false,
                isDSOUser: true
              };
              
              setUser(userData);
              setIsAuthenticated(true);
              setIsDSOMode(true);
              setIsMockMode(false);
              
              // Salvar dados para persistência (incluindo credenciais para renovação automática)
              saveLoginData(userData, loginResult.data?.token, false, {
                login: cleanDocument,
                password: password
              });
              // NOVO: Salvar token como cookie para backend
              if (loginResult.data?.token) {
                window.document.cookie = `childfund-auth-token=${loginResult.data.token}; path=/; max-age=1200`; // 20min
              }
              console.log('✅ [AuthContext] Login DSO finalizado com sucesso');
              return;
            } else {
              console.warn('⚠️ [AuthContext] Dados de perfil não disponíveis');
            }
          } else {
            console.log('⚠️ [AuthContext] Login DSO falhou:', loginResult.message);
          }
        } catch (dsoError) {
          console.log('⚠️ [AuthContext] Erro no login DSO:', dsoError);
        }
          
        // Fallback para sistema legado
        const loginData: LoginData = {
          login: cleanDocument, // CPF sem formatação
          password: password
        };

        const response: AuthResponse = await authService.login(loginData);
        
        if (response.success && response.user) {
          const userData = response.user;
          
          // Buscar dados completos do usuário no DSO
          console.log('🔍 Login bem-sucedido, buscando dados completos...');
          const completeUserData = await fetchRealUserData(userData.id, response.token, userData.email);
          
          let finalUserData: User;
          
          if (completeUserData) {
            finalUserData = completeUserData;
            console.log('✅ Dados completos do usuário carregados');
          } else {
            // Fallback para dados básicos do login
            finalUserData = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            cpf: userData.document || cleanDocument,
            donorType: "single", // TODO: Determinar tipo de doador
            phone: userData.phone,
            address: userData.address,
            addressNumber: userData.addressNumber,
            addressComplement: userData.addressComplement,
            neighborhood: userData.neighborhood,
            city: userData.city,
            state: userData.state,
            zipCode: userData.cep,
            birthDate: userData.birthDate,
            gender: userData.gender,
            pronoun: (userData as any).pronoun || '', // Novo campo
            profession: (userData as any).profession || '', // Novo campo
            deficiency: (userData as any).deficiency || '', // Novo campo
            createdAt: new Date().toISOString(),
            isMockUser: false,
            };
            console.log('⚠️ Usando dados básicos do login (dados completos não disponíveis)');
          }
          
          setUser(finalUserData);
          setIsAuthenticated(true);
          setIsMockMode(false);
          
          // Salvar dados do login real (incluindo credenciais para renovação automática)
          saveLoginData(finalUserData, response.token, false, {
            login: cleanDocument,
            password: password
          });
          
        } else {
          throw new Error('Falha na autenticação');
        }
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const register = async (
    name: string,
    email: string,
    document: string,
    phone: string,
    password: string,
    address: string,
    addressNumber: string,
    addressComplement: string,
    neighborhood: string,
    city: string,
    state: string,
    cep: string,
    personType: 'pf' | 'pj',
    industry?: string,
    ownership?: string,
    gender?: 'M' | 'F',
    birthDate?: string,
    typeDocument?: string
  ) => {
    setIsLoading(true);
    
    try {
      console.log('🔍 Realizando cadastro real com DSO...');
      
        // Garantir que os dados estão no formato correto
        const cleanDocument = document.replace(/\D/g, ''); // CPF sem formatação
        const cleanPhone = phone; // Manter formato brasileiro (XX) XXXXX-XXXX
        
        const registerData: RegisterData = {
          name,
          email,
          password,
          confirmPassword: password,
          document: cleanDocument, // CPF sem formatação
          phone: cleanPhone, // Telefone no formato brasileiro
          address,
          addressNumber,
          addressComplement,
          neighborhood,
          city,
          state,
          cep,
          personType,
          industry,
          ownership,
          gender,
          birthDate,
          typeDocument,
        };

        const response = await authService.register(registerData);
        
        if (response.success) {
          // Cadastro bem-sucedido - não fazer login automático
          // O usuário deve fazer login manualmente após o cadastro
          console.log('✅ Cadastro realizado com sucesso. Usuário deve fazer login manualmente.');
          
          // Não definir usuário nem autenticação aqui
          // O usuário será redirecionado para a página de login
        } else {
          throw new Error('Falha no registro');
        }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changeMockProfile = (newProfile: UserProfile) => {
    setMockProfile(newProfile);
  };

  // Funções DSO
  const refreshProfile = async () => {
    if (isDSOMode) {
      await dsoAuth.refreshProfile();
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    console.log('🔍 [DEBUG] updateProfile chamado com:', profileData);
    console.log('🔍 [DEBUG] Estado updateProfile:');
    console.log('  - isDSOMode:', isDSOMode);
    console.log('  - dsoAuth.user:', !!dsoAuth.user);
    console.log('  - dsoAuth.isAuthenticated:', dsoAuth.isAuthenticated);
    console.log('  - user atual:', user);
    
    if (isDSOMode && dsoAuth.user) {
      console.log('🔍 [DEBUG] Condições DSO atendidas - updateProfile via DSO não implementado ainda');
      console.log('🔍 [DEBUG] Dados para atualizar:', profileData);
      
      // TODO: Implementar updateProfile no hook de produção se necessário
      console.warn('⚠️ [DEBUG] UpdateProfile DSO não implementado no hook de produção');
      return false;
    }
    
    // Fallback para sistema legado se necessário
    console.warn('⚠️ [DEBUG] Atualização de perfil não disponível para usuários não-DSO');
    console.warn('⚠️ [DEBUG] Motivo: isDSOMode =', isDSOMode, ', dsoAuth.user =', !!dsoAuth.user);
    return false;
  };

  const logout = () => {
    if (isDSOMode) {
      dsoAuth.logout();
    } else {
      // Logout legado
      setUser(null);
      setIsAuthenticated(false);
      setIsMockMode(false);
      clearLoginData();
    }
    setIsDSOMode(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      register,
      mockProfile,
      changeMockProfile,
      isAuthenticated,
      isMockMode,
      isDSOMode,
      refreshProfile,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
