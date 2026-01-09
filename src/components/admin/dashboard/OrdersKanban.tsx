import { Order } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle, XCircle, MoreHorizontal, ArrowRight } from 'lucide-react';

interface OrdersKanbanProps {
    orders: Order[];
    onUpdateStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}

export const OrdersKanban = ({ orders, onUpdateStatus, onDelete }: OrdersKanbanProps) => {
    const columns = [
        { id: 'pending', title: 'Pending', color: 'orange', icon: Clock },
        { id: 'processing', title: 'Processing', color: 'blue', icon: MoreHorizontal },
        { id: 'completed', title: 'Completed', color: 'green', icon: CheckCircle },
        { id: 'cancelled', title: 'Cancelled', color: 'red', icon: XCircle },
    ];

    const getColumnOrders = (status: string) => orders.filter(o => o.status === status);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px] overflow-hidden">
            {columns.map(col => {
                const colOrders = getColumnOrders(col.id);

                return (
                    <div key={col.id} className="flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200">
                        {/* Column Header */}
                        <div className={`p-3 border-b border-${col.color}-100 bg-${col.color}-50/50 rounded-t-xl flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                                <col.icon className={`w-4 h-4 text-${col.color}-500`} />
                                <span className={`font-bold text-sm text-${col.color}-700 uppercase`}>{col.title}</span>
                            </div>
                            <Badge variant="secondary" className="bg-white/50">{colOrders.length}</Badge>
                        </div>

                        {/* Drop / List Area */}
                        <ScrollArea className="flex-1 p-2">
                            <div className="space-y-2">
                                {colOrders.length === 0 && (
                                    <div className="text-center py-8 text-slate-300 text-xs italic">
                                        No orders
                                    </div>
                                )}
                                {colOrders.map(order => (
                                    <Card key={order.id} className="bg-white hover:shadow-md transition-shadow cursor-pointer group relative hover:border-purple-200">
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{order.client_name}</h4>
                                                <span className="text-xs font-mono text-slate-400">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-500 mb-2">{order.phone}</p>

                                            <div className="flex items-center justify-between mt-3">
                                                <Badge variant="outline" className="text-[10px] font-normal border-slate-100 bg-slate-50">
                                                    {order.total_price} EGP
                                                </Badge>

                                                {/* Quick Actions */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {col.id !== 'completed' && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 text-green-600 hover:bg-green-50"
                                                            title="Advance Status"
                                                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, getNextStatus(col.id)); }}
                                                        >
                                                            <ArrowRight className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                );
            })}
        </div>
    );
};

const getNextStatus = (current: string) => {
    switch (current) {
        case 'pending': return 'processing';
        case 'processing': return 'completed';
        default: return 'completed';
    }
};
