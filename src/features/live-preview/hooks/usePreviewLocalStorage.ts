import { useEffect } from "react";
import type { MenuItem } from "@/types";

interface UsePreviewLocalStorageProps {
    businessName: string;
    serviceType: string;
    selectedTheme: string;
    customItems: MenuItem[];
    hiddenDefaultItems: number[];
    hasSubmittedOnce: boolean;
}

export const usePreviewLocalStorage = ({
    businessName,
    serviceType,
    selectedTheme,
    customItems,
    hiddenDefaultItems,
    hasSubmittedOnce,
}: UsePreviewLocalStorageProps) => {
    // Save businessName
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('livePreview_businessName', businessName);
            } catch (e) {
                console.warn('Failed to save businessName to localStorage:', e);
            }
        }
    }, [businessName]);

    // Save serviceType
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('livePreview_serviceType', serviceType);
            } catch (e) {
                console.warn('Failed to save serviceType to localStorage:', e);
            }
        }
    }, [serviceType]);

    // Save selectedTheme
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('livePreview_selectedTheme', selectedTheme);
            } catch (e) {
                console.warn('Failed to save selectedTheme to localStorage:', e);
            }
        }
    }, [selectedTheme]);

    // Save customItems
    useEffect(() => {
        if (typeof window !== 'undefined' && customItems.length > 0) {
            try {
                const itemsToSave = customItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    image: item.image.length < 200 ? item.image : ''
                }));
                localStorage.setItem('livePreview_customItems', JSON.stringify(itemsToSave));
            } catch (e) {
                console.warn('Failed to save customItems to localStorage (quota exceeded):', e);
                try {
                    localStorage.removeItem('livePreview_customItems');
                } catch (clearError) {
                    console.error('Failed to clear customItems:', clearError);
                }
            }
        }
    }, [customItems]);

    // Save hasSubmittedOnce
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('livePreview_hasSubmittedOnce', String(hasSubmittedOnce));
            } catch (e) {
                console.warn('Failed to save hasSubmittedOnce to localStorage:', e);
            }
        }
    }, [hasSubmittedOnce]);

    // Save hiddenDefaultItems
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('livePreview_hiddenDefaultItems', JSON.stringify(hiddenDefaultItems));
            } catch (e) {
                console.warn('Failed to save hiddenDefaultItems to localStorage:', e);
            }
        }
    }, [hiddenDefaultItems]);
};

// Helper to load from localStorage
export const loadFromLocalStorage = (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem(key);
            if (saved !== null) {
                return key.includes('Items') ? JSON.parse(saved) : saved;
            }
        } catch (e) {
            console.warn(`Failed to load ${key} from localStorage:`, e);
        }
    }
    return defaultValue;
};
