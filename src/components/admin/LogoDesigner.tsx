import React, { useState, useRef, useEffect } from 'react';
import {
    Type,
    Palette,
    Layout,
    Save,
    Sparkles,
    Undo,
    Check,
    Shirt,
    Monitor,
    CreditCard,
    Search,
    Zap,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';

import { LogoRenderer, LogoConfig } from './logo/LogoRenderer';
import TShirtMockup from '@/features/live-preview/components/mockups/TShirtMockup';
import NeonMockup from '@/features/live-preview/components/mockups/NeonMockup';
import WebMockup from '@/features/live-preview/components/mockups/WebMockup'; // Reusing WebMockup if suitable, or placeholder

// --- Config & Constants ---

const DEFAULT_CONFIG: LogoConfig = {
    text: 'BRAND',
    fontFamily: 'Inter',
    fontWeight: '800',
    fontSize: 64,
    letterSpacing: -2,
    textGradient: false,
    textColorStart: '#1e293b',
    textColorEnd: '#334155',

    iconName: 'Zap',
    iconSize: 56,
    iconRotation: 0,
    iconGradient: true,
    iconColorStart: '#6366f1',
    iconColorEnd: '#a855f7',

    layoutMode: 'row',
    gap: 16,
    padding: 32,

    bgType: 'transparent',
    bgColorStart: '#ffffff',
    bgColorEnd: '#f8fafc',
    borderRadius: 16,
    shadow: false,
    glow: false
};

const FONTS = [
    'Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Open Sans', 'Lato', 'Poppins', 'Oswald', 'Raleway'
];

const CURATED_ICONS = [
    'Zap', 'Activity', 'Box', 'Hexagon', 'Triangle', 'Circle', 'Star', 'Sun', 'Moon', 'Cloud',
    'Cpu', 'Database', 'Globe', 'Anchor', 'Feather', 'Send', 'Layers', 'Command', 'Hash', 'Code'
];

const THEMES = [
    { name: 'Tech', colors: ['#3b82f6', '#8b5cf6'], font: 'Inter', icons: ['Cpu', 'Zap', 'Code'] },
    { name: 'Nature', colors: ['#22c55e', '#14b8a6'], font: 'Montserrat', icons: ['Leaf', 'TreePine', 'Sprout'] },
    { name: 'Modern', colors: ['#1e293b', '#64748b'], font: 'Oswald', icons: ['Hexagon', 'Box', 'Layers'] },
    { name: 'Retro', colors: ['#f59e0b', '#ef4444'], font: 'Playfair Display', icons: ['Star', 'Sun', 'Camera'] },
    { name: 'Luxury', colors: ['#fbbf24', '#78350f'], font: 'Playfair Display', icons: ['Crown', 'Gem', 'Star'] }
];

interface LogoDesignerProps {
    initialConfig?: Partial<LogoConfig>;
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
}

const LogoDesigner: React.FC<LogoDesignerProps> = ({ initialConfig, onSave, onCancel }) => {
    // Merge initial config safely
    const [config, setConfig] = useState<LogoConfig>({
        ...DEFAULT_CONFIG,
        ...initialConfig as any,
        iconRotation: (initialConfig as any)?.iconRotation || 0,
        layoutMode: (initialConfig as any)?.iconPosition === 'top' ? 'column' :
            (initialConfig as any)?.iconPosition === 'bottom' ? 'column-reverse' :
                (initialConfig as any)?.iconPosition === 'right' ? 'row-reverse' : 'row'
    });

    const [activeTab, setActiveTab] = useState("design");
    const [activeMockup, setActiveMockup] = useState<'canvas' | 'tshirt' | 'neon' | 'card'>('canvas');
    const [searchTerm, setSearchTerm] = useState('');
    const [history, setHistory] = useState<LogoConfig[]>([]);

    const iconList = Object.keys(LucideIcons)
        .filter(key => key !== 'createLucideIcon' && key !== 'default')
        .filter(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 100);

    // --- Actions ---

    const updateConfig = (newConfig: LogoConfig) => {
        if (history.length > 10) setHistory([...history.slice(1), config]);
        else setHistory([...history, config]);
        setConfig(newConfig);
    };

    const undo = () => {
        if (history.length > 0) {
            const previous = history[history.length - 1];
            setConfig(previous);
            setHistory(history.slice(0, -1));
        }
    };

    const randomize = () => {
        const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
        const randomIcon = theme.icons[Math.floor(Math.random() * theme.icons.length)] || 'Zap';
        const modes: LogoConfig['layoutMode'][] = ['row', 'column', 'row-reverse'];

        updateConfig({
            ...config,
            fontFamily: theme.font,
            iconName: randomIcon,
            layoutMode: modes[Math.floor(Math.random() * modes.length)],
            iconColorStart: theme.colors[0],
            iconColorEnd: theme.colors[1],
            textColorStart: '#1e293b',
            iconSize: Math.floor(Math.random() * (80 - 40) + 40),
            fontSize: Math.floor(Math.random() * (70 - 40) + 40),
            text: config.text
        });
        toast(`✨ Applied theme: ${theme.name}`);
    };

    // --- Save Logic (DOM Capture) ---
    const handleSaveSafe = () => {
        const hiddenSvg = document.getElementById('hidden-export-renderer');
        if (hiddenSvg) {
            // For LogoRenderer, we need to capture the DOM structure.
            // Since LogoRenderer is React, let's use the hidden container approach again but cleaner.
            // Actually, LogoRenderer renders a DIV structure. To save as PNG we need HTML-to-Image serialization.
            // Re-using the SVG ForeignObject trick for reliable cross-browser export without html2canvas deps.

            // ... [Logic mirrors previous safe implementation] ...
            // We'll rely on the existing hidden SVG structure at the bottom of the component.

            const svgEl = hiddenSvg.querySelector('svg');
            if (svgEl) {
                const svgData = new XMLSerializer().serializeToString(svgEl);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const PADDING = 40;
                    // Measure content
                    const content = svgEl.querySelector('foreignObject > div');
                    const bbox = content ? content.getBoundingClientRect() : { width: 800, height: 600 };

                    canvas.width = (bbox.width + PADDING) * 2;
                    canvas.height = (bbox.height + PADDING) * 2;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.scale(2, 2);
                        ctx.drawImage(img, PADDING / 2, PADDING / 2);
                        onSave(canvas.toDataURL('image/png'));
                    }
                };
                img.src = url;
            }
        }
    };

    return (
        <div className="flex h-[750px] w-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-2xl relative font-sans">

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-none">Logo Studio</span>
                        <span className="text-[10px] text-purple-400 font-medium tracking-widest uppercase">Ultra Edition</span>
                    </div>
                </div>

                {/* View Switcher (Center) */}
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button onClick={() => setActiveMockup('canvas')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeMockup === 'canvas' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>Canvas</button>
                    <button onClick={() => setActiveMockup('tshirt')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeMockup === 'tshirt' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><Shirt className="w-4 h-4" /></button>
                    <button onClick={() => setActiveMockup('neon')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeMockup === 'neon' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><Zap className="w-4 h-4" /></button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={undo} disabled={history.length === 0} className="text-slate-400 hover:text-white">
                        <Undo className="w-4 h-4" />
                    </Button>
                    <div className="h-6 w-px bg-slate-700 mx-2" />
                    <Button
                        onClick={randomize}
                        className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white border-0 shadow-lg shadow-pink-500/20"
                    >
                        <Sparkles className="w-4 h-4 mr-2" /> Magic
                    </Button>
                    <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white ml-2">Close</Button>
                    <Button onClick={handleSaveSafe} className="bg-white text-slate-900 hover:bg-slate-200 font-bold ml-2">
                        <Check className="w-4 h-4 mr-2" /> Save
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex relative top-16 h-[calc(100%-4rem)]">

                {/* Left Floating Panel - Controls */}
                <div className="w-[340px] h-full p-4 overflow-hidden z-10">
                    <div className="h-full bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <TabsList className="bg-slate-900/50 p-1 m-4 mb-2 rounded-xl grid grid-cols-4">
                                <TabsTrigger value="design"><Type className="w-4 h-4" /></TabsTrigger>
                                <TabsTrigger value="icon"><Sparkles className="w-4 h-4" /></TabsTrigger>
                                <TabsTrigger value="style"><Palette className="w-4 h-4" /></TabsTrigger>
                                <TabsTrigger value="mockups"><Monitor className="w-4 h-4" /></TabsTrigger>
                            </TabsList>

                            <ScrollArea className="flex-1 px-4 pb-4">
                                <div className="space-y-6 pt-2">
                                    <TabsContent value="design" className="space-y-5 m-0">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Brand Name</Label>
                                            <Input value={config.text} onChange={e => updateConfig({ ...config, text: e.target.value })} className="bg-slate-900/50 border-slate-700 text-white focus:border-purple-500" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Typography</Label>
                                            <Select value={config.fontFamily} onValueChange={val => updateConfig({ ...config, fontFamily: val })}>
                                                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                    {FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <Label className="text-slate-400 text-xs">Size & Spacing</Label>
                                            <Slider min={20} max={120} step={1} value={[config.fontSize]} onValueChange={([v]) => updateConfig({ ...config, fontSize: v })} />
                                            <Slider min={-5} max={20} step={0.5} value={[config.letterSpacing]} onValueChange={([v]) => updateConfig({ ...config, letterSpacing: v })} />
                                        </div>

                                        <div className="pt-2">
                                            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Color Palette</Label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {THEMES.map(theme => (
                                                    <div
                                                        key={theme.name}
                                                        onClick={() => updateConfig({ ...config, iconColorStart: theme.colors[0], iconColorEnd: theme.colors[1], textColorStart: '#e2e8f0' })}
                                                        className="h-8 w-8 rounded-full cursor-pointer ring-2 ring-offset-2 ring-offset-slate-900 ring-transparent hover:ring-slate-500 transition-all"
                                                        style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})` }}
                                                        title={theme.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="icon" className="space-y-5 m-0">
                                        <div className="space-y-2">
                                            <Label>Icon Search</Label>
                                            <Input
                                                className="bg-slate-900/50 border-slate-700 text-white"
                                                placeholder="Search icons..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-5 gap-2 h-[200px] overflow-y-auto pr-1">
                                            {iconList.map(iconName => {
                                                const Icon = (LucideIcons as any)[iconName];
                                                return (
                                                    <button
                                                        key={iconName}
                                                        onClick={() => updateConfig({ ...config, iconName })}
                                                        className={`aspect-square rounded-lg flex items-center justify-center transition-all ${config.iconName === iconName ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                                                    >
                                                        <Icon size={18} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="space-y-4 pt-2 border-t border-slate-700/50">
                                            <Label className="text-slate-400 text-xs">Size & Rotation</Label>
                                            <Slider min={20} max={150} step={1} value={[config.iconSize]} onValueChange={([v]) => updateConfig({ ...config, iconSize: v })} />
                                            <Slider min={0} max={360} step={15} value={[config.iconRotation]} onValueChange={([v]) => updateConfig({ ...config, iconRotation: v })} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="style" className="space-y-5 m-0">
                                        <div className="space-y-4">
                                            <Label className="text-slate-400 text-xs">Padding & Radius</Label>
                                            <Slider min={0} max={100} step={4} value={[config.padding]} onValueChange={([v]) => updateConfig({ ...config, padding: v })} />
                                            <Slider min={0} max={100} step={2} value={[config.borderRadius]} onValueChange={([v]) => updateConfig({ ...config, borderRadius: v })} />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-700/50">
                                            <div className="flex items-center justify-between">
                                                <Label>Background</Label>
                                                <Select value={config.bgType} onValueChange={(v: any) => updateConfig({ ...config, bgType: v })}>
                                                    <SelectTrigger className="w-24 h-8 text-xs bg-slate-900 border-slate-700"><SelectValue /></SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                        <SelectItem value="transparent">None</SelectItem>
                                                        <SelectItem value="solid">Solid</SelectItem>
                                                        <SelectItem value="gradient">Gradient</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {config.bgType !== 'transparent' && (
                                                <div className="flex gap-2">
                                                    <div className="flex-1 h-8 rounded overflow-hidden relative"><input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" value={config.bgColorStart} onChange={e => updateConfig({ ...config, bgColorStart: e.target.value })} /></div>
                                                    {config.bgType === 'gradient' && (
                                                        <div className="flex-1 h-8 rounded overflow-hidden relative"><input type="color" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" value={config.bgColorEnd} onChange={e => updateConfig({ ...config, bgColorEnd: e.target.value })} /></div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4 pt-4 border-t border-slate-700/50">
                                            <div className="flex items-center justify-between"><Label>Shadow</Label><Switch checked={config.shadow} onCheckedChange={c => updateConfig({ ...config, shadow: c })} /></div>
                                            <div className="flex items-center justify-between"><Label>Neon Glow</Label><Switch checked={config.glow} onCheckedChange={c => updateConfig({ ...config, glow: c })} /></div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="mockups" className="space-y-4 m-0">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => setActiveMockup('canvas')} className={`aspect-video rounded-lg border-2 flex flex-col items-center justify-center gap-2 ${activeMockup === 'canvas' ? 'border-purple-500 bg-slate-800' : 'border-slate-700 hover:bg-slate-800'}`}>
                                                <Layout className="w-6 h-6" /> <span className="text-xs">Canvas</span>
                                            </button>
                                            <button onClick={() => setActiveMockup('tshirt')} className={`aspect-video rounded-lg border-2 flex flex-col items-center justify-center gap-2 ${activeMockup === 'tshirt' ? 'border-purple-500 bg-slate-800' : 'border-slate-700 hover:bg-slate-800'}`}>
                                                <Shirt className="w-6 h-6" /> <span className="text-xs">Merch</span>
                                            </button>
                                            <button onClick={() => setActiveMockup('neon')} className={`aspect-video rounded-lg border-2 flex flex-col items-center justify-center gap-2 ${activeMockup === 'neon' ? 'border-purple-500 bg-slate-800' : 'border-slate-700 hover:bg-slate-800'}`}>
                                                <Zap className="w-6 h-6" /> <span className="text-xs">Signage</span>
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 p-2">Select a view to see how your brand looks in the real world.</p>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </Tabs>
                    </div>
                </div>

                {/* Center Canvas / Mockup Area */}
                <div className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-slate-950 flex items-center justify-center p-8 overflow-hidden relative">

                    {/* Render Active View */}
                    <div className="w-full h-full flex items-center justify-center p-8">
                        {activeMockup === 'canvas' && (
                            <div className="relative group hover:scale-[1.02] transition-transform duration-500">
                                <LogoRenderer config={config} scale={1.5} />
                            </div>
                        )}

                        {activeMockup === 'tshirt' && (
                            <div className="w-full max-w-4xl transform scale-90">
                                <TShirtMockup
                                    config={{
                                        primaryColor: config.iconColorStart,
                                        accentColor: config.iconColorEnd,
                                        brandName: config.text,
                                        tagline: 'EST. 2024',
                                        fontFamily: config.fontFamily,
                                        shirtStyle: 'street'
                                    }}
                                    logoConfig={config}
                                />
                            </div>
                        )}

                        {activeMockup === 'neon' && (
                            <div className="w-full max-w-4xl transform scale-90">
                                <NeonMockup
                                    config={{
                                        primaryColor: config.iconColorStart,
                                        accentColor: config.iconColorEnd,
                                        brandName: config.text,
                                        tagline: 'OPEN LATE',
                                        fontFamily: config.fontFamily,
                                        neonStyle: 'cyber'
                                    }}
                                    logoConfig={config}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Export Renderer (for PNG save) */}
            <div id="hidden-export-renderer" className="absolute top-0 left-0 pointer-events-none opacity-0" style={{ zIndex: -1 }}>
                {/* Recreate the exact structure inside a foreignObject for saving */}
                <svg width="0" height="0">
                    <foreignObject width="100%" height="100%">
                        <LogoRenderer config={config} disableAnimations />
                    </foreignObject>
                </svg>
            </div>
        </div>
    );
};

export default LogoDesigner;
