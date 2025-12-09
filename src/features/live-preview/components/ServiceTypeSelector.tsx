import { CheckCircle2 } from "lucide-react";
import type { ServiceType } from "@/types";

interface ServiceTypeSelectorProps {
    serviceTypes: ServiceType[];
    selectedType: string;
    onSelect: (type: string) => void;
}

const ServiceTypeSelector = ({ serviceTypes, selectedType, onSelect }: ServiceTypeSelectorProps) => {
    return (
        <div className="glass-card p-2.5 sm:p-3 rounded-xl glow-border-hover">
            <label className="block text-foreground mb-2 font-semibold text-xs sm:text-sm">
                نوع الخدمة
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {serviceTypes.map((st) => (
                    <button
                        key={st.id}
                        onClick={() => onSelect(st.id)}
                        className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all relative ${selectedType === st.id
                                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                    >
                        <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                            <div className={`${selectedType === st.id ? "text-primary" : "text-muted-foreground"} scale-90 sm:scale-100`}>
                                {st.icon}
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-foreground">{st.name}</span>
                        </div>
                        {selectedType === st.id && (
                            <CheckCircle2 className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ServiceTypeSelector;
