const getApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl !== "undefined" && envUrl !== "" && envUrl.startsWith('http')) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return "http://localhost:3001/api/v1";
};

const API_URL = getApiUrl();

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const tenantSlug = typeof window !== 'undefined'
    ? (sessionStorage.getItem('tenant-slug') || extractSubdomainFromHost() || 'demo-lib')
    : 'demo-lib';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : '';

  const headers: Record<string, string> = {
    'X-Tenant-Slug': tenantSlug || '',
    'Authorization': token ? `Bearer ${token}` : '',
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.errors?.join(', ') || error.error || 'API request failed');
  }

  if (response.status === 204) {
    return {} as any;
  }

  return response.json();
};

function extractSubdomainFromHost(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length <= 2) return '';
  const sub = parts[0];
  if (['www', 'api', 'localhost'].includes(sub)) return '';
  return sub;
}

export const apiService = {
  auth: {
    login: (credentials: any) =>
      apiFetch('/users/sign_in', { method: 'POST', body: JSON.stringify(credentials) }),
    callback: (token: string) =>
      apiFetch(`/auth/callback?token=${encodeURIComponent(token)}`),
    register: (data: any) =>
      apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
    verifyPassword: (password: string) =>
      apiFetch('/auth/verify_password', { method: 'POST', body: JSON.stringify({ password }) }),
    changePassword: (data: any) =>
      apiFetch('/auth/change_password', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => apiFetch('/logout', { method: 'DELETE' }),
    updateProfile: (data: any) => {
      const isFormData = data instanceof FormData;
      return apiFetch('/profile', { 
        method: 'PATCH', 
        body: isFormData ? data : JSON.stringify(data) 
      });
    },
  },
  tenants: {
    list: () => apiFetch('/tenants'),
    stats: () => apiFetch('/tenants/stats'),
    get: (id: string | number) => apiFetch(`/tenants/${id}`),
    create: (data: { name: string; subdomain: string; owner_email: string; owner_name?: string }) =>
      apiFetch('/tenants', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string | number, data: Partial<{ name: string; subdomain: string; status: string }>) =>
      apiFetch(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateSettings: (data: FormData) =>
      apiFetch('/settings', { method: 'PATCH', body: data }),
    impersonate: (tenantId: string | number) =>
      apiFetch(`/tenants/${tenantId}/impersonate`, { method: 'POST' }),
    suspend: (id: string | number) => apiFetch(`/tenants/${id}/suspend`, { method: 'POST' }),
    activate: (id: string | number) => apiFetch(`/tenants/${id}/activate`, { method: 'POST' }),
    publicFind: (subdomain: string) => apiFetch(`/tenants/public_find?subdomain=${encodeURIComponent(subdomain)}`),
  },
  users: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/users${query}`);
    },
    get: (id: string | number) => apiFetch(`/users/${id}`),
    suspend: (id: string | number) => apiFetch(`/users/${id}/suspend`, { method: 'POST' }),
    activate: (id: string | number) => apiFetch(`/users/${id}/activate`, { method: 'POST' }),
    create: (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
    search: (q: string) => apiFetch(`/users?q=${encodeURIComponent(q)}`),
  },
  auditLogs: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/audit_logs${query}`);
    },
  },
  notifications: {
    list: () => apiFetch('/notifications'),
    read: (id: string | number) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    readAll: () => apiFetch('/notifications/read_all', { method: 'POST' }),
    delete: (id: string | number) => apiFetch(`/notifications/${id}`, { method: 'DELETE' }),
    clearAll: () => apiFetch('/notifications/clear_all', { method: 'POST' }),
  },
  tenantMessages: {
    list: () => apiFetch('/tenant_messages'),
    create: (data: any) => {
      const isFormData = data instanceof FormData;
      return apiFetch('/tenant_messages', { method: 'POST', body: isFormData ? data : JSON.stringify({ tenant_message: data }) });
    },
  },
  broadcasts: {
    list: () => apiFetch('/broadcasts'),
    create: (data: any) => {
      const isFormData = data instanceof FormData;
      return apiFetch('/broadcasts', { method: 'POST', body: isFormData ? data : JSON.stringify(data) });
    },
  },
  supportTickets: {
    list: () => apiFetch('/support_tickets'),
    get: (id: string | number) => apiFetch(`/support_tickets/${id}`),
    create: (data: { title: string; body: string }) =>
      apiFetch('/support_tickets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string | number, data: { status: string }) =>
      apiFetch(`/support_tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    reply: (id: string | number, body: string) =>
      apiFetch(`/support_tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ body }) }),
  },
  messages: {
    list: () => apiFetch('/internal_messages'),
    create: (data: any) => {
      const isFormData = data instanceof FormData;
      return apiFetch('/internal_messages', { method: 'POST', body: isFormData ? data : JSON.stringify(data) });
    },
    readAll: () => apiFetch('/internal_messages/read_all', { method: 'POST' }),
    delete: (id: string | number) => apiFetch(`/internal_messages/${id}`, { method: 'DELETE' }),
    clearAll: () => apiFetch('/internal_messages/clear_all', { method: 'POST' }),
  },
  financial: {
    getReport: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/financial_reports${query}`);
    },
    exportCSV: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return `${API_URL}/financial_reports/export_csv${query}`;
    },
  },
  transactions: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/transactions${query}`);
    },
    create: (data: any) => apiFetch('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  },
  settings: {
    get: () => apiFetch('/tenant_settings'),
    update: (data: any) => apiFetch('/tenant_settings', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  books: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/books${query}`);
    },
    get: (id: string) => apiFetch(`/books/${id}`),
    getCopies: (id: string) => apiFetch(`/books/${id}/copies`),
    getByBarcode: (barcode: string) => apiFetch(`/books/by_barcode?barcode=${encodeURIComponent(barcode)}`),
    getLibraryStats: () => apiFetch('/books/library_stats'),
    search: (query: string) => apiFetch(`/books?q=${encodeURIComponent(query)}`),
    create: (data: any) => {
      const isFormData = data instanceof FormData;
      return apiFetch('/books', { method: 'POST', body: isFormData ? data : JSON.stringify(data) });
    },
    update: (id: string | number, data: any) => {
      const isFormData = data instanceof FormData;
      return apiFetch(`/books/${id}`, { method: 'PATCH', body: isFormData ? data : JSON.stringify(data) });
    },
  },
  members: {
    list: () => apiFetch('/members'),
    get: (id: string) => apiFetch(`/members/${id}`),
    update: (id: string, data: any) => apiFetch(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    uploadAvatar: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('member[avatar]', file);
      return apiFetch(`/members/${id}`, { method: 'PATCH', body: formData });
    },
  },
  borrowings: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/borrowings${query}`);
    },
    get: (id: string) => apiFetch(`/borrowings/${id}`),
    create: (data: any) => apiFetch('/borrowings', { method: 'POST', body: JSON.stringify(data) }),
    return: (id: string) => apiFetch(`/borrowings/${id}/return`, { method: 'POST' }),
    requestReturn: (id: string) => apiFetch(`/borrowings/${id}/request_return`, { method: 'POST' }),
    cancel: (id: string, data?: any) =>
      apiFetch(`/borrowings/${id}/cancel`, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    approve: (id: string) => apiFetch(`/borrowings/${id}/approve`, { method: 'POST' }),
    extend: (id: string, data?: any) => 
      apiFetch(`/borrowings/${id}/extend`, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    stats: () => apiFetch('/borrowings/stats'),
    batchCreate: (data: { barcodes: string[] }) => 
      apiFetch('/borrowings/batch_create', { method: 'POST', body: JSON.stringify(data) }),
    approveGroup: (groupId: string) => 
      apiFetch('/borrowings/approve_group', { method: 'POST', body: JSON.stringify({ group_id: groupId }) }),
  },
  ebooks: {
    list: () => apiFetch('/ebooks'),
    get: (id: string | number) => apiFetch(`/ebooks/${id}`),
  },
  categories: {
    list: () => apiFetch('/categories'),
  },
  invitations: {
    create: (data: { email: string; expires_at?: string; tenant_id?: string | number }) =>
      apiFetch('/invitations', { method: 'POST', body: JSON.stringify(data) }),
    validate: (token: string) =>
      apiFetch(`/invitations/validate/${token}`),
  },
  account: {
    getCOA: () => apiFetch('/coa_accounts'),
    getTransactions: () => apiFetch('/transactions'),
  },
  systemSettings: {
    get: () => apiFetch('/system_settings'),
    update: (data: any) => apiFetch('/system_settings', { method: 'PATCH', body: JSON.stringify({ system_setting: data }) }),
    status: () => apiFetch('/system_settings/status'),
  },

  // Generic methods for dynamic calls
  get: (endpoint: string) => apiFetch(endpoint),
  post: (endpoint: string, data: any) => {
    const isFormData = data instanceof FormData;
    return apiFetch(endpoint, { method: 'POST', body: isFormData ? data : JSON.stringify(data) });
  },
  patch: (endpoint: string, data: any) => {
    const isFormData = data instanceof FormData;
    return apiFetch(endpoint, { method: 'PATCH', body: isFormData ? data : JSON.stringify(data) });
  },
  delete: (endpoint: string) => apiFetch(endpoint, { method: 'DELETE' }),
};
