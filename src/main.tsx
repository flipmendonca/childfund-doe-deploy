
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Importar funções de teste de produção (modo desenvolvimento)
if (import.meta.env.DEV) {
  import('./utils/testProductionDSO').then(module => {
    console.log('🧪 [Dev] Funções de teste DSO carregadas. Use: testProductionDSO.debugProductionFlow()');
  });
  
  // Importar teste direto de cadastro e login
  import('./utils/testDirectDSORegister').then(module => {
    console.log('🧪 [Dev] Teste direto DSO carregado. Use: testDirectDSO.testCompleteFlowDSO()');
  });
  
  // Importar validação definitiva DSO
  import('./utils/testDirectDSOValidation').then(module => {
    console.log('🧪 [Dev] Validação DSO carregada. Use: validateDSO.runFinalValidation()');
  });
  
  // Importar teste direto de perfil DSO
  import('./utils/testDSODirectProfile').then(module => {
    console.log('🧪 [Dev] Teste direto perfil DSO carregado. Use: testDSOProfile.loadDSOProfileDirect()');
  });
  
  // Importar teste de endpoint de cookies
  import('./utils/testCookieEndpoint').then(module => {
    console.log('🧪 [Dev] Teste de cookies carregado. Use: testCookieEndpoint.testAll()');
  }).catch(() => {
    console.log('🧪 [Dev] Teste de cookies não encontrado');
  });
  
  // Importar funções de teste de token
  import('./utils/testProfileUpdate').then((module)=>{
      console.log('🧪 [Dev] Token tests carregados. Use: testTokenRetrieval() ou testProfileUpdateWithToken()');
      (window as any).testTokenRetrieval = module.testTokenRetrieval;
      (window as any).testProfileUpdateWithToken = module.testProfileUpdateWithToken;
  });
  
  // Importar função para forçar credenciais
  import('./utils/forceCredentialsSave').then(module => {
    console.log('🧪 [Dev] Funções de credenciais carregadas. Use: forceCredentialsSave() ou checkCredentialsState()');
  });
  
  // Importar testes de persistência de credenciais
  import('./utils/testCredentialsPersistence').then(module => {
    console.log('🧪 [Dev] Testes de persistência carregados. Use: runCredentialsTests()');
  });
  
  // Importar validação de CEP
  import('./services/cepValidationService').then(module => {
    (window as any).validateCEP = module.validateCEP;
    (window as any).compareWithDSO = module.compareWithDSO;
    console.log('🏠 [Dev] Validação de CEP carregada. Use: validateCEP("20261-065") ou compareWithDSO(dsoAddress, cep)');
  });
  
  // Importar teste completo de produção
  import('./utils/testProductionFlowComplete').then(module => {
    (window as any).runCompleteProductionTest = module.runCompleteProductionTest;
    console.log('🧪 [Dev] Teste completo de produção carregado. Use: runCompleteProductionTest("login", "password")');
  });
  
  // Importar teste de persistência de token
  import('./utils/testTokenPersistence').then(module => {
    (window as any).runTokenPersistenceTest = module.runTokenPersistenceTest;
    console.log('🔒 [Dev] Teste de persistência de token carregado. Use: runTokenPersistenceTest()');
  });
  
  // Importar utilitário para limpar token de teste
  import('./utils/clearTestToken').then(module => {
    (window as any).clearTestToken = module.clearTestToken;
    (window as any).explainTestTokenProblem = module.explainTestTokenProblem;
    console.log('🧹 [Dev] Utilitário de limpeza de token carregado. Use: clearTestToken() ou explainTestTokenProblem()');
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
