import { Home, Search, ShoppingCart, User } from "lucide-react";
import type { NavPlacement, NavStyle } from "@/features/live-preview/templates";

type PageType = "home" | "menu" | "cart" | "profile";

interface AppNavigationProps {
    currentPage: PageType;
    cartCount: number;
    onNavigate: (page: PageType) => void;
    styleVariant: NavStyle;
    placement: NavPlacement;
    effectiveAccent: string;
    effectiveGradient: string;
    isDarkLike: boolean;
}

const navItems: { id: PageType; label: string; icon: typeof Home }[] = [
    { id: "home", icon: Home, label: "Home" },
    { id: "menu", icon: Search, label: "Menu" },
    { id: "cart", icon: ShoppingCart, label: "Cart" },
    { id: "profile", icon: User, label: "Profile" },
];

const AppNavigation = ({
    currentPage,
    cartCount,
    onNavigate,
    styleVariant,
    placement,
    effectiveAccent,
    effectiveGradient,
    isDarkLike,
}: AppNavigationProps) => {
    const navBg = isDarkLike
        ? "bg-slate-900 border-slate-700"
        : "bg-white border-slate-200";

    const isSide = placement === "side";
    const isFloatingPlacement = placement === "floating";

    const containerClass = isSide
        ? `h-full w-[72px] border-r ${navBg} flex flex-col items-center justify-around py-2`
        : `${isFloatingPlacement ? "mx-3 mb-2 mt-1 rounded-2xl shadow-lg border " : "border-t "}${navBg} px-2 py-1.5 flex items-center justify-around`;

    return (
        <div className={containerClass}>
            {navItems.map(({ id, icon: Icon, label }) => {
                const active = currentPage === id;
                const badge = id === "cart" && cartCount > 0;

                if (styleVariant === "pill") {
                    return (
                        <button
                            key={id}
                            onClick={() => onNavigate(id)}
                            className={`relative flex ${isSide ? "flex-col" : "items-center"} gap-1.5 py-1.5 px-2 rounded-full transition-all ${active ? "text-white" : ""}`}
                            style={active ? { background: effectiveGradient } : {}}
                        >
                            <Icon className={`w-4 h-4 ${!active ? "text-slate-400" : ""}`} />
                            {!isSide && active && <span className="text-[10px] font-bold">{label}</span>}
                            {isSide && <span className={`text-[9px] ${active ? "font-bold" : "text-slate-400"}`}>{label}</span>}
                            {badge && <span className="absolute -top-0.5 right-0 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">{cartCount}</span>}
                        </button>
                    );
                }

                if (styleVariant === "neon") {
                    return (
                        <button
                            key={id}
                            onClick={() => onNavigate(id)}
                            className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${active ? "" : "text-slate-500"}`}
                            style={active ? { color: effectiveAccent, filter: `drop-shadow(0 0 6px ${effectiveAccent})` } : {}}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-[9px] font-medium">{label}</span>
                            {badge && <span className="absolute -top-0.5 right-0 w-3.5 h-3.5 rounded-full text-[8px] text-white flex items-center justify-center font-bold" style={{ background: effectiveAccent }}>{cartCount}</span>}
                        </button>
                    );
                }

                if (styleVariant === "block") {
                    return (
                        <button
                            key={id}
                            onClick={() => onNavigate(id)}
                            className={`relative ${isSide ? "w-full" : "flex-1"} flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all ${active ? "text-white font-bold" : ""}`}
                            style={active ? { background: effectiveGradient } : {}}
                        >
                            <Icon className={`w-4 h-4 ${!active ? "text-slate-400" : ""}`} />
                            <span className={`text-[9px] ${!active ? "text-slate-400" : "font-bold"}`}>{label}</span>
                            {badge && <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">{cartCount}</span>}
                        </button>
                    );
                }

                if (styleVariant === "minimal") {
                    return (
                        <button
                            key={id}
                            onClick={() => onNavigate(id)}
                            className="relative flex flex-col items-center gap-0.5 py-1 px-2"
                        >
                            <Icon className={`w-4 h-4 ${active ? "" : "text-slate-400"}`} style={active ? { color: effectiveAccent } : {}} />
                            {active && <div className="w-1 h-1 rounded-full" style={{ background: effectiveAccent }} />}
                            {isSide && <span className="text-[9px] text-slate-400">{label}</span>}
                            {badge && <span className="absolute -top-0.5 right-0 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">{cartCount}</span>}
                        </button>
                    );
                }

                return (
                    <button
                        key={id}
                        onClick={() => onNavigate(id)}
                        className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${active ? "" : "text-slate-400"}`}
                        style={active ? { color: effectiveAccent } : {}}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium">{label}</span>
                        {badge && <span className="absolute -top-0.5 right-0 w-3.5 h-3.5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{cartCount}</span>}
                    </button>
                );
            })}
        </div>
    );
};

export default AppNavigation;
