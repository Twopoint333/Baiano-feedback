'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

const prizes = [
  'Coca lata',
  'Batata 100g',
  'Batata 200g',
  'Onions 100g',
  'Frango frito 140g',
];
const prizeCount = prizes.length;
const segmentAngle = 360 / prizeCount;

const PrizeSegment = ({ prize, index }: { prize: string; index: number }) => {
  const rotation = segmentAngle * index;
  const isEven = index % 2 === 0;

  return (
    <div
      className={cn(
        'absolute h-1/2 w-1/2 origin-bottom-right transform-gpu border-l-2',
        isEven ? 'bg-card' : 'bg-muted/50',
        'border-primary/50'
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div
        className="absolute -left-1/2 top-0 flex h-full w-full -translate-y-[calc(50%-1px)] transform-gpu items-center justify-center"
        style={{ transform: `rotate(${segmentAngle / 2}deg)` }}
      >
        <span
          className={cn(
            'text-sm font-bold -translate-y-10 transform-gpu max-w-20 text-center',
            isEven ? 'text-foreground' : 'text-primary'
          )}
          style={{ transform: `translateY(-5.5rem) rotate(-${segmentAngle}deg)` }}
        >
          {prize}
        </span>
      </div>
    </div>
  );
};

export function Roulette() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (isSpinning) return;

    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5 a 10 voltas completas
    const randomStopIndex = Math.floor(Math.random() * prizeCount);
    const stopAngle = randomStopIndex * segmentAngle;
    
    // Pequeno deslocamento para centralizar no meio do segmento
    const angleOffset = segmentAngle / 2;
    // O ponteiro está no topo (apontando para baixo), então subtraímos 90 graus
    const pointerCorrection = -90;

    const totalRotation = randomSpins * 360 - stopAngle - angleOffset - pointerCorrection;

    setIsSpinning(true);
    setSpinResult(null);
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(randomStopIndex);
      // Evita que o localStorage seja limpo para novas tentativas
    }, 6000); // Duração da animação + 1s de buffer
  };
  
  const hasSpun = spinResult !== null;

  return (
    <div className="w-full space-y-6 text-center">
      <div className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center overflow-hidden rounded-full border-4 border-primary shadow-lg md:h-[350px] md:w-[350px]">
        <div
          className="h-full w-full rounded-full transition-transform duration-[5000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {prizes.map((prize, index) => (
            <PrizeSegment key={prize} prize={prize} index={index} />
          ))}
        </div>
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 transform">
          <ChevronRight className="h-10 w-10 rotate-90 fill-destructive text-destructive-foreground stroke-[4]" />
        </div>
        <div className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-inner">
            <div className="h-12 w-12 rounded-full bg-card shadow-md"></div>
        </div>
      </div>
      
      {!hasSpun && (
        <Button onClick={spin} disabled={isSpinning} className="w-full max-w-xs font-bold text-lg py-7 animate-pulse">
          {isSpinning ? 'Girando...' : 'Girar a Roleta!'}
        </Button>
      )}

      {hasSpun && (
         <div className="space-y-4 animate-in fade-in-50 duration-500">
           <h2 className="text-2xl font-bold font-headline">Parabéns! Você ganhou:</h2>
           <p className="text-3xl font-bold text-primary bg-accent rounded-lg p-4">
             {prizes[spinResult!]}
           </p>
         </div>
      )}
    </div>
  );
}