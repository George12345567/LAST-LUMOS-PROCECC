import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Zap } from 'lucide-react';

export interface LogoConfig {
    // Text
    text: string;
    fontFamily: string;
    fontWeight: string;
    fontSize: number;
    letterSpacing: number;
    textGradient: boolean;
    textColorStart: string;
    textColorEnd: string;

    // Icon
    iconName: string;
    iconSize: number;
    iconRotation: number;
    iconGradient: boolean;
    iconColorStart: string;
    iconColorEnd: string;

    // Layout
    layoutMode: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    gap: number;
    padding: number;

    // Container / Background
    bgType: 'transparent' | 'solid' | 'gradient';
    bgColorStart: string;
    bgColorEnd: string;
    borderRadius: number;
    shadow: boolean;
    glow: boolean;
}

interface LogoRendererProps {
    config: LogoConfig;
    scale?: number;
    className?: string;
    showBackground?: boolean;
    idPrefix?: string; // To avoid ID collisions for gradients when multiple logos are on screen
}

export const LogoRenderer: React.FC<LogoRendererProps> = ({
    config,
    scale = 1,
    className = "",
    showBackground = true,
    idPrefix = "logo"
}) => {

    const renderIcon = (size: number, color?: string) => {
        const Icon = (LucideIcons as any)[config.iconName] || Zap;
        // Adjust size by scale
        return <Icon size={size} color={color} strokeWidth={2.5} />;
    };

    // Unique IDs for gradients
    const iconGradId = `${idPrefix}-iconGradient`;

    return (
        <div
            className={`flex items-center justify-center transition-all duration-300 ${className}`}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: 'fit-content',
                height: 'fit-content',
                padding: showBackground ? `${config.padding}px` : '0px',
                gap: `${config.gap}px`,
                borderRadius: showBackground ? `${config.borderRadius}px` : '0px',
                flexDirection: config.layoutMode,

                // Background Logic
                background: !showBackground || config.bgType === 'transparent' ? 'transparent' :
                    config.bgType === 'solid' ? config.bgColorStart :
                        `linear-gradient(135deg, ${config.bgColorStart}, ${config.bgColorEnd})`,

                // Shadow & Glow Logic (Only if background is shown, usually)
                boxShadow: showBackground ? [
                    config.shadow ? '0 20px 40px -5px rgba(0,0,0,0.4)' : '',
                    config.glow ? `0 0 50px -10px ${config.iconColorStart}80` : ''
                ].filter(Boolean).join(', ') : 'none',

                border: (showBackground && config.bgType === 'transparent') ? '1px dashed rgba(255,255,255,0.1)' : 'none'
            }}
        >
            {/* Icon Layer */}
            <div style={{
                transform: `rotate(${config.iconRotation}deg)`,
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: config.iconColorStart, position: 'relative' }}>
                    {/* SVG Gradient Definition */}
                    <svg width="0" height="0" className="absolute pointer-events-none">
                        <defs>
                            <linearGradient id={iconGradId} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={config.iconColorStart} />
                                <stop offset="100%" stopColor={config.iconColorEnd} />
                            </linearGradient>
                        </defs>
                    </svg>

                    {React.cloneElement(renderIcon(config.iconSize) as any, {
                        style: {
                            stroke: config.iconGradient ? `url(#${iconGradId})` : config.iconColorStart
                        }
                    })}
                </div>
            </div>

            {/* Text Layer */}
            <div style={{
                fontFamily: config.fontFamily,
                fontWeight: config.fontWeight,
                fontSize: `${config.fontSize}px`,
                letterSpacing: `${config.letterSpacing}px`,
                lineHeight: 1,
                whiteSpace: 'nowrap',

                // Text Gradient Logic
                background: config.textGradient
                    ? `linear-gradient(to right, ${config.textColorStart}, ${config.textColorEnd})`
                    : 'none',
                WebkitBackgroundClip: config.textGradient ? 'text' : 'none',
                WebkitTextFillColor: config.textGradient ? 'transparent' : config.textColorStart,
                color: config.textGradient ? 'transparent' : config.textColorStart,
            }}>
                {config.text}
            </div>
        </div>
    );
};
