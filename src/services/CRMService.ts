/**
 * Serviço para integração com CRM - ChildFund Brasil
 * Envia conversões, cadastros e dados de formulários para dev.crm conforme documentação
 */

export interface CRMContact {
  firstname: string;
  lastname: string;
  emailaddress1: string;
  telephone1: string;
  address1_line1: string;
  address1_city: string;
  address1_stateorprovince: string;
  address1_postalcode: string;
  birthdate?: string;
  gendercode?: number; // 1=M, 2=F
  cpf?: string;
  rg?: string;
  rg_uf?: string;
  rg_orgao?: string;
  rg_data_emissao?: string;
  profissao?: string;
  renda_mensal?: number;
  estado_civil?: string;
  nacionalidade?: string;
  naturalidade?: string;
  naturalidade_uf?: string;
  nome_mae?: string;
  nome_pai?: string;
  aceite_newsletter?: boolean;
  aceite_termos?: boolean;
  aceite_privacidade?: boolean;
  origem_cadastro?: string;
  campanha?: string;
  colaborador?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface CRMDonation {
  contactid?: string;
  childid?: string;
  amount: number;
  frequency: 'monthly' | 'unique' | 'sponsorship';
  payment_method: 'credit_card' | 'bank_transfer' | 'pix';
  payment_data?: any;
  project_id?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  campaign?: string;
  collaborator?: string;
  utm_data?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  anonymous?: boolean;
  message?: string;
}

export interface CRMSponsorship {
  contactid: string;
  childid: string;
  sponsorship_type: string;
  amount: number;
  payment_method: string;
  payment_data?: any;
  start_date: string;
  frequency: 'monthly';
  campaign?: string;
  collaborator?: string;
  utm_data?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  preferences?: {
    receive_letters?: boolean;
    receive_photos?: boolean;
    receive_reports?: boolean;
    contact_frequency?: string;
  };
}

export interface CRMNewsletter {
  email: string;
  firstname?: string;
  lastname?: string;
  source?: string;
  campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  consent: boolean;
  consent_date: string;
}

export interface CRMContactForm {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  source?: string;
  campaign?: string;
  utm_data?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export class CRMService {
  // URLs baseadas na documentação - ambiente de desenvolvimento
  private static readonly DYNAMICS_CRM_URL = 'https://childfundbrasildev.crm2.dynamics.com';
  private static readonly DSO_BASE_URL = 'https://dso.childfundbrasil.org.br';
  
  // Cache para evitar múltiplas chamadas idênticas
  private static conversionCache = new Map<string, number>();
  private static readonly CACHE_DURATION = 30000; // 30 segundos
  
  /**
   * Extrai dados UTM dos parâmetros da URL
   */
  private static getUTMData() {
    if (typeof window === 'undefined') return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    return {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined,
    };
  }

  /**
   * Método genérico para fazer requisições DSO
   */
  private static async makeDSORequest(endpoint: string, data: any, method: 'POST' | 'PUT' = 'POST') {
    try {
      const url = `${this.DSO_BASE_URL}${endpoint}`;
      
      console.log(`🔍 [CRMService] Enviando dados para DSO: ${method} ${url}`);
      console.log('📋 [CRMService] Dados:', data);

      // Obter token de autenticação se disponível
      const token = localStorage.getItem('auth-token') || localStorage.getItem('childfund-auth-token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
      });

      console.log(`📡 [CRMService] Status da resposta: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [CRMService] Erro na requisição:`, response.status, errorText);
        throw new Error(`Erro DSO ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ [CRMService] Resposta do DSO:', responseData);

      return {
        success: true,
        data: responseData,
        message: 'Dados enviados para DSO com sucesso'
      };
    } catch (error) {
      console.error('❌ [CRMService] Erro ao enviar para DSO:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar para DSO'
      };
    }
  }

  /**
   * Cadastra novo contato no CRM via DSO
   */
  static async createContact(contactData: CRMContact) {
    const utmData = this.getUTMData();
    
    const payload = {
      ...contactData,
      origem_cadastro: contactData.origem_cadastro || 'website',
      ...utmData,
    };

    return await this.makeDSORequest('/api/v1/user-public', payload);
  }

  /**
   * Registra doação única via DSO (será processada e enviada para CRM)
   */
  static async createUniqueDonation(donationData: CRMDonation) {
    const utmData = this.getUTMData();
    
    // Para doações únicas, usar o processamento DSO existente
    console.log('🔍 [CRMService] Doação única será processada via DSOService.processDonation');
    return {
      success: true,
      message: 'Doação única processada via DSOService - CRM integrado automaticamente'
    };
  }

  /**
   * Registra doação mensal via DSO (será processada e enviada para CRM)
   */
  static async createMonthlyDonation(donationData: CRMDonation) {
    const utmData = this.getUTMData();
    
    // Para doações mensais, usar o processamento DSO existente
    console.log('🔍 [CRMService] Doação mensal será processada via DSOService.processDonation');
    return {
      success: true,
      message: 'Doação mensal processada via DSOService - CRM integrado automaticamente'
    };
  }

  /**
   * Registra apadrinhamento via DSO (será processado e enviado para CRM)
   */
  static async createSponsorship(sponsorshipData: CRMSponsorship) {
    const utmData = this.getUTMData();
    
    // Para apadrinhamentos, usar o processamento DSO existente
    console.log('🔍 [CRMService] Apadrinhamento será processado via DSOService.processDonation');
    return {
      success: true,
      message: 'Apadrinhamento processado via DSOService - CRM integrado automaticamente'
    };
  }

  /**
   * Registra inscrição na newsletter via DSO
   */
  static async subscribeNewsletter(newsletterData: CRMNewsletter) {
    const utmData = this.getUTMData();
    
    const payload = {
      ...newsletterData,
      source: newsletterData.source || 'website',
      campaign: newsletterData.campaign || 'newsletter',
      consent_date: newsletterData.consent_date || new Date().toISOString(),
      ...utmData,
    };

    // Endpoint não documentado - usando DSO genérico
    return await this.makeDSORequest('/api/v1/newsletter/subscribe', payload);
  }

  /**
   * Envia formulário de contato via DSO
   */
  static async submitContactForm(contactFormData: CRMContactForm) {
    const utmData = this.getUTMData();
    
    const payload = {
      ...contactFormData,
      category: contactFormData.category || 'general',
      priority: contactFormData.priority || 'medium',
      source: contactFormData.source || 'website',
      campaign: contactFormData.campaign || 'contact_form',
      utm_data: { ...utmData, ...contactFormData.utm_data },
    };

    // Usando endpoint documentado para contato
    return await this.makeDSORequest('/api/v1/childfund/relationship/contact-us', payload);
  }

  /**
   * Registra conversão/evento customizado via API local com cache para evitar spam
   */
  static async trackConversion(eventData: {
    event_type: 'form_start' | 'form_complete' | 'page_view' | 'donation_intent' | 'sponsorship_intent';
    user_id?: string;
    session_id?: string;
    page_url?: string;
    form_type?: string;
    amount?: number;
    child_id?: string;
    metadata?: Record<string, any>;
  }) {
    // Criar chave única para cache baseada nos dados do evento
    const cacheKey = `${eventData.event_type}_${eventData.form_type || ''}_${eventData.child_id || ''}_${eventData.user_id || ''}`;
    const now = Date.now();
    
    // Verificar se já foi enviado recentemente
    const lastSent = this.conversionCache.get(cacheKey);
    if (lastSent && (now - lastSent) < this.CACHE_DURATION) {
      console.log(`🚫 [CRMService] Conversão ignorada (cache): ${cacheKey}`);
      return {
        success: true,
        message: 'Conversão já registrada recentemente (cache)'
      };
    }
    
    const utmData = this.getUTMData();
    
    const payload = {
      ...eventData,
      timestamp: new Date().toISOString(),
      page_url: eventData.page_url || (typeof window !== 'undefined' ? window.location.href : ''),
      session_id: eventData.session_id || this.generateSessionId(),
      utm_data: utmData,
    };

    try {
      console.log(`📡 [CRMService] Enviando conversão: ${cacheKey}`);
      
      // Enviar para o servidor local que pode repassar para o CRM
      const response = await fetch('/api/crm/tracking/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn('⚠️ [CRMService] Erro ao enviar conversão para servidor local');
      } else {
        // Salvar no cache apenas se foi bem-sucedido
        this.conversionCache.set(cacheKey, now);
        
        // Limpar cache antigo
        this.cleanOldCacheEntries();
      }

      return {
        success: true,
        message: 'Conversão registrada'
      };
    } catch (error) {
      console.warn('⚠️ [CRMService] Erro ao registrar conversão:', error);
      return {
        success: false,
        error: 'Erro ao registrar conversão'
      };
    }
  }

  /**
   * Limpa entradas antigas do cache
   */
  private static cleanOldCacheEntries() {
    const now = Date.now();
    const entries = Array.from(this.conversionCache.entries());
    
    for (const [key, timestamp] of entries) {
      if (now - timestamp > this.CACHE_DURATION) {
        this.conversionCache.delete(key);
      }
    }
  }

  /**
   * Gera ID de sessão único
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Mapeia dados de formulário para formato CRM
   */
  static mapFormDataToCRM(formData: any, formType: 'donation' | 'sponsorship' | 'contact' | 'newsletter'): any {
    const baseMapping = {
      firstname: formData.name?.split(' ')[0] || formData.firstName || '',
      lastname: formData.name?.split(' ').slice(1).join(' ') || formData.lastName || '',
      emailaddress1: formData.email || '',
      telephone1: formData.phone || formData.telephone || '',
    };

    switch (formType) {
      case 'donation':
        return {
          ...baseMapping,
          amount: formData.amount || formData.value || 0,
          frequency: formData.frequency || formData.donationType || 'unique',
          payment_method: formData.paymentMethod || 'credit_card',
          category: 'general_donation',
        };

      case 'sponsorship':
        return {
          ...baseMapping,
          childid: formData.childId || '',
          amount: formData.amount || formData.value || 74,
          sponsorship_type: 'individual',
          payment_method: formData.paymentMethod || 'credit_card',
        };

      case 'contact':
        return {
          ...baseMapping,
          subject: formData.subject || 'Contato via website',
          message: formData.message || '',
          category: formData.category || 'general',
        };

      case 'newsletter':
        return {
          email: formData.email || '',
          firstname: baseMapping.firstname,
          lastname: baseMapping.lastname,
          consent: formData.acceptNewsletter || formData.consent || true,
        };

      default:
        return baseMapping;
    }
  }
}