'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

const PRIZES = [
  { name: 'COCA KS', weight: 45 },
  { name: 'BATATA 100G', weight: 20 },
  { name: 'BATATA 200G', weight: 10 },
  { name: 'ONIONS 100G', weight: 12.5 },
  { name: 'FRANGO 140G', weight: 12.5 },
];


const BRAND_COLORS = [
  '#F94144', // Vermelho
  '#F3722C', // Laranja
  '#F8961E', // Laranja Amarelado
  '#F9C74F', // Amarelo
  '#90BE6D', // Verde
  '#43AA8B', // Verde Azulado
];

const getFittedFontSize = (text: string, maxWidth: number, baseFontSize: number): number => {
  if (typeof document === 'undefined') return baseFontSize;

  const span = document.createElement('span');
  span.style.position = 'absolute';
  span.style.visibility = 'hidden';
  span.style.fontFamily = "'PT Sans', sans-serif";
  span.style.fontWeight = '700';
  span.style.fontSize = baseFontSize + 'px';
  span.textContent = text;
  document.body.appendChild(span);
  let width = span.offsetWidth;
  let fontSize = baseFontSize;
  while (width > maxWidth && fontSize > 8) {
    fontSize -= 1;
    span.style.fontSize = fontSize + 'px';
    width = span.offsetWidth;
  }
  document.body.removeChild(span);
  return fontSize;
};

const RouletteWheel = ({
  items,
  isSpinning,
  spinDuration,
  rotation,
}: {
  items: { text: string; color: string }[];
  isSpinning: boolean;
  spinDuration: number;
  rotation: number;
}) => {
  const n = items.length;
  if (n === 0) return null;

  const width = 320,
    height = 320,
    cx = width / 2,
    cy = height / 2,
    r = 140;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: isSpinning
          ? `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
          : 'none',
      }}
    >
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      {items.map((item, i) => {
        const startAngleRad = (2 * Math.PI * i) / n - Math.PI / 2;
        const endAngleRad = (2 * Math.PI * (i + 1)) / n - Math.PI / 2;
        
        const x1 = cx + r * Math.cos(startAngleRad);
        const y1 = cy + r * Math.sin(startAngleRad);
        const x2 = cx + r * Math.cos(endAngleRad);
        const y2 = cy + r * Math.sin(endAngleRad);
        const largeArc = (endAngleRad - startAngleRad > Math.PI) ? 1 : 0;

        const pathData = [
          `M ${cx} ${cy}`,
          `L ${x1} ${y1}`,
          `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');

        const midAngleRad = (startAngleRad + endAngleRad) / 2;
        let textAngleDeg = (midAngleRad * 180 / Math.PI) + 90;
        
        const tx = cx + r * 0.65 * Math.cos(midAngleRad);
        const ty = cy + r * 0.65 * Math.sin(midAngleRad);

        if (textAngleDeg > 90 && textAngleDeg < 270) {
          textAngleDeg += 180;
        }
        
        const arcLen = (Math.PI * r) / n * 1.3;
        const textVal = item.text || '';
        const fontSize = getFittedFontSize(textVal, arcLen, 16);

        return (
          <g key={i}>
            <path d={pathData} fill={item.color} stroke="#FFF" strokeWidth={1.5} />
             <text
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fill="#fff"
              fontWeight="700"
              fontFamily="'PT Sans', sans-serif"
              transform={`rotate(${textAngleDeg}, ${tx}, ${ty})`}
              style={{ filter: 'url(#shadow)' }}
            >
              {textVal}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

interface RouletteProps {
  onPrizeWon: (prize: string) => void;
  claimedPrize: string | null;
}

export function Roulette({ onPrizeWon, claimedPrize }: RouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<string | null>(claimedPrize);
  const currentRotationRef = useRef(0);
  const rouletteRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const spinDuration = 6000;
  
  const items = PRIZES.map((prize, index) => ({
    text: prize.name,
    color: BRAND_COLORS[index % BRAND_COLORS.length],
  }));

  useEffect(() => {
    // Inicializa o áudio no lado do cliente
    audioRef.current = new Audio('/roulette-spin.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

    winAudioRef.current = new Audio('/win-sound.mp3');
  }, []);

  const getWeightedPrize = (): { name: string, weight: number } => {
    const totalWeight = PRIZES.reduce((acc, prize) => acc + prize.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (const prize of PRIZES) {
      if (randomNum < prize.weight) {
        return prize;
      }
      randomNum -= prize.weight;
    }
    // Fallback (should not happen with correct weights)
    return PRIZES[0];
  };

  const spin = () => {
    if (isSpinning || claimedPrize) return;

    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
    }

    setIsSpinning(true);
    setSpinResult(null);

    const winningPrize = getWeightedPrize();
    const winningPrizeIndex = PRIZES.findIndex(p => p.name === winningPrize.name);

    const degPerItem = 360 / items.length;
    // Calculate the angle for the middle of the winning sector
    const winningAngle = degPerItem * winningPrizeIndex + degPerItem / 2;
    // Add a small random offset inside the winning sector to make it look more natural
    const randomOffset = (Math.random() - 0.5) * (degPerItem * 0.8);
    const targetAngle = winningAngle + randomOffset;
    
    const fullSpins = Math.floor(Math.random() * 4) + 8;
    const finalRotation = fullSpins * 360 + (360 - targetAngle);

    const newTotalRotation = finalRotation;
    setRotation(newTotalRotation);
    // We don't use currentRotationRef anymore for the final angle calculation
    // but keep it to track total rotation if needed for other effects.
    currentRotationRef.current = newTotalRotation;
  };

  useEffect(() => {
    const handleTransitionEnd = () => {
      if (!isSpinning) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play();
      }

      const finalAngle = rotation;
      const normalizedAngle = (360 - (finalAngle % 360)) % 360;
      const degPerItem = 360 / items.length;
      const winningSectorIndex = Math.floor(normalizedAngle / degPerItem);
      
      const prize = items[winningSectorIndex].text;
      setSpinResult(prize);
      onPrizeWon(prize); // Callback to parent
      setIsSpinning(false);
    };

    const rouletteElement = rouletteRef.current;
    if (rouletteElement) {
      rouletteElement.addEventListener('transitionend', handleTransitionEnd);
    }

    return () => {
      if (rouletteElement) {
        rouletteElement.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [isSpinning, items, onPrizeWon, rotation]);

  const hasSpun = spinResult !== null;

  return (
    <div className="w-full space-y-6 text-center">
       <div className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center md:h-[350px] md:w-[350px]">
         <div 
          className="absolute inset-0 z-0 rounded-full bg-background"
          style={{ boxShadow: '0 12px 36px 0 rgba(0,0,0,0.16), 0 2px 8px 0 rgba(0,0,0,0.10)'}}
         />
        <div
          ref={rouletteRef}
          className="h-full w-full rounded-full"
        >
          <RouletteWheel 
            items={items} 
            rotation={rotation}
            isSpinning={isSpinning}
            spinDuration={spinDuration}
          />
        </div>
        <div className="absolute left-1/2 top-[-10px] z-10 -translate-x-1/2 transform drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
          <svg width="44" height="36" viewBox="0 0 44 36">
              <polygon points="0,0 44,0 22,36" fill="#fff"/>
          </svg>
        </div>
      </div>
      
      {!hasSpun && (
        <Button onClick={spin} disabled={isSpinning || !!claimedPrize} className="w-full max-w-xs font-bold text-lg py-7 animate-pulse">
          {isSpinning ? 'Girando...' : 'Girar a Roleta!'}
        </Button>
      )}

      {hasSpun && (
         <div className="space-y-4 animate-in fade-in-50 duration-500">
           <h2 className="text-2xl font-bold font-headline">Parabéns! Você ganhou:</h2>
           <p className="text-3xl font-bold text-primary bg-accent rounded-lg p-4">
             {spinResult}
           </p>
         </div>
      )}
    </div>
  );
}
