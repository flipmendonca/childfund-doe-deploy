/**
 * Script de teste para validar implementação DSO de produção
 * Testa o fluxo completo: login → perfil → exibição
 */

import { login } from './dso/session/login';
import { profile } from './dso/session/profile';

const DSO_HOST = 'https://dso.childfundbrasil.org.br/';
const DSO_KEY = 'c5e53b87-d315-427d-a9f0-1d80d5f65f56';

// Credenciais de teste conhecidas
const TEST_CREDENTIALS = {
  login: '13411086785',
  password: 'F1lipe26!'
};

/**
 * Testa login de produção completo
 */
export async function testProductionLogin() {
  console.log('🚀 [Teste Produção] === TESTE COMPLETO DSO PRODUÇÃO ===');
  
  try {
    // Limpar estado anterior
    localStorage.removeItem('dso-token');
    console.log('🗑️ [Teste Produção] Estado anterior limpo');
    
    // 1. TESTE DE LOGIN
    console.log('🔐 [Teste Produção] 1. Testando login...');
    const loginResult = await login(DSO_HOST, TEST_CREDENTIALS, DSO_KEY);
    
    console.log('📡 [Teste Produção] Resultado login:', {
      success: loginResult.success,
      hasToken: !!loginResult.data?.token,
      hasName: !!loginResult.data?.name,
      userId: loginResult.data?.user_id
    });
    
    if (loginResult.success !== 'authenticated') {
      throw new Error(`Login falhou: ${loginResult.message}`);
    }
    
    console.log('✅ [Teste Produção] Login realizado com sucesso!');
    
    // 2. TESTE DE COOKIES
    console.log('🍪 [Teste Produção] 2. Verificando cookies...');
    
    try {
      const cookieResponse = await fetch('/api/essentials/coockies', {
        method: 'GET',
        credentials: 'include'
      });
      
      const cookieData = await cookieResponse.json();
      console.log('🍪 [Teste Produção] Cookies:', cookieData);
      
      if (!cookieData.token?.value) {
        console.warn('⚠️ [Teste Produção] Token não encontrado nos cookies');
      } else {
        console.log('✅ [Teste Produção] Token encontrado nos cookies');
      }
    } catch (cookieError) {
      console.error('❌ [Teste Produção] Erro ao verificar cookies:', cookieError);
    }
    
    // 3. TESTE DE PERFIL
    console.log('👤 [Teste Produção] 3. Testando busca de perfil...');
    
    const profileResult = await profile(DSO_HOST);
    
    console.log('📡 [Teste Produção] Resultado perfil:', {
      hasData: !!profileResult.data,
      isEmpty: Object.keys(profileResult.data || {}).length === 0,
      keys: Object.keys(profileResult.data || {}),
      data: profileResult.data
    });
    
    if (!profileResult.data || Object.keys(profileResult.data).length === 0) {
      console.warn('⚠️ [Teste Produção] Perfil vazio ou não encontrado');
    } else {
      console.log('✅ [Teste Produção] Perfil carregado com sucesso!');
    }
    
    // 4. RESULTADO FINAL
    const success = (
      loginResult.success === 'authenticated' &&
      profileResult.data &&
      Object.keys(profileResult.data).length > 0
    );
    
    console.log('🎯 [Teste Produção] === RESULTADO FINAL ===');
    console.log(`Status: ${success ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log('Detalhes:');
    console.log(`  - Login: ${loginResult.success === 'authenticated' ? '✅' : '❌'}`);
    console.log(`  - Token: ${!!loginResult.data?.token ? '✅' : '❌'}`);
    console.log(`  - Perfil: ${profileResult.data && Object.keys(profileResult.data).length > 0 ? '✅' : '❌'}`);
    
    return {
      success,
      login: loginResult,
      profile: profileResult,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ [Teste Produção] Erro geral:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Teste simples de autenticação
 */
export async function testSimpleAuth() {
  console.log('🔍 [Teste Simples] Verificando autenticação...');
  
  try {
    const profileResult = await profile(DSO_HOST);
    const isAuthenticated = profileResult.data && Object.keys(profileResult.data).length > 0;
    
    console.log('🔍 [Teste Simples] Resultado:', {
      isAuthenticated,
      hasData: !!profileResult.data,
      dataKeys: Object.keys(profileResult.data || {})
    });
    
    return isAuthenticated;
  } catch (error) {
    console.error('❌ [Teste Simples] Erro:', error);
    return false;
  }
}

/**
 * Teste completo com debug detalhado
 */
export async function debugProductionFlow() {
  console.log('🔧 [Debug] === DEBUG FLUXO DE PRODUÇÃO ===');
  
  const steps = [];
  
  try {
    // Step 1: Verificar estado inicial
    console.log('📋 [Debug] 1. Estado inicial...');
    const initialToken = localStorage.getItem('dso-token');
    steps.push({
      step: 'Estado inicial',
      hasLocalToken: !!initialToken,
      localToken: initialToken ? `${initialToken.substring(0, 20)}...` : null
    });
    
    // Step 2: Verificar cookies
    console.log('📋 [Debug] 2. Verificando cookies...');
    let cookieData = null;
    try {
      const cookieResponse = await fetch('/api/essentials/coockies');
      cookieData = await cookieResponse.json();
    } catch (e) {
      console.warn('⚠️ Endpoint de cookies não disponível');
    }
    
    steps.push({
      step: 'Cookies',
      available: !!cookieData,
      hasToken: !!cookieData?.token?.value,
      data: cookieData
    });
    
    // Step 3: Teste de login
    console.log('📋 [Debug] 3. Teste de login...');
    const loginTest = await testProductionLogin();
    
    steps.push({
      step: 'Login Test',
      success: loginTest.success,
      details: loginTest
    });
    
    // Step 4: Estado final
    console.log('📋 [Debug] 4. Estado final...');
    const finalAuth = await testSimpleAuth();
    
    steps.push({
      step: 'Estado final',
      isAuthenticated: finalAuth
    });
    
    console.log('🔧 [Debug] === RESUMO COMPLETO ===');
    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.step}:`, step);
    });
    
    return {
      success: loginTest.success && finalAuth,
      steps,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ [Debug] Erro no debug:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      steps,
      timestamp: new Date().toISOString()
    };
  }
}

// Expor funções globalmente para debug no console
if (typeof window !== 'undefined') {
  (window as any).testProductionDSO = {
    testProductionLogin,
    testSimpleAuth,
    debugProductionFlow
  };
} 