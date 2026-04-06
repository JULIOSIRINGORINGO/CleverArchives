"use client";

import { cn } from "@/lib/utils";

interface BookListStackProps {
  children: React.ReactNode;
  className?: string;
  viewMode?: 'standard' | 'compact';
  gap?: string; // Optional override
}

/**
 * BookListStack - Komponen pembungkus untuk menstandarisasikan jarak antar kartu buku.
 * Mengotomatiskan jarak (gap) berdasarkan mode tampilan (12px standard, 4px compact).
 */
export function BookListStack({ 
  children, 
  className,
  viewMode = 'standard',
  gap 
}: BookListStackProps) {
  // Gunakan gap eksplisit jika ada, jika tidak otomatis berdasarkan viewMode
  const finalGap = gap || (viewMode === 'compact' ? "4px" : "6px");

  return (
    <div 
      className={cn("flex flex-col w-full py-0.5", className)}
      style={{ gap: finalGap }}
    >
      {children}
    </div>
  );
}
