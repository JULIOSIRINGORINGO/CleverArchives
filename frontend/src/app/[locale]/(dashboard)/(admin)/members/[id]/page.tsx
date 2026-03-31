"use client";

import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Hash, ArrowLeft,
  Calendar, BookOpen, Edit, Loader2, Trash2, UserMinus, UserCheck, Clock, Shield,
  CheckCircle2, AlertCircle, Database
} from "lucide-react";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'en';
  const dateLocale = locale === 'id' ? id : enUS;
  const memberId = params?.id as string;

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [borrowingsLoading, setBorrowingsLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      try {
        const res = await apiService.members.get(memberId);
        setMember(res);
        setBorrowingsLoading(true);
        const borrRes = await apiService.get(`/borrowings?member_id=${memberId}`);
        setBorrowings(borrRes.data || borrRes || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal memuat data member");
      } finally {
        setLoading(false);
        setBorrowingsLoading(false);
      }
    };
    if (memberId) fetchMember();
  }, [params.id]);

  const handleToggleStatus = async () => {
    if (!member) return;
    setIsActionLoading(true);
    try {
      const newStatus = member.status === 'active' ? 'suspend' : 'activate';
      await apiService.post(`/members/${member.id}/${newStatus}`, {});
      setMember({ ...member, status: member.status === 'active' ? 'suspended' : 'active' });
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status member.");
    } finally {
      setIsActionLoading(false);
      setShowSuspendModal(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!member) return;
    setIsActionLoading(true);
    try {
      await apiService.delete(`/members/${member.id}`);
      router.push(`/${params.locale}/members`);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus member. Pastikan tidak ada peminjaman aktif.");
    } finally {
      setIsActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-bold text-sm">{ error || "Member tidak ditemukan" }</p>
        <Link href={`/${locale}/members`}>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg font-bold">
            <ArrowLeft size={14} /> Kembali
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/members`}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <User className="text-primary" size={24} />
              Profil Member
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/${params.locale}/members/${member.id}/edit`)}
            className="gap-1.5 font-bold h-9 rounded-lg"
          >
            <Edit size={14} /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuspendModal(true)}
            className={`gap-1.5 font-bold h-9 rounded-lg ${member.status === 'active' ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
          >
            {member.status === 'active' ? <><UserMinus size={14} /> Suspend</> : <><UserCheck size={14} /> Aktif</>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="gap-1.5 font-bold h-9 rounded-lg text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 size={14} /> Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 rounded-xl border shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-black mb-4 shrink-0">
              {member.avatar_url ? (
                 <img src={member.avatar_url} className="w-full h-full object-cover rounded-xl" />
              ) : (
                member.name?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <h2 className="text-lg font-bold tracking-tight">{member.name}</h2>
            <div className="mt-1 flex flex-col items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold  tracking-widest">
                {member.member_code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold  tracking-widest border ${
                member.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                member.status === 'suspended' ? 'bg-red-50 text-red-600 border-red-200' :
                'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {member.status || 'active'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="md:col-span-2 rounded-xl border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <h3 className="text-xs font-bold  tracking-widest text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border/40">
              <Database size={14} /> Data Lengkap
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={<Mail size={16} />} label="Email" value={member.email || "-"} />
              <InfoRow icon={<Phone size={16} />} label="Telepon" value={member.phone || "-"} />
              <InfoRow icon={<Hash size={16} />} label="Kode Registrasi" value={member.member_code || "-"} />
              <InfoRow icon={<Calendar size={16} />} label="Bergabung" value={member.joined_at ? format(new Date(member.joined_at), 'd MMM yyyy', { locale: dateLocale }) : "-"} />
            </div>

            <div className="pt-3 border-t border-border/40">
              <InfoRow icon={<MapPin size={16} />} label="Alamat" value={member.address || "-"} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Borrowing History */}
      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Clock className="text-primary" size={20} />
          Riwayat Peminjaman
        </h3>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-5 py-3 text-xs font-bold  tracking-wider text-muted-foreground">Buku</th>
                  <th className="px-5 py-3 text-xs font-bold  tracking-wider text-muted-foreground hidden sm:table-cell">Tgl Pinjam</th>
                  <th className="px-5 py-3 text-xs font-bold  tracking-wider text-muted-foreground hidden sm:table-cell">Batas Kembali</th>
                  <th className="px-5 py-3 text-xs font-bold  tracking-wider text-muted-foreground text-center">Status</th>
                  <th className="px-5 py-3 text-xs font-bold  tracking-wider text-muted-foreground text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {borrowingsLoading ? (
                  [1, 2].map(i => (
                    <tr key={i} className="animate-pulse">
                       <td colSpan={5} className="px-5 py-3"><div className="h-8 bg-muted rounded-md w-full" /></td>
                    </tr>
                  ))
                ) : borrowings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-xs font-medium">Belum ada riwayat peminjaman.</td>
                  </tr>
                ) : (
                  borrowings.map((borr) => {
                    const isReturned = borr.status === 'returned';
                    return (
                      <tr key={borr.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{borr.book_copy?.book?.title}</div>
                          <div className="text-xs text-muted-foreground font-bold  tracking-wider mt-0.5">
                            {borr.book_copy?.barcode}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">
                          {format(new Date(borr.borrow_date), 'dd MMM yy', { locale: dateLocale })}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">
                          {format(new Date(borr.due_date), 'dd MMM yy', { locale: dateLocale })}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold  tracking-wider rounded-md border ${
                            isReturned ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary/5 text-primary border-primary/10'
                          }`}>
                            {isReturned ? 'Kembali' : 'Dipinjam'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {!isReturned && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                if (!confirm("Proses pengembalian?")) return;
                                try {
                                  await apiService.borrowings.return(borr.id);
                                  const borrRes = await apiService.get(`/borrowings?member_id=${memberId}`);
                                  setBorrowings(borrRes.data || borrRes || []);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="h-8 px-2.5 text-xs font-bold  tracking-wider gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-md"
                            >
                              <CheckCircle2 size={12} /> Proses
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleToggleStatus}
        title={member.status === 'active' ? "Suspend Member" : "Aktifkan Member"}
        description={`Apakah Anda yakin ingin ${member.status === 'active' ? 'menonaktifkan' : 'mengaktifkan kembali'} akses untuk ${member.name}?`}
        confirmLabel="Konfirmasi"
        cancelLabel="Batal"
        variant={member.status === 'active' ? "warning" : "info"}
        isLoading={isActionLoading}
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMember}
        title="Hapus Member"
        description={`Hapus member ${member.name}? Pastikan tidak ada pinjaman aktif.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-muted/40 rounded-lg text-muted-foreground/60 shrink-0 border border-border/50">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-bold  tracking-wider text-muted-foreground/70 mb-0.5">{label}</div>
        <div className="font-semibold text-sm truncate text-foreground">{value}</div>
      </div>
    </div>
  );
}
