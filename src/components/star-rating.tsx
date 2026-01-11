'use client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onValueChange: (value: number) => void;
  totalStars?: number;
  size?: number;
}

export function StarRating({ value, onValueChange, totalStars = 5, size = 10 }: StarRatingProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={index}
            onClick={() => onValueChange(starValue)}
            className="focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
            aria-label={`Avaliar como ${starValue} de ${totalStars} estrelas`}
          >
            <Star
              className={cn(
                `h-${size} w-${size} transition-colors`,
                starValue <= value
                  ? 'text-primary fill-primary'
                  : 'text-muted-foreground/30'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
