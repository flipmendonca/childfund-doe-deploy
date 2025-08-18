import { DynamicsToken } from '@/lib/dynamics/DynamicsToken'

export interface DynamicsContactData {
  // Dados pessoais
  fullname: string
  emailaddress1: string
  telephone1: string
  birthdate: string
  gendercode: number
  
  // Endereço
  address1_line1: string
  address1_line2?: string
  address1_line3?: string
  address1_city: string
  address1_stateorprovince: string
  address1_postalcode: string
  address1_country: string
  
  // Campos customizados ChildFund
  chf_cpf: string
  chf_donation_type: string
  chf_sponsor_value?: number
  chf_payment_method: string
  chf_recurring: boolean
  chf_due_date?: number
  chf_utm_source?: string
  chf_utm_medium?: string
  chf_utm_campaign?: string
  chf_utm_content?: string
  chf_utm_term?: string
  chf_worker?: string
}

export interface DynamicsSponsorshipData {
  chf_name: string
  chf_sponsor_contact: string
  chf_child_contact: string
  chf_monthly_value: number
  chf_start_date: string
  chf_status: string
  chf_payment_method: string
  chf_due_date: number
  chf_transaction_id: string
}

export interface DynamicsDonationData {
  chf_name: string
  chf_donor_contact: string
  chf_amount: number
  chf_type: string
  chf_frequency?: string
  chf_start_date: string
  chf_status: string
  chf_payment_method: string
  chf_due_date?: number
  chf_child_id?: string
  chf_transaction_id: string
}

export interface DynamicsTransactionData {
  chf_name: string
  chf_donor_contact: string
  chf_amount: number
  chf_type: string
  chf_transaction_date: string
  chf_status: string
  chf_payment_method: string
  chf_child_id?: string
  chf_recurring: boolean
  chf_transaction_id: string
}

export class DynamicsSyncService {
  // 🔧 CORREÇÃO: Remover referência a process.env que não existe no cliente
  private static readonly DYNAMICS_BASE_URL = 'https://childfundbrasildev.crm2.dynamics.com/'
  
  /**
   * Sincroniza dados de contato após pagamento bem-sucedido
   */
  static async syncContactAfterPayment(
    personalData: any,
    donationData: any,
    utmData: any = {},
    transactionId: string
  ): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      console.log('🔄 [Dynamics Sync] Iniciando sincronização de contato...')
      
      // 🔧 CORREÇÃO: Chamar endpoint em vez de usar token diretamente
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/dynamics/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalData,
          transactionData: donationData,
          donationType: donationData.donationType
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [Dynamics Sync] Sincronização bem-sucedida:', result);
      
      return { success: true, contactId: result.data?.syncId };
      
    } catch (error) {
      console.error('❌ [Dynamics Sync] Erro na sincronização:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    }
  }
  
  /**
   * Cria registro de apadrinhamento
   */
  private static async createSponsorshipRecord(
    contactId: string,
    donationData: any,
    transactionId: string,
    accessToken: string
  ): Promise<void> {
    if (!donationData.childId) return
    
    const sponsorshipData: DynamicsSponsorshipData = {
      chf_name: `Apadrinhamento - ${donationData.childId}`,
      chf_sponsor_contact: contactId,
      chf_child_contact: donationData.childId,
      chf_monthly_value: donationData.amount,
      chf_start_date: new Date().toISOString().split('T')[0],
      chf_status: 'Active',
      chf_payment_method: donationData.paymentMethod,
      chf_due_date: donationData.pay_duo_date ? parseInt(donationData.pay_duo_date) : 5,
      chf_transaction_id: transactionId
    }
    
    console.log('🔄 [Dynamics Sync] Criando registro de apadrinhamento...')
    
    const response = await fetch(`${this.DYNAMICS_BASE_URL}api/data/v9.2/chf_sponsorships`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(sponsorshipData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Dynamics Sync] Erro ao criar apadrinhamento:', response.status, errorText)
      throw new Error(`Erro ao criar apadrinhamento: ${response.status} ${response.statusText}`)
    }
    
    console.log('✅ [Dynamics Sync] Apadrinhamento criado com sucesso')
  }
  
  /**
   * Cria registro de doação recorrente
   */
  private static async createRecurringDonationRecord(
    contactId: string,
    donationData: any,
    transactionId: string,
    accessToken: string
  ): Promise<void> {
    const donationRecord: DynamicsDonationData = {
      chf_name: 'Doação Recorrente Mensal',
      chf_donor_contact: contactId,
      chf_amount: donationData.amount,
      chf_type: 'recurring',
      chf_frequency: 'monthly',
      chf_start_date: new Date().toISOString().split('T')[0],
      chf_status: 'Active',
      chf_payment_method: donationData.paymentMethod,
      chf_due_date: donationData.pay_duo_date ? parseInt(donationData.pay_duo_date) : 5,
      chf_child_id: donationData.childId || null,
      chf_transaction_id: transactionId
    }
    
    console.log('🔄 [Dynamics Sync] Criando registro de doação recorrente...')
    
    const response = await fetch(`${this.DYNAMICS_BASE_URL}api/data/v9.2/chf_donations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(donationRecord)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Dynamics Sync] Erro ao criar doação recorrente:', response.status, errorText)
      throw new Error(`Erro ao criar doação recorrente: ${response.status} ${response.statusText}`)
    }
    
    console.log('✅ [Dynamics Sync] Doação recorrente criada com sucesso')
  }
  
  /**
   * Cria registro de transação única
   */
  private static async createSingleTransactionRecord(
    contactId: string,
    donationData: any,
    transactionId: string,
    accessToken: string
  ): Promise<void> {
    const transactionRecord: DynamicsTransactionData = {
      chf_name: 'Doação Única',
      chf_donor_contact: contactId,
      chf_amount: donationData.amount,
      chf_type: 'single',
      chf_transaction_date: new Date().toISOString().split('T')[0],
      chf_status: 'Completed',
      chf_payment_method: donationData.paymentMethod,
      chf_child_id: donationData.childId || null,
      chf_recurring: false,
      chf_transaction_id: transactionId
    }
    
    console.log('🔄 [Dynamics Sync] Criando registro de transação única...')
    
    const response = await fetch(`${this.DYNAMICS_BASE_URL}api/data/v9.2/chf_transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(transactionRecord)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Dynamics Sync] Erro ao criar transação única:', response.status, errorText)
      throw new Error(`Erro ao criar transação única: ${response.status} ${response.statusText}`)
    }
    
    console.log('✅ [Dynamics Sync] Transação única criada com sucesso')
  }
}
