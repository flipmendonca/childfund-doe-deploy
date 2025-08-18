import { unmaskCEP } from '@/utils/formatters';

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressData {
  postalCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

class ViaCEPService {
  private static readonly BASE_URL = 'https://viacep.com.br/ws';
  private static readonly TIMEOUT = 5000; // 5 segundos

  /**
   * Busca endereço por CEP
   * @param cep CEP formatado ou não formatado
   * @returns Promise com dados do endereço ou null se não encontrado
   */
  static async getAddressByCEP(cep: string): Promise<AddressData | null> {
    const cleanCEP = unmaskCEP(cep);

    // Validar formato do CEP
    if (!this.isValidCEP(cleanCEP)) {
      throw new Error('CEP inválido. Use o formato 00000000 ou 00000-000');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(`${this.BASE_URL}/${cleanCEP}/json/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: ViaCEPResponse = await response.json();

      // Verificar se houve erro na resposta da API
      if (data.erro) {
        return null;
      }

      // Transformar resposta em formato padrão
      return this.transformViaCEPResponse(data);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A consulta demorou muito para responder');
      }
      
      console.error('Erro ao buscar CEP:', error);
      throw new Error('Erro ao consultar CEP. Verifique sua conexão e tente novamente.');
    }
  }

  /**
   * Busca múltiplos endereços por uma lista de CEPs
   * @param ceps Array de CEPs
   * @returns Promise com mapa de CEP -> AddressData
   */
  static async getMultipleAddresses(ceps: string[]): Promise<Map<string, AddressData | null>> {
    const results = new Map<string, AddressData | null>();
    
    // Processar em paralelo com limite de 5 requisições simultâneas
    const chunks = this.chunkArray(ceps, 5);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (cep) => {
        try {
          const address = await this.getAddressByCEP(cep);
          return { cep, address };
        } catch (error) {
          console.warn(`Erro ao buscar CEP ${cep}:`, error);
          return { cep, address: null };
        }
      });

      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ cep, address }) => {
        results.set(cep, address);
      });
    }

    return results;
  }

  /**
   * Busca endereços por cidade/UF/logradouro (busca reversa)
   * @param state UF (2 letras)
   * @param city Nome da cidade
   * @param street Nome da rua (mínimo 3 caracteres)
   * @returns Promise com array de endereços encontrados
   */
  static async searchAddress(state: string, city: string, street: string): Promise<AddressData[]> {
    if (street.length < 3) {
      throw new Error('O nome da rua deve ter pelo menos 3 caracteres');
    }

    if (state.length !== 2) {
      throw new Error('O estado deve ter 2 caracteres (UF)');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const encodedState = encodeURIComponent(state);
      const encodedCity = encodeURIComponent(city);
      const encodedStreet = encodeURIComponent(street);

      const response = await fetch(
        `${this.BASE_URL}/${encodedState}/${encodedCity}/${encodedStreet}/json/`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: ViaCEPResponse[] = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }

      // Transformar todas as respostas
      return data.map(item => this.transformViaCEPResponse(item));

    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A consulta demorou muito para responder');
      }
      
      console.error('Erro ao buscar endereços:', error);
      throw new Error('Erro ao consultar endereços. Verifique sua conexão e tente novamente.');
    }
  }

  /**
   * Valida se um CEP tem formato correto
   * @param cep CEP sem formatação
   * @returns true se válido
   */
  private static isValidCEP(cep: string): boolean {
    return /^\d{8}$/.test(cep);
  }

  /**
   * Transforma resposta da API ViaCEP no formato padrão
   * @param data Resposta da API ViaCEP
   * @returns Dados do endereço no formato padrão
   */
  private static transformViaCEPResponse(data: ViaCEPResponse): AddressData {
    return {
      postalCode: data.cep.replace('-', ''),
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      complement: data.complemento || ''
    };
  }

  /**
   * Divide array em chunks menores
   * @param array Array para dividir
   * @param size Tamanho de cada chunk
   * @returns Array de chunks
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Cache simples para evitar requisições desnecessárias
   */
  private static cache = new Map<string, { data: AddressData | null; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Busca endereço com cache
   * @param cep CEP para buscar
   * @returns Promise com dados do endereço
   */
  static async getAddressWithCache(cep: string): Promise<AddressData | null> {
    const cleanCEP = unmaskCEP(cep);
    const now = Date.now();
    
    // Verificar cache
    const cached = this.cache.get(cleanCEP);
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    // Buscar novo dado
    try {
      const address = await this.getAddressByCEP(cleanCEP);
      
      // Salvar no cache
      this.cache.set(cleanCEP, { data: address, timestamp: now });
      
      return address;
    } catch (error) {
      // Em caso de erro, retornar cache expirado se existir
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Limpa o cache
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

export default ViaCEPService;