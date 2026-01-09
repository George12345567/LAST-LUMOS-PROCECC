import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, DollarSign, TrendingUp, TrendingDown, Users, MessageSquare } from 'lucide-react';
import { DashboardStats } from '@/types/dashboard';

interface StatsOverviewProps {
    stats: DashboardStats;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
    const cards = [
        {
            title: 'Unread Chats',
            value: stats.unreadMessages,
            icon: MessageSquare,
            desc: stats.unreadMessages > 0 ? 'Action Required' : 'All caught up',
            gradient: 'bg-gradient-to-br from-indigo-500 to-blue-600',
            textColor: 'text-white'
        },
        {
            title: 'Total Revenue',
            value: stats.totalRevenue.toLocaleString() + ' EGP',
            icon: DollarSign,
            desc: `Avg. ${Math.round(stats.avgOrderValue)} EGP/Order`,
            border: 'border-green-500/20',
            iconColor: 'text-green-500',
            valueColor: 'text-green-600'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            desc: `${stats.completedOrders} Completed · ${stats.pendingOrders} Pending`,
            border: 'border-purple-500/20',
            iconColor: 'text-purple-500',
            valueColor: 'text-purple-600'
        },
        {
            title: 'New Contacts',
            value: stats.newContacts,
            icon: Users,
            desc: `${stats.totalContacts} Total Contacts`,
            border: 'border-orange-500/20',
            iconColor: 'text-orange-500',
            valueColor: 'text-orange-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, i) => (
                <Card
                    key={i}
                    className={`relative overflow-hidden transition-all hover:scale-[1.02] shadow-sm hover:shadow-md ${card.gradient || 'bg-white'} ${card.border ? `border-2 ${card.border}` : 'border-0'}`}
                >
                    {card.gradient && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                    )}

                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-medium ${card.textColor || 'text-muted-foreground'}`}>
                            {card.title}
                        </CardTitle>
                        <card.icon className={`w-4 h-4 ${card.iconColor || 'text-white/80'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${card.valueColor || 'text-white'}`}>
                            {card.value}
                        </div>
                        <p className={`text-xs mt-1 ${card.textColor ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {card.desc}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
