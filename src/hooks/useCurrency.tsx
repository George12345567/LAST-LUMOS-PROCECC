import { useMemo } from 'react';

interface CurrencyData {
    country: string;
    countryCode: string;
    currency: 'EGP' | 'USD';
    currencySymbol: string;
    exchangeRate: number;
    isEgypt: boolean;
    loading: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * useCurrency Hook - STATIC EGYPT-ONLY VERSION
 * ═══════════════════════════════════════════════════════════════════
 * 
 * REMOVED: Geolocation API detection (causes crashes when blocked)
 * HARDCODED: Egypt (EGP) values for stability
 * 
 * This hook now returns static values immediately without any API calls.
 * ═══════════════════════════════════════════════════════════════════
 */
export const useCurrency = () => {
    const currencyData: CurrencyData = useMemo(() => ({
        country: 'Egypt',
        countryCode: 'EG',
        currency: 'EGP',
        currencySymbol: 'ج.م',
        exchangeRate: 1,
        isEgypt: true,
        loading: false,
    }), []);

    const convertPrice = (priceInEGP: number): number => {
        // Always return EGP price as-is
        return priceInEGP;
    };

    const formatPrice = (priceInEGP: number): string => {
        // Always format in EGP
        return `${priceInEGP.toLocaleString()} ج.م`;
    };

    return {
        ...currencyData,
        convertPrice,
        formatPrice,
    };
};

