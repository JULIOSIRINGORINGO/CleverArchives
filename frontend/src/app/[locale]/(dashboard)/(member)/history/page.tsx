"use client";

import { useState, useEffect, useMemo, useCallback, memo, ReactNode } from "react";
import { 
  CheckCircle2, ArrowRight, Calendar, 
  History as HistoryIcon, Clock, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";
import { EmptyState } from "@/components/ui/EmptyState";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { apiService } from "@/services/api";

// --- DESIGN SYSTEM TOKENS ---
const DESIGN = {
  LAYOUT: { PB: "pb-16", GAP: "space-y-4 pt-4" },
  ANIM: { DELAY: 0.05, SCALE: 0.98, DURATION: 0.2 },
  ICON: { HEADER: 22, SMALL: 14, STROKE: 3 },
  STYLES: { 
    PRIMARY: "text-primary", 
    MUTED: "opacity-20", 
    ACTION: "uppercase tracking-widest",
    ROUNDED: "2xl" as const,
    VARIANT: "brand-outline" as const,
    SIZE: "action" as const
  },
  CONFIG: { SKELETON: 5, LIMIT: "100" }
};

// --- TYPES ---
interface Book { id: string; title: string; cover_url?: string; author?: { name: string }; }
interface Borrowing { id: string; created_at: string; updated_at?: string; status: string; book_copy?: { book?: Book }; }
type ViewMode = 'standard' | 'compact';
type FilterType = 'all' | 'oldest';

// --- PERSISTENCE HOOK ---
function usePersistedState<T>(key: string, initial: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(initial);
  useEffect(() => {
    const s = localStorage.getItem(key);
    if (s) setState(s as any);
  }, [key]);
  const set = (v: T) => { setState(v); localStorage.setItem(key, String(v)); };
  return [state, set];
}

// --- HELPERS ---
const fDate = (l: string, d: string) => new Intl.DateTimeFormat(l, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
const getMetadata = (b: Borrowing, l: string, t: any) => [
  { label: t("borrowed"), value: fDate(l, b.created_at), icon: Clock },
  { label: t("returned"), value: fDate(l, b.updated_at || b.created_at), icon: Calendar }
];

// --- MODULES ---
const MotionItem = ({ children, index }: { children: ReactNode; index: number }) => (
  <motion.div initial={{ opacity: 0, scale: DESIGN.ANIM.SCALE }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * DESIGN.ANIM.DELAY }}>
    {children}
  </motion.div>
);

const HistorySkeleton = memo(({ viewMode }: { viewMode: ViewMode }) => (
  <Stack spacing="xl">
    <div className={`flex items-center gap-3 mb-8 ${DESIGN.STYLES.MUTED}`}>
      <div className="w-8 h-8 rounded-xl bg-primary animate-pulse" />
      <div className="h-4 w-32 bg-primary/20 rounded-full animate-pulse" />
    </div>
    <BookListCard.Skeleton isCompact={viewMode === 'compact'} count={DESIGN.CONFIG.SKELETON} />
  </Stack>
));
HistorySkeleton.displayName = "HistorySkeleton";

const HistoryEmpty = memo(({ l, t }: { l: string; t: any }) => (
  <EmptyState icon={HistoryIcon} title={t("noHistory")} description={t("noHistorySubtitle")} action={{ label: t("startReading"), href: `/${l}/catalog` }} />
));
HistoryEmpty.displayName = "HistoryEmpty";

const HistoryRow = memo(({ b, v, l, t, i }: { b: Borrowing; v: ViewMode; l: string; t: any; i: number }) => (
  <MotionItem index={i}>
    <BookListCard 
      isCompact={v === 'compact'} typeIcon={CheckCircle2} typeLabel={t(b.status === 'returned' ? 'returned' : 'completed')}
      title={b.book_copy?.book?.title || "Buku"} author={b.book_copy?.book?.author?.name || "Unknown"}
      coverUrl={b.book_copy?.book?.cover_url} status="completed" metadata={getMetadata(b, l, t)}
      action={
        <Link href={`/${l}/catalog`}>
          <Button variant={DESIGN.STYLES.VARIANT} size={DESIGN.STYLES.SIZE} rounded={DESIGN.STYLES.ROUNDED} className={DESIGN.STYLES.ACTION} aria-label={t("revisit")}>
            <Sparkles size={DESIGN.ICON.SMALL} /> {t("revisit")} <ArrowRight size={DESIGN.ICON.SMALL} strokeWidth={DESIGN.ICON.STROKE} className="opacity-40" />
          </Button>
        </Link>
      }
    />
  </MotionItem>
));
HistoryRow.displayName = "HistoryRow";

// --- HOOK ---
function useHistoryLogic(t: any) {
  const [data, setData] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = usePersistedState<ViewMode>('h_view', 'standard');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.borrowings.list({ status: 'returned', items: DESIGN.CONFIG.LIMIT });
      setData(Array.isArray(res) ? res : (res.data || []));
    } finally { setLoading(false); }
  }, []);

  const history = useMemo(() => {
    return [...data]
      .filter(b => {
        const q = search.toLowerCase();
        const bk = b.book_copy?.book;
        return !q || bk?.title?.toLowerCase().includes(q) || bk?.author?.name?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const dA = new Date(a.updated_at || a.created_at).getTime();
        const dB = new Date(b.updated_at || b.created_at).getTime();
        return filter === 'oldest' ? dA - dB : dB - dA;
      });
  }, [data, search, filter]);

  return { loading, search, setSearch, filter, setFilter, viewMode, setViewMode, history, fetch };
}

// --- MAIN ---
export default function BorrowHistory() {
  const t = useTranslations("History");
  const l = useLocale();
  const { loading, search, setSearch, filter, setFilter, viewMode, setViewMode, history, fetch } = useHistoryLogic(t);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <DashboardPage 
      headerControls={
        <UnifiedFilterBar 
          searchTerm={search} onSearchChange={setSearch} searchPlaceholder={t("searchPlaceholder")} isLoading={loading}
          filterOptions={['all', 'oldest'].map(id => ({ id, label: t(id) }))} activeFilter={filter} onFilterChange={v => setFilter(v as FilterType)}
          viewMode={viewMode} onViewChange={v => setViewMode(v as ViewMode)} 
        />
      }
    >
      <DashboardSection layout="full">
        <div className={DESIGN.LAYOUT.PB}>
          <AnimatePresence mode="wait">
            {loading ? <HistorySkeleton key="l" viewMode={viewMode} /> : 
             history.length === 0 ? <HistoryEmpty key="e" l={l} t={t} /> : (
              <BookListStack viewMode={viewMode}>
                <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={DESIGN.LAYOUT.GAP}>
                  {history.map((b, i) => <HistoryRow key={b.id} b={b} v={viewMode} l={l} t={t} i={i} />)}
                </motion.div>
              </BookListStack>
            )}
          </AnimatePresence>
        </div>
      </DashboardSection>
    </DashboardPage>
  );
}
