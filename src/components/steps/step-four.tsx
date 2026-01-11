'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';

// IMPORTANT: Replace with your actual Google Review link
const GOOGLE_REVIEW_LINK = 'https://g.page/r/your-google-page/review';

export default function StepFour() {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500">
      <div className="text-center space-y-2">
        <h1 className="font-headline text-3xl font-bold">Obrigado pela sua resposta 🙌</h1>
        <p className="text-foreground/80 text-lg">
          Agora só falta cumprir a missão para liberar o seu prêmio 👇
        </p>
      </div>

      <Card className="text-left bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold text-xl">
            <PartyPopper className="h-6 w-6 text-primary" />
            <span>Missão Final</span>
          </CardTitle>
          <CardDescription className="text-foreground/90">
            Avalie o Baiano Burger no Google e ajude a fortalecer nosso trabalho 💛
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noopener noreferrer" className='w-full'>
            <Button className="w-full font-bold text-base py-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              Avaliar no Google agora
            </Button>
          </a>
        </CardContent>
      </Card>

      <div className="text-center space-y-4 pt-4">
        <p className="text-2xl font-bold">Pronto! ✅</p>
        <p className="text-lg text-foreground/80 leading-relaxed">
          Mostre sua avaliação na tela do celular para a nossa equipe no caixa e retire seu prêmio! 🎁🔥
        </p>
      </div>
    </div>
  );
}
