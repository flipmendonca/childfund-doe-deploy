import { useState, useRef } from "react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import RecaptchaWrapper, { RecaptchaWrapperRef } from "../RecaptchaWrapper";

interface UnifiedDonationFormProps {
  onSubmit: (data: any) => void;
  initialValues?: any;
}

export default function UnifiedDonationForm({ onSubmit, initialValues }: UnifiedDonationFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCtaCadastro, setShowCtaCadastro] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaWrapperRef>(null);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);

  const {
    values,
    errors,
    isLoadingCEP,
    handleChange,
    handleSubmit,
    resetForm
  } = useFormValidation({
    initialValues: initialValues || {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      birthDate: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      amount: "",
      paymentMethod: "credit_card"
    },
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        toast({
          title: "Doação realizada com sucesso!",
          description: "Obrigado por apoiar nossa causa.",
          variant: "default"
        });
        resetForm();
        setCurrentStep(1);
        setShowCtaCadastro(true);
      } catch (error) {
        toast({
          title: "Erro ao processar doação",
          description: "Por favor, tente novamente.",
          variant: "destructive"
        });
      }
    }
  });

  const nextStep = () => {
    if (currentStep === 1) {
      // Validar campos pessoais
      const personalFields = ["name", "email", "phone", "cpf", "birthDate"];
      const hasErrors = personalFields.some(field => errors[field]);
      if (hasErrors) {
        toast({
          title: "Erro ao prosseguir",
          description: "Por favor, corrija os erros antes de continuar.",
          variant: "destructive"
        });
        return;
      }
    } else if (currentStep === 2) {
      // Validar campos de endereço
      const addressFields = ["cep", "logradouro", "numero", "bairro", "cidade", "estado"];
      const hasErrors = addressFields.some(field => errors[field]);
      if (hasErrors) {
        toast({
          title: "Erro ao prosseguir",
          description: "Por favor, corrija os erros antes de continuar.",
          variant: "destructive"
        });
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    toast({
      title: "reCAPTCHA expirado",
      description: "Por favor, complete a verificação novamente",
      variant: "destructive"
    });
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    toast({
      title: "Erro na verificação",
      description: "Houve um problema com o reCAPTCHA. Tente novamente",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        <div className={`flex-1 text-center ${currentStep >= 1 ? "text-childfund-green" : "text-gray-400"}`}>
          <div className="w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center mb-2">
            {currentStep > 1 ? "✓" : "1"}
          </div>
          <span className="text-sm">Dados Pessoais</span>
        </div>
        <div className={`flex-1 text-center ${currentStep >= 2 ? "text-childfund-green" : "text-gray-400"}`}>
          <div className="w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center mb-2">
            {currentStep > 2 ? "✓" : "2"}
          </div>
          <span className="text-sm">Endereço</span>
        </div>
        <div className={`flex-1 text-center ${currentStep >= 3 ? "text-childfund-green" : "text-gray-400"}`}>
          <div className="w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center mb-2">
            {currentStep > 3 ? "✓" : "3"}
          </div>
          <span className="text-sm">Pagamento</span>
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
              maxLength={15}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={values.cpf}
              onChange={(e) => handleChange("cpf", e.target.value)}
              className={errors.cpf ? "border-red-500" : ""}
              maxLength={14}
            />
            {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={values.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              className={errors.birthDate ? "border-red-500" : ""}
            />
            {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
          </div>

          <Button onClick={nextStep} className="w-full bg-childfund-green hover:bg-childfund-green/90">
            Próximo
          </Button>
        </div>
      )}

      {/* Step 2: Address */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <div className="relative">
              <Input
                id="cep"
                value={values.cep}
                onChange={(e) => handleChange("cep", e.target.value)}
                className={errors.cep ? "border-red-500" : ""}
                maxLength={9}
              />
              {isLoadingCEP && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
            {errors.cep && <p className="text-sm text-red-500">{errors.cep}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input
              id="logradouro"
              value={values.logradouro}
              onChange={(e) => handleChange("logradouro", e.target.value)}
              className={errors.logradouro ? "border-red-500" : ""}
            />
            {errors.logradouro && <p className="text-sm text-red-500">{errors.logradouro}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={values.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                className={errors.numero ? "border-red-500" : ""}
              />
              {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={values.complemento}
                onChange={(e) => handleChange("complemento", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={values.bairro}
              onChange={(e) => handleChange("bairro", e.target.value)}
              className={errors.bairro ? "border-red-500" : ""}
            />
            {errors.bairro && <p className="text-sm text-red-500">{errors.bairro}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={values.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                className={errors.cidade ? "border-red-500" : ""}
              />
              {errors.cidade && <p className="text-sm text-red-500">{errors.cidade}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={values.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                className={errors.estado ? "border-red-500" : ""}
              />
              {errors.estado && <p className="text-sm text-red-500">{errors.estado}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={prevStep} variant="outline" className="flex-1">
              Voltar
            </Button>
            <Button onClick={nextStep} className="flex-1 bg-childfund-green hover:bg-childfund-green/90">
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor da Doação</Label>
            <Input
              id="amount"
              type="number"
              value={values.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className={errors.amount ? "border-red-500" : ""}
              min="1"
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={values.paymentMethod === "credit_card" ? "default" : "outline"}
                className={values.paymentMethod === "credit_card" ? "bg-childfund-green hover:bg-childfund-green/90" : ""}
                onClick={() => handleChange("paymentMethod", "credit_card")}
              >
                Cartão de Crédito
              </Button>
              <Button
                type="button"
                variant={values.paymentMethod === "pix" ? "default" : "outline"}
                className={values.paymentMethod === "pix" ? "bg-childfund-green hover:bg-childfund-green/90" : ""}
                onClick={() => handleChange("paymentMethod", "pix")}
              >
                PIX
              </Button>
            </div>
          </div>

          {/* Política de Privacidade */}
          <div className="mt-6">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
              <input
                type="checkbox"
                id="privacy-policy-unified"
                checked={acceptedPrivacyPolicy}
                onChange={(e) => setAcceptedPrivacyPolicy(e.target.checked)}
                className="mt-1 w-4 h-4 text-childfund-green border-gray-300 rounded focus:ring-childfund-green focus:ring-2"
                required
              />
              <label htmlFor="privacy-policy-unified" className="text-sm text-gray-700 leading-relaxed">
                Concordo com a{" "}
                <a 
                  href="https://childfundbrasil.org.br/politica-de-privacidade" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-childfund-green hover:underline font-medium"
                >
                  Política de Privacidade de Dados Pessoais
                </a>{" "}
                e estou ciente que meus dados pessoais serão usados para atualização do meu cadastro como doador(a).
              </label>
            </div>
          </div>
          
          {/* reCAPTCHA Verification */}
          <div className="mt-6">
            <h4 className="font-medium mb-4 text-center">Verificação de Segurança</h4>
            <RecaptchaWrapper
              ref={recaptchaRef}
              onVerify={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              onError={handleRecaptchaError}
              className="mb-4"
            />
            {!recaptchaToken && (
              <p className="text-sm text-gray-600 text-center">
                Complete a verificação acima para finalizar sua doação
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={prevStep} variant="outline" className="flex-1">
              Voltar
            </Button>
            <Button 
              onClick={() => {
                if (!recaptchaToken) {
                  toast({
                    title: "Verificação necessária",
                    description: "Por favor, complete a verificação reCAPTCHA",
                    variant: "destructive"
                  });
                  return;
                }
                if (!acceptedPrivacyPolicy) {
                  toast({
                    title: "Política de Privacidade",
                    description: "É necessário aceitar a Política de Privacidade para continuar",
                    variant: "destructive"
                  });
                  return;
                }
                handleSubmit();
              }} 
              className="flex-1 bg-childfund-green hover:bg-childfund-green/90"
              disabled={!recaptchaToken || !acceptedPrivacyPolicy}
            >
              Finalizar Doação
            </Button>
          </div>
        </div>
      )}

      {showCtaCadastro && (
        <div className="bg-green-50 border border-childfund-green rounded-lg p-6 text-center mt-6 animate-fade-in">
          <h2 className="text-xl font-bold text-childfund-green mb-2">Crie sua conta na Área do Doador!</h2>
          <p className="mb-4 text-gray-700">Acompanhe o impacto das suas doações, receba relatórios, mensagens e tenha acesso a benefícios exclusivos.</p>
          <a href="/auth/register">
            <Button className="bg-childfund-green hover:bg-childfund-green/90 text-white text-lg px-8 py-3">Cadastrar na Área do Doador</Button>
          </a>
        </div>
      )}
    </div>
  );
} 