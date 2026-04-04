import { useMemo } from "react";

/**
 * Domain Types for Ebook Library
 */
export interface Category {
  id: number;
  name: string;
}

export interface Ebook {
  id: number;
  book?: {
    id: number;
    title: string;
    cover_url?: string;
    author?: { name: string };
    category_id?: number;
    category?: Category;
  };
  file_format: string;
  file_size?: string;
  created_at?: string;
}

/**
 * Maps ebook file formats to StatusBadge variants with semantic colors.
 */
export const getStatusByFormat = (format: string = "PDF") => {
  const f = format.toUpperCase();
  if (f === "PDF") return "pdf";     // Typically Red in StatusBadge
  if (f === "EPUB") return "active"; // Typically Blue/Primary
  if (f === "MOBI") return "draft";  // Typically Green/Success
  return "borrowed";                 // Neutral fallback
};

/**
 * Standardizes file size display.
 */
export const formatSize = (size?: string) => {
  if (!size || size === "N/A") return "N/A";
  return size.toUpperCase();
};

/**
 * Hook to manage ebook filtering and category splitting.
 */
export function useFilteredEbooks(
  ebooks: Ebook[], 
  search: string, 
  filter: string, 
  categories: Category[]
) {
  const filtered = useMemo(() => {
    return ebooks.filter(e => {
      const q = search.toLowerCase();
      const title = e.book?.title?.toLowerCase() || "";
      const author = e.book?.author?.name?.toLowerCase() || "";
      
      const matchesS = title.includes(q) || author.includes(q);
      const matchesF = filter === 'all' || 
                       String(e.book?.category_id) === filter || 
                       e.file_format?.toLowerCase() === filter.toLowerCase();
      return matchesS && matchesF;
    });
  }, [ebooks, search, filter]);

  const { top, rest } = useMemo(() => ({
    top: categories.slice(0, 3),
    rest: categories.slice(3)
  }), [categories]);

  return { filtered, top, rest };
}
