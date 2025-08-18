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
import { Loader2, Save, X, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DSOService } from '@/services/DSOService';

interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface AddressForm {
  zipCode: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
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

export default function EditAddressModal({ isOpen, onClose, onSave }: EditAddressModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<AddressForm>({
    zipCode: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Preencher formulário com dados atuais do usuário
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        zipCode: user.zipCode || '',
        address: user.address || '',
        addressNumber: user.addressNumber || '',
        addressComplement: user.addressComplement || '',
        neighborhood: user.neighborhood || '',
        city: user.city || '',
        state: user.state || ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [user, isOpen]);

  const formatCEP = (cep: string) => {
    const numbers = cep.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    return cep;
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value);
    setFormData(prev => ({ ...prev, zipCode: formattedCEP }));

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

      console.log('✅ Endereço encontrado via ViaCEP:', data);

    } catch (err) {
      console.error('❌ Erro ao buscar CEP:', err);
      setError('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.zipCode.trim()) {
      return 'CEP é obrigatório';
    }

    const cepNumbers = formData.zipCode.replace(/\D/g, '');
    if (cepNumbers.length !== 8) {
      return 'CEP deve ter 8 dígitos';
    }

    if (!formData.address.trim()) {
      return 'Endereço é obrigatório';
    }

    if (!formData.addressNumber.trim()) {
      return 'Número é obrigatório';
    }

    if (!formData.neighborhood.trim()) {
      return 'Bairro é obrigatório';
    }

    if (!formData.city.trim()) {
      return 'Cidade é obrigatória';
    }

    if (!formData.state.trim()) {
      return 'Estado é obrigatório';
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preparar dados para envio (mapear para formato DSO)
      const updateData = {
        email: user?.email, // DSO requer email mesmo em atualizações
        cep: formData.zipCode.replace(/\D/g, ''), // Apenas números
        address: formData.address.trim(), // DSO usa 'address' não 'street'
        addressNumber: formData.addressNumber.trim(), // DSO usa 'addressNumber'
        addressComplement: formData.addressComplement.trim(),
        neighborhood: formData.neighborhood.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: 'BR'
      };

      console.log('🔍 Atualizando endereço:', updateData);

      // Atualizar via DSOService
      const response = await DSOService.updateProfile(updateData);
      
      if (response.success || response) {
        console.log('✅ Endereço atualizado com sucesso');
        setSuccess(true);
        
        // Aguardar um momento para mostrar sucesso
        setTimeout(() => {
          onSave(); // Callback para atualizar dados na página pai
          onClose(); // Fechar modal
        }, 1500);
      } else {
        throw new Error('Falha na atualização');
      }

    } catch (err) {
      console.error('❌ Erro ao atualizar endereço:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar endereço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Endereço</DialogTitle>
          <DialogDescription>
            Atualize seu endereço residencial. Os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✅ Endereço atualizado com sucesso!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-zipCode">CEP *</Label>
            <div className="relative">
              <Input
                id="edit-zipCode"
                value={formData.zipCode}
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

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="edit-addressNumber">Número *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-neighborhood">Bairro *</Label>
            <Input
              id="edit-neighborhood"
              value={formData.neighborhood}
              onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
              placeholder="Nome do bairro"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
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
                  <SelectValue placeholder="Selecione" />
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
            className="bg-childfund-green hover:bg-childfund-green/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
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