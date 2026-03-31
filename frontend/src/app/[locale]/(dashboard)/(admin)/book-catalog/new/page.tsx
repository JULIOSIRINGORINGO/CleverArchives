"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Loader2, AlertCircle, ArrowLeft, BookMarked } from "lucide-react";
import { motion } from "framer-motion";
import { useBookFormConfig, BookFieldConfig } from "@/hooks/useBookFormConfig";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import { useApi } from "@/hooks/useApi";
import { useTranslations } from "next-intl";

export default function AddBookPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  const t = useTranslations("Catalog");
  const { config, loading: configLoading, error: configError } = useBookFormConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [initialCopies, setInitialCopies] = useState<number>(1);
  const [baseBarcode, setBaseBarcode] = useState<string>("");

  const { data: categoriesData } = useApi("/categories");
  const { data: authorsData } = useApi("/authors");
  
  const categories = categoriesData || [];
  const authors = authorsData || [];

  const handleInputChange = (name: string, value: any) => {
    // Normalize names for standard fields to match backend expectations
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
      // Let the backend handle author_name (can be multiple separated by comma)
      const data = new FormData();
      const standardKeys = ['title', 'isbn', 'description', 'published_year', 'category_id'];
      const metadata: Record<string, any> = {};

      Object.entries(formData).forEach(([key, value]) => {
        if (standardKeys.includes(key)) {
          data.append(`book[${key}]`, value);
        } else if (key === 'author_name') {
           data.append('book[author_name]', value);
        } else if (key !== 'author_id' && key !== 'author') {
          metadata[key] = value;
        }
      });

      data.append('book[metadata]', JSON.stringify(metadata));
      if (coverImage) {
        data.append('book[cover_image]', coverImage);
      }

      const bookRes = await apiService.books.create(data);
      // Ensure we get the ID correctly
      const newBookId = bookRes?.id || bookRes?.book?.id || bookRes?.data?.id;

      if (!newBookId) {
        throw new Error(t("failed_get_id"));
      }

      // Generate initial physical stock copies
      if (initialCopies > 0) {
        // Match only the trailing number for incrementing
        // Example: "IND 1275 1" -> prefix: "IND 1275 ", num: 1
        const match = baseBarcode.match(/^(.*?)(\d+)$/);
        let prefix = baseBarcode;
        let startNum = 1;
        let padLength = 0;

        if (match) {
          prefix = match[1];
          startNum = parseInt(match[2], 10);
          padLength = match[2].length;
        }

        for (let i = 0; i < initialCopies; i++) {
          let currentBarcode;
          if (match) {
            const currentNum = startNum + i;
            currentBarcode = `${prefix}${currentNum.toString().padStart(padLength, '0')}`;
          } else {
             if (!baseBarcode) {
               currentBarcode = `BC-${Date.now()}-${i}`;
             } else {
               currentBarcode = i === 0 ? baseBarcode : `${baseBarcode}-${i + 1}`;
             }
          }

          await apiService.post(`/books/${newBookId}/copies`, {
            book_copy: { barcode: currentBarcode }
          });
        }
      }

      router.push(`/${locale}/book-catalog`);
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
          <option value="">{t("select_category")}</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      );
    }

    if (field.name === 'author_id' || field.name === 'author') {
      const authorVal = formData.author_name || "";
      return (
        <div className="relative">
          <input 
            type="text"
            list="authors-datalist"
            placeholder={t("author_placeholder")}
            value={authorVal}
            onChange={(e) => {
               const val = e.target.value;
               handleInputChange('author_name', val);
               const existing = authors.find((a: any) => a.name.toLowerCase() === val.toLowerCase());
               handleInputChange('author_id', existing ? existing.id : null);
            }}
            className="w-full bg-white dark:bg-slate-900 border border-border/50 rounded-2xl px-5 py-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            required={isRequired}
          />
          <datalist id="authors-datalist">
            {authors.map((a: any) => <option key={a.id} value={a.name} />)}
          </datalist>
          <p className="text-xs text-muted-foreground mt-2 font-bold italic flex items-center gap-1"><AlertCircle size={10} /> {t("author_hint")}</p>
        </div>
      );
    }

    if (field.field_type === 'dropdown') {
      return (
        <select {...commonProps}>
          <option value="">{t("select_option")}</option>
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
        placeholder={t("input_placeholder", { label: field.label })}
      />
    );
  };

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
              {t("add_book_title")}
            </h1>
          </div>
        </div>
      </div>

      {(configError || error) && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 shadow-sm">
          <AlertCircle size={20} />
          {configError || error}
        </div>
      )}

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-10">
          {configLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="font-bold animate-pulse text-sm">{t("preparing_form")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="md:col-span-2 p-8 bg-muted/30 border-2 border-dashed border-border/50 rounded-[2rem] flex flex-col items-center gap-6 group hover:border-primary/50 transition-all">
                  <div className="w-40 h-56 rounded-2xl bg-card shadow-xl border border-border/50 overflow-hidden flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                    {coverImage ? (
                      <img src={URL.createObjectURL(coverImage)} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <BookMarked size={48} className="text-muted-foreground/30" />
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 cursor-pointer transition-opacity text-white font-bold text-xs">
                      <Upload size={24} />
                      {t("change_cover")}
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-foreground">{t("cover_image")}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{t("cover_recommendation")}</p>
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

              <div className="pt-6 pb-2 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground/70 ml-2 mb-3 block">
                      {t("initial_copies")}
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={initialCopies}
                      onChange={(e) => setInitialCopies(parseInt(e.target.value) || 1)}
                      className="w-full bg-white dark:bg-slate-900 border border-border/50 rounded-2xl px-5 py-4 font-normal outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground/70 ml-2 mb-3 block">
                      {t("base_barcode")}
                    </label>
                    <input 
                      type="text"
                      placeholder={t("base_barcode_placeholder")}
                      value={baseBarcode}
                      onChange={(e) => setBaseBarcode(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-border/50 rounded-2xl px-5 py-4 font-normal outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                    <p className="text-xs font-bold text-muted-foreground mt-2 italic flex items-center gap-1">
                      <AlertCircle size={12} />
                      {t("base_barcode_hint")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-end">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-10 py-7 font-bold text-muted-foreground hover:text-foreground rounded-2xl"
                >
                  {t("cancel")}
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
                  {t("add_collection_btn")}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
