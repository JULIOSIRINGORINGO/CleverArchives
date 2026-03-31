"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { apiService } from "@/services/api";
import { 
  Search, 
  User, 
  BookOpen, 
  Database, 
  Loader2, 
  Check, 
  AlertCircle,
  X,
  Scan
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManualBorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualBorrowModal({ isOpen, onClose, onSuccess }: ManualBorrowModalProps) {
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);

  const [barcode, setBarcode] = useState("");
  const [bookCopy, setBookCopy] = useState<any | null>(null);
  const [isCheckingBarcode, setIsCheckingBarcode] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Search members
  useEffect(() => {
    if (memberSearch.length < 3) {
      setMembers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMembers(true);
      try {
        const res = await apiService.users.search(memberSearch);
        // Filter only members and fix data structure
        const data = Array.isArray(res) ? res : res.data || [];
        setMembers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingMembers(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [memberSearch]);

  // Check barcode
  useEffect(() => {
    if (barcode.length < 3) {
      setBookCopy(null);
      setBarcodeError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingBarcode(true);
      setBarcodeError(null);
      try {
        const res = await apiService.books.getByBarcode(barcode);
        if (res) {
          if (res.status !== 'available') {
            setBarcodeError(`Buku ini berstatus ${res.display_status}`);
            setBookCopy(null);
          } else {
            setBookCopy(res);
          }
        }
      } catch (err: any) {
        setBarcodeError("Eksemplar tidak ditemukan");
        setBookCopy(null);
      } finally {
        setIsCheckingBarcode(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [barcode]);

  const handleSubmit = async () => {
    if (!selectedMember || !bookCopy) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Need to make sure we send member_id (not user_id)
      // If selectedMember is a User, we might need to find its Member ID
      let memberId = selectedMember.member_id || selectedMember.id;
      
      // In our system, the API might expect member_id
      await apiService.borrowings.create({
        member_id: memberId,
        book_copy_id: bookCopy.id,
        borrow_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'borrowed'
      });
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      setSubmitError(err.message || "Gagal membuat peminjaman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMemberSearch("");
    setSelectedMember(null);
    setBarcode("");
    setBookCopy(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
      <div className="p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Scan size={24} />
            </div>
            Tambah Peminjaman Manual
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Lakukan pencatatan peminjaman langsung untuk anggota.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Member Section */}
          <div className="space-y-4">
            <Label className="text-xs font-bold tracking-widest text-muted-foreground">1. Pilih Anggota</Label>
            
            {!selectedMember ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  placeholder="Cari nama atau email..." 
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-10 rounded-xl h-12"
                />
                
                {isSearchingMembers && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-primary" size={16} />
                  </div>
                )}

                {members.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    {members.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="w-full p-4 hover:bg-muted text-left flex items-center gap-3 transition-colors border-b last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {m.name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{m.name}</div>
                          <div className="text-xs text-muted-foreground italic">{m.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                    {selectedMember.name?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{selectedMember.name}</div>
                    <div className="text-xs text-primary font-bold">{selectedMember.email}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-1 hover:bg-primary/10 rounded-full text-primary">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Book Section */}
          <div className="space-y-4">
            <Label className="text-xs font-bold tracking-widest text-muted-foreground">2. Scan Eksemplar</Label>
            
            <div className="relative">
              <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Masukkan Barcode (misal BC-1-1)" 
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="pl-10 rounded-xl h-12"
              />
              {isCheckingBarcode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-primary" size={16} />
                </div>
              )}
            </div>

            {barcodeError && (
              <div className="text-xs font-bold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {barcodeError}
              </div>
            )}

            {bookCopy && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300">
                <div className="w-12 h-16 bg-white rounded-lg border border-emerald-100 overflow-hidden shrink-0 shadow-sm">
                  {bookCopy.book?.cover_url && <img src={bookCopy.book.cover_url} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-800 line-clamp-1">{bookCopy.book?.title}</div>
                  <div className="text-xs font-bold text-emerald-600 tracking-tighter mt-0.5">{bookCopy.barcode}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <Check size={10} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-500">Tersedia</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {submitError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
            <AlertCircle size={16} /> {submitError}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={handleClose} className="flex-1 h-14 rounded-2xl font-black">
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedMember || !bookCopy || isSubmitting}
            className="flex-[2] h-14 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            Konfirmasi Peminjaman
          </Button>
        </div>
      </div>
    </Modal>
  );
}
