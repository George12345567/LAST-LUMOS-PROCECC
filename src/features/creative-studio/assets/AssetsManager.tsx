// src/features/creative-studio/assets/AssetsManager.tsx
// مدير الملفات والصور والأيقونات
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  FileImage,
  Trash2,
  Download,
  Grid,
  List,
  Search,
  FolderPlus,
  Folder,
  X,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ============= Types =============
interface Asset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'logo' | 'export';
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  folder?: string;
  tags: string[];
  createdAt: Date;
  uploadedBy?: string;
}

interface AssetFolder {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface AssetsManagerProps {
  projectId?: string;
  clientId?: string;
  onAssetSelect?: (asset: Asset) => void;
  mode?: 'full' | 'picker';
}

// ============= Mock Data =============
const SAMPLE_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'company-logo.png',
    type: 'logo',
    url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
    size: 45000,
    width: 512,
    height: 512,
    folder: 'logos',
    tags: ['logo', 'brand', 'main'],
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'hero-banner.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
    size: 125000,
    width: 1920,
    height: 1080,
    folder: 'banners',
    tags: ['hero', 'marketing'],
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'app-icon.svg',
    type: 'icon',
    url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200',
    size: 8000,
    width: 64,
    height: 64,
    folder: 'icons',
    tags: ['icon', 'app'],
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'mockup-export.png',
    type: 'export',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300',
    size: 250000,
    width: 800,
    height: 600,
    folder: 'exports',
    tags: ['export', 'mockup'],
    createdAt: new Date()
  }
];

const FOLDERS: AssetFolder[] = [
  { id: 'all', name: 'All Files', color: '#6366f1', count: 15 },
  { id: 'logos', name: 'Logos', color: '#8b5cf6', count: 4 },
  { id: 'icons', name: 'Icons', color: '#ec4899', count: 8 },
  { id: 'banners', name: 'Banners', color: '#f59e0b', count: 2 },
  { id: 'exports', name: 'Exports', color: '#10b981', count: 1 }
];

// ============= Helper Functions =============
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getAssetTypeIcon = (type: Asset['type']) => {
  switch (type) {
    case 'logo': return <Palette className="w-4 h-4" />;
    case 'icon': return <FileImage className="w-4 h-4" />;
    case 'export': return <Download className="w-4 h-4" />;
    default: return <ImageIcon className="w-4 h-4" />;
  }
};

const getAssetTypeBadge = (type: Asset['type']) => {
  const colors: Record<Asset['type'], string> = {
    logo: 'bg-purple-100 text-purple-700',
    icon: 'bg-pink-100 text-pink-700',
    image: 'bg-blue-100 text-blue-700',
    export: 'bg-green-100 text-green-700'
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

// ============= Main Component =============
export const AssetsManager: React.FC<AssetsManagerProps> = ({
  projectId,
  clientId,
  onAssetSelect,
  mode = 'full'
}) => {
  // State
  const [assets, setAssets] = useState<Asset[]>(SAMPLE_ASSETS);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isUploading, setIsUploading] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<AssetFolder[]>(FOLDERS);

  // Filter and sort assets
  const filteredAssets = assets
    .filter(asset => {
      const matchesFolder = selectedFolder === 'all' || asset.folder === selectedFolder;
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFolder && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handlers
  const handleUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newAssets: Asset[] = Array.from(files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        type: file.type.startsWith('image/svg') ? 'icon' : 'image',
        url: URL.createObjectURL(file),
        size: file.size,
        folder: selectedFolder === 'all' ? undefined : selectedFolder,
        tags: [],
        createdAt: new Date()
      }));
      
      setAssets(prev => [...newAssets, ...prev]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFolder]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const handleDelete = useCallback((assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    setSelectedAssets(prev => prev.filter(id => id !== assetId));
    toast.success('Asset deleted');
  }, []);

  const handleBulkDelete = useCallback(() => {
    setAssets(prev => prev.filter(a => !selectedAssets.includes(a.id)));
    setSelectedAssets([]);
    toast.success(`${selectedAssets.length} asset(s) deleted`);
  }, [selectedAssets]);

  const toggleSelect = useCallback((assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  }, []);

  const handleAssetClick = useCallback((asset: Asset) => {
    if (mode === 'picker' && onAssetSelect) {
      onAssetSelect(asset);
    } else {
      setPreviewAsset(asset);
    }
  }, [mode, onAssetSelect]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }, []);

  const createFolder = useCallback(() => {
    if (!newFolderName.trim()) return;
    
    const newFolder: AssetFolder = {
      id: newFolderName.toLowerCase().replace(/\s+/g, '-'),
      name: newFolderName,
      color: '#6366f1',
      count: 0
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowNewFolderDialog(false);
    toast.success('Folder created');
  }, [newFolderName]);

  return (
    <div className={`flex flex-col ${mode === 'full' ? 'h-full' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Assets Manager</h2>
            <p className="text-xs text-slate-500">{filteredAssets.length} files</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedAssets.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete ({selectedAssets.length})
            </Button>
          )}
          <label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <Button asChild variant="default" size="sm" className="cursor-pointer">
              <span>
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Folders */}
        <div className="w-48 border-r border-slate-200 bg-slate-50/50 p-3 space-y-1">
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: folder.color }}
                />
                <span>{folder.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs h-5">
                {folder.count}
              </Badge>
            </button>
          ))}
          
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors mt-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-white">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-1" /> : <SortDesc className="w-4 h-4 mr-1" />}
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    Name {sortBy === 'name' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    Date {sortBy === 'date' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>
                    Size {sortBy === 'size' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-white text-slate-500'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-white text-slate-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Drop Zone / Assets Grid */}
          <ScrollArea className="flex-1">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="p-4"
            >
              {isUploading && (
                <div className="mb-4 p-4 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl text-center">
                  <RefreshCw className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-spin" />
                  <p className="text-purple-600 font-medium">Uploading...</p>
                </div>
              )}

              {filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No assets found</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Drop files here or click upload to add assets
                  </p>
                  <label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    />
                    <Button asChild variant="outline" className="cursor-pointer">
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </span>
                    </Button>
                  </label>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {filteredAssets.map(asset => (
                      <motion.div
                        key={asset.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedAssets.includes(asset.id)
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => handleAssetClick(asset)}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(asset.id);
                          }}
                          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedAssets.includes(asset.id)
                              ? 'bg-purple-500 border-purple-500 text-white'
                              : 'bg-white/80 border-slate-300 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {selectedAssets.includes(asset.id) && <Check className="w-4 h-4" />}
                        </button>

                        {/* Image */}
                        <div className="aspect-square bg-slate-100">
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Info Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-medium truncate">{asset.name}</p>
                          <p className="text-white/70 text-xs">{formatFileSize(asset.size)}</p>
                        </div>

                        {/* Type Badge */}
                        <Badge className={`absolute top-2 right-2 text-xs ${getAssetTypeBadge(asset.type)}`}>
                          {asset.type}
                        </Badge>

                        {/* Quick Actions */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewAsset(asset);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(asset.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredAssets.map(asset => (
                      <motion.div
                        key={asset.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedAssets.includes(asset.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => handleAssetClick(asset)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(asset.id);
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedAssets.includes(asset.id)
                              ? 'bg-purple-500 border-purple-500 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedAssets.includes(asset.id) && <Check className="w-4 h-4" />}
                        </button>

                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{asset.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{formatFileSize(asset.size)}</span>
                            {asset.width && asset.height && (
                              <>
                                <span>•</span>
                                <span>{asset.width} × {asset.height}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <Badge className={`text-xs ${getAssetTypeBadge(asset.type)}`}>
                          {asset.type}
                        </Badge>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewAsset(asset);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(asset.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewAsset && getAssetTypeIcon(previewAsset.type)}
              {previewAsset?.name}
            </DialogTitle>
          </DialogHeader>
          
          {previewAsset && (
            <div className="space-y-4">
              <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-center max-h-[400px] overflow-hidden">
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-w-full max-h-[360px] object-contain rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type:</span>
                    <Badge className={getAssetTypeBadge(previewAsset.type)}>
                      {previewAsset.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Size:</span>
                    <span className="font-medium">{formatFileSize(previewAsset.size)}</span>
                  </div>
                  {previewAsset.width && previewAsset.height && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dimensions:</span>
                      <span className="font-medium">{previewAsset.width} × {previewAsset.height}px</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Folder:</span>
                    <span className="font-medium">{previewAsset.folder || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created:</span>
                    <span className="font-medium">{previewAsset.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {previewAsset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {previewAsset.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => copyToClipboard(previewAsset.url)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(previewAsset.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Original
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewAsset.url;
                    link.download = previewAsset.name;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              {mode === 'picker' && onAssetSelect && (
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  onClick={() => {
                    onAssetSelect(previewAsset);
                    setPreviewAsset(null);
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Select This Asset
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowNewFolderDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={createFolder}
                disabled={!newFolderName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetsManager;
