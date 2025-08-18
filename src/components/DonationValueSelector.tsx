import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DonationValueSelectorProps {
  donationValues: number[];
  donationValue: number;
  customValue: string;
  isMonthly: boolean;
  onCustomValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectValue: (value: number) => void;
  onToggleMonthly: () => void;
  onContinue: () => void;
}

export function DonationValueSelector({
  donationValues,
  donationValue,
  customValue,
  isMonthly,
  onCustomValueChange,
  onSelectValue,
  onToggleMonthly,
  onContinue
}: DonationValueSelectorProps) {
  return (
    <>
      <h3 className="text-xl font-bold mb-6">Escolha o valor da sua contribuição</h3>
      
      <div className="mb-8">
        <label className="block mb-2 font-medium">Tipo de doação</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`p-4 rounded-lg border text-center transition-all ${
              isMonthly 
                ? 'border-primary bg-primary/10 text-primary font-medium' 
                : 'border-gray-300 hover:border-primary hover:bg-primary/5'
            }`}
            onClick={onToggleMonthly}
          >
            Mensal
          </button>
          <button
            className={`p-4 rounded-lg border text-center transition-all ${
              !isMonthly 
                ? 'border-primary bg-primary/10 text-primary font-medium' 
                : 'border-gray-300 hover:border-primary hover:bg-primary/5'
            }`}
            onClick={onToggleMonthly}
          >
            Única
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <label className="block mb-2 font-medium">Valor da contribuição</label>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {donationValues.map((value) => (
            <button
              key={value}
              className={`p-4 rounded-lg border text-center transition-all ${
                donationValue === value && customValue === '' 
                  ? 'border-primary bg-primary/10 text-primary font-medium' 
                  : 'border-gray-300 hover:border-primary hover:bg-primary/5'
              }`}
              onClick={() => onSelectValue(value)}
            >
              R$ {value}
            </button>
          ))}
          <div className={`p-4 rounded-lg border transition-all ${
            customValue !== '' 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300'
          }`}>
            <label htmlFor="customValue" className="text-xs text-gray-500">Outro valor</label>
            <div className="flex items-center">
              <span className="mr-1">R$</span>
              <input
                type="text"
                id="customValue"
                value={customValue}
                onChange={onCustomValueChange}
                className="w-full bg-transparent focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {donationValue > 0 && (
        <motion.div 
          className="bg-green-50 border border-green-100 rounded-lg p-5 mb-8"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Seu impacto com R$ {donationValue}</h4>
              <p className="text-gray-600">
                {isMonthly 
                  ? `Com sua doação mensal de R$ ${donationValue}, você garante alimentação para ${Math.floor(donationValue / 10)} crianças durante um mês.`
                  : `Sua doação única de R$ ${donationValue} proporciona ${Math.floor(donationValue / 50)} kits escolares completos para crianças em vulnerabilidade.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <Button 
        onClick={onContinue} 
        className="w-full bg-primary text-white hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
        disabled={!donationValue || donationValue < 1}
        size="lg"
      >
        <span>Continuar</span>
      </Button>
    </>
  );
} 