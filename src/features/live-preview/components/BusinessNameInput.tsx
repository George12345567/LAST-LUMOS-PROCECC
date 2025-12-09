import { CheckCircle2 } from "lucide-react";
import type { ServiceType } from "@/types";

interface BusinessNameInputProps {
    businessName: string;
    onChange: (name: string) => void;
    currentServiceType: ServiceType;
}

const BusinessNameInput = ({ businessName, onChange, currentServiceType }: BusinessNameInputProps) => {
    return (
        <div className="glass-card p-3 sm:p-4 rounded-xl glow-border-hover">
            <label
                htmlFor="business-name"
                className="block text-foreground mb-2 sm:mb-3 font-semibold text-sm sm:text-base"
            >
                اسم {currentServiceType.name}
            </label>
            <div className="relative">
                <input
                    id="business-name"
                    type="text"
                    value={businessName}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 sm:py-2.5 bg-input border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground font-medium text-sm"
                    placeholder={currentServiceType.placeholder}
                    maxLength={30}
                />
                {businessName.trim() && (
                    <CheckCircle2 className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary animate-fade-in" />
                )}
            </div>
        </div>
    );
};

export default BusinessNameInput;
