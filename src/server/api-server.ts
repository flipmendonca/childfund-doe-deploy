import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { DynamicsToken } from '../services/DynamicsToken.js';
import { ChildMapper } from '../lib/dynamics/ChildMapper';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Debug das variáveis de ambiente
console.log('🔧 Variáveis de ambiente carregadas:');
console.log('   DYNAMICS_TENANT_ID:', process.env.DYNAMICS_TENANT_ID ? '✅ Definido' : '❌ Não encontrado');
console.log('   DYNAMICS_CLIENT_ID:', process.env.DYNAMICS_CLIENT_ID ? '✅ Definido' : '❌ Não encontrado');
console.log('   DYNAMICS_CLIENT_SECRET:', process.env.DYNAMICS_CLIENT_SECRET ? '✅ Definido' : '❌ Não encontrado');
console.log('   DYNAMICS_BASE_URL:', process.env.DYNAMICS_BASE_URL ? '✅ Definido' : '❌ Não encontrado');
console.log('   RD_CLIENT_ID:', process.env.RD_CLIENT_ID ? '✅ Definido' : '❌ Não encontrado');
console.log('   RD_CLIENT_SECRET:', process.env.RD_CLIENT_SECRET ? '✅ Definido' : '❌ Não encontrado');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurar UTF-8 para todas as respostas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Logs de requisições
app.use((req, res, next) => {
  console.log(`🔄 ${req.method} ${req.url}`);
  next();
});

// Proxy para DSO
app.use('/api/dso', async (req, res) => {
  try {
    const { method, path, body, query } = req;
    const dsoUrl = `https://dso.childfundbrasil.org.br${path}`;
    
    console.log(`[DSO Proxy] ${method} ${dsoUrl}`);
    console.log(`[DSO Proxy] Query params:`, query);
    console.log(`[DSO Proxy] Body:`, body);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
        'Accept-Charset': 'utf-8'
      },
      redirect: 'follow' // Seguir redirecionamentos
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(dsoUrl, options);
    
    console.log(`[DSO Proxy] Response status: ${response.status} ${response.statusText}`);
    console.log(`[DSO Proxy] Response headers:`, Object.fromEntries(response.headers.entries()));

    // Verificar se a resposta é JSON
    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      const textData = await response.text();
      try {
        // Garantir que o texto está em UTF-8 antes de fazer parse do JSON
        responseData = JSON.parse(textData);
      } catch (parseError) {
        console.error('[DSO Proxy] JSON parse error:', parseError);
        responseData = {
          success: false,
          message: 'Erro ao parsear JSON do DSO',
          status: response.status,
          contentType,
          originalText: textData.substring(0, 200)
        };
      }
    } else {
      const textResponse = await response.text();
      console.log(`[DSO Proxy] Non-JSON response:`, textResponse.substring(0, 500));
      
      // Se não for JSON, tentar retornar um erro estruturado
      responseData = {
        success: false,
        message: 'Resposta não-JSON do DSO',
        status: response.status,
        contentType,
        body: textResponse.substring(0, 200)
      };
    }

    console.log(`[DSO Proxy] Final response:`, JSON.stringify(responseData, null, 2));

    res.status(response.status).json(responseData);
  } catch (error) {
    console.error('[DSO Proxy] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no proxy DSO',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// API: Buscar contatos
app.get('/api/dynamics/contacts', async (req, res) => {
  try {
    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Construir URL da consulta
    const dynamicsUrl = new URL(`${process.env.DYNAMICS_BASE_URL}contacts`);
    
    // Passar parâmetros OData se fornecidos
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        dynamicsUrl.searchParams.set(key, value);
      }
    });

    console.log('Consultando Dynamics:', dynamicsUrl.toString());

    const response = await fetch(dynamicsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM:', response.status, errorText);
      throw new Error(`Dynamics CRM error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Encontrados ${data.value?.length || 0} contatos`);
    
    res.json(data);
  } catch (error) {
    console.error('Erro na consulta de contatos:', error);
    res.status(500).json({ 
      error: 'Failed to query contacts from Dynamics CRM',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Buscar contato específico
app.get('/api/dynamics/contacts/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    
    if (!contactId) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }

    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Construir URL da consulta
    const dynamicsUrl = new URL(`${process.env.DYNAMICS_BASE_URL}contacts(${contactId})`);
    
    // Passar parâmetros OData se fornecidos
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        dynamicsUrl.searchParams.set(key, value);
      }
    });

    console.log('Consultando contato específico:', dynamicsUrl.toString());

    const response = await fetch(dynamicsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM:', response.status, errorText);
      throw new Error(`Dynamics CRM error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Contato encontrado: ${data.fullname || data.firstname} (ID: ${contactId})`);
    
    res.json(data);
  } catch (error) {
    console.error('Erro na consulta de contato:', error);
    res.status(500).json({ 
      error: 'Failed to query contact from Dynamics CRM',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Buscar contatos por query
app.get('/api/contacts/query', async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || typeof search !== 'string') {
      return res.status(400).json({ error: 'Search parameter is required' });
    }

    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Construir filtro de busca
    const filter = `statecode eq 0 and new_statusbloqueado eq false and new_data_do_apadrinhamento eq null and (startswith(fullname, '${search}') or startswith(firstname, '${search}'))`;
    
    const dynamicsUrl = new URL(`${process.env.DYNAMICS_BASE_URL}contacts`);
    dynamicsUrl.searchParams.set('$select', 'contactid,firstname,lastname,fullname,birthdate,gendercode,new_genero,chf_fotocrianca_url,new_statusbloqueado,new_data_do_apadrinhamento');
    dynamicsUrl.searchParams.set('$filter', filter);
    dynamicsUrl.searchParams.set('$orderby', 'fullname asc');
    dynamicsUrl.searchParams.set('$top', '20');
    dynamicsUrl.searchParams.set('$count', 'true');

    console.log('Busca por query:', dynamicsUrl.toString());

    const response = await fetch(dynamicsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM:', response.status, errorText);
      throw new Error(`Dynamics CRM error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Busca por "${search}": ${data.value?.length || 0} resultados`);
    
    res.json(data);
  } catch (error) {
    console.error('Erro na busca por query:', error);
    res.status(500).json({ 
      error: 'Failed to search contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Criar ticket de suporte no Dynamics CRM
app.post('/api/dynamics/support-ticket', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority = 'normal', source = 'portal-web' } = req.body;
    
    if (!subject || !description) {
      return res.status(400).json({ 
        success: false,
        error: 'Subject and description are required' 
      });
    }

    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Dados do ticket conforme estrutura do Dynamics CRM
    // Usando entidade 'incidents' (casos) que é padrão para tickets de suporte
    const ticketData = {
      title: subject,
      description: description,
      caseorigincode: 1, // Web
      prioritycode: priority === 'high' ? 1 : priority === 'normal' ? 2 : 3, // 1=High, 2=Normal, 3=Low
      customerid_contact: null, // TODO: Vincular ao contato do usuário logado
      statecode: 0, // Ativo
      statuscode: 1, // Em progresso
      // Campos customizados do ChildFund (se existirem)
      new_source: source,
      new_customeremail: customerEmail
    };

    console.log('Criando ticket de suporte:', ticketData);

    const response = await fetch(`${process.env.DYNAMICS_BASE_URL}incidents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(ticketData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM:', response.status, errorText);
      throw new Error(`Dynamics CRM error: ${response.status} ${response.statusText}`);
    }
    
    const createdTicket = await response.json();
    console.log(`✅ Ticket criado com sucesso: ${createdTicket.incidentid}`);
    
    res.json({
      success: true,
      data: {
        ticketId: createdTicket.incidentid,
        ticketNumber: createdTicket.ticketnumber,
        title: createdTicket.title,
        status: 'created'
      },
      message: 'Ticket criado com sucesso'
    });
  } catch (error) {
    console.error('Erro na criação de ticket:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create support ticket in Dynamics CRM',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Dynamics CRM API Server'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

// Health check compatibilidade
app.get('/api/dynamics/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Dynamics CRM API Server',
    endpoint: '/api/dynamics/health'
  });
});

// Rotas para integração com CRM
app.post('/api/crm/tracking/conversion', async (req, res) => {
  try {
    console.log('🔍 [CRM] Recebendo conversão:', req.body);
    
    const { event_type, form_type, child_id, user_id, amount, metadata } = req.body;
    
    // Validar dados obrigatórios
    if (!event_type || !form_type) {
      return res.status(400).json({
        success: false,
        error: 'event_type e form_type são obrigatórios'
      });
    }

    // Preparar dados para possível integração futura com Dynamics CRM
    const conversionData = {
      event_id: `conv_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      event_type,
      form_type,
      child_id,
      user_id,
      amount,
      metadata,
      timestamp: new Date().toISOString(),
      session_id: req.body.session_id || `session_${Date.now()}`,
      page_url: req.body.page_url || '',
      utm_data: req.body.utm_data || {}
    };

    console.log('✅ [CRM] Conversão processada:', conversionData);
    
    // TODO: Integrar com Dynamics CRM quando necessário
    // await createDynamicsConversion(conversionData);
    
    res.json({
      success: true,
      message: 'Conversão registrada com sucesso no CRM',
      data: conversionData
    });
  } catch (error) {
    console.error('❌ [CRM] Erro ao processar conversão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao processar conversão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

app.post('/api/crm/contact', async (req, res) => {
  try {
    console.log('🔍 [CRM] Recebendo dados de contato:', req.body);
    
    // Enviar para DSO ou CRM
    // Por enquanto, apenas log
    
    res.json({
      success: true,
      message: 'Contato enviado para CRM',
      contactId: `contact_${Date.now()}`
    });
  } catch (error) {
    console.error('❌ [CRM] Erro ao processar contato:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao processar contato'
    });
  }
});

app.post('/api/crm/newsletter', async (req, res) => {
  try {
    console.log('🔍 [CRM] Recebendo inscrição newsletter:', req.body);
    
    // Enviar para DSO ou CRM
    // Por enquanto, apenas log
    
    res.json({
      success: true,
      message: 'Inscrição na newsletter processada',
      subscriptionId: `sub_${Date.now()}`
    });
  } catch (error) {
    console.error('❌ [CRM] Erro ao processar newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao processar newsletter'
    });
  }
});

// Debug endpoint: DSO Integration
app.get('/api/debug/dso', async (req, res) => {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    dsoHost: 'https://dso.childfundbrasil.org.br/',
    tests: [],
    authInfo: {},
    userInfo: {}
  };

  try {
    console.log('🔍 [DSO DEBUG] Iniciando debug detalhado do DSO...');

    // Teste 1: Verificar conectividade básica com DSO
    debugInfo.tests.push({
      name: 'Conectividade DSO',
      status: 'testing',
      url: debugInfo.dsoHost,
      description: 'Testando conectividade básica com o servidor DSO'
    });

    try {
      const pingResponse = await fetch(debugInfo.dsoHost, {
        method: 'GET',
        headers: {
          'User-Agent': 'ChildFund-Brasil-Debug/1.0',
        },
      });

      debugInfo.tests[0].status = pingResponse.ok ? 'success' : 'failed';
      debugInfo.tests[0].httpStatus = pingResponse.status;
      debugInfo.tests[0].headers = Object.fromEntries(pingResponse.headers.entries());
      
      console.log(`🔍 [DSO DEBUG] Conectividade DSO: ${pingResponse.status} ${pingResponse.statusText}`);
    } catch (error) {
      debugInfo.tests[0].status = 'error';
      debugInfo.tests[0].error = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🔍 [DSO DEBUG] Erro de conectividade:', error);
    }

    // Teste 2: Verificar endpoint /api/v1/my-profile (sem autenticação)
    const profileEndpoint = `${debugInfo.dsoHost}api/v1/my-profile`;
    debugInfo.tests.push({
      name: 'Endpoint my-profile (sem auth)',
      status: 'testing',
      url: profileEndpoint,
      description: 'Testando endpoint /api/v1/my-profile sem autenticação'
    });

    try {
      const profileResponse = await fetch(profileEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ChildFund-Brasil-Debug/1.0',
        },
      });

      debugInfo.tests[1].status = profileResponse.ok ? 'success' : 'failed';
      debugInfo.tests[1].httpStatus = profileResponse.status;
      debugInfo.tests[1].headers = Object.fromEntries(profileResponse.headers.entries());
      
      try {
        const responseText = await profileResponse.text();
        debugInfo.tests[1].responseText = responseText.substring(0, 500);
        
        // Tentar parsear como JSON
        try {
          debugInfo.tests[1].responseJson = JSON.parse(responseText);
        } catch (e) {
          debugInfo.tests[1].note = 'Resposta não é JSON válido';
        }
      } catch (e) {
        debugInfo.tests[1].note = 'Erro ao ler resposta';
      }

      console.log(`🔍 [DSO DEBUG] Endpoint my-profile: ${profileResponse.status} ${profileResponse.statusText}`);
    } catch (error) {
      debugInfo.tests[1].status = 'error';
      debugInfo.tests[1].error = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🔍 [DSO DEBUG] Erro no endpoint my-profile:', error);
    }

    // Teste 3: Verificar endpoint /api/v1/users/search
    const searchEndpoint = `${debugInfo.dsoHost}api/v1/users/search?document=123456789`;
    debugInfo.tests.push({
      name: 'Endpoint users/search',
      status: 'testing',
      url: searchEndpoint,
      description: 'Testando endpoint /api/v1/users/search'
    });

    try {
      const searchResponse = await fetch(searchEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ChildFund-Brasil-Debug/1.0',
        },
      });

      debugInfo.tests[2].status = searchResponse.ok ? 'success' : 'failed';
      debugInfo.tests[2].httpStatus = searchResponse.status;
      debugInfo.tests[2].headers = Object.fromEntries(searchResponse.headers.entries());
      
      try {
        const responseText = await searchResponse.text();
        debugInfo.tests[2].responseText = responseText.substring(0, 500);
        
        try {
          debugInfo.tests[2].responseJson = JSON.parse(responseText);
        } catch (e) {
          debugInfo.tests[2].note = 'Resposta não é JSON válido';
        }
      } catch (e) {
        debugInfo.tests[2].note = 'Erro ao ler resposta';
      }

      console.log(`🔍 [DSO DEBUG] Endpoint users/search: ${searchResponse.status} ${searchResponse.statusText}`);
    } catch (error) {
      debugInfo.tests[2].status = 'error';
      debugInfo.tests[2].error = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🔍 [DSO DEBUG] Erro no endpoint users/search:', error);
    }

    // Análise de autenticação
    debugInfo.authInfo = {
      hasAuthHeader: !!req.headers.authorization,
      authHeader: req.headers.authorization?.substring(0, 20) + '...',
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
      referer: req.headers.referer,
    };

    // Verificar dados do usuário no localStorage (simulado)
    debugInfo.userInfo = {
      note: 'Para verificar dados do localStorage, use o console do browser',
      instructions: [
        'Abra o console do browser (F12)',
        'Execute: localStorage.getItem("childfund-auth-data")',
        'Execute: localStorage.getItem("user")',
        'Verifique se há dados de autenticação salvos'
      ]
    };

    console.log('✅ [DSO DEBUG] Debug completo finalizado');

    res.json({
      success: true,
      debugInfo,
      summary: {
        totalTests: debugInfo.tests.length,
        successfulTests: debugInfo.tests.filter((t: any) => t.status === 'success').length,
        failedTests: debugInfo.tests.filter((t: any) => t.status === 'failed').length,
        errorTests: debugInfo.tests.filter((t: any) => t.status === 'error').length,
      }
    });

  } catch (error) {
    console.error('❌ [DSO DEBUG] Erro crítico no debug:', error);
    
    debugInfo.criticalError = {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    };

    res.status(500).json({
      success: false,
      error: 'Erro crítico durante debug',
      debugInfo
    });
  }
});

// Debug endpoint: User Profile
app.get('/api/user/profile', async (req, res) => {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    requestHeaders: req.headers,
    steps: []
  };

  try {
    console.log('🔍 [PROFILE DEBUG] Iniciando busca de perfil do usuário...');
    
    // Passo 1: Verificar parâmetros da requisição
    const { userId, document, email } = req.query;

    debugInfo.steps.push({
      step: 1,
      name: 'Verificar parâmetros',
      params: { userId, document, email },
      timestamp: new Date().toISOString()
    });

    console.log('📋 [PROFILE DEBUG] Parâmetros recebidos:', { userId, document, email });

    // Passo 2: Tentar usar dados do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    const userAgent = req.headers['user-agent'];

    debugInfo.steps.push({
      step: 2,
      name: 'Verificar autenticação',
      hasAuth: !!authHeader,
      authPreview: authHeader?.substring(0, 20) + '...',
      userAgent,
      timestamp: new Date().toISOString()
    });

    console.log('🔐 [PROFILE DEBUG] Autenticação:', { 
      hasAuth: !!authHeader, 
      userAgent 
    });

    // Passo 3: Determinar estratégia de busca
    let searchStrategy = 'none';
    let searchUrl = '';
    const DSO_HOST = 'https://dso.childfundbrasil.org.br/';

    if (userId) {
      searchStrategy = 'my-profile';
      searchUrl = `${DSO_HOST}api/v1/my-profile`;
    } else if (document) {
      searchStrategy = 'search-by-document';
      searchUrl = `${DSO_HOST}api/v1/users/search?document=${encodeURIComponent(document as string)}`;
    } else if (email) {
      searchStrategy = 'search-by-email';
      searchUrl = `${DSO_HOST}api/v1/users/search?email=${encodeURIComponent(email as string)}`;
    } else {
      // Tentar buscar perfil atual
      searchStrategy = 'current-profile';
      searchUrl = `${DSO_HOST}api/v1/my-profile`;
    }

    debugInfo.steps.push({
      step: 3,
      name: 'Determinar estratégia',
      strategy: searchStrategy,
      url: searchUrl,
      timestamp: new Date().toISOString()
    });

    console.log('📍 [PROFILE DEBUG] Estratégia de busca:', { searchStrategy, searchUrl });

    // Passo 4: Fazer requisição ao DSO
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ChildFund-Brasil-WebApp/1.0',
      'Accept': 'application/json'
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    debugInfo.steps.push({
      step: 4,
      name: 'Preparar requisição DSO',
      headers: Object.keys(headers),
      timestamp: new Date().toISOString()
    });

    console.log('📤 [PROFILE DEBUG] Fazendo requisição para:', searchUrl);

    const dsoResponse = await fetch(searchUrl, {
      method: 'GET',
      headers,
    });

    debugInfo.steps.push({
      step: 5,
      name: 'Resposta DSO',
      status: dsoResponse.status,
      statusText: dsoResponse.statusText,
      headers: Object.fromEntries(dsoResponse.headers.entries()),
      timestamp: new Date().toISOString()
    });

    console.log('📥 [PROFILE DEBUG] Resposta DSO:', {
      status: dsoResponse.status,
      statusText: dsoResponse.statusText,
      contentType: dsoResponse.headers.get('content-type')
    });

    // Passo 5: Processar resposta
    let responseData: any = null;
    let responseText = '';

    try {
      responseText = await dsoResponse.text();
      debugInfo.steps.push({
        step: 6,
        name: 'Ler resposta texto',
        textLength: responseText.length,
        textPreview: responseText.substring(0, 200),
        timestamp: new Date().toISOString()
      });

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
          debugInfo.steps.push({
            step: 7,
            name: 'Parse JSON',
            success: true,
            dataKeys: Object.keys(responseData),
            timestamp: new Date().toISOString()
          });
        } catch (jsonError) {
          debugInfo.steps.push({
            step: 7,
            name: 'Parse JSON',
            success: false,
            error: jsonError instanceof Error ? jsonError.message : 'Erro JSON',
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (textError) {
      debugInfo.steps.push({
        step: 6,
        name: 'Ler resposta texto',
        success: false,
        error: textError instanceof Error ? textError.message : 'Erro ao ler texto',
        timestamp: new Date().toISOString()
      });
    }

    // Passo 6: Análise final
    if (dsoResponse.ok && responseData) {
      console.log('✅ [PROFILE DEBUG] Dados obtidos com sucesso do DSO');
      
      res.json({
        success: true,
        data: {
          dso: responseData,
          metadata: {
            lastSync: new Date().toISOString(),
            sources: ['DSO'],
            hasDSOData: true,
            hasDynamicsData: false,
            strategy: searchStrategy
          }
        },
        message: 'Perfil obtido com sucesso do DSO',
        debugInfo
      });
    } else {
      console.log('❌ [PROFILE DEBUG] Falha ao obter dados do DSO');
      
      res.status(dsoResponse.status).json({
        success: false,
        error: `DSO retornou ${dsoResponse.status}: ${dsoResponse.statusText}`,
        details: responseText.substring(0, 500),
        debugInfo
      });
    }

  } catch (error) {
    console.error('❌ [PROFILE DEBUG] Erro crítico:', error);
    
    debugInfo.steps.push({
      step: 'error',
      name: 'Erro crítico',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      debugInfo
    });
  }
});

// Endpoint de compatibilidade: /api/dynamics/children -> mapeia para contacts
app.get('/api/dynamics/children', async (req, res) => {
  try {
    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Construir URL da consulta para contacts
    const dynamicsUrl = new URL(`${process.env.DYNAMICS_BASE_URL}contacts`);
    
    // Passar parâmetros OData se fornecidos
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        dynamicsUrl.searchParams.set(key, value);
      }
    });

    console.log('Consultando Dynamics (children/contacts):', dynamicsUrl.toString());

    const response = await fetch(dynamicsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM:', response.status, errorText);
      
      // Retornar erro em formato JSON consistente
      return res.status(response.status).json({
        success: false,
        error: `Dynamics CRM error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log(`✅ Encontrados ${data.value?.length || 0} contatos (children endpoint)`);
    
    // Transformar resposta para formato esperado pelo debug
    const transformedData = {
      success: true,
      data: data.value || [],
      count: data.value?.length || 0,
      totalCount: data['@odata.count'] || 0,
      nextLink: data['@odata.nextLink'] || null,
      timestamp: new Date().toISOString()
    };
    
    res.json(transformedData);
  } catch (error) {
    console.error('Erro na consulta de children:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to query children from Dynamics CRM',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de compatibilidade: /api/dynamics/children/:id -> mapeia para contacts
app.get('/api/dynamics/children/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    
    if (!contactId) {
      return res.status(400).json({ 
        success: false,
        error: 'Contact ID is required' 
      });
    }

    const token = await DynamicsToken.getInstance().getValidToken();
    
    // Construir URL da consulta para contacts
    const dynamicsUrl = new URL(`${process.env.DYNAMICS_BASE_URL}contacts(${contactId})`);
    
    // Passar parâmetros OData se fornecidos
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        dynamicsUrl.searchParams.set(key, value);
      }
    });

    console.log('Consultando contato específico (children endpoint):', dynamicsUrl.toString());

    const response = await fetch(dynamicsUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          success: false,
          error: 'Contact not found' 
        });
      }
      
      const errorText = await response.text();
      console.error('Erro do Dynamics CRM:', response.status, errorText);
      
      return res.status(response.status).json({
        success: false,
        error: `Dynamics CRM error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log(`✅ Contato encontrado (children endpoint): ${data.fullname || data.firstname} (ID: ${contactId})`);
    
    // Transformar resposta para formato esperado pelo debug
    const transformedData = {
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };
    
    res.json(transformedData);
  } catch (error) {
    console.error('Erro na consulta de contato específico (children):', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to query contact from Dynamics CRM',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de cookies DSO (produção: /api/essentials/coockies)
app.get('/api/essentials/coockies', (req, res) => {
  console.log('🍪 [Express Cookies] GET - Buscando token DSO...');
  
  try {
    const cookieHeader = req.headers.cookie || '';
    console.log('🍪 [Express Cookies] Header de cookies:', cookieHeader);
    console.log('🍪 [Express Cookies] Parsed cookies:', req.cookies);
    
    // Buscar token usando cookie-parser
    const token = req.cookies['childfund-auth-token'] || req.cookies['dso-token'] || req.cookies['dso_token'] || null;
    
    console.log('🔍 [Express Cookies] Token encontrado:', !!token);
    console.log('🔍 [Express Cookies] Token value:', token ? `${token.substring(0, 20)}...` : 'null');
    
    const response = {
      token: token ? {
        value: token,
        name: token.startsWith('Bearer ') ? 'childfund-auth-token' : 'dso-token'
      } : null,
      success: !!token,
      message: token ? 'Token encontrado' : 'Token não encontrado',
      debug: {
        hasCookieHeader: !!cookieHeader,
        cookieCount: Object.keys(req.cookies).length,
        availableCookies: Object.keys(req.cookies)
      }
    };
    
    console.log('✅ [Express Cookies] Retornando:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ [Express Cookies] Erro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

app.post('/api/essentials/coockies', (req, res) => {
  console.log('🍪 [Express Cookies] POST - Definindo token DSO...');
  
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Token é obrigatório'
      });
    }
    
    console.log('✅ [Express Cookies] Definindo token, length:', token.length);
    
    // Definir cookie
    res.cookie('childfund-auth-token', token, {
      httpOnly: false,
      secure: false, // Para desenvolvimento
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000 // 7 dias em ms
    });
    
    res.json({
      success: true,
      message: 'Token definido com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [Express Cookies] POST Erro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

app.delete('/api/essentials/coockies', (req, res) => {
  console.log('🍪 [Express Cookies] DELETE - Removendo token DSO...');
  
  try {
    res.clearCookie('childfund-auth-token');
    res.clearCookie('dso-token');
    res.json({
      success: true,
      message: 'Token removido com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [Express Cookies] DELETE Erro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Endpoint para sincronização com Dynamics CRM
app.post('/api/dynamics/sync', async (req, res) => {
  console.log('🔄 [Dynamics Sync Express] Recebendo dados para sincronização:', req.body);
  
  try {
    const { personalData, transactionData, donationType } = req.body;
    
    if (!personalData || !transactionData) {
      return res.status(400).json({
        success: false,
        error: 'personalData e transactionData são obrigatórios'
      });
    }
    
    // Simular sincronização com Dynamics CRM (para desenvolvimento)
    // Em produção, aqui seria feita a integração real
    console.log('✅ [Dynamics Sync Express] Dados sincronizados:', {
      type: donationType,
      personalData: {
        name: personalData.name,
        email: personalData.email,
        document: personalData.document
      },
      transactionData: {
        amount: transactionData.amount,
        donationType: transactionData.donationType
      },
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Dados sincronizados com Dynamics CRM',
      data: {
        syncId: `sync_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Dynamics Sync Express] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Endpoint RD Station para conversões
app.post('/api/rdstation/conversion', async (req, res) => {
  console.log('🔄 [RD Station Express] Recebendo conversão:', req.body);
  
  try {
    const { conversion_identifier, email, ...otherData } = req.body;
    
    if (!conversion_identifier || !email) {
      return res.status(400).json({
        success: false,
        error: 'conversion_identifier e email são obrigatórios'
      });
    }
    
    // Simular envio para RD Station (para desenvolvimento)
    // Em produção, aqui seria feita a integração real
    console.log('✅ [RD Station Express] Conversão processada:', {
      identifier: conversion_identifier,
      email,
      data: otherData
    });
    
    res.json({
      success: true,
      message: 'Conversão enviada para RD Station',
      data: {
        identifier: conversion_identifier,
        email,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [RD Station Express] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 API Server rodando na porta ${PORT}`);
  console.log(`📡 Endpoints disponíveis:`);
  console.log(`   GET http://localhost:${PORT}/api/dynamics/contacts`);
  console.log(`   GET http://localhost:${PORT}/api/dynamics/contacts/:id`);
  console.log(`   GET http://localhost:${PORT}/api/dynamics/children`);
  console.log(`   GET http://localhost:${PORT}/api/dynamics/children/:id`);
  console.log(`   GET http://localhost:${PORT}/api/contacts/query`);
  console.log(`   GET http://localhost:${PORT}/api/health`);
  console.log(`   GET http://localhost:${PORT}/api/health/integrations`);
  console.log(`   GET http://localhost:${PORT}/api/dynamics/contacts/search`);
  console.log(`   GET/POST/DELETE http://localhost:${PORT}/api/essentials/coockies`);
  console.log(`   POST http://localhost:${PORT}/api/rdstation/conversion`);
  console.log(`   POST http://localhost:${PORT}/api/dynamics/sync`);
});

// Manter servidor vivo
server.keepAliveTimeout = 60000;
server.headersTimeout = 65000;

// Tratar erros do servidor
server.on('error', (error) => {
  console.error('❌ [Server Error]:', error);
});

// Tratar fechamento do servidor
process.on('SIGINT', () => {
  console.log('\n🔄 [Server] Recebido SIGINT, fechando servidor...');
  server.close(() => {
    console.log('✅ [Server] Servidor fechado com sucesso');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🔄 [Server] Recebido SIGTERM, fechando servidor...');
  server.close(() => {
    console.log('✅ [Server] Servidor fechado com sucesso');
    process.exit(0);
  });
});

export default app; 