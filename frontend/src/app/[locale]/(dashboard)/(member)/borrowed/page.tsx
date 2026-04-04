"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { 
  BookOpen, Clock, Calendar, Search, 
  RotateCcw, User, Layers, ArrowLeftRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { EmptyState } from "@/components/ui/EmptyState";
import { UnifiedFilterBar } from "@/components/ui/UnifiedFilterBar";
import { BookListCard } from "@/components/books/BookListCard";
import { BookListStack } from "@/components/books/BookListStack";
import { DashboardPage } from "@/components/layout/DashboardPage";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { apiService } from "@/services/api";

// --- TOKENS & CONSTANTS ---
const BORROW_STATUS = {
  BORROWED: 'borrowed',
  PENDING: 'pending',
  RETURN_PENDING: 'return_pending',
  OVERDUE: 'overdue'
} as const;

type BorrowingStatus = typeof BORROW_STATUS[keyof typeof BORROW_STATUS];

const DESIGN = {
  CLASSES: {
    CONTAINER: "pb-16",
    GRID: "space-y-4",
    HEADER: "px-2 opacity-60 mb-2",
    LABEL: "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic",
    LINE: "flex-1 h-[1px] bg-gradient-to-r from-border/50 to-transparent",
    ACTION_BTN: "rounded-2xl font-bold gap-3 h-10 px-6 active:scale-95 transition-all text-[11px] border-none shadow-sm bg-muted/30 hover:bg-emerald-50 hover:text-emerald-600"
  },
  COLORS: { PRIMARY: "text-primary" },
  ICONS: { SMALL: 14, HEADER: 22, STROKE: 2.5 },
  CONFIG: { SKELETON_GROUPS: 2, SKELETON_ITEMS: 3 }
};

// --- HELPERS ---
const getFormatter = (locale: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });

const resolveStatus = (status: string, dueDate: string) => {
  if (status === BORROW_STATUS.BORROWED && new Date(dueDate) < new Date()) return BORROW_STATUS.OVERDUE;
  return status as BorrowingStatus;
};

const getBorrowingMetadata = (b: any, t: any, formatter: Intl.DateTimeFormat) => {
  const isPending = ([BORROW_STATUS.PENDING, BORROW_STATUS.RETURN_PENDING] as string[]).includes(b.status);
  return [
    { label: t("borrowDate"), value: formatter.format(new Date(b.created_at)), icon: Clock },
    { label: t(isPending ? "requestedOn" : "dueDate"), value: formatter.format(new Date(isPending ? b.created_at : b.due_date)), icon: Calendar }
  ];
};

// --- SUB-COMPONENTS ---
const BorrowingRow = memo(({ item, viewMode, locale, onReturn, t }: any) => {
  const formatter = useMemo(() => getFormatter(locale), [locale]);
  const status = resolveStatus(item.status, item.due_date);
  
  return (
    <BookListCard 
      isCompact={viewMode === 'compact'}
      typeIcon={item.group_id ? Layers : User}
      typeLabel={t(item.group_id ? "group_borrowing" : "single_borrowing")}
      title={item.book_copy?.book?.title || "Buku"}
      author={item.book_copy?.book?.author?.name || "Unknown"}
      coverUrl={item.book_copy?.book?.cover_url}
      status={status}
      metadata={getBorrowingMetadata(item, t, formatter)}
      action={status === BORROW_STATUS.BORROWED && (
        <Button size="sm" variant="outline" aria-label={t("requestReturn")} className={DESIGN.CLASSES.ACTION_BTN} onClick={() => onReturn(item.id)}>
          <RotateCcw size={DESIGN.ICONS.SMALL} strokeWidth={DESIGN.ICONS.STROKE} />
          {t("requestReturn")}
        </Button>
      )}
    />
  );
});

const BorrowingGroup = memo(({ group, viewMode, locale, onReturn, t }: any) => (
  <Stack spacing="xs">
    {group.type === 'group' && (
      <Inline align="center" spacing="sm" className={DESIGN.CLASSES.HEADER}>
        <Layers size={DESIGN.ICONS.SMALL} className={DESIGN.COLORS.PRIMARY} />
        <span className={DESIGN.CLASSES.LABEL}>{locale === 'id' ? `Kolektif (#${group.groupId})` : `Batch (#${group.groupId})`}</span>
        <div className={DESIGN.CLASSES.LINE} />
      </Inline>
    )}
    <BookListStack viewMode={viewMode}>
      {group.borrowings.map((b: any) => (
        <BorrowingRow key={b.id} item={b} viewMode={viewMode} locale={locale} onReturn={onReturn} t={t} />
      ))}
    </BookListStack>
  </Stack>
));

const BorrowingSkeleton = ({ viewMode }: any) => (
  <Stack spacing="xl">
    {Array.from({ length: DESIGN.CONFIG.SKELETON_GROUPS }).map((_, g) => (
      <Stack key={g} spacing="xs">
        <div className="h-2 w-32 bg-muted/40 rounded animate-pulse mb-3 ml-2" />
        <BookListStack viewMode={viewMode}>
          <BookListCard.Skeleton isCompact={viewMode === 'compact'} count={DESIGN.CONFIG.SKELETON_ITEMS} />
        </BookListStack>
      </Stack>
    ))}
  </Stack>
);

const BorrowingEmptyState = ({ search, t, locale }: any) => (
  <EmptyState 
    icon={search ? Search : BookOpen} 
    title={t(search ? "noResults" : "noBorrowed")} 
    description={t(search ? "noResultsDesc" : "noBorrowedSubtitle")} 
    action={!search ? { label: t("browseCatalog"), href: `/${locale}/catalog` } : undefined} 
  />
);

// --- LOGIC HOOK ---
function useBorrowedBooks(t: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.borrowings.list({ status: 'active' });
      setData(Array.isArray(res) ? res : (res.data || []));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const groups = useMemo(() => {
    const filtered = data.filter(i => {
      const q = search.toLowerCase();
      if (q && !i.book_copy?.book?.title?.toLowerCase().includes(q)) return false;
      if (filter === 'all') return true;
      const isOverdue = new Date(i.due_date) < new Date();
      if (filter === 'overdue') return i.status === BORROW_STATUS.BORROWED && isOverdue;
      if (filter === 'active') return i.status === BORROW_STATUS.BORROWED && !isOverdue;
      return ([BORROW_STATUS.PENDING, BORROW_STATUS.RETURN_PENDING] as string[]).includes(i.status);
    });

    const out: any[] = [];
    const batched: Record<string, any[]> = {};
    filtered.forEach(b => {
      if (b.group_id) (batched[b.group_id] = batched[b.group_id] || []).push(b);
      else out.push({ type: 'individual', borrowings: [b], createdAt: b.created_at });
    });
    Object.entries(batched).forEach(([id, items]) => out.push({ type: 'group', groupId: id, borrowings: items, createdAt: items[0].created_at }));
    return out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, search, filter]);

  return { loading, search, setSearch, filter, setFilter, viewMode, setViewMode, groups, fetch };
}

// --- MAIN PAGE ---
export default function BorrowedBooksPage() {
  const { toast } = useToast();
  const t = useTranslations("Borrowed");
  const locale = useLocale();
  const { loading, search, setSearch, filter, setFilter, viewMode, setViewMode, groups, fetch } = useBorrowedBooks(t);

  useEffect(() => { fetch(); const v = localStorage.getItem('v'); if (v) setViewMode(v as any); }, [fetch]);

  const onReturn = useCallback(async (id: string) => {
    try { await apiService.borrowings.requestReturn(id); toast(t("returnSuccess"), "success"); fetch(); }
    catch (e: any) { toast(e.message, "error"); }
  }, [fetch, t, toast]);

  return (
    <DashboardPage 
      headerControls={
        <UnifiedFilterBar 
          searchTerm={search} onSearchChange={setSearch} isLoading={loading} 
          searchPlaceholder={t("searchPlaceholder")}
          filterOptions={['all', 'active', 'pending', 'overdue'].map(id => ({ id, label: t(id) }))} 
          activeFilter={filter} onFilterChange={setFilter as any} 
          viewMode={viewMode} onViewChange={m => { setViewMode(m); localStorage.setItem('v', m); }} 
        />
      }
    >
      <DashboardSection layout="full">
        <AnimatePresence mode="wait">
          {loading ? ( <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><BorrowingSkeleton viewMode={viewMode} /></motion.div> ) : 
           groups.length === 0 ? ( <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><BorrowingEmptyState search={search} t={t} locale={locale} /></motion.div> ) : (
            <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={DESIGN.CLASSES.GRID}>
              {groups.map((g, i) => <BorrowingGroup key={g.groupId || i} group={g} viewMode={viewMode} locale={locale} onReturn={onReturn} t={t} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardSection>
    </DashboardPage>
  );
}
