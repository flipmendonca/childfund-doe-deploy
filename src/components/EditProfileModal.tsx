import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DSOService } from '@/services/DSOService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface ProfileForm {
  // Dados pessoais
  name: string;
  email: string;
  document: string;
  phone: string;
  birthDate: string;
  gender: string;
  pronoun: string;
  profession: string;
  deficiency: string;
  
  // Endereço
  cep: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// Estados brasileiros
const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

const GENDERS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' }
];

const PRONOUNS = [
  { value: 'ele/dele', label: 'Ele/Dele' },
  { value: 'ela/dela', label: 'Ela/Dela' },
  { value: 'elu/delu', label: 'Elu/Delu' }
];

export default function EditProfileModal({ isOpen, onClose, onSave }: EditProfileModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Removido sistema de abas para formulário único vertical
  
  const [formData, setFormData] = useState<ProfileForm>({
    // Dados pessoais
    name: '',
    email: '',
    document: '',
    phone: '',
    birthDate: '',
    gender: '',
    pronoun: '',
    profession: '',
    deficiency: '',
    
    // Endereço
    cep: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'BR'
  });

  // Preencher formulário com dados atuais do usuário
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        // Dados pessoais
        name: user.name || '',
        email: user.email || '',
        document: user.cpf || '',
        phone: user.phone || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        pronoun: '', // Campo novo, pode não existir no user
        profession: '', // Campo novo, pode não existir no user
        deficiency: '', // Campo novo, pode não existir no user
        
        // Endereço
        cep: user.zipCode || '',
        address: user.address || '',
        addressNumber: user.addressNumber || '',
        addressComplement: user.addressComplement || '',
        neighborhood: user.neighborhood || '',
        city: user.city || '',
        state: user.state || '',
        country: 'BR'
      });
      setError(null);
      setSuccess(false);
      // Formulário único, sem abas
    }
  }, [user, isOpen]);

  const formatCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const formatCEP = (cep: string) => {
    const numbers = cep.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    return cep;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 11) {
      setFormData(prev => ({
        ...prev,
        phone: formatPhone(rawValue)
      }));
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 11) {
      setFormData(prev => ({
        ...prev,
        document: formatCPF(rawValue)
      }));
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: formattedCEP }));

    // Auto-buscar endereço quando CEP estiver completo
    const numbers = formattedCEP.replace(/\D/g, '');
    if (numbers.length === 8) {
      searchCEP(numbers);
    }
  };

  const searchCEP = async (cep: string) => {
    if (cep.length !== 8) return;

    setIsLoadingCEP(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return;
      }

      // Preencher campos automaticamente
      setFormData(prev => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        addressComplement: data.complemento || prev.addressComplement
      }));


    } catch (err) {
      setError('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const validateForm = (): string | null => {
    // Campos obrigatórios conforme documentação
    if (!formData.name.trim()) {
      return 'Nome é obrigatório';
    }
    
    if (formData.name.trim().split(' ').length < 2) {
      return 'Insira nome e sobrenome';
    }

    if (!formData.email.trim()) {
      return 'E-mail é obrigatório';
    }

    if (!formData.document.trim()) {
      return 'CPF é obrigatório';
    }

    if (!formData.phone.trim()) {
      return 'Telefone é obrigatório';
    }

    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return 'Telefone deve ter 10 ou 11 dígitos';
    }

    if (!formData.address.trim()) {
      return 'Endereço é obrigatório';
    }

    if (!formData.city.trim()) {
      return 'Cidade é obrigatória';
    }

    if (!formData.state.trim()) {
      return 'Estado é obrigatório';
    }

    if (!formData.cep.trim()) {
      return 'CEP é obrigatório';
    }

    const cepNumbers = formData.cep.replace(/\D/g, '');
    if (cepNumbers.length !== 8) {
      return 'CEP deve ter 8 dígitos';
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      // Scroll para o topo para mostrar o erro
      setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"] .overflow-y-auto');
        if (dialogContent) {
          dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Preparar dados para envio (mapear para formato DSO)
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        document: formData.document.replace(/\D/g, ''), // Apenas números
        phone: formData.phone.replace(/\D/g, ''), // Apenas números
        birthDate: formData.birthDate || undefined,
        pronoun: formData.pronoun || undefined,
        profession: formData.profession.trim() || undefined,
        deficiency: formData.deficiency.trim() || undefined,
        
        // Endereço - mapear para campos corretos do DSO
        cep: formData.cep.replace(/\D/g, ''), // Apenas números
        street: formData.address.trim(), // DSO usa 'street' não 'address'
        number: formData.addressNumber.trim() || undefined, // DSO usa 'number' não 'addressNumber'
        addressComplement: formData.addressComplement.trim() || undefined,
        neighborhood: formData.neighborhood.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country
      };

      // Adicionar gender apenas se for válido
      if (formData.gender && (formData.gender === 'M' || formData.gender === 'F')) {
        updateData.gender = formData.gender;
      }

      console.log('🔍 Dados para atualização:', updateData);

      // Atualizar via DSOService
      const response = await DSOService.updateProfile(updateData);
      
      // Se chegou até aqui sem lançar erro, foi sucesso
      setIsLoading(false); // Resetar loading primeiro
      setSuccess(true); // Depois marcar como sucesso
      
      // Scroll para o topo para mostrar mensagem de sucesso
      setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"] .overflow-y-auto');
        if (dialogContent) {
          dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      
      // Aguardar menos tempo e dar feedback visual melhor
      setTimeout(() => {
        onSave(); // Callback para atualizar dados na página pai
        
        // Mostrar notificação na página principal
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
        notification.innerHTML = '✅ Perfil atualizado com sucesso!';
        document.body.appendChild(notification);
        
        // Animação de entrada
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          notification.style.transition = 'transform 0.3s ease-in-out';
          notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remover notificação após 4 segundos
        setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 4000);
        
        onClose(); // Fechar modal
        window.location.reload(); // Refresh da página para mostrar dados atualizados
      }, 1200); // Reduzido para 1200ms

    } catch (err) {
      console.error('❌ Erro ao atualizar perfil:', err);
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      
      // Scroll para o topo para mostrar o erro
      setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"] .overflow-y-auto');
        if (dialogContent) {
          dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(false);
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e endereço. Os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        {/* Área de feedback sempre visível no topo */}
        <div className="space-y-2">
          {/* Mensagem de loading */}
          {isLoading && (
            <Alert className="border-blue-200 bg-blue-50">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                <AlertDescription className="text-blue-800 font-medium">
                  Salvando suas alterações... Aguarde, não feche esta janela.
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          {/* Mensagem de sucesso */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800 font-medium">
                ✅ Perfil atualizado com sucesso! Fechando...
              </AlertDescription>
            </Alert>
          )}
          
          {/* Mensagem de erro */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-4 py-4">

          {/* Seção Dados Pessoais */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>
              <p className="text-sm text-gray-500">Informações básicas do seu perfil</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome Completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite seu nome completo"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-document">CPF *</Label>
              <Input
                id="edit-document"
                value={formData.document}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                disabled={isLoading}
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                disabled={isLoading}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-birthDate">Data de Nascimento</Label>
              <Input
                id="edit-birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gênero</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu gênero" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pronoun">Pronome</Label>
              <Select
                value={formData.pronoun}
                onValueChange={(value) => setFormData(prev => ({ ...prev, pronoun: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu pronome" />
                </SelectTrigger>
                <SelectContent>
                  {PRONOUNS.map((pronoun) => (
                    <SelectItem key={pronoun.value} value={pronoun.value}>
                      {pronoun.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-profession">Profissão</Label>
              <Input
                id="edit-profession"
                value={formData.profession}
                onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                placeholder="Sua profissão"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-deficiency">Deficiência</Label>
              <Input
                id="edit-deficiency"
                value={formData.deficiency}
                onChange={(e) => setFormData(prev => ({ ...prev, deficiency: e.target.value }))}
                placeholder="Descreva se houver alguma deficiência"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Seção Endereço */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
              <p className="text-sm text-gray-500">Informações de endereço residencial</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cep">CEP *</Label>
              <div className="relative">
                <Input
                  id="edit-cep"
                  value={formData.cep}
                  onChange={handleCEPChange}
                  placeholder="00000-000"
                  disabled={isLoading}
                  maxLength={9}
                />
                {isLoadingCEP && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Logradouro *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, Avenida, etc."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-addressNumber">Número</Label>
              <Input
                id="edit-addressNumber"
                value={formData.addressNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, addressNumber: e.target.value }))}
                placeholder="123"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-addressComplement">Complemento</Label>
              <Input
                id="edit-addressComplement"
                value={formData.addressComplement}
                onChange={(e) => setFormData(prev => ({ ...prev, addressComplement: e.target.value }))}
                placeholder="Apto, Bloco, etc."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-neighborhood">Bairro</Label>
              <Input
                id="edit-neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                placeholder="Nome do bairro"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-city">Cidade *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Nome da cidade"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-state">Estado *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label} ({state.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-country">País</Label>
              <Input
                id="edit-country"
                value="Brasil"
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || success}
            className={`${
              success 
                ? 'bg-green-600 hover:bg-green-600 cursor-not-allowed' 
                : 'bg-childfund-green hover:bg-childfund-green/90'
            } transition-colors duration-300`}
          >
            {success ? (
              <>
                ✅ Salvo com sucesso!
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando suas alterações...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}