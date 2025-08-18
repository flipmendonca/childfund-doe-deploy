export interface Bank {
  code: string;
  name: string;
}

// Bancos disponíveis para débito automático (conforme servidor de produção)
export const BRAZILIAN_BANKS: Bank[] = [
  { code: "001", name: "Banco do Brasil S.A." },
  { code: "341", name: "Banco Itaú S.A." },
  { code: "033", name: "Banco Santander (Brasil) S.A." },
  { code: "237", name: "Banco Bradesco S.A." }
];

// Lista completa de bancos brasileiros (para referência futura)
export const ALL_BRAZILIAN_BANKS: Bank[] = [
  { code: "001", name: "Banco do Brasil S.A." },
  { code: "033", name: "Banco Santander (Brasil) S.A." },
  { code: "104", name: "Caixa Econômica Federal" },
  { code: "237", name: "Banco Bradesco S.A." },
  { code: "341", name: "Banco Itaú S.A." },
  { code: "745", name: "Banco Citibank S.A." },
  { code: "399", name: "HSBC Bank Brasil S.A." },
  { code: "655", name: "Banco Votorantim S.A." },
  { code: "041", name: "Banco do Estado do Rio Grande do Sul S.A." },
  { code: "070", name: "BRB - Banco de Brasília S.A." },
  { code: "085", name: "Cooperativa Central de Crédito Ailos" },
  { code: "136", name: "Unicred Cooperativa" },
  { code: "748", name: "Banco Cooperativo Sicredi S.A." },
  { code: "756", name: "Banco Cooperativo do Brasil S.A." },
  { code: "077", name: "Banco Inter S.A." },
  { code: "260", name: "Nu Pagamentos S.A." },
  { code: "290", name: "Pagseguro Internet S.A." },
  { code: "323", name: "Mercado Pago" },
  { code: "380", name: "PicPay Servicos S.A." },
  { code: "364", name: "Gerencianet Pagamentos do Brasil" }
]; 