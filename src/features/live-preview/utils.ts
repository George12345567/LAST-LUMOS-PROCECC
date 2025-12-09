import type { Theme } from "@/types";

// Determine text color based on theme brightness
export const getTextColor = (selectedTheme: string): string => {
    const lightThemes = ["default"];
    if (lightThemes.includes(selectedTheme)) {
        return "text-foreground";
    }
    return "text-white";
};

// Get secondary text color based on theme
export const getTextColorSecondary = (selectedTheme: string): string => {
    const lightThemes = ["default"];
    if (lightThemes.includes(selectedTheme)) {
        return "text-muted-foreground";
    }
    return "text-white/70";
};

// Generate QR Code URL
export const generateQRCode = (businessName: string, serviceType: string, selectedTheme: string, itemsCount: number): string => {
    const data = encodeURIComponent(JSON.stringify({
        name: businessName,
        serviceType,
        theme: selectedTheme,
        items: itemsCount,
    }));
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
};

// Update custom theme colors
export const updateCustomTheme = (
    customTheme: { primary: string; accent: string; gradient: string },
    colorType: "primary" | "accent",
    color: string
): { primary: string; accent: string; gradient: string } => {
    const newTheme = { ...customTheme, [colorType]: color };
    const gradient = `linear-gradient(135deg, ${newTheme.primary}, ${newTheme.accent})`;
    return { ...newTheme, gradient };
};

// Calculate statistics from menu items
export const calculateStats = (items: any[]) => {
    return {
        totalItems: items.length,
        totalValue: items.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0),
        averagePrice: items.length > 0
            ? items.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0) / items.length
            : 0,
        featuredCount: items.filter(item => item.featured).length,
        categoriesCount: new Set(items.map(item => item.category)).size,
    };
};
