"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { 
  User as UserIcon, Mail, Shield, 
  MapPin, Calendar, Edit3, Camera,
  CreditCard, Save, X, Loader2,
  Lock, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";
import { AvatarCropper } from "@/components/profile/AvatarCropper";
import { PageHeader } from "@/components/layout/PageHeader";
import { format } from "date-fns";

export default function SharedProfilePage() {
  const t = useTranslations("Profile");
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingSecurity, setEditingSecurity] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [editingExtra, setEditingExtra] = useState(false);

  const [personalData, setPersonalData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [contactData, setContactData] = useState({
    phone: user?.phone || "",
    city: user?.city || "",
    country: user?.country || "",
    postal_code: user?.postal_code || "",
  });

  const [extraData, setExtraData] = useState({
    birth_date: user?.birth_date || "",
    address: user?.address || "",
  });

  const [securityData, setSecurityData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (user) {
      setPersonalData({
        name: user.name || "",
        email: user.email || "",
      });
      setContactData({
        phone: user.phone || "",
        city: user.city || "",
        country: user.country || "",
        postal_code: user.postal_code || "",
      });
      setExtraData({
        birth_date: user.birth_date || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "??";
  };

  const roleName = user?.role?.name?.replace('_', ' ') || "User";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://localhost:3001";
  
  const avatarUrl = user?.avatar_url || (user as any)?.member?.avatar_url;
  const fullAvatarUrl = avatarUrl 
    ? (avatarUrl.startsWith('http') ? avatarUrl : `${apiBaseUrl}${avatarUrl}`)
    : null;

  const handleSave = async (data: any, setEditing: (v: boolean) => void, sectionTranslationKey: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const res = await apiService.auth.updateProfile(data);
      updateUser(res.user);
      setSuccess(t("success_update", { section: t(sectionTranslationKey) }));
      setEditing(false);
    } catch (err: any) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setError(err.message || t("error_update", { section: t(sectionTranslationKey) }));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (
    label: string, 
    value: string | undefined, 
    isEditing: boolean, 
    onChange: (v: string) => void, 
    errorKey: string,
    placeholder?: string, 
    type: string = "text", 
    isFullWidth: boolean = false
  ) => {
    return (
      <div className={`space-y-1.5 ${isFullWidth ? 'col-span-full' : ''}`}>
        <label className="text-xs font-medium text-muted-foreground tracking-tight">{label}</label>
        {isEditing ? (
          type === "textarea" ? (
            <textarea 
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="w-full min-h-[80px] rounded-xl bg-card border border-border/50 p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none shadow-sm"
              placeholder={placeholder}
            />
          ) : (
            <Input 
              type={type}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="rounded-xl border-border/50 bg-card px-3 py-2 text-sm shadow-sm h-10 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder={placeholder}
            />
          )
        ) : (
          <div className={`p-3 bg-muted/10 rounded-xl text-sm border border-border/20 ${!value ? 'text-muted-foreground italic' : 'text-foreground'}`}>
            {value || t("not_filled")}
          </div>
        )}
        {fieldErrors[errorKey] && <p className="text-xs text-red-500 font-medium mt-1 px-1">{fieldErrors[errorKey][0]}</p>}
      </div>
    );
  };
 
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImage(reader.result as string);
        setCropperOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = async (croppedImage: Blob) => {
    setCropperOpen(false);
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('avatar', croppedImage, 'avatar.jpg');
      const res = await apiService.auth.updateProfile(formData);
      updateUser(res.user);
      setSuccess(t("success_update", { section: t("photo") }));
    } catch (err: any) {
      setError(err.message || t("error_update", { section: t("photo") }));
    } finally {
      setUploading(false);
      setSelectedImage(null);
    }
  };

  return (
    <div className="flex flex-col h-full -mx-6 px-6 animate-in fade-in duration-150 overflow-hidden">
      <PageHeader
        title={t("title")}
        badge={t("account_settings")}
        icon={<UserIcon size={24} strokeWidth={2.5} />}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 pr-1">
        {(error || success) && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border text-xs font-medium shadow-sm animate-in slide-in-from-top-2 duration-300 ${
            success 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="flex-1">{success || error}</span>
            <button onClick={() => {setSuccess(null); setError(null)}} className="p-1 rounded-lg hover:bg-black/5 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* HEADER CARD */}
        <Card className="rounded-[2.5rem] border-border/40 shadow-sm bg-card overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,var(--primary),transparent)]" />
          </div>
          <CardContent className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
              <div className="relative group/avatar shrink-0">
                <div className="w-28 h-28 rounded-3xl border-4 border-card bg-muted shadow-xl overflow-hidden relative flex items-center justify-center group-hover:border-primary/40 transition-all duration-300 transform group-hover:scale-[1.02]">
                  {fullAvatarUrl ? (
                    <img src={fullAvatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-3xl font-bold">
                      {getInitials(user?.name || "??")}
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="text-white animate-spin" size={24} />
                    </div>
                  )}

                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white backdrop-blur-[2px]">
                    <Camera size={24} />
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="flex-1 space-y-2 mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">{user?.name}</h2>
                  <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold tracking-widest rounded-full shadow-sm">
                    {roleName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-medium tracking-wide text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-primary/70" />
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary/70" />
                    {t("joined")}: {user?.created_at ? format(new Date(user.created_at), 'dd MMM yyyy') : '-'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PERSONAL INFORMATION CARD */}
          <Card className="rounded-[2rem] border-border/40 shadow-sm bg-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
              <h3 className="text-sm font-bold tracking-widest flex items-center gap-3 text-foreground">
                <UserIcon size={18} className="text-primary" />
                {t("personalExtra")}
              </h3>
              <div className="flex gap-2">
                {editingPersonal ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-medium rounded-xl" onClick={() => {setEditingPersonal(false); setPersonalData({ name: user?.name || "", email: user?.email || "" })}} disabled={loading}>{t("cancel")}</Button>
                    <Button size="sm" className="h-9 px-4 gap-2 bg-primary rounded-xl font-medium shadow-lg shadow-primary/20 text-xs" onClick={() => handleSave(personalData, setEditingPersonal, "personalExtra")} disabled={loading}>
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {t("save")}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="h-9 px-4 gap-2 rounded-xl font-bold text-xs border-border/50 hover:bg-muted/50 shadow-sm" onClick={() => setEditingPersonal(true)}><Edit3 size={14} /> {t("edit")}</Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {renderField(t("fullName"), personalData.name, editingPersonal, (v) => setPersonalData({...personalData, name: v}), "name", t("name_placeholder"))}
              {renderField(t("email"), personalData.email, editingPersonal, (v) => setPersonalData({...personalData, email: v}), "email", "name@example.com")}
              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-tight text-muted-foreground">{t("membershipStatus")}</label>
                <div className="p-3 bg-muted/10 rounded-xl border border-border/20 text-sm text-foreground flex items-center gap-3 shadow-none">
                  <Shield size={16} className="text-primary" />{roleName}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-tight text-muted-foreground">{t("joined")}</label>
                <div className="p-3 bg-muted/10 rounded-xl border border-border/20 text-sm text-foreground flex items-center gap-3 shadow-none">
                  <Calendar size={16} className="text-primary" />{user?.created_at ? format(new Date(user.created_at), 'dd MMM yyyy') : '-'}
                </div>
              </div>
            </div>
          </Card>

          {/* SECURITY CARD */}
          <Card className="rounded-[2rem] border-border/40 shadow-sm bg-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
              <h3 className="text-sm font-bold tracking-widest flex items-center gap-3 text-foreground">
                <Lock size={18} className="text-primary" />
                {t("securityInfo")}
              </h3>
              <div className="flex gap-2">
                {editingSecurity ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-medium rounded-xl" onClick={() => {setEditingSecurity(false); setSecurityData({ current_password: "", new_password: "", new_password_confirmation: "" })}} disabled={loading}>{t("cancel")}</Button>
                    <Button size="sm" className="h-9 px-4 gap-2 bg-primary rounded-xl font-medium shadow-lg shadow-primary/20 text-xs" onClick={async () => {
                      setLoading(true); setFieldErrors({});
                      try {
                        await apiService.auth.changePassword(securityData); setSuccess(t("success_update", { section: t("securityInfo") })); setEditingSecurity(false); setSecurityData({current_password:"", new_password:"", new_password_confirmation:""});
                      } catch(err:any) { setFieldErrors(err.errors || {}); setError(err.message || t("error_update", { section: t("securityInfo") })); }
                      finally { setLoading(false); }
                    }} disabled={loading}>
                       {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {t("save")}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="h-9 px-4 gap-2 rounded-xl font-medium text-xs border-border/50 hover:bg-muted/50 shadow-sm" onClick={() => setEditingSecurity(true)}><Edit3 size={14} /> {t("edit")}</Button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {!editingSecurity ? (
                <div className="p-4 bg-muted/10 rounded-xl border border-border/20 space-y-2">
                  <span className="text-[10px] font-medium tracking-widest text-muted-foreground">{t("password_label")}</span>
                  <p className="font-mono text-lg text-foreground tracking-widest mt-1">••••••••</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium tracking-tight text-muted-foreground">{t("current_password")}</label>
                    <Input type="password" value={securityData.current_password} onChange={(e)=>setSecurityData({...securityData, current_password: e.target.value})} className={`bg-card text-sm h-10 rounded-xl font-mono shadow-sm focus:ring-2 focus:ring-primary/20 ${fieldErrors.current_password ? 'border-red-500' : 'border-border/50'}`} placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium tracking-tight text-muted-foreground">{t("new_password")}</label>
                    <Input type="password" value={securityData.new_password} onChange={(e)=>setSecurityData({...securityData, new_password: e.target.value})} className={`bg-card text-sm h-10 rounded-xl font-mono shadow-sm focus:ring-2 focus:ring-primary/20 ${fieldErrors.new_password ? 'border-red-500' : 'border-border/50'}`} placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium tracking-tight text-muted-foreground">{t("confirm_password")}</label>
                    <Input type="password" value={securityData.new_password_confirmation} onChange={(e)=>setSecurityData({...securityData, new_password_confirmation: e.target.value})} className={`bg-card text-sm h-10 rounded-xl font-mono shadow-sm focus:ring-2 focus:ring-primary/20 ${fieldErrors.new_password_confirmation ? 'border-red-500' : 'border-border/50'}`} placeholder="••••••••" />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* CONTACT INFORMATION CARD */}
          <Card className="rounded-[2rem] border-border/40 shadow-sm bg-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
              <h3 className="text-sm font-bold tracking-widest flex items-center gap-3 text-foreground">
                <CreditCard size={18} className="text-primary" />
                {t("contactInfo")}
              </h3>
              <div className="flex gap-2">
                {editingContact ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-medium rounded-xl" onClick={() => {setEditingContact(false); setContactData({ phone: user?.phone || "", city: user?.city || "", country: user?.country || "", postal_code: user?.postal_code || "" })}} disabled={loading}>{t("cancel")}</Button>
                    <Button size="sm" className="h-9 px-4 gap-2 bg-primary rounded-xl font-medium shadow-lg shadow-primary/20 text-xs" onClick={() => handleSave(contactData, setEditingContact, "contactInfo")} disabled={loading}>
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {t("save")}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="h-9 px-4 gap-2 rounded-xl font-bold text-xs border-border/50 hover:bg-muted/50 shadow-sm" onClick={() => setEditingContact(true)}><Edit3 size={14} /> {t("edit")}</Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {renderField(t("phone"), contactData.phone, editingContact, (v) => setContactData({...contactData, phone: v}), "phone", "+62...")}
              {renderField(t("city"), contactData.city, editingContact, (v) => setContactData({...contactData, city: v}), "city", t("city_placeholder"))}
              {renderField(t("country"), contactData.country, editingContact, (v) => setContactData({...contactData, country: v}), "country", t("country_placeholder"))}
              {renderField(t("postal_code"), contactData.postal_code, editingContact, (v) => setContactData({...contactData, postal_code: v}), "postal_code", t("postal_placeholder"))}
            </div>
          </Card>

          {/* PERSONAL EXTRA CARD */}
          <Card className="rounded-[2rem] border-border/40 shadow-sm bg-card p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
              <h3 className="text-sm font-bold tracking-widest flex items-center gap-3 text-foreground">
                <Calendar size={18} className="text-primary" />
                {t("personalInfo")}
              </h3>
              <div className="flex gap-2">
                {editingExtra ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-medium rounded-xl" onClick={() => {setEditingExtra(false); setExtraData({ birth_date: user?.birth_date || "", address: user?.address || "" })}} disabled={loading}>{t("cancel")}</Button>
                    <Button size="sm" className="h-9 px-4 gap-2 bg-primary rounded-xl font-medium shadow-lg shadow-primary/20 text-xs" onClick={() => handleSave(extraData, setEditingExtra, "personalInfo")} disabled={loading}>
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {t("save")}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="h-9 px-4 gap-2 rounded-xl font-bold text-xs border-border/50 hover:bg-muted/50 shadow-sm" onClick={() => setEditingExtra(true)}><Edit3 size={14} /> {t("edit")}</Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {renderField(t("birth_date"), extraData.birth_date, editingExtra, (v) => setExtraData({...extraData, birth_date: v}), "birth_date", "", "date")}
              {renderField(t("address_label"), extraData.address, editingExtra, (v) => setExtraData({...extraData, address: v}), "address", t("address_placeholder"), "textarea", true)}
            </div>
          </Card>
        </div>
      </div>

      {cropperOpen && selectedImage && (
        <AvatarCropper 
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setSelectedImage(null);
          }}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
