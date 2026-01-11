'use client';

import { useState } from 'react';
import StepOne from '@/components/steps/step-one';
import StepTwo from '@/components/steps/step-two';
import StepThree from '@/components/steps/step-three';
import StepFour from '@/components/steps/step-four';
import { Logo } from '@/components/logo';

export type FormData = {
  nome: string;
  telefone: string;
  comoNosConheceu: 'Google' | 'Presencialmente' | 'Mais delivery' | 'Instagram' | 'Blogueira' | '';
  blogueiraNome: string;
  avaliacaoGeral: number;
  atendimento: 'Excelente' | 'Bom' | 'Regular' | 'Ruim' | '';
  agilidade: 'Muito rápido' | 'Dentro do esperado' | 'Demorado' | '';
  burger: 'Perfeito 🔥' | 'Bom 👍' | 'Poderia melhorar 🤔' | '';
  melhoriaBurger: string;
  sugestao: string;
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    comoNosConheceu: '',
    blogueiraNome: '',
    avaliacaoGeral: 0,
    atendimento: '',
    agilidade: '',
    burger: '',
    melhoriaBurger: '',
    sugestao: '',
  });

  const nextStep = () => setStep((prev) => prev + 1);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepOne nextStep={nextStep} updateFormData={updateFormData} formData={formData} />;
      case 2:
        return <StepTwo nextStep={nextStep} />;
      case 3:
        return (
          <StepThree
            nextStep={nextStep}
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return <StepFour />;
      default:
        return <StepOne nextStep={nextStep} updateFormData={updateFormData} formData={formData} />;
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        {step < 4 && (
          <div className="flex justify-center">
            <Logo />
          </div>
        )}
        {renderStep()}
      </div>
    </main>
  );
}
