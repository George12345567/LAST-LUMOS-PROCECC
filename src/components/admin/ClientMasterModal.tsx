import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    Shield,
    Zap,
    Palette,
    Folder,
    MessageSquare,
    Save,
    RefreshCw,
    Lock,
    Trash2,
    Upload,
    FileText,
    ExternalLink
} from 'lucide-react';
import LogoDesigner from '@/components/admin/LogoDesigner';

interface ClientMasterModalProps {
    client: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

const ClientMasterModal: React.FC<ClientMasterModalProps> = ({ client, open, onOpenChange, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('security');
    const [showLogoStudio, setShowLogoStudio] = useState(false);
    const [loading, setLoading] = useState(false);

    // Identity & Security State
    const [profileData, setProfileData] = useState({ ...client });

    // Subscription State
    const [packages, setPackages] = useState<any[]>([]);
    const [planConfig, setPlanConfig] = useState(client.subscription_config || {});
    const [isCustomPlan, setIsCustomPlan] = useState(client.subscription_config?.is_custom || false);

    // Offer State
    const [activeOffer, setActiveOffer] = useState(client.active_offer || '');

    // Brand & Notes State
    const [brandConfig, setBrandConfig] = useState(client.package_payload?.brand || {});
    const [adminNotes, setAdminNotes] = useState(client.admin_notes || '');

    // Chat State
    const [clientMessages, setClientMessages] = useState<any[]>([]);
    const [newAdminMessage, setNewAdminMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // File Upload State
    const [uploadingFile, setUploadingFile] = useState(false);

    useEffect(() => {
        if (open && client) {
            setProfileData({ ...client });
            setPlanConfig(client.subscription_config || {});
            setIsCustomPlan(client.subscription_config?.is_custom || false);
            setBrandConfig(client.package_payload?.brand || {});
            setAdminNotes(client.admin_notes || '');
            setActiveOffer(client.active_offer || '');
            fetchPackages();
            fetchMessages();

            // Realtime subscription for messages
            const channel = supabaseAdmin
                .channel(`admin-chat-${client.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `client_id=eq.${client.id}`
                    },
                    (payload) => {
                        setClientMessages((prev) => [...prev, payload.new]);
                    }
                )
                .subscribe();

            return () => {
                supabaseAdmin.removeChannel(channel);
            };
        }
    }, [open, client]);

    const fetchPackages = async () => {
        const { data } = await supabaseAdmin.from('packages').select('*');
        if (data) setPackages(data);
    };

    const fetchMessages = async () => {
        const { data } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('client_id', client.id)
            .order('created_at', { ascending: true });

        if (data) setClientMessages(data);
    };

    const handleSaveOffer = async () => {
        try {
            const { error } = await supabaseAdmin
                .from('clients')
                .update({ active_offer: activeOffer })
                .eq('id', client.id);

            if (error) throw error;
            toast.success('Active offer updated');
        } catch (error) {
            toast.error('Failed to update offer');
        }
    };

    const handleSendAdminMessage = async () => {
        if (!newAdminMessage.trim()) return;
        setSendingMessage(true);
        try {
            const { error } = await supabaseAdmin
                .from('messages')
                .insert({
                    client_id: client.id,
                    sender: 'admin',
                    message: newAdminMessage.trim(),
                    is_read: false
                });

            if (error) throw error;
            setNewAdminMessage('');
            // Optimistic update
            setClientMessages(prev => [...prev, {
                id: Date.now(), // temp id
                created_at: new Date().toISOString(),
                sender: 'admin',
                message: newAdminMessage.trim(),
                client_id: client.id
            }]);
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        try {
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const filePath = `${client.id}/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabaseAdmin.storage
                .from('client-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('client-assets')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabaseAdmin
                .from('client_assets')
                .insert({
                    client_id: client.id,
                    file_name: file.name,
                    file_url: publicUrl,
                    file_size: file.size,
                    uploaded_at: new Date().toISOString()
                });

            if (dbError) throw dbError;

            toast.success('File uploaded successfully!');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setUploadingFile(false);
        }
    };

    // --- TAB 1: SECURITY ACTIONS ---
    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const { error } = await supabaseAdmin
                .from('clients')
                .update({
                    company_name: profileData.company_name,
                    username: profileData.username,
                    status: profileData.status
                })
                .eq('id', client.id);

            if (error) throw error;
            toast.success('Profile updated successfully');
            onUpdate();
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const tempPassword = Math.random().toString(36).slice(-8);
        setLoading(true);
        try {
            const { error } = await supabaseAdmin
                .from('clients')
                .update({ password: tempPassword })
                .eq('id', client.id);

            if (error) throw error;
            navigator.clipboard.writeText(tempPassword);
            toast.success(`Password reset to: ${tempPassword} (Copied!)`);
        } catch (error) {
            toast.error('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // --- TAB 2: SUBSCRIPTION ENGINE ---
    const handleSavePlan = async () => {
        setLoading(true);
        try {
            const configSnapshot = {
                ...planConfig,
                is_custom: isCustomPlan,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabaseAdmin
                .from('clients')
                .update({ subscription_config: configSnapshot })
                .eq('id', client.id);

            if (error) throw error;
            toast.success('Plan configuration saved!');
            onUpdate();
        } catch (error) {
            toast.error('Failed to save plan');
        } finally {
            setLoading(false);
        }
    };

    const handleResetCycle = () => {
        const newConfig = { ...planConfig };
        Object.keys(newConfig).forEach(key => {
            if (typeof newConfig[key] === 'object' && newConfig[key].used !== undefined) {
                newConfig[key].used = 0;
            }
        });
        setPlanConfig(newConfig);
        toast.info('Cycle usage reset locally. Click Save to apply.');
    };

    // --- TAB 4: FILE & COMMS ---
    const handleSaveNotes = async () => {
        try {
            const { error } = await supabaseAdmin
                .from('clients')
                .update({ admin_notes: adminNotes })
                .eq('id', client.id);

            if (error) throw error;
            toast.success('Admin notes saved');
        } catch (error) {
            toast.error('Failed to save notes');
        }
    };

    if (!client) return null;

    if (showLogoStudio) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                    <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                        <Button variant="ghost" onClick={() => setShowLogoStudio(false)}>
                            &larr; Back to Client Manager
                        </Button>
                        <h2 className="font-bold text-lg">Advanced Logo Studio</h2>
                        <div className="w-24"></div>
                    </div>
                    <div className="flex-1 p-6 bg-slate-100 overflow-hidden flex items-center justify-center">
                        <div className="w-full max-w-5xl">
                            <LogoDesigner
                                initialConfig={{
                                    text: client.company_name || 'Brand',
                                    fontFamily: 'Inter',
                                    iconColor: '#7c3aed'
                                }}
                                onSave={(dataUrl) => {
                                    setBrandConfig({ ...brandConfig, logo: dataUrl });
                                    setShowLogoStudio(false);
                                    // Optionally auto-save to DB here if desired, or let user click "Save" on main screen
                                    // Let's autosave for convenience
                                    setLoading(true);
                                    supabaseAdmin.from('clients').update({
                                        package_payload: { ...client.package_payload, brand: { ...client.package_payload?.brand, logo: dataUrl } }
                                    }).eq('id', client.id).then(() => {
                                        toast.success('New logo designed & saved!');
                                        onUpdate();
                                        setLoading(false);
                                    });
                                }}
                                onCancel={() => setShowLogoStudio(false)}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[95vh] h-[90vh] flex flex-col p-0">
                <div className="p-6 border-b bg-slate-50 dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            <Zap className="w-6 h-6 text-purple-600" />
                            Command Center: {client.company_name}
                            <Badge variant={client.status === 'active' ? 'default' : 'destructive'} className="ml-2 uppercase">
                                {client.status || 'Active'}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            God Mode Control Panel - ID: {client.id}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex-1 flex">
                        <div className="w-64 bg-slate-100 dark:bg-slate-950 p-4 border-r">
                            <TabsList className="flex flex-col h-auto w-full bg-transparent gap-2">
                                <TabsTrigger value="security" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white shadow-none">
                                    <Shield className="w-4 h-4 mr-2" /> Identity & Security
                                </TabsTrigger>
                                <TabsTrigger value="plan" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white shadow-none">
                                    <Zap className="w-4 h-4 mr-2" /> Subscription Engine
                                </TabsTrigger>
                                <TabsTrigger value="assets" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white shadow-none">
                                    <Palette className="w-4 h-4 mr-2" /> Visual Assets
                                </TabsTrigger>
                                <TabsTrigger value="comms" className="w-full justify-start px-4 py-3 data-[state=active]:bg-white shadow-none">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Files & Comms
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* TAB CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">

                            {/* 1. Identity & Security */}
                            <TabsContent value="security" className="space-y-6 mt-0">
                                <div className="space-y-6">
                                    {/* Main Identity Card (Business Card Style) */}
                                    <div className="p-6 bg-white rounded-xl border shadow-sm">
                                        <div className="flex items-start justify-between mb-6">
                                            <h3 className="flex items-center gap-2 font-semibold text-lg text-slate-800">
                                                <FileText className="w-5 h-5 text-blue-500" /> Client Identity
                                            </h3>
                                            <Badge variant={profileData.status === 'active' ? 'default' : 'secondary'}>
                                                {profileData.status?.toUpperCase() || 'ACTIVE'}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-8">
                                            {/* LEFT: Profile Inputs */}
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <Label>Company Name</Label>
                                                    <Input
                                                        value={profileData.company_name}
                                                        onChange={e => setProfileData({ ...profileData, company_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Username (Login)</Label>
                                                        <Input
                                                            value={profileData.username}
                                                            onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Account Status</Label>
                                                        <Select
                                                            value={profileData.status || 'active'}
                                                            onValueChange={val => setProfileData({ ...profileData, status: val })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="active">Active</SelectItem>
                                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
                                                    Update Profile
                                                </Button>
                                            </div>

                                            {/* RIGHT: Logo / Brand Identity */}
                                            <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <Label className="mb-2 self-start w-full text-center font-bold text-slate-600">CLIENT LOGO</Label>

                                                <div className="w-32 h-32 mb-4 rounded-lg bg-white border shadow-sm flex items-center justify-center overflow-hidden relative group">
                                                    {brandConfig.logo ? (
                                                        <img src={brandConfig.logo} alt="Logo" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="text-center text-slate-300">
                                                            <Palette className="w-8 h-8 mx-auto mb-1" />
                                                            <span className="text-xs">No Logo</span>
                                                        </div>
                                                    )}

                                                    {/* Upload Overlay */}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                        <label className="cursor-pointer w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                                            UPLOAD
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            setBrandConfig({ ...brandConfig, logo: reader.result as string });
                                                                            // Auto-save when uploaded
                                                                            toast.info('Logo updated locally. Click Save to persist.');
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="w-full space-y-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                                                        onClick={() => setShowLogoStudio(true)}
                                                    >
                                                        <Palette className="w-4 h-4 mr-2" /> Open Logo Studio
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            try {
                                                                const newPayload = {
                                                                    ...client.package_payload,
                                                                    brand: brandConfig
                                                                };
                                                                const { error } = await supabaseAdmin
                                                                    .from('clients')
                                                                    .update({ package_payload: newPayload })
                                                                    .eq('id', client.id);
                                                                if (error) throw error;
                                                                toast.success('Logo saved to Brand Identity!');
                                                                onUpdate();
                                                            } catch (e) {
                                                                toast.error('Failed to save logo');
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        <Save className="w-3 h-3 mr-2" /> Save Logo
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Zone */}
                                    <div className="p-6 bg-red-50/50 rounded-xl border border-red-100">
                                        <h3 className="flex items-center gap-2 font-semibold text-lg text-red-800 mb-4">
                                            <Shield className="w-5 h-5 text-red-500" /> Security Zone
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm text-red-700 font-medium">Emergency Access</p>
                                                <p className="text-xs text-red-500">Generate a temporary password for client lockout situations.</p>
                                            </div>
                                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleResetPassword}>
                                                <RefreshCw className="w-4 h-4 mr-2" /> Generate Temp Password
                                            </Button>
                                            <Separator orientation="vertical" className="h-8 bg-red-200" />
                                            <Button variant="destructive" size="icon" onClick={() => toast.error('Delete functionality is protected for demo.')}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 2. Subscription Engine */}
                            <TabsContent value="plan" className="space-y-6 mt-0">
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <Switch checked={isCustomPlan} onCheckedChange={setIsCustomPlan} />
                                        <div>
                                            <Label className="text-base font-semibold">Custom Configuration Mode</Label>
                                            <p className="text-sm text-slate-500">Enable to manually override standard package limits</p>
                                        </div>
                                    </div>
                                    {!isCustomPlan && (
                                        <div className="w-[300px]">
                                            <Select onValueChange={(val) => {
                                                const pkg = packages.find(p => p.id === val);
                                                if (pkg) setPlanConfig({ ...pkg.limits, source: pkg.name });
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Standard Package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {packages.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    {['posts', 'reels', 'stories', 'designs'].map(metric => (
                                        <div key={metric} className="p-6 bg-white rounded-xl border shadow-sm hover:border-purple-200 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold capitalize text-slate-700">{metric}</h4>
                                                <Badge variant="outline">{planConfig[metric]?.used || 0} / {planConfig[metric]?.total || 0}</Badge>
                                            </div>
                                            <Progress value={((planConfig[metric]?.used || 0) / (planConfig[metric]?.total || 1)) * 100} className="h-2 mb-6" />

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs text-slate-400 mb-1 block">USED</Label>
                                                    <Input
                                                        type="number"
                                                        value={planConfig[metric]?.used || 0}
                                                        onChange={(e) => setPlanConfig({
                                                            ...planConfig,
                                                            [metric]: { ...planConfig[metric], used: parseInt(e.target.value) }
                                                        })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-400 mb-1 block">LIMIT</Label>
                                                    <Input
                                                        type="number"
                                                        value={planConfig[metric]?.total || 0}
                                                        disabled={!isCustomPlan}
                                                        onChange={(e) => setPlanConfig({
                                                            ...planConfig,
                                                            [metric]: { ...planConfig[metric], total: parseInt(e.target.value) }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <Button variant="outline" onClick={handleResetCycle} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                                        <RefreshCw className="w-4 h-4 mr-2" /> Reset Monthly Cycle
                                    </Button>
                                    <Button onClick={handleSavePlan} className="bg-purple-600 hover:bg-purple-700">
                                        <Save className="w-4 h-4 mr-2" /> Save Configuration
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* 3. Visual Assets (Digital Twin) */}
                            <TabsContent value="assets" className="h-full flex flex-col mt-0">
                                <div className="space-y-4 h-full flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold">Brand & Application Identity</h3>
                                            <p className="text-sm text-muted-foreground">Read-only view of the client's current visual configuration</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 border rounded-xl overflow-hidden bg-slate-50/50 relative">
                                        <div className="absolute inset-0 overflow-hidden p-8 flex items-center justify-center">
                                            <div className="text-center space-y-4">
                                                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mx-auto flex items-center justify-center">
                                                    <Palette className="w-10 h-10 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900 mb-2">Brand Visualizer</h3>
                                                    <p className="text-sm text-slate-500 mb-4">View client's brand identity and designs</p>
                                                    <Button
                                                        onClick={() => window.open(`/creative-studio?clientId=${client.id}&userId=admin`, '_blank')}
                                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                        Open in Creative Studio
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* 4. Files & Comms */}
                            <TabsContent value="comms" className="space-y-6 mt-0">
                                <div className="grid grid-cols-2 gap-6 h-full">
                                    <div className="flex flex-col space-y-4">
                                        <div className="p-4 bg-white rounded-xl border shadow-sm flex-1">
                                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-blue-500" /> Admin Private Notes
                                            </h3>
                                            <Textarea
                                                className="h-[150px] resize-none"
                                                placeholder="Internal team notes about this client..."
                                                value={adminNotes}
                                                onChange={e => setAdminNotes(e.target.value)}
                                            />
                                            <Button onClick={handleSaveNotes} className="mt-4 w-full" variant="secondary">
                                                <Save className="w-4 h-4 mr-2" /> Save Notes
                                            </Button>
                                        </div>

                                        <div className="p-4 bg-white rounded-xl border shadow-sm">
                                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-yellow-500" /> Active Marketing Offer
                                            </h3>
                                            <Textarea
                                                className="h-[80px] resize-none mb-2"
                                                placeholder="e.g. 'Get 50% off next month!'"
                                                value={activeOffer}
                                                onChange={e => setActiveOffer(e.target.value)}
                                            />
                                            <Button onClick={handleSaveOffer} className="w-full" variant="outline">
                                                Update Offer Banner
                                            </Button>
                                        </div>

                                        <div className="p-4 bg-white rounded-xl border shadow-sm flex-1">
                                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                                <Folder className="w-5 h-5 text-orange-500" /> File Manager
                                            </h3>
                                            <div className="border-2 border-dashed border-slate-200 rounded-lg h-32 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    disabled={uploadingFile}
                                                />
                                                {uploadingFile ? (
                                                    <>
                                                        <RefreshCw className="w-8 h-8 mb-2 animate-spin text-purple-600" />
                                                        <span className="text-sm font-bold text-purple-600">Uploading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 mb-2" />
                                                        <span className="text-sm">Click or Drag to Upload File</span>
                                                        <span className="text-xs text-slate-300 mt-1 max-w-[200px] text-center">
                                                            PDF, Images, Docs (Max 10MB)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Real-time Chat UI */}
                                    <div className="bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden h-[600px]">
                                        <div className="p-4 border-b bg-slate-50">
                                            <h3 className="font-bold flex items-center gap-2">
                                                <MessageSquare className="w-5 h-5 text-green-500" /> Direct Client Chat
                                            </h3>
                                        </div>
                                        <div className="flex-1 bg-slate-50/50 p-4 overflow-y-auto">
                                            {clientMessages.length === 0 ? (
                                                <div className="flex items-center justify-center h-full text-slate-400">
                                                    No messages yet
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {clientMessages.map((msg, i) => (
                                                        <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'admin'
                                                                ? 'bg-purple-600 text-white rounded-br-none'
                                                                : 'bg-white border shadow-sm rounded-bl-none'
                                                                }`}>
                                                                <p>{msg.message}</p>
                                                                <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-purple-200' : 'text-slate-400'}`}>
                                                                    {new Date(msg.created_at).toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 border-t bg-white">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Type a message..."
                                                    value={newAdminMessage}
                                                    onChange={e => setNewAdminMessage(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleSendAdminMessage()}
                                                />
                                                <Button size="icon" onClick={handleSendAdminMessage} disabled={sendingMessage} className="bg-purple-600">
                                                    <Save className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClientMasterModal;
