import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Settings, Bell, Mail, Lock, CreditCard, Shield, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoggedLayout from "../../components/layout/LoggedLayout";

interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    newsletter: boolean;
  };
  security: {
    twoFactor: boolean;
    loginAlerts: boolean;
  };
  privacy: {
    profileVisibility: boolean;
    activityStatus: boolean;
  };
}

const mockSettings: UserSettings = {
  notifications: {
    email: true,
    sms: false,
    push: true,
    newsletter: true
  },
  security: {
    twoFactor: false,
    loginAlerts: true
  },
  privacy: {
    profileVisibility: true,
    activityStatus: true
  }
};

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(mockSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState<UserSettings>(mockSettings);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/login");
    }
    
    document.title = "Configurações - ChildFund Brasil";
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-childfund-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSettings(settings);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedSettings(settings);
  };

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as alterações
    console.log("Salvando configurações:", editedSettings);
    setSettings(editedSettings);
    setIsEditing(false);
  };

  const handleToggle = (section: keyof UserSettings, key: string) => {
    setEditedSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]]
      }
    }));
  };

  return (
    <LoggedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-childfund-green">Configurações</h1>
            <p className="text-gray-600">Gerencie suas preferências e configurações</p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline">
              <Settings className="mr-2" size={16} />
              Editar Configurações
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline">
                <X className="mr-2" size={16} />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-childfund-green hover:bg-childfund-green/90">
                <Save className="mr-2" size={16} />
                Salvar
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          </TabsList>

          {/* Aba Notificações */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure como você deseja receber nossas comunicações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">E-mails</p>
                    <p className="text-sm text-gray-600">Receba atualizações por e-mail</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedSettings.notifications.email : settings.notifications.email}
                    onCheckedChange={() => handleToggle("notifications", "email")}
                    disabled={!isEditing}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-gray-600">Receba lembretes por SMS</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedSettings.notifications.sms : settings.notifications.sms}
                    onCheckedChange={() => handleToggle("notifications", "sms")}
                    disabled={!isEditing}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações Push</p>
                    <p className="text-sm text-gray-600">Receba notificações no navegador</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedSettings.notifications.push : settings.notifications.push}
                    onCheckedChange={() => handleToggle("notifications", "push")}
                    disabled={!isEditing}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Newsletter</p>
                    <p className="text-sm text-gray-600">Receba novidades e campanhas</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedSettings.notifications.newsletter : settings.notifications.newsletter}
                    onCheckedChange={() => handleToggle("notifications", "newsletter")}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Gerencie suas configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticação em Duas Etapas</p>
                    <p className="text-sm text-gray-600">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedSettings.security.twoFactor : settings.security.twoFactor}
                    onCheckedChange={() => handleToggle("security", "twoFactor")}
                    disabled={!isEditing}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Login</p>
                    <p className="text-sm text-gray-600">Receba notificações de novos logins</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedSettings.security.loginAlerts : settings.security.loginAlerts}
                    onCheckedChange={() => handleToggle("security", "loginAlerts")}
                    disabled={!isEditing}
                  />
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  <Lock className="mr-2" size={16} />
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Privacidade */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacidade</CardTitle>
                <CardDescription>
                  Configure suas preferências de privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Visibilidade do Perfil</p>
                    <p className="text-sm text-gray-600">Torne seu perfil visível para outros usuários</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedSettings.privacy.profileVisibility : settings.privacy.profileVisibility}
                    onCheckedChange={() => handleToggle("privacy", "profileVisibility")}
                    disabled={!isEditing}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Status de Atividade</p>
                    <p className="text-sm text-gray-600">Mostre quando você está online</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedSettings.privacy.activityStatus : settings.privacy.activityStatus}
                    onCheckedChange={() => handleToggle("privacy", "activityStatus")}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LoggedLayout>
  );
} 