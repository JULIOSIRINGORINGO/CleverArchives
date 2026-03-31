"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  BookMarked, Search, Filter, BookOpen, 
  CheckCircle2, XCircle, Clock, ChevronRight,
  Database, Bookmark, BarChart3, Plus,
  Edit2, Trash2, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import BookFormModal from "@/components/books/BookFormModal";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export default function TenantCatalog() {
  const t = useTranslations("Catalog");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, catsRes] = await Promise.all([
        apiService.books.list(),
        apiService.categories.list()
      ]);
      setBooks(booksRes || []);
      setCategories(catsRes.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredBooks = Array.isArray(books) ? books.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase()) || 
                         b.isbn?.toLowerCase().includes(search.toLowerCase()) ||
                         b.author?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || b.category?.name === categoryFilter;
    return matchesSearch && matchesCategory;
  }) : [];

  const handleCreate = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleEdit = (book: any) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus buku ini dari katalog?")) return;
    try {
      await apiService.delete(`/books/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="sticky top-0 z-20 bg-[--color-background] -mx-6 px-6 pt-6 pb-6 border-b border-border/50 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <BookMarked className="text-primary" size={32} />
              Manajemen Katalog
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">Kelola koleksi buku, ketersediaan, dan data inventaris perpustakaan Anda.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/50 text-[11px] font-black tracking-widest text-muted-foreground">
              <Database size={14} /> Total: {books.length} Judul
            </div>
            <button 
              onClick={handleCreate}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Tambah Buku
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Buku", value: books.reduce((acc, b) => acc + (b.available_copies_count + (b.copies_count - b.available_copies_count) || 0), 0), icon: BookOpen, color: "text-blue-600 bg-blue-50" },
          { label: "Tersedia", value: books.reduce((acc, b) => acc + (b.available_copies_count || 0), 0), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
          { label: "Dipinjam", value: books.reduce((acc, b) => acc + (b.copies_count - b.available_copies_count || 0), 0), icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Kategori", value: categories.length, icon: Bookmark, color: "text-violet-600 bg-violet-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              <div className="text-2xl font-black">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky top-[108px] z-10 bg-[--color-background] -mx-6 px-6 py-4 mb-4 border-b border-border/50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text"
            placeholder="Cari judul buku, penulis, atau ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-muted-foreground" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-card border border-border/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm font-bold text-sm min-w-[200px]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-3xl" />)}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-muted/10 border border-dashed border-border p-24 rounded-[3rem] text-center">
          <p className="text-muted-foreground italic font-medium">Tidak ada buku yang sesuai dengan kriteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book, i) => (
            <motion.div 
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1.5 flex flex-col"
            >
              <div className="flex gap-4 items-start relative">
                <div className="w-24 h-32 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/20 border border-primary/10 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative group-hover:scale-105 transition-transform duration-500">
                   <BookOpen size={40} className="text-primary/20" />
                   {book.cover_url && <img src={book.cover_url} className="absolute inset-0 w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="text-xs font-bold text-primary tracking-widest mb-1">{book.category?.name || "Uncategorized"}</div>
                  <h3 className="font-black text-lg mb-1 leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">{book.title}</h3>
                  <div className="text-sm text-muted-foreground font-bold mb-3">By {book.author?.name || "Unknown Author"}</div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                      book.available_copies_count > 0 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {book.available_copies_count > 0 ? "Tersedia" : "Kosong"}
                    </span>
                    <span className="text-[9px] font-black bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
                      {book.available_copies_count} / {book.copies_count || 0} Eks
                    </span>
                  </div>
                </div>

                <div className="absolute right-0 top-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-muted rounded-full transition-colors">
                        <MoreVertical size={18} className="text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border border-border/50 shadow-xl p-1">
                      <DropdownMenuItem onClick={() => handleEdit(book)} className="gap-2 font-bold text-xs p-2.5 rounded-lg cursor-pointer">
                        <Edit2 size={14} className="text-blue-500" /> Edit Buku
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(book.id)} className="gap-2 font-bold text-xs p-2.5 rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 size={14} className="text-red-500" /> Hapus Buku
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between text-xs font-bold text-muted-foreground tracking-wider">
                <div className="flex items-center gap-1">
                  <BarChart3 size={12} className="text-primary/60" /> ISBN: {book.isbn || 'N/A'}
                </div>
                <div className="text-primary opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 -translate-x-2 group-hover:translate-x-0">
                  Manage <ChevronRight size={12} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BookFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
        book={selectedBook} 
      />
    </div>
  );
}
