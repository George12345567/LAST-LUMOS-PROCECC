import { useState, useEffect, useMemo } from 'react';

interface CurrencyData {
    country: string;
    countryCode: string;
    currency: 'EGP' | 'USD';
    currencySymbol: string;
    exchangeRate: number;
    isEgypt: boolean;
    language: 'ar' | 'en';
    loading: boolean;
}

interface GeoLocation {
    country_code: string;
    country_name: string;
    currency: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * useCurrency Hook - AUTO LOCATION DETECTION
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Automatically detects user location using IP geolocation
 * Sets language and currency based on location:
 * - Egypt → Arabic + EGP
 * - Outside Egypt → English + USD
 * 
 * ═══════════════════════════════════════════════════════════════════
 */
export const useCurrency = () => {
    const [currencyData, setCurrencyData] = useState<CurrencyData>({
        country: 'Egypt',
        countryCode: 'EG',
        currency: 'EGP',
        currencySymbol: 'ج.م',
        exchangeRate: 1,
        isEgypt: true,
        language: 'ar',
        loading: true,
    });

    useEffect(() => {
        const detectLocation = async () => {
            try {
                // Call IP geolocation API (free, no key needed)
                const response = await fetch('https://ipapi.co/json/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Geolocation API failed');
                }

                const data: GeoLocation = await response.json();

                // Check if user is in Egypt
                const isInEgypt = data.country_code === 'EG';

                // Set currency and language based on location
                setCurrencyData({
                    country: data.country_name || 'Egypt',
                    countryCode: data.country_code || 'EG',
                    currency: isInEgypt ? 'EGP' : 'USD',
                    currencySymbol: isInEgypt ? 'ج.م' : '$',
                    exchangeRate: isInEgypt ? 1 : 0.032, // Approximate EGP to USD rate
                    isEgypt: isInEgypt,
                    language: isInEgypt ? 'ar' : 'en',
                    loading: false,
                });

            } catch (error) {
                console.warn('Location detection failed, defaulting to Egypt:', error);

                // Fallback to Egypt if detection fails
                setCurrencyData({
                    country: 'Egypt',
                    countryCode: 'EG',
                    currency: 'EGP',
                    currencySymbol: 'ج.م',
                    exchangeRate: 1,
                    isEgypt: true,
                    language: 'ar',
                    loading: false,
                });
            }
        };

        detectLocation();
    }, []);

    const convertPrice = (priceInEGP: number): number => {
        if (currencyData.isEgypt) {
            return priceInEGP;
        }
        // Convert EGP to USD
        return Math.round(priceInEGP * currencyData.exchangeRate);
    };

    const formatPrice = (priceInEGP: number): string => {
        const convertedPrice = convertPrice(priceInEGP);
        return `${convertedPrice.toLocaleString()} ${currencyData.currencySymbol}`;
    };

    return {
        ...currencyData,
        convertPrice,
        formatPrice,
    };
};
