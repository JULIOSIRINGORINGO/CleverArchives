import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format raw size (bytes or number string) into human-readable format.
 */
export function formatSize(size: string | number | undefined) {
  if (!size) return "0 B";
  if (typeof size === 'string' && isNaN(Number(size))) return size;
  
  const num = Number(size);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let scaledSize = num;

  while (scaledSize >= 1024 && unitIndex < units.length - 1) {
    scaledSize /= 1024;
    unitIndex++;
  }

  return `${scaledSize % 1 === 0 ? scaledSize : scaledSize.toFixed(1)} ${units[unitIndex]}`;
}
