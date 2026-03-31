"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, AlertCircle, ArrowLeft, BookMarked, Upload } from "lucide-react";
import { useBookFormConfig, BookFieldConfig } from "@/hooks/useBookFormConfig";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import { useApi } from "@/hooks/useApi";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  const id = params?.id as string;
  
  const { config, loading: configLoading, error: configError } = useBookFormConfig();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);

  const { data: categoriesData } = useApi("/categories");
  const { data: authorsData } = useApi("/authors");
  
  const categories = categoriesData || [];
  const authors = authorsData || [];

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const bookRes = await apiService.books.get(id);
      const book = bookRes.book || bookRes;
      
      setExistingCoverUrl(book.cover_url);
      
      // Map existing data to form data
      const author_name = book.metadata?.author_names ? book.metadata.author_names.join(', ') : (book.author?.name || "");
      const initialData: Record<string, any> = {
        title: book.title,
        isbn: book.isbn,
        description: book.description,
        published_year: book.published_year,
        category_id: book.category_id,
        author_id: book.author_id,
        author_name: author_name,
        ...(book.metadata || {})
      };
      setFormData(initialData);
    } catch (err: any) {
      console.error("Failed to fetch book data", err);
      setError(err.message || "Failed to load book data");
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    // Normalize names for standard fields
    const normalizedName = name === 'category' ? 'category_id' : 
                           name === 'author' ? 'author_id' : name;
    setFormData(prev => ({ ...prev, [normalizedName]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      const standardKeys = ['title', 'isbn', 'description', 'published_year', 'category_id', 'author_id'];
      const metadata: Record<string, any> = {};

      Object.entries(formData).forEach(([key, value]) => {
        if (standardKeys.includes(key)) {
          data.append(`book[${key}]`, value);
        } else if (key === 'author_name') {
          data.append('book[author_name]', value);
        } else {
          metadata[key] = value;
        }
      });

      data.append('book[metadata]', JSON.stringify(metadata));
      if (coverImage) {
        data.append('book[cover_image]', coverImage);
      }

      await apiService.books.update(id, data);
      router.push(`/${locale}/book-catalog`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update book");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: BookFieldConfig) => {
    const value = formData[field.name] || "";
    const isRequired = field.required;

    const commonProps = {
      id: field.name,
      required: isRequired,
      value: value,
      onChange: (e: any) => handleInputChange(field.name, e.target.value),
      className: "w-full bg-white dark:bg-slate-900 border border-border/50 rounded-2xl px-5 py-4 font-normal outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
    };

    if (field.name === 'category_id' || field.name === 'category') {
      const catValue = formData.category_id || formData.category || "";
      return (
        <select 
          {...commonProps} 
          value={catValue}
          onChange={(e) => handleInputChange('category_id', e.target.value)}
        >
          <option value="">Pilih Kategori</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      );
    }

    if (field.name === 'author_id' || field.name === 'author') {
      return (
        <input 
          {...commonProps} 
          type="text"
          value={formData.author_name || ""}
          onChange={(e) => handleInputChange('author_name', e.target.value)}
          placeholder="Nama Pengarang (pisahkan dengan koma jika > 1)..."
        />
      );
    }

    if (field.field_type === 'dropdown') {
      return (
        <select {...commonProps}>
          <option value="">Pilih Opsi</option>
          {field.options?.map((opt: any) => <option key={opt.id} value={opt.value}>{opt.value}</option>)}
        </select>
      );
    }

    if (field.field_type === 'textarea') {
      return <textarea {...commonProps} rows={4} className={commonProps.className + " resize-none"} />;
    }

    return (
      <input 
        type={field.field_type === 'number' ? 'number' : 'text'} 
        {...commonProps} 
        placeholder={`Masukkan ${field.label}...`}
      />
    );
  };

  if (fetching || configLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold animate-pulse text-sm">Memuat Data Buku...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${locale}/book-catalog`}
            className="p-3 hover:bg-muted rounded-2xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <BookMarked className="text-primary" size={32} />
              Edit Buku
            </h1>
          </div>
        </div>
      </div>

      {(error || configError) && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 shadow-sm">
          <AlertCircle size={20} />
          {error || configError}
        </div>
      )}

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="md:col-span-2 p-8 bg-muted/30 border-2 border-dashed border-border/50 rounded-[2rem] flex flex-col items-center gap-6 group hover:border-primary/50 transition-all">
              <div className="w-40 h-56 rounded-2xl bg-card shadow-xl border border-border/50 overflow-hidden flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                {coverImage ? (
                  <img src={URL.createObjectURL(coverImage)} className="w-full h-full object-cover" alt="Preview" />
                ) : existingCoverUrl ? (
                  <img src={existingCoverUrl} className="w-full h-full object-cover" alt="Existing" />
                ) : (
                  <BookMarked size={48} className="text-muted-foreground/30" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 cursor-pointer transition-opacity text-white font-bold text-xs text-white">
                  <Upload size={24} className="text-white" />
                  Ganti Cover
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-foreground">Cover Buku</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Rekomendasi: 3:4 ratio, Max 2MB</p>
              </div>
            </div>

            {config.map((field: BookFieldConfig) => (
              <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="text-xs font-bold text-muted-foreground/70 ml-2 mb-3 block">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.back()}
              className="w-full sm:w-auto px-10 py-7 font-bold text-muted-foreground hover:text-foreground rounded-2xl"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto px-12 py-7 rounded-2xl font-bold shadow-2xl shadow-primary/20 gap-3 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} className="group-hover:scale-110 transition-transform" />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
