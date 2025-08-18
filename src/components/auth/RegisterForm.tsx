import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Mail, User, Lock, ArrowRight, FileText, Check, X, Phone, AlertCircle, MapPin, Eye, EyeOff, Building2, Calendar, Users } from "lucide-react";
import { formatCPF, formatCNPJ, formatPhone, formatPhoneNational, toInternationalPhone } from "../../utils/formatters";
import { useAuth } from "../../contexts/AuthContext";
import { registerSchema1, registerSchema2 } from "../../utils/authSchemas";
import { authService } from "../../services/authService";
import { cepService } from "@/services/cepService";
import { useFormStepTracking } from "../../hooks/useFormStepTracking";

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [personType, setPersonType] = useState<'pf' | 'pj'>('pf'); // PF ou PJ
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState(''); // CPF ou CNPJ
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingDocument, setIsCheckingDocument] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [documentExists, setDocumentExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cep, setCep] = useState('');
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [industry, setIndustry] = useState(''); // Setor (apenas PJ)
  const [ownership, setOwnership] = useState(''); // Propriedade (apenas PJ)
  const [gender, setGender] = useState<'M' | 'F'>('M'); // Sexo (apenas PF)
  const [birthDate, setBirthDate] = useState(''); // Data de nascimento (apenas PF)
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  // Tracking de etapas do RD Station
  const { trackFormCompletion } = useFormStepTracking({
    formType: 'registration',
    currentStep: step,
    totalSteps: 2,
    stepName: step === 1 ? 'Dados Pessoais' : 'Definição de Senha',
    userEmail: email,
    userName: name,
    userPhone: phone,
    userState: state,
    userCity: city
  });

  // Verificar CPF em tempo real
  useEffect(() => {
    const checkCPF = async () => {
      if (document.length === 14) { // CPF formatado completo
        setIsCheckingDocument(true);
        try {
          // Desabilitar verificação temporariamente devido a erro 401
          // const cleanCPF = document.replace(/\D/g, '');
          // const exists = await authService.checkCPFExists(cleanCPF);
          // setDocumentExists(exists);
          
          // Por enquanto, assumir que CPF está disponível
          setDocumentExists(false);
        } catch (error) {
          console.error('Erro ao verificar CPF:', error);
          setDocumentExists(false);
        } finally {
          setIsCheckingDocument(false);
        }
      } else {
        setDocumentExists(false);
      }
    };

    const timeoutId = setTimeout(checkCPF, 1000);
    return () => clearTimeout(timeoutId);
  }, [document]);

  // Verificar email em tempo real
  useEffect(() => {
    const checkEmail = async () => {
      if (email && email.includes('@')) {
        setIsCheckingEmail(true);
        try {
          // Desabilitar verificação temporariamente devido a erro 401
          // const exists = await authService.checkEmailExists(email);
          // setEmailExists(exists);
          
          // Por enquanto, assumir que email está disponível
          setEmailExists(false);
        } catch (error) {
          console.error('Erro ao verificar email:', error);
          setEmailExists(false);
        } finally {
          setIsCheckingEmail(false);
        }
      } else {
        setEmailExists(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 1000);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // Função para validar senha
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Mínimo de 8 caracteres");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Pelo menos uma letra minúscula");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Pelo menos uma letra maiúscula");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Pelo menos um número");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Pelo menos um caractere especial");
    }
    
    return errors;
  };

  const passwordErrors = validatePassword(password);
  const isPasswordValid = passwordErrors.length === 0 && password.length > 0;

  // Função para buscar endereço por CEP
  const buscarCEP = async (cepValue: string) => {
    const cleanCEP = cepValue.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      setIsLoadingCEP(true);
      try {
        const endereco = await cepService.getAddressByCEP(cepValue);
        setAddress(endereco.logradouro);
        setNeighborhood(endereco.bairro);
        setCity(endereco.localidade);
        setState(endereco.uf);
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

  // Função para formatar CEP
  const formatCEP = (cepValue: string): string => {
    const cleanCEP = cepValue.replace(/\D/g, '');
    if (cleanCEP.length <= 5) return cleanCEP;
    return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5, 8)}`;
  };

  const handleCEPChange = (cepValue: string) => {
    const formattedCEP = formatCEP(cepValue);
    setCep(formattedCEP);
    buscarCEP(formattedCEP);
  };

  // Função para formatar documento (CPF ou CNPJ)
  const handleDocumentChange = (value: string) => {
    const formatted = personType === 'pf' ? formatCPF(value) : formatCNPJ(value);
    setDocument(formatted);
  };

  // Função para validar documento
  const validateDocument = (value: string): boolean => {
    if (personType === 'pf') {
      // Validação de CPF
      const cleanCPF = value.replace(/\D/g, '');
      if (cleanCPF.length !== 11) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
      
      // Validação dos dígitos verificadores
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
      }
      let remainder = sum % 11;
      let digit1 = remainder < 2 ? 0 : 11 - remainder;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
      }
      remainder = sum % 11;
      let digit2 = remainder < 2 ? 0 : 11 - remainder;
      
      return parseInt(cleanCPF.charAt(9)) === digit1 && parseInt(cleanCPF.charAt(10)) === digit2;
    } else {
      // Validação de CNPJ
      const cleanCNPJ = value.replace(/\D/g, '');
      if (cleanCNPJ.length !== 14) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
      
      // Validação dos dígitos verificadores
      let sum = 0;
      let weight = 2;
      for (let i = 11; i >= 0; i--) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
      }
      let remainder = sum % 11;
      let digit1 = remainder < 2 ? 0 : 11 - remainder;
      
      sum = 0;
      weight = 2;
      for (let i = 12; i >= 0; i--) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
      }
      remainder = sum % 11;
      let digit2 = remainder < 2 ? 0 : 11 - remainder;
      
      return parseInt(cleanCNPJ.charAt(12)) === digit1 && parseInt(cleanCNPJ.charAt(13)) === digit2;
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validação do primeiro passo
      const step1Data = {
        name,
        email,
        document: personType === 'pf' ? formatCPF(document) : formatCNPJ(document),
        phone: formatPhoneNational(phone),
        address,
        addressNumber,
        addressComplement,
        neighborhood,
        city,
        state,
        cep,
        industry,
        ownership,
      };

      try {
        registerSchema1.parse(step1Data);
        setStep(2);
        trackFormCompletion();
      } catch (error: any) {
        toast({
          title: "Erro na validação",
          description: error.errors?.[0]?.message || "Por favor, verifique os dados informados.",
          variant: "destructive"
        });
      }
    } else {
      // Validação do segundo passo
      const step2Data = {
        password,
        confirmPassword,
      };

      try {
        registerSchema2.parse(step2Data);
        handleRegister();
        trackFormCompletion();
      } catch (error: any) {
        toast({
          title: "Erro na validação",
          description: error.errors?.[0]?.message || "Por favor, verifique os dados informados.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRegister = async () => {
    try {
      // Determinar o tipo de documento baseado no personType
      const typeDocument = personType === 'pf' ? 'cpf' : 'cnpj';
      
      // Formatar dados conforme especificação do DSO
      const cleanDocument = document.replace(/\D/g, ''); // Remover formatação do CPF/CNPJ
      const cleanPhone = phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'); // Manter formato brasileiro
      
      // Registrar usuário usando o contexto de autenticação
      await register(
        name, 
        email, 
        cleanDocument, // CPF/CNPJ sem formatação
        cleanPhone, // Telefone no formato brasileiro
        password, 
        address, 
        addressNumber, 
        addressComplement, 
        neighborhood, 
        city, 
        state, 
        cep,
        personType,
        industry,
        ownership,
        gender,
        birthDate,
        typeDocument
      );
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Agora você pode fazer login com suas credenciais.",
        variant: "default"
      });
      
      // Redirecionar para login em vez de dashboard
      navigate('/auth/login');
      
      // Tracking de conclusão do formulário
      trackFormCompletion();
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao realizar o cadastro. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleBackStep = () => {
    setStep(1);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Criar Conta' : 'Definir Senha'}
          </h2>
          <p className="text-gray-600">
            {step === 1 ? 'Preencha seus dados para começar' : 'Crie uma senha segura para sua conta'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-4">
            {/* Tipo de Pessoa */}
            <div className="space-y-2">
              <Label>Tipo de Pessoa</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={personType === 'pf' ? 'default' : 'outline'}
                  onClick={() => setPersonType('pf')}
                  className="flex-1"
                >
                  <User size={16} className="mr-2" />
                  Pessoa Física
                </Button>
                <Button
                  type="button"
                  variant={personType === 'pj' ? 'default' : 'outline'}
                  onClick={() => setPersonType('pj')}
                  className="flex-1"
                >
                  <Building2 size={16} className="mr-2" />
                  Empresa
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                {personType === 'pf' ? 'Nome Completo' : 'Razão Social'}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <Input
                  id="name"
                  placeholder={personType === 'pf' ? 'Nome e sobrenome' : 'Razão social da empresa'}
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">
                {personType === 'pf' ? 'CPF' : 'CNPJ'}
              </Label>
              <Input
                id="document"
                placeholder={personType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                value={document}
                onChange={(e) => handleDocumentChange(e.target.value)}
                maxLength={personType === 'pf' ? 14 : 18}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Phone size={18} />
                </div>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'))}
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {/* Campos específicos para PF */}
            {personType === 'pf' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="gender">Sexo</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={gender === 'M' ? 'default' : 'outline'}
                      onClick={() => setGender('M')}
                      className="flex-1"
                    >
                      <Users size={16} className="mr-2" />
                      Masculino
                    </Button>
                    <Button
                      type="button"
                      variant={gender === 'F' ? 'default' : 'outline'}
                      onClick={() => setGender('F')}
                      className="flex-1"
                    >
                      <Users size={16} className="mr-2" />
                      Feminino
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Calendar size={18} />
                    </div>
                    <Input
                      id="birthDate"
                      type="date"
                      className="pl-10"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Campos específicos para PJ */}
            {personType === 'pj' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="industry">Setor</Label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                    required
                  >
                    <option value="">Selecione o setor</option>
                    <option value="20">Seguros</option>
                    <option value="33">Comércio Atacadista</option>
                    <option value="48">Eletroeletrônico</option>
                    <option value="49">Agricultura</option>
                    <option value="50">Mineração</option>
                    <option value="67">Educação</option>
                    <option value="72">Comércio Varejista</option>
                    <option value="74">Tecnologia da Informação</option>
                    <option value="78">Serviços Médicos</option>
                    <option value="79">Alimentos</option>
                    <option value="81">Bancos</option>
                    <option value="89">Metalurgia</option>
                    <option value="91">Indústria Automobilística</option>
                    <option value="92">Transportes e Logística</option>
                    <option value="93">Têxtil, Couro e Vestuário</option>
                    <option value="94">Siderurgia</option>
                    <option value="102">Energia Elétrica</option>
                    <option value="110">Água e Saneamento</option>
                    <option value="111">Bebidas e Fumo</option>
                    <option value="112">Comércio Exterior</option>
                    <option value="113">Construção Civil</option>
                    <option value="114">Farmacêutica</option>
                    <option value="115">Holdings</option>
                    <option value="116">Material de Construção e Decoração</option>
                    <option value="117">Mecânica</option>
                    <option value="118">Papel e Celulose</option>
                    <option value="119">Plásticos e Borracha</option>
                    <option value="120">Química e Petroquímica</option>
                    <option value="121">Serviços Especializados</option>
                    <option value="122">Veículos e Peças</option>
                    <option value="135">Telecomunicações</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownership">Propriedade</Label>
                  <select
                    id="ownership"
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-childfund-green focus:border-transparent"
                    required
                  >
                    <option value="">Selecione o tipo de propriedade</option>
                    <option value="1">Pública</option>
                    <option value="2">Particular</option>
                    <option value="12">Capital Misto</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => handleCEPChange(e.target.value)}
                  maxLength={9}
                  required
                />
                {isLoadingCEP && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-childfund-green"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <MapPin size={18} />
                </div>
                <Input
                  id="address"
                  placeholder="Rua"
                  className="pl-10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-1/3">
                <Label htmlFor="addressNumber">Número</Label>
                <Input
                  id="addressNumber"
                  placeholder="Nº"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  required
                />
              </div>
              <div className="w-2/3">
                <Label htmlFor="addressComplement">Complemento</Label>
                <Input
                  id="addressComplement"
                  placeholder="Apto, bloco, etc. (opcional)"
                  value={addressComplement}
                  onChange={(e) => setAddressComplement(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro <span className="text-red-600">*</span></Label>
              <Input
                id="neighborhood"
                placeholder="Bairro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                required
              />
            </div>
            <div className="flex space-x-2">
              <div className="w-2/3">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="w-1/3">
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  placeholder="UF"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 bg-[#2C9B44] hover:bg-[#238336] text-white font-bold"
              disabled={documentExists || emailExists || isCheckingDocument || isCheckingEmail}
            >
              <span className="flex items-center">
                Continuar <ArrowRight size={18} className="ml-2" />
              </span>
            </Button>
          </form>
        ) : (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha segura"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Validações de senha */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-700">A senha deve conter:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center text-xs ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Mínimo de 8 caracteres
                    </div>
                    <div className={`flex items-center text-xs ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Pelo menos uma letra minúscula
                    </div>
                    <div className={`flex items-center text-xs ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Pelo menos uma letra maiúscula
                    </div>
                    <div className={`flex items-center text-xs ${/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Pelo menos um número
                    </div>
                    <div className={`flex items-center text-xs ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Pelo menos um caractere especial
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  className="pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackStep}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 py-6 bg-[#2C9B44] hover:bg-[#238336] text-white font-bold"
              >
                <span className="flex items-center">
                  Criar Conta <ArrowRight size={18} className="ml-2" />
                </span>
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <a href="/auth/login" className="text-[#2C9B44] hover:underline font-medium">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
