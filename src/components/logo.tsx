import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <svg
        width="60"
        height="60"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 md:h-16 md:w-16"
      >
        <rect width="80" height="80" rx="20" fill="#FFC107" />
        <path
          d="M22 56C22 52.6863 24.6863 50 28 50H52C55.3137 50 58 52.6863 58 56V58H22V56Z"
          fill="#422006"
        />
        <rect x="22" y="42" width="36" height="8" rx="4" fill="#FF5722" />
        <rect x="22" y="34" width="36" height="8" rx="4" fill="#78350F" />
        <path
          d="M22 24C22 27.3137 24.6863 30 28 30H52C55.3137 30 58 27.3137 58 24V22H22V24Z"
          fill="#422006"
        />
        <circle cx="30" cy="26" r="2" fill="#FFF8E1" />
        <circle cx="40" cy="23" r="2" fill="#FFF8E1" />
        <circle cx="50" cy="26" r="2" fill="#FFF8E1" />
      </svg>
      <span className="font-headline text-2xl md:text-3xl font-bold tracking-tighter text-foreground">
        Baiano Burger
      </span>
    </div>
  );
}
