/**
 * Dashboard.tsx  –  ADMIN COMMAND CENTER v7
 * Sidebar layout · Modal-first UX · Client 360 Sheet · Live Preview
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { adminInsertClientUpdate, adminUpdatePricingRequest } from "@/services/adminClientModalService";
import { adminText } from "@/data/adminI18n";
import { OrdersKanban } from "@/components/admin/dashboard/OrdersKanban";
import { ContactsManager } from "@/components/admin/dashboard/ContactsManager";
import { PricingRequestsManager } from "@/components/admin/dashboard/PricingRequestsManager";
import ClientMasterModal from "@/components/admin/ClientMasterModal";
import AddClientModal from "@/components/admin/AddClientModal";
import ClientSheet from "@/components/admin/ClientSheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard, Users, Activity, TrendingUp, DollarSign, Clock,
  MessageSquare, Search, Smartphone, Trash2, Eye, Copy, Archive,
  AlertTriangle, BookOpen, Plus, BarChart2,
  Package, Edit3, CheckCircle, Zap,
  RefreshCw, ChevronRight, Menu, X, Bell,
  LogOut, Monitor, Filter,
  FileText,
} from "lucide-react";
import { Client, ClientUpdate, PricingRequest, SavedDesign } from "@/types/dashboard";

/* ── Types ───────────────────────────────────────────────────── */
type AdminView = "overview" | "orders" | "pricing" | "inbox" | "clients" | "designs" | "guide";
type ClientFilter = "all" | "active" | "pending" | "inactive";

/* ── Badge atom ──────────────────────────────────────────────── */
const statusColor = (s?: string) =>
  s === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    s === "completed" ? "bg-blue-100 text-blue-700 border-blue-200" :
      s === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
        s === "cancelled" ? "bg-rose-100 text-rose-700 border-rose-200" :
          "bg-slate-100 text-slate-500 border-slate-200";

const Badge = ({ label, color }: { label: string; color?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${color || statusColor(label.toLowerCase())}`}>{label}</span>
);

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const { client: authClient, logout } = useAuth();
  const { isArabic } = useLanguage();
  const tx = (key: Parameters<typeof adminText>[0]) => adminText(key, isArabic);

  const {
    stats, orders, contacts, pricingRequests, clients, clientUpdates, designs, loading,
    refresh, updateOrderStatus, deleteOrder, updateContactStatus, deleteContact,
    updatePricingRequestStatus, deletePricingRequest, convertPricingRequest,
    updateDesignStatus, deleteDesign, addClient, deleteClient,
  } = useAdminDashboard();

  /* ── UI state ─────────────────────────────────────────────── */
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [designSearch, setDesignSearch] = useState("");
  const [clientFilter, setClientFilter] = useState<ClientFilter>("all");

  /* ── Modal / Sheet state ──────────────────────────────────── */
  const [sheetClient, setSheetClient] = useState<Client | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [managingClient, setManagingClient] = useState<Client | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; description: string; action: (() => void) | null;
  }>({ open: false, title: "", description: "", action: null });

  /* ── Helpers ─────────────────────────────────────────────── */
  const requestConfirm = useCallback((title: string, description: string, action: () => void) => {
    setConfirmDialog({ open: true, title, description, action });
  }, []);

  const recordClientUpdate = useCallback(async (clientId: string | null | undefined, title: string, type: "milestone" | "update" | "action" = "action") => {
    if (!clientId) return;
    await adminInsertClientUpdate({
      client_id: clientId,
      title,
      type,
      update_date: new Date().toISOString(),
    });
  }, []);

  const handleConfirmAction = useCallback(() => {
    setConfirmDialog(prev => {
      prev.action?.();
      return { open: false, title: "", description: "", action: null };
    });
  }, []);

  const openClientSheet = (c: Client) => { setSheetClient(c); setSheetOpen(true); };
  const closeSheet = () => { setSheetOpen(false); setTimeout(() => setSheetClient(null), 300); };

  const confirmDeleteOrder = (id: string) => requestConfirm("Delete Order", "Permanently remove this order?", () => deleteOrder(id));
  const confirmDeletePricingRequest = (id: string) => requestConfirm("Delete Pricing Request", "Permanently remove this pricing request?", () => deletePricingRequest(id));
  const confirmDeleteContact = (id: string) => requestConfirm("Delete Contact", "Permanently remove this contact?", () => deleteContact(id));
  const confirmDeleteDesign = (id: string) => requestConfirm("Delete Design", "Permanently delete this design?", () => deleteDesign(id));
  const confirmDeleteClient = (id: string) => requestConfirm("Delete Client", "Permanently delete this client and all their data?", () => deleteClient(id));

  const changeView = (v: AdminView) => { setActiveView(v); setSidebarOpen(false); };
  const serviceIcon = (s: string) =>
    s === "restaurant" ? "🍽️" : s === "cafe" ? "☕" : s === "salon" ? "✂️" : s === "pharmacy" ? "💊" : s === "store" ? "🏪" : "🏢";

  const handlePricingStatusChange = useCallback(async (request: PricingRequest, nextStatus: PricingRequest["status"]) => {
    await updatePricingRequestStatus(request.id, nextStatus);
    await recordClientUpdate(request.client_id, `Pricing request moved to ${nextStatus}`, nextStatus === "approved" ? "milestone" : "action");
  }, [recordClientUpdate, updatePricingRequestStatus]);

  const handlePricingConvert = useCallback(async (request: PricingRequest) => {
    await convertPricingRequest(request);
    await recordClientUpdate(request.client_id, `Pricing request converted to order`, "milestone");
  }, [convertPricingRequest, recordClientUpdate]);

  const handlePricingAdminNotesSave = useCallback(async (request: PricingRequest, adminNotes: string) => {
    try {
      await adminUpdatePricingRequest(request.id, { admin_notes: adminNotes.trim() || null });
    } catch {
      toast.error("Failed to save pricing note");
      return;
    }

    await recordClientUpdate(request.client_id, "Admin pricing note updated", "action");
    toast.success("Pricing note saved");
    refresh();
  }, [recordClientUpdate, refresh]);

  const handleOpenPricingClient = useCallback((request: PricingRequest) => {
    if (!request.client_id) {
      toast.error("This request is not linked to a client account");
      return;
    }

    const linkedClient = clients.find(client => client.id === request.client_id);
    if (!linkedClient) {
      toast.error("Linked client record was not found");
      return;
    }

    setManagingClient(linkedClient);
  }, [clients]);

  /* ── Derived data ─────────────────────────────────────────── */
  const filteredClients = clients.filter(c => {
    const name = (c.company_name || c.username).toLowerCase();
    const matchSearch = name.includes(clientSearch.toLowerCase());
    const matchFilter =
      clientFilter === "all" ? true :
        clientFilter === "active" ? c.status === "active" :
          clientFilter === "pending" ? c.status === "pending" :
            c.status !== "active" && c.status !== "pending";
    return matchSearch && matchFilter;
  });

  const filteredDesigns = designs.filter(d =>
    d.business_name.toLowerCase().includes(designSearch.toLowerCase()) ||
    d.service_type.toLowerCase().includes(designSearch.toLowerCase())
  );

  const latestOrderByClient = useMemo(() => {
    const orderMap = new Map<string, typeof orders[number]>();

    orders.forEach(order => {
      if (!order.client_id) return;
      const existing = orderMap.get(order.client_id);
      if (!existing || new Date(order.created_at).getTime() > new Date(existing.created_at).getTime()) {
        orderMap.set(order.client_id, order);
      }
    });

    return orderMap;
  }, [orders]);

  const clientNameById = useMemo(() => {
    const clientMap = new Map<string, string>();

    clients.forEach(client => {
      clientMap.set(client.id, client.company_name || client.username);
    });

    return clientMap;
  }, [clients]);

  const activityTone = (type?: ClientUpdate["type"]) =>
    type === "milestone"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : type === "action"
        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
        : "bg-slate-50 text-slate-600 border-slate-200";

  /* ── Sidebar nav items ───────────────────────────────────── */
  const navItems: { id: AdminView; label: string; icon: React.ReactNode; badge?: number; accent: string }[] = [
    { id: "overview", label: tx("overview"), icon: <Activity className="w-4 h-4" />, accent: "indigo", badge: undefined },
    { id: "orders", label: tx("orders"), icon: <LayoutDashboard className="w-4 h-4" />, accent: "blue", badge: stats.pendingOrders || undefined },
    { id: "pricing", label: tx("pricing"), icon: <FileText className="w-4 h-4" />, accent: "cyan", badge: stats.newPricingRequests || undefined },
    { id: "inbox", label: tx("inbox"), icon: <MessageSquare className="w-4 h-4" />, accent: "violet", badge: stats.newContacts || undefined },
    { id: "clients", label: tx("clients"), icon: <Users className="w-4 h-4" />, accent: "emerald", badge: clients.length || undefined },
    { id: "designs", label: tx("designs"), icon: <Smartphone className="w-4 h-4" />, accent: "rose", badge: stats.totalDesigns || undefined },
    { id: "guide", label: tx("guide"), icon: <BookOpen className="w-4 h-4" />, accent: "amber", badge: undefined },
  ];

  const accentClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700",
    blue: "bg-blue-50 text-blue-700",
    cyan: "bg-cyan-50 text-cyan-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
  };

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onTouchEnd={e => { e.preventDefault(); setSidebarOpen(false); }}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 shadow-xl z-50
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:shadow-none
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">LUMOS</p>
              <p className="text-[10px] text-slate-400 font-medium">{tx("adminCenter")}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Refresh */}
        <div className="px-4 py-3 border-b border-slate-50">
          <button onClick={refresh} disabled={loading}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-50 border border-slate-200 transition-all disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
            {loading ? tx("refreshing") : tx("refreshData")}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <p className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx("navigation")}</p>
          {navItems.map(item => {
            const active = activeView === item.id;
            return (
              <button key={item.id} onClick={() => changeView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? accentClasses[item.accent] : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <span className={active ? "" : "text-slate-400"}>{item.icon}</span>
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-black ${active ? "bg-slate-900/10" : "bg-slate-200 text-slate-600"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3">
            <p className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tx("tools")}</p>
            <a href="/demo" target="_blank" rel="noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-all">
              <Monitor className="w-4 h-4 text-slate-400" /> {tx("livePreviewTool")}
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300" />
            </a>
          </div>
        </nav>

        {/* Admin footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
              G
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">George</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Admin
              </p>
            </div>
          </div>
          <button onClick={() => { logout?.(); navigate("/admin/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
            <LogOut className="w-3.5 h-3.5" /> {tx("signOut")}
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col min-h-screen">

        {/* ── TOPBAR ────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center gap-4 px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0">
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900">
              {navItems.find(n => n.id === activeView)?.label || "Dashboard"}
            </h1>
          </div>

          {/* Global search */}
          <div className="relative flex-1 max-w-md mx-auto sm:mx-0 sm:ml-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tx("quickSearch")}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {search && (
            <div className="absolute top-16 left-0 right-0 bg-white border border-slate-200 shadow-xl z-50 rounded-2xl mx-4 sm:mx-6 overflow-hidden max-h-80 overflow-y-auto">
              {clients.filter(c => (c.company_name || c.username).toLowerCase().includes(search.toLowerCase())).slice(0, 5).map(c => (
                <div key={c.id} onClick={() => { setSearch(""); openClientSheet(c); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                    {(c.company_name || c.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.company_name || c.username}</p>
                    <p className="text-xs text-slate-400">@{c.username}</p>
                  </div>
                  <Badge label={c.status || "N/A"} />
                </div>
              ))}
              {designs.filter(d => d.business_name.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(d => (
                <a key={d.id} href={`/demo?name=${encodeURIComponent(d.business_name)}&service=${d.service_type}`} target="_blank" rel="noreferrer"
                  onClick={() => setSearch("")}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-sm flex-shrink-0">{serviceIcon(d.service_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{d.business_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{d.service_type} design</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </a>
              ))}
              {clients.filter(c => (c.company_name || c.username).toLowerCase().includes(search.toLowerCase())).length === 0 &&
                designs.filter(d => d.business_name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                  <div className="px-4 py-6 text-center text-slate-400 text-sm">{tx("noResultsFor")} "{search}"</div>
                )}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <div className="relative">
              <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                <Bell className="w-[18px] h-[18px]" />
              </button>
              {(stats.unreadMessages > 0 || stats.newContacts > 0) && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">
                  {stats.unreadMessages + stats.newContacts}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── CONTENT ──────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">

          {loading && clients.length === 0 && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-48">
              <div className="w-12 h-12 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-5" />
              <p className="text-slate-400 text-sm font-medium">{tx("loadingDashboard")}</p>
            </div>
          ) : (
            <>
              {/* ════════════ OVERVIEW ═══════════════════════ */}
              {activeView === "overview" && (
                <div className="space-y-6 fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{tx("goodDayGeorge")}</h2>
                      <p className="text-slate-400 text-sm mt-1">{tx("todaySummary")}</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-600">{tx("allSystemsOnline")}</span>
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, gradient: "from-emerald-500 to-teal-500", sub: "All time" },
                      { label: "Total Orders", value: stats.totalOrders, icon: <LayoutDashboard className="w-5 h-5" />, gradient: "from-blue-500 to-indigo-500", sub: `${stats.completedOrders} completed` },
                      { label: "Pricing Requests", value: stats.totalPricingRequests, icon: <FileText className="w-5 h-5" />, gradient: "from-cyan-500 to-sky-500", sub: `${stats.newPricingRequests} new` },
                      { label: "Total Clients", value: clients.length, icon: <Users className="w-5 h-5" />, gradient: "from-violet-500 to-purple-500", sub: `${clients.filter(c => c.status === "active").length} active` },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 relative overflow-hidden hover:shadow-md transition-shadow">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4 shadow-md`}>
                          <span className="text-white">{s.icon}</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">{s.value}</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">{s.label}</p>
                        <p className="text-[10px] text-slate-300 mt-0.5">{s.sub}</p>
                        <div className={`absolute right-0 top-0 w-24 h-24 rounded-full opacity-[0.06] bg-gradient-to-br ${s.gradient} -mr-8 -mt-8`} />
                      </div>
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recent orders */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-blue-500" />
                          <h3 className="text-sm font-bold text-slate-700">Recent Orders</h3>
                        </div>
                        <button onClick={() => changeView("orders")} className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors flex items-center gap-1">
                          View all <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {orders.slice(0, 6).map(order => (
                          <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-indigo-600">{order.client_name?.charAt(0) || "?"}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{order.client_name}</p>
                                <p className="text-xs text-slate-400">{order.package_type || "Custom"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                              <span className="text-sm font-bold text-slate-700">${order.total_price}</span>
                              <Badge label={order.status} />
                            </div>
                          </div>
                        ))}
                        {orders.length === 0 && <div className="text-center py-10 text-slate-300 text-sm">No orders yet</div>}
                      </div>
                    </div>

                    {/* Sidebar panels */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
                        </h3>
                        <div className="space-y-1.5">
                          {[
                            { label: "Add New Client", action: () => setAddClientOpen(true), icon: <Plus className="w-4 h-4" />, bg: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
                            { label: "Orders Board", action: () => changeView("orders"), icon: <LayoutDashboard className="w-4 h-4" />, bg: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
                            { label: "Pricing Requests", action: () => changeView("pricing"), icon: <FileText className="w-4 h-4" />, bg: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100" },
                            { label: "New Leads", action: () => changeView("inbox"), icon: <MessageSquare className="w-4 h-4" />, bg: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
                            { label: "Client Database", action: () => changeView("clients"), icon: <Users className="w-4 h-4" />, bg: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
                            { label: "Open Live Preview", action: () => window.open("/demo", "_blank"), icon: <Monitor className="w-4 h-4" />, bg: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
                          ].map((act, i) => (
                            <button key={i} onClick={act.action}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${act.bg}`}>
                              {act.icon} {act.label}
                              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-indigo-100" />
                          </div>
                          <span className="text-sm font-semibold text-indigo-100">Unread Messages</span>
                        </div>
                        <p className="text-4xl font-bold">{stats.unreadMessages}</p>
                        <p className="text-xs text-indigo-300 mt-1.5 font-medium">Awaiting your response</p>
                        <button onClick={() => changeView("clients")} className="mt-3 text-xs text-white/70 hover:text-white flex items-center gap-1 transition-colors">
                          View all clients <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-500" /> Recent Admin Activity
                          </h3>
                          <button onClick={() => changeView("pricing")} className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
                            Open pricing
                          </button>
                        </div>
                        <div className="space-y-3">
                          {clientUpdates.slice(0, 4).map(update => (
                            <div key={update.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">{update.title}</p>
                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wide ${activityTone(update.type)}`}>
                                  {update.type || "update"}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500">{clientNameById.get(update.client_id) || "Unknown client"}</p>
                              <p className="mt-1 text-[10px] text-slate-400">{new Date(update.update_date).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                          ))}
                          {clientUpdates.length === 0 && (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-400">
                              No admin activity recorded yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent clients */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                      <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /><h3 className="text-sm font-bold text-slate-700">Recent Clients</h3></div>
                      <button onClick={() => changeView("clients")} className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors flex items-center gap-1">
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4">
                      {clients.slice(0, 5).map(c => (
                        <button key={c.id} onClick={() => openClientSheet(c)}
                          className="flex flex-col items-center p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all group">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold mb-2 shadow-sm ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>
                            {(c.company_name || c.username).charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs font-bold text-slate-700 truncate w-full text-center group-hover:text-indigo-600 transition-colors">{c.company_name || c.username}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{c.package_name || "—"}</p>
                        </button>
                      ))}
                      <button onClick={() => setAddClientOpen(true)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-2 transition-colors">
                          <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">Add Client</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════ ORDERS ════════════════════════ */}
              {activeView === "orders" && (
                <div className="space-y-5 fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center"><LayoutDashboard className="w-4 h-4 text-blue-600" /></div>
                    <div><h2 className="text-xl font-bold text-slate-900">Orders Board</h2><p className="text-xs text-slate-400 mt-0.5">{orders.length} total orders</p></div>
                  </div>
                  <OrdersKanban orders={orders} onUpdateStatus={updateOrderStatus} onDelete={confirmDeleteOrder} />
                </div>
              )}

              {/* ════════════ PRICING REQUESTS ═════════════ */}
              {activeView === "pricing" && (
                <div className="space-y-5 fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center"><FileText className="w-4 h-4 text-cyan-600" /></div>
                    <div><h2 className="text-xl font-bold text-slate-900">Pricing Requests</h2><p className="text-xs text-slate-400 mt-0.5">{pricingRequests.length} requests · {stats.newPricingRequests} new</p></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <PricingRequestsManager
                        requests={pricingRequests}
                        onUpdateStatus={handlePricingStatusChange}
                        onDelete={confirmDeletePricingRequest}
                        onConvert={handlePricingConvert}
                        onSaveAdminNotes={handlePricingAdminNotesSave}
                        onOpenClient={handleOpenPricingClient}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-sky-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                          <FileText className="w-7 h-7 text-cyan-500" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800 mb-2">Request Pipeline</h3>
                        <p className="text-slate-400 text-sm mb-5 leading-relaxed">Authenticated client pricing selections now land here for review, approval, and conversion into live orders.</p>
                        <div className="grid grid-cols-2 gap-2 w-full">
                          <div className="bg-cyan-50 rounded-2xl py-4 border border-cyan-100">
                            <p className="text-2xl font-bold text-cyan-600">{stats.newPricingRequests}</p>
                            <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold mt-0.5">New</p>
                          </div>
                          <div className="bg-emerald-50 rounded-2xl py-4 border border-emerald-100">
                            <p className="text-2xl font-bold text-emerald-600">{pricingRequests.filter(request => request.status === 'approved' || request.status === 'converted').length}</p>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mt-0.5">Approved+</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-cyan-500" /> Commercial Audit Trail
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Recent pricing and package-control actions recorded by admins.</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {clientUpdates.slice(0, 6).map(update => (
                            <div key={update.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-800 leading-relaxed">{update.title}</p>
                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wide ${activityTone(update.type)}`}>
                                  {update.type || "update"}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{clientNameById.get(update.client_id) || "Unknown client"}</p>
                              <p className="mt-1 text-[11px] text-slate-400">{new Date(update.update_date).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                          ))}
                          {clientUpdates.length === 0 && (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-400">
                              No commercial actions recorded yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════ INBOX ════════════════════════ */}
              {activeView === "inbox" && (
                <div className="space-y-5 fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-violet-600" /></div>
                    <div><h2 className="text-xl font-bold text-slate-900">Inbox & Leads</h2><p className="text-xs text-slate-400 mt-0.5">{contacts.length} contacts · {stats.newContacts} new</p></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <ContactsManager contacts={contacts} onUpdateStatus={updateContactStatus} onDelete={confirmDeleteContact} />
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <TrendingUp className="w-7 h-7 text-violet-500" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mb-2">Lead Intelligence</h3>
                      <p className="text-slate-400 text-sm mb-5 leading-relaxed">Auto-captured contact form submissions with browser &amp; location data.</p>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <div className="bg-indigo-50 rounded-2xl py-4 border border-indigo-100">
                          <p className="text-2xl font-bold text-indigo-600">{stats.newContacts}</p>
                          <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold mt-0.5">New</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl py-4 border border-slate-100">
                          <p className="text-2xl font-bold text-slate-700">{stats.totalContacts}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════ CLIENTS ═══════════════════════ */}
              {activeView === "clients" && (
                <div className="space-y-5 fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center"><Users className="w-4 h-4 text-emerald-600" /></div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Client Database</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{clients.length} clients · {clients.filter(c => c.status === "active").length} active</p>
                      </div>
                    </div>
                    <button onClick={() => setAddClientOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-colors shadow-sm shadow-indigo-200 self-start sm:self-auto">
                      <Plus className="w-4 h-4" /> {tx("addClient")}
                    </button>
                  </div>

                  {/* Filter + Search */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      {(["all", "active", "pending", "inactive"] as ClientFilter[]).map(f => (
                        <button key={f} onClick={() => setClientFilter(f)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${clientFilter === f ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>
                          {f}
                          {f !== "all" && (
                            <span className="ml-1.5 opacity-70">
                              {f === "active" ? clients.filter(c => c.status === "active").length :
                                f === "pending" ? clients.filter(c => c.status === "pending").length :
                                  clients.filter(c => c.status !== "active" && c.status !== "pending").length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                        placeholder={tx("searchByNameUsername")}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all shadow-sm" />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="hidden sm:grid sm:grid-cols-[1fr,280px,120px,200px] px-5 py-3 border-b border-slate-100 bg-slate-50/80 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <span>Client</span><span>Highlights</span><span>Status</span><span className="text-right">Actions</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {filteredClients.length === 0 ? (
                        <div className="text-center py-16">
                          <Users className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm font-medium">
                            {clientSearch || clientFilter !== "all" ? tx("noMatchingClients") : tx("noClientsYet")}
                          </p>
                          {!clientSearch && clientFilter === "all" && (
                            <button onClick={() => setAddClientOpen(true)}
                              className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold mx-auto hover:bg-indigo-700 transition-colors">
                              <Plus className="w-3.5 h-3.5" /> {tx("addFirstClient")}
                            </button>
                          )}
                        </div>
                      ) : filteredClients.map(c => {
                        const latestOrder = latestOrderByClient.get(c.id);
                        return (
                          <div key={c.id}
                            className="flex flex-col sm:grid sm:grid-cols-[1fr,280px,120px,200px] sm:items-center px-5 py-4 hover:bg-slate-50/70 transition-colors gap-3 sm:gap-0 group">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => openClientSheet(c)}>
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm transition-all group-hover:scale-105 ${c.status === "active" ? "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                {(c.company_name || c.username).charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{c.company_name || c.username}</p>
                                <p className="text-xs text-slate-400">@{c.username}</p>
                              </div>
                            </div>
                            <div onClick={e => e.stopPropagation()}>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wide">{c.package_name || "No package"}</span>
                                {latestOrder && <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColor(latestOrder.status)}`}>Order {latestOrder.status}</span>}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2 min-h-[32px]">{c.next_steps || "No next step defined yet"}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="h-1.5 bg-slate-100 rounded-full w-24 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all" style={{ width: `${c.progress ?? 0}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">{c.progress ?? 0}%</span>
                              </div>
                            </div>
                            <div onClick={e => e.stopPropagation()}>
                              <Badge label={(c.status || "N/A").toUpperCase()} />
                            </div>
                            <div className="flex items-center gap-2 sm:justify-end" onClick={e => e.stopPropagation()}>
                              <button onClick={() => openClientSheet(c)}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200">
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <button onClick={() => setManagingClient(c)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={() => confirmDeleteClient(c.id)}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {filteredClients.length > 0 && (
                      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
                        <span className="font-semibold">{filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""} shown</span>
                        <span>·</span>
                        <span className="text-emerald-500 font-semibold">{filteredClients.filter(c => c.status === "active").length} active</span>
                        <span className="text-amber-500 font-semibold">{filteredClients.filter(c => c.status === "pending").length} pending</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ════════════ DESIGNS ═══════════════════════ */}
              {activeView === "designs" && (
                <div className="space-y-5 fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center"><Smartphone className="w-4 h-4 text-rose-500" /></div>
                      <div><h2 className="text-xl font-bold text-slate-900">Saved Designs</h2><p className="text-xs text-slate-400 mt-0.5">{designs.length} total designs</p></div>
                    </div>
                    <a href="/demo" target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-bold transition-colors shadow-sm self-start sm:self-auto">
                      <Monitor className="w-4 h-4" /> Open Live Preview
                    </a>
                  </div>

                  <div className="relative max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input value={designSearch} onChange={e => setDesignSearch(e.target.value)}
                      placeholder="Search by business or service"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all shadow-sm" />
                  </div>

                  {filteredDesigns.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-24 text-center">
                      <Smartphone className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm font-medium">{designSearch ? "No matching designs" : "No saved designs yet"}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredDesigns.map(d => {
                        const linkedClient = d.client_id ? clients.find(c => c.id === d.client_id) : null;
                        return (
                          <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 border-b border-slate-50">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center text-lg flex-shrink-0">{serviceIcon(d.service_type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">{d.business_name}</p>
                                  <p className="text-xs text-slate-400 capitalize mt-0.5">{d.service_type} · {d.selected_template}</p>
                                </div>
                                <Badge label={d.status}
                                  color={d.status === "featured" ? "bg-amber-100 text-amber-700 border-amber-200" : d.status === "archived" ? "bg-slate-100 text-slate-500 border-slate-200" : undefined} />
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] text-slate-600 font-medium">{d.selected_theme}</span>
                                {d.is_dark_mode && <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 font-medium">🌙 Dark</span>}
                                {d.glass_effect && <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[10px] text-blue-600 font-medium">✨ Glass</span>}
                              </div>
                            </div>
                            {linkedClient && (
                              <div className="px-4 py-2 bg-indigo-50/70 border-b border-indigo-100/50 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                  {(linkedClient.company_name || linkedClient.username).charAt(0)}
                                </div>
                                <p className="text-xs font-bold text-indigo-700 truncate flex-1">{linkedClient.company_name || linkedClient.username}</p>
                                <button onClick={() => openClientSheet(linkedClient)} className="text-[9px] font-bold text-indigo-400 hover:text-indigo-700 transition-colors uppercase tracking-wide">View →</button>
                              </div>
                            )}
                            <div className="px-4 py-2 flex items-center text-[10px] text-slate-400 border-b border-slate-50 gap-3">
                              <Eye className="w-3 h-3" />{d.view_count || 0} views
                              <span className="ml-auto">{new Date(d.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                            </div>
                            <div className="p-3 flex gap-2">
                              <a href={`/demo?name=${encodeURIComponent(d.business_name)}&service=${d.service_type}&theme=${d.selected_theme}&template=${d.selected_template}&dark=${d.is_dark_mode}`}
                                target="_blank" rel="noreferrer"
                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                <Eye className="w-3.5 h-3.5" /> View in Studio
                              </a>
                              <button onClick={() => updateDesignStatus(d.id, d.status === "archived" ? "active" : "archived")}
                                className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all" title="Archive">
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/demo?name=${encodeURIComponent(d.business_name)}&service=${d.service_type}`).then(() => toast.success("Link copied!"))}
                                className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all" title="Copy link">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => confirmDeleteDesign(d.id)}
                                className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ════════════ GUIDE ════════════════════════ */}
              {activeView === "guide" && (
                <div className="space-y-4 fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><BookOpen className="w-4 h-4 text-amber-600" /></div>
                    <div><h2 className="text-xl font-bold text-slate-900">Admin Guide</h2><p className="text-xs text-slate-400 mt-0.5">Quick reference for all dashboard features</p></div>
                  </div>
                  {[
                    { title: "Overview", accent: "indigo", icon: <Activity className="w-4 h-4" />, items: ["Real-time stats: revenue, orders, clients, pending", "Recent orders & clients quick view", "Quick action shortcuts in sidebar", "Unread messages badge counter"] },
                    { title: "Orders Board", accent: "blue", icon: <LayoutDashboard className="w-4 h-4" />, items: ["Kanban view: Pending → Processing → Completed", "One-click status change per card", "Safe delete with confirmation dialog", "Price, package, date visible on each card"] },
                    { title: "Pricing Requests", accent: "indigo", icon: <FileText className="w-4 h-4" />, items: ["Authenticated client pricing submissions land here", "Status flow: New → Reviewing → Approved / Rejected", "Convert approved requests into real orders", "Conversion syncs package details back to client profile"] },
                    { title: "Inbox & Leads", accent: "violet", icon: <MessageSquare className="w-4 h-4" />, items: ["Auto-captures contact form submissions", "Status: New → Contacted → Converted", "Full message + auto-collected browser/location data", "Lead count stat widgets"] },
                    { title: "Client Database", accent: "emerald", icon: <Users className="w-4 h-4" />, items: ["Filter by All / Active / Pending / Inactive tabs", "Click 'View' row to open Client 360 Sheet", "Click 'Edit' to open Client Master Modal", "Quick delete button with confirmation"] },
                    { title: "Client 360 Sheet", accent: "indigo", icon: <Eye className="w-4 h-4" />, items: ["Overview: stats + progress slider + next steps", "Chat: full real-time messaging with client", "Designs: all saved designs with studio links", "Live Preview: embedded iframe + magic link generator", "Brand Kit: colors, avatar, bio, website", "Notes: admin-only notes + metadata"] },
                    { title: "Live Preview Tool", accent: "violet", icon: <Monitor className="w-4 h-4" />, items: ["Access from sidebar or any client's 360 sheet", "Iframe shows the client's latest saved design", "Switch between designs with the selector bar", "Copy client portal login link from the preview tab"] },
                    { title: "Saved Designs", accent: "rose", icon: <Smartphone className="w-4 h-4" />, items: ["'View in Studio' deep-links to live preview tool", "Client-linked designs show brand strip with quick link", "Archive or delete each design with one click", "Global search by business name or service type"] },
                  ].map((sec, i) => {
                    const bg: Record<string, string> = { indigo: "bg-indigo-50", blue: "bg-blue-50", violet: "bg-violet-50", emerald: "bg-emerald-50", rose: "bg-rose-50", amber: "bg-amber-50" };
                    const tc: Record<string, string> = { indigo: "text-indigo-600", blue: "text-blue-600", violet: "text-violet-600", emerald: "text-emerald-600", rose: "text-rose-600", amber: "text-amber-600" };
                    return (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-xl ${bg[sec.accent]} flex items-center justify-center`}><span className={tc[sec.accent]}>{sec.icon}</span></div>
                          <h3 className={`font-bold text-sm ${tc[sec.accent]}`}>{sec.title}</h3>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {sec.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2.5 text-sm text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── OVERLAYS ─────────────────────────────────────────── */}

      {/* Client 360 Sheet */}
      <ClientSheet
        client={sheetClient}
        designs={designs}
        open={sheetOpen}
        onOpenChange={v => { if (!v) closeSheet(); }}
        onRefresh={refresh}
        onDelete={confirmDeleteClient}
      />

      {/* Client Master Modal */}
      {managingClient && (
        <ClientMasterModal
          client={managingClient}
          open={!!managingClient}
          onOpenChange={open => !open && setManagingClient(null)}
          onUpdate={refresh}
        />
      )}

      {/* Add Client Modal */}
      <AddClientModal
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        onAdd={addClient}
      />

      {/* Confirm dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={open => !open && setConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <AlertDialogContent className="bg-white border-slate-200 max-w-md rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <AlertDialogTitle className="text-slate-900 text-lg">{confirmDialog.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-400 text-sm ml-[52px] leading-relaxed">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        .fade-in { animation: fadeUp 0.22s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Dashboard;
