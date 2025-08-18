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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DSOService } from '@/services/DSOService';

interface EditPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface PersonalInfoForm {
  name: string;
  phone: string;
  birthDate: string;
}

export default function EditPersonalInfoModal({ isOpen, onClose, onSave }: EditPersonalInfoModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<PersonalInfoForm>({
    name: '',
    phone: '',
    birthDate: ''
  });

  // Preencher formulário com dados atuais do usuário
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [user, isOpen]);

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 11) {
      setFormData(prev => ({
        ...prev,
        phone: formatPhone(rawValue)
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Nome é obrigatório';
    }
    
    if (formData.name.trim().split(' ').length < 2) {
      return 'Insira nome e sobrenome';
    }

    if (!formData.phone.trim()) {
      return 'Telefone é obrigatório';
    }

    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return 'Telefone deve ter 10 ou 11 dígitos';
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
      // Preparar dados para envio
      const updateData = {
        name: formData.name.trim(),
        email: user?.email, // DSO requer email mesmo em atualizações
        phone: formData.phone.replace(/\D/g, ''), // Enviar apenas números
        birthDate: formData.birthDate || undefined
      };

      console.log('🔍 Atualizando informações pessoais:', updateData);

      // Atualizar via DSOService
      const response = await DSOService.updateProfile(updateData);
      
      if (response.success || response) {
        console.log('✅ Informações pessoais atualizadas com sucesso');
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
      console.error('❌ Erro ao atualizar informações pessoais:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar informações pessoais');
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Informações Pessoais</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais. Os campos marcados com * são obrigatórios.
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
                ✅ Informações atualizadas com sucesso!
              </AlertDescription>
            </Alert>
          )}

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
            <Label htmlFor="edit-cpf">CPF (somente leitura)</Label>
            <Input
              id="edit-cpf"
              value={formatCPF(user?.cpf || '')}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">E-mail (somente leitura)</Label>
            <Input
              id="edit-email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50"
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