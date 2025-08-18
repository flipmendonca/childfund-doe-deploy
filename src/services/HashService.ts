import { DSOService } from './DSOService';

export interface TransactionData {
  transactionId?: string;
  donationType: 'sponsorship' | 'donate' | 'recurrent';
  amount: number;
  paymentMethod: string;
  userId?: string;
  childId?: string;
  timestamp: number;
}

export class HashService {
  private static SECRET_KEY = 'childfund-local-dev-key'; // Chave para desenvolvimento

  /**
   * Gera um hash seguro para validação de transação
   */
  static generateTransactionHash(data: TransactionData): string {
    const payload = {
      ...data,
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2)
    };

    // Em produção, isso seria feito no backend com uma chave secreta real
    const dataString = JSON.stringify(payload);
    const hash = this.simpleHash(dataString + this.SECRET_KEY);
    
    // Salvar dados da transação no localStorage para validação posterior
    this.storeTransactionData(hash, payload);
    
    return hash;
  }

  /**
   * Valida um hash de transação
   */
  static async validateTransactionHash(hash: string): Promise<boolean> {
    try {
      // Em produção, isso seria validado no backend via API
      // const response = await DSOService.validateTransactionHash(hash);
      
      // Para desenvolvimento, validar localmente
      const storedData = this.getStoredTransactionData(hash);
      
      if (!storedData) {
        return false;
      }

      // Verificar se o hash não expirou (24 horas)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas em ms
      
      if (now - storedData.timestamp > maxAge) {
        this.removeStoredTransactionData(hash);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar hash:', error);
      return false;
    }
  }

  /**
   * Obtém dados da transação pelo hash
   */
  static getTransactionData(hash: string): TransactionData | null {
    return this.getStoredTransactionData(hash);
  }

  /**
   * Gera hash simples para desenvolvimento (em produção usar crypto seguro)
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Converter para hex e adicionar padding para ter pelo menos 32 caracteres
    const hexHash = Math.abs(hash).toString(16);
    const timestamp = Date.now().toString(16);
    const random = Math.random().toString(16).substring(2, 10);
    
    return (hexHash + timestamp + random).substring(0, 32).padEnd(32, '0');
  }

  /**
   * Armazena dados da transação no localStorage
   */
  private static storeTransactionData(hash: string, data: TransactionData): void {
    try {
      const key = `childfund-transaction-${hash}`;
      localStorage.setItem(key, JSON.stringify(data));
      
      // Também armazenar em uma lista para limpeza periódica
      const existingHashes = this.getStoredHashes();
      existingHashes.push(hash);
      localStorage.setItem('childfund-transaction-hashes', JSON.stringify(existingHashes));
    } catch (error) {
      console.error('Erro ao armazenar dados da transação:', error);
    }
  }

  /**
   * Recupera dados da transação do localStorage
   */
  private static getStoredTransactionData(hash: string): TransactionData | null {
    try {
      const key = `childfund-transaction-${hash}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados da transação:', error);
      return null;
    }
  }

  /**
   * Remove dados da transação do localStorage
   */
  private static removeStoredTransactionData(hash: string): void {
    try {
      const key = `childfund-transaction-${hash}`;
      localStorage.removeItem(key);
      
      // Remover da lista de hashes
      const existingHashes = this.getStoredHashes();
      const updatedHashes = existingHashes.filter(h => h !== hash);
      localStorage.setItem('childfund-transaction-hashes', JSON.stringify(updatedHashes));
    } catch (error) {
      console.error('Erro ao remover dados da transação:', error);
    }
  }

  /**
   * Obtém lista de hashes armazenados
   */
  private static getStoredHashes(): string[] {
    try {
      const data = localStorage.getItem('childfund-transaction-hashes');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao recuperar lista de hashes:', error);
      return [];
    }
  }

  /**
   * Limpa transações expiradas do localStorage
   */
  static cleanupExpiredTransactions(): void {
    try {
      const hashes = this.getStoredHashes();
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      hashes.forEach(hash => {
        const data = this.getStoredTransactionData(hash);
        if (data && (now - data.timestamp > maxAge)) {
          this.removeStoredTransactionData(hash);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar transações expiradas:', error);
    }
  }

  /**
   * Gera URL de sucesso com hash
   */
  static generateSuccessUrl(donationType: TransactionData['donationType'], hash: string, includePaymentParam: boolean = true): string {
    const baseUrls = {
      'sponsorship': '/sucesso-apadrinhamento',
      'donate': '/sucesso-doacao-unica', 
      'recurrent': '/sucesso-doacao-recorrente'
    };

    const baseUrl = baseUrls[donationType] || '/sucesso-doacao-unica';
    const params = new URLSearchParams({ hash });
    
    if (includePaymentParam) {
      params.append('type', 'payment');
    }

    return `${baseUrl}?${params.toString()}`;
  }
}