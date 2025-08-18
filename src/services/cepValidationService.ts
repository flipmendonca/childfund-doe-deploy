/**
 * Serviço de validação de CEP usando ViaCEP API
 * Integrado com o sistema DSO para validação de endereços
 */

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface AddressValidationResult {
  isValid: boolean;
  data?: ViaCEPResponse;
  error?: string;
  suggestions?: {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
}

export class CEPValidationService {
  private static readonly VIACEP_URL = 'https://viacep.com.br/ws';
  
  /**
   * Valida CEP usando ViaCEP API
   */
  static async validateCEP(cep: string): Promise<AddressValidationResult> {
    try {
      // Limpar CEP (remover pontos, traços, espaços)
      const cleanCEP = cep.replace(/\D/g, '');
      
      // Verificar se CEP tem 8 dígitos
      if (cleanCEP.length !== 8) {
        return {
          isValid: false,
          error: 'CEP deve conter 8 dígitos'
        };
      }
      
      // Formatar CEP para consulta
      const formattedCEP = cleanCEP.replace(/^(\d{5})(\d{3})$/, '$1-$2');
      
      console.log(`🔍 [CEP Validation] Consultando CEP: ${formattedCEP}`);
      
      const response = await fetch(`${this.VIACEP_URL}/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data: ViaCEPResponse = await response.json();
      
      // Verificar se CEP existe
      if (data.erro) {
        return {
          isValid: false,
          error: 'CEP não encontrado'
        };
      }
      
      console.log(`✅ [CEP Validation] CEP válido:`, data);
      
      return {
        isValid: true,
        data: data
      };
      
    } catch (error) {
      console.error('❌ [CEP Validation] Erro na validação:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Compara endereço DSO com dados do ViaCEP
   */
  static compareWithDSOAddress(dsoAddress: any, viaCEPData: ViaCEPResponse): AddressValidationResult {
    const suggestions: any = {};
    let hasDiscrepancies = false;
    
    // Comparar logradouro
    if (dsoAddress.street && viaCEPData.logradouro) {
      if (dsoAddress.street.toLowerCase() !== viaCEPData.logradouro.toLowerCase()) {
        suggestions.street = viaCEPData.logradouro;
        hasDiscrepancies = true;
      }
    }
    
    // Comparar bairro
    if (dsoAddress.neighborhood && viaCEPData.bairro) {
      if (dsoAddress.neighborhood.toLowerCase() !== viaCEPData.bairro.toLowerCase()) {
        suggestions.neighborhood = viaCEPData.bairro;
        hasDiscrepancies = true;
      }
    }
    
    // Comparar cidade
    if (dsoAddress.city && viaCEPData.localidade) {
      if (dsoAddress.city.toLowerCase() !== viaCEPData.localidade.toLowerCase()) {
        suggestions.city = viaCEPData.localidade;
        hasDiscrepancies = true;
      }
    }
    
    // Comparar estado
    if (dsoAddress.state && viaCEPData.uf) {
      if (dsoAddress.state.toLowerCase() !== viaCEPData.uf.toLowerCase()) {
        suggestions.state = viaCEPData.uf;
        hasDiscrepancies = true;
      }
    }
    
    return {
      isValid: !hasDiscrepancies,
      data: viaCEPData,
      suggestions: hasDiscrepancies ? suggestions : undefined
    };
  }
  
  /**
   * Formata CEP para exibição
   */
  static formatCEP(cep: string): string {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }
  
  /**
   * Valida formato de CEP
   */
  static isValidCEPFormat(cep: string): boolean {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
  }
}

// Função para uso direto no console
export const validateCEP = (cep: string) => {
  return CEPValidationService.validateCEP(cep);
};

// Função para comparar com dados DSO
export const compareWithDSO = (dsoAddress: any, cep: string) => {
  return CEPValidationService.validateCEP(cep).then(result => {
    if (result.isValid && result.data) {
      return CEPValidationService.compareWithDSOAddress(dsoAddress, result.data);
    }
    return result;
  });
}; 