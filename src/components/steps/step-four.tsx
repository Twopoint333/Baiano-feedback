'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const GOOGLE_REVIEW_LINK = 'https://maps.app.goo.gl/Z9txxdfoj3puf7V49?g_st=ic';
const MIN_REVIEW_TIME_MS = 30000; // 30 segundos

export default function StepFour() {
  const [reviewButtonClickedTime, setReviewButtonClickedTime] = useState<number | null>(null);
  const [showPrize, setShowPrize] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    const storedTime = localStorage.getItem('reviewButtonClickedTime');
    if (storedTime) {
      setReviewButtonClickedTime(Number(storedTime));
    }

    const prizeUnlocked = localStorage.getItem('prizeUnlocked');
    if (prizeUnlocked === 'true') {
      setShowPrize(true);
    }
  }, []);

  const handleReviewClick = () => {
    const now = Date.now();
    localStorage.setItem('reviewButtonClickedTime', String(now));
    setReviewButtonClickedTime(now);
    window.open(GOOGLE_REVIEW_LINK, '_blank');
  };

  const handleVerifyReview = () => {
    const now = Date.now();

    if (!reviewButtonClickedTime) {
      toast({
        variant: 'destructive',
        title: 'Ação necessária',
        description: 'Você precisa clicar no botão "Avaliar no Google" primeiro.',
      });
      return;
    }

    const timeElapsed = now - reviewButtonClickedTime;

    if (timeElapsed < MIN_REVIEW_TIME_MS) {
      const secondsRemaining = Math.ceil((MIN_REVIEW_TIME_MS - timeElapsed) / 1000);
      toast({
        variant: 'destructive',
        title: 'Quase lá!',
        description: `Por favor, faça sua avaliação. Você poderá tentar novamente em ${secondsRemaining} segundos.`,
      });
      return;
    }
    
    // Aqui viria a lógica para verificar no Firestore se o telefone já participou.
    // Como combinado, vamos deixar para o próximo passo.

    localStorage.setItem('prizeUnlocked', 'true');
    setShowPrize(true);

    toast({
      title: 'Obrigado pela sua avaliação!',
      description: 'Sua roleta de prêmios foi desbloqueada! 🔥',
    });
  };

  if (showPrize) {
    return (
        <div className="w-full space-y-6 animate-in fade-in-50 duration-500 text-center">
             <h1 className="font-headline text-3xl font-bold">Roleta Premiada! 🎡</h1>
             <p className="text-foreground/80 text-lg">
                Gire a roleta para descobrir seu prêmio.
             </p>
             <Card>
                <CardContent className="p-6">
                    {/* O componente da roleta será inserido aqui */}
                    <div className="bg-muted aspect-square rounded-full flex items-center justify-center">
                       <p className="text-muted-foreground">Roleta em breve...</p>
                    </div>
                </CardContent>
             </Card>
             <p className="text-lg text-foreground/80 leading-relaxed">
               Mostre a tela para nossa equipe no caixa para validar e retirar seu prêmio! 🔥
             </p>
        </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500">
      <div className="text-center space-y-2">
        <h1 className="font-headline text-3xl font-bold">Fala Baiano, chegou a hora do seu prêmio! 🎁</h1>
        <p className="text-foreground/80 text-lg">
          Nos avalie no Google e desbloqueie a <span className="font-bold text-primary">roleta premiada</span>.
        </p>
      </div>

      <Card className="text-left bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold text-xl">
            <PartyPopper className="h-6 w-6 text-primary" />
            <span>Passo 1: Avalie no Google</span>
          </CardTitle>
          <CardDescription className="text-foreground/90">
            Sua opinião é muito importante. Clique no botão abaixo para abrir o Google e deixar sua avaliação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleReviewClick} className="w-full font-bold text-base py-6">
            Avaliar no Google agora
          </Button>
        </CardContent>
      </Card>

      <Card className="text-left bg-card">
         <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold text-xl">
            <Timer className="h-6 w-6 text-primary" />
            <span>Passo 2: Libere seu prêmio</span>
          </CardTitle>
          <CardDescription className="text-foreground/90">
            Depois de avaliar, volte aqui e clique no botão abaixo para liberar sua roleta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleVerifyReview} variant="secondary" className="w-full font-bold text-base py-6">
            Já avaliei, liberar roleta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
