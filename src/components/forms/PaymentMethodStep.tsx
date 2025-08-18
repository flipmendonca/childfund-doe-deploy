import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDonation } from '@/contexts/DonationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  Building, 
  Lock,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import { paymentSchema } from '@/utils/validationSchemas';
import { useToast } from '@/hooks/use-toast';
import { formatCardNumber, cleanNumericString } from '@/utils/formatters';
import { usePaymentProcessor } from '@/hooks/usePaymentProcessor';
import { BRAZILIAN_BANKS } from '@/data/banks';

interface PaymentMethodStepProps {
  isNewUser: boolean;
  onNext: () => void;
  onPrev: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function PaymentMethodStep({ 
  isNewUser, 
  onNext, 
  onPrev, 
  isProcessing, 
  setIsProcessing 
}: PaymentMethodStepProps) {
  const { state, setPaymentData, setCurrentStep } = useDonation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>(
    state.data_payment_fields.method === 'debit' ? 'bank_transfer' : (state.data_payment_fields.method || 'credit_card')
  );
  
  const [formData, setFormData] = useState({
    // Dados do cartão
    cardNumber: state.data_payment_fields.cardNumber || '',
    cardName: state.data_payment_fields.cardName || '',
    expiryMonth: state.data_payment_fields.expiryMonth || '',
    expiryYear: state.data_payment_fields.expiryYear || '',
    cvv: state.data_payment_fields.cvv || '',
    
    // Dados bancários (débito automático)
    bankCode: state.data_payment_fields.bankCode || '',
    agency: state.data_payment_fields.agency || '',
    account: state.data_payment_fields.account || '',
    accountType: state.data_payment_fields.accountType || 'checking'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lista de bancos para débito automático (conforme servidor de produção)
  const banks = BRAZILIAN_BANKS;

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'cvv') {
      formattedValue = cleanNumericString(value).slice(0, 4);
    } else if (field === 'expiryMonth') {
      formattedValue = cleanNumericString(value).slice(0, 2);
      if (parseInt(formattedValue) > 12) formattedValue = '12';
    } else if (field === 'expiryYear') {
      formattedValue = cleanNumericString(value).slice(0, 4);
    } else if (field === 'agency' || field === 'account') {
      formattedValue = cleanNumericString(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePaymentData = () => {
    const paymentData = {
      method: paymentMethod,
      cardNumber: paymentMethod === 'credit_card' ? cleanNumericString(formData.cardNumber) : undefined,
      cardName: paymentMethod === 'credit_card' ? formData.cardName : undefined,
      expiryMonth: paymentMethod === 'credit_card' ? formData.expiryMonth : undefined,
      expiryYear: paymentMethod === 'credit_card' ? formData.expiryYear : undefined,
      cvv: paymentMethod === 'credit_card' ? formData.cvv : undefined,
      bankCode: paymentMethod === 'bank_transfer' ? formData.bankCode : undefined,
      agency: paymentMethod === 'bank_transfer' ? formData.agency : undefined,
      account: paymentMethod === 'bank_transfer' ? formData.account : undefined,
      accountType: paymentMethod === 'bank_transfer' ? formData.accountType : undefined
    };

    const validation = paymentSchema.safeParse(paymentData);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(error => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  // Hook customizado para processamento de pagamento
  const { processPayment: processPaymentHook } = usePaymentProcessor({
    onSuccess: () => {
      // Já será redirecionado para success dentro do hook
    },
    onError: (error) => {
      console.error('Payment processing error:', error);
    }
  });

  const processPayment = async () => {
    if (!validatePaymentData()) {
      toast({
        title: "Dados de pagamento inválidos",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Salvar dados de pagamento no contexto antes do processamento
    setPaymentData({
      method: paymentMethod,
      cardNumber: cleanNumericString(formData.cardNumber),
      cardName: formData.cardName,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      cvv: formData.cvv,
      bankCode: formData.bankCode,
      agency: formData.agency,
      account: formData.account,
      accountType: formData.accountType
    });

    // Usar o hook customizado para processar o pagamento
    await processPaymentHook(isNewUser);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">Método de pagamento</h3>
      
      {/* Seleção do método de pagamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card 
          className={`cursor-pointer transition-all ${
            paymentMethod === 'credit_card' 
              ? 'border-childfund-green bg-childfund-green/5' 
              : 'border-gray-200 hover:border-childfund-green/50'
          }`}
          onClick={() => setPaymentMethod('credit_card')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard 
                className={paymentMethod === 'credit_card' ? 'text-childfund-green' : 'text-gray-500'} 
                size={24} 
              />
              <div>
                <h4 className="font-medium">Cartão de Crédito</h4>
                <p className="text-sm text-gray-600">Visa, Mastercard, Elo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            paymentMethod === 'bank_transfer' 
              ? 'border-childfund-green bg-childfund-green/5' 
              : 'border-gray-200 hover:border-childfund-green/50'
          }`}
          onClick={() => setPaymentMethod('bank_transfer')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building 
                className={paymentMethod === 'bank_transfer' ? 'text-childfund-green' : 'text-gray-500'} 
                size={24} 
              />
              <div>
                <h4 className="font-medium">Débito Automático</h4>
                <p className="text-sm text-gray-600">Desconto direto na conta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário do cartão de crédito */}
      {paymentMethod === 'credit_card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Número do cartão */}
          <div>
            <Label htmlFor="cardNumber" className="flex items-center gap-2">
              <CreditCard size={16} />
              Número do cartão *
            </Label>
            <Input
              id="cardNumber"
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className={errors.cardNumber ? 'border-red-500' : ''}
            />
            {errors.cardNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
            )}
          </div>

          {/* Nome no cartão */}
          <div>
            <Label htmlFor="cardName" className="flex items-center gap-2">
              <User size={16} />
              Nome no cartão *
            </Label>
            <Input
              id="cardName"
              type="text"
              value={formData.cardName}
              onChange={(e) => handleInputChange('cardName', e.target.value.toUpperCase())}
              placeholder="NOME COMO NO CARTÃO"
              className={errors.cardName ? 'border-red-500' : ''}
            />
            {errors.cardName && (
              <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>
            )}
          </div>

          {/* Validade e CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expiryMonth" className="flex items-center gap-2">
                <Calendar size={16} />
                Mês *
              </Label>
              <Input
                id="expiryMonth"
                type="text"
                value={formData.expiryMonth}
                onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                placeholder="MM"
                maxLength={2}
                className={errors.expiryMonth ? 'border-red-500' : ''}
              />
              {errors.expiryMonth && (
                <p className="text-sm text-red-500 mt-1">{errors.expiryMonth}</p>
              )}
            </div>

            <div>
              <Label htmlFor="expiryYear">Ano *</Label>
              <Input
                id="expiryYear"
                type="text"
                value={formData.expiryYear}
                onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                placeholder="AAAA"
                maxLength={4}
                className={errors.expiryYear ? 'border-red-500' : ''}
              />
              {errors.expiryYear && (
                <p className="text-sm text-red-500 mt-1">{errors.expiryYear}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cvv" className="flex items-center gap-2">
                <Lock size={16} />
                CVV *
              </Label>
              <Input
                id="cvv"
                type="text"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="000"
                maxLength={4}
                className={errors.cvv ? 'border-red-500' : ''}
              />
              {errors.cvv && (
                <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Formulário do débito automático */}
      {paymentMethod === 'bank_transfer' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Banco */}
          <div>
            <Label htmlFor="bankCode">Banco *</Label>
            <select
              id="bankCode"
              value={formData.bankCode}
              onChange={(e) => handleInputChange('bankCode', e.target.value)}
              className={`w-full h-10 px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md ${errors.bankCode ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione o banco</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
            {errors.bankCode && (
              <p className="text-sm text-red-500 mt-1">{errors.bankCode}</p>
            )}
          </div>

          {/* Agência e Conta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agency">Agência *</Label>
              <Input
                id="agency"
                type="text"
                value={formData.agency}
                onChange={(e) => handleInputChange('agency', e.target.value)}
                placeholder="0000"
                className={errors.agency ? 'border-red-500' : ''}
              />
              {errors.agency && (
                <p className="text-sm text-red-500 mt-1">{errors.agency}</p>
              )}
            </div>

            <div>
              <Label htmlFor="account">Conta *</Label>
              <Input
                id="account"
                type="text"
                value={formData.account}
                onChange={(e) => handleInputChange('account', e.target.value)}
                placeholder="00000-0"
                className={errors.account ? 'border-red-500' : ''}
              />
              {errors.account && (
                <p className="text-sm text-red-500 mt-1">{errors.account}</p>
              )}
            </div>
          </div>

          {/* Tipo de conta */}
          <div>
            <Label htmlFor="accountType">Tipo de conta *</Label>
            <select
              id="accountType"
              value={formData.accountType}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
              className={`w-full h-10 px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md ${errors.accountType ? 'border-red-500' : ''}`}
            >
              <option value="checking">Conta Corrente</option>
              <option value="savings">Conta Poupança</option>
            </select>
            {errors.accountType && (
              <p className="text-sm text-red-500 mt-1">{errors.accountType}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Resumo da doação */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Resumo da sua doação</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tipo:</span>
              <span className="font-medium">
                {state.data_donation_fields.type === 'sponsorship' && 'Apadrinhamento'}
                {state.data_donation_fields.type === 'recurrent' && 'Doação Recorrente'}
                {state.data_donation_fields.type === 'donate' && 'Doação Única'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Valor:</span>
              <span className="font-medium text-childfund-green">
                R$ {state.data_donation_fields.value}
                {state.data_donation_fields.type !== 'donate' && '/mês'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pagamento:</span>
              <span className="font-medium">
                {paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'Débito Automático'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de navegação */}
      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onPrev}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar
        </Button>
        
        <Button 
          onClick={processPayment}
          disabled={isProcessing}
          className="flex-1 bg-childfund-green text-white hover:bg-childfund-green/90 transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <span>Finalizar doação</span>
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </div>

      {/* Segurança */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-4">
        <Lock size={16} />
        <span>Seus dados estão protegidos com criptografia SSL</span>
      </div>
    </div>
  );
}