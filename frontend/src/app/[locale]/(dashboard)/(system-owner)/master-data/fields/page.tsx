"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { 
  Database, Plus, Settings2, Trash2, 
  GripVertical, CheckCircle, XCircle,
  AlertCircle, Save, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

interface FieldConfig {
  id: number;
  name: string;
  label: string;
  field_type: "text" | "number" | "textarea" | "dropdown";
  required: boolean;
  active: boolean;
  is_default: boolean;
  position: number;
}

export default function FieldConfigurationPage() {
  const t = useTranslations("MasterData");
  const navT = useTranslations("Navigation");
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    field_type: "text",
    required: false,
    active: true
  });

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await apiService.get("/master/book_fields");
      setFields(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFields(); }, []);

  const handleOpenModal = (field?: FieldConfig) => {
    if (field) {
      setEditingField(field);
      setFormData({
        name: field.name,
        label: field.label,
        field_type: field.field_type,
        required: field.required,
        active: field.active
      });
    } else {
      setEditingField(null);
      setFormData({
        name: "",
        label: "",
        field_type: "text",
        required: false,
        active: true
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingField) {
        await apiService.patch(`/master/book_fields/${editingField.id}`, { book_field: formData });
      } else {
        await apiService.post("/master/book_fields", { book_field: formData });
      }
      setModalOpen(false);
      fetchFields();
    } catch (err) {
      console.error(err);
      alert("Error saving field configuration");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this custom field?")) return;
    try {
      await apiService.delete(`/master/book_fields/${id}`);
      fetchFields();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (field: FieldConfig, type: "active" | "required") => {
    try {
      const updatedValue = !field[type];
      await apiService.patch(`/master/book_fields/${field.id}`, { 
        book_field: { [type]: updatedValue } 
      });
      fetchFields();
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
            <Settings2 className="text-[--color-primary]" size={24} />
            {navT("field_config")}
          </h1>
          <p className="text-[--color-muted-foreground] mt-1 text-sm font-medium">
            Configure book form structure for all tenants
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Tambah Field
        </Button>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-[--color-border] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[--color-border] bg-[--color-muted]">
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground] w-12">#</th>
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground]">Label</th>
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground]">Tipe</th>
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground] text-center">Wajib</th>
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground] text-center">Aktif</th>
                <th className="px-6 py-3 font-bold text-xs text-[--color-muted-foreground] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-[--color-muted-foreground] animate-pulse">
                    Memuat konfigurasi...
                  </td>
                </tr>
              ) : fields.map((f) => (
                <tr key={f.id} className="hover:bg-[--color-muted]/50 transition-colors group">
                  <td className="px-6 py-3">
                    <GripVertical size={16} className="text-[--color-muted-foreground] cursor-move" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-[--color-text] flex items-center gap-2">
                        {f.label}
                        {f.is_default && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200 font-medium">Default</span>
                        )}
                      </span>
                      <span className="text-xs text-[--color-muted-foreground] font-mono">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium bg-[--color-muted] px-2 py-1 rounded-md text-[--color-text]">
                      {f.field_type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button 
                      onClick={() => toggleStatus(f, "required")}
                      className={`p-1 rounded-md transition-colors ${f.required ? 'text-blue-600 bg-blue-50' : 'text-[--color-muted-foreground] hover:bg-[--color-muted]'}`}
                    >
                      {f.required ? <CheckCircle size={16} className="fill-blue-100" /> : <XCircle size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button 
                      onClick={() => toggleStatus(f, "active")}
                      className={`p-1 rounded-md transition-colors ${f.active ? 'text-emerald-600 bg-emerald-50' : 'text-[--color-muted-foreground] hover:bg-[--color-muted]'}`}
                    >
                      {f.active ? <CheckCircle size={16} className="fill-emerald-100" /> : <XCircle size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(f)}
                        className="p-1.5 text-[--color-muted-foreground] hover:text-[--color-text] hover:bg-[--color-muted] rounded-md transition-colors"
                      >
                        <Settings2 size={16} />
                      </button>
                      {!f.is_default && (
                        <button 
                          onClick={() => handleDelete(f.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
              className="relative w-full max-w-lg bg-white border border-[--color-border] rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
                <h3 className="text-lg font-bold text-[--color-text]">
                  {editingField ? 'Edit Field' : 'Tambah Field Baru'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-[--color-muted-foreground] hover:text-[--color-text] transition-colors p-1 rounded-md hover:bg-[--color-muted]">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="fieldForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[--color-muted-foreground]">Internal Name</label>
                      <input 
                        type="text"
                        disabled={editingField?.is_default}
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. coloring"
                        className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all disabled:bg-[--color-muted] disabled:text-[--color-muted-foreground]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[--color-muted-foreground]">Label (Display Name)</label>
                      <input 
                        type="text"
                        required
                        value={formData.label}
                        onChange={e => setFormData({...formData, label: e.target.value})}
                        placeholder="e.g. Warna Buku"
                        className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[--color-muted-foreground]">Tipe Field</label>
                    <select 
                      disabled={editingField?.is_default}
                      value={formData.field_type}
                      onChange={e => setFormData({...formData, field_type: e.target.value})}
                      className="w-full bg-white border border-[--color-border] focus:outline-none focus:ring-1 focus:ring-[--color-primary] rounded-lg px-3 py-2 text-sm transition-all disabled:bg-[--color-muted] disabled:text-[--color-muted-foreground]"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="textarea">TextArea</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-between p-3 bg-white border border-[--color-border] rounded-lg cursor-pointer hover:bg-[--color-muted]/50 transition-colors">
                      <span className="text-sm font-medium text-[--color-text]">Wajib diisi</span>
                      <input 
                        type="checkbox"
                        checked={formData.required}
                        onChange={e => setFormData({...formData, required: e.target.checked})}
                        className="w-4 h-4 rounded border-[--color-border] text-[--color-primary] focus:ring-[--color-primary]"
                      />
                    </label>
                    <label className="flex-1 flex items-center justify-between p-3 bg-white border border-[--color-border] rounded-lg cursor-pointer hover:bg-[--color-muted]/50 transition-colors">
                      <span className="text-sm font-medium text-[--color-text]">Aktifkan Field</span>
                      <input 
                        type="checkbox"
                        checked={formData.active}
                        onChange={e => setFormData({...formData, active: e.target.checked})}
                        className="w-4 h-4 rounded border-[--color-border] text-emerald-600 focus:ring-emerald-600"
                      />
                    </label>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-[--color-border] bg-[--color-muted]/20">
                <Button 
                  type="submit"
                  form="fieldForm"
                  className="w-full flex justify-center items-center gap-2"
                >
                  <Save size={16} />
                  Simpan Perubahan
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
