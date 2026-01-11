'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StepTwoProps {
  nextStep: () => void;
}

export default function StepTwo({ nextStep }: StepTwoProps) {
  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-3xl font-bold">
          Queremos ouvir você 🍔
        </CardTitle>
        <CardDescription className="text-base pt-2">
          Sua opinião ajuda o Baiano Burger a melhorar cada vez mais. É rapidinho e no final tem prêmio 🔥
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={nextStep} className="w-full font-bold text-base py-6">
          Começar pesquisa
        </Button>
      </CardContent>
    </Card>
  );
}
