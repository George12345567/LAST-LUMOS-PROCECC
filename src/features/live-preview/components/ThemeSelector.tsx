import { Palette, CheckCircle2 } from "lucide-react";
import type { Theme } from "@/types";

interface ThemeSelectorProps {
    themes: Theme[];
    selectedTheme: string;
    onSelect: (themeId: string) => void;
}

const ThemeSelector = ({ themes, selectedTheme, onSelect }: ThemeSelectorProps) => {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-2">
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">الألوان</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => onSelect(theme.id)}
                        className={`p-2 rounded-lg border-2 transition-all relative ${selectedTheme === theme.id
                                ? "border-primary ring-1 ring-primary/30"
                                : "border-border hover:border-primary/50"
                            }`}
                    >
                        <div
                            className="w-full h-10 rounded-md mb-1.5"
                            style={{ background: theme.gradient }}
                        />
                        <div className="text-[10px] font-medium text-foreground text-center truncate">{theme.name}</div>
                        {selectedTheme === theme.id && (
                            <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-white drop-shadow-md" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeSelector;
