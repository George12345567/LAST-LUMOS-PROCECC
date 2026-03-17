/**
 * ClientProfile.tsx    UNIFIED CLIENT PORTAL v3
 *
 * UX improvements:
 *  - Hero strip at top with avatar, name, package badge
 *  - Icon tab-bar (accessible, no sidebar clutter on mobile)
 *  - Overview: progress + timeline in one glance
 *  - Brand Kit: fully functional  colors, logo, tagline, website
 *  - Messages: WhatsApp-style bubble chat
 *  - Settings tab (profile details + avatar picker)
 *  - All logic intact: supabase realtime, save, delete, sign-out
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import { toast } from 'sonner';
import {
    LayoutDashboard, MessageCircle, Palette, Folder,
    Sparkles, LogOut, Save, Camera, CheckCircle,
    FileText, Zap, Send, Download, ExternalLink,
    Trash2, User, Settings, Globe, Type, Image,
    Plus, X, Activity, RotateCcw,
    Search, Filter, Grid3X3, Rows3, ArrowUpDown, Star, Eye, Copy, ChevronRight, Bot, WandSparkles, Package
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { fetchDesignsByClient, deleteDesign as deleteDesignService } from '@/services/designService';
import { profileService, type ProfileData } from '@/services/profileService';
import { fetchClientPortalSnapshot, sendClientPortalMessage } from '@/services/clientPortalService';
import type { Order, PricingRequest, SavedDesign } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    AVATAR_IMAGES,
    BRAND_COLOR_PRESETS,
    COVER_GRADIENT_MAP,
    PRESET_TIMEZONES,
    TABS,
    type Tab,
    type TabId,
} from '@/pages/client-profile/constants';

type SyncState = 'idle' | 'saving' | 'saved' | 'queued' | 'error';
type BrandPanel = 'identity' | 'assets' | 'colors';
type PortalThemeMode = 'default' | 'brand' | 'high-contrast';
type PortalLang = 'ar' | 'en';
type DesignViewMode = 'grid' | 'list';
type DesignSortMode = 'updated_desc' | 'updated_asc' | 'name_asc';
type DesignStatusFilter = 'all' | 'active' | 'archived' | 'featured';
type LibraryPanel = 'designs' | 'files';
type AssistantMode = 'assistant' | 'team';

function resolveCoverGradient(value?: string | null): string {
    if (!value) return 'linear-gradient(135deg, #dbeafe 0%, #e9d5ff 52%, #fce7f3 100%)';
    if (value.includes('gradient(')) return value;
    return COVER_GRADIENT_MAP[value] || value;
}

function hexToRgb(hex: string): [number, number, number] | null {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!match) return null;
    return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
    const channel = [r, g, b].map(v => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channel[0] + 0.7152 * channel[1] + 0.0722 * channel[2];
}

function contrastRatio(hex: string, against: string): number | null {
    const c1 = hexToRgb(hex);
    const c2 = hexToRgb(against);
    if (!c1 || !c2) return null;
    const l1 = relativeLuminance(...c1);
    const l2 = relativeLuminance(...c2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

function wcagBadge(ratio: number | null): { label: string; tone: string } {
    if (ratio === null) return { label: 'Invalid', tone: 'text-red-600 bg-red-50 border-red-200' };
    if (ratio >= 7) return { label: `AAA ${ratio.toFixed(1)}:1`, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (ratio >= 4.5) return { label: `AA ${ratio.toFixed(1)}:1`, tone: 'text-green-700 bg-green-50 border-green-200' };
    if (ratio >= 3) return { label: `AA Large ${ratio.toFixed(1)}:1`, tone: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: `Fail ${ratio.toFixed(1)}:1`, tone: 'text-red-700 bg-red-50 border-red-200' };
}

//  Types 

interface ClientRow {
    id: string;
    username: string;
    company_name: string;
    package_name?: string;
    status?: string;
    progress?: number;
    next_steps?: string;
    package_details?: Record<string, unknown>;
    active_offer?: string;
    active_offer_link?: string;
}

interface ClientUpdate {
    id: string;
    client_id: string;
    title: string;
    type: 'milestone' | 'update' | 'action';
    update_date: string;
}

interface Message {
    id: string;
    client_id: string;
    sender: 'client' | 'admin';
    message: string;
    created_at: string;
}

interface ClientAsset {
    id: string;
    client_id: string;
    file_name: string;
    file_url: string;
    file_type?: string;
    uploaded_at: string;
}

interface ClientOrderSummary extends Pick<Order, 'id' | 'status' | 'total_price' | 'created_at'> {
    package_type?: string;
}

interface AssistantBubble {
    id: string;
    sender: 'assistant' | 'client';
    text: string;
    tone?: 'default' | 'highlight';
}

//  Small helpers 

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(36,119,54,0.68)]">{label}</label>
            {children}
        </div>
    );
}

function SectionCard({ title, icon: Icon, children, action }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-[24px] border border-[rgba(127,142,106,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(241,247,243,0.94)_100%)] shadow-[0_18px_50px_rgba(36,119,54,0.08)] backdrop-blur-xl portal-motion-base transition-all hover:border-[rgba(7,127,91,0.28)] hover:shadow-[0_24px_70px_rgba(7,127,91,0.1)] sm:rounded-[30px] sm:shadow-[0_24px_80px_rgba(36,119,54,0.1)]">
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(127,142,106,0.14)] bg-[linear-gradient(180deg,rgba(248,251,248,0.95)_0%,rgba(255,255,255,0.8)_100%)] px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[rgba(7,127,91,0.12)] bg-[linear-gradient(135deg,rgba(7,127,91,0.14)_0%,rgba(255,255,255,0.95)_100%)] text-[#077F5B] shadow-sm">
                        <Icon className="w-4 h-4" />
                    </span>
                    <h3 className="font-semibold text-foreground text-sm tracking-[-0.01em]">{title}</h3>
                </div>
                {action}
            </div>
            <div className="bg-[radial-gradient(circle_at_top_right,rgba(7,127,91,0.05),transparent_28%)] p-4 sm:p-6">{children}</div>
        </div>
    );
}

//  Main Component 

export default function ClientProfile() {
    const { client, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { language, setLanguage } = useLanguage();

    const [tab, setTab] = useState<TabId>('home');
    const [brandPanel, setBrandPanel] = useState<BrandPanel>('identity');
    const [libraryPanel, setLibraryPanel] = useState<LibraryPanel>('designs');
    const [showShortcutHelp, setShowShortcutHelp] = useState(false);
    const [showIdentityEditor, setShowIdentityEditor] = useState(false);
    const [showQuickMessage, setShowQuickMessage] = useState(false);
    const [showPhotoManager, setShowPhotoManager] = useState(false);
    const [showBrandDrawer, setShowBrandDrawer] = useState(false);
    const [showMobileRequestSheet, setShowMobileRequestSheet] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [portalThemeMode, setPortalThemeMode] = useState<PortalThemeMode>(() => {
        const stored = localStorage.getItem('lumos_portal_theme_mode');
        if (stored === 'brand' || stored === 'high-contrast' || stored === 'default') return stored;
        return 'default';
    });
    const [portalLang, setPortalLang] = useState<PortalLang>(language);
    const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(() => localStorage.getItem('lumos_profile_onboarding_dismissed') === 'true');

    const [clientData, setClientData] = useState<ClientRow | null>(null);
    const [updates, setUpdates] = useState<ClientUpdate[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [assets, setAssets] = useState<ClientAsset[]>([]);
    const [clientOrders, setClientOrders] = useState<ClientOrderSummary[]>([]);
    const [designs, setDesigns] = useState<SavedDesign[]>([]);
    const [pricingRequests, setPricingRequests] = useState<PricingRequest[]>([]);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [syncState, setSyncState] = useState<SyncState>('idle');
    const [syncMessage, setSyncMessage] = useState('All changes synced.');
    const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [newColor, setNewColor] = useState('#6366f1');
    const [logoPreviewError, setLogoPreviewError] = useState(false);
    const [designQuery, setDesignQuery] = useState('');
    const [designViewMode, setDesignViewMode] = useState<DesignViewMode>('grid');
    const [designSortMode, setDesignSortMode] = useState<DesignSortMode>('updated_desc');
    const [designStatusFilter, setDesignStatusFilter] = useState<DesignStatusFilter>('all');
    const [favoriteDesignIds, setFavoriteDesignIds] = useState<string[]>([]);
    const [assistantMode, setAssistantMode] = useState<AssistantMode>('assistant');
    const [assistantInput, setAssistantInput] = useState('');
    const [assistantTyping, setAssistantTyping] = useState(false);
    const [assistantMessages, setAssistantMessages] = useState<AssistantBubble[]>([]);
    const [lastSeenAt, setLastSeenAt] = useState<Date | null>(() => {
        try {
            const raw = localStorage.getItem('lumos_client_portal_last_seen');
            return raw ? new Date(raw) : null;
        } catch {
            return null;
        }
    });

    const isArabic = portalLang === 'ar';
    const t = useCallback((ar: string, en: string) => (isArabic ? ar : en), [isArabic]);

    useEffect(() => {
        setPortalLang(language);
    }, [language]);

    const assistantQuickPrompts = useMemo(() => ([
        t('كيف أحسن البروفايل بسرعة؟', 'How do I improve the profile quickly?'),
        t('أين أراجع آخر تصميم؟', 'Where do I review the latest design?'),
        t('اكتب لي رسالة للفريق', 'Draft a message to the team'),
        t('ما الخطوة التالية الآن؟', 'What is the next step right now?'),
        t('أين أرفع الشعار؟', 'Where do I upload the logo?'),
        t('كيف أرتب البراند؟', 'How should I organize the brand?'),
    ]), [t]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const assistantEndRef = useRef<HTMLDivElement>(null);
    const saveTimerRef = useRef<number | null>(null);
    const saveInFlightRef = useRef(false);
    const lastPersistedProfileRef = useRef('');

    const getQueueKey = useCallback((uid: string) => `lumos_profile_queue_${uid}`, []);

    const queueProfileLocally = useCallback((uid: string, profile: ProfileData) => {
        try {
            localStorage.setItem(getQueueKey(uid), JSON.stringify({ data: profile, queuedAt: new Date().toISOString() }));
            setSyncState('queued');
            setSyncMessage('Offline mode: changes are queued and will sync automatically.');
        } catch {
            setSyncState('error');
            setSyncMessage('Could not queue local changes.');
        }
    }, [getQueueKey]);

    const persistProfile = useCallback(async (mode: 'auto' | 'manual' | 'flush' = 'auto') => {
        if (!client || !profileData) return false;
        if (saveInFlightRef.current) return false;

        const serialized = JSON.stringify(profileData);
        if (mode !== 'manual' && serialized === lastPersistedProfileRef.current) return true;

        if (!isOnline) {
            queueProfileLocally(client.id, profileData);
            setHasUnsavedChanges(true);
            if (mode === 'manual') toast.error('You are offline. Changes queued locally.');
            return false;
        }

        saveInFlightRef.current = true;
        setSaving(true);
        setSyncState('saving');
        setSyncMessage(mode === 'auto' ? 'Syncing changes...' : 'Saving changes...');

        try {
            const ok = await profileService.updateProfile(client.id, profileData);
            if (!ok) throw new Error('Profile save failed');

            lastPersistedProfileRef.current = serialized;
            setLastSavedAt(new Date());
            setHasUnsavedChanges(false);
            setSyncState('saved');
            setSyncMessage('All changes synced.');
            localStorage.removeItem(getQueueKey(client.id));
            if (mode !== 'auto') toast.success('Profile saved!');
            return true;
        } catch (err) {
            console.error('Profile sync error:', err);
            queueProfileLocally(client.id, profileData);
            setHasUnsavedChanges(true);
            setSyncState('error');
            setSyncMessage('Sync failed. Latest changes are queued locally.');
            if (mode !== 'auto') toast.error('Save failed. Changes queued locally.');
            return false;
        } finally {
            setSaving(false);
            saveInFlightRef.current = false;
        }
    }, [client, profileData, isOnline, queueProfileLocally, getQueueKey]);

    const flushQueuedProfile = useCallback(async () => {
        if (!client || !isOnline) return;
        const raw = localStorage.getItem(getQueueKey(client.id));
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw) as { data?: ProfileData };
            if (!parsed?.data) return;

            setSyncState('saving');
            setSyncMessage('Syncing queued changes...');
            const ok = await profileService.updateProfile(client.id, parsed.data);
            if (!ok) throw new Error('Queued sync failed');

            setProfileData(parsed.data);
            lastPersistedProfileRef.current = JSON.stringify(parsed.data);
            setLastSavedAt(new Date());
            setHasUnsavedChanges(false);
            localStorage.removeItem(getQueueKey(client.id));
            setSyncState('saved');
            setSyncMessage('Queued changes synced.');
            toast.success('Queued changes synced.');
        } catch (err) {
            console.error('Queued sync error:', err);
            setSyncState('queued');
            setSyncMessage('Queued changes pending sync.');
        }
    }, [client, isOnline, getQueueKey]);

    //  Fetch 
    const fetchEverything = useCallback(async (uid: string) => {
        setLoading(true);
        setFetchError(null);
        try {
            const [pData, snapshot, dData] = await Promise.all([
                profileService.getProfile(uid),
                fetchClientPortalSnapshot(uid),
                fetchDesignsByClient(uid),
            ]);
            if (pData) {
                setProfileData(pData);
                lastPersistedProfileRef.current = JSON.stringify(pData);
                setHasUnsavedChanges(false);
                setSyncState('saved');
                setSyncMessage('All changes synced.');
            }
            if (snapshot.client) setClientData(snapshot.client as ClientRow);
            setUpdates(snapshot.updates as ClientUpdate[]);
            setMessages(snapshot.messages as Message[]);
            setAssets(snapshot.assets as ClientAsset[]);
            setPricingRequests(snapshot.pricingRequests as PricingRequest[]);
            setClientOrders(snapshot.orders as ClientOrderSummary[]);
            setDesigns(dData);
        } catch (err) {
            console.error('Portal fetch error:', err);
            setFetchError('Could not sync your profile data. Please retry.');
            toast.error('Failed to load portal data.');
        } finally {
            setLoading(false);
        }
    }, []);

    //  Auth guard 
    useEffect(() => {
        if (authLoading) return;
        if (!client) { navigate('/client-login', { replace: true }); return; }
        fetchEverything(client.id);
    }, [authLoading, client, navigate, fetchEverything]);

    //  Realtime 
    useEffect(() => {
        if (!client) return;
        const uid = client.id;
        const msgSub = supabase.channel(`msg:${uid}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'client_messages', filter: `client_id=eq.${uid}` },
                payload => {
                    setMessages(prev => [...prev, payload.new as Message]);
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
                }).subscribe();
        const updSub = supabase.channel(`upd:${uid}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_updates', filter: `client_id=eq.${uid}` },
                () => fetchEverything(uid)).subscribe();
        const astSub = supabase.channel(`ast:${uid}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_assets', filter: `client_id=eq.${uid}` },
                () => fetchEverything(uid)).subscribe();
        const pricingSub = supabase.channel(`pricing:${uid}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pricing_requests', filter: `client_id=eq.${uid}` },
                () => fetchEverything(uid)).subscribe();
        return () => {
            supabase.removeChannel(msgSub);
            supabase.removeChannel(updSub);
            supabase.removeChannel(astSub);
            supabase.removeChannel(pricingSub);
        };
    }, [client, fetchEverything]);

    useEffect(() => {
        setLogoPreviewError(false);
    }, [profileData?.logo_url]);

    useEffect(() => {
        localStorage.setItem('lumos_portal_theme_mode', portalThemeMode);
    }, [portalThemeMode]);

    useEffect(() => {
        setLanguage(portalLang);
        localStorage.setItem('lumos_portal_lang', portalLang);
    }, [portalLang, setLanguage]);

    useEffect(() => {
        if (!client) return;
        try {
            const raw = localStorage.getItem(`lumos_design_favorites_${client.id}`);
            setFavoriteDesignIds(raw ? JSON.parse(raw) as string[] : []);
        } catch {
            setFavoriteDesignIds([]);
        }
    }, [client]);

    useEffect(() => {
        if (!client) return;
        localStorage.setItem(`lumos_design_favorites_${client.id}`, JSON.stringify(favoriteDesignIds));
    }, [client, favoriteDesignIds]);

    useEffect(() => {
        localStorage.setItem('lumos_profile_onboarding_dismissed', onboardingDismissed ? 'true' : 'false');
    }, [onboardingDismissed]);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mq.matches);
        const handler = () => setPrefersReducedMotion(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    useEffect(() => {
        const now = new Date().toISOString();
        localStorage.setItem('lumos_client_portal_last_seen', now);
        setLastSeenAt(prev => prev ?? new Date(now));
    }, []);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('lumos:client-profile-dock-state', { detail: { tab } }));
    }, [tab]);

    useEffect(() => {
        const handleDockAction = (event: Event) => {
            const customEvent = event as CustomEvent<{ action?: string }>;
            const action = customEvent.detail?.action;

            if (action === 'home') {
                setTab('home');
                return;
            }

            if (action === 'library') {
                setTab('library');
                setLibraryPanel(designs.length > 0 ? 'designs' : 'files');
                return;
            }

            if (action === 'brand') {
                setTab('brand');
                return;
            }

            if (action === 'account') {
                setTab('account');
                return;
            }

            if (action === 'assistant') {
                setAssistantMode('assistant');
                setShowQuickMessage(true);
                return;
            }

            if (action === 'save') {
                void persistProfile('manual');
            }
        };

        window.addEventListener('lumos:client-profile-dock-action', handleDockAction as EventListener);
        return () => window.removeEventListener('lumos:client-profile-dock-action', handleDockAction as EventListener);
    }, [designs.length, persistProfile]);

    useEffect(() => {
        if (!isOnline) {
            setSyncState('queued');
            setSyncMessage('You are offline. Changes will be queued.');
            return;
        }
        void flushQueuedProfile();
    }, [isOnline, flushQueuedProfile]);

    useEffect(() => {
        if (!client || !profileData || loading) return;
        const serialized = JSON.stringify(profileData);
        if (serialized === lastPersistedProfileRef.current) return;

        setHasUnsavedChanges(true);

        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

        if (!isOnline) {
            queueProfileLocally(client.id, profileData);
            return;
        }

        saveTimerRef.current = window.setTimeout(() => {
            void persistProfile('auto');
        }, 1200);

        return () => {
            if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        };
    }, [client, profileData, loading, isOnline, persistProfile, queueProfileLocally]);

    //  Handlers 
    const saveProfile = async () => {
        await persistProfile('manual');
    };

    const submitMessage = async () => {
        if (!newMessage.trim() || !client || isSendingMessage) return;
        const txt = newMessage.trim();
        setNewMessage('');
        setIsSendingMessage(true);
        try {
            try {
                await sendClientPortalMessage(client.id, txt);
            } catch {
                toast.error('Could not send.');
                setNewMessage(txt);
                return false;
            }
            return true;
        } finally {
            setIsSendingMessage(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitMessage();
    };

    const deleteDesign = async (id: string) => {
        if (!confirm('Delete this design?')) return;
        await deleteDesignService(id);
        setDesigns(prev => prev.filter(d => d.id !== id));
        toast.success('Deleted');
    };

    const signOut = () => { logout(); navigate('/client-login', { replace: true }); };

    const addBrandColor = (hex: string) => {
        setProfileData(prev => {
            if (!prev) return prev;
            const current = prev.brand_colors || [];
            if (current.includes(hex)) return prev;
            return { ...prev, brand_colors: [...current, hex] };
        });
    };

    const removeBrandColor = (hex: string) => {
        setProfileData(prev => {
            if (!prev) return prev;
            return { ...prev, brand_colors: (prev.brand_colors || []).filter(c => c !== hex) };
        });
    };

    const uploadBrandLogo = async (file: File | null) => {
        if (!client || !file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file for logo.');
            return;
        }
        try {
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `brand-logos/${client.id}-${Date.now()}-${safeName}`;
            const { error: upErr } = await supabase.storage
                .from('client-assets')
                .upload(path, file, { upsert: true });

            if (upErr) {
                console.error('Brand logo upload error:', upErr);
                toast.error('Failed to upload logo.');
                return;
            }

            const { data: urlData } = supabase.storage.from('client-assets').getPublicUrl(path);
            setProfileData(prev => prev ? { ...prev, logo_url: urlData.publicUrl } : prev);
            toast.success('Logo uploaded. Saving automatically...');
        } catch (e) {
            console.error(e);
            toast.error('Failed to upload logo.');
        }
    };

    const uploadProfileAvatar = async (file: File | null) => {
        if (!client || !file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file for your profile photo.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Profile photo must be smaller than 5 MB.');
            return;
        }

        setAvatarUploading(true);
        try {
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `profile-avatars/${client.id}-${Date.now()}-${safeName}`;
            const { error: upErr } = await supabase.storage
                .from('client-assets')
                .upload(path, file, { upsert: true });

            if (upErr) {
                console.error('Profile avatar upload error:', upErr);
                toast.error('Failed to upload profile photo.');
                return;
            }

            const { data: urlData } = supabase.storage.from('client-assets').getPublicUrl(path);
            setProfileData(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : prev);
            toast.success('Profile photo uploaded. Saving automatically...');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload profile photo.');
        } finally {
            setAvatarUploading(false);
        }
    };

    const displayName = profileData?.display_name || client.username;
    const themeAccent = profileData?.theme_accent || '#6366f1';
    const company = clientData?.company_name || '';
    const avatarUrl = profileData?.avatar_url || '';
    const progress = clientData?.progress ?? 0;
    const brandColors = profileData?.brand_colors || [];

    const getDesignTitle = (design: SavedDesign) => {
        const dynamicName = (design as SavedDesign & { name?: string }).name;
        return dynamicName || design.business_name || design.service_type || 'Untitled Design';
    };

    const getDesignPreviewUrl = (design: SavedDesign) => {
        const dynamicPreview = (design as SavedDesign & { preview_url?: string }).preview_url;
        return dynamicPreview || `${window.location.origin}/demo?id=${design.id}`;
    };

    const toggleFavoriteDesign = (designId: string) => {
        setFavoriteDesignIds(prev => prev.includes(designId) ? prev.filter(id => id !== designId) : [designId, ...prev]);
    };

    const copyDesignPreviewLink = async (design: SavedDesign) => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/demo?id=${design.id}`);
            toast.success('Preview link copied');
        } catch {
            toast.error('Could not copy preview link');
        }
    };

    const normalizedDesignQuery = designQuery.trim().toLowerCase();
    const visibleDesigns = [...designs]
        .filter(design => {
            if (designStatusFilter === 'all') return true;
            return design.status === designStatusFilter;
        })
        .filter(design => {
            if (!normalizedDesignQuery) return true;
            const title = getDesignTitle(design).toLowerCase();
            const service = (design.service_type || '').toLowerCase();
            const business = (design.business_name || '').toLowerCase();
            return title.includes(normalizedDesignQuery) || service.includes(normalizedDesignQuery) || business.includes(normalizedDesignQuery);
        })
        .sort((a, b) => {
            if (designSortMode === 'name_asc') {
                return getDesignTitle(a).localeCompare(getDesignTitle(b));
            }
            if (designSortMode === 'updated_asc') {
                return new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime();
            }
            return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        });

    const featuredDesigns = designs.filter(d => d.status === 'featured').length;
    const latestPricingRequests = pricingRequests.slice(0, 3);
    const latestOrder = clientOrders[0] || null;

    const orderStatusMeta = (status?: ClientOrderSummary['status']) => {
        if (status === 'completed') return { label: t('مكتمل', 'Completed'), tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        if (status === 'processing') return { label: t('قيد التنفيذ', 'Processing'), tone: 'bg-blue-100 text-blue-700 border-blue-200' };
        if (status === 'cancelled') return { label: t('ملغي', 'Cancelled'), tone: 'bg-rose-100 text-rose-700 border-rose-200' };
        if (status === 'pending') return { label: t('معلّق', 'Pending'), tone: 'bg-amber-100 text-amber-700 border-amber-200' };
        return { label: t('لا يوجد', 'None'), tone: 'bg-slate-100 text-slate-600 border-slate-200' };
    };

    const latestOrderMeta = orderStatusMeta(latestOrder?.status);

    const pricingRequestMeta = (status: PricingRequest['status']) => {
        if (status === 'reviewing') return { label: t('قيد المراجعة', 'Reviewing'), pill: 'bg-amber-100 text-amber-700 border-amber-200', note: t('الفريق يراجع هذا الطلب الآن.', 'The team is currently reviewing this request.') };
        if (status === 'approved') return { label: t('تمت الموافقة', 'Approved'), pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', note: t('تم اعتماد الطلب ويمكن تحويله لطلب تنفيذ.', 'The request has been approved and can now be converted into a live order.') };
        if (status === 'converted') return { label: t('تم التحويل', 'Converted'), pill: 'bg-violet-100 text-violet-700 border-violet-200', note: t('تم ربط هذا الطلب بأمر تنفيذ وبالباقة الحالية.', 'This request has been linked to a live order and synced to your current package.') };
        if (status === 'rejected') return { label: t('مرفوض', 'Rejected'), pill: 'bg-rose-100 text-rose-700 border-rose-200', note: t('تم رفض هذا الطلب أو يحتاج إعادة صياغة.', 'This request was rejected or needs a revised scope.') };
        return { label: t('جديد', 'New'), pill: 'bg-cyan-100 text-cyan-700 border-cyan-200', note: t('تم استلام الطلب وينتظر بدء المراجعة.', 'The request has been received and is waiting for review.') };
    };
    const featuredPricingRequest = latestPricingRequests[0] || null;
    const featuredPricingRequestMeta = featuredPricingRequest ? pricingRequestMeta(featuredPricingRequest.status) : null;
    const featuredPricingRequestSummary = featuredPricingRequest
        ? (featuredPricingRequest.request_type === 'package'
            ? (featuredPricingRequest.package_name || t('باقة جاهزة', 'Ready Package'))
            : t(`${featuredPricingRequest.selected_services.length} خدمة مختارة`, `${featuredPricingRequest.selected_services.length} selected services`))
        : null;
    const reopenPricingRequest = useCallback((request: PricingRequest) => {
        window.dispatchEvent(new CustomEvent('lumos:open-pricing', { detail: { request } }));
    }, []);
    const archivedDesigns = designs.filter(d => d.status === 'archived').length;
    const favoritesInLibrary = favoriteDesignIds.filter(id => designs.some(d => d.id === id)).length;

    const hasOfferLink = Boolean(clientData?.active_offer_link && clientData.active_offer_link !== '#');

    const normalizedStatus = (clientData?.status || 'active').toLowerCase();
    const statusLabel = normalizedStatus === 'pending'
        ? 'Pending'
        : normalizedStatus === 'paused'
            ? 'Paused'
            : normalizedStatus === 'inactive'
                ? 'Inactive'
                : 'Active';
    const statusPillClass = statusLabel === 'Active'
        ? 'bg-emerald-100 text-emerald-700'
        : statusLabel === 'Pending'
            ? 'bg-amber-100 text-amber-700'
            : statusLabel === 'Paused'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-slate-100 text-slate-700';

    const completionChecklist = [
        { key: 'display_name', label: 'Set your display name', done: Boolean(profileData?.display_name?.trim()), action: () => setShowIdentityEditor(true) },
        { key: 'avatar', label: 'Upload a clear profile photo', done: Boolean(profileData?.avatar_url), action: () => setShowPhotoManager(true) },
        { key: 'logo', label: 'Upload your brand logo', done: Boolean(profileData?.logo_url), action: () => { setTab('brand'); setBrandPanel('assets'); setShowBrandDrawer(true); } },
        { key: 'colors', label: 'Choose a primary brand color', done: (profileData?.brand_colors?.length || 0) > 0, action: () => { setTab('brand'); setBrandPanel('colors'); } },
        { key: 'website', label: 'Add your website', done: Boolean(profileData?.website?.trim()), action: () => { setTab('brand'); setBrandPanel('identity'); } },
    ];
    const completedChecklist = completionChecklist.filter(item => item.done).length;
    const remainingChecklistCount = completionChecklist.length - completedChecklist;

    const actionRail = [
        { id: 'identity', label: 'Edit Profile', desc: 'Name, intro, and timezone', action: () => setShowIdentityEditor(true) },
        { id: 'photo', label: 'Change Photo', desc: 'Upload or switch avatar', action: () => setShowPhotoManager(true) },
        { id: 'message', label: 'Ask Assistant', desc: 'Open the floating helper and team modal', action: () => { setAssistantMode('assistant'); setShowQuickMessage(true); } },
        { id: 'logo', label: 'Upload Logo', desc: 'Jump into brand assets', action: () => { setTab('brand'); setBrandPanel('assets'); setShowBrandDrawer(true); } },
        { id: 'library', label: designs.length > 0 ? 'Review Library' : 'Open Library', desc: 'Recent files and designs', action: () => { setTab('library'); setLibraryPanel(designs.length > 0 ? 'designs' : 'files'); } },
    ];

    const localizedTabs: Tab[] = useMemo(() => TABS.map(tabItem => ({
        ...tabItem,
        label:
            tabItem.id === 'home' ? t('الرئيسية', 'Home') :
                tabItem.id === 'library' ? t('المكتبة', 'Library') :
                    tabItem.id === 'brand' ? t('استوديو العلامة', 'Brand Studio') :
                        t('الحساب', 'Account'),
        hint:
            tabItem.id === 'home' ? t('هويتك، الأولويات، وأهم الإجراءات', 'Identity, priorities, and action surfaces') :
                tabItem.id === 'library' ? t('الملفات والتصاميم والعناصر الجاهزة للمراجعة', 'Files, designs, and review-ready assets') :
                    tabItem.id === 'brand' ? t('الشعار والألوان والاتجاه البصري', 'Logo, palette, and visual direction') :
                        t('الإعدادات والأمان والتفضيلات', 'Preferences, security, and system controls')
    })), [t]);

    const activeTabMeta = localizedTabs.find(tItem => tItem.id === tab) || localizedTabs[0];
    const adminMessageCount = messages.filter(m => m.sender === 'admin').length;
    const latestUpdate = updates[0] || null;
    const latestAdminMessage = [...messages].reverse().find(m => m.sender === 'admin') || null;
    const latestDesign = visibleDesigns[0] || null;
    const latestAsset = assets[0] || null;
    const sinceLastVisitSummary = lastSeenAt
        ? {
            updates: updates.filter(item => new Date(item.update_date).getTime() > lastSeenAt.getTime()).length,
            messages: messages.filter(item => item.sender === 'admin' && new Date(item.created_at).getTime() > lastSeenAt.getTime()).length,
            files: assets.filter(item => new Date(item.uploaded_at).getTime() > lastSeenAt.getTime()).length,
            designs: designs.filter(item => new Date(item.updated_at || item.created_at).getTime() > lastSeenAt.getTime()).length,
        }
        : null;

    const attentionItems = [
        !profileData?.display_name?.trim()
            ? { id: 'name', title: 'Complete your identity', desc: 'Add the display name shown across the client workspace.', action: () => setShowIdentityEditor(true) }
            : null,
        !profileData?.avatar_url
            ? { id: 'avatar', title: 'Add a profile photo', desc: 'A clear avatar improves trust and recognition in conversations.', action: () => setShowPhotoManager(true) }
            : null,
        !profileData?.logo_url
            ? { id: 'logo', title: 'Upload your logo', desc: 'Your team can move faster when the brand mark is ready.', action: () => { setTab('brand'); setBrandPanel('assets'); } }
            : null,
        latestAdminMessage
            ? { id: 'reply', title: 'Reply to the latest team message', desc: latestAdminMessage.message.slice(0, 96), action: () => { setAssistantMode('team'); setShowQuickMessage(true); } }
            : null,
        latestDesign
            ? { id: 'review', title: 'Review your newest design', desc: getDesignTitle(latestDesign), action: () => { setTab('library'); setLibraryPanel('designs'); } }
            : null,
    ].filter(Boolean) as Array<{ id: string; title: string; desc: string; action: () => void }>;

    const recommendedNow = !profileData?.logo_url
        ? { title: 'Upload your brand logo', desc: 'Unlock a more complete brand setup for the team.', cta: 'Open Brand Studio', action: () => { setTab('brand'); setBrandPanel('assets'); } }
        : latestAdminMessage
            ? { title: 'Reply to your team', desc: 'Keep momentum high by answering the latest thread.', cta: 'Open Chat Widget', action: () => { setAssistantMode('team'); setShowQuickMessage(true); } }
            : latestUpdate
                ? { title: 'Review the newest project update', desc: latestUpdate.title, cta: 'Open Home', action: () => setTab('home') }
                : { title: 'Start the conversation', desc: 'Introduce your next priority to the team.', cta: 'Open Chat Widget', action: () => { setAssistantMode('team'); setShowQuickMessage(true); } };

    const guideLabel = remainingChecklistCount > 0
        ? `${completedChecklist}/${completionChecklist.length} setup tasks done`
        : 'Workspace setup complete';

    const assistantPlaybook = useMemo(() => ([
        {
            id: 'welcome',
            keywords: ['hello', 'hi', 'مرحبا', 'اهلا', 'مساعدة'],
            response: t(
                `أقدر أساعدك في 4 مسارات بسرعة: الهوية، البراند، المكتبة، أو التواصل مع الفريق. حالياً عندك ${remainingChecklistCount} مهام إعداد متبقية و${designs.length} تصميم و${assets.length} ملف.`,
                `I can help across four fast lanes: identity, brand, library, and team communication. Right now you have ${remainingChecklistCount} setup tasks left, ${designs.length} designs, and ${assets.length} files.`,
            ),
        },
        {
            id: 'identity',
            keywords: ['name', 'profile', 'identity', 'الاسم', 'البروفايل', 'الصورة', 'avatar'],
            response: t(
                'لو هدفك تعديل الاسم أو الصورة أو التقديم المختصر، استخدم Edit Profile أو Change Photo من أعلى الصفحة. هذه أسرع نقطة وصول الآن.',
                'If you want to update your name, photo, or short intro, use Edit Profile or Change Photo from the top of the page. That is the fastest access point now.',
            ),
        },
        {
            id: 'brand',
            keywords: ['logo', 'brand', 'colors', 'website', 'الشعار', 'البراند', 'الالوان', 'الألوان', 'الموقع'],
            response: t(
                'لتحسين البراند بسرعة: ارفع الشعار أولاً، ثم اختر لوناً أساسياً واضحاً، ثم أضف tagline قصيرة ورابط الموقع. هذا يرفع جودة المخرجات مباشرة للفريق.',
                'To improve your brand quickly: upload the logo first, then choose a strong primary color, then add a concise tagline and website. This immediately improves output quality for the team.',
            ),
        },
        {
            id: 'designs',
            keywords: ['design', 'review', 'approve', 'concept', 'تصميم', 'مراجعة', 'اعتماد', 'كونسبت'],
            response: t(
                `المكتبة عندك فيها ${designs.length} تصميم حالياً. أفضل مراجعة تبدأ من Library، ثم التصفية بالأحدث أو المفضلة، وبعدها افتح المعاينة وخذ قرار: متابعة، تعديل، أو طلب توضيح.`,
                `Your library currently holds ${designs.length} designs. The best review flow is: open Library, filter by newest or favorites, preview the item, then decide whether to proceed, revise, or ask a question.`,
            ),
        },
        {
            id: 'files',
            keywords: ['file', 'download', 'asset', 'brief', 'ملف', 'تحميل', 'assets', 'فايل'],
            response: t(
                `لديك ${assets.length} ملف في المكتبة. لو تبحث عن آخر ملف، افتح Library واختر Files. أقدر أيضاً أجهز لك رسالة تطلب الملف الناقص من الفريق.`,
                `You have ${assets.length} files in the library. If you are looking for the latest file, open Library and switch to Files. I can also draft a message to request any missing asset from the team.`,
            ),
        },
        {
            id: 'messages',
            keywords: ['message', 'team', 'reply', 'chat', 'رسالة', 'الفريق', 'رد', 'شات'],
            response: t(
                'يمكنني تجهيز رسالة سريعة للفريق. اطلب مني مثلاً: اكتب رسالة لطلب آخر تصميم، أو اسأل عن الخطوة القادمة، أو اطلب تعديل على الشعار.',
                'I can prepare a quick message for the team. Ask me for example to request the latest design, ask about the next step, or request a logo revision.',
            ),
        },
        {
            id: 'progress',
            keywords: ['progress', 'next step', 'status', 'التقدم', 'الحالة', 'الخطوة', 'التالي'],
            response: t(
                `التقدم الحالي ${progress}%، والحالة ${statusLabel}. ${clientData?.next_steps ? `أقرب خطوة الآن: ${clientData.next_steps}.` : 'لو لم تظهر خطوة تالية بوضوح، افتح widget الرسائل وأرسل أولوية واضحة للفريق.'}`,
                `Current progress is ${progress}% and the status is ${statusLabel}. ${clientData?.next_steps ? `The nearest next step is: ${clientData.next_steps}.` : 'If the next step is not clear yet, open the message widget and send the team a clear priority.'}`,
            ),
        },
        {
            id: 'package',
            keywords: ['package', 'plan', 'subscription', 'الباقة', 'الخطة', 'الاشتراك'],
            response: t(
                `الباقة الحالية: ${clientData?.package_name || 'Custom Plan'}. لو أردت مراجعة التفاصيل افتح Account وستجد ملخص الاشتراك الحالي.`,
                `Your current package is ${clientData?.package_name || 'Custom Plan'}. If you want to review details, open Account for the current subscription summary.`,
            ),
        },
        {
            id: 'sync',
            keywords: ['save', 'sync', 'offline', 'حفظ', 'مزامنة', 'اوفلاين', 'offline'],
            response: t(
                `حالة المزامنة الآن: ${syncMessage}. إذا كنت غير متصل، التعديلات تُحفظ محلياً وتُرسل لاحقاً.`,
                `Current sync state: ${syncMessage}. If you are offline, changes are queued locally and sent later.`,
            ),
        },
        {
            id: 'faq',
            keywords: ['how', 'what', 'why', 'ازاي', 'كيف', 'ليه', 'what can you do'],
            response: t(
                'أقدر أوجّهك داخل المساحة، أشرح مكان أي feature، أساعدك تجهز رسالة للفريق، وأرشدك لأسرع خطوة لتحسين الهوية أو البراند أو المراجعة.',
                'I can guide you through the workspace, explain where any feature lives, help you draft a team message, and direct you to the fastest next step for identity, brand, or review.',
            ),
        },
    ]), [t, remainingChecklistCount, designs.length, assets.length, progress, statusLabel, clientData?.next_steps, clientData?.package_name, syncMessage]);

    const buildAssistantReply = useCallback((matched?: { id: string; response: string }) => {
        const fallback = t(
            'أحتاج توضيحًا أكثر قليلًا. قل لي هل تريد تحسين الهوية، البراند، المكتبة، أم كتابة رسالة للفريق وسأوجّهك مباشرة.',
            'I need a bit more direction. Tell me whether you want help with identity, brand, library, or drafting a team message and I will guide you directly.',
        );

        if (!matched) {
            return `${t('قراءة سريعة:', 'Quick read:')} ${fallback}`;
        }

        const nextStep = matched.id === 'identity'
            ? t('أفضل خطوة الآن: افتح Edit Profile أو Change Photo من أعلى الصفحة.', 'Best next move: open Edit Profile or Change Photo from the top of the page.')
            : matched.id === 'brand'
                ? t('أفضل خطوة الآن: افتح Brand Studio وابدأ بالشعار ثم اللون الأساسي.', 'Best next move: open Brand Studio and start with the logo, then the primary color.')
                : matched.id === 'designs'
                    ? t('أفضل خطوة الآن: اذهب إلى Library وافتح أحدث تصميم للمراجعة.', 'Best next move: go to Library and open the newest design for review.')
                    : matched.id === 'files'
                        ? t('أفضل خطوة الآن: افتح Files وإذا كان هناك عنصر ناقص أستطيع تجهيز رسالة للفريق.', 'Best next move: open Files, and if something is missing I can draft a message to the team.')
                        : matched.id === 'messages'
                            ? t('أفضل خطوة الآن: انتقل إلى Team Chat إذا أردت إرسال الرسالة مباشرة للفريق.', 'Best next move: switch to Team Chat if you want to send the message directly to the team.')
                            : matched.id === 'progress'
                                ? t('أفضل خطوة الآن: ركّز على أقرب أولوية أو أرسل للفريق ما الذي تريد تسريعه.', 'Best next move: focus on the nearest priority or tell the team what you want accelerated.')
                                : matched.id === 'package'
                                    ? t('أفضل خطوة الآن: افتح Account لمراجعة الباقة والتفاصيل المرتبطة بها.', 'Best next move: open Account to review the plan and its details.')
                                    : matched.id === 'sync'
                                        ? t('أفضل خطوة الآن: استمر في العمل، ولو كنت offline ستتم المزامنة تلقائيًا لاحقًا.', 'Best next move: keep working, and if you are offline the sync will happen automatically later.')
                                        : t('إذا أردت يمكنني تحويل هذه الإجابة إلى خطوة عملية أو رسالة جاهزة للفريق.', 'If you want, I can turn this into an action step or a ready-to-send team message.');

        return `${t('تحليل Lumos:', 'Lumos analysis:')} ${matched.response} ${nextStep}`;
    }, [t]);

    const handleAssistantPrompt = useCallback((prompt: string) => {
        const normalized = prompt.trim().toLowerCase();
        const matched = assistantPlaybook.find(item => item.keywords.some(keyword => normalized.includes(keyword.toLowerCase())));

        setAssistantMessages(prev => [
            ...prev,
            { id: `client-${Date.now()}`, sender: 'client', text: prompt },
        ]);

        setAssistantTyping(true);
        window.setTimeout(() => {
            setAssistantMessages(prev => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    sender: 'assistant',
                    text: buildAssistantReply(matched ? { id: matched.id, response: matched.response } : undefined),
                    tone: matched ? 'highlight' : 'default',
                },
            ]);
            setAssistantTyping(false);
        }, 650);
    }, [assistantPlaybook, buildAssistantReply]);

    useEffect(() => {
        if (assistantMessages.length > 0 || assistantPlaybook.length === 0) return;
        setAssistantMessages([
            {
                id: 'assistant-welcome',
                sender: 'assistant',
                text: assistantPlaybook[0].response,
                tone: 'highlight',
            },
        ]);
    }, [assistantMessages.length, assistantPlaybook]);

    useEffect(() => {
        if (!showQuickMessage) return;
        window.setTimeout(() => assistantEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 60);
    }, [assistantMessages, assistantTyping, showQuickMessage]);

    const getTabBadge = (tabId: TabId) => {
        if (tabId === 'library') return assets.length + designs.length;
        if (tabId === 'brand') return brandColors.length;
        return 0;
    };

    const accentContrastWhite = wcagBadge(contrastRatio(themeAccent, '#ffffff'));
    const accentContrastDark = wcagBadge(contrastRatio(themeAccent, '#0f172a'));

    const portalThemeClass = portalThemeMode === 'brand'
        ? 'theme-brand'
        : portalThemeMode === 'high-contrast'
            ? 'theme-high-contrast'
            : 'theme-default';

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isTypingTarget = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT' || target?.isContentEditable;
            if (isTypingTarget) return;

            if (event.key >= '1' && event.key <= '5') {
                const index = Number(event.key) - 1;
                if (localizedTabs[index]) {
                    event.preventDefault();
                    setTab(localizedTabs[index].id);
                }
            }

            if ((event.altKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                void persistProfile('manual');
            }

            if (event.key === '?') {
                event.preventDefault();
                setShowShortcutHelp(prev => !prev);
            }

            if (event.key === 'Escape') {
                setShowShortcutHelp(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [persistProfile, localizedTabs]);

    const syncTone = syncState === 'error'
        ? 'bg-red-50 border-red-200 text-red-700'
        : syncState === 'queued'
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : syncState === 'saving'
                ? 'bg-sky-50 border-sky-200 text-sky-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700';

    //  Guards 
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
            </div>
        );
    }
    if (!client) return null;

    //  Tab content 

    // HOME
    const tabHome = (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <SectionCard title="Do This Now" icon={Zap}>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        {actionRail.map(action => (
                            <button
                                key={action.id}
                                onClick={action.action}
                                className="rounded-[24px] border border-[rgba(127,142,106,0.18)] bg-white/88 px-4 py-4 text-left transition-all hover:border-[rgba(7,127,91,0.24)] hover:shadow-[0_16px_30px_rgba(36,119,54,0.08)]"
                            >
                                <p className="text-sm font-semibold text-[var(--lumos-dark)]">{action.label}</p>
                                <p className="mt-1 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{action.desc}</p>
                            </button>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard
                    title="Guided Setup"
                    icon={Sparkles}
                    action={
                        remainingChecklistCount > 0 ? (
                            <button
                                onClick={() => setOnboardingDismissed(true)}
                                className="text-[11px] text-muted-foreground hover:text-foreground"
                            >
                                {t('إخفاء', 'Dismiss')}
                            </button>
                        ) : <span className="text-[11px] text-emerald-600">{t('مكتمل', 'Complete')}</span>
                    }
                >
                    {!onboardingDismissed || remainingChecklistCount === 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3 rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-[rgba(255,255,255,0.82)] px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('دليل التفعيل الذكي', 'Smarter setup guide')}</p>
                                    <p className="mt-1 text-xs text-[rgba(36,119,54,0.72)]">{guideLabel}</p>
                                </div>
                                <span className="rounded-full border border-[rgba(7,127,91,0.14)] bg-[rgba(7,127,91,0.08)] px-3 py-1 text-xs font-semibold text-[var(--lumos-primary)]">
                                    {remainingChecklistCount > 0 ? `${remainingChecklistCount} left` : 'Ready'}
                                </span>
                            </div>
                            <div className="space-y-2.5">
                                {completionChecklist.map(item => (
                                    <button
                                        key={item.key}
                                        onClick={item.action}
                                        className={`flex w-full items-center justify-between rounded-[20px] border px-4 py-3 text-left transition-colors ${item.done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[rgba(127,142,106,0.16)] bg-white/88 text-[var(--lumos-dark)] hover:border-[rgba(7,127,91,0.24)]'}`}
                                    >
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{item.done ? 'Done' : 'Open'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/84 px-4 py-4">
                            <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('الدليل مخفي حالياً', 'Guide hidden for now')}</p>
                            <p className="mt-1 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{t('سيظهر مرة أخرى عند الحاجة أو بعد إعادة تحميل الصفحة.', 'It will appear again when needed or after a reload.')}</p>
                        </div>
                    )}
                </SectionCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <SectionCard title="Today Workspace" icon={LayoutDashboard}>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(242,247,244,0.94)_100%)] p-4 md:col-span-2">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[rgba(36,119,54,0.56)]">{t('الاقتراح الحالي', 'Recommended now')}</p>
                            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-base font-semibold text-[var(--lumos-dark)]">{recommendedNow.title}</p>
                                    <p className="mt-1 text-sm leading-6 text-[rgba(36,119,54,0.76)]">{recommendedNow.desc}</p>
                                </div>
                                <Button onClick={recommendedNow.action} className="rounded-xl text-white" style={{ backgroundColor: themeAccent }}>
                                    {recommendedNow.cta}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/90 p-4 md:col-span-2">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('يتطلب انتباهك', 'Needs attention')}</p>
                                <span className="text-xs text-[rgba(36,119,54,0.64)]">{attentionItems.length} {t('عنصر', 'items')}</span>
                            </div>
                            <div className="mt-3 space-y-2.5">
                                {attentionItems.length === 0 ? (
                                    <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                        {t('لا توجد عناصر حرجة الآن. مساحتك جاهزة للحركة.', 'No urgent items right now. Your workspace is in good shape.')}
                                    </div>
                                ) : attentionItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={item.action}
                                        className="flex w-full items-start justify-between rounded-[20px] border border-[rgba(127,142,106,0.16)] bg-[rgba(255,255,255,0.96)] px-4 py-3 text-left transition-colors hover:border-[rgba(7,127,91,0.22)]"
                                    >
                                        <span>
                                            <span className="block text-sm font-semibold text-[var(--lumos-dark)]">{item.title}</span>
                                            <span className="mt-1 block text-xs leading-6 text-[rgba(36,119,54,0.72)]">{item.desc}</span>
                                        </span>
                                        <ChevronRight className="mt-1 h-4 w-4 text-[var(--lumos-primary)]" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/90 p-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('آخر تحديث', 'Latest update')}</p>
                            {latestUpdate ? (
                                <>
                                    <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{latestUpdate.title}</p>
                                    <p className="mt-2 text-xs text-[rgba(36,119,54,0.72)]">{new Date(latestUpdate.update_date).toLocaleDateString()}</p>
                                </>
                            ) : (
                                <p className="mt-2 text-sm text-[rgba(36,119,54,0.72)]">{t('لا توجد تحديثات جديدة حتى الآن.', 'No project updates yet.')}</p>
                            )}
                        </div>

                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/90 p-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('الخطوة التالية', 'Next step')}</p>
                            <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{clientData?.next_steps || t('أرسل أولوية جديدة للفريق لبدء الخطوة القادمة.', 'Send a new priority to the team to unlock the next step.')}</p>
                        </div>

                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/90 p-4 md:col-span-2">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('منذ آخر زيارة', 'Since your last visit')}</p>
                            {sinceLastVisitSummary ? (
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[
                                        { label: t('تحديثات', 'Updates'), value: sinceLastVisitSummary.updates },
                                        { label: t('رسائل', 'Messages'), value: sinceLastVisitSummary.messages },
                                        { label: t('ملفات', 'Files'), value: sinceLastVisitSummary.files },
                                        { label: t('تصاميم', 'Designs'), value: sinceLastVisitSummary.designs },
                                    ].map(item => (
                                        <div key={item.label} className="rounded-[20px] border border-[rgba(127,142,106,0.14)] bg-[rgba(244,248,245,0.9)] px-4 py-3">
                                            <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.54)]">{item.label}</p>
                                            <p className="mt-2 text-xl font-semibold text-[var(--lumos-dark)]">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-[rgba(36,119,54,0.72)]">{t('سنبدأ تتبع التغييرات بعد أول زيارة مكتملة.', 'This summary will become smarter after your first complete visit.')}</p>
                            )}
                        </div>
                    </div>
                </SectionCard>

                <div className="space-y-6">
                    <SectionCard title="Collaboration Snapshot" icon={MessageCircle}>
                        {latestAdminMessage ? (
                            <div className="space-y-4">
                                <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/90 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('آخر رسالة من الفريق', 'Latest team message')}</p>
                                        <span className="text-[11px] text-[rgba(36,119,54,0.56)]">{new Date(latestAdminMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-[rgba(36,119,54,0.82)]">{latestAdminMessage.message}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={() => setShowQuickMessage(true)} className="rounded-xl text-white" style={{ backgroundColor: themeAccent }}>
                                        {t('رد سريع', 'Quick reply')}
                                    </Button>
                                    <Button variant="outline" onClick={() => { setAssistantMode('team'); setShowQuickMessage(true); }} className="rounded-xl">
                                        {t('فتح الويدجت', 'Open widget')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/90 px-4 py-4">
                                <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('لا توجد رسائل حديثة', 'No recent team messages')}</p>
                                <p className="mt-1 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{t('ابدأ محادثة سريعة لوضع الأولوية القادمة أو طلب ملف أو مراجعة.', 'Start a quick conversation to set the next priority, request a file, or ask for a review.')}</p>
                                <Button onClick={() => setShowQuickMessage(true)} className="mt-4 rounded-xl text-white" style={{ backgroundColor: themeAccent }}>
                                    {t('إرسال رسالة', 'Send message')}
                                </Button>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title="Library Snapshot" icon={Folder}>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/90 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.56)]">{t('التصاميم', 'Designs')}</p>
                                    <p className="mt-2 text-xl font-semibold text-[var(--lumos-dark)]">{designs.length}</p>
                                </div>
                                <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/90 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.56)]">{t('الملفات', 'Files')}</p>
                                    <p className="mt-2 text-xl font-semibold text-[var(--lumos-dark)]">{assets.length}</p>
                                </div>
                            </div>
                            <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/90 p-4">
                                <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('الأحدث في المكتبة', 'Newest in your library')}</p>
                                <p className="mt-2 text-xs leading-6 text-[rgba(36,119,54,0.72)]">
                                    {latestDesign ? `${getDesignTitle(latestDesign)} • ${t('آخر تصميم محدث', 'latest design updated')}` : latestAsset ? `${latestAsset.file_name} • ${t('آخر ملف تم رفعه', 'latest uploaded file')}` : t('لا توجد عناصر بعد. ستظهر الملفات والتصاميم هنا بمجرد توفرها.', 'No items yet. Files and designs will appear here as soon as they are available.')}
                                </p>
                                <Button variant="outline" onClick={() => setTab('library')} className="mt-4 rounded-xl">
                                    {t('فتح المكتبة', 'Open library')}
                                </Button>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );

    // FILES
    const tabFiles = (
        <div>
            {assets.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
                    <Folder className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-foreground font-medium">No files yet</p>
                    <p className="text-muted-foreground text-sm mt-1">Files shared by the team will show here.</p>
                    <Button onClick={() => { setAssistantMode('team'); setShowQuickMessage(true); }} className="mt-5 text-white rounded-xl" style={{ backgroundColor: themeAccent }}>
                        Ask Team for Files
                    </Button>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-indigo-500" />
                        <h3 className="font-semibold text-foreground text-sm">{assets.length} file{assets.length !== 1 ? 's' : ''}</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {assets.map(a => (
                            <div key={a.id} className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-background sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{a.file_name}</p>
                                        <p className="text-[11px] text-muted-foreground">{new Date(a.uploaded_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.open(a.file_url, '_blank', 'noopener,noreferrer')}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-indigo-500 hover:bg-slate-100 sm:ml-4 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-indigo-400 sm:hover:bg-transparent sm:hover:text-indigo-300 shrink-0"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // DESIGNS
    const tabDesigns = (
        <div className="space-y-5">
            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-emerald-500/10">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Portfolio Studio</h3>
                            <p className="text-xs text-muted-foreground mt-1">Browse, filter, and manage your saved visual concepts faster.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setDesignViewMode('grid')}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 ${designViewMode === 'grid' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-background text-foreground border-border'}`}
                            >
                                <Grid3X3 className="w-3.5 h-3.5" /> Grid
                            </button>
                            <button
                                onClick={() => setDesignViewMode('list')}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 ${designViewMode === 'list' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-background text-foreground border-border'}`}
                            >
                                <Rows3 className="w-3.5 h-3.5" /> List
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</p>
                            <p className="text-lg font-bold text-foreground mt-1">{designs.length}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Featured</p>
                            <p className="text-lg font-bold text-emerald-600 mt-1">{featuredDesigns}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Archived</p>
                            <p className="text-lg font-bold text-amber-600 mt-1">{archivedDesigns}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-background p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Favorites</p>
                            <p className="text-lg font-bold text-violet-600 mt-1">{favoritesInLibrary}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-6 relative">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={designQuery}
                                onChange={e => setDesignQuery(e.target.value)}
                                placeholder="Search by design name, business, or service"
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <div className="relative">
                                <Filter className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    value={designStatusFilter}
                                    onChange={e => setDesignStatusFilter(e.target.value as DesignStatusFilter)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="active">Active only</option>
                                    <option value="featured">Featured only</option>
                                    <option value="archived">Archived only</option>
                                </select>
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <div className="relative">
                                <ArrowUpDown className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    value={designSortMode}
                                    onChange={e => setDesignSortMode(e.target.value as DesignSortMode)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                                >
                                    <option value="updated_desc">Newest first</option>
                                    <option value="updated_asc">Oldest first</option>
                                    <option value="name_asc">Name A-Z</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {designs.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
                    <Palette className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-foreground font-medium">No saved designs</p>
                    <p className="text-muted-foreground text-sm mt-1">Create a visual and save it from the Live Preview.</p>
                    <Button onClick={() => navigate('/#live-preview')} className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                        Open Visualizer
                    </Button>
                </div>
            ) : visibleDesigns.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-10 text-center">
                    <Search className="w-9 h-9 text-slate-300 mx-auto mb-3" />
                    <p className="text-foreground font-medium">No results with current filters</p>
                    <p className="text-muted-foreground text-sm mt-1">Try changing search text, status filter, or sorting option.</p>
                    <button
                        onClick={() => {
                            setDesignQuery('');
                            setDesignStatusFilter('all');
                            setDesignSortMode('updated_desc');
                        }}
                        className="mt-5 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-background"
                    >
                        Reset filters
                    </button>
                </div>
            ) : designViewMode === 'list' ? (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {visibleDesigns.map(d => {
                            const title = getDesignTitle(d);
                            const isFavorite = favoriteDesignIds.includes(d.id);
                            const previewUrl = getDesignPreviewUrl(d);
                            return (
                                <div key={d.id} className="px-4 sm:px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-background/70 transition-colors">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${d.status === 'featured' ? 'bg-emerald-100 text-emerald-700' : d.status === 'archived' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {d.status}
                                            </span>
                                            {isFavorite && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">Favorite</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{d.business_name} • {d.service_type || 'General'} • Updated {new Date(d.updated_at || d.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button onClick={() => toggleFavoriteDesign(d.id)} className="px-3 py-1.5 rounded-lg border text-xs font-semibold bg-background border-border hover:bg-muted/40 inline-flex items-center gap-1.5">
                                            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-violet-500' : ''}`} />
                                            {isFavorite ? 'Saved' : 'Favorite'}
                                        </button>
                                        <button onClick={() => void copyDesignPreviewLink(d)} className="px-3 py-1.5 rounded-lg border text-xs font-semibold bg-background border-border hover:bg-muted/40 inline-flex items-center gap-1.5">
                                            <Copy className="w-3.5 h-3.5" /> Copy Link
                                        </button>
                                        <button onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')} className="px-3 py-1.5 rounded-lg border text-xs font-semibold bg-background border-border hover:bg-muted/40 inline-flex items-center gap-1.5">
                                            <Eye className="w-3.5 h-3.5" /> Preview
                                        </button>
                                        <button onClick={() => deleteDesign(d.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white inline-flex items-center gap-1.5">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visibleDesigns.map(d => {
                        const title = getDesignTitle(d);
                        const isFavorite = favoriteDesignIds.includes(d.id);
                        const previewUrl = getDesignPreviewUrl(d);
                        return (
                            <div key={d.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group">
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                    {previewUrl
                                        ? <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-slate-300"><Palette className="w-8 h-8" /></div>
                                    }
                                    <div className="absolute inset-0 bg-slate-900/55 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {previewUrl && (
                                            <button onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-card text-foreground text-xs font-semibold rounded-xl">
                                                <ExternalLink className="w-3.5 h-3.5" /> View
                                            </button>
                                        )}
                                        <button onClick={() => void copyDesignPreviewLink(d)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-card text-foreground text-xs font-semibold rounded-xl">
                                            <Copy className="w-3.5 h-3.5" /> Copy Link
                                        </button>
                                        <button onClick={() => deleteDesign(d.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-xl">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-foreground text-sm truncate">{title}</p>
                                        <button
                                            onClick={() => toggleFavoriteDesign(d.id)}
                                            className="text-muted-foreground hover:text-violet-500 transition-colors"
                                            aria-label="Toggle favorite"
                                        >
                                            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current text-violet-500' : ''}`} />
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(d.updated_at || d.created_at).toLocaleDateString()}</p>
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <span className="text-[10px] text-muted-foreground truncate">{d.service_type || 'General service'}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${d.status === 'featured' ? 'bg-emerald-100 text-emerald-700' : d.status === 'archived' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {d.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const tabLibrary = (
        <div className="space-y-6">
            <SectionCard title="Library Control" icon={Folder}>
                <div className="flex flex-wrap items-center gap-3">
                    {[
                        { id: 'designs', label: t('التصاميم', 'Designs'), count: designs.length },
                        { id: 'files', label: t('الملفات', 'Files'), count: assets.length },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setLibraryPanel(item.id as LibraryPanel)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${libraryPanel === item.id ? 'border-[rgba(7,127,91,0.24)] bg-[rgba(7,127,91,0.1)] text-[var(--lumos-primary)]' : 'border-[rgba(127,142,106,0.18)] bg-white text-[var(--lumos-dark)] hover:border-[rgba(7,127,91,0.2)]'}`}
                        >
                            {item.label}
                            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] text-[rgba(36,119,54,0.72)]">{item.count}</span>
                        </button>
                    ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.56)]">{t('جاهز للمراجعة', 'Ready to review')}</p>
                        <p className="mt-2 text-xl font-semibold text-[var(--lumos-dark)]">{visibleDesigns.length}</p>
                    </div>
                    <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.56)]">{t('المفضلة', 'Favorites')}</p>
                        <p className="mt-2 text-xl font-semibold text-[var(--lumos-dark)]">{favoritesInLibrary}</p>
                    </div>
                    <div className="col-span-2 rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-3 sm:col-span-1">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.56)]">{t('آخر تحديث', 'Latest update')}</p>
                        <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{latestDesign ? getDesignTitle(latestDesign) : latestAsset?.file_name || t('لا يوجد', 'None yet')}</p>
                    </div>
                </div>
            </SectionCard>

            {libraryPanel === 'designs' ? tabDesigns : tabFiles}
        </div>
    );

    // BRAND KIT
    const tabBrand = (
        <div className="space-y-6">
            <SectionCard title="Brand Setup" icon={Sparkles}>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                    {[
                        { id: 'identity', label: 'Identity' },
                        { id: 'assets', label: 'Assets' },
                        { id: 'colors', label: 'Colors & Theme' },
                    ].map(section => (
                        <button
                            key={section.id}
                            onClick={() => setBrandPanel(section.id as BrandPanel)}
                            className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${brandPanel === section.id ? 'text-white' : 'text-foreground bg-background border-border'}`}
                            style={brandPanel === section.id ? { backgroundColor: themeAccent, borderColor: themeAccent } : {}}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
            </SectionCard>

            {/* Identity */}
            {brandPanel === 'identity' && (
                <SectionCard title="Brand Identity" icon={Type}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="rounded-2xl border border-border bg-background/70 px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Brand / Company</p>
                            <p className="mt-2 text-sm font-semibold text-foreground">{clientData?.company_name || displayName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">This lives in your identity deck and is shown here as shared context.</p>
                        </div>
                        <Field label="Tagline / Slogan">
                            <input
                                type="text"
                                value={profileData?.tagline || ''}
                                onChange={e => setProfileData(prev => prev ? { ...prev, tagline: e.target.value } : null)}
                                placeholder="e.g. Building tomorrow, today."
                                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </Field>
                        <Field label="Brand Identity">
                            <textarea
                                value={profileData?.bio || ''}
                                onChange={e => setProfileData(prev => prev ? { ...prev, bio: e.target.value } : null)}
                                placeholder="Describe your brand voice, mission, and personality..."
                                className="w-full min-h-[92px] px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                            />
                        </Field>
                        <Field label="Website">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                                <input
                                    type="url"
                                    value={profileData?.website || ''}
                                    onChange={e => setProfileData(prev => prev ? { ...prev, website: e.target.value } : null)}
                                    placeholder="https://yourdomain.com"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                        </Field>
                        <Field label="Logo URL">
                            <div className="flex items-center gap-2">
                                <Image className="w-4 h-4 text-muted-foreground shrink-0" />
                                <input
                                    type="url"
                                    value={profileData?.logo_url || ''}
                                    onChange={e => setProfileData(prev => prev ? { ...prev, logo_url: e.target.value } : null)}
                                    placeholder="https://...logo.png"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                            <div className="mt-2">
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold cursor-pointer hover:bg-indigo-100 transition-colors">
                                    <Camera className="w-3.5 h-3.5" /> Upload Logo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => void uploadBrandLogo(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        </Field>
                    </div>
                </SectionCard>
            )}

            {brandPanel === 'assets' && (
                <SectionCard title="Brand Assets" icon={Image}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Logo URL">
                            <div className="flex items-center gap-2">
                                <Image className="w-4 h-4 text-muted-foreground shrink-0" />
                                <input
                                    type="url"
                                    value={profileData?.logo_url || ''}
                                    onChange={e => setProfileData(prev => prev ? { ...prev, logo_url: e.target.value } : null)}
                                    placeholder="https://...logo.png"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                            <div className="mt-2">
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors" style={{ backgroundColor: `${themeAccent}1A`, color: themeAccent, border: `1px solid ${themeAccent}40` }}>
                                    <Camera className="w-3.5 h-3.5" /> Upload Logo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => void uploadBrandLogo(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        </Field>
                    </div>
                    {/* Logo Preview */}
                    {profileData?.logo_url && (
                        <div className="mt-5 pt-5 border-t border-slate-100">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Logo Preview</p>
                            <div className="inline-flex items-center justify-center p-4 bg-background border border-border rounded-xl">
                                {!logoPreviewError ? (
                                    <img
                                        src={profileData.logo_url}
                                        alt="Brand logo"
                                        className="max-h-16 max-w-48 object-contain"
                                        onError={() => setLogoPreviewError(true)}
                                    />
                                ) : (
                                    <p className="text-xs text-muted-foreground">Could not load logo preview. Please check the logo URL.</p>
                                )}
                            </div>
                        </div>
                    )}
                </SectionCard>
            )}

            {/* Colors */}
            {brandPanel === 'colors' && (
                <SectionCard title="Brand Colors" icon={Palette}>
                    {/* Selected palette */}
                    {brandColors.length > 0 ? (
                        <div className="flex flex-wrap gap-3 mb-6">
                            {brandColors.map(c => (
                                <div key={c} className="relative group">
                                    <div
                                        className="w-12 h-12 rounded-xl border-2 border-white shadow-md cursor-default"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                    <button
                                        onClick={() => removeBrandColor(c)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center text-muted-foreground hover:text-red-500"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <p className="text-[10px] text-muted-foreground text-center mt-1 font-mono">{c}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm mb-5">No brand colors added yet.</p>
                    )}

                    {/* Add custom color */}
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <input
                                type="color"
                                value={newColor}
                                onChange={e => setNewColor(e.target.value)}
                                className="w-11 h-11 rounded-xl border border-border cursor-pointer p-0.5 bg-card"
                            />
                        </div>
                        <input
                            type="text"
                            value={newColor}
                            onChange={e => setNewColor(e.target.value)}
                            className="w-28 px-3 py-2.5 rounded-xl border border-border text-sm font-mono focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        />
                        <button
                            onClick={() => addBrandColor(newColor)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>

                    {/* Presets */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Quick picks:</p>
                        <div className="flex flex-wrap gap-2">
                            {BRAND_COLOR_PRESETS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => addBrandColor(c)}
                                    className="w-8 h-8 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Accent color */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <Field label="Primary Accent Color (UI theme)">
                            <div className="flex items-center gap-3 mt-1">
                                <input
                                    type="color"
                                    value={profileData?.theme_accent || '#6366f1'}
                                    onChange={e => setProfileData(prev => prev ? { ...prev, theme_accent: e.target.value } : null)}
                                    className="w-11 h-11 rounded-xl border border-border cursor-pointer p-0.5 bg-card"
                                />
                                <span className="text-sm text-muted-foreground font-mono">{profileData?.theme_accent || '#6366f1'}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`px-2 py-1 rounded-lg border text-[11px] ${accentContrastWhite.tone}`}>On white: {accentContrastWhite.label}</span>
                                <span className={`px-2 py-1 rounded-lg border text-[11px] ${accentContrastDark.tone}`}>On dark: {accentContrastDark.label}</span>
                            </div>
                        </Field>
                    </div>
                </SectionCard>
            )}

            {/* Save */}
            <div className="flex justify-stretch sm:justify-end">
                <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:items-end">
                    <Button
                        onClick={saveProfile}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 py-2.5 sm:rounded-xl"
                    >
                        {saving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4 mr-2" />Save Brand Kit</>}
                    </Button>
                    {lastSavedAt && !saving && (
                        <span className="text-[11px] text-muted-foreground">Saved at {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                </div>
            </div>
        </div>
    );

    // ACCOUNT
    const tabAccount = (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <SectionCard title={t('المظهر واللغة', 'Appearance & Language')} icon={Sparkles}>
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t('نمط العرض', 'Display mode')}</p>
                            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                                {[
                                    { id: 'default', label: t('افتراضي', 'Default') },
                                    { id: 'brand', label: t('ثيم العلامة', 'Brand Theme') },
                                    { id: 'high-contrast', label: t('تباين عال', 'High Contrast') },
                                ].map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setPortalThemeMode(mode.id as PortalThemeMode)}
                                        className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${portalThemeMode === mode.id ? 'text-white' : 'text-foreground bg-background border-border'}`}
                                        style={portalThemeMode === mode.id ? { backgroundColor: themeAccent, borderColor: themeAccent } : {}}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/88 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('لغة البوابة', 'Portal language')}</p>
                                    <p className="mt-1 text-xs text-[rgba(36,119,54,0.72)]">{isArabic ? t('العربية فعالة الآن', 'Arabic is active now') : t('الإنجليزية فعالة الآن', 'English is active now')}</p>
                                </div>
                                <button
                                    onClick={() => setPortalLang(prev => prev === 'ar' ? 'en' : 'ar')}
                                    className="rounded-full border border-[rgba(127,142,106,0.2)] bg-[rgba(7,127,91,0.08)] px-4 py-2 text-xs font-semibold text-[var(--lumos-primary)] transition-colors hover:bg-[rgba(7,127,91,0.12)]"
                                >
                                    {isArabic ? 'EN' : 'AR'}
                                </button>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/88 p-4">
                            <Field label="Timezone">
                                <select
                                    value={profileData?.timezone || 'UTC'}
                                    onChange={e => setProfileData(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-card"
                                >
                                    {PRESET_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                </select>
                            </Field>
                        </div>

                        <button
                            onClick={() => setShowShortcutHelp(true)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold border border-border text-foreground bg-background hover:bg-muted/40"
                        >
                            {t('عرض اختصارات لوحة المفاتيح', 'View Keyboard Shortcuts')}
                        </button>
                    </div>
                </SectionCard>

                <SectionCard title={t('الحالة والمزامنة', 'State & Sync')} icon={Activity}>
                    <div className="space-y-4">
                        <div className={`rounded-[24px] border px-4 py-4 ${syncTone}`}>
                            <p className="text-sm font-semibold">{syncMessage}</p>
                            <p className="mt-1 text-xs opacity-80">{hasUnsavedChanges ? t('ما زالت هناك تغييرات بانتظار المزامنة.', 'There are still changes waiting to sync.') : t('الملف محدث حالياً.', 'Your profile is currently up to date.')}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-3">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.56)]">{t('آخر حفظ', 'Last save')}</p>
                                <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{lastSavedAt ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('لم يتم الحفظ بعد', 'No manual save yet')}</p>
                            </div>
                            <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-3">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.56)]">{t('الاتصال', 'Connection')}</p>
                                <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{isOnline ? t('متصل', 'Online') : t('غير متصل', 'Offline')}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button onClick={saveProfile} disabled={saving} className="rounded-xl text-white" style={{ backgroundColor: themeAccent }}>
                                {saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save changes')}
                            </Button>
                            <Button variant="outline" onClick={() => void persistProfile('manual')} disabled={!isOnline || saving} className="rounded-xl">
                                {t('مزامنة الآن', 'Sync now')}
                            </Button>
                        </div>
                    </div>
                </SectionCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <SectionCard title={t('الوصول والأمان', 'Access & Security')} icon={Settings}>
                    <div className="space-y-3">
                        <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-4">
                            <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('جلسة العميل الحالية', 'Current client session')}</p>
                            <p className="mt-1 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{t('استخدم تسجيل الخروج عند إنهاء العمل من الأجهزة المشتركة أو العامة.', 'Use sign out when you finish work on shared or public devices.')}</p>
                        </div>
                        <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-4">
                            <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('إشعارات التفاعل', 'Engagement notifications')}</p>
                            <p className="mt-1 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{t('سيتم لاحقاً توسيع هذا الجزء ليشمل الأولوية، الهدوء الليلي، والتنبيهات متعددة القنوات.', 'This area is ready for future notification priority, quiet hours, and multi-channel controls.')}</p>
                        </div>
                    </div>
                </SectionCard>

                <div className="space-y-6">
                    <SectionCard title="Current Package" icon={Activity}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <p className="text-lg font-bold text-foreground">{clientData?.package_name || 'Custom Plan'}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{statusLabel} subscription</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase shrink-0 ${statusPillClass}`}>{statusLabel}</span>
                        </div>
                        {clientData?.package_details && Object.keys(clientData.package_details).length > 0 && (
                            <div className="border-t border-slate-100 pt-4 space-y-2">
                                {Object.entries(clientData.package_details).map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                                        <span className="font-medium text-foreground">{String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <div className="hidden sm:block">
                        <SectionCard title={t('متابعة طلبات التسعير', 'Pricing Request Follow-up')} icon={FileText}>
                            {latestPricingRequests.length > 0 ? (
                                <div className="space-y-3">
                                    {latestPricingRequests.map((request) => {
                                        const meta = pricingRequestMeta(request.status);
                                        const summary = request.request_type === 'package'
                                            ? (request.package_name || t('باقة جاهزة', 'Ready Package'))
                                            : t(`${request.selected_services.length} خدمة مختارة`, `${request.selected_services.length} selected services`);
                                        const canEditRequest = request.status !== 'converted';

                                        return (
                                            <div key={request.id} className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-[var(--lumos-dark)]">{summary}</p>
                                                        <p className="mt-1 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{meta.note}</p>
                                                    </div>
                                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.pill}`}>{meta.label}</span>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[rgba(36,119,54,0.68)]">
                                                    <span>{t('أُرسل في', 'Submitted on')} {new Date(request.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB')}</span>
                                                    <span className="font-semibold text-[var(--lumos-dark)]">{request.estimated_total.toLocaleString()} EGP</span>
                                                </div>

                                                {request.selected_services.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {request.selected_services.map((service) => (
                                                            <span
                                                                key={`${request.id}-${service.id}`}
                                                                className="rounded-full border border-[rgba(7,127,91,0.14)] bg-[rgba(7,127,91,0.06)] px-3 py-1 text-[11px] font-semibold text-[#176247]"
                                                            >
                                                                {isArabic ? service.nameAr : service.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {request.request_notes && (
                                                    <div className="mt-3 rounded-[18px] border border-[rgba(127,142,106,0.16)] bg-[rgba(244,246,243,0.9)] px-3 py-3 text-xs leading-6 text-[rgba(36,119,54,0.78)]">
                                                        {request.request_notes}
                                                    </div>
                                                )}

                                                <div className="mt-3 flex items-center justify-between gap-3">
                                                    <span className="text-[11px] text-[rgba(36,119,54,0.65)]">
                                                        {request.updated_at && request.updated_at !== request.created_at
                                                            ? t('آخر تعديل', 'Last updated') + ' ' + new Date(request.updated_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB')
                                                            : t('يمكنك فتح الطلب لتعديل التفاصيل وإعادة إرساله.', 'You can reopen this request, edit its details, and resubmit it.')}
                                                    </span>
                                                    {canEditRequest && (
                                                        <button
                                                            type="button"
                                                            onClick={() => reopenPricingRequest(request)}
                                                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(7,127,91,0.18)] bg-[rgba(7,127,91,0.08)] px-3 py-1.5 text-xs font-semibold text-[#077F5B] transition-colors hover:bg-[rgba(7,127,91,0.14)]"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" /> {t('تعديل الطلب', 'Edit Request')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-white/88 px-4 py-4">
                                    <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('لا توجد طلبات تسعير محفوظة بعد', 'No pricing requests saved yet')}</p>
                                    <p className="mt-1 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{t('عند إرسال طلب من نافذة الأسعار سيظهر هنا مع حالته ومتابعته.', 'When you submit a request from the pricing modal, it will appear here with its review status.')}</p>
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    <button
                        onClick={signOut}
                        className="flex items-center justify-center gap-2 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                    >
                        <LogOut className="w-4 h-4" /> {t('تسجيل الخروج', 'Sign Out')}
                    </button>
                </div>
            </div>
        </div>
    );

    const tabPanels: Record<TabId, React.ReactNode> = {
        home: tabHome,
        library: tabLibrary,
        brand: tabBrand,
        account: tabAccount,
    };

    const tabSurfaceMap: Record<TabId, { eyebrow: string; description: string; gradient: string; accent: string }> = {
        home: {
            eyebrow: t('مركز العميل', 'Client Workspace'),
            description: t('ابدأ من الهوية، تحرّك عبر الإجراءات السريعة، واعرف ما يحتاج قراراً منك الآن.', 'Start from identity, move through quick actions, and see what needs your decision right now.'),
            gradient: 'linear-gradient(135deg, rgba(7,127,91,0.14) 0%, rgba(255,255,255,0.98) 58%, rgba(214,230,219,0.88) 100%)',
            accent: 'rgba(7,127,91,0.18)',
        },
        library: {
            eyebrow: t('مكتبة العمل', 'Library Layer'),
            description: t('اعرض الملفات والتصاميم معاً في تجربة أسهل للمراجعة والتنزيل والمتابعة.', 'Review files and designs together in a cleaner, more action-ready library experience.'),
            gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(255,255,255,0.98) 60%, rgba(254,243,199,0.92) 100%)',
            accent: 'rgba(245,158,11,0.18)',
        },
        brand: {
            eyebrow: t('هوية العلامة', 'Brand System'),
            description: t('الشعار والألوان والنبرة البصرية ضمن مساحة أقرب إلى studio board.', 'Manage logo, colors, and visual identity in a more studio-like surface.'),
            gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(255,255,255,0.98) 56%, rgba(237,233,254,0.92) 100%)',
            accent: 'rgba(139,92,246,0.18)',
        },
        account: {
            eyebrow: t('التحكم بالحساب', 'Account Controls'),
            description: t('أدر اللغة والمظهر والمزامنة والوصول من مساحة منفصلة عن الهوية والبراند.', 'Manage language, appearance, sync, and access in a dedicated layer separate from identity and brand.'),
            gradient: 'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(255,255,255,0.98) 56%, rgba(204,251,241,0.9) 100%)',
            accent: 'rgba(20,184,166,0.18)',
        },
    };

    const activeSurface = tabSurfaceMap[tab];

    //  Render 
    return (
        <div
            lang={portalLang}
            dir={isArabic ? 'rtl' : 'ltr'}
            className={`min-h-screen bg-[#f4f6f3] text-foreground selection:bg-emerald-100 relative overflow-x-hidden ${portalThemeClass}`}
            style={
                {
                    '--lumos-light': '#F4F6F3',
                    '--lumos-dark': '#1E1E1E',
                    '--lumos-primary': '#077F5B',
                    '--lumos-secondary': '#247736',
                    '--lumos-moss': '#7F8E6A',
                } as React.CSSProperties
            }
        >
            <a href="#client-profile-main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-card focus:border focus:border-border focus:px-3 focus:py-2 focus:rounded-lg">
                {t('تخطي إلى محتوى البروفايل', 'Skip to profile content')}
            </a>
            <EnhancedNavbar />

            <div className="sr-only" aria-live="polite">{syncMessage}</div>

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(circle_at_top,rgba(7,127,91,0.16),transparent_58%)]" />
                <div className="absolute -top-20 left-[-8%] h-[360px] w-[360px] rounded-full blur-3xl" style={{ background: `${themeAccent}16` }} />
                <div className="absolute right-[-8%] top-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(127,142,106,0.18),transparent_68%)] blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-[260px] w-[460px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,119,54,0.08),transparent_70%)] blur-3xl" />
            </div>

            <div id="client-profile-main" className="relative mx-auto max-w-6xl px-3 pb-44 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">

                <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex items-center gap-3 self-start rounded-[24px] border border-[rgba(127,142,106,0.22)] bg-white/82 px-4 py-3 shadow-[0_16px_40px_rgba(36,119,54,0.06)] backdrop-blur-xl sm:gap-4 sm:rounded-full">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(7,127,91,0.14)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(226,239,231,0.94)_100%)] shadow-inner">
                            <Sparkles className="h-5 w-5 text-[var(--lumos-primary)]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(36,119,54,0.58)]">LUMOS CLIENT</p>
                            <p className="text-[13px] leading-5 text-[rgba(36,119,54,0.9)] sm:text-sm">Quiet control across messages, files, designs, and brand.</p>
                        </div>
                    </div>

                    <div className="flex w-full items-center gap-2 self-start sm:w-auto sm:gap-3 sm:self-auto">
                        <div className="inline-flex min-w-0 flex-1 items-center gap-3 rounded-full border border-[rgba(127,142,106,0.22)] bg-white/82 px-3 py-2 shadow-[0_16px_36px_rgba(36,119,54,0.06)] backdrop-blur-xl sm:flex-none">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(7,127,91,0.16)_0%,rgba(36,119,54,0.08)_100%)] text-sm font-semibold text-[var(--lumos-primary)]">
                                {(displayName || client.username).slice(0, 2).toUpperCase()}
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(36,119,54,0.56)]">Client Badge</span>
                                <span className="block truncate text-sm font-semibold text-[var(--lumos-dark)]">{client.username}</span>
                            </span>
                        </div>

                        <button
                            onClick={signOut}
                            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[rgba(127,142,106,0.24)] bg-white/82 px-4 text-sm font-medium text-[var(--lumos-dark)] shadow-[0_12px_30px_rgba(36,119,54,0.05)] backdrop-blur-xl transition-colors hover:bg-white sm:justify-start"
                        >
                            <LogOut className="h-4 w-4 text-[var(--lumos-primary)]" />
                            <span className="hidden sm:inline">{t('تسجيل الخروج', 'Sign out')}</span>
                        </button>
                    </div>
                </header>

                <section className="mb-6 grid gap-4 lg:mb-8 lg:gap-5 xl:grid-cols-[minmax(0,1.18fr)_380px]">
                    <div className="overflow-hidden rounded-[28px] border border-[rgba(127,142,106,0.24)] bg-white/80 shadow-[0_24px_64px_rgba(36,119,54,0.1)] backdrop-blur-2xl sm:rounded-[38px] sm:shadow-[0_36px_100px_rgba(36,119,54,0.1)]">
                        <div
                            className="h-24 sm:h-32"
                            style={profileData?.cover_gradient ? { background: resolveCoverGradient(profileData.cover_gradient) } : { background: 'linear-gradient(135deg, #edf6ef 0%, #dcebe2 48%, #eff6f1 100%)' }}
                        />
                        <div className="relative px-4 pb-5 pt-4 sm:px-7 sm:pb-6">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                <div className="flex items-start gap-4 sm:gap-5">
                                    <div className="relative -mt-14 h-24 w-24 shrink-0 sm:-mt-16 sm:h-28 sm:w-28">
                                        <div className="absolute inset-[-12px] rounded-full bg-[radial-gradient(circle,rgba(7,127,91,0.22),transparent_70%)] blur-2xl" />
                                        <div className="relative h-full w-full overflow-hidden rounded-full border-[4px] border-white bg-white/95 shadow-[0_24px_60px_rgba(7,127,91,0.18)]">
                                            {avatarUrl
                                                ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                                : <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#edf3ee_100%)] text-[rgba(36,119,54,0.6)]"><User className="h-10 w-10" /></div>
                                            }
                                        </div>
                                    </div>

                                    <div className="min-w-0 pt-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(36,119,54,0.58)]">{t('سطح الهوية', 'Identity Deck')}</p>
                                        <h1 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-[var(--lumos-dark)] sm:text-4xl">{displayName}</h1>
                                        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[rgba(36,119,54,0.84)] sm:mt-3 sm:text-[15px] sm:leading-7">
                                            {profileData?.tagline || company || t('هوية أوضح ومساحة أسرع للتحكم في التعاون والبراند والمكتبة من مكان واحد.', 'A clearer identity surface and faster workspace for collaboration, brand, and library control in one place.')}
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            {clientData?.package_name && (
                                                <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(7,127,91,0.14)] bg-[rgba(7,127,91,0.08)] px-3 py-1.5 text-xs font-medium text-[var(--lumos-dark)] sm:px-4 sm:py-2 sm:text-sm">
                                                    <Sparkles className="h-4 w-4 text-[var(--lumos-primary)]" />
                                                    {clientData.package_name}
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm sm:px-4 sm:py-2 sm:text-sm ${statusPillClass}`}>
                                                {statusLabel}
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(127,142,106,0.22)] bg-white px-3 py-1.5 text-xs text-[var(--lumos-dark)] shadow-sm sm:px-4 sm:py-2 sm:text-sm">
                                                <Activity className="h-4 w-4 text-[var(--lumos-primary)]" />
                                                {guideLabel}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                                            <Button onClick={() => setShowIdentityEditor(true)} className="h-11 rounded-2xl text-white sm:rounded-full" style={{ backgroundColor: themeAccent }}>
                                                <User className="h-4 w-4" /> {t('تعديل الهوية', 'Edit profile')}
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowPhotoManager(true)} className="h-11 rounded-2xl sm:rounded-full">
                                                <Camera className="h-4 w-4" /> {t('تغيير الصورة', 'Change photo')}
                                            </Button>
                                            <Button variant="outline" onClick={() => { setAssistantMode('team'); setShowQuickMessage(true); }} className="h-11 rounded-2xl sm:rounded-full">
                                                <MessageCircle className="h-4 w-4" /> {t('فتح الشات', 'Open chat')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:max-w-[360px] lg:grid-cols-1 xl:grid-cols-3">
                                    <div className="min-w-[148px] rounded-[22px] border border-[rgba(127,142,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(239,246,241,0.92)_100%)] px-4 py-3 sm:min-w-0 sm:rounded-[24px]">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-[rgba(36,119,54,0.56)]">{t('الردود', 'Replies')}</p>
                                        <p className="mt-2 text-2xl font-semibold text-[var(--lumos-dark)]">{adminMessageCount}</p>
                                    </div>
                                    <div className="min-w-[190px] rounded-[22px] border border-[rgba(127,142,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,244,233,0.94)_100%)] px-4 py-3 sm:min-w-0 sm:rounded-[24px]">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-[rgba(120,95,30,0.72)]">{t('الأولوية', 'Priority')}</p>
                                        <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{attentionItems[0]?.title || t('لا يوجد عاجل', 'Nothing urgent')}</p>
                                    </div>
                                    <div className="min-w-[190px] rounded-[22px] border border-[rgba(127,142,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(237,243,251,0.94)_100%)] px-4 py-3 sm:min-w-0 sm:rounded-[24px]">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-[rgba(36,88,119,0.72)]">{t('آخر تحديث', 'Latest update')}</p>
                                        <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{latestUpdate?.title || t('لا توجد تحديثات بعد', 'No updates yet')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-[rgba(127,142,106,0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(239,245,241,0.95)_100%)] p-4 shadow-[0_22px_60px_rgba(36,119,54,0.1)] backdrop-blur-2xl sm:rounded-[38px] sm:p-6 sm:shadow-[0_30px_90px_rgba(36,119,54,0.1)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(36,119,54,0.58)]">{t('طبقة الإجراءات', 'Utility Layer')}</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--lumos-dark)]">{t('أوامر جاهزة للحركة', 'Controls Ready to Move')}</h2>
                                <p className="mt-2 text-sm leading-7 text-[rgba(36,119,54,0.8)]">
                                    {t('تحكم في اللغة والمظهر والمزامنة وافتح طبقات التعديل السريعة بدون النزول إلى قسم الحساب.', 'Control language, appearance, sync, and quick-edit overlays without digging into the account section.')}
                                </p>
                            </div>
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(7,127,91,0.14)] bg-[rgba(7,127,91,0.08)] text-[var(--lumos-primary)]">
                                <Settings className="h-5 w-5" />
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-[24px] border border-[rgba(127,142,106,0.18)] bg-white/92 px-4 py-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('لغة البوابة', 'Portal Language')}</p>
                                        <p className="mt-1 text-xs text-[rgba(36,119,54,0.72)]">{isArabic ? t('العربية مفعلة الآن', 'Arabic is currently active') : t('الإنجليزية مفعلة الآن', 'English is currently active')}</p>
                                    </div>
                                    <button
                                        onClick={() => setPortalLang(prev => prev === 'ar' ? 'en' : 'ar')}
                                        className="rounded-full border border-[rgba(127,142,106,0.2)] bg-[rgba(7,127,91,0.08)] px-4 py-2 text-xs font-semibold text-[var(--lumos-primary)] transition-colors hover:bg-[rgba(7,127,91,0.12)]"
                                    >
                                        {isArabic ? 'EN' : 'AR'}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-[rgba(127,142,106,0.18)] bg-white/92 px-4 py-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('نمط العرض', 'Display Mode')}</p>
                                        <p className="mt-1 text-xs text-[rgba(36,119,54,0.72)]">{portalThemeMode === 'brand' ? t('هوية العلامة', 'Brand mode') : portalThemeMode === 'high-contrast' ? t('تباين أعلى', 'High contrast') : t('الوضع الافتراضي', 'Default mode')}</p>
                                    </div>
                                    <button
                                        onClick={() => setPortalThemeMode(prev => prev === 'default' ? 'brand' : prev === 'brand' ? 'high-contrast' : 'default')}
                                        className="rounded-full border border-[rgba(127,142,106,0.2)] bg-[rgba(36,119,54,0.08)] px-4 py-2 text-xs font-semibold text-[var(--lumos-secondary)] transition-colors hover:bg-[rgba(36,119,54,0.12)]"
                                    >
                                        {t('تبديل', 'Cycle')}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    onClick={() => setShowBrandDrawer(true)}
                                    className="rounded-[24px] border border-[rgba(127,142,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,248,246,0.92)_100%)] px-4 py-4 text-left transition-all hover:border-[rgba(7,127,91,0.22)] hover:shadow-[0_16px_30px_rgba(36,119,54,0.08)]"
                                >
                                    <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('تعديل العلامة بسرعة', 'Quick brand edit')}</p>
                                    <p className="mt-1 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{t('عدّل الشعار واللون الرئيسي والرابط من drawer سريعة.', 'Adjust logo, primary color, and website from a faster drawer.')}</p>
                                </button>
                                <button
                                    onClick={() => setTab('account')}
                                    className="rounded-[24px] border border-[rgba(127,142,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(251,245,243,0.94)_100%)] px-4 py-4 text-left transition-all hover:border-[rgba(180,83,9,0.2)] hover:shadow-[0_16px_30px_rgba(180,83,9,0.08)]"
                                >
                                    <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('افتح الحساب', 'Open account')}</p>
                                    <p className="mt-1 text-xs leading-6 text-[rgba(120,72,24,0.76)]">{t('اذهب إلى طبقة التفضيلات والأمان والمزامنة التفصيلية.', 'Go to your deeper preferences, access, and sync controls.')}</p>
                                </button>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <button
                                onClick={() => void persistProfile('manual')}
                                disabled={!isOnline || saving}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(127,142,106,0.22)] bg-white px-4 py-3 text-sm font-semibold text-[var(--lumos-dark)] transition-colors hover:bg-[#f8fbf7] disabled:opacity-50"
                            >
                                <RotateCcw className="h-4 w-4 text-[var(--lumos-primary)]" />
                                {t('مزامنة الآن', 'Sync now')}
                            </button>
                            <button
                                onClick={saveProfile}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(7,127,91,0.18)] disabled:opacity-60"
                                style={{ backgroundColor: themeAccent }}
                            >
                                <Save className="h-4 w-4" />
                                {saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save changes')}
                            </button>
                        </div>
                    </div>
                </section>

                {!loading && !fetchError && (
                    <div className="-mx-1 mb-6 flex gap-3 overflow-x-auto px-1 pb-1 sm:hidden">
                        {[
                            { label: t('التقدّم', 'Progress'), value: `${progress}%`, tone: 'from-emerald-50 to-white' },
                            { label: t('التصاميم', 'Designs'), value: String(designs.length), tone: 'from-amber-50 to-white' },
                            { label: t('الملفات', 'Files'), value: String(assets.length), tone: 'from-sky-50 to-white' },
                            { label: t('المتبقي', 'Remaining'), value: String(remainingChecklistCount), tone: 'from-rose-50 to-white' },
                        ].map(item => (
                            <div
                                key={item.label}
                                className={`min-w-[136px] rounded-[22px] border border-[rgba(127,142,106,0.16)] bg-gradient-to-br ${item.tone} px-4 py-3 shadow-[0_10px_24px_rgba(36,119,54,0.06)]`}
                            >

                                {!loading && !fetchError && (
                                    <section className="mb-6 sm:hidden">
                                        <button
                                            type="button"
                                            onClick={() => setShowMobileRequestSheet(true)}
                                            className="w-full rounded-[28px] border border-[rgba(127,142,106,0.18)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(241,247,243,0.96)_54%,rgba(230,240,235,0.94)_100%)] px-4 py-4 text-left shadow-[0_18px_44px_rgba(36,119,54,0.08)]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('طلبي الحالي', 'My current request')}</p>
                                                    <p className="mt-2 text-base font-semibold leading-7 text-[var(--lumos-dark)]">
                                                        {featuredPricingRequestSummary || clientData?.package_name || t('لا يوجد طلب محفوظ بعد', 'No saved request yet')}
                                                    </p>
                                                    <p className="mt-2 text-xs leading-6 text-[rgba(36,119,54,0.72)]">
                                                        {featuredPricingRequestMeta?.note || clientData?.next_steps || t('افتح الملخص لمعرفة الحالة، التقدم، والخطوة التالية بدون زحمة.', 'Open the summary to see status, progress, and the next step without clutter.')}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${featuredPricingRequestMeta?.pill || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {featuredPricingRequestMeta?.label || statusLabel}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 text-xs text-[rgba(36,119,54,0.68)]">
                                                    <span className="rounded-full bg-white/90 px-2.5 py-1 font-semibold text-[var(--lumos-dark)]">{progress}%</span>
                                                    <span>{t('التقدم الحالي', 'Current progress')}</span>
                                                </div>
                                                <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(7,127,91,0.16)] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#077F5B]">
                                                    {t('عرض التفاصيل', 'View details')}
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </span>
                                            </div>
                                        </button>
                                    </section>
                                )}

                                {!loading && !fetchError && (
                                    <section className="mb-6 hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-4">
                                        {[
                                            {
                                                label: t('الخطوة التالية', 'Next Step'),
                                                value: clientData?.next_steps || t('حدّد أولوية جديدة مع الفريق', 'Set a new priority with the team'),
                                                sub: t('أقرب شيء يحتاج متابعة الآن', 'The nearest item that needs follow-up now'),
                                                tone: 'from-amber-50 via-white to-orange-50',
                                                accent: 'text-amber-700',
                                            },
                                            {
                                                label: t('حالة آخر أوردر', 'Latest Order'),
                                                value: latestOrder ? latestOrderMeta.label : t('لا يوجد أوردر بعد', 'No orders yet'),
                                                sub: latestOrder ? `${latestOrder.total_price.toLocaleString()} EGP${latestOrder.package_type ? ` • ${latestOrder.package_type}` : ''}` : t('سيظهر أحدث أوردر هنا تلقائياً', 'The newest order will appear here automatically'),
                                                tone: 'from-sky-50 via-white to-cyan-50',
                                                accent: latestOrder ? latestOrderMeta.tone.split(' ')[1] : 'text-slate-600',
                                            },
                                            {
                                                label: t('التقدم الحالي', 'Current Progress'),
                                                value: `${progress}%`,
                                                sub: t('نسبة التقدم داخل التنفيذ الحالي', 'Delivery progress across the current execution'),
                                                tone: 'from-emerald-50 via-white to-teal-50',
                                                accent: 'text-emerald-700',
                                            },
                                            {
                                                label: t('الباقة الحالية', 'Current Package'),
                                                value: clientData?.package_name || t('Custom Plan', 'Custom Plan'),
                                                sub: statusLabel,
                                                tone: 'from-violet-50 via-white to-indigo-50',
                                                accent: 'text-violet-700',
                                            },
                                        ].map(card => (
                                            <div key={card.label} className={`rounded-[24px] border border-[rgba(127,142,106,0.18)] bg-gradient-to-br ${card.tone} px-4 py-4 shadow-[0_14px_34px_rgba(36,119,54,0.07)]`}>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{card.label}</p>
                                                <p className={`mt-2 text-base font-semibold leading-7 ${card.accent}`}>{card.value}</p>
                                                <p className="mt-2 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{card.sub}</p>
                                            </div>
                                        ))}
                                    </section>
                                )}
                                <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.54)]">{item.label}</p>
                                <p className="mt-2 text-xl font-semibold text-[var(--lumos-dark)]">{item.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !fetchError && (
                    <div className={`mb-6 rounded-[24px] border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm ${syncTone}`}>
                        <div className="text-xs sm:text-sm font-medium flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${syncState === 'saving' ? `${prefersReducedMotion ? '' : 'animate-pulse'} bg-sky-500` : syncState === 'error' ? 'bg-red-500' : syncState === 'queued' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span>{syncMessage}</span>
                            {hasUnsavedChanges && <span className="text-[11px] opacity-80">{t('يوجد تغييرات غير محفوظة', 'Unsaved changes pending')}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            {!isOnline && <span className="text-[11px] font-semibold opacity-80">{t('غير متصل', 'Offline')}</span>}
                            {(syncState === 'error' || syncState === 'queued' || hasUnsavedChanges) && (
                                <button
                                    onClick={() => void persistProfile('manual')}
                                    disabled={!isOnline || saving}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-current/30 disabled:opacity-50"
                                >
                                    {t('مزامنة الآن', 'Sync now')}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/*  Content  */}
                {loading ? (
                    <div className="space-y-4 py-6 animate-pulse">
                        <div className="h-28 rounded-2xl bg-muted/60" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="h-24 rounded-2xl bg-muted/50" />
                            <div className="h-24 rounded-2xl bg-muted/50" />
                            <div className="h-24 rounded-2xl bg-muted/50" />
                            <div className="h-24 rounded-2xl bg-muted/50" />
                        </div>
                        <div className="h-48 rounded-2xl bg-muted/50" />
                    </div>
                ) : fetchError ? (
                    <div className="bg-white/84 rounded-[28px] border border-[rgba(127,142,106,0.18)] shadow-[0_20px_60px_rgba(36,119,54,0.08)] p-8 text-center backdrop-blur-xl">
                        <p className="text-base font-semibold text-foreground mb-1">{t('مشكلة في المزامنة', 'Sync issue')}</p>
                        <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
                        <Button onClick={() => client && fetchEverything(client.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                            <RotateCcw className="w-4 h-4 mr-2" /> {t('إعادة المحاولة', 'Retry Sync')}
                        </Button>
                    </div>
                ) : (
                    <section className="space-y-6">
                        <div className="hidden rounded-[34px] border border-[rgba(127,142,106,0.22)] bg-white/88 p-4 shadow-[0_24px_70px_rgba(36,119,54,0.09)] backdrop-blur-xl sm:block">
                            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3">
                                {localizedTabs.map(tItem => {
                                    const Icon = tItem.icon;
                                    const active = tab === tItem.id;
                                    const badge = getTabBadge(tItem.id);
                                    return (
                                        <button
                                            key={tItem.id}
                                            id={`tab-${tItem.id}`}
                                            role="tab"
                                            aria-selected={active}
                                            aria-controls={`panel-${tItem.id}`}
                                            onClick={() => setTab(tItem.id)}
                                            className={`group flex min-w-[228px] snap-start items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition-all md:min-w-0 md:w-full md:rounded-[24px] md:px-4 md:py-4 ${active ? 'border-[rgba(7,127,91,0.34)] bg-[linear-gradient(135deg,rgba(7,127,91,0.12)_0%,rgba(255,255,255,0.98)_58%,rgba(225,239,230,0.96)_100%)] shadow-[0_18px_36px_rgba(7,127,91,0.12)]' : 'border-[rgba(127,142,106,0.16)] bg-white/84 hover:border-[rgba(7,127,91,0.24)] hover:bg-white hover:shadow-[0_14px_28px_rgba(36,119,54,0.06)]'}`}
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border md:h-11 md:w-11 ${active ? 'border-[rgba(7,127,91,0.16)] bg-[rgba(7,127,91,0.12)] text-[var(--lumos-primary)]' : 'border-[rgba(127,142,106,0.14)] bg-[rgba(127,142,106,0.08)] text-[rgba(36,119,54,0.72)] group-hover:bg-[rgba(7,127,91,0.08)]'}`}>
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold text-[var(--lumos-dark)]">{tItem.label}</span>
                                                    <span className="mt-0.5 block text-xs leading-5 text-[rgba(36,119,54,0.72)] md:truncate">{tItem.hint}</span>
                                                </span>
                                            </span>
                                            {badge > 0 && <span className="rounded-full bg-[rgba(7,127,91,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--lumos-primary)]">{badge}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
                            <div className="min-w-0 rounded-[26px] border border-[rgba(127,142,106,0.22)] p-4 shadow-[0_18px_46px_rgba(36,119,54,0.1)] backdrop-blur-xl sm:rounded-[36px] sm:p-7 sm:shadow-[0_28px_80px_rgba(36,119,54,0.1)]" style={{ background: activeSurface.gradient }}>
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(36,119,54,0.58)]">{activeSurface.eyebrow}</p>
                                        <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--lumos-dark)] sm:text-[2rem]">{activeTabMeta.label}</h2>
                                        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[rgba(36,119,54,0.84)] sm:mt-3 sm:text-sm sm:leading-7">{activeSurface.description}</p>
                                    </div>

                                    <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/80 bg-white/90 px-3.5 py-2 text-xs font-medium text-[var(--lumos-dark)] shadow-sm sm:px-4 sm:text-sm">
                                        <CheckCircle className="h-4 w-4 text-[var(--lumos-primary)]" />
                                        {activeTabMeta.hint}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[26px] border border-[rgba(127,142,106,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(240,246,242,0.94)_100%)] p-4 shadow-[0_18px_44px_rgba(36,119,54,0.08)] backdrop-blur-xl sm:rounded-[36px] sm:p-5 sm:shadow-[0_24px_70px_rgba(36,119,54,0.08)]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(36,119,54,0.56)]">{t('لقطة المساحة', 'Workspace Snapshot')}</p>
                                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                                    <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/86 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('التقدم', 'Progress')}</p>
                                        <p className="mt-1 text-xl font-semibold text-[var(--lumos-dark)]">{progress}%</p>
                                    </div>
                                    <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/86 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('المتبقي', 'Remaining')}</p>
                                        <p className="mt-1 text-xl font-semibold text-[var(--lumos-dark)]">{remainingChecklistCount}</p>
                                    </div>
                                    <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/86 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('الملفات', 'Files')}</p>
                                        <p className="mt-1 text-xl font-semibold text-[var(--lumos-dark)]">{assets.length}</p>
                                    </div>
                                    <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/86 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('الرسائل', 'Messages')}</p>
                                        <p className="mt-1 text-xl font-semibold text-[var(--lumos-dark)]">{adminMessageCount}</p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-[24px] border px-4 py-3" style={{ borderColor: activeSurface.accent, background: 'rgba(255,255,255,0.7)' }}>
                                    <p className="text-sm font-semibold text-[var(--lumos-dark)]">{t('حالة العمل الحالية', 'Current focus')}</p>
                                    <p className="mt-1 text-sm leading-6 text-[rgba(36,119,54,0.76)]">{activeTabMeta.hint}</p>
                                </div>
                            </div>
                        </div>

                        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="min-w-0">
                            {tabPanels[tab]}
                        </div>
                    </section>
                )}
            </div>

            <Dialog open={showIdentityEditor} onOpenChange={setShowIdentityEditor}>
                <DialogContent className="max-w-2xl rounded-[28px] border-[rgba(127,142,106,0.18)] bg-white/96 p-0">
                    <div className="p-6 sm:p-7">
                        <DialogHeader>
                            <DialogTitle>{t('تعديل الهوية', 'Edit identity')}</DialogTitle>
                            <DialogDescription>{t('حدّث الاسم الظاهر، السطر التعريفي، والمنطقة الزمنية من overlay سريعة.', 'Update the visible name, short intro, and timezone from a faster overlay.')}</DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <Field label="Display Name">
                                <input
                                    type="text"
                                    value={profileData?.display_name || ''}
                                    onChange={e => setProfileData(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                                    placeholder={client.username}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </Field>
                            <Field label="Headline / Tagline">
                                <input
                                    type="text"
                                    value={profileData?.tagline || ''}
                                    onChange={e => setProfileData(prev => prev ? { ...prev, tagline: e.target.value } : null)}
                                    placeholder="Short profile positioning"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </Field>
                            <div className="sm:col-span-2">
                                <Field label="Timezone">
                                    <select
                                        value={profileData?.timezone || 'UTC'}
                                        onChange={e => setProfileData(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-card"
                                    >
                                        {PRESET_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setShowIdentityEditor(false)}>{t('إغلاق', 'Close')}</Button>
                            <Button onClick={async () => { await saveProfile(); setShowIdentityEditor(false); }} className="text-white" style={{ backgroundColor: themeAccent }}>
                                {t('حفظ الهوية', 'Save identity')}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Sheet open={showQuickMessage} onOpenChange={setShowQuickMessage}>
                <SheetContent side={isArabic ? 'left' : 'right'} className="w-[92vw] border-none bg-transparent p-2 shadow-none sm:w-[380px] sm:p-3">
                    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-[rgba(127,142,106,0.18)] bg-[rgba(255,255,255,0.98)] shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl">
                        <SheetHeader className="border-b border-[rgba(127,142,106,0.12)] px-4 py-4 text-left">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(7,127,91,0.1)] text-[var(--lumos-primary)]">
                                    {assistantMode === 'assistant' ? <Bot className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <SheetTitle className="text-base text-[var(--lumos-dark)]">{assistantMode === 'assistant' ? t('Lumos Assistant', 'Lumos Assistant') : t('Team Chat', 'Team Chat')}</SheetTitle>
                                            <SheetDescription className="mt-1 text-xs leading-5 text-slate-500">
                                                {assistantMode === 'assistant'
                                                    ? t('شريط جانبي صغير للمساعدة السريعة.', 'A compact sidebar for quick help.')
                                                    : t('شريط جانبي سريع للرسائل مع الفريق.', 'A compact sidebar for team messages.')}
                                            </SheetDescription>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowQuickMessage(false)}
                                            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                            aria-label={t('إغلاق', 'Close')}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-3 inline-flex rounded-full border border-[rgba(127,142,106,0.16)] bg-[rgba(244,248,245,0.9)] p-1">
                                        <button
                                            type="button"
                                            onClick={() => setAssistantMode('assistant')}
                                            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${assistantMode === 'assistant' ? 'bg-[var(--lumos-primary)] text-white shadow-sm' : 'text-slate-600'}`}
                                        >
                                            {t('المساعد', 'Assistant')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAssistantMode('team')}
                                            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${assistantMode === 'team' ? 'bg-[var(--lumos-primary)] text-white shadow-sm' : 'text-slate-600'}`}
                                        >
                                            {t('الفريق', 'Team')}
                                        </button>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                        {assistantMode === 'assistant' ? (
                                            <>
                                                <span className="rounded-full bg-[rgba(7,127,91,0.08)] px-2.5 py-1 font-semibold text-[rgba(36,119,54,0.78)]">{t('AI فوري', 'Instant AI')}</span>
                                                <span>{t('يعتمد على التقدّم والملفات والخطوة التالية داخل حسابك.', 'Uses your progress, files, and next step inside your account.')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="rounded-full bg-[rgba(15,23,42,0.06)] px-2.5 py-1 font-semibold text-slate-700">{t('فريق حقيقي', 'Real team')}</span>
                                                <span>{latestAdminMessage
                                                    ? t(`آخر رد وصل ${new Date(latestAdminMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, `Last reply arrived at ${new Date(latestAdminMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
                                                    : t('أي رسالة هنا تذهب مباشرة للفريق.', 'Any message here goes directly to the team.')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,rgba(248,251,249,0.9)_0%,rgba(255,255,255,0.98)_100%)]">
                            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
                                {assistantMode === 'assistant' ? (
                                    <div className="space-y-3">
                                        <div className="rounded-[20px] border border-[rgba(7,127,91,0.14)] bg-[rgba(236,247,241,0.72)] px-3.5 py-3">
                                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(36,119,54,0.78)]">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                {t('وضع الذكاء المساعد', 'AI assistant mode')}
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                                {t('اسأل عن البراند، الملفات، أو الخطوة التالية وسأرد عليك مباشرة مع اقتراح خطوة عملية بعدها.', 'Ask about brand, files, or the next step and I will reply directly with a practical next action.')}
                                            </p>
                                        </div>
                                        <div className="space-y-2.5">
                                            {assistantMessages.map(item => (
                                                <div key={item.id} className={`flex ${item.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[86%] rounded-[18px] px-3.5 py-2.5 text-sm leading-6 ${item.sender === 'client' ? 'rounded-br-md bg-[var(--lumos-primary)] text-white' : item.tone === 'highlight' ? 'rounded-bl-md border border-[rgba(7,127,91,0.14)] bg-[rgba(236,247,241,0.96)] text-slate-900' : 'rounded-bl-md border border-[rgba(127,142,106,0.14)] bg-white text-slate-800'}`}>
                                                        <div className={`mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${item.sender === 'client' ? 'text-white/70' : 'text-[rgba(36,119,54,0.7)]'}`}>
                                                            {item.sender === 'client' ? (
                                                                <>
                                                                    <User className="h-3 w-3" />
                                                                    {t('أنت', 'You')}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Bot className="h-3 w-3" />
                                                                    {t('Lumos AI', 'Lumos AI')}
                                                                    <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] normal-case tracking-normal">{t('سياقي', 'Context-aware')}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div>{item.text}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {assistantTyping && (
                                                <div className="flex justify-start">
                                                    <div className="rounded-[18px] rounded-bl-md border border-[rgba(127,142,106,0.14)] bg-white px-3.5 py-2.5 text-sm text-slate-700">
                                                        <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(36,119,54,0.7)]">
                                                            <Bot className="h-3 w-3" />
                                                            {t('Lumos AI', 'Lumos AI')}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="h-2 w-2 rounded-full bg-[rgba(36,119,54,0.35)] animate-pulse" />
                                                            <span className="h-2 w-2 rounded-full bg-[rgba(36,119,54,0.45)] animate-pulse [animation-delay:120ms]" />
                                                            <span className="h-2 w-2 rounded-full bg-[rgba(36,119,54,0.55)] animate-pulse [animation-delay:240ms]" />
                                                            <span className="ml-1">{t('يفكر في أفضل إجابة...', 'Thinking through the best answer...')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={assistantEndRef} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        <div className="rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white px-3.5 py-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                        {t('قناة الفريق', 'Team channel')}
                                                    </div>
                                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                                        {t('هذه القناة ترسل رسائلك إلى الفريق الحقيقي. استخدمها للطلبات، المتابعة، والمراجعات.', 'This channel sends your messages to the real team. Use it for requests, follow-ups, and reviews.')}
                                                    </p>
                                                </div>
                                                <div className="rounded-full bg-[rgba(7,127,91,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[rgba(36,119,54,0.78)]">
                                                    {adminMessageCount > 0 ? t(`${adminMessageCount} ردود`, `${adminMessageCount} replies`) : t('بلا ردود', 'No replies yet')}
                                                </div>
                                            </div>
                                        </div>
                                        {messages.length === 0 ? (
                                            <div className="rounded-[18px] border border-dashed border-[rgba(127,142,106,0.18)] bg-white px-4 py-4 text-center text-sm text-slate-700">
                                                {t('ابدأ أول رسالة للفريق من هنا.', 'Start your first message to the team from here.')}
                                            </div>
                                        ) : messages.map(msg => {
                                            const mine = msg.sender === 'client';
                                            return (
                                                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[86%] rounded-[18px] px-3.5 py-2.5 text-sm leading-6 ${mine ? 'rounded-br-md bg-[var(--lumos-primary)] text-white' : 'rounded-bl-md border border-[rgba(127,142,106,0.14)] bg-white text-slate-800'}`}>
                                                        <div className={`mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${mine ? 'text-white/70' : 'text-slate-500'}`}>
                                                            {mine ? (
                                                                <>
                                                                    <User className="h-3 w-3" />
                                                                    {t('أنت', 'You')}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <MessageCircle className="h-3 w-3" />
                                                                    {t('فريق Lumos', 'Lumos Team')}
                                                                    <span className="rounded-full bg-[rgba(15,23,42,0.05)] px-1.5 py-0.5 text-[9px] normal-case tracking-normal">{t('بشري', 'Human')}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div>{msg.message}</div>
                                                        <div className={`mt-1.5 text-[10px] ${mine ? 'text-white/70' : 'text-[rgba(36,119,54,0.52)]'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {assistantMode === 'assistant' ? (
                                <div className="border-t border-[rgba(127,142,106,0.12)] px-3 py-3 sm:px-4">
                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                        {assistantQuickPrompts.slice(0, 4).map(prompt => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                onClick={() => handleAssistantPrompt(prompt)}
                                                className="rounded-full border border-[rgba(127,142,106,0.16)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:border-[rgba(7,127,91,0.24)] hover:bg-[rgba(7,127,91,0.06)]"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-[20px] border border-[rgba(127,142,106,0.18)] bg-white p-2">
                                        <input
                                            value={assistantInput}
                                            onChange={e => setAssistantInput(e.target.value)}
                                            placeholder={t('اكتب سؤالك...', 'Write your question...')}
                                            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                        <Button
                                            onClick={() => {
                                                if (!assistantInput.trim()) return;
                                                handleAssistantPrompt(assistantInput.trim());
                                                setAssistantInput('');
                                            }}
                                            disabled={!assistantInput.trim() || assistantTyping}
                                            className="h-10 rounded-[14px] px-3 text-white"
                                            style={{ backgroundColor: themeAccent }}
                                        >
                                            <WandSparkles className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-500">
                                        {t('الرد هنا من المساعد الذكي وليس من الفريق البشري.', 'Replies here come from the AI assistant, not the human team.')}
                                    </p>
                                </div>
                            ) : (
                                <div className="border-t border-[rgba(127,142,106,0.12)] px-3 py-3 sm:px-4">
                                    <div className="rounded-[20px] border border-[rgba(127,142,106,0.18)] bg-white p-2">
                                        <textarea
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            rows={2}
                                            placeholder={t('اكتب رسالتك...', 'Write your message...')}
                                            className="w-full resize-none bg-transparent px-2 py-1 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                        <div className="mt-2 flex justify-end">
                                            <Button onClick={async () => { const ok = await submitMessage(); if (ok) setAssistantMode('assistant'); }} disabled={!newMessage.trim() || isSendingMessage} className="h-10 rounded-[14px] px-3 text-white" style={{ backgroundColor: themeAccent }}>
                                                {isSendingMessage ? <span className="text-xs">...</span> : <Send className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[11px] text-slate-500">
                                        {t('هذه الرسالة تُرسل إلى فريق Lumos الحقيقي وستظهر الردود هنا.', 'This message is sent to the real Lumos team and their replies will appear here.')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={showMobileRequestSheet} onOpenChange={setShowMobileRequestSheet}>
                <SheetContent side="bottom" className="max-h-[88vh] rounded-t-[28px] border-x-0 border-b-0 border-t-[rgba(127,142,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(244,248,245,0.98)_100%)] px-0 pb-0 pt-0 sm:hidden">
                    <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-[rgba(36,119,54,0.16)]" />
                    <SheetHeader className="border-b border-[rgba(127,142,106,0.12)] px-4 py-4 text-left">
                        <SheetTitle className="text-base text-[var(--lumos-dark)]">{t('ملخص الطلب', 'Request summary')}</SheetTitle>
                        <SheetDescription className="mt-1 text-xs leading-5 text-slate-500">
                            {t('كل ما تحتاجه عن طلبك الحالي في مكان واحد بدون زحمة داخل البروفايل.', 'Everything about your current request in one place without crowding the profile.')}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 overflow-y-auto px-4 py-4">
                        <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-white/92 px-4 py-4 shadow-[0_12px_28px_rgba(36,119,54,0.06)]">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{t('الطلب الحالي', 'Current request')}</p>
                                    <p className="mt-2 text-base font-semibold text-[var(--lumos-dark)]">{featuredPricingRequestSummary || t('لا يوجد طلب تسعير محفوظ بعد', 'No saved pricing request yet')}</p>
                                    <p className="mt-2 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{featuredPricingRequestMeta?.note || t('عند إرسال طلب من نافذة الأسعار سيظهر هنا مباشرة مع حالته.', 'Once you submit a request from pricing, it will appear here with its status.')}</p>
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${featuredPricingRequestMeta?.pill || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {featuredPricingRequestMeta?.label || t('لا يوجد', 'None')}
                                </span>
                            </div>

                            {featuredPricingRequest && (
                                <>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-[18px] border border-[rgba(127,142,106,0.14)] bg-[rgba(244,248,245,0.9)] px-3 py-3">
                                            <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.54)]">{t('أُرسل في', 'Submitted')}</p>
                                            <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{new Date(featuredPricingRequest.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB')}</p>
                                        </div>
                                        <div className="rounded-[18px] border border-[rgba(127,142,106,0.14)] bg-[rgba(244,248,245,0.9)] px-3 py-3">
                                            <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.54)]">{t('الإجمالي التقديري', 'Estimated total')}</p>
                                            <p className="mt-2 text-sm font-semibold text-[var(--lumos-dark)]">{featuredPricingRequest.estimated_total.toLocaleString()} EGP</p>
                                        </div>
                                    </div>

                                    {featuredPricingRequest.selected_services.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-[11px] uppercase tracking-[0.16em] text-[rgba(36,119,54,0.54)]">{t('الخدمات المختارة', 'Selected services')}</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {featuredPricingRequest.selected_services.map((service) => (
                                                    <span
                                                        key={`${featuredPricingRequest.id}-${service.id}`}
                                                        className="rounded-full border border-[rgba(7,127,91,0.14)] bg-[rgba(7,127,91,0.06)] px-3 py-1 text-[11px] font-semibold text-[#176247]"
                                                    >
                                                        {isArabic ? service.nameAr : service.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {featuredPricingRequest.request_notes && (
                                        <div className="mt-4 rounded-[18px] border border-[rgba(127,142,106,0.16)] bg-[rgba(244,246,243,0.9)] px-3 py-3 text-xs leading-6 text-[rgba(36,119,54,0.78)]">
                                            {featuredPricingRequest.request_notes}
                                        </div>
                                    )}

                                    {featuredPricingRequest.status !== 'converted' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowMobileRequestSheet(false);
                                                reopenPricingRequest(featuredPricingRequest);
                                            }}
                                            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(7,127,91,0.18)] bg-[rgba(7,127,91,0.08)] px-3 py-1.5 text-xs font-semibold text-[#077F5B] transition-colors hover:bg-[rgba(7,127,91,0.14)]"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" /> {t('تعديل الطلب', 'Edit Request')}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                {
                                    label: t('الخطوة التالية', 'Next step'),
                                    value: clientData?.next_steps || t('حدّد أولوية جديدة مع الفريق', 'Set a new priority with the team'),
                                    sub: t('أقرب شيء يحتاج متابعة الآن', 'The nearest item that needs follow-up now'),
                                    tone: 'from-amber-50 via-white to-orange-50',
                                    accent: 'text-amber-700',
                                },
                                {
                                    label: t('حالة آخر أوردر', 'Latest order'),
                                    value: latestOrder ? latestOrderMeta.label : t('لا يوجد أوردر بعد', 'No orders yet'),
                                    sub: latestOrder ? `${latestOrder.total_price.toLocaleString()} EGP${latestOrder.package_type ? ` • ${latestOrder.package_type}` : ''}` : t('سيظهر أحدث أوردر هنا تلقائياً', 'The newest order will appear here automatically'),
                                    tone: 'from-sky-50 via-white to-cyan-50',
                                    accent: latestOrder ? latestOrderMeta.tone.split(' ')[1] : 'text-slate-600',
                                },
                                {
                                    label: t('التقدم الحالي', 'Current progress'),
                                    value: `${progress}%`,
                                    sub: t('نسبة التقدم داخل التنفيذ الحالي', 'Delivery progress across the current execution'),
                                    tone: 'from-emerald-50 via-white to-teal-50',
                                    accent: 'text-emerald-700',
                                },
                            ].map((card) => (
                                <div key={card.label} className={`rounded-[22px] border border-[rgba(127,142,106,0.18)] bg-gradient-to-br ${card.tone} px-4 py-4 shadow-[0_12px_28px_rgba(36,119,54,0.05)]`}>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(36,119,54,0.56)]">{card.label}</p>
                                    <p className={`mt-2 text-base font-semibold leading-7 ${card.accent}`}>{card.value}</p>
                                    <p className="mt-2 text-xs leading-6 text-[rgba(36,119,54,0.72)]">{card.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={showPhotoManager} onOpenChange={setShowPhotoManager}>
                <SheetContent side="right" className="w-full border-l-[rgba(127,142,106,0.18)] bg-white/98 p-0 sm:max-w-xl">
                    <div className="flex h-full flex-col p-6 sm:p-7">
                        <SheetHeader>
                            <SheetTitle>{t('إدارة الصورة الشخصية', 'Manage profile photo')}</SheetTitle>
                            <SheetDescription>{t('ارفع صورة جديدة أو اختر من preset سريعة. تمهيدًا يمكن توسيعها لاحقًا للقص والتركيز.', 'Upload a new image or choose a quick preset. This is ready to evolve into crop and focal-point controls later.')}</SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-5 overflow-y-auto">
                            <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border-[4px] border-white bg-white shadow-[0_24px_60px_rgba(7,127,91,0.14)]">
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                    : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><User className="h-10 w-10" /></div>}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 cursor-pointer">
                                    <Camera className="h-4 w-4" />
                                    {avatarUploading ? t('جاري الرفع...', 'Uploading...') : t('رفع صورة جديدة', 'Upload new photo')}
                                    <input type="file" accept="image/*" className="hidden" onChange={e => void uploadProfileAvatar(e.target.files?.[0] || null)} />
                                </label>
                                {avatarUrl && (
                                    <Button variant="outline" onClick={() => setProfileData(prev => prev ? { ...prev, avatar_url: '' } : null)} className="rounded-xl">
                                        <RotateCcw className="h-4 w-4" /> {t('حذف الصورة', 'Remove photo')}
                                    </Button>
                                )}
                            </div>

                            <div className="rounded-[24px] border border-[rgba(127,142,106,0.16)] bg-[rgba(244,248,245,0.9)] p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(36,119,54,0.56)]">{t('اختيارات سريعة', 'Quick presets')}</p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {AVATAR_IMAGES.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setProfileData(prev => prev ? { ...prev, avatar_url: img } : null)}
                                            className={`h-16 w-16 overflow-hidden rounded-full border-2 transition-all ${profileData?.avatar_url === img ? 'border-[var(--lumos-primary)] scale-105 shadow-md' : 'border-white hover:scale-105 hover:border-slate-300'}`}
                                        >
                                            <img src={img} alt={`Avatar ${i + 1}`} className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <SheetFooter className="mt-6">
                            <Button variant="outline" onClick={() => setShowPhotoManager(false)}>{t('إغلاق', 'Close')}</Button>
                            <Button onClick={async () => { await saveProfile(); setShowPhotoManager(false); }} className="text-white" style={{ backgroundColor: themeAccent }}>
                                {t('حفظ الصورة', 'Save photo')}
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet open={showBrandDrawer} onOpenChange={setShowBrandDrawer}>
                <SheetContent side="right" className="w-full border-l-[rgba(127,142,106,0.18)] bg-white/98 p-0 sm:max-w-xl">
                    <div className="flex h-full flex-col p-6 sm:p-7">
                        <SheetHeader>
                            <SheetTitle>{t('تعديل سريع للعلامة', 'Quick brand edit')}</SheetTitle>
                            <SheetDescription>{t('هذا drawer يجمع أهم تعديلات البراند السريعة بدون الدخول في كل سكشن بالتفصيل.', 'This drawer groups the most important brand edits without opening every section in full.')}</SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-5 overflow-y-auto">
                            <Field label="Logo URL">
                                <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <input
                                        type="url"
                                        value={profileData?.logo_url || ''}
                                        onChange={e => setProfileData(prev => prev ? { ...prev, logo_url: e.target.value } : null)}
                                        placeholder="https://...logo.png"
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    />
                                </div>
                                <label className="mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer transition-colors" style={{ backgroundColor: `${themeAccent}1A`, color: themeAccent, borderColor: `${themeAccent}40` }}>
                                    <Camera className="w-3.5 h-3.5" /> {t('رفع الشعار', 'Upload logo')}
                                    <input type="file" accept="image/*" className="hidden" onChange={e => void uploadBrandLogo(e.target.files?.[0] || null)} />
                                </label>
                            </Field>

                            <Field label="Website">
                                <input
                                    type="url"
                                    value={profileData?.website || ''}
                                    onChange={e => setProfileData(prev => prev ? { ...prev, website: e.target.value } : null)}
                                    placeholder="https://yourdomain.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </Field>

                            <Field label="Primary Accent">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={profileData?.theme_accent || '#6366f1'}
                                        onChange={e => setProfileData(prev => prev ? { ...prev, theme_accent: e.target.value } : null)}
                                        className="h-12 w-12 rounded-xl border border-border cursor-pointer p-1 bg-card"
                                    />
                                    <span className="text-sm font-mono text-muted-foreground">{profileData?.theme_accent || '#6366f1'}</span>
                                </div>
                            </Field>

                            <Button variant="outline" onClick={() => { setTab('brand'); setBrandPanel('colors'); setShowBrandDrawer(false); }} className="rounded-xl w-full">
                                {t('فتح استوديو العلامة الكامل', 'Open full brand studio')}
                            </Button>
                        </div>

                        <SheetFooter className="mt-6">
                            <Button variant="outline" onClick={() => setShowBrandDrawer(false)}>{t('إغلاق', 'Close')}</Button>
                            <Button onClick={async () => { await saveProfile(); setShowBrandDrawer(false); }} className="text-white" style={{ backgroundColor: themeAccent }}>
                                {t('حفظ التعديلات', 'Save changes')}
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>

            {showShortcutHelp && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShortcutHelp(false)}>
                    <div className="w-full max-w-md rounded-[28px] border border-[rgba(127,142,106,0.18)] bg-white/92 shadow-[0_28px_80px_rgba(36,119,54,0.14)] p-5 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">{t('اختصارات لوحة المفاتيح', 'Keyboard Shortcuts')}</h3>
                            <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowShortcutHelp(false)} aria-label={t('إغلاق الاختصارات', 'Close shortcuts')}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2 text-xs">
                            <p><span className="font-semibold">1-5</span> {t('تبديل التابات', 'Switch tabs')}</p>
                            <p><span className="font-semibold">Alt/Ctrl + S</span> {t('مزامنة الآن', 'Sync now')}</p>
                            <p><span className="font-semibold">?</span> {t('فتح/إغلاق هذه المساعدة', 'Open/close this help')}</p>
                            <p><span className="font-semibold">Esc</span> {t('إغلاق النافذة', 'Close dialog')}</p>
                        </div>
                        <div className="mt-4 text-[11px] text-muted-foreground">
                            {t('وضع الحركة', 'Motion mode')}: {prefersReducedMotion ? t('مخفض', 'Reduced') : t('قياسي', 'Standard')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
