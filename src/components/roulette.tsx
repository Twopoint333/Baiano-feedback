'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

const PRIZES = [
  'Coca lata',
  'Batata 100g',
  'Batata 200g',
  'Onions 100g',
  'FRANGO 140G',
];

const BRAND_COLORS = [
  '#F94144', // Vermelho
  '#F3722C', // Laranja
  '#F8961E', // Laranja Amarelado
  '#F9C74F', // Amarelo
  '#FFD700', // Amarelo Ouro
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
  rotation,
}: {
  items: { text: string; color: string }[];
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
      className="transition-transform duration-[50ms]"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ transform: `rotate(${rotation}deg)` }}
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
        const textAngleDeg = (midAngleRad * 180 / Math.PI) + 90;
        
        const tx = cx + r * 0.65 * Math.cos(midAngleRad);
        const ty = cy + r * 0.65 * Math.sin(midAngleRad);
        
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


export function Roulette() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const items = PRIZES.map((prize, index) => ({
    text: prize,
    color: BRAND_COLORS[index % BRAND_COLORS.length],
  }));

  const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    const fullSpins = Math.floor(Math.random() * 2) + 6;
    const randomOffset = Math.random() * 360;
    const finalDeg = fullSpins * 360 + randomOffset;
    
    let duration = 5000;
    let start: number | null = null;
    const initialRotation = rotation % 360;
    const totalChange = finalDeg - initialRotation;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuint(progress);
      const angle = initialRotation + totalChange * eased;

      setRotation(angle);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const finalRotation = angle % 360;
        setRotation(finalRotation);

        const degPerItem = 360 / items.length;
        const pointerDeg = (360 - (finalRotation % 360) + 90) % 360;
        const sectorIndex = Math.floor(pointerDeg / degPerItem);

        setSpinResult(items[sectorIndex].text);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const hasSpun = spinResult !== null;

  return (
    <div className="w-full space-y-6 text-center">
       <div className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center md:h-[350px] md:w-[350px]">
         <div 
          className="absolute inset-0 z-0 rounded-full bg-background"
          style={{ boxShadow: '0 12px 36px 0 rgba(0,0,0,0.16), 0 2px 8px 0 rgba(0,0,0,0.10)'}}
         />
        <div
          className="h-full w-full rounded-full"
        >
          <RouletteWheel items={items} rotation={rotation} />
        </div>
        <div className="absolute left-1/2 top-[-10px] z-10 -translate-x-1/2 transform drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">
          <svg width="44" height="36" viewBox="0 0 44 36">
              <polygon points="0,0 44,0 22,36" fill="#fff"/>
          </svg>
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
             {spinResult}
           </p>
         </div>
      )}
    </div>
  );
}
