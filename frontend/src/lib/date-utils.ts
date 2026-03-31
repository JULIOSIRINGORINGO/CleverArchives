import { formatDistanceToNow as fdn } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Custom wrapper for formatDistanceToNow to handle Indonesian "sekitar" removal
 * and potentially other formatting adjustments.
 */
export function formatFriendlyDistance(date: Date | number | string, options?: any) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  let result = fdn(dateObj, options);
  
  // Remove "sekitar" (around/about) from Indonesian locale as requested by user
  if (options?.locale?.code === 'id') {
    result = result.replace(/^sekitar\s+/i, '');
  }
  
  return result;
}
