import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingCart,
    TrendingUp,
    Mail,
    LogOut,
    Eye,
    Trash2,
    MapPin,
    Clock,
    DollarSign,
    Edit,
    CheckCircle,
    XCircle,
    RefreshCw,
    Download,
    Search,
    Phone,
    Globe,
    Smartphone,
    FileText,
    Printer
} from 'lucide-react';
import { toast } from 'sonner';

interface Order {
    id: string;
    client_name: string;
    phone: string;
    total_price: number;
    plan_details: any;
    auto_collected_data: any;
    location_url: string;
    status: string;
    created_at: string;
}

interface Contact {
    id: string;
    name: string;
    phone: string;
    message: string;
    auto_collected_data: any;
    location_url: string;
    status: string;
    created_at: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [viewDetails, setViewDetails] = useState<any>(null);
    const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
    const [expandedContact, setExpandedContact] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalContacts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        newContacts: 0,
        avgOrderValue: 0
    });

    // Load data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: ordersData, error: ordersError } = await supabaseAdmin
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            const { data: contactsData, error: contactsError } = await supabaseAdmin
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (contactsError) throw contactsError;

            setOrders(ordersData || []);
            setContacts(contactsData || []);

            // Calculate Advanced Stats
            const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
            const pendingOrders = ordersData?.filter(o => o.status === 'pending').length || 0;
            const completedOrders = ordersData?.filter(o => o.status === 'completed').length || 0;
            const newContacts = contactsData?.filter(c => c.status === 'new').length || 0;
            const avgOrderValue = ordersData?.length ? totalRevenue / ordersData.length : 0;

            setStats({
                totalOrders: ordersData?.length || 0,
                totalRevenue,
                totalContacts: contactsData?.length || 0,
                pendingOrders,
                completedOrders,
                newContacts,
                avgOrderValue
            });

            toast.success('تم تحديث البيانات بنجاح');
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('حدث خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabaseAdmin
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(`تم تحديث حالة الطلب إلى "${newStatus}"`);
            fetchData();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('حدث خطأ في تحديث الطلب');
        }
    };

    const updateContactStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabaseAdmin
                .from('contacts')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            toast.success(`تم تحديث حالة الرسالة إلى "${newStatus}"`);
            fetchData();
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('حدث خطأ في تحديث الرسالة');
        }
    };

    const updateOrder = async () => {
        if (!editingOrder) return;

        try {
            const { error } = await supabaseAdmin
                .from('orders')
                .update({
                    client_name: editingOrder.client_name,
                    phone: editingOrder.phone,
                    total_price: editingOrder.total_price,
                    status: editingOrder.status
                })
                .eq('id', editingOrder.id);

            if (error) throw error;

            toast.success('تم تحديث الطلب بنجاح! ✅');
            setEditingOrder(null);
            fetchData();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('حدث خطأ في تحديث الطلب');
        }
    };

    const updateContact = async () => {
        if (!editingContact) return;

        try {
            const { error } = await supabaseAdmin
                .from('contacts')
                .update({
                    name: editingContact.name,
                    phone: editingContact.phone,
                    message: editingContact.message,
                    status: editingContact.status
                })
                .eq('id', editingContact.id);

            if (error) throw error;

            toast.success('تم تحديث الرسالة بنجاح! ✅');
            setEditingContact(null);
            fetchData();
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('حدث خطأ في تحديث الرسالة');
        }
    };

    const deleteOrder = async (id: string) => {
        if (!confirm('⚠️ هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;

        // Close any open modals
        setEditingOrder(null);
        setInvoiceOrder(null);
        setViewDetails(null);

        setLoading(true);
        try {
            // Delete related marketing data first (if CASCADE not set)
            try {
                await supabaseAdmin.from('marketing_data').delete().eq('order_id', id);
            } catch (e) {
                console.log('Marketing data cleanup:', e);
            }

            // Delete the order
            const { error } = await supabaseAdmin
                .from('orders')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            toast.success('✅ تم حذف الطلب بنجاح!');
            await fetchData();
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(`❌ ${error.message || 'فشل حذف الطلب'}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteContact = async (id: string) => {
        if (!confirm('⚠️ هل أنت متأكد من حذف هذه الرسالة نهائياً؟')) return;

        // Close any open modals
        setEditingContact(null);
        setViewDetails(null);

        setLoading(true);
        try {
            // Delete related marketing data first (if CASCADE not set)
            try {
                await supabaseAdmin.from('marketing_data').delete().eq('contact_id', id);
            } catch (e) {
                console.log('Marketing data cleanup:', e);
            }

            // Delete the contact
            const { error } = await supabaseAdmin
                .from('contacts')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            toast.success('✅ تم حذف الرسالة بنجاح!');
            await fetchData();
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(`❌ ${error.message || 'فشل حذف الرسالة'}`);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data: any[], filename: string) => {
        const headers = Object.keys(data[0] || {});
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success(`تم تصدير ${data.length} سجل بنجاح 📊`);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4" dir="rtl">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            لوحة التحكم المتقدمة 🎛️
                        </h1>
                        <p className="text-muted-foreground">
                            إدارة كاملة لطلباتك ورسائلك
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            تحديث
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                            <ShoppingCart className="w-5 h-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">{stats.totalOrders}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-600 font-bold">{stats.completedOrders}</span> مكتمل ·
                                <span className="text-orange-600 font-bold ml-1">{stats.pendingOrders}</span> معلق
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {stats.totalRevenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                متوسط: {Math.round(stats.avgOrderValue).toLocaleString()} EGP
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">الرسائل</CardTitle>
                            <Mail className="w-5 h-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{stats.totalContacts}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-blue-600 font-bold">{stats.newContacts}</span> جديدة
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-500/20 hover:border-orange-500/40 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600">
                                {stats.totalContacts > 0 ? Math.round((stats.totalOrders / stats.totalContacts) * 100) : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">من الاستفسارات للطلبات</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" dir="rtl">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="بحث بالاسم أو الهاتف..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="تصفية حسب الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الحالات</SelectItem>
                                    <SelectItem value="pending">قيد المعالجة</SelectItem>
                                    <SelectItem value="completed">مكتمل</SelectItem>
                                    <SelectItem value="new">جديد</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => exportToCSV(orders, 'orders')}
                                    className="flex-1"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    تصدير الطلبات
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => exportToCSV(contacts, 'contacts')}
                                    className="flex-1"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    تصدير الرسائل
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Tabs */}
                <Tabs defaultValue="orders" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="orders" className="gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            الطلبات ({filteredOrders.length})
                        </TabsTrigger>
                        <TabsTrigger value="contacts" className="gap-2">
                            <Mail className="w-4 h-4" />
                            الرسائل ({filteredContacts.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                                    <p className="text-muted-foreground">جاري التحميل...</p>
                                </CardContent>
                            </Card>
                        ) : filteredOrders.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد طلبات بعد'}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredOrders.map((order) => (
                                    <Card key={order.id} className="border-2 hover:border-primary/50 transition-all">
                                        <CardContent className="p-4 sm:p-6" dir="rtl">
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-foreground">{order.client_name}</h3>
                                                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                                            {order.status === 'pending' ? '⏳ معلق' : order.status === 'completed' ? '✅ مكتمل' : order.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {order.phone}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    <Button size="sm" variant="default" onClick={() => setInvoiceOrder(order)} className="bg-blue-600 hover:bg-blue-700">
                                                        <FileText className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => setViewDetails(order)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingOrder(order)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {order.location_url && !order.location_url.includes('denied') && (
                                                        <Button size="sm" variant="outline" onClick={() => window.open(order.location_url, '_blank')}>
                                                            <MapPin className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="destructive" onClick={() => deleteOrder(order.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-lg">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">المبلغ</p>
                                                    <p className="text-lg font-bold text-green-600">{order.total_price.toLocaleString()} EGP</p>
                                                </div>
                                                {order.auto_collected_data?.tech && (
                                                    <>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">الجهاز</p>
                                                            <div className="flex items-center gap-1">
                                                                {order.auto_collected_data.tech.device_type === 'Mobile' ? <Smartphone className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                                                <p className="text-sm font-medium">{order.auto_collected_data.tech.device_type}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">المدينة</p>
                                                            <p className="text-sm font-medium">{order.auto_collected_data.location_ip?.city || 'غير متاح'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">المصدر</p>
                                                            <p className="text-sm font-medium">{order.auto_collected_data.marketing?.source || 'direct'}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                {order.status === 'pending' && (
                                                    <Button size="sm" onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-green-600 hover:bg-green-700">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        تحويل لمكتمل
                                                    </Button>
                                                )}
                                                {order.status === 'completed' && (
                                                    <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'pending')}>
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        إرجاع لمعلق
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Contacts Tab */}
                    <TabsContent value="contacts" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                                    <p className="text-muted-foreground">جاري التحميل...</p>
                                </CardContent>
                            </Card>
                        ) : filteredContacts.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد رسائل بعد'}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredContacts.map((contact) => (
                                    <Card key={contact.id} className="border-2 hover:border-primary/50 transition-all">
                                        <CardContent className="p-4 sm:p-6" dir="rtl">
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-foreground">{contact.name}</h3>
                                                        <Badge variant={contact.status === 'new' ? 'default' : 'secondary'}>
                                                            {contact.status === 'new' ? '🆕 جديد' : contact.status === 'read' ? '👁️ مقروء' : contact.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {contact.phone}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(contact.created_at).toLocaleDateString('ar-EG')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    <Button size="sm" variant="outline" onClick={() => setViewDetails(contact)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => setEditingContact(contact)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {contact.location_url && !contact.location_url.includes('denied') && (
                                                        <Button size="sm" variant="outline" onClick={() => window.open(contact.location_url, '_blank')}>
                                                            <MapPin className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="destructive" onClick={() => deleteContact(contact.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Message Content - Compact */}
                                            <div className="mb-2">
                                                <p className="text-xs text-muted-foreground line-clamp-2">{contact.message}</p>
                                            </div>

                                            {/* Quick Info - One Line */}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                                {contact.auto_collected_data?.tech && (
                                                    <>
                                                        <div className="flex items-center gap-1">
                                                            <Smartphone className="w-3 h-3" />
                                                            <span>{contact.auto_collected_data.tech.device_type}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="w-3 h-3" />
                                                            <span>{contact.auto_collected_data.tech.browser}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {contact.auto_collected_data?.location_ip?.city && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{contact.auto_collected_data.location_ip.city}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expandable Details */}
                                            {expandedContact === contact.id && contact.auto_collected_data && (
                                                <div className="space-y-2 mb-3 p-3 bg-secondary/10 rounded border animate-in slide-in-from-top-2">
                                                    {/* Full Message */}
                                                    <div className="p-2 bg-white rounded border">
                                                        <p className="text-xs font-semibold mb-1 text-muted-foreground">الرسالة الكاملة:</p>
                                                        <p className="text-xs whitespace-pre-wrap">{contact.message}</p>
                                                    </div>

                                                    {/* Structured Data */}
                                                    {(() => {
                                                        const lines = contact.message?.split('\n') || [];
                                                        const businessLine = lines.find(l => l.includes('Business:'));
                                                        const industryLine = lines.find(l => l.includes('Industry:'));
                                                        const serviceLine = lines.find(l => l.includes('Service Needed:'));

                                                        const business = businessLine?.replace('Business:', '').trim();
                                                        const industry = industryLine?.replace('Industry:', '').trim();
                                                        const service = serviceLine?.replace('Service Needed:', '').trim();

                                                        return (business || industry || service) ? (
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {business && (
                                                                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                                                        <p className="text-xs text-muted-foreground mb-0.5">Business</p>
                                                                        <p className="text-xs font-semibold text-blue-900">{business}</p>
                                                                    </div>
                                                                )}
                                                                {industry && (
                                                                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                                                        <p className="text-xs text-muted-foreground mb-0.5">Industry</p>
                                                                        <p className="text-xs font-semibold text-blue-900">{industry}</p>
                                                                    </div>
                                                                )}
                                                                {service && (
                                                                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                                                        <p className="text-xs text-muted-foreground mb-0.5">Service</p>
                                                                        <p className="text-xs font-semibold text-blue-900">{service}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : null;
                                                    })()}

                                                    {/* Technical Details */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {contact.auto_collected_data.tech && (
                                                            <div className="p-2 bg-purple-50 rounded border border-purple-200">
                                                                <p className="text-xs text-muted-foreground mb-1">تقني</p>
                                                                <div className="space-y-0.5 text-xs">
                                                                    <p><span className="font-semibold">OS:</span> {contact.auto_collected_data.tech.os}</p>
                                                                    <p><span className="font-semibold">Screen:</span> {contact.auto_collected_data.tech.screen_width}px</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {contact.auto_collected_data.marketing && (
                                                            <div className="p-2 bg-orange-50 rounded border border-orange-200">
                                                                <p className="text-xs text-muted-foreground mb-1">تسويق</p>
                                                                <div className="space-y-0.5 text-xs">
                                                                    <p><span className="font-semibold">Source:</span> {contact.auto_collected_data.marketing.source || 'direct'}</p>
                                                                    <p><span className="font-semibold">Medium:</span> {contact.auto_collected_data.marketing.medium || 'none'}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setExpandedContact(expandedContact === contact.id ? null : contact.id)}
                                                    className="flex-1"
                                                >
                                                    {expandedContact === contact.id ? (
                                                        <>
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            إخفاء
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            عرض المزيد
                                                        </>
                                                    )}
                                                </Button>
                                                {contact.status === 'new' && (
                                                    <Button size="sm" onClick={() => updateContactStatus(contact.id, 'read')} variant="outline">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        تحديد كمقروء
                                                    </Button>
                                                )}
                                                {contact.status === 'read' && (
                                                    <Button size="sm" onClick={() => updateContactStatus(contact.id, 'new')} variant="outline">
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        إرجاع لجديد
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Edit Order Dialog */}
                <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
                    <DialogContent className="max-w-2xl" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>تعديل الطلب</DialogTitle>
                            <DialogDescription>قم بتعديل بيانات الطلب</DialogDescription>
                        </DialogHeader>
                        {editingOrder && (
                            <div className="space-y-4">
                                <div>
                                    <Label>اسم العميل</Label>
                                    <Input
                                        value={editingOrder.client_name}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, client_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>رقم الهاتف</Label>
                                    <Input
                                        value={editingOrder.phone}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>المبلغ الإجمالي</Label>
                                    <Input
                                        type="number"
                                        value={editingOrder.total_price}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, total_price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>الحالة</Label>
                                    <Select value={editingOrder.status} onValueChange={(value) => setEditingOrder({ ...editingOrder, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">قيد المعالجة</SelectItem>
                                            <SelectItem value="completed">مكتمل</SelectItem>
                                            <SelectItem value="cancelled">ملغي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingOrder(null)}>إلغاء</Button>
                            <Button onClick={updateOrder}>حفظ التعديلات</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Contact Dialog */}
                <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
                    <DialogContent className="max-w-2xl" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>تعديل الرسالة</DialogTitle>
                            <DialogDescription>قم بتعديل بيانات الرسالة</DialogDescription>
                        </DialogHeader>
                        {editingContact && (
                            <div className="space-y-4">
                                <div>
                                    <Label>الاسم</Label>
                                    <Input
                                        value={editingContact.name}
                                        onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>رقم الهاتف</Label>
                                    <Input
                                        value={editingContact.phone}
                                        onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>الرسالة</Label>
                                    <Textarea
                                        value={editingContact.message}
                                        onChange={(e) => setEditingContact({ ...editingContact, message: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label>الحالة</Label>
                                    <Select value={editingContact.status} onValueChange={(value) => setEditingContact({ ...editingContact, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">جديد</SelectItem>
                                            <SelectItem value="read">مقروء</SelectItem>
                                            <SelectItem value="replied">تم الرد</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingContact(null)}>إلغاء</Button>
                            <Button onClick={updateContact}>حفظ التعديلات</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* View Details Dialog */}
                <Dialog open={!!viewDetails} onOpenChange={(open) => !open && setViewDetails(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>التفاصيل الكاملة</DialogTitle>
                        </DialogHeader>
                        {viewDetails && (
                            <div className="space-y-4">
                                <div className="bg-secondary/20 p-4 rounded-lg">
                                    <h4 className="font-bold mb-2">البيانات الأساسية</h4>
                                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(viewDetails, null, 2)}</pre>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Invoice Dialog */}
                <Dialog open={!!invoiceOrder} onOpenChange={(open) => !open && setInvoiceOrder(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-2xl">فاتورة الطلب 🧾</DialogTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const printContent = document.getElementById('invoice-print-area');
                                        if (printContent) {
                                            const printWindow = window.open('', '', 'width=800,height=600');
                                            printWindow?.document.write(`
                        <html dir="rtl">
                          <head>
                            <title>فاتورة - ${invoiceOrder?.client_name}</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 20px; }
                              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; }
                              .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                              .info { margin: 20px 0; }
                              .info-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #e5e7eb; }
                              .label { font-weight: bold; color: #6b7280; }
                              .value { color: #111827; }
                              .services { margin: 30px 0; }
                              .service-item { padding: 15px; margin: 10px 0; background: #f9fafb; border-radius: 8px; border-left: 4px solid #6366f1; }
                              .service-header { font-weight: bold; font-size: 18px; color: #6366f1; margin-bottom: 10px; }
                              .option { padding: 5px 0; padding-right: 20px; color: #4b5563; }
                              .total { margin-top: 30px; padding: 20px; background: linear-gradient(to right, #6366f1, #ec4899); color: white; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; }
                              .footer { margin-top: 30px; text-align: center; color: #6b7280; border-top: 2px solid #e5e7eb; padding-top: 20px; }
                              @media print { button { display: none; } }
                            </style>
                          </head>
                          <body>${printContent.innerHTML}</body>
                        </html>
                      `);
                                            printWindow?.document.close();
                                            setTimeout(() => {
                                                printWindow?.print();
                                                printWindow?.close();
                                            }, 250);
                                        }
                                    }}
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    طباعة
                                </Button>
                            </div>
                        </DialogHeader>
                        {invoiceOrder && (
                            <div id="invoice-print-area">
                                {/* Invoice Header */}
                                <div className="text-center border-b-4 border-purple-500 pb-6 mb-6">
                                    <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Lumos Agency
                                    </h1>
                                    <p className="text-muted-foreground">وكالة لوموس للتسويق الرقمي</p>
                                    <div className="flex items-center justify-center gap-2 mt-4">
                                        <Badge variant="outline" className="text-lg">
                                            فاتورة رقم: {invoiceOrder.id.slice(0, 8).toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Client Info */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShoppingCart className="w-5 h-5" />
                                            بيانات العميل
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-muted-foreground">الاسم</Label>
                                                <p className="text-lg font-bold">{invoiceOrder.client_name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">رقم الهاتف</Label>
                                                <p className="text-lg font-bold flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    {invoiceOrder.phone}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">تاريخ الطلب</Label>
                                                <p className="text-lg font-bold flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(invoiceOrder.created_at).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">الحالة</Label>
                                                <p className="text-lg font-bold">
                                                    <Badge variant={invoiceOrder.status === 'completed' ? 'default' : 'secondary'} className="text-base">
                                                        {invoiceOrder.status === 'pending' ? '⏳ قيد المعالجة' : invoiceOrder.status === 'completed' ? '✅ مكتمل' : invoiceOrder.status}
                                                    </Badge>
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Services */}
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            الخدمات المطلوبة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {invoiceOrder.plan_details && typeof invoiceOrder.plan_details === 'object' && (
                                            <div className="space-y-4">
                                                {/* Plan Type */}
                                                {invoiceOrder.plan_details.planType && (
                                                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border-2 border-purple-500/30">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                                                                نوع الباقة
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xl font-bold">
                                                            {invoiceOrder.plan_details.planType === 'ready' ? '📦 باقة جاهزة' : '✨ باقة مخصصة'}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Ready Plan */}
                                                {invoiceOrder.plan_details.selectedPlan && (
                                                    <div className="p-4 bg-blue-500/10 rounded-lg border-2 border-blue-500/30">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Badge className="bg-blue-600">الباقة المختارة</Badge>
                                                        </div>
                                                        <p className="text-2xl font-black mb-2">{invoiceOrder.plan_details.selectedPlan.name}</p>
                                                        {invoiceOrder.plan_details.selectedPlan.description && (
                                                            <p className="text-muted-foreground mb-4">{invoiceOrder.plan_details.selectedPlan.description}</p>
                                                        )}
                                                        {invoiceOrder.plan_details.selectedPlan.features && invoiceOrder.plan_details.selectedPlan.features.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="font-bold mb-2 text-sm text-muted-foreground">المميزات:</p>
                                                                <div className="grid gap-2">
                                                                    {invoiceOrder.plan_details.selectedPlan.features.map((feature: string, idx: number) => (
                                                                        <div key={idx} className="flex items-start gap-2 text-sm">
                                                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                            <span>{feature}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Custom Plan Services */}
                                                {invoiceOrder.plan_details.selectedServices && invoiceOrder.plan_details.selectedServices.length > 0 && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Badge className="bg-purple-600">الخدمات المخصصة</Badge>
                                                        </div>
                                                        {invoiceOrder.plan_details.selectedServices.map((service: any, idx: number) => (
                                                            <div key={idx} className="p-4 bg-secondary/30 rounded-lg border-r-4 border-purple-500">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h4 className="text-lg font-bold text-purple-600">{service.name}</h4>
                                                                    <Badge variant="secondary">{service.price?.toLocaleString()} جنيه</Badge>
                                                                </div>
                                                                {service.options && service.options.length > 0 && (
                                                                    <div className="space-y-2 mt-3 pr-4">
                                                                        <p className="text-sm font-bold text-muted-foreground">الخيارات المحددة:</p>
                                                                        {service.options.map((option: any, optIdx: number) => (
                                                                            <div key={optIdx} className="flex items-start gap-2">
                                                                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                                <div className="flex-1">
                                                                                    <p className="font-medium">{option.label}</p>
                                                                                    {option.price > 0 && (
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            +{option.price.toLocaleString()} جنيه
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Total */}
                                <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm opacity-90 mb-1">الإجمالي</p>
                                                <p className="text-4xl font-black">{invoiceOrder.total_price.toLocaleString()} جنيه</p>
                                            </div>
                                            <DollarSign className="w-16 h-16 opacity-50" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Technical Info */}
                                {invoiceOrder.auto_collected_data && (
                                    <Card className="mt-6">
                                        <CardHeader>
                                            <CardTitle className="text-sm">معلومات إضافية</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                                {invoiceOrder.auto_collected_data.tech && (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <Smartphone className="w-3 h-3 text-muted-foreground" />
                                                            <span>{invoiceOrder.auto_collected_data.tech.device_type}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="w-3 h-3 text-muted-foreground" />
                                                            <span>{invoiceOrder.auto_collected_data.tech.browser}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {invoiceOrder.auto_collected_data.location_ip && (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3 h-3 text-muted-foreground" />
                                                            <span>{invoiceOrder.auto_collected_data.location_ip.city}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {invoiceOrder.auto_collected_data.marketing && (
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                                        <span>المصدر: {invoiceOrder.auto_collected_data.marketing.source || 'direct'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Footer */}
                                <div className="mt-8 pt-6 border-t-2 text-center text-sm text-muted-foreground">
                                    <p className="font-bold mb-2">شكراً لتعاملكم معنا! 🙏</p>
                                    <p>Lumos Agency - وكالة لوموس للتسويق الرقمي</p>
                                    <p className="mt-2">للاستفسارات: تواصل معنا عبر الموقع الإلكتروني</p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Dashboard;
