'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper, Timer, Gift, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Roulette } from '@/components/roulette';
import type { FormData } from '@/app/page';
import { useFirebase, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const GOOGLE_REVIEW_LINK = 'https://maps.app.goo.gl/Z9txxdfoj3puf7V49?g_st=ic';
const MIN_REVIEW_TIME_S = 30; // 30 segundos

type StepState = 'initial' | 'counting' | 'ready' | 'claimed';

export default function StepFour({ formData }: { formData: FormData }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  // Sanitize phone number to use as a document ID
  const prizeDocId = formData.telefone.replace(/\D/g, '');

  const prizeClaimRef = useMemoFirebase(() => {
    if (!firestore || !prizeDocId) return null;
    return doc(firestore, 'prize_claims', prizeDocId);
  }, [firestore, prizeDocId]);

  const [showPrize, setShowPrize] = useState(false);
  const [stepState, setStepState] = useState<StepState>('initial');
  const [secondsRemaining, setSecondsRemaining] = useState(MIN_REVIEW_TIME_S);

  // This effect handles the timer logic based on localStorage.
  // It is the main driver for the UI state before the prize is claimed.
  useEffect(() => {
    const reviewTimeKey = `reviewButtonClickedTime_${formData.telefone}`;
    const reviewTime = localStorage.getItem(reviewTimeKey);
    
    if (reviewTime) {
      const timeElapsed = (Date.now() - Number(reviewTime)) / 1000;
      if (timeElapsed >= MIN_REVIEW_TIME_S) {
        setStepState('ready');
      } else {
        setStepState('counting');
        setSecondsRemaining(Math.ceil(MIN_REVIEW_TIME_S - timeElapsed));
      }
    } else {
      setStepState('initial');
    }
  }, [formData.telefone]);

  // This effect manages the countdown timer.
  useEffect(() => {
    if (stepState !== 'counting') return;

    if (secondsRemaining <= 0) {
      setStepState('ready');
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stepState, secondsRemaining]);

  const handleInitialClick = () => {
    const reviewTimeKey = `reviewButtonClickedTime_${formData.telefone}`;
    localStorage.setItem(reviewTimeKey, String(Date.now()));
    setStepState('counting');
    window.open(GOOGLE_REVIEW_LINK, '_blank');
  };

  const handleReadyClick = () => {
    if (!prizeClaimRef) return;

    startTransition(() => {
      // Attempt to claim the prize. Firestore rules will prevent duplicates.
      // This is non-blocking and will use the global error handler on failure.
      setDocumentNonBlocking(prizeClaimRef, { claimedAt: new Date() }, { merge: false });
      
      // We proceed with an optimistic UI update. The security rule is the ultimate source of truth.
      // If the write fails because the document exists, the global error handler will catch it,
      // but the UI will still show the prize screen. This is acceptable since StepOne
      // should have already prevented this user from getting here.
      setStepState('claimed');
      setShowPrize(true);
      toast({
        title: 'Obrigado pela sua avaliação!',
        description: 'Sua roleta de prêmios foi desbloqueada! 🔥',
      });
    });
  };
  
  const getButton = () => {
    switch (stepState) {
        case 'initial':
            return (
                <Button onClick={handleInitialClick} className="w-full font-bold text-base py-6">
                    <Gift className="mr-2"/>
                    Avaliar no Google e liberar prêmio
                </Button>
            );
        case 'counting':
            return (
                <Button variant="secondary" disabled className="w-full font-bold text-base py-6">
                    <Loader2 className="mr-2 animate-spin" />
                    Aguarde {secondsRemaining}s para liberar...
                </Button>
            );
        case 'ready':
            return (
                <Button onClick={handleReadyClick} disabled={isPending} className="w-full font-bold text-base py-6 animate-pulse">
                    {isPending ? <Loader2 className="mr-2 animate-spin" /> : <PartyPopper className="mr-2"/>}
                    Liberar minha roleta!
                </Button>
            );
        case 'claimed':
             return (
                <Button variant="secondary" disabled className="w-full font-bold text-base py-6">
                    Prêmio já resgatado
                </Button>
            );
    }
  }


  if (showPrize) {
    return (
        <div className="w-full space-y-6 animate-in fade-in-50 duration-500 text-center">
             <h1 className="font-headline text-3xl font-bold">Roleta Premiada! 🎡</h1>
             <p className="text-foreground/80 text-lg">
                Gire a roleta para descobrir seu prêmio.
             </p>
             <Card>
                <CardContent className="p-6">
                   <Roulette />
                </CardContent>
             </Card>
             <p className="text-lg text-foreground/80 leading-relaxed">
               Mostre esta tela para nossa equipe no caixa para validar e retirar seu prêmio! 🔥
             </p>
        </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-500">
      <div className="text-center space-y-2">
        <h1 className="font-headline text-3xl font-bold">Falta pouco para o seu prêmio! 🎁</h1>
        <p className="text-foreground/80 text-lg">
          Para desbloquear a <span className="font-bold text-primary">roleta premiada</span>, só precisamos da sua avaliação no Google.
        </p>
      </div>

      <Card className="text-center bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 font-bold text-xl">
            <Timer className="h-6 w-6 text-primary" />
            <span>Como funciona?</span>
          </CardTitle>
          <CardDescription className="text-foreground/90 !mt-4 space-y-2">
            <p>1. Clique no botão abaixo para nos avaliar no Google.</p>
            <p>2. Deixe sua avaliação sincera (leva menos de 1 minuto).</p>
            <p>3. Volte para esta página e libere sua roleta!</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getButton()}
        </CardContent>
      </Card>

    </div>
  );
}
