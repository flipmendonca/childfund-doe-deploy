import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "./ui/button";
import valid from "card-validator";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCreditCard } from "react-icons/fa";

import { Users } from "lucide-react";
import { Child } from "../types/Child";
import { validations, formatCPF, formatCEP } from "../utils/validations";
import { cepService } from "../services/cepService";
import { useToast } from "./ui/use-toast";
// import RecaptchaWrapper, { RecaptchaWrapperRef } from "./RecaptchaWrapper"; // Removido temporariamente
import { BRAZILIAN_BANKS } from "../data/banks";
import { useLocalDonations } from "../contexts/LocalDonationsContext";
import { useAuth } from "../contexts/AuthContext";
import { useDonation } from "../contexts/DonationContext";
import { usePaymentProcessor } from "../hooks/usePaymentProcessor";
import { AnalyticsService } from "../services/AnalyticsService";
import { CRMService } from "../services/CRMService";
import PaymentProcessingModal from "./PaymentProcessingModal";
import DebitLoginModal from "./auth/DebitLoginModal";
import { RDEventTracker } from "./rdstation";
import { useFormStepTracking } from "../hooks/useFormStepTracking";

const valores = [74, 100, 150, 200];
const bancos = BRAZILIAN_BANKS;
const diasDebito = ['05', '10', '15', '20', '25'];

function useQuery() {
  return new URLSearchParams(window.location.search);
}

const getCardTypeIcon = (type: string | undefined) => {
  switch (type) {
    case "visa":
      return <FaCcVisa className="inline ml-2 text-blue-600 text-2xl" title="Visa" />;
    case "mastercard":
      return <FaCcMastercard className="inline ml-2 text-red-600 text-2xl" title="Mastercard" />;
    case "american-express":
      return <FaCcAmex className="inline ml-2 text-indigo-600 text-2xl" title="Amex" />;
    default:
      return <FaCreditCard className="inline ml-2 text-gray-400 text-2xl" title="Cartão" />;
  }
};

export default function ApadrinhamentoForm() {
  console.log('[ApadrinhamentoForm] Montando componente');
  const query = useQuery();
  const { user, isAuthenticated } = useAuth();
  const { addDonation } = useLocalDonations();
  const { 
    updateUserFields, 
    updatePaymentFields, 
    updateDonationFields,
    setUserLoggedIn,
    setChildId 
  } = useDonation();
  const { 
    processPayment, 
    isProcessing: isPaymentProcessing,
    modalStage,
    modalMessage,
    closeModal,
    showDebitLoginModal,
    closeDebitLoginModal,
    onDebitLoginSuccess
  } = usePaymentProcessor();
  const [step, setStep] = useState(1);
  const [valor, setValor] = useState(74);
  const [outroValor, setOutroValor] = useState(0);
  const valorSelecionado = outroValor > 0 ? outroValor : valor;
  const [dados, setDados] = useState({ 
    nome: '', email: '', telefone: '', cpf: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: ''
  });
  const [erros, setErros] = useState({ 
    nome: '', email: '', telefone: '', cpf: '',
    cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: ''
  });
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const { toast } = useToast();
  const [metodo, setMetodo] = useState<'credito' | 'debito' | ''>('');
  const [localShowDebitModal, setLocalShowDebitModal] = useState(false);

  // ✅ FUNÇÃO PARA DETECTAR SELEÇÃO DE DÉBITO E EXIBIR MODAL
  const handlePaymentMethodSelection = (method: 'credito' | 'debito') => {
    console.log('🔍 [Apadrinhamento] Método selecionado:', method, 'Autenticado:', isAuthenticated);
    
    if (method === 'debito' && !isAuthenticated) {
      console.log('🚨 [Apadrinhamento] Débito selecionado sem login - abrindo modal local');
      setLocalShowDebitModal(true);
      return;
    }
    
    // Se não é débito ou usuário está autenticado, proceder normalmente
    setMetodo(method);
  };

  // ✅ FUNÇÃO PARA FECHAR MODAL LOCAL
  const handleCloseLocalModal = () => {
    setLocalShowDebitModal(false);
  };

  // ✅ FUNÇÃO PARA LOGIN BEM-SUCEDIDO
  const handleLocalLoginSuccess = () => {
    setLocalShowDebitModal(false);
    setMetodo('debito'); // Agora pode definir débito
    toast({
      title: "Login realizado!",
      description: "Agora você pode prosseguir com o débito automático.",
    });
  };
  const [pagamento, setPagamento] = useState({
    nomeCartao: '', numeroCartao: '', validade: '', cvv: '',
    banco: '', agencia: '', digitoAgencia: '', conta: '', digitoConta: '',
    documento: '', nomeTitular: '', diaDebito: ''
  });
  const [errosPag, setErrosPag] = useState<any>({});
  const [cardType, setCardType] = useState<string | undefined>(undefined);
  const [doacaoFinalizada, setDoacaoFinalizada] = useState(false);
  const [child, setChild] = useState<Child | null>(null);
  // const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  // const recaptchaRef = useRef<RecaptchaWrapperRef>(null);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);

  // Função para obter nome da etapa
  const getStepName = (currentStep: number): string => {
    switch (currentStep) {
      case 1:
        return 'Seleção de Valor'
      case 2:
        return 'Dados Pessoais'
      case 3:
        return 'Dados de Pagamento'
      default:
        return 'Etapa Desconhecida'
    }
  };

  // Tracking de etapas do RD Station
  const { trackFormCompletion } = useFormStepTracking({
    formType: 'sponsorship',
    currentStep: step,
    totalSteps: 3,
    stepName: getStepName(step),
    userEmail: dados.email,
    userName: dados.nome,
    userPhone: dados.telefone,
    userState: dados.estado,
    userCity: dados.cidade,
    value: valorSelecionado.toString(),
    childId: child?.id
  });

  useEffect(() => {
    // Pega dados da query string apenas uma vez na montagem
    const id = query.get("child");
    const name = query.get("name");
    const age = query.get("age");
    const location = query.get("location");
    const image = query.get("image");
    const story = query.get("story");
    const birthdate = query.get("birthdate");
    const gender = query.get("gender") as "F" | "M" | "Outro";
    
    console.log('[ApadrinhamentoForm] Params:', { id, name, age, location, image, story, birthdate, gender });
    
    if (id && name && age && location && image && !child) {
      const childData = { id, name, age: Number(age), location, image, story: story || "", gender: gender || "F", birthdate: birthdate || undefined, needs: [] };
      setChild(childData);
      setChildId(id);

      // Track form start apenas uma vez por criança/sessão para evitar spam
      const trackingKey = `sponsorship_intent_${id}`;
      const alreadyTracked = sessionStorage.getItem(trackingKey);
      
      if (!alreadyTracked) {
        CRMService.trackConversion({
          event_type: 'sponsorship_intent',
          form_type: 'sponsorship',
          child_id: id,
          user_id: user?.id,
        });
        sessionStorage.setItem(trackingKey, 'tracked');
      }
    }
  }, [setChildId, user?.id, child]);

  // Carregar dados do usuário logado automaticamente e configurar contexto de doação
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔍 [ApadrinhamentoForm] Carregando dados do usuário logado:', user);
      
      setDados(prev => ({
        ...prev,
        nome: user.name || prev.nome,
        email: user.email || prev.email,
        cpf: user.cpf || prev.cpf,
        telefone: user.phone || prev.telefone,
      }));

      // Atualizar contexto de doação
      updateUserFields({
        name: user.name || '',
        email: user.email || '',
        document: user.cpf || '',
        phone: user.phone || ''
      });
      
      setUserLoggedIn(true);
      
      console.log('✅ [ApadrinhamentoForm] Dados básicos preenchidos automaticamente');
    }
  }, [isAuthenticated, user?.id, user?.name, user?.email, user?.cpf, user?.phone, updateUserFields, setUserLoggedIn]);

  // Função para buscar endereço por CEP
  const buscarCEP = async (cep: string) => {
    if (cep.replace(/\D/g, '').length === 8) {
      setIsLoadingCEP(true);
      try {
        const endereco = await cepService.getAddressByCEP(cep);
        setDados(prev => ({
          ...prev,
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.localidade,
          estado: endereco.uf
        }));
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível encontrar o endereço para este CEP.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  function validarEtapa2() {
    let valid = true;
    let e = { 
      nome: '', email: '', telefone: '', cpf: '',
      cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: ''
    };
    
    // Validar dados pessoais
    if (!dados.nome.trim()) { e.nome = 'Obrigatório'; valid = false; }
    if (!dados.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) { e.email = 'E-mail inválido'; valid = false; }
    if (!dados.telefone.match(/^\d{10,11}$/)) { e.telefone = 'Telefone inválido'; valid = false; }
    const cpfValidation = validations.cpf.validate(dados.cpf);
    if (cpfValidation !== true) { e.cpf = cpfValidation; valid = false; }
    
    // Validar endereço
    if (!dados.cep.replace(/\D/g, '').match(/^\d{8}$/)) { e.cep = 'CEP inválido'; valid = false; }
    if (!dados.logradouro.trim()) { e.logradouro = 'Obrigatório'; valid = false; }
    if (!dados.numero.trim()) { e.numero = 'Obrigatório'; valid = false; }
    if (!dados.bairro.trim()) { e.bairro = 'Obrigatório'; valid = false; }
    if (!dados.cidade.trim()) { e.cidade = 'Obrigatório'; valid = false; }
    if (!dados.estado.trim()) { e.estado = 'Obrigatório'; valid = false; }
    
    setErros(e);
    return valid;
  }

  function validarEtapa3() {
    let e: any = {};
    let validCard = true;
    if (!metodo) { validCard = false; }
    if (metodo === 'credito') {
      if (!pagamento.nomeCartao.trim()) { e.nomeCartao = 'Obrigatório'; validCard = false; }
      const cardValidation = valid.number(pagamento.numeroCartao);
      if (!cardValidation.isValid) { e.numeroCartao = 'Número inválido'; validCard = false; }
      const expValidation = valid.expirationDate(pagamento.validade);
      if (!expValidation.isValid) { e.validade = 'MM/AA inválido'; validCard = false; }
      if (!pagamento.cvv.match(/^\d{3,4}$/)) { e.cvv = 'CVV inválido'; validCard = false; }
    }
    if (metodo === 'debito') {
      if (!pagamento.nomeTitular.trim()) { e.nomeTitular = 'Obrigatório'; validCard = false; }
      if (!pagamento.documento.match(/^\d{11,14}$/)) { e.documento = 'CPF/CNPJ inválido'; validCard = false; }
      if (!pagamento.banco) { e.banco = 'Selecione o banco'; validCard = false; }
      if (!pagamento.agencia.match(/^\d{4}$/)) { e.agencia = 'Agência inválida'; validCard = false; }
      if (!pagamento.digitoAgencia.match(/^\d{1}$/)) { e.digitoAgencia = 'Dígito inválido'; validCard = false; }
      if (!pagamento.conta.match(/^\d{7}$/)) { e.conta = 'Conta inválida'; validCard = false; }
      if (!pagamento.digitoConta.match(/^\d{1}$/)) { e.digitoConta = 'Dígito inválido'; validCard = false; }
      if (!pagamento.diaDebito) { e.diaDebito = 'Selecione o dia'; validCard = false; }
    }
    
    // Verificar reCAPTCHA - Removido temporariamente
    // if (!recaptchaToken) {
    //   toast({
    //     title: "Verificação necessária",
    //     description: "Por favor, complete a verificação reCAPTCHA",
    //     variant: "destructive"
    //   });
    //   validCard = false;
    // }
    
    // Verificar política de privacidade
    if (!acceptedPrivacyPolicy) {
      toast({
        title: "Política de Privacidade",
        description: "É necessário aceitar a Política de Privacidade para continuar",
        variant: "destructive"
      });
      validCard = false;
    }
    
    setErrosPag(e);
    return validCard;
  }

  // Função para limitar texto
  function resumo(str: string, max = 120) {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "..." : str;
  }

  // const handleRecaptchaChange = (token: string | null) => {
  //   setRecaptchaToken(token);
  // };

  // const handleRecaptchaExpired = () => {
  //   setRecaptchaToken(null);
  //   toast({
  //     title: "reCAPTCHA expirado",
  //     description: "Por favor, complete a verificação novamente",
  //     variant: "destructive"
  //   });
  // };

  // const handleRecaptchaError = () => {
  //   setRecaptchaToken(null);
  //   toast({
  //     title: "Erro na verificação",
  //     description: "Houve um problema com a verificação de segurança. Tente novamente.",
  //     variant: "destructive"
  //   });
  // };

  // Processar apadrinhamento usando o usePaymentProcessor
  const processarApadrinhamento = async () => {
    try {
      // Track form submission
      AnalyticsService.trackFormEvent({
        formType: 'sponsorship',
        step: 'submitted',
        paymentMethod: metodo === 'credito' ? 'credit_card' : 'bank_transfer',
        amount: valorSelecionado
      });

      // Atualizar todos os dados no contexto de doação antes de processar
      updateUserFields({
        name: dados.nome,
        email: dados.email,
        document: dados.cpf.replace(/\D/g, ''),
        phone: dados.telefone.replace(/\D/g, ''),
        postalCode: dados.cep.replace(/\D/g, ''),
        street: dados.logradouro,
        number: dados.numero,
        addressComplement: dados.complemento,
        neighborhood: dados.bairro,
        city: dados.cidade,
        state: dados.estado
      });

      updateDonationFields({
        type: 'sponsorship',
        value: valorSelecionado,
        paymentMethod: metodo === 'credito' ? 'credit_card' : 'debit',
        childId: child?.id
      });

      updatePaymentFields({
        paymentMethod: metodo === 'credito' ? 'credit_card' : 'debit',
        method: metodo === 'credito' ? 'credit_card' : 'debit',
        value: valorSelecionado,
        // Dados do cartão de crédito
        ...(metodo === 'credito' ? {
          cardNumber: pagamento.numeroCartao.replace(/\s/g, ''),
          cardName: pagamento.nomeCartao,
          expiryMonth: pagamento.validade.slice(0, 2),
          expiryYear: pagamento.validade.slice(3, 5),
          cvv: pagamento.cvv,
          credit_card: {
            ownername: pagamento.nomeCartao,
            numero: pagamento.numeroCartao.replace(/\s/g, ''),
            mesexp: pagamento.validade.slice(0, 2),
            anoexp: pagamento.validade.slice(3, 5),
            cvc: pagamento.cvv
          }
        } : {
          // Dados do débito automático
          bankCode: pagamento.banco,
          agency: pagamento.agencia,
          account: pagamento.conta,
          accountType: 'checking',
          debit: {
            pay_name: pagamento.nomeTitular,
            pay_doc: pagamento.documento.replace(/\D/g, ''),
            pay_bankcode: pagamento.banco,
            pay_accountnumber: pagamento.conta,
            pay_digitaccountnumber: pagamento.digitoConta,
            pay_branchcode: pagamento.agencia,
            pay_digitbranchcode: pagamento.digitoAgencia
          },
          pay_duo_date: pagamento.diaDebito
        })
      });

      // 🔧 CORREÇÃO: Preparar dados pessoais para passar diretamente
      const dadosPessoaisFormatados = {
        email: dados.email,
        name: dados.nome,
        document: dados.cpf.replace(/\D/g, ''),
        phone: dados.telefone.replace(/\D/g, ''),
        postalCode: dados.cep.replace(/\D/g, ''),
        street: dados.logradouro,
        number: dados.numero,
        complement: dados.complemento,
        neighborhood: dados.bairro,
        city: dados.cidade,
        state: dados.estado
      };

      // Processar pagamento passando dados diretamente para evitar problemas de timing
      const result = await processPayment(!isAuthenticated, dadosPessoaisFormatados);
      
      if (result.success) {
        // Registrar doação localmente para exibir na área do doador
        addDonation({
          amount: valorSelecionado,
          type: 'sponsorship',
          status: 'completed',
          description: `Apadrinhamento de ${child?.name || 'criança'}`,
          paymentMethod: metodo === 'credito' ? 'Cartão de Crédito' : 'Débito Automático'
        });
      }
      
    } catch (error) {
      console.error('Erro ao processar apadrinhamento:', error);
      setDonationError(error instanceof Error ? error.message : 'Erro desconhecido ao processar apadrinhamento');
    }
  };

  // Verificar se há dados de criança nos query parameters
  const hasChildParams = query.get("child") && query.get("name") && query.get("age") && query.get("image");
  
  // Se não há criança selecionada E não há parâmetros de criança, mostrar mensagem de redirecionamento
  if (!child && !hasChildParams) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg mt-12 mb-16 flex flex-col overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-childfund-yellow/10 rounded-full mx-auto flex items-center justify-center mb-4">
            <Users className="text-childfund-yellow" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Redirecionando...
          </h2>
          <p className="text-gray-600 mb-4">
            Para apadrinhar, você precisa primeiro selecionar uma criança.
          </p>
          <div className="animate-pulse flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-childfund-yellow rounded-full"></div>
            <div className="w-2 h-2 bg-childfund-yellow rounded-full"></div>
            <div className="w-2 h-2 bg-childfund-yellow rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg mt-12 mb-16 flex flex-col overflow-hidden">
      {/* Banner e topo da criança */}
      {(child || hasChildParams) && (
        <div className="flex flex-col md:flex-row items-center gap-6 bg-childfund-green/10 p-6 border-b border-childfund-green/20">
          <img 
            src={child?.image || query.get("image") || ''} 
            alt={child?.name || query.get("name") || ''} 
            className="w-32 h-32 object-cover rounded-2xl shadow-md" 
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-childfund-green mb-1">
              Apadrinhando: {child?.name || query.get("name")}
            </h2>
            <div className="text-gray-700 text-sm mb-1">
              {child?.birthdate ? `Nascimento: ${child.birthdate}` : `${child?.age || query.get("age")} anos`}
            </div>
            <div className="text-gray-600 text-xs mb-2">{child?.location || query.get("location")}</div>
            <p className="text-gray-700 text-sm mb-2">{child?.story ? resumo(child.story) : ''}</p>
            <button 
              className="underline text-childfund-green text-xs hover:text-childfund-green/80 transition-colors" 
              onClick={() => {
                // Forçar refresh e navegação para a seção de apadrinhamento
                window.location.href = '/como-apoiar#apadrinhamento';
              }}
            >
              Mudar escolha
            </button>
          </div>
        </div>
      )}
      <div className="px-2 sm:px-4 md:px-12 py-8 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-childfund-green text-center mb-2">Apadrinhe uma Criança</h1>
        <p className="text-base sm:text-lg text-center text-gray-700 mb-4 font-medium">Crie uma conexão especial acompanhando o desenvolvimento de uma criança.</p>
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step === 1 ? 'bg-childfund-green' : 'bg-gray-300'}`}>1</div>
          <div className={`h-1 w-4 sm:w-8 ${step > 1 ? 'bg-childfund-green' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step === 2 ? 'bg-childfund-green' : 'bg-gray-300'}`}>2</div>
          <div className={`h-1 w-4 sm:w-8 ${step > 2 ? 'bg-childfund-green' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step === 3 ? 'bg-childfund-green' : 'bg-gray-300'}`}>3</div>
        </div>
        {/* Etapa 1: Escolha do valor */}
        {step === 1 && (
      <div className="flex flex-col gap-8">
        <div>
              <h3 className="font-semibold mb-4 text-lg">Escolha o valor da sua contribuição <span className='text-red-600'>*</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {valores.map((v) => (
              <button
                key={v}
                    className={`border rounded-lg py-3 font-medium text-lg transition-all w-full ${valor === v && outroValor === 0 ? 'border-childfund-green bg-childfund-green/10' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                onClick={() => { setValor(v); setOutroValor(0); }}
                type="button"
              >
                R$ {v}
              </button>
            ))}
            <input
              type="number"
              min={1}
              placeholder="Outro valor"
                  className={`border rounded-lg py-3 px-2 font-medium text-lg w-full ${outroValor > 0 ? 'border-childfund-green bg-childfund-green/10' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
              value={outroValor > 0 ? outroValor : ''}
              onChange={e => { setOutroValor(Number(e.target.value)); setValor(0); }}
            />
          </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="font-semibold">Seu impacto com R$ {valorSelecionado}</span>
                <span className="ml-0 sm:ml-2 text-sm">Com R$ {valorSelecionado} mensais, você garante acompanhamento completo de uma criança, incluindo alimentação, educação e saúde.</span>
              </div>
            </div>
            <Button className="bg-childfund-green w-full mt-4" onClick={() => valorSelecionado > 0 && setStep(2)} disabled={valorSelecionado <= 0}>
              Continuar &rarr;
            </Button>
          </div>
        )}
        {/* Etapa 2: Dados pessoais */}
        {step === 2 && (
          <form className="flex flex-col gap-8" onSubmit={e => { e.preventDefault(); if (validarEtapa2()) setStep(3); }}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="nome" className="font-semibold">Nome completo <span className="text-red-600">*</span></label>
                <input
                  id="nome"
                  className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.nome ? 'border-red-500' : 'border-gray-200'}`}
                  value={dados.nome}
                  onChange={e => setDados({ ...dados, nome: e.target.value })}
                  required
                />
                {erros.nome && <span className="text-red-600 text-xs">{erros.nome}</span>}
              </div>
              <div>
                <label htmlFor="email" className="font-semibold">E-mail <span className="text-red-600">*</span></label>
                <input
                  id="email"
                  type="email"
                  className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.email ? 'border-red-500' : 'border-gray-200'}`}
                  value={dados.email}
                  onChange={e => setDados({ ...dados, email: e.target.value })}
                  required
                />
                {erros.email && <span className="text-red-600 text-xs">{erros.email}</span>}
              </div>
              <div>
                <label htmlFor="telefone" className="font-semibold">Telefone <span className="text-red-600">*</span></label>
                <input
                  id="telefone"
                  type="tel"
                  className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.telefone ? 'border-red-500' : 'border-gray-200'}`}
                  value={dados.telefone}
                  onChange={e => setDados({ ...dados, telefone: e.target.value.replace(/\D/g, '') })}
                  placeholder="Apenas números"
                  required
                />
                {erros.telefone && <span className="text-red-600 text-xs">{erros.telefone}</span>}
              </div>
              <div>
                <label htmlFor="cpf" className="font-semibold">CPF <span className="text-red-600">*</span></label>
                <input
                  id="cpf"
                  type="text"
                  className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.cpf ? 'border-red-500' : 'border-gray-200'}`}
                  value={formatCPF(dados.cpf)}
                  onChange={e => setDados({ ...dados, cpf: e.target.value.replace(/\D/g, '') })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
                {erros.cpf && <span className="text-red-600 text-xs">{erros.cpf}</span>}
              </div>
            </div>

            {/* Seção de Endereço */}
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold mb-4 text-lg text-gray-800">Endereço</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="cep" className="font-semibold">CEP <span className="text-red-600">*</span></label>
                  <div className="relative">
                    <input
                      id="cep"
                      type="text"
                      className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.cep ? 'border-red-500' : 'border-gray-200'}`}
                      value={formatCEP(dados.cep)}
                      onChange={e => {
                        const cep = e.target.value.replace(/\D/g, '');
                        setDados({ ...dados, cep });
                        buscarCEP(cep);
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                    />
                    {isLoadingCEP && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-childfund-green"></div>
                      </div>
                    )}
                  </div>
                  {erros.cep && <span className="text-red-600 text-xs">{erros.cep}</span>}
                </div>

                <div>
                  <label htmlFor="logradouro" className="font-semibold">Logradouro <span className="text-red-600">*</span></label>
                  <input
                    id="logradouro"
                    type="text"
                    className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.logradouro ? 'border-red-500' : 'border-gray-200'}`}
                    value={dados.logradouro}
                    onChange={e => setDados({ ...dados, logradouro: e.target.value })}
                    placeholder="Rua, Avenida, etc."
                    required
                  />
                  {erros.logradouro && <span className="text-red-600 text-xs">{erros.logradouro}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="numero" className="font-semibold">Número <span className="text-red-600">*</span></label>
                    <input
                      id="numero"
                      type="text"
                      className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.numero ? 'border-red-500' : 'border-gray-200'}`}
                      value={dados.numero}
                      onChange={e => setDados({ ...dados, numero: e.target.value })}
                      placeholder="123"
                      required
                    />
                    {erros.numero && <span className="text-red-600 text-xs">{erros.numero}</span>}
                  </div>
                  <div>
                    <label htmlFor="complemento" className="font-semibold">Complemento</label>
                    <input
                      id="complemento"
                      type="text"
                      className="w-full border rounded-lg py-3 px-3 mt-1 border-gray-200"
                      value={dados.complemento}
                      onChange={e => setDados({ ...dados, complemento: e.target.value })}
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bairro" className="font-semibold">Bairro <span className="text-red-600">*</span></label>
                  <input
                    id="bairro"
                    type="text"
                    className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.bairro ? 'border-red-500' : 'border-gray-200'}`}
                    value={dados.bairro}
                    onChange={e => setDados({ ...dados, bairro: e.target.value })}
                    placeholder="Nome do bairro"
                    required
                  />
                  {erros.bairro && <span className="text-red-600 text-xs">{erros.bairro}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cidade" className="font-semibold">Cidade <span className="text-red-600">*</span></label>
                    <input
                      id="cidade"
                      type="text"
                      className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.cidade ? 'border-red-500' : 'border-gray-200'}`}
                      value={dados.cidade}
                      onChange={e => setDados({ ...dados, cidade: e.target.value })}
                      placeholder="Nome da cidade"
                      required
                    />
                    {erros.cidade && <span className="text-red-600 text-xs">{erros.cidade}</span>}
                  </div>
                  <div>
                    <label htmlFor="estado" className="font-semibold">Estado <span className="text-red-600">*</span></label>
                    <input
                      id="estado"
                      type="text"
                      className={`w-full border rounded-lg py-3 px-3 mt-1 ${erros.estado ? 'border-red-500' : 'border-gray-200'}`}
                      value={dados.estado}
                      onChange={e => setDados({ ...dados, estado: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                    {erros.estado && <span className="text-red-600 text-xs">{erros.estado}</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/2">Voltar</Button>
              <Button type="submit" className="w-1/2 bg-childfund-green">Continuar &rarr;</Button>
            </div>
          </form>
        )}
        {/* Etapa 3: Pagamento visual */}
        {step === 3 && (
          <form className="flex flex-col gap-8" onSubmit={async (e) => { 
          e.preventDefault(); 
          if (validarEtapa3()) { 
            await processarApadrinhamento(); 
          } 
        }}>
            <div>
              <label className="font-semibold block mb-2">Forma de pagamento <span className="text-red-600">*</span></label>
              <div className="flex gap-4 mb-4 flex-col sm:flex-row">
                <button type="button" className={`flex-1 border rounded-lg py-3 font-medium text-lg transition-all ${metodo === 'credito' ? 'border-childfund-green bg-childfund-green/10' : 'border-gray-200 bg-white hover:bg-gray-50'}`} onClick={() => handlePaymentMethodSelection('credito')}>Cartão de Crédito</button>
                <button type="button" className={`flex-1 border rounded-lg py-3 font-medium text-lg transition-all ${metodo === 'debito' ? 'border-childfund-green bg-childfund-green/10' : 'border-gray-200 bg-white hover:bg-gray-50'}`} onClick={() => handlePaymentMethodSelection('debito')}>Débito em Conta</button>
              </div>
            </div>
            {metodo === 'credito' && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="font-semibold">Nome no cartão <span className="text-red-600">*</span></label>
                  <input className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.nomeCartao ? 'border-red-500' : 'border-gray-200'}`} value={pagamento.nomeCartao} onChange={e => setPagamento({ ...pagamento, nomeCartao: e.target.value })} required />
                  {errosPag.nomeCartao && <span className="text-red-600 text-xs">{errosPag.nomeCartao}</span>}
                </div>
                <div>
                  <label className="font-semibold">Número do cartão <span className="text-red-600">*</span></label>
                  <input className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.numeroCartao ? 'border-red-500' : 'border-gray-200'}`}
                    value={pagamento.numeroCartao}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setPagamento({ ...pagamento, numeroCartao: raw });
                      const validation = valid.number(raw);
                      setCardType(validation.card ? validation.card.type : undefined);
                    }}
                    maxLength={16}
                    required
                  />
                  {getCardTypeIcon(cardType)}
                  {errosPag.numeroCartao && <span className="text-red-600 text-xs">{errosPag.numeroCartao}</span>}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="font-semibold">Validade (MM/AA) <span className="text-red-600">*</span></label>
                    <input className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.validade ? 'border-red-500' : 'border-gray-200'}`}
                      value={pagamento.validade}
                      onChange={e => {
                        let val = e.target.value.replace(/[^\d]/g, '');
                        if (val.length > 4) val = val.slice(0, 4);
                        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                        setPagamento({ ...pagamento, validade: val });
                      }}
                      placeholder="MM/AA"
                      maxLength={5}
                      required
                    />
                    {errosPag.validade && <span className="text-red-600 text-xs">{errosPag.validade}</span>}
                  </div>
                  <div className="flex-1">
                    <label className="font-semibold">CVV <span className="text-red-600">*</span></label>
                    <input className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.cvv ? 'border-red-500' : 'border-gray-200'}`} value={pagamento.cvv} onChange={e => setPagamento({ ...pagamento, cvv: e.target.value.replace(/\D/g, '').slice(0,4) })} maxLength={4} required />
                    {errosPag.cvv && <span className="text-red-600 text-xs">{errosPag.cvv}</span>}
                  </div>
                </div>
              </div>
            )}
            {metodo === 'debito' && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="font-semibold">Nome do titular <span className="text-red-600">*</span></label>
                  <input 
                    className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.nomeTitular ? 'border-red-500' : 'border-gray-200'}`} 
                    value={pagamento.nomeTitular} 
                    onChange={e => setPagamento({ ...pagamento, nomeTitular: e.target.value })} 
                    required 
                  />
                  {errosPag.nomeTitular && <span className="text-red-600 text-xs">{errosPag.nomeTitular}</span>}
                </div>
                <div>
                  <label className="font-semibold">CPF/CNPJ <span className="text-red-600">*</span></label>
                  <input 
                    className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.documento ? 'border-red-500' : 'border-gray-200'}`} 
                    value={pagamento.documento} 
                    onChange={e => setPagamento({ ...pagamento, documento: e.target.value.replace(/\D/g, '').slice(0,14) })} 
                    placeholder="Apenas números"
                    maxLength={14}
                    required 
                  />
                  {errosPag.documento && <span className="text-red-600 text-xs">{errosPag.documento}</span>}
                </div>
                <div>
                  <label className="font-semibold">Banco <span className="text-red-600">*</span></label>
                  <select 
                    className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.banco ? 'border-red-500' : 'border-gray-200'}`}
                    value={pagamento.banco}
                    onChange={e => setPagamento({ ...pagamento, banco: e.target.value })}
                    required
                  >
                    <option value="">Selecione o banco</option>
                    {bancos.map(banco => (
                      <option key={banco.code} value={banco.code}>{banco.name}</option>
                    ))}
                  </select>
                  {errosPag.banco && <span className="text-red-600 text-xs">{errosPag.banco}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Agência <span className="text-red-600">*</span></label>
                    <input 
                      className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.agencia ? 'border-red-500' : 'border-gray-200'}`} 
                      value={pagamento.agencia} 
                      onChange={e => setPagamento({ ...pagamento, agencia: e.target.value.replace(/\D/g, '').slice(0,4) })} 
                      placeholder="XXXX"
                      maxLength={4}
                      required 
                    />
                    {errosPag.agencia && <span className="text-red-600 text-xs">{errosPag.agencia}</span>}
                  </div>
                  <div>
                    <label className="font-semibold">Dígito <span className="text-red-600">*</span></label>
                    <input 
                      className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.digitoAgencia ? 'border-red-500' : 'border-gray-200'}`} 
                      value={pagamento.digitoAgencia} 
                      onChange={e => setPagamento({ ...pagamento, digitoAgencia: e.target.value.replace(/\D/g, '').slice(0,1) })} 
                      placeholder="X"
                      maxLength={1}
                      required 
                    />
                    {errosPag.digitoAgencia && <span className="text-red-600 text-xs">{errosPag.digitoAgencia}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Conta <span className="text-red-600">*</span></label>
                    <input 
                      className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.conta ? 'border-red-500' : 'border-gray-200'}`} 
                      value={pagamento.conta} 
                      onChange={e => setPagamento({ ...pagamento, conta: e.target.value.replace(/\D/g, '').slice(0,7) })} 
                      placeholder="XXXXXXX"
                      maxLength={7}
                      required 
                    />
                    {errosPag.conta && <span className="text-red-600 text-xs">{errosPag.conta}</span>}
                  </div>
                  <div>
                    <label className="font-semibold">Dígito <span className="text-red-600">*</span></label>
                    <input 
                      className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.digitoConta ? 'border-red-500' : 'border-gray-200'}`} 
                      value={pagamento.digitoConta} 
                      onChange={e => setPagamento({ ...pagamento, digitoConta: e.target.value.replace(/\D/g, '').slice(0,1) })} 
                      placeholder="X"
                      maxLength={1}
                      required 
                    />
                    {errosPag.digitoConta && <span className="text-red-600 text-xs">{errosPag.digitoConta}</span>}
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Dia para débito em conta <span className="text-red-600">*</span></label>
                  <select 
                    className={`w-full border rounded-lg py-3 px-3 mt-1 ${errosPag.diaDebito ? 'border-red-500' : 'border-gray-200'}`}
                    value={pagamento.diaDebito}
                    onChange={e => setPagamento({ ...pagamento, diaDebito: e.target.value })}
                    required
                  >
                    <option value="">Selecione o dia</option>
                    {diasDebito.map(dia => (
                      <option key={dia} value={dia}>Dia {dia}</option>
                    ))}
                  </select>
                  {errosPag.diaDebito && <span className="text-red-600 text-xs">{errosPag.diaDebito}</span>}
                </div>
              </div>
            )}
            
            {/* Política de Privacidade */}
            <div className="mt-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
                <input
                  type="checkbox"
                  id="privacy-policy-apadrinhamento"
                  checked={acceptedPrivacyPolicy}
                  onChange={(e) => setAcceptedPrivacyPolicy(e.target.checked)}
                  className="mt-1 w-4 h-4 text-childfund-green border-gray-300 rounded focus:ring-childfund-green focus:ring-2"
                  required
                />
                <label htmlFor="privacy-policy-apadrinhamento" className="text-sm text-gray-700 leading-relaxed">
                  Concordo com a{" "}
                  <a 
                    href="/politica-salvaguarda" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-childfund-green hover:underline font-medium"
                  >
                    Política de Salvaguarda Infantil
                  </a>{" "}
                  e{" "}
                  <a 
                    href="/aviso-privacidade" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-childfund-green hover:underline font-medium"
                  >
                    Aviso de Privacidade
                  </a>{" "}
                  e estou ciente que meus dados serão usados somente para fins da minha doação.
                </label>
              </div>
            </div>
            
            {/* reCAPTCHA Verification - Removido temporariamente */}
            
            {/* Exibir erro de apadrinhamento se houver */}
            {donationError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  <strong>Erro:</strong> {donationError}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 justify-between mt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-1/2" disabled={isPaymentProcessing}>
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="w-1/2 bg-childfund-green" 
                disabled={!acceptedPrivacyPolicy || isPaymentProcessing}
              >
                {isPaymentProcessing ? "Processando..." : "Finalizar Apadrinhamento"}
              </Button>
            </div>
          </form>
        )}
        {/* Etapa 4: Mensagem de agradecimento + CTA cadastro */}
        {doacaoFinalizada && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <h2 className="text-2xl font-bold text-childfund-green text-center">Obrigado por apadrinhar uma criança!</h2>
            <p className="text-lg text-center text-gray-700 max-w-md">Sua contribuição cria uma conexão de esperança e transforma vidas. Juntos, criamos futuros melhores!</p>
            <Button className="bg-childfund-yellow text-white px-8 py-3 rounded-lg text-lg shadow-md" onClick={() => window.location.href = '/auth/register'}>
              Cadastre-se para acessar a Área do Doador
            </Button>
            <button className="underline text-childfund-green text-base mt-2" onClick={() => window.location.href = '/auth/login'}>
              Já tem cadastro? Faça login
            </button>
        </div>
        )}
      </div>

      {/* Modal de processamento de pagamento */}
      <PaymentProcessingModal
        isOpen={modalStage !== null}
        stage={modalStage || 'processing'}
        message={modalMessage}
        onClose={closeModal}
      />

      {/* Modal de login para débito automático */}
      <DebitLoginModal
        isOpen={localShowDebitModal || showDebitLoginModal}
        onClose={localShowDebitModal ? handleCloseLocalModal : closeDebitLoginModal}
        onLoginSuccess={localShowDebitModal ? handleLocalLoginSuccess : onDebitLoginSuccess}
      />
      
      {/* Tracking RD Station */}
      <RDEventTracker
        type="Iniciou Apadrinhamento"
        email={dados.email}
        name={dados.nome}
        phone={dados.telefone}
        state={dados.estado}
        city={dados.cidade}
        value={valorSelecionado.toString()}
      />
    </div>
  );
}
  