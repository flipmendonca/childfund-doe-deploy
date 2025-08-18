export interface DonationEventData {
  transactionId: string;
  donationType: 'sponsorship' | 'donate' | 'recurrent';
  amount: number;
  paymentMethod: string;
  currency?: string;
  childId?: string;
  userId?: string;
}

export interface FormEventData {
  formType: 'sponsorship' | 'donation_single' | 'donation_recurring';
  step: 'started' | 'data_filled' | 'payment_method_selected' | 'submitted' | 'completed';
  paymentMethod?: string;
  amount?: number;
}

export class AnalyticsService {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  
  // Configurações para desenvolvimento (sem chaves reais)
  private static config = {
    gtag: {
      enabled: false, // Será habilitado quando houver chaves reais
      measurementId: 'GA_MEASUREMENT_ID' // Placeholder
    },
    rdStation: {
      enabled: false, // Será habilitado quando houver chaves reais
      publicToken: 'RD_PUBLIC_TOKEN' // Placeholder
    }
  };

  /**
   * Inicializa os serviços de analytics
   */
  static initialize(): void {
    if (this.isDevelopment) {
      console.log('Analytics Service inicializado em modo de desenvolvimento');
      console.log('Eventos serão logados no console, mas não enviados para serviços externos');
    }

    // Inicializar Google Analytics (quando chaves estiverem disponíveis)
    if (this.config.gtag.enabled) {
      this.initializeGoogleAnalytics();
    }

    // Inicializar RD Station (quando chaves estiverem disponíveis)
    if (this.config.rdStation.enabled) {
      this.initializeRDStation();
    }

    // Limpeza periódica de dados antigos
    this.scheduleCleanup();
  }

  /**
   * Tracked doação completada com sucesso
   */
  static trackDonationSuccess(data: DonationEventData): void {
    if (this.isDevelopment) {
      console.group('🎯 Analytics - Doação Concluída');
      console.log('Tipo:', data.donationType);
      console.log('Valor:', `R$ ${data.amount}`);
      console.log('Método:', data.paymentMethod);
      console.log('Transaction ID:', data.transactionId);
      console.groupEnd();
    }

    // Google Analytics 4
    this.trackGoogleAnalytics('purchase', {
      transaction_id: data.transactionId,
      value: data.amount,
      currency: data.currency || 'BRL',
      payment_method: data.paymentMethod,
      donation_type: data.donationType,
      child_id: data.childId || undefined
    });

    // RD Station
    this.trackRDStation('donation_success', {
      conversion_identifier: `${data.donationType}-success`,
      transaction_id: data.transactionId,
      value: data.amount,
      payment_method: data.paymentMethod
    });
  }

  /**
   * Track eventos do formulário de doação
   */
  static trackFormEvent(data: FormEventData): void {
    if (this.isDevelopment) {
      console.log(`📝 Analytics - Formulário ${data.formType}: ${data.step}`);
    }

    // Google Analytics 4
    this.trackGoogleAnalytics('form_interaction', {
      form_type: data.formType,
      form_step: data.step,
      payment_method: data.paymentMethod || undefined,
      value: data.amount || undefined
    });

    // RD Station
    if (data.step === 'submitted') {
      this.trackRDStation('form_submitted', {
        conversion_identifier: `${data.formType}-submitted`,
        form_step: data.step
      });
    }
  }

  /**
   * Track início de apadrinhamento
   */
  static trackSponsorshipStarted(childId: string): void {
    if (this.isDevelopment) {
      console.log(`👶 Analytics - Apadrinhamento iniciado para criança: ${childId}`);
    }

    this.trackGoogleAnalytics('begin_checkout', {
      donation_type: 'sponsorship',
      child_id: childId,
      value: 74 // Valor padrão do apadrinhamento
    });

    this.trackRDStation('sponsorship_started', {
      conversion_identifier: 'sponsorship-started',
      child_id: childId
    });
  }

  /**
   * Track visualização de criança
   */
  static trackChildView(childId: string): void {
    if (this.isDevelopment) {
      console.log(`👀 Analytics - Criança visualizada: ${childId}`);
    }

    this.trackGoogleAnalytics('view_item', {
      item_id: childId,
      item_category: 'child',
      donation_type: 'sponsorship'
    });
  }

  /**
   * Envia evento para Google Analytics
   */
  private static trackGoogleAnalytics(eventName: string, parameters: Record<string, any>): void {
    if (this.config.gtag.enabled && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    } else if (this.isDevelopment) {
      console.log(`🔍 GA4 Event: ${eventName}`, parameters);
    }
  }

  /**
   * Envia evento para RD Station
   */
  private static trackRDStation(eventType: string, data: Record<string, any>): void {
    if (this.config.rdStation.enabled && typeof window !== 'undefined' && window.RdConversion) {
      window.RdConversion('conversion', data);
    } else if (this.isDevelopment) {
      console.log(`📊 RD Station Event: ${eventType}`, data);
    }
  }

  /**
   * Inicializa Google Analytics
   */
  private static initializeGoogleAnalytics(): void {
    if (typeof window === 'undefined') return;

    // Carregar script do Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.gtag.measurementId}`;
    document.head.appendChild(script);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', this.config.gtag.measurementId, {
      page_title: 'ChildFund Brasil',
      page_location: window.location.href
    });
  }

  /**
   * Inicializa RD Station
   */
  private static initializeRDStation(): void {
    if (typeof window === 'undefined') return;

    // Carregar script do RD Station
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js`;
    document.head.appendChild(script);

    // Configurar RD Station
    script.onload = () => {
      if (window.RdConversion) {
        window.RdConversion('init', this.config.rdStation.publicToken);
      }
    };
  }

  /**
   * Agenda limpeza periódica de dados antigos
   */
  private static scheduleCleanup(): void {
    // Executar limpeza a cada 6 horas
    setInterval(() => {
      this.cleanupOldData();
    }, 6 * 60 * 60 * 1000);

    // Executar limpeza inicial
    this.cleanupOldData();
  }

  /**
   * Limpa dados antigos do localStorage
   */
  private static cleanupOldData(): void {
    try {
      // Limpar dados de transações antigas
      const keys = Object.keys(localStorage);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas

      keys.forEach(key => {
        if (key.startsWith('childfund-transaction-')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && (now - data.timestamp > maxAge)) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove itens corrompidos
            localStorage.removeItem(key);
          }
        }
      });

      if (this.isDevelopment) {
        console.log('🧹 Analytics - Limpeza de dados antigos concluída');
      }
    } catch (error) {
      console.error('Erro na limpeza de dados antigos:', error);
    }
  }

  /**
   * Configura chaves de produção (para uso futuro)
   */
  static configureProduction(config: {
    googleAnalyticsMeasurementId?: string;
    rdStationPublicToken?: string;
  }): void {
    if (config.googleAnalyticsMeasurementId) {
      this.config.gtag.measurementId = config.googleAnalyticsMeasurementId;
      this.config.gtag.enabled = true;
    }

    if (config.rdStationPublicToken) {
      this.config.rdStation.publicToken = config.rdStationPublicToken;
      this.config.rdStation.enabled = true;
    }

    // Reinicializar com novas configurações
    if (this.config.gtag.enabled || this.config.rdStation.enabled) {
      this.initialize();
    }
  }
}

// Tipos globais para analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    RdConversion?: (type: string, data: any) => void;
  }
}