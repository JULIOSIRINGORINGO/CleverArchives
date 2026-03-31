"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Megaphone, Plus, Clock, Search, 
  MessageSquare, CheckCircle2, ChevronRight,
  Paperclip, FileText, Download, X, Calendar, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

interface Attachment {
  url: string;
  filename: string;
  content_type: string;
}

interface Broadcast {
  id: number;
  title: string;
  body: string;
  author_name: string;
  created_at: string;
  sent_at: string | null;
  attachments?: Attachment[];
}

export default function BroadcastPage() {
  const t = useTranslations("Broadcast");
  const locale = useLocale();
  const { user } = useAuth();
  const isMember = user?.role?.name === 'member';
  const dateFnsLocale = locale === 'id' ? idLocale : enUS;
  
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
  
  // Compose Form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await apiService.broadcasts.list();
      setBroadcasts(res.broadcasts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBroadcasts(); }, []);

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    attachments.forEach((file) => {
      formData.append("attachments[]", file);
    });

    try {
      await apiService.broadcasts.create(formData);
      setTitle("");
      setBody("");
      setAttachments([]);
      setIsModalOpen(false);
      fetchBroadcasts();
    } catch (err) {
      console.error(err);
      alert(t("create_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(attachments.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        title={t("title")}
        badge={t("public_announcement")}
        icon={<Megaphone size={24} strokeWidth={2.5} />}
      >
        {!isMember && (
          <Button onClick={() => setIsModalOpen(true)} className="rounded-2xl h-11 px-6 font-bold shadow-xl shadow-primary/20 bg-primary text-white border-none gap-2">
            <Plus size={18} strokeWidth={2.5} />
            {t("create_btn")}
          </Button>
        )}
      </PageHeader>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock size={14} strokeWidth={2} /> {t("history_title")}
          </h3>
          <div className="flex items-center px-3 py-1.5 bg-card border border-border/50 rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary transition-all group shrink-0">
            <Search size={14} strokeWidth={2} className="text-muted-foreground mr-1.5 group-focus-within:text-primary" />
            <input type="text" placeholder={t("search_placeholder")} className="bg-transparent border-none outline-none text-xs w-full sm:w-48 placeholder:text-muted-foreground text-foreground font-normal" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 bg-card border border-dashed border-border p-10 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Megaphone size={20} className="text-muted-foreground" />
            </div>
            <p className="font-bold text-muted-foreground text-xs">{t("no_history")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {broadcasts.map((b, i) => (
              <motion.div 
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedBroadcast(b)}
                className="bg-card border border-border/50 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <MessageSquare size={16} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-bold text-muted-foreground leading-none mt-1">
                      {formatDistanceToNow(new Date(b.created_at), { addSuffix: true, locale: dateFnsLocale })}
                    </span>
                    {b.sent_at && (
                      <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 size={10} strokeWidth={2} /> {t("sent_status")}
                      </div>
                    )}
                  </div>
                </div>
                
                <h4 className="font-bold text-sm mb-1.5 truncate text-foreground group-hover:text-primary transition-colors">{b.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed font-normal">
                  {b.body}
                </p>
                
                {b.attachments && b.attachments.length > 0 && (
                  <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 w-fit px-2 py-1 rounded-lg border border-primary/10">
                    <Paperclip size={12} strokeWidth={2.5} />
                    {b.attachments.length} {b.attachments.length > 1 ? "Files" : "File"}
                  </div>
                )}
                
                <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm ">
                      {b.author_name[0]}
                    </div>
                    <span className="font-bold text-foreground truncate max-w-[100px]">{b.author_name}</span>
                  </div>
                  <ChevronRight size={14} strokeWidth={2} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="max-w-xl w-full"
      >
        <div className="p-5 border-b border-border/50 bg-card">
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Megaphone size={18} className="text-primary" />
            {t("new_broadcast_title")}
          </h3>
        </div>
        <form onSubmit={handleCreateBroadcast} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">{t("input_title")}</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("input_title_placeholder")}
              className="w-full px-3 py-2 bg-card border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary rounded-lg transition-all text-xs font-normal text-foreground shadow-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">{t("input_body")}</label>
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("input_body_placeholder")}
              rows={5}
              className="w-full px-3 py-2 bg-card border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary rounded-lg transition-all resize-none text-xs font-normal leading-relaxed text-foreground shadow-sm"
              required
            />
          </div>

          {/* Attachments Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Lampiran File (Opsional)</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-muted/20 hover:bg-muted/40 text-foreground text-xs font-bold rounded-lg cursor-pointer transition-all border border-dashed border-border/80 hover:border-primary/50 w-full group">
                <div className="p-1 bg-card rounded flex items-center justify-center border border-border/50 shadow-sm">
                  <Paperclip size={14} className="text-primary" strokeWidth={2} />
                </div>
                <span>Pilih File...</span>
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => setAttachments([...attachments, ...Array.from(e.target.files || [])])} 
                />
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-card border border-border/50 rounded-lg shadow-sm group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1 bg-primary/10 text-primary rounded">
                        <FileText size={14} strokeWidth={2} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-normal truncate text-foreground">{file.name}</span>
                        <span className="text-[8px] font-bold text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeAttachment(i)} 
                      className="p-1 text-red-500 hover:text-white hover:bg-red-500 rounded transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <X size={12} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-500/10 p-3 rounded-lg flex gap-2 border border-amber-500/20">
            <Megaphone size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-xs text-amber-900 dark:text-amber-100 font-normal leading-relaxed">
              {t("warning_text")}
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="font-bold rounded-lg text-xs h-9 px-4"
            >
              {t("cancel_btn")}
            </Button>
            <Button 
              type="submit"
              disabled={submitting}
              className="font-bold px-5 h-9 rounded-lg shadow-sm"
            >
              {submitting ? t("sending_status") : t("send_now_btn")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedBroadcast} 
        onClose={() => setSelectedBroadcast(null)}
        className="max-w-xl w-full"
      >
        {selectedBroadcast && (
          <div className="flex flex-col max-h-[85vh] bg-card">
            <div className="p-5 border-b border-border/50 bg-muted/10">
              <h3 className="text-xl font-bold text-foreground leading-tight mb-3">
                {selectedBroadcast.title}
              </h3>
              
              <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                    {selectedBroadcast.author_name[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground leading-none">{selectedBroadcast.author_name}</span>
                    <span className="text-[9px] text-muted-foreground font-bold mt-0.5">Pengirim</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground leading-none flex items-center gap-1.5">
                    <Calendar size={12} className="text-primary" />
                    {new Date(selectedBroadcast.created_at).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold mt-1 flex items-center gap-1">
                    <Clock size={10} /> 
                    {new Date(selectedBroadcast.created_at).toLocaleTimeString(locale === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar bg-muted/10 border-b border-border/50">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed text-xs font-normal p-4 bg-card rounded-xl shadow-sm border border-border/50">
                {selectedBroadcast.body}
              </div>

              {selectedBroadcast.attachments && selectedBroadcast.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Paperclip size={14} className="text-primary" />
                    Lampiran <span className="text-[9px] bg-muted/50 border border-border/50 text-foreground px-1 py-0.5 rounded-md">{selectedBroadcast.attachments.length}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedBroadcast.attachments.map((att, i) => (
                      <a 
                        key={i} 
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${att.url}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 bg-card border border-border/50 hover:border-primary/50 hover:shadow-sm rounded-lg transition-all group"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                            <FileText size={16} strokeWidth={2} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate text-foreground group-hover:text-primary transition-colors">{att.filename}</span>
                            <span className="text-[9px] text-muted-foreground font-bold tracking-tight mt-0.5">{att.content_type.split('/')[1] || 'File'}</span>
                          </div>
                        </div>
                        <div className="p-1.5 bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary rounded-md transition-all shrink-0">
                          <Download size={14} strokeWidth={2} />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-card flex justify-end">
              <Button onClick={() => setSelectedBroadcast(null)} variant="outline" className="h-9 px-5 rounded-lg font-bold text-xs shadow-sm">
                Tutup Papan Pengumuman
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--border), 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--border), 1);
        }
      `}</style>
    </div>
  );
}
