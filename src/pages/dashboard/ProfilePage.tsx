import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, SquarePen } from 'lucide-react';
import LoggedLayout from '@/components/layout/LoggedLayout';
import EditProfileModal from '@/components/EditProfileModal';
import { useFormStepTracking } from '@/hooks/useFormStepTracking';


export default function ProfilePage() {
  const { user, isLoading, refreshProfile } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Tracking de etapas do RD Station
  const { trackFormCompletion } = useFormStepTracking({
    formType: 'profile_update',
    currentStep: 1,
    totalSteps: 1,
    stepName: 'Visualização de Perfil',
    userEmail: user?.email,
    userName: user?.name,
    userPhone: user?.phone,
    userState: user?.state,
    userCity: user?.city
  });

  // ⚠️ DEBUG: Log detalhado do usuário para identificar problema de endereço
  React.useEffect(() => {
    if (user) {
      console.group('🔍 [ProfilePage] DEBUG - Dados do usuário');
      console.log('👤 Usuário completo:', user);
      console.log('📋 Campos básicos:');
      console.log('  - name:', user.name, typeof user.name);
      console.log('  - cpf:', user.cpf, typeof user.cpf);
      console.log('  - email:', user.email, typeof user.email);
      console.log('  - phone:', user.phone, typeof user.phone);
      console.log('  - birthDate:', user.birthDate, typeof user.birthDate);
      console.log('🏠 Campos de endereço:');
      console.log('  - address:', user.address, typeof user.address);
      console.log('  - addressNumber:', user.addressNumber, typeof user.addressNumber);
      console.log('  - addressComplement:', user.addressComplement, typeof user.addressComplement);
      console.log('  - neighborhood:', user.neighborhood, typeof user.neighborhood);
      console.log('  - city:', user.city, typeof user.city);
      console.log('  - state:', user.state, typeof user.state);
      console.log('  - zipCode:', user.zipCode, typeof user.zipCode);
      console.log('🔧 Flags do sistema:');
      console.log('  - isMockUser:', user.isMockUser);
      console.log('  - isDSOUser:', user.isDSOUser);
      
      // Verificar campos vazios
      const emptyFields = [];
      if (!user.address) emptyFields.push('address');
      if (!user.addressNumber) emptyFields.push('addressNumber');
      if (!user.neighborhood) emptyFields.push('neighborhood');
      if (!user.city) emptyFields.push('city');
      if (!user.state) emptyFields.push('state');
      if (!user.zipCode) emptyFields.push('zipCode');
      if (!user.birthDate) emptyFields.push('birthDate');
      
      if (emptyFields.length > 0) {
        console.warn('⚠️ Campos vazios detectados:', emptyFields);
      } else {
        console.log('✅ Todos os campos de endereço estão preenchidos');
      }
      
      console.groupEnd();
    }
  }, [user]);


  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    const numbers = cep.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatDateInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleProfileSave = async () => {
    if (refreshProfile) {
      await refreshProfile();
    }
  };

  if (isLoading) {
    return (
      <LoggedLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-gray-600">Gerencie suas informações pessoais</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carregando...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </LoggedLayout>
    );
  }

  return (
    <LoggedLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>

        {/* Card Único com Todas as Informações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Todas as suas informações pessoais e de endereço</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <SquarePen className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seção Dados Pessoais */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-childfund-green" />
                  Dados Pessoais
                </h3>
                <p className="text-sm text-gray-500">Informações básicas do seu perfil</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    disabled
                    value={user?.name || ''}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    disabled
                    maxLength={14}
                    value={formatCPF(user?.cpf || '')}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    disabled
                    maxLength={15}
                    value={formatPhone(user?.phone || '')}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    disabled
                    value={formatDateInput(user?.birthDate || '')}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Input
                    id="gender"
                    disabled
                    value={user?.gender === 'M' ? 'Masculino' : user?.gender === 'F' ? 'Feminino' : ''}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pronoun">Pronome</Label>
                  <Input
                    id="pronoun"
                    disabled
                    value={user?.pronoun || ''}
                    className="bg-gray-50"
                    placeholder="Não informado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Profissão</Label>
                  <Input
                    id="profession"
                    disabled
                    value={user?.profession || ''}
                    className="bg-gray-50"
                    placeholder="Não informado"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="deficiency">Deficiência</Label>
                  <Input
                    id="deficiency"
                    disabled
                    value={user?.deficiency || ''}
                    className="bg-gray-50"
                    placeholder="Não informado"
                  />
                </div>
              </div>
            </div>

            {/* Seção Endereço */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-childfund-green" />
                  Endereço
                </h3>
                <p className="text-sm text-gray-500">Informações de endereço residencial</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    disabled
                    maxLength={9}
                    value={formatCEP(user?.zipCode || '')}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    disabled
                    value={user?.address || ''}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    disabled
                    value={user?.addressNumber || ''}
                    className="bg-gray-50"
                    placeholder="Não informado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    disabled
                    value={user?.addressComplement || ''}
                    className="bg-gray-50"
                    placeholder="Não informado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    disabled
                    value={user?.neighborhood || ''}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    disabled
                    value={user?.city || ''}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    disabled
                    value={user?.state || ''}
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    disabled
                    value="Brasil"
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Atualize sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
              />
            </div>
            <Button className="bg-childfund-green hover:bg-childfund-green/90">
              Salvar Nova Senha
            </Button>
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <EditProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleProfileSave}
        />
      </div>
    </LoggedLayout>
  );
}
