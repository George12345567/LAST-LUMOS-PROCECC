import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    LogOut,
    Package,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Rocket,
    MessageCircle,
    Calendar,
    Target,
    Zap,
    FileText,
    Download,
    Gift,
    BarChart3,
    Folder,
    MessageSquare,
    Send,
    X,
    Palette,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Client {
    id: string;
    username: string;
    company_name: string;
    package_name?: string;
    status?: string;
    progress?: number;
    next_steps?: string;
    package_details?: any;
    subscription_config?: any; // New Unified Package Config
    active_offer?: string;
}

interface ClientUpdate {
    id: string;
    client_id: string;
    title: string;
    type: 'milestone' | 'update' | 'action';
    description?: string;
    created_at: string;
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
    file_size?: number;
    created_at: string;
    uploaded_at: string; // Added to fix the TS error
}

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [updates, setUpdates] = useState<ClientUpdate[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [assets, setAssets] = useState<ClientAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Chat state
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        // Security Check
        const isAuthenticated = sessionStorage.getItem('isAuthenticated');
        const clientData = sessionStorage.getItem('client');

        if (!isAuthenticated || !clientData) {
            toast.error('Please login first');
            navigate('/client-login');
            return;
        }

        const parsedClient = JSON.parse(clientData);

        if (parsedClient.username === 'GEORGE') {
            navigate('/dashboard');
            return;
        }

        setClient(parsedClient);
        fetchAllData(parsedClient.id);
        setupRealtime(parsedClient.id);
    }, [navigate]);

    const fetchAllData = async (clientId: string) => {
        setLoading(true);
        await Promise.all([
            fetchClientProfile(clientId), // Fetch fresh profile
            fetchClientUpdates(clientId),
            fetchMessages(clientId),
            fetchAssets(clientId)
        ]);
        setLoading(false);
    };

    const fetchClientProfile = async (clientId: string) => {
        try {
            const { data, error } = await supabaseAdmin
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .single();

            if (error) throw error;
            if (data) {
                setClient(data);
                // Optional: Update session storage to keep it somewhat fresh
                sessionStorage.setItem('client', JSON.stringify(data));
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        }
    };

    const fetchClientUpdates = async (clientId: string) => {
        try {
            const { data } = await supabaseAdmin
                .from('client_updates')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });
            setUpdates(data || []);
        } catch (error) {
            console.error('Fetch updates error:', error);
        }
    };

    const fetchMessages = async (clientId: string) => {
        try {
            const { data } = await supabaseAdmin
                .from('messages')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: true });
            setMessages(data || []);
        } catch (error) {
            console.error('Fetch messages error:', error);
        }
    };

    const fetchAssets = async (clientId: string) => {
        try {
            const { data } = await supabaseAdmin
                .from('client_assets')
                .select('*')
                .eq('client_id', clientId)
                .order('uploaded_at', { ascending: false });
            setAssets(data || []);
        } catch (error) {
            console.error('Fetch assets error:', error);
        }
    };

    const setupRealtime = (clientId: string) => {
        const channel = supabaseAdmin
            .channel(`client-dashboard-${clientId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `client_id=eq.${clientId}`
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new as Message]);
                    if (payload.new.sender === 'admin') {
                        toast.success('New message from Admin!');
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'clients',
                    filter: `id=eq.${clientId}`
                },
                (payload) => {
                    // Update client state with fresh data
                    setClient(payload.new as Client);
                    toast.info('Your dashboard has been updated!');
                }
            )
            .subscribe();

        return () => {
            supabaseAdmin.removeChannel(channel);
        };
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !client) return;

        setSendingMessage(true);
        try {
            const { error } = await supabaseAdmin
                .from('messages')
                .insert([{
                    client_id: client.id,
                    sender: 'client',
                    message: newMessage.trim()
                }]);

            if (error) throw error;

            setNewMessage('');
            toast.success('Message sent!');
        } catch (error: any) {
            console.error('Send message error:', error);
            toast.error('Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('client');
        sessionStorage.removeItem('isAuthenticated');
        toast.success('Logged out successfully');
        navigate('/client-login');
    };

    const openWhatsApp = () => {
        const phone = '201070821379';
        const message = encodeURIComponent(
            `Hi George, I need assistance with ${client?.company_name}`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-500/20 text-green-600 border-green-500/50';
            case 'pending': return 'bg-orange-500/20 text-orange-600 border-orange-500/50';
            case 'completed': return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
            default: return 'bg-gray-500/20 text-gray-600 border-gray-500/50';
        }
    };

    const getUpdateIcon = (type: string) => {
        switch (type) {
            case 'milestone': return <Target className="w-4 h-4 text-green-500" />;
            case 'action': return <Zap className="w-4 h-4 text-orange-500" />;
            default: return <Clock className="w-4 h-4 text-blue-500" />;
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown';
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
    };

    if (!client) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    const progress = client.progress || 0;
    // Prefer subscription_config (Unified System) over package_details (Legacy)
    const packageDetails = client.subscription_config || client.package_details || {};
    const hasActiveOffer = !!client.active_offer;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-4 sm:p-6">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-cyan-500/5"
                        style={{
                            width: `${Math.random() * 300 + 100}px`,
                            height: `${Math.random() * 300 + 100}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${Math.random() * 15 + 10}s infinite ease-in-out`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-cyan-500/20">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-3">
                            <Rocket className="w-6 sm:w-8 h-6 sm:h-8 text-cyan-500" />
                            {client.company_name || client.username}
                        </h1>
                        <p className="text-slate-300 text-xs sm:text-sm">Client Command Center</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => navigate(`/creative-studio?clientId=${client.id}`)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                            size="sm"
                        >
                            <Palette className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Creative Studio</span>
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                            <LogOut className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>

                {/* Smart Promo Banner */}
                {hasActiveOffer && (
                    <div className="mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-6 border-2 border-white/20 shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Gift className="w-12 h-12 text-white animate-bounce" />
                                <div>
                                    <h3 className="text-white font-bold text-lg sm:text-xl mb-1">
                                        🎉 Special Offer Just For You!
                                    </h3>
                                    <p className="text-white/90 text-sm sm:text-base">
                                        {client.active_offer}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={openWhatsApp}
                                className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg hidden sm:flex"
                            >
                                Claim Offer →
                            </Button>
                        </div>
                        <Button
                            onClick={openWhatsApp}
                            className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg w-full mt-4 sm:hidden"
                        >
                            Claim Offer →
                        </Button>
                    </div>
                )}

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 p-1">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                            <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Overview</span>
                            <span className="sm:hidden">Info</span>
                        </TabsTrigger>
                        <TabsTrigger value="usage" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                            <Package className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Usage</span>
                            <span className="sm:hidden">Use</span>
                        </TabsTrigger>
                        <TabsTrigger value="files" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                            <Folder className="w-4 h-4 mr-1 sm:mr-2" />
                            Files
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white relative">
                            <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
                            Chat
                            {messages.filter(m => m.sender === 'admin').length > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Hero Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <Card className="bg-slate-800/40 backdrop-blur-xl border-2 border-cyan-500/30">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-300">Package</CardTitle>
                                    <Package className="w-5 h-5 text-cyan-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl sm:text-2xl font-bold text-white">
                                        {packageDetails.source || client.package_name || 'Standard'}
                                    </div>
                                    {packageDetails.is_custom && (
                                        <Badge className="mt-2 bg-purple-500/20 text-purple-300 border-purple-500/50">
                                            Custom Build
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/40 backdrop-blur-xl border-2 border-cyan-500/30">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-300">Status</CardTitle>
                                    <TrendingUp className="w-5 h-5 text-cyan-500" />
                                </CardHeader>
                                <CardContent>
                                    <Badge className={`text-base sm:text-lg px-3 sm:px-4 py-1 font-bold border-2 ${getStatusColor(client.status)}`}>
                                        {client.status || 'Active'}
                                    </Badge>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/40 backdrop-blur-xl border-2 border-cyan-500/30">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-300">Progress</CardTitle>
                                    <CheckCircle className="w-5 h-5 text-cyan-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl sm:text-3xl font-bold text-white">{progress}%</div>
                                    <Progress value={progress} className="mt-2 h-2" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Creative Studio CTA */}
                        <Card className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-cyan-900/40 backdrop-blur-xl border-2 border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group"
                            onClick={() => navigate(`/creative-studio?clientId=${client.id}`)}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Palette className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                Creative Studio
                                                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                                            </h3>
                                            <p className="text-slate-300 text-sm">
                                                Design your Logo & App in one unified workspace
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hidden sm:flex"
                                    >
                                        Open Studio →
                                    </Button>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-white/5 rounded-lg">
                                        <p className="text-purple-400 font-bold">🎨 Logo</p>
                                        <p className="text-slate-400 text-xs mt-1">60+ Icons</p>
                                    </div>
                                    <div className="text-center p-3 bg-white/5 rounded-lg">
                                        <p className="text-pink-400 font-bold">📱 App</p>
                                        <p className="text-slate-400 text-xs mt-1">Theme Editor</p>
                                    </div>
                                    <div className="text-center p-3 bg-white/5 rounded-lg">
                                        <p className="text-cyan-400 font-bold">🔄 Sync</p>
                                        <p className="text-slate-400 text-xs mt-1">Auto Colors</p>
                                    </div>
                                </div>
                                <Button 
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg w-full mt-4 sm:hidden"
                                >
                                    Open Creative Studio →
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Timeline & Next Steps */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border-2 border-cyan-500/30">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-cyan-500" />
                                        Activity Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                        </div>
                                    ) : updates.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Rocket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-400">Project just started!</p>
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-[300px] pr-4">
                                            <div className="space-y-4">
                                                {updates.map((update, i) => (
                                                    <div key={update.id} className="flex gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-all">
                                                        {getUpdateIcon(update.type)}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="text-xs text-slate-400">
                                                                    {new Date(update.created_at).toLocaleDateString()}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs">{update.type}</Badge>
                                                            </div>
                                                            <p className="text-white font-semibold text-sm sm:text-base">{update.title}</p>
                                                            {update.description && (
                                                                <p className="text-slate-400 text-xs sm:text-sm mt-1">{update.description}</p>
                                                            )}
                                                        </div>
                                                        {i === 0 && <Badge className="bg-cyan-500/20 text-cyan-400">Latest</Badge>}
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-xl border-2 border-cyan-500/50">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-cyan-400" />
                                        Next Step
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-lg border border-cyan-500/30">
                                        <p className="text-white text-sm leading-relaxed">
                                            {client.next_steps || "We're working on your project!"}
                                        </p>
                                    </div>
                                    <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 font-bold py-4 sm:py-6">
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        WhatsApp Support
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Usage Tab */}
                    <TabsContent value="usage" className="space-y-6">
                        <Card className="bg-slate-800/40 backdrop-blur-xl border-2 border-cyan-500/30">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-cyan-500" />
                                    Package Usage Meters
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(packageDetails).length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">No usage data available</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Object.entries(packageDetails)
                                            .filter(([key]) => !['source', 'is_custom', 'updated_at'].includes(key)) // Filter metadata
                                            .map(([key, value]: [string, any]) => {
                                                const used = value.used || 0;
                                                const total = value.total || 100;
                                                const percentage = (used / total) * 100;

                                                return (
                                                    <div key={key} className="p-6 bg-slate-700/30 rounded-xl border border-slate-600/50">
                                                        <h4 className="text-white font-semibold mb-4 capitalize">{key.replace(/_/g, ' ')}</h4>
                                                        <div className="relative w-32 h-32 mx-auto mb-4">
                                                            <svg className="w-32 h-32 transform -rotate-90">
                                                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                                                                <circle
                                                                    cx="64"
                                                                    cy="64"
                                                                    r="56"
                                                                    stroke="currentColor"
                                                                    strokeWidth="8"
                                                                    fill="transparent"
                                                                    strokeDasharray={`${2 * Math.PI * 56}`}
                                                                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                                                                    className="text-cyan-500 transition-all duration-1000"
                                                                    strokeLinecap="round"
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-slate-400 text-sm">{used} / {total} Used</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Files Tab */}
                    <TabsContent value="files" className="space-y-6">
                        <Card className="bg-slate-800/40 backdrop-blur-xl border-2 border-cyan-500/30">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Folder className="w-5 h-5 text-cyan-500" />
                                    Asset Vault - My Files
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                    </div>
                                ) : assets.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400 text-lg">No files uploaded yet</p>
                                        <p className="text-slate-500 text-sm mt-2">Files will appear here when uploaded by your team</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {assets.map((asset) => (
                                            <div key={asset.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-all">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <FileText className="w-8 h-8 text-cyan-500 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-semibold truncate">{asset.file_name}</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Uploaded: {new Date(asset.uploaded_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => window.open(asset.file_url, '_blank')}
                                                    className="bg-cyan-600 hover:bg-cyan-700 flex-shrink-0"
                                                >
                                                    <Download className="w-4 h-4 sm:mr-2" />
                                                    <span className="hidden sm:inline">Download</span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Chat Tab */}
                    <TabsContent value="chat" className="space-y-6">
                        <Card className="bg-slate-800/40 backdrop-blur-xl border-2 border-cyan-500/30">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-cyan-500" />
                                    Lumos Direct - Support Chat
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <ScrollArea className="h-[400px] p-4 bg-slate-900/50 rounded-lg">
                                        <div className="space-y-3">
                                            {messages.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                                    <p className="text-slate-400">No messages yet</p>
                                                    <p className="text-slate-500 text-sm mt-2">Start a conversation!</p>
                                                </div>
                                            ) : (
                                                messages.map((msg) => (
                                                    <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'client'
                                                            ? 'bg-cyan-600 text-white'
                                                            : 'bg-slate-700 text-white'
                                                            }`}>
                                                            <p className="text-sm">{msg.message}</p>
                                                            <p className="text-xs opacity-70 mt-1">
                                                                {new Date(msg.created_at).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>

                                    <div className="flex gap-2">
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Type your message..."
                                            className="bg-slate-700/50 border-slate-600 text-white"
                                            disabled={sendingMessage}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={sendingMessage || !newMessage.trim()}
                                            className="bg-cyan-600 hover:bg-cyan-700"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-20px) scale(1.05); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ClientDashboard;
