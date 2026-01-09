import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { StatsOverview } from '@/components/admin/dashboard/StatsOverview';
import { OrdersKanban } from '@/components/admin/dashboard/OrdersKanban';
import { ContactsManager } from '@/components/admin/dashboard/ContactsManager';
import ClientMasterModal from '@/components/admin/ClientMasterModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutDashboard, Users, UserPlus, Palette, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/types/dashboard';

const Dashboard = () => {
    const navigate = useNavigate();
    const {
        stats,
        orders,
        contacts,
        clients,
        loading,
        refresh,
        updateOrderStatus,
        deleteOrder,
        updateContactStatus,
        deleteContact
    } = useAdminDashboard();

    const [managingClient, setManagingClient] = useState<Client | null>(null);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Admin Command Center
                        </h1>
                        <p className="text-slate-500">
                            God Mode System v2.0
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Main Stats */}
                <StatsOverview stats={stats} />

                {/* Main Content Area */}
                <Tabs defaultValue="orders" className="space-y-6">
                    <TabsList className="bg-white p-1 border border-slate-200">
                        <TabsTrigger value="orders" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Orders Board
                        </TabsTrigger>
                        <TabsTrigger value="inbox" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800">
                            <Users className="w-4 h-4 mr-2" /> Inbox & Leads
                        </TabsTrigger>
                        <TabsTrigger value="clients" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
                            <UserPlus className="w-4 h-4 mr-2" /> Client Database
                        </TabsTrigger>
                        <TabsTrigger value="creative" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-pink-100 data-[state=active]:text-purple-800">
                            <Palette className="w-4 h-4 mr-2" /> Creative Studio
                        </TabsTrigger>
                    </TabsList>

                    {/* 1. Orders Board (Kanban) */}
                    <TabsContent value="orders" className="outline-none">
                        <OrdersKanban
                            orders={orders}
                            onUpdateStatus={updateOrderStatus}
                            onDelete={deleteOrder}
                        />
                    </TabsContent>

                    {/* 2. Inbox (Split View) */}
                    <TabsContent value="inbox" className="outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                            <div className="md:col-span-2">
                                <ContactsManager
                                    contacts={contacts}
                                    onUpdateStatus={updateContactStatus}
                                    onDelete={deleteContact}
                                />
                            </div>
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white flex flex-col justify-center items-center text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-pink-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Lead Intelligence</h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    Select a contact to view AI-generated insights and auto-collected metadata.
                                </p>
                                <Button variant="secondary" className="w-full">
                                    View Analytics (Pro)
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* 3. Clients List */}
                    <TabsContent value="clients" className="outline-none">
                        <Card>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {clients.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No clients found
                                        </div>
                                    )}
                                    {clients.map(client => (
                                        <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${client.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                    {client.company_name?.charAt(0) || client.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{client.company_name || client.username}</h4>
                                                    <p className="text-xs text-slate-500">{client.package_name || 'Standard Plan'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => navigate(`/creative-studio?clientId=${client.id}&userId=admin`)}
                                                    className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                                >
                                                    <Palette className="w-4 h-4 mr-1" />
                                                    Studio
                                                </Button>
                                                <Button variant="outline" onClick={() => setManagingClient(client)}>
                                                    Manage System
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 4. Creative Studio Projects */}
                    <TabsContent value="creative" className="outline-none">
                        <div className="space-y-6">
                            {/* Quick Access */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => navigate('/creative-studio?userId=admin')}>
                                    <CardContent className="p-6 text-center">
                                        <Palette className="w-12 h-12 mx-auto mb-3 opacity-90" />
                                        <h3 className="font-bold text-lg">New Project</h3>
                                        <p className="text-white/80 text-sm mt-1">Start fresh design</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 text-center">
                                        <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-90" />
                                        <h3 className="font-bold text-lg">Active Projects</h3>
                                        <p className="text-white/80 text-sm mt-1">{clients.length} clients</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 text-center">
                                        <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-90" />
                                        <h3 className="font-bold text-lg">Templates</h3>
                                        <p className="text-white/80 text-sm mt-1">Ready to use</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Client Projects */}
                            <Card>
                                <CardContent className="p-0">
                                    <div className="p-4 border-b border-slate-100">
                                        <h3 className="font-bold text-lg text-slate-900">Client Creative Projects</h3>
                                        <p className="text-slate-500 text-sm">Manage logos and app designs for your clients</p>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {clients.length === 0 && (
                                            <div className="text-center py-12 text-muted-foreground">
                                                No clients found. Add clients first to create creative projects.
                                            </div>
                                        )}
                                        {clients.map(client => (
                                            <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                        <span className="text-xl font-bold text-purple-600">
                                                            {client.company_name?.charAt(0) || client.username.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{client.company_name || client.username}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                <span className="w-2 h-2 rounded-full bg-purple-400 mr-1"></span>
                                                                Logo
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                <span className="w-2 h-2 rounded-full bg-pink-400 mr-1"></span>
                                                                App Design
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        onClick={() => navigate(`/creative-studio?clientId=${client.id}&userId=admin`)}
                                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                    >
                                                        <Palette className="w-4 h-4 mr-2" />
                                                        Open Studio
                                                        <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Client Master Logic */}
            {managingClient && (
                <ClientMasterModal
                    client={managingClient}
                    open={!!managingClient}
                    onOpenChange={(open) => !open && setManagingClient(null)}
                    onUpdate={refresh}
                />
            )}
        </div>
    );
};

export default Dashboard;
