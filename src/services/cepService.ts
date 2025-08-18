interface CEPResponse {
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
}

export const cepService = {
  async getAddressByCEP(cep: string): Promise<CEPResponse> {
    try {
      // Remove caracteres não numéricos
      const cleanCEP = cep.replace(/\D/g, "");
      
      // Verifica se o CEP tem 8 dígitos
      if (cleanCEP.length !== 8) {
        throw new Error("CEP inválido");
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error("Erro ao consultar CEP");
      }

      const data = await response.json();

      // Verifica se o CEP existe
      if (data.erro) {
        throw new Error("CEP não encontrado");
      }

      return data;
    } catch (error) {
      console.error("Erro ao consultar CEP:", error);
      throw error;
    }
  }
}; 