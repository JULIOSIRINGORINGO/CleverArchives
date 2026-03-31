"use client";

import { useState, useEffect } from "react";
import { X, Save, Upload, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookFormConfig, BookFieldConfig } from "@/hooks/useBookFormConfig";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  book?: any; // For edit mode
}

export default function BookFormModal({ isOpen, onClose, onSuccess, book }: BookFormModalProps) {
  const { config, loading: configLoading, error: configError } = useBookFormConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [authors, setAuthors] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      if (book) {
        // Initialize form with existing book data
        const initialData: Record<string, any> = {
          title: book.title || "",
          isbn: book.isbn || "",
          description: book.description || "",
          published_year: book.published_year || "",
          category_id: book.category_id || "",
          author_id: book.author_id || "",
        };
        
        // Add metadata values
        if (book.metadata) {
          Object.entries(book.metadata).forEach(([key, value]) => {
            initialData[key] = value;
          });
        }
        setFormData(initialData);
      } else {
        setFormData({});
      }
    }
  }, [isOpen, book]);

  const fetchDropdownData = async () => {
    try {
      const [catsRes, authorsRes] = await Promise.all([
        apiService.categories.list(),
        apiService.get("/authors") // Assuming there's an authors endpoint
      ]);
      setCategories(catsRes.categories || []);
      setAuthors(authorsRes.authors || authorsRes || []);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Split standard fields and metadata
      const standardKeys = ['title', 'isbn', 'description', 'published_year', 'category_id', 'author_id'];
      const bookData: Record<string, any> = {};
      const metadata: Record<string, any> = {};

      Object.entries(formData).forEach(([key, value]) => {
        if (standardKeys.includes(key)) {
          bookData[key] = value;
        } else {
          metadata[key] = value;
        }
      });

      const payload = { 
        book: { 
          ...bookData, 
          metadata 
        } 
      };

      if (book) {
        await apiService.patch(`/books/${book.id}`, payload);
      } else {
        await apiService.post("/books", payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save book");
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
      className: "w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-3.5 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
    };

    if (field.name === 'category_id') {
      return (
        <select {...commonProps}>
          <option value="">Pilih Kategori</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      );
    }

    if (field.name === 'author_id') {
      return (
        <select {...commonProps}>
          <option value="">Pilih Penulis</option>
          {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      );
    }

    if (field.field_type === 'dropdown') {
      return (
        <select {...commonProps}>
          <option value="">Pilih Opsi</option>
          {field.options?.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{book ? 'Edit Buku' : 'Tambah Buku Baru'}</h2>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              {book ? 'Perbarui informasi buku di katalog.' : 'Masukkan data buku koleksi baru Anda.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {configError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100">
            <AlertCircle size={20} />
            {configError}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {configLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="animate-spin" size={32} />
              <p className="font-bold animate-pulse text-xs tracking-widest">Memuat Form...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.map((field: BookFieldConfig) => (
                  <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="text-xs font-bold tracking-widest text-muted-foreground ml-1 mb-2 block">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>

              <div className="pt-6 flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1 rounded-2xl py-6 font-bold"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] rounded-2xl py-6 font-black shadow-xl shadow-primary/20 gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  {book ? 'Simpan Perubahan' : 'Tambah Koleksi'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </Modal>
  );
}
