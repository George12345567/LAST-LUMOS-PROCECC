import { useState } from "react";
import { BarChart3, ChevronUp, ChevronDown } from "lucide-react";

interface StatsPanelProps {
    stats: {
        totalItems: number;
        totalValue: number;
        averagePrice: number;
        featuredCount: number;
    };
}

const StatsPanel = ({ stats }: StatsPanelProps) => {
    const [showStats, setShowStats] = useState(false);

    return (
        <div className="glass-card p-2.5 sm:p-3 rounded-xl glow-border-hover">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="font-semibold text-xs sm:text-sm">الإحصائيات</span>
                </div>
                <button
                    onClick={() => setShowStats(!showStats)}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                >
                    {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>
            {showStats && (
                <div className="space-y-2 animate-fade-in border-t border-border pt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-secondary/50 p-2 rounded-lg">
                            <div className="text-muted-foreground mb-0.5">عدد العناصر</div>
                            <div className="font-bold text-foreground text-lg">{stats.totalItems}</div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded-lg">
                            <div className="text-muted-foreground mb-0.5">إجمالي القيمة</div>
                            <div className="font-bold text-foreground text-lg">{stats.totalValue.toFixed(0)} EGP</div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded-lg">
                            <div className="text-muted-foreground mb-0.5">متوسط السعر</div>
                            <div className="font-bold text-foreground text-lg">{stats.averagePrice.toFixed(0)} EGP</div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded-lg">
                            <div className="text-muted-foreground mb-0.5">مميز</div>
                            <div className="font-bold text-foreground text-lg">{stats.featuredCount}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsPanel;
