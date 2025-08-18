import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Send, AlertCircle } from 'lucide-react';
import { DSOService } from '@/services/DSOService';
import { useToast } from '@/hooks/use-toast';

interface GiftFormProps {
  childId: string;
  childName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function GiftForm({ childId, childName, onSuccess, onCancel }: GiftFormProps) {
  const [giftType, setGiftType] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const giftTypes = [
    { value: 'toy', label: 'Brinquedo' },
    { value: 'book', label: 'Livro' },
    { value: 'clothing', label: 'Roupa' },
    { value: 'educational', label: 'Material Educacional' },
    { value: 'other', label: 'Outro' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!giftType || !title || !message || !value) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Usar a nova interface conforme documentação DSO
      const giftData = {
        childId,
        title,
        type: giftType,
        value: numericValue,
        message,
      };

      console.log('🔍 Enviando presente:', giftData);
      
      const response = await DSOService.sendGift(giftData);
      
      console.log('✅ Resposta do envio do presente:', response);
      
      toast({
        title: "Presente enviado!",
        description: `Seu presente para ${childName} foi enviado com sucesso.`,
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('❌ Erro ao enviar presente:', error);
      toast({
        title: "Erro ao enviar presente",
        description: `Não foi possível enviar o presente: ${error instanceof Error ? error.message : 'Tente novamente.'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-childfund-green">
          <Gift className="h-5 w-5" />
          Enviar Presente
        </CardTitle>
        <CardDescription>
          Envie um presente especial para {childName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título/Nome do Presente *</Label>
            <Input
              id="title"
              placeholder="Ex: Kit escolar, Bicicleta, Livro de histórias..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="giftType">Tipo de Presente *</Label>
            <Select value={giftType} onValueChange={setGiftType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de presente" />
              </SelectTrigger>
              <SelectContent>
                {giftTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$) *</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem para a criança *</Label>
            <Textarea
              id="message"
              placeholder="Escreva uma mensagem especial para a criança..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Importante:</p>
                <p>O presente será entregue à criança através do ChildFund Brasil. A entrega pode levar algumas semanas.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-childfund-orange hover:bg-childfund-orange/90"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Presente
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 