"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface StorageImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

const FALLBACK_COVER = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80";

export function StorageImage({ src, alt, className, fill = false, loading, priority }: StorageImageProps) {
  const [error, setError] = useState(false);
  const [loadingImg, setLoadingImg] = useState(true);
  
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "";
  const imageUrl = error || !src 
    ? FALLBACK_COVER 
    : (src.startsWith('http') ? src : `${baseUrl}${src}`);
  
  const imageClasses = cn(
    "object-cover transition-opacity duration-700 ease-in-out", 
    loadingImg ? "opacity-0" : "opacity-100",
    error ? "opacity-50" : "", 
    className
  );

  return (
    <div className={cn("relative w-full h-full bg-muted/20 overflow-hidden", fill && "absolute inset-0")}>
      {loadingImg && <Skeleton className="absolute inset-0 z-0" />}
      
      {fill ? (
        <NextImage 
          src={imageUrl} 
          alt={alt}
          fill
          loading={loading}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={imageClasses}
          onError={() => {
            setError(true);
            setLoadingImg(false);
          }}
          onLoadingComplete={() => setLoadingImg(false)}
        />
      ) : (
        <img 
          src={imageUrl} 
          alt={alt}
          className={imageClasses}
          onError={() => {
            setError(true);
            setLoadingImg(false);
          }}
          onLoad={() => setLoadingImg(false)}
          loading="lazy"
        />
      )}
    </div>
  );
}
