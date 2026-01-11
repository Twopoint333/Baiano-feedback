'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="bg-primary rounded-md p-2">
        <Image
          src="/logo.png"
          alt="Baiano Burger Logo"
          width={64}
          height={64}
          className="h-12 w-12 md:h-16 md:w-16"
        />
      </div>
      <span className="font-headline text-2xl md:text-3xl font-bold tracking-tighter text-foreground">
        Baiano Burger
      </span>
    </div>
  );
}
