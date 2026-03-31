"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Database, List, Plus, Trash2, 
  Settings2, CheckCircle, XCircle, 
  X, Save, GripVertical 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

interface FieldConfig {
  id: number;
  name: string;
  label: string;
  field_type: string;
}

interface Option {
  id: number;
  value: string;
  active: boolean;
  position: number;
}

export default function DropdownOptionsPage() {
  const t = useTranslations("MasterData");
  const navT = useTranslations("Navigation");

  const [dropdownFields, setDropdownFields] = useState<FieldConfig[]>([]);
  const [activeField, setActiveField] = useState<FieldConfig | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  
  // Form State
  const [newValue, setNewValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/master/book_fields");
      const dropdowns = res.filter((f: any) => f.field_type === "dropdown");
      setDropdownFields(dropdowns);
      if (dropdowns.length > 0 && !activeField) {
        setActiveField(dropdowns[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async (fieldId: number) => {
    setOptionsLoading(true);
    try {
      const res = await apiService.get(`/master/book_fields/${fieldId}/options`);
      setOptions(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => { fetchFields(); }, []);
  useEffect(() => {
    if (activeField) {
      fetchOptions(activeField.id);
    }
  }, [activeField]);

  const handleOpenModal = (opt?: Option) => {
    if (opt) {
      setEditingOption(opt);
      setNewValue(opt.value);
      setIsActive(opt.active);
    } else {
      setEditingOption(null);
      setNewValue("");
      setIsActive(true);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeField) return;
    try {
      const payload = { value: newValue, active: isActive };
      if (editingOption) {
        await apiService.patch(`/master/book_fields/${activeField.id}/options/${editingOption.id}`, { option: payload });
      } else {
        await apiService.post(`/master/book_fields/${activeField.id}/options`, { option: payload });
      }
      setModalOpen(false);
      fetchOptions(activeField.id);
    } catch (err) {
      console.error(err);
      alert("Error saving option");
    }
  };

  const handleDelete = async (id: number) => {
    if (!activeField) return;
    if (!confirm("Are you sure? This will remove the option from all library forms.")) return;
    try {
      await apiService.delete(`/master/book_fields/${activeField.id}/options/${id}`);
      fetchOptions(activeField.id);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOptionStatus = async (opt: Option) => {
    if (!activeField) return;
    try {
      await apiService.patch(`/master/book_fields/${activeField.id}/options/${opt.id}`, { 
        option: { active: !opt.active } 
      });
      fetchOptions(activeField.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <List className="text-[--color-primary]" size={24} />
            {navT("dropdown_options")}
          </h1>
          <p className="text-[--color-muted-foreground] mt-1 text-sm font-medium">
            Manage values for dropdown fields in book forms
          </p>
        </div>
      </div>

      {/* Tabs */}
      {dropdownFields.length > 0 && (
        <div className="flex flex-wrap gap-2 p-1 bg-[--color-muted] rounded-lg w-fit border border-[--color-border]">
          {dropdownFields.map((field) => (
            <button 
              key={field.id}
              onClick={() => setActiveField(field)}
              className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${
                activeField?.id === field.id 
                  ? 'bg-white text-[--color-text] shadow-sm' 
                  : 'text-[--color-muted-foreground] hover:text-[--color-text]'
              }`}
            >
              {field.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="bg-white border border-[--color-border] rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[--color-border] flex items-center justify-between bg-white text-sm">
          <h3 className="font-bold text-xs text-[--color-muted-foreground]">
            Opsi untuk: <span className="font-bold text-sm text-[--color-text] ml-1">{activeField?.label}</span>
          </h3>
          <Button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus size={14} />
            Tambah Opsi
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-muted]">
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground] w-12">#</th>
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground]">Nilai / Opsi</th>
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground] text-center">Status</th>
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {optionsLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-[--color-muted-foreground] animate-pulse">
                    Memuat opsi {activeField?.label}...
                  </td>
                </tr>
              ) : options.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-[--color-muted-foreground]">
                    Belum ada opsi untuk field ini.
                  </td>
                </tr>
              ) : options.map((opt) => (
                <tr key={opt.id} className="hover:bg-[--color-muted]/50 transition-colors group">
                  <td className="px-6 py-3">
                    <GripVertical size={16} className="text-[--color-muted-foreground] cursor-move" />
                  </td>
                  <td className="px-6 py-3 font-normal text-[--color-text]">
                    {opt.value}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button 
                      onClick={() => toggleOptionStatus(opt)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all border ${
                        opt.active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-[--color-muted] text-[--color-muted-foreground] border-[--color-border]'
                      }`}
                    >
                      {opt.active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(opt)}
                        className="p-1.5 text-[--color-muted-foreground] hover:text-[--color-text] hover:bg-[--color-muted] rounded-md transition-colors"
                      >
                        <Settings2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(opt.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Integration */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white border border-[--color-border] rounded-xl shadow-lg overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
                <h3 className="text-lg font-bold text-[--color-text]">
                  {editingOption ? 'Edit Opsi' : 'Tambah Opsi'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-[--color-muted-foreground] hover:text-[--color-text] p-1 rounded-md hover:bg-[--color-muted] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form id="optionForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[--color-muted-foreground]">Nilai Opsi</label>
                    <input 
                      type="text"
                      required
                      autoFocus
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      placeholder="e.g. Science Fiction"
                      className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between p-3 bg-white border border-[--color-border] rounded-lg cursor-pointer hover:bg-[--color-muted]/50 transition-colors">
                      <span className="text-xs font-bold text-[--color-text]">Aktifkan Opsi</span>
                      <input 
                        type="checkbox"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                        className="w-4 h-4 rounded border-[--color-border] text-[--color-primary] focus:ring-[--color-primary]"
                      />
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-[--color-border] bg-[--color-muted]/20">
                <Button 
                  type="submit"
                  form="optionForm"
                  className="w-full flex justify-center items-center gap-2"
                >
                  <Save size={16} />
                  Simpan Opsi
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
