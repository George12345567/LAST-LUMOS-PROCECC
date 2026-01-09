// Simple Logo Studio - Compatible with current types
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, Download } from 'lucide-react';
import type { LogoDesign } from '../types';

interface LogoStudioProps {
  logoDesign: LogoDesign | null;
  onUpdate: (updates: Partial<LogoDesign>) => void;
  onSave: () => void;
  syncEnabled?: boolean;
  onSyncColors?: (colors: string[]) => void;
}

const LogoStudio: React.FC<LogoStudioProps> = ({
  logoDesign,
  onUpdate,
  onSave,
  syncEnabled = false
}) => {
  const config = logoDesign?.config || {
    text: 'Logo',
    fontFamily: 'Cairo',
    fontWeight: '700',
    fontSize: 48,
    letterSpacing: 0,
    textGradient: true,
    textColorStart: '#6366f1',
    textColorEnd: '#a855f7',
    iconName: 'Sparkles',
    iconSize: 48,
    iconRotation: 0,
    iconGradient: true,
    iconColorStart: '#6366f1',
    iconColorEnd: '#a855f7',
    layoutMode: 'row' as const,
    gap: 16,
    padding: 32,
    bgType: 'transparent' as const,
    bgColorStart: '#ffffff',
    bgColorEnd: '#f8fafc',
    borderRadius: 16,
    shadow: false,
    glow: false
  };

  const handleUpdate = (updates: Record<string, unknown>) => {
    if (!logoDesign) return;
    onUpdate({
      ...logoDesign,
      config: { ...config, ...updates }
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-slate-900">Logo Studio</h2>
        </div>
        <Button onClick={onSave} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Preview */}
          <Card>
            <CardContent className="p-12">
              <div 
                className="flex items-center justify-center gap-4 p-8 rounded-xl"
                style={{
                  flexDirection: config.layoutMode === 'column' ? 'column' : 'row',
                  gap: `${config.gap}px`,
                  padding: `${config.padding}px`,
                  backgroundColor: config.bgType === 'solid' ? config.bgColorStart : 'transparent',
                  borderRadius: `${config.borderRadius}px`
                }}
              >
                <div 
                  className="text-6xl font-bold"
                  style={{
                    fontFamily: config.fontFamily,
                    fontSize: `${config.fontSize}px`,
                    fontWeight: config.fontWeight,
                    background: config.textGradient 
                      ? `linear-gradient(135deg, ${config.textColorStart}, ${config.textColorEnd})`
                      : config.textColorStart,
                    WebkitBackgroundClip: config.textGradient ? 'text' : 'initial',
                    WebkitTextFillColor: config.textGradient ? 'transparent' : 'initial',
                    color: config.textGradient ? 'transparent' : config.textColorStart
                  }}
                >
                  {config.text || 'Logo'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Logo Text</Label>
                <Input
                  value={config.text}
                  onChange={(e) => handleUpdate({ text: e.target.value })}
                  placeholder="Enter logo text..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Font Size: {config.fontSize}px</Label>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    value={config.fontSize}
                    onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label>Gap: {config.gap}px</Label>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    value={config.gap}
                    onChange={(e) => handleUpdate({ gap: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Text Color Start</Label>
                  <Input
                    type="color"
                    value={config.textColorStart}
                    onChange={(e) => handleUpdate({ textColorStart: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Text Color End</Label>
                  <Input
                    type="color"
                    value={config.textColorEnd}
                    onChange={(e) => handleUpdate({ textColorEnd: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Background Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={config.bgType === 'transparent' ? 'default' : 'outline'}
                    onClick={() => handleUpdate({ bgType: 'transparent' })}
                    size="sm"
                  >
                    Transparent
                  </Button>
                  <Button
                    variant={config.bgType === 'solid' ? 'default' : 'outline'}
                    onClick={() => handleUpdate({ bgType: 'solid' })}
                    size="sm"
                  >
                    Solid
                  </Button>
                  <Button
                    variant={config.bgType === 'gradient' ? 'default' : 'outline'}
                    onClick={() => handleUpdate({ bgType: 'gradient' })}
                    size="sm"
                  >
                    Gradient
                  </Button>
                </div>
              </div>

              {config.bgType !== 'transparent' && (
                <div>
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={config.bgColorStart}
                    onChange={(e) => handleUpdate({ bgColorStart: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-slate-500">
            {syncEnabled && '🔄 Sync Enabled - Colors will update app design'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoStudio;
