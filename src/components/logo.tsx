import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 md:h-16 md:w-16"
      >
        <rect width="80" height="80" rx="20" fill="hsl(var(--primary))" />
        <path
          d="M60 27C60 24.7909 58.2091 23 56 23H24C21.7909 23 20 24.7909 20 27V31.4118H60V27Z"
          fill="white"
        />
        <path
          d="M20 53C20 55.2091 21.7909 57 24 57H56C58.2091 57 60 55.2091 60 53V48.5882H20V53Z"
          fill="white"
        />
        <path
          d="M54.5882 37.2941H25.4118C23.5276 37.2941 22 38.8217 22 40.7059V42.7059C22 44.5899 23.5276 46.1176 25.4118 46.1176H54.5882C56.4724 46.1176 58 44.5899 58 42.7059V40.7059C58 38.8217 56.4724 37.2941 54.5882 37.2941Z"
          fill="white"
        />
      </svg>
      <span className="font-headline text-2xl md:text-3xl font-bold tracking-tighter text-foreground">
        Baiano Burger
      </span>
    </div>
  );
}
