import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Smartphone, ArrowRight, CheckCircle2, Home, Search, ShoppingCart, User, Plus, Star, Clock, Flame, Palette, Settings, Zap, ChevronDown, ChevronUp, X, Image as ImageIcon, Coffee, Scissors, Pill, Store, Building2, Download, Share2, BarChart3, SortAsc, Tablet, Monitor, QrCode, TrendingUp, Eye, Upload, Check, Heart, Bell, MapPin, Filter, Grid3x3, List, Moon, Sun, Languages, RefreshCw, Image as ImageIcon2, ZoomIn, Bookmark, MessageSquare, Award, TrendingDown, FileText, Copy, Save, History, Layers, GripVertical, Trash2, Edit2, FileSpreadsheet, Printer, Globe, Code, Gauge, Type, Move, Maximize2, Minimize2, Keyboard, HelpCircle, ChevronLeft, ChevronRight, Play, Pause, RotateCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import type { MenuItem, ServiceType, Theme, Review, Template, Version, PerformanceMetrics } from "@/types";
import { baseThemes, defaultItemsByServiceType } from "./constants";

// Service Types - Defined outside component
const serviceTypes: ServiceType[] = [
  {
    id: "restaurant",
    name: "مطعم",
    icon: <Flame className="w-5 h-5" />,
    categories: [
      { id: "all", name: "الكل", icon: "🍽️" },
      { id: "grill", name: "مشويات", icon: "🔥" },
      { id: "sandwiches", name: "سندوتشات", icon: "🥪" },
      { id: "drinks", name: "مشروبات", icon: "🥤" },
      { id: "desserts", name: "حلويات", icon: "🍰" },
    ],
    placeholder: "مثال: مطعم الكبابجي",
    itemLabel: "طبق",
  },
  {
    id: "cafe",
    name: "كافيه",
    icon: <Coffee className="w-5 h-5" />,
    categories: [
      { id: "all", name: "الكل", icon: "☕" },
      { id: "hot", name: "ساخن", icon: "🔥" },
      { id: "cold", name: "بارد", icon: "🧊" },
      { id: "desserts", name: "حلويات", icon: "🍰" },
      { id: "snacks", name: "سناكس", icon: "🍪" },
    ],
    placeholder: "مثال: كافيه لافازا",
    itemLabel: "منتج",
  },
  {
    id: "salon",
    name: "صالون",
    icon: <Scissors className="w-5 h-5" />,
    categories: [
      { id: "all", name: "الكل", icon: "✂️" },
      { id: "haircut", name: "قصات", icon: "💇" },
      { id: "styling", name: "تصفيف", icon: "💆" },
      { id: "coloring", name: "صبغات", icon: "🎨" },
      { id: "treatments", name: "علاجات", icon: "✨" },
    ],
    placeholder: "مثال: صالون الجمال",
    itemLabel: "خدمة",
  },
  {
    id: "pharmacy",
    name: "صيدلية",
    icon: <Pill className="w-5 h-5" />,
    categories: [
      { id: "all", name: "الكل", icon: "💊" },
      { id: "medicines", name: "أدوية", icon: "💉" },
      { id: "vitamins", name: "فيتامينات", icon: "🧪" },
      { id: "cosmetics", name: "مستحضرات", icon: "🧴" },
      { id: "baby", name: "أطفال", icon: "👶" },
    ],
    placeholder: "مثال: صيدلية النور",
    itemLabel: "منتج",
  },
  {
    id: "store",
    name: "متجر",
    icon: <Store className="w-5 h-5" />,
    categories: [
      { id: "all", name: "الكل", icon: "🛍️" },
      { id: "electronics", name: "إلكترونيات", icon: "📱" },
      { id: "clothing", name: "ملابس", icon: "👕" },
      { id: "home", name: "منزلية", icon: "🏠" },
      { id: "sports", name: "رياضية", icon: "⚽" },
    ],
    placeholder: "مثال: متجر الأزياء",
    itemLabel: "منتج",
  },
  {
    id: "clinic",
    name: "عيادة",
    icon: <Building2 className="w-5 h-5" />,
    categories: [
      { id: "all", name: "الكل", icon: "🏥" },
      { id: "consultation", name: "استشارات", icon: "👨‍⚕️" },
      { id: "examination", name: "فحوصات", icon: "🔬" },
      { id: "treatment", name: "علاجات", icon: "💊" },
      { id: "tests", name: "تحاليل", icon: "🧪" },
    ],
    placeholder: "مثال: عيادة النور",
    itemLabel: "خدمة",
  },
];

const LivePreviewTool = () => {
  const [businessName, setBusinessName] = useState("");
  const [serviceType, setServiceType] = useState("restaurant");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [customItems, setCustomItems] = useState<MenuItem[]>([]);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating">("name");
  const [deviceView, setDeviceView] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [showStats, setShowStats] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showRatings, setShowRatings] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [showFeatured, setShowFeatured] = useState(true);
  const [imageQuality, setImageQuality] = useState<"standard" | "hd">("standard");
  const [currentPage, setCurrentPage] = useState<"home" | "menu" | "cart" | "profile">("menu");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Advanced Features States
  const [customTheme, setCustomTheme] = useState<{ primary: string; accent: string; gradient: string }>({ primary: "#00bcd4", accent: "#00bcd4", gradient: "linear-gradient(135deg, #00bcd4, #00acc1)" });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedItemsForBulkEdit, setSelectedItemsForBulkEdit] = useState<number[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Poppins");
  const [fontWeight, setFontWeight] = useState(400);
  const [spacing, setSpacing] = useState({ padding: 16, margin: 8, borderRadius: 12 });
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [rtl, setRtl] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<Map<number, string>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [seoData, setSeoData] = useState({ title: "", description: "", keywords: "" });
  const [showSeo, setShowSeo] = useState(false);

  // Theme Options - Custom theme will be added dynamically

  // Add custom theme dynamically
  const themes: Theme[] = [
    ...baseThemes,
    {
      id: "custom",
      name: "مخصص",
      primary: customTheme.primary,
      gradient: customTheme.gradient,
      accent: customTheme.accent,
      custom: true
    },
  ];

  const currentServiceType = serviceTypes.find(st => st.id === serviceType) || serviceTypes[0];
  const categories = currentServiceType.categories;


  // Get menu items based on service type
  const menuItems = defaultItemsByServiceType[serviceType] || [];

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];

  // Determine text color based on theme brightness
  const getTextColor = () => {
    // Themes that need dark text (light backgrounds)
    const lightThemes = ["default"];
    if (lightThemes.includes(selectedTheme)) {
      return "text-foreground";
    }
    // Dark themes use white text
    return "text-white";
  };

  const getTextColorSecondary = () => {
    const lightThemes = ["default"];
    if (lightThemes.includes(selectedTheme)) {
      return "text-muted-foreground";
    }
    return "text-white/70";
  };

  // Combine default items with custom items
  const allMenuItems = [...menuItems, ...customItems];

  // Filter items by category and search
  const filteredItems = (selectedCategory === "all"
    ? allMenuItems
    : allMenuItems.filter(item => item.category === selectedCategory))
    .filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") {
        return parseFloat(a.price) - parseFloat(b.price);
      } else if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // Calculate statistics
  const stats = {
    totalItems: allMenuItems.length,
    totalValue: allMenuItems.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0),
    averagePrice: allMenuItems.length > 0
      ? allMenuItems.reduce((sum, item) => sum + parseFloat(item.price || "0"), 0) / allMenuItems.length
      : 0,
    featuredCount: allMenuItems.filter(item => item.featured).length,
    categoriesCount: new Set(allMenuItems.map(item => item.category)).size,
  };

  // Generate QR Code URL (using a free QR code API)
  const generateQRCode = () => {
    const data = encodeURIComponent(JSON.stringify({
      name: businessName,
      serviceType,
      theme: selectedTheme,
      items: allMenuItems.length,
    }));
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
  };

  // Download preview as image
  const downloadPreview = async () => {
    if (!phoneRef.current) return;

    try {
      // This would require html2canvas library - for now, show a toast
      toast.success("ميزة التحميل قريباً! يمكنك استخدام زر Print Screen لحفظ المعاينة.");
    } catch (error) {
      toast.error("حدث خطأ أثناء التحميل");
    }
  };

  // Copy shareable link
  const copyShareLink = async () => {
    const link = `${window.location.origin}${window.location.pathname}#live-preview`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("تم نسخ الرابط!");
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          toast.success("تم نسخ الرابط!");
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
          toast.error("فشل نسخ الرابط. الرابط: " + link);
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("فشل نسخ الرابط. الرابط: " + link);
    }
  };

  // Export data as JSON
  const exportData = () => {
    const data = {
      businessName,
      serviceType,
      theme: selectedTheme,
      items: allMenuItems,
      createdAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessName || "preview"}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير البيانات!");
  };

  // Import data from JSON
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.businessName) setBusinessName(data.businessName);
        if (data.serviceType) setServiceType(data.serviceType);
        if (data.theme) setSelectedTheme(data.theme);
        if (data.items && Array.isArray(data.items)) {
          setCustomItems(data.items.filter((item: MenuItem) => !menuItems.find(mi => mi.id === item.id)));
        }
        toast.success("تم استيراد البيانات بنجاح!");
      } catch (error) {
        toast.error("خطأ في قراءة الملف");
      }
    };
    reader.readAsText(file);
  };

  // Handle adding new item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.category) return;

    const item: MenuItem = {
      id: Date.now(),
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      image: newItem.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
      category: newItem.category,
      time: serviceType === "restaurant" ? "20 دقيقة" : serviceType === "cafe" ? "10 دقائق" : undefined,
      rating: 4.5,
    };

    setCustomItems([...customItems, item]);
    setNewItem({ name: "", description: "", price: "", image: "", category: currentServiceType.categories[1]?.id || "" });
    setShowAddItemForm(false);
  };

  // Handle removing custom item
  const handleRemoveItem = (id: number) => {
    setCustomItems(customItems.filter(item => item.id !== id));
  };

  // Show preview when name is entered
  useEffect(() => {
    if (businessName.trim().length > 0) {
      setIsPreviewVisible(true);
    } else {
      setIsPreviewVisible(false);
    }
  }, [businessName]);

  // Reset category when service type changes
  useEffect(() => {
    setSelectedCategory("all");
    const firstCategory = currentServiceType.categories[1]?.id || "";
    setNewItem(prev => ({ ...prev, category: firstCategory }));
  }, [serviceType, currentServiceType]);

  // ========== ADVANCED FEATURES FUNCTIONS ==========

  // Image Upload with Drag & Drop
  const handleImageUpload = useCallback((file: File, itemId?: number) => {
    if (!file.type.startsWith('image/')) {
      toast.error("الملف يجب أن يكون صورة");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (itemId) {
        setUploadedImages(prev => new Map(prev).set(itemId, imageUrl));
        setCustomItems(prev => prev.map(item =>
          item.id === itemId ? { ...item, image: imageUrl } : item
        ));
      } else {
        setNewItem(prev => ({ ...prev, image: imageUrl }));
      }
      toast.success("تم رفع الصورة بنجاح");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, itemId?: number) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file, itemId);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // CSV Import/Export
  const exportToCSV = () => {
    const headers = ["Name", "Description", "Price", "Category", "Featured", "Time", "Rating"];
    const rows = allMenuItems.map(item => [
      item.name,
      item.description,
      item.price,
      item.category,
      item.featured ? "Yes" : "No",
      item.time || "",
      item.rating?.toString() || ""
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessName || "menu"}-items.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير البيانات إلى CSV");
  };

  const importFromCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim());
        const headers = lines[0].split(",");
        const items: MenuItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          if (values.length >= 3) {
            items.push({
              id: Date.now() + i,
              name: values[0] || "",
              description: values[1] || "",
              price: values[2] || "",
              image: values[3] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
              category: values[4] || currentServiceType.categories[1]?.id || "all",
              featured: values[5]?.toLowerCase() === "yes",
              time: values[6] || undefined,
              rating: values[7] ? parseFloat(values[7]) : undefined,
            });
          }
        }
        setCustomItems(prev => [...prev, ...items]);
        toast.success(`تم استيراد ${items.length} عنصر`);
      } catch (error) {
        toast.error("خطأ في قراءة ملف CSV");
      }
    };
    reader.readAsText(file);
  };

  // Advanced Color Picker
  const updateCustomTheme = (colorType: "primary" | "accent", color: string) => {
    const newTheme = { ...customTheme, [colorType]: color };
    const gradient = `linear-gradient(135deg, ${newTheme.primary}, ${newTheme.accent})`;
    setCustomTheme({ ...newTheme, gradient });
    if (selectedTheme === "custom") {
      const updatedThemes = themes.map(t =>
        t.id === "custom" ? { ...t, primary: newTheme.primary, accent: newTheme.accent, gradient } : t
      );
      // Update theme in real-time
    }
  };

  // Bulk Edit
  const handleBulkEdit = (field: keyof MenuItem, value: any) => {
    setCustomItems(prev => prev.map(item =>
      selectedItemsForBulkEdit.includes(item.id) ? { ...item, [field]: value } : item
    ));
    toast.success(`تم تحديث ${selectedItemsForBulkEdit.length} عنصر`);
    setSelectedItemsForBulkEdit([]);
    setShowBulkEdit(false);
  };

  // Drag & Drop Reordering
  const handleDragStart = (itemId: number) => {
    setDraggedItem(itemId);
  };

  const handleDragOverItem = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === targetId) return;
    const items = [...allMenuItems];
    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);
    items.splice(targetIndex, 0, items.splice(draggedIndex, 1)[0]);
    setCustomItems(items.filter(item => !menuItems.find(mi => mi.id === item.id)));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Templates
  const saveAsTemplate = () => {
    const template: Template = {
      id: Date.now().toString(),
      name: `${businessName} Template`,
      serviceType,
      theme: selectedTheme,
      items: allMenuItems,
      description: `Template for ${businessName}`
    };
    setTemplates(prev => [...prev, template]);
    toast.success("تم حفظ القالب");
  };

  const loadTemplate = (template: Template) => {
    setBusinessName(template.name.replace(" Template", ""));
    setServiceType(template.serviceType);
    setSelectedTheme(template.theme);
    setCustomItems(template.items.filter(item => !menuItems.find(mi => mi.id === item.id)));
    toast.success("تم تحميل القالب");
  };

  // Version History
  const saveVersion = () => {
    const version: Version = {
      id: Date.now().toString(),
      name: `Version ${versions.length + 1}`,
      timestamp: new Date(),
      data: {
        businessName,
        serviceType,
        theme: selectedTheme,
        items: allMenuItems
      }
    };
    setVersions(prev => [...prev, version]);
    setCurrentVersion(version.id);
    toast.success("تم حفظ الإصدار");
  };

  const loadVersion = (version: Version) => {
    setBusinessName(version.data.businessName);
    setServiceType(version.data.serviceType);
    setSelectedTheme(version.data.theme);
    setCustomItems(version.data.items.filter(item => !menuItems.find(mi => mi.id === item.id)));
    setCurrentVersion(version.id);
    toast.success("تم تحميل الإصدار");
  };

  // Performance Metrics
  const calculatePerformance = () => {
    const itemCount = allMenuItems.length;
    const imageCount = allMenuItems.filter(item => item.image).length;
    const estimatedPageSize = itemCount * 2 + imageCount * 50; // KB
    const estimatedLoadTime = Math.max(1, estimatedPageSize / 100); // seconds
    const estimatedBundleSize = 150 + (itemCount * 0.5); // KB
    const accessibilityScore = Math.min(100, 85 + (itemCount > 0 ? 5 : 0) + (businessName ? 5 : 0) + (selectedTheme !== "default" ? 5 : 0));

    setPerformanceMetrics({
      pageSize: estimatedPageSize,
      loadTime: estimatedLoadTime,
      bundleSize: estimatedBundleSize,
      imageCount,
      accessibilityScore
    });
  };

  useEffect(() => {
    if (isPreviewVisible) {
      calculatePerformance();
    }
  }, [allMenuItems.length, businessName, selectedTheme, isPreviewVisible]);

  // Reviews System
  const addReview = (review: Omit<Review, "id" | "date">) => {
    const newReview: Review = {
      id: Date.now(),
      ...review,
      date: new Date().toLocaleDateString("ar-EG")
    };
    setReviews(prev => [...prev, newReview]);
    toast.success("تم إضافة التقييم");
  };

  // Print Preview
  const printMenu = () => {
    window.print();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            saveVersion();
            break;
          case "e":
            e.preventDefault();
            exportToCSV();
            break;
          case "i":
            e.preventDefault();
            setShowAddItemForm(true);
            break;
          case "k":
            e.preventDefault();
            setShowKeyboardShortcuts(!showKeyboardShortcuts);
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showKeyboardShortcuts]);

  // Duplicate Item
  const duplicateItem = (item: MenuItem) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now(),
      name: `${item.name} (نسخة)`
    };
    setCustomItems(prev => [...prev, newItem]);
    toast.success("تم نسخ العنصر");
  };

  const displayName = businessName.trim() || currentServiceType.name;

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCartCount(prev => prev + 1);
    // Simple animation feedback on the clicked button
    const button = event.currentTarget;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);
  };

  return (
    <section
      id="live-preview"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-orb"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-orb-delayed"></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 reveal">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/80 font-semibold">
              Advanced Live Preview Tool
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground px-2">
            جرب قبل ما تشتري{" "}
            <span className="text-primary">لأي نوع خدمة</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            اختر نوع خدمتك واكتب الاسم - معاينة فورية لحظية
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Customization Panel */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 reveal order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {/* Service Type Selector */}
            <div className="glass-card p-2.5 sm:p-3 rounded-xl glow-border-hover">
              <label className="block text-foreground mb-2 font-semibold text-xs sm:text-sm">
                نوع الخدمة
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {serviceTypes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setServiceType(st.id)}
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all relative ${serviceType === st.id
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                      <div className={`${serviceType === st.id ? "text-primary" : "text-muted-foreground"} scale-90 sm:scale-100`}>
                        {st.icon}
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-foreground">{st.name}</span>
                    </div>
                    {serviceType === st.id && (
                      <CheckCircle2 className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Input Card */}
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
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-input border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground font-medium text-sm"
                  placeholder={currentServiceType.placeholder}
                  maxLength={30}
                />
                {businessName.trim() && (
                  <CheckCircle2 className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-primary animate-fade-in" />
                )}
              </div>
            </div>

            {/* Customization Panel - Compact Design */}
            <div className="glass-card p-2.5 sm:p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="font-semibold text-xs sm:text-sm">خيارات التخصيص</span>
                </div>
                <button
                  onClick={() => setShowCustomization(!showCustomization)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  {showCustomization ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {showCustomization && (
                <div className="space-y-3 animate-fade-in border-t border-border pt-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  {/* Theme Selector - Compact Grid */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Palette className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">الألوان</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`p-2 rounded-lg border-2 transition-all relative ${selectedTheme === theme.id
                            ? "border-primary ring-1 ring-primary/30"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div
                            className="w-full h-6 rounded-md mb-1"
                            style={{ background: theme.gradient }}
                          />
                          <div className="text-[10px] font-medium text-foreground text-center">{theme.name}</div>
                          {selectedTheme === theme.id && (
                            <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Custom Items */}
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">إضافة {currentServiceType.itemLabel}</span>
                      </div>
                      <button
                        onClick={() => setShowAddItemForm(!showAddItemForm)}
                        className="p-1 rounded hover:bg-secondary transition-colors"
                      >
                        {showAddItemForm ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {showAddItemForm && (
                      <div className="space-y-2 animate-fade-in">
                        <input
                          type="text"
                          placeholder={`اسم ${currentServiceType.itemLabel}`}
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                        />
                        <textarea
                          placeholder="المواصفات / الوصف"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary min-h-[60px] resize-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="السعر (EGP)"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                          />
                          <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                          >
                            {currentServiceType.categories.filter(cat => cat.id !== "all").map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* Image Upload - Drag & Drop */}
                        <div
                          onDrop={(e) => handleDrop(e)}
                          onDragOver={handleDragOver}
                          onDragLeave={() => setIsDragging(false)}
                          className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground mb-1">
                              {newItem.image ? "تم رفع الصورة" : "اسحب الصورة هنا أو اضغط للرفع"}
                            </p>
                            {newItem.image && (
                              <img src={newItem.image} alt="Preview" className="w-full h-20 object-cover rounded mt-2" />
                            )}
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="أو أدخل رابط الصورة"
                          value={newItem.image}
                          onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                        />
                        <button
                          onClick={handleAddItem}
                          disabled={!newItem.name || !newItem.price || !newItem.category}
                          className="w-full py-1.5 px-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          إضافة {currentServiceType.itemLabel}
                        </button>
                      </div>
                    )}

                    {/* Custom Items List with Bulk Edit */}
                    {customItems.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold text-muted-foreground">{currentServiceType.itemLabel} المضافة ({customItems.length}):</span>
                          {selectedItemsForBulkEdit.length > 0 && (
                            <button
                              onClick={() => setShowBulkEdit(true)}
                              className="text-[10px] text-primary hover:underline"
                            >
                              تعديل {selectedItemsForBulkEdit.length} عنصر
                            </button>
                          )}
                        </div>
                        {customItems.map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            onDragOver={(e) => handleDragOverItem(e, item.id)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-2 p-2 bg-secondary/50 rounded-lg transition-all ${draggedItem === item.id ? "opacity-50" : ""} ${selectedItemsForBulkEdit.includes(item.id) ? "ring-2 ring-primary" : ""}`}
                          >
                            <GripVertical className="w-3 h-3 text-muted-foreground cursor-move" />
                            <input
                              type="checkbox"
                              checked={selectedItemsForBulkEdit.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItemsForBulkEdit(prev => [...prev, item.id]);
                                } else {
                                  setSelectedItemsForBulkEdit(prev => prev.filter(id => id !== item.id));
                                }
                              }}
                              className="w-3 h-3"
                            />
                            <span className="text-xs text-foreground truncate flex-1">{item.name}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => duplicateItem(item)}
                                className="p-1 hover:bg-primary/20 rounded transition-colors"
                                title="نسخ"
                              >
                                <Copy className="w-3 h-3 text-primary" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 hover:bg-destructive/20 rounded transition-colors"
                              >
                                <X className="w-3 h-3 text-destructive" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bulk Edit Modal */}
                    {showBulkEdit && (
                      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-card rounded-xl p-4 max-w-md w-full max-h-[80vh] overflow-y-auto">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm">تعديل {selectedItemsForBulkEdit.length} عنصر</h3>
                            <button
                              onClick={() => {
                                setShowBulkEdit(false);
                                setSelectedItemsForBulkEdit([]);
                              }}
                              className="p-1 hover:bg-secondary rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold mb-1 block">تغيير الفئة</label>
                              <select
                                onChange={(e) => handleBulkEdit("category", e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg"
                              >
                                <option value="">اختر فئة</option>
                                {currentServiceType.categories.filter(cat => cat.id !== "all").map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold mb-1 block">تغيير حالة المميز</label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBulkEdit("featured", true)}
                                  className="flex-1 py-1.5 px-2 bg-primary text-white rounded-lg text-xs font-semibold"
                                >
                                  جعلها مميزة
                                </button>
                                <button
                                  onClick={() => handleBulkEdit("featured", false)}
                                  className="flex-1 py-1.5 px-2 bg-secondary text-foreground rounded-lg text-xs font-semibold"
                                >
                                  إلغاء التمييز
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Panel */}
            {isPreviewVisible && (
              <div className="glass-card p-2.5 sm:p-3 rounded-xl glow-border-hover">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="font-semibold text-xs sm:text-sm">الإحصائيات</span>
                  </div>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                  >
                    {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {showStats && (
                  <div className="space-y-2 animate-fade-in border-t border-border pt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-secondary/50 p-2 rounded-lg">
                        <div className="text-muted-foreground mb-0.5">عدد العناصر</div>
                        <div className="font-bold text-foreground text-lg">{stats.totalItems}</div>
                      </div>
                      <div className="bg-secondary/50 p-2 rounded-lg">
                        <div className="text-muted-foreground mb-0.5">إجمالي القيمة</div>
                        <div className="font-bold text-foreground text-lg">{stats.totalValue.toFixed(0)} EGP</div>
                      </div>
                      <div className="bg-secondary/50 p-2 rounded-lg">
                        <div className="text-muted-foreground mb-0.5">متوسط السعر</div>
                        <div className="font-bold text-foreground text-lg">{stats.averagePrice.toFixed(0)} EGP</div>
                      </div>
                      <div className="bg-secondary/50 p-2 rounded-lg">
                        <div className="text-muted-foreground mb-0.5">مميز</div>
                        <div className="font-bold text-foreground text-lg">{stats.featuredCount}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Options */}
            {isPreviewVisible && (
              <div className="glass-card p-2.5 sm:p-3 rounded-xl">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="font-semibold text-xs sm:text-sm">خيارات متقدمة</span>
                  </div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {showAdvanced && (
                  <div className="space-y-2.5 animate-fade-in border-t border-border pt-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {/* Search */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Search className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">بحث</span>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن عنصر..."
                        className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>

                    {/* Sort */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <SortAsc className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">ترتيب</span>
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "name" | "price" | "rating")}
                        className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                      >
                        <option value="name">حسب الاسم</option>
                        <option value="price">حسب السعر</option>
                        <option value="rating">حسب التقييم</option>
                      </select>
                    </div>

                    {/* Device View */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Monitor className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">نوع العرض</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "mobile", icon: Smartphone, label: "موبايل" },
                          { id: "tablet", icon: Tablet, label: "تابلت" },
                          { id: "desktop", icon: Monitor, label: "ديسكتوب" },
                        ].map((device) => (
                          <button
                            key={device.id}
                            onClick={() => setDeviceView(device.id as "mobile" | "tablet" | "desktop")}
                            className={`p-2 rounded-lg border-2 transition-all ${deviceView === device.id
                              ? "border-primary ring-1 ring-primary/30"
                              : "border-border hover:border-primary/50"
                              }`}
                          >
                            <device.icon className={`w-4 h-4 mx-auto mb-1 ${deviceView === device.id ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="text-[10px] font-medium text-foreground text-center">{device.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">حجم الخط</span>
                        <span className="text-xs text-muted-foreground">{Math.round(fontSize * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Display Options */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">خيارات العرض</span>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showRatings}
                            onChange={(e) => setShowRatings(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/30"
                          />
                          <span>إظهار التقييمات</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showTime}
                            onChange={(e) => setShowTime(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/30"
                          />
                          <span>إظهار الوقت</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showFeatured}
                            onChange={(e) => setShowFeatured(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/30"
                          />
                          <span>إظهار المميز</span>
                        </label>
                      </div>
                    </div>

                    {/* Image Quality */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5 mb-2">
                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">جودة الصور</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setImageQuality("standard")}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${imageQuality === "standard"
                            ? "bg-primary text-white"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                            }`}
                        >
                          عادي
                        </button>
                        <button
                          onClick={() => setImageQuality("hd")}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${imageQuality === "hd"
                            ? "bg-primary text-white"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                            }`}
                        >
                          عالي
                        </button>
                      </div>
                    </div>

                    {/* Export/Import */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      <button
                        onClick={exportData}
                        className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        تصدير JSON
                      </button>
                      <label className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 transition-colors cursor-pointer">
                        <Upload className="w-3 h-3" />
                        استيراد JSON
                        <input
                          type="file"
                          accept=".json"
                          onChange={importData}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* CSV Export/Import */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      <button
                        onClick={exportToCSV}
                        className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        تصدير CSV
                      </button>
                      <label className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 transition-colors cursor-pointer">
                        <FileSpreadsheet className="w-3 h-3" />
                        استيراد CSV
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => e.target.files?.[0] && importFromCSV(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Custom Color Picker */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">ألوان مخصصة</span>
                        </div>
                        <button
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          {showColorPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      {showColorPicker && (
                        <div className="space-y-2 animate-fade-in">
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">اللون الأساسي</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={customTheme.primary}
                                onChange={(e) => updateCustomTheme("primary", e.target.value)}
                                className="w-12 h-8 rounded border border-border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={customTheme.primary}
                                onChange={(e) => updateCustomTheme("primary", e.target.value)}
                                className="flex-1 px-2 py-1 text-xs bg-input border border-border rounded-lg"
                                placeholder="#00bcd4"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">لون التمييز</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={customTheme.accent}
                                onChange={(e) => updateCustomTheme("accent", e.target.value)}
                                className="w-12 h-8 rounded border border-border cursor-pointer"
                              />
                              <input
                                type="text"
                                value={customTheme.accent}
                                onChange={(e) => updateCustomTheme("accent", e.target.value)}
                                className="flex-1 px-2 py-1 text-xs bg-input border border-border rounded-lg"
                                placeholder="#00acc1"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTheme("custom");
                              toast.success("تم تطبيق الألوان المخصصة");
                            }}
                            className="w-full py-1.5 px-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                          >
                            تطبيق الألوان
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Custom Fonts */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Type className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground">الخطوط</span>
                      </div>
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                      >
                        <option value="Poppins">Poppins</option>
                        <option value="Cairo">Cairo</option>
                        <option value="Tajawal">Tajawal</option>
                        <option value="Almarai">Almarai</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                      </select>
                      <div className="mt-2">
                        <label className="text-[10px] text-muted-foreground mb-1 block">سمك الخط: {fontWeight}</label>
                        <input
                          type="range"
                          min="300"
                          max="800"
                          step="100"
                          value={fontWeight}
                          onChange={(e) => setFontWeight(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Animation Settings */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">الحركات</span>
                        </div>
                        <button
                          onClick={() => setEnableAnimations(!enableAnimations)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${enableAnimations ? "bg-primary" : "bg-gray-300"}`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableAnimations ? "translate-x-5" : ""}`} />
                        </button>
                      </div>
                      {enableAnimations && (
                        <div className="mt-2">
                          <label className="text-[10px] text-muted-foreground mb-1 block">سرعة الحركة</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(["slow", "normal", "fast"] as const).map((speed) => (
                              <button
                                key={speed}
                                onClick={() => setAnimationSpeed(speed)}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${animationSpeed === speed
                                  ? "bg-primary text-white"
                                  : "bg-secondary text-foreground hover:bg-secondary/80"
                                  }`}
                              >
                                {speed === "slow" ? "بطيء" : speed === "normal" ? "عادي" : "سريع"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Performance Metrics */}
                    {performanceMetrics && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Gauge className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">الأداء</span>
                        </div>
                        <div className="space-y-1.5 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">حجم الصفحة:</span>
                            <span className="font-semibold">{performanceMetrics.pageSize.toFixed(0)} KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">وقت التحميل:</span>
                            <span className="font-semibold">{performanceMetrics.loadTime.toFixed(1)}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">حجم الحزمة:</span>
                            <span className="font-semibold">{performanceMetrics.bundleSize.toFixed(0)} KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">إمكانية الوصول:</span>
                            <span className="font-semibold">{performanceMetrics.accessibilityScore}/100</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Templates */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">القوالب</span>
                        </div>
                        <button
                          onClick={() => setShowTemplates(!showTemplates)}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          {showTemplates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      {showTemplates && (
                        <div className="space-y-2 animate-fade-in">
                          <button
                            onClick={saveAsTemplate}
                            className="w-full py-1.5 px-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Save className="w-3 h-3" />
                            حفظ كقالب
                          </button>
                          {templates.length > 0 && (
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {templates.map((template) => (
                                <button
                                  key={template.id}
                                  onClick={() => loadTemplate(template)}
                                  className="w-full p-2 bg-secondary/50 rounded-lg text-xs text-left hover:bg-secondary transition-colors"
                                >
                                  <div className="font-semibold">{template.name}</div>
                                  <div className="text-[10px] text-muted-foreground">{template.items.length} عنصر</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Version History */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">الإصدارات</span>
                        </div>
                        <button
                          onClick={() => setShowVersions(!showVersions)}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          {showVersions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      {showVersions && (
                        <div className="space-y-2 animate-fade-in">
                          <button
                            onClick={saveVersion}
                            className="w-full py-1.5 px-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Save className="w-3 h-3" />
                            حفظ إصدار جديد
                          </button>
                          {versions.length > 0 && (
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {versions.map((version) => (
                                <button
                                  key={version.id}
                                  onClick={() => loadVersion(version)}
                                  className={`w-full p-2 rounded-lg text-xs text-left transition-colors ${currentVersion === version.id
                                    ? "bg-primary/20 border border-primary"
                                    : "bg-secondary/50 hover:bg-secondary"
                                    }`}
                                >
                                  <div className="font-semibold">{version.name}</div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {version.timestamp.toLocaleString("ar-EG")}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="pt-2 border-t border-border">
                      <button
                        onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                        className="w-full flex items-center justify-between p-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <Keyboard className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">اختصارات لوحة المفاتيح</span>
                        </div>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      {showKeyboardShortcuts && (
                        <div className="mt-2 p-2 bg-secondary/30 rounded-lg space-y-1.5 text-[10px] animate-fade-in">
                          <div className="flex justify-between">
                            <span>Ctrl+S</span>
                            <span className="text-muted-foreground">حفظ إصدار</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ctrl+E</span>
                            <span className="text-muted-foreground">تصدير CSV</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ctrl+I</span>
                            <span className="text-muted-foreground">إضافة عنصر</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ctrl+K</span>
                            <span className="text-muted-foreground">إظهار الاختصارات</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Print Preview */}
                    <div className="pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          setShowPrintPreview(true);
                          setTimeout(() => window.print(), 100);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Printer className="w-3 h-3" />
                        طباعة المنيو
                      </button>
                    </div>

                    {/* SEO Preview */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-foreground">SEO</span>
                        </div>
                        <button
                          onClick={() => setShowSeo(!showSeo)}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          {showSeo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      {showSeo && (
                        <div className="space-y-2 animate-fade-in">
                          <input
                            type="text"
                            placeholder="عنوان الصفحة"
                            value={seoData.title}
                            onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg"
                          />
                          <textarea
                            placeholder="وصف الصفحة"
                            value={seoData.description}
                            onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg min-h-[60px] resize-none"
                          />
                          <input
                            type="text"
                            placeholder="الكلمات المفتاحية"
                            value={seoData.keywords}
                            onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {isPreviewVisible && (
              <div className="space-y-1.5 sm:space-y-2">
                <button
                  onClick={downloadPreview}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 bg-primary text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  تحميل المعاينة
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={copyShareLink}
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-secondary text-foreground rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-secondary/80 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                    {copied ? "تم!" : "مشاركة"}
                  </button>
                  <a
                    href={generateQRCode()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-secondary text-foreground rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-secondary/80 transition-colors"
                  >
                    <QrCode className="w-3 h-3" />
                    QR Code
                  </a>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => {
                const element = document.getElementById("contact");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full btn-glow glow-ring px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold relative group"
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline">اطلب المنيو الخاص بك الآن</span>
                <span className="sm:hidden">اطلب الآن</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </button>
          </div>

          {/* Right Side - Advanced Preview with Fixed Dimensions */}
          <div className="lg:col-span-2 reveal order-1 lg:order-2" style={{ animationDelay: "0.2s" }}>
            <div className="relative flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 -mx-4 sm:mx-0">
              {/* Device Frame - Dynamic Dimensions */}
              <div
                className="relative transition-all duration-300 scale-[0.7] sm:scale-90 md:scale-100"
                style={{
                  width: deviceView === "mobile" ? "280px" : deviceView === "tablet" ? "600px" : "800px",
                  height: deviceView === "mobile" ? "560px" : deviceView === "tablet" ? "800px" : "600px",
                  maxWidth: "100%",
                }}
                ref={phoneRef}
              >
                {/* Glow Effect */}
                <div
                  className="absolute -inset-6 rounded-[2.5rem] blur-3xl animate-glow-pulse opacity-60"
                  style={{ backgroundColor: currentTheme.accent + "20" }}
                />

                {/* Device Mockup - Dynamic Size */}
                <div
                  className={`relative mx-auto rounded-[1.5rem] sm:rounded-[2rem] border-4 sm:border-6 border-foreground/20 bg-gradient-to-b from-slate-900 to-slate-800 p-2 sm:p-2.5 shadow-2xl transition-all duration-500 ${isPreviewVisible
                    ? "opacity-100 scale-100"
                    : "opacity-30 scale-95"
                    }`}
                  style={{
                    width: deviceView === "mobile" ? "280px" : deviceView === "tablet" ? "600px" : "800px",
                    height: deviceView === "mobile" ? "560px" : deviceView === "tablet" ? "800px" : "600px",
                    fontSize: `${fontSize * 0.9}rem`,
                  }}
                >
                  {/* Phone Screen - Fixed Height */}
                  <div
                    className="rounded-[1.5rem] bg-white overflow-hidden shadow-xl flex flex-col"
                    style={{ height: "100%" }}
                  >
                    {/* Header with Status Bar */}
                    <div className="bg-slate-900 px-3 py-0.5 flex items-center justify-between text-white text-[10px] flex-shrink-0">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 border border-white rounded-sm">
                          <div className="w-2.5 h-1 bg-white rounded-sm m-0.5" />
                        </div>
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                      </div>
                    </div>

                    {/* App Header */}
                    <div
                      className={`px-4 py-3 flex items-center justify-between relative overflow-hidden flex-shrink-0 ${selectedTheme === "default" ? "bg-white border-b border-border" : ""
                        }`}
                      style={selectedTheme !== "default" ? {
                        background: currentTheme.gradient,
                      } : {}}
                    >
                      <div className="relative z-10 flex-1">
                        <p className={`text-[10px] uppercase tracking-[0.2em] mb-0.5 ${getTextColorSecondary()}`}>
                          Live Preview
                        </p>
                        <p className={`text-lg font-bold ${getTextColor()}`}>{displayName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          <span className={`text-[10px] ${getTextColor()}`}>4.8</span>
                          <span className={`text-[10px] ${getTextColorSecondary()}`}>•</span>
                          <span className={`text-[10px] ${getTextColorSecondary()}`}>مفتوح الآن</span>
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-1.5">
                        {currentPage === "menu" && (
                          <button
                            onClick={() => setShowSearch(!showSearch)}
                            className={`p-1.5 rounded-lg ${showSearch ? "bg-white/20" : ""} transition-colors`}
                          >
                            <Search className={`w-4 h-4 ${getTextColor()}`} />
                          </button>
                        )}
                        {currentPage === "home" && (
                          <div className="relative">
                            <button
                              onClick={() => setNotifications(0)}
                              className="p-1.5 rounded-lg transition-colors"
                            >
                              <Bell className={`w-4 h-4 ${getTextColor()}`} />
                              {notifications > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                                  {notifications}
                                </span>
                              )}
                            </button>
                          </div>
                        )}
                        <div className="relative">
                          <ShoppingCart className={`w-5 h-5 ${getTextColor()}`} />
                          {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-fade-in">
                              {cartCount}
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedTheme !== "default" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      )}
                    </div>

                    {/* Search Bar - Advanced */}
                    {showSearch && currentPage === "menu" && (
                      <div className="px-4 py-2 bg-white border-b border-border animate-fade-in">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن..."
                            className="w-full pl-8 pr-8 py-1.5 text-xs bg-secondary rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/30"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Menu Content - Scrollable with Fixed Container */}
                    <div
                      ref={scrollContainerRef}
                      className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white"
                      style={{
                        scrollbarWidth: 'thin',
                        minHeight: 0,
                        maxHeight: '100%'
                      }}
                    >
                      {isPreviewVisible ? (
                        <div className="p-3 space-y-3">
                          {/* Home Page */}
                          {currentPage === "home" && (
                            <div className="space-y-3 animate-fade-in">
                              {/* Hero Banner */}
                              <div
                                className={`relative rounded-xl overflow-hidden p-4 ${selectedTheme === "default" ? "bg-primary/10 border border-primary/20" : ""}`}
                                style={selectedTheme !== "default" ? { background: currentTheme.gradient } : {}}
                              >
                                <div className={`${getTextColor()}`}>
                                  <h3 className="text-lg font-bold mb-1">مرحباً بك في {displayName}</h3>
                                  <p className="text-xs opacity-90">
                                    {serviceType === "restaurant" ? "أطباق طازجة ولذيذة في انتظارك" :
                                      serviceType === "cafe" ? "مشروبات ساخنة وباردة من أجود الأنواع" :
                                        serviceType === "salon" ? "خدمات تجميل احترافية" :
                                          serviceType === "pharmacy" ? "منتجات صحية وطبية" :
                                            serviceType === "store" ? "منتجات متنوعة بأسعار منافسة" :
                                              "خدماتنا المميزة"}
                                  </p>
                                </div>
                              </div>

                              {/* Quick Stats */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white rounded-lg p-2 text-center border border-border">
                                  <div className="text-lg font-bold text-primary">{stats.totalItems}</div>
                                  <div className="text-[10px] text-muted-foreground">عنصر</div>
                                </div>
                                <div className="bg-white rounded-lg p-2 text-center border border-border">
                                  <div className="text-lg font-bold text-primary">4.8</div>
                                  <div className="text-[10px] text-muted-foreground">تقييم</div>
                                </div>
                                <div className="bg-white rounded-lg p-2 text-center border border-border">
                                  <div className="text-lg font-bold text-primary">{stats.featuredCount}</div>
                                  <div className="text-[10px] text-muted-foreground">مميز</div>
                                </div>
                              </div>

                              {/* Featured Items Preview */}
                              <div>
                                <h4 className="text-sm font-bold text-foreground mb-2">الأكثر طلباً</h4>
                                <div className="space-y-2">
                                  {filteredItems.filter(item => item.featured).slice(0, 3).map((item) => (
                                    <div key={item.id} className="bg-white rounded-lg p-2 flex gap-2 border border-border">
                                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="text-xs font-bold text-foreground">{item.name}</h5>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                                        <div className="flex items-center justify-between mt-1">
                                          <span className="text-xs font-bold" style={{ color: currentTheme.accent }}>{item.price} EGP</span>
                                          {item.rating && (
                                            <div className="flex items-center gap-0.5">
                                              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                              <span className="text-[10px]">{item.rating}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* CTA Button */}
                              <button
                                onClick={() => setCurrentPage("menu")}
                                className={`w-full py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 ${selectedTheme === "default" ? "text-primary border-2 border-primary bg-primary/10 hover:bg-primary/20" : "text-white"}`}
                                style={selectedTheme !== "default" ? { background: currentTheme.gradient } : {}}
                              >
                                <span>تصفح {currentServiceType.itemLabel === "طبق" ? "القائمة" : currentServiceType.itemLabel === "منتج" ? "المنتجات" : "الخدمات"}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Menu Page */}
                          {currentPage === "menu" && (
                            <>
                              {/* Toolbar - View Mode & Filters */}
                              <div className="flex items-center justify-between gap-2 -mx-3 px-3 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                  >
                                    <List className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                  >
                                    <Grid3x3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <Filter className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {/* Categories Scrollable Tabs */}
                              <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-3 px-3" style={{ scrollbarWidth: 'none' }}>
                                {categories.map((cat) => (
                                  <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${selectedCategory === cat.id
                                      ? `${getTextColor()} shadow-md`
                                      : "bg-white text-foreground border border-border hover:bg-secondary"
                                      }`}
                                    style={selectedCategory === cat.id ? {
                                      background: selectedTheme === "default" ? "transparent" : currentTheme.gradient,
                                      border: selectedTheme === "default" ? "2px solid " + currentTheme.accent : "none"
                                    } : {}}
                                  >
                                    <span className="text-sm">{cat.icon}</span>
                                    <span className="text-xs font-medium">{cat.name}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Featured Banner */}
                              {selectedCategory === "all" && showFeatured && (
                                <div
                                  className={`relative rounded-xl overflow-hidden p-3 ${selectedTheme === "default"
                                    ? "bg-primary/10 border border-primary/20"
                                    : ""
                                    }`}
                                  style={selectedTheme !== "default" ? {
                                    background: currentTheme.gradient
                                  } : {}}
                                >
                                  <div className={`flex items-center justify-between ${getTextColor()}`}>
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <Flame className={`w-3 h-3 ${selectedTheme === "default" ? "fill-primary text-primary" : "fill-white"}`} />
                                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                                          {serviceType === "restaurant" ? "الأطباق المميزة" :
                                            serviceType === "cafe" ? "المشروبات المميزة" :
                                              serviceType === "salon" ? "الخدمات المميزة" :
                                                serviceType === "pharmacy" ? "المنتجات المميزة" :
                                                  serviceType === "store" ? "العروض المميزة" :
                                                    "الخدمات المميزة"}
                                        </span>
                                      </div>
                                      <p className="text-xs">
                                        {serviceType === "restaurant" ? "خصم 15% على الطلبات المميزة" :
                                          serviceType === "cafe" ? "خصم 20% على المشروبات المميزة" :
                                            serviceType === "salon" ? "خصم 25% على الخدمات المميزة" :
                                              serviceType === "pharmacy" ? "خصم 10% على المنتجات المميزة" :
                                                serviceType === "store" ? "خصم 30% على العروض المميزة" :
                                                  "خصم خاص على الخدمات المميزة"}
                                      </p>
                                    </div>
                                    <div className="text-2xl">
                                      {serviceType === "restaurant" ? "🔥" :
                                        serviceType === "cafe" ? "☕" :
                                          serviceType === "salon" ? "✨" :
                                            serviceType === "pharmacy" ? "💊" :
                                              serviceType === "store" ? "🛍️" :
                                                "⭐"}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Menu Items - Grid or List View */}
                              {viewMode === "list" ? (
                                <div className="space-y-2">
                                  {filteredItems.map((item, index) => (
                                    <div
                                      key={item.id}
                                      className={`bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all hover-lift animate-fade-in-up ${isDarkMode ? "bg-slate-800 border-slate-700" : ""}`}
                                      style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                      <div className="flex gap-2 p-2">
                                        {/* Item Image */}
                                        <div
                                          className="relative rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                                          style={{ width: "72px", height: "72px" }}
                                          onClick={() => setSelectedImage(item.image)}
                                        >
                                          <img
                                            src={imageQuality === "hd" ? item.image.replace("?w=400", "?w=800&q=90") : item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            loading="lazy"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                          {item.featured && showFeatured && (
                                            <div className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 z-10">
                                              <Star className="w-2 h-2 fill-white" />
                                              <span>مميز</span>
                                            </div>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setFavorites(prev =>
                                                prev.includes(item.id)
                                                  ? prev.filter(id => id !== item.id)
                                                  : [...prev, item.id]
                                              );
                                            }}
                                            className="absolute bottom-0.5 left-0.5 p-1 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
                                          >
                                            <Heart
                                              className={`w-3 h-3 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                                            />
                                          </button>
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-1.5 mb-0.5">
                                            <h3 className="font-bold text-foreground text-sm leading-tight">
                                              {item.name}
                                            </h3>
                                            <span
                                              className="font-bold whitespace-nowrap text-xs"
                                              style={{ color: currentTheme.accent }}
                                            >
                                              {item.price} EGP
                                            </span>
                                          </div>
                                          <p className="text-muted-foreground mb-1 line-clamp-2 text-xs">
                                            {item.description}
                                          </p>
                                          {(showRatings || showTime) && (
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                              {item.rating && showRatings && (
                                                <div className="flex items-center gap-0.5">
                                                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                                  <span>{item.rating}</span>
                                                </div>
                                              )}
                                              {item.time && showTime && (
                                                <div className="flex items-center gap-0.5">
                                                  <Clock className="w-2.5 h-2.5" />
                                                  <span>{item.time}</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Add to Cart Button */}
                                      <div className="px-2 pb-2">
                                        <button
                                          onClick={handleAddToCart}
                                          className={`w-full py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all duration-150 ${selectedTheme === "default" ? "text-primary border-2 border-primary bg-primary/10 hover:bg-primary/20" : "text-white"
                                            }`}
                                          style={selectedTheme !== "default" ? { background: currentTheme.gradient } : {}}
                                        >
                                          <Plus className="w-3 h-3" />
                                          أضف للسلة
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                /* Grid View */
                                <div className="grid grid-cols-2 gap-2">
                                  {filteredItems.map((item, index) => (
                                    <div
                                      key={item.id}
                                      className={`bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all hover-lift animate-fade-in-up ${isDarkMode ? "bg-slate-800 border-slate-700" : ""}`}
                                      style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                      <div
                                        className="relative aspect-square cursor-pointer group"
                                        onClick={() => setSelectedImage(item.image)}
                                      >
                                        <img
                                          src={imageQuality === "hd" ? item.image.replace("?w=400", "?w=800&q=90") : item.image}
                                          alt={item.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {item.featured && showFeatured && (
                                          <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 z-10">
                                            <Star className="w-2 h-2 fill-white" />
                                          </div>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setFavorites(prev =>
                                              prev.includes(item.id)
                                                ? prev.filter(id => id !== item.id)
                                                : [...prev, item.id]
                                            );
                                          }}
                                          className="absolute bottom-1 left-1 p-1 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
                                        >
                                          <Heart
                                            className={`w-3 h-3 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                                          />
                                        </button>
                                      </div>
                                      <div className="p-2">
                                        <h3 className="font-bold text-foreground text-xs leading-tight mb-0.5 line-clamp-1">
                                          {item.name}
                                        </h3>
                                        <p className="text-muted-foreground mb-1.5 line-clamp-1 text-[10px]">
                                          {item.description}
                                        </p>
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-xs font-bold" style={{ color: currentTheme.accent }}>
                                            {item.price} EGP
                                          </span>
                                          {item.rating && showRatings && (
                                            <div className="flex items-center gap-0.5">
                                              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                              <span className="text-[10px]">{item.rating}</span>
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          onClick={handleAddToCart}
                                          className={`w-full py-1.5 rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1 ${selectedTheme === "default" ? "text-primary border border-primary bg-primary/10 hover:bg-primary/20" : "text-white"}`}
                                          style={selectedTheme !== "default" ? { background: currentTheme.gradient } : {}}
                                        >
                                          <Plus className="w-2.5 h-2.5" />
                                          أضف
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          {/* Cart Page */}
                          {currentPage === "cart" && (
                            <div className="space-y-3 animate-fade-in">
                              {cartCount > 0 ? (
                                <>
                                  <div className="bg-white rounded-xl p-3 border border-border">
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="text-sm font-bold text-foreground">السلة ({cartCount})</h3>
                                      <button
                                        onClick={() => setCartCount(0)}
                                        className="text-xs text-red-500 hover:text-red-600"
                                      >
                                        مسح الكل
                                      </button>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                      {filteredItems.slice(0, cartCount).map((item) => (
                                        <div key={item.id} className="flex gap-2 items-center">
                                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-foreground">{item.name}</h4>
                                            <p className="text-[10px] text-muted-foreground">{item.price} EGP</p>
                                          </div>
                                          <button className="text-red-500 hover:text-red-600">
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="border-t border-border pt-2">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-muted-foreground">المجموع</span>
                                        <span className="text-sm font-bold" style={{ color: currentTheme.accent }}>
                                          {filteredItems.slice(0, cartCount).reduce((sum, item) => sum + parseInt(item.price), 0)} EGP
                                        </span>
                                      </div>
                                      <button
                                        className={`w-full py-2.5 rounded-lg font-semibold text-xs ${selectedTheme === "default" ? "text-primary border-2 border-primary bg-primary/10 hover:bg-primary/20" : "text-white"}`}
                                        style={selectedTheme !== "default" ? { background: currentTheme.gradient } : {}}
                                      >
                                        إتمام الطلب
                                      </button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                  <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-3" />
                                  <p className="text-sm text-muted-foreground mb-2">السلة فارغة</p>
                                  <button
                                    onClick={() => setCurrentPage("menu")}
                                    className={`text-xs px-4 py-2 rounded-lg ${selectedTheme === "default" ? "text-primary border border-primary bg-primary/10" : "text-white"}`}
                                    style={selectedTheme !== "default" ? { background: currentTheme.gradient } : {}}
                                  >
                                    تصفح {currentServiceType.itemLabel === "طبق" ? "القائمة" : currentServiceType.itemLabel === "منتج" ? "المنتجات" : "الخدمات"}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Profile Page */}
                          {currentPage === "profile" && (
                            <div className="space-y-3 animate-fade-in">
                              {/* Profile Header */}
                              <div
                                className={`relative rounded-xl overflow-hidden p-4 ${selectedTheme === "default" ? "bg-primary/10 border border-primary/20" : ""}`}
                                style={selectedTheme !== "default" ? { background: currentTheme.gradient } : {}}
                              >
                                <div className={`flex flex-col items-center text-center ${getTextColor()}`}>
                                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-2 flex items-center justify-center">
                                    <User className="w-8 h-8" />
                                  </div>
                                  <h3 className="text-base font-bold mb-1">{displayName}</h3>
                                  <p className="text-xs opacity-90">عضو منذ 2024</p>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white rounded-lg p-2 text-center border border-border">
                                  <div className="text-lg font-bold text-primary">{cartCount}</div>
                                  <div className="text-[10px] text-muted-foreground">طلبات</div>
                                </div>
                                <div className="bg-white rounded-lg p-2 text-center border border-border">
                                  <div className="text-lg font-bold text-primary">4.8</div>
                                  <div className="text-[10px] text-muted-foreground">تقييم</div>
                                </div>
                                <div className="bg-white rounded-lg p-2 text-center border border-border">
                                  <div className="text-lg font-bold text-primary">{favorites.length}</div>
                                  <div className="text-[10px] text-muted-foreground">مفضلة</div>
                                </div>
                              </div>

                              {/* Reviews Section */}
                              <div className="bg-white rounded-lg p-3 border border-border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-primary fill-primary" />
                                    <span className="text-xs font-semibold text-foreground">التقييمات ({reviews.length})</span>
                                  </div>
                                  <button
                                    onClick={() => setShowReviews(!showReviews)}
                                    className="text-[10px] text-primary hover:underline"
                                  >
                                    {showReviews ? "إخفاء" : "عرض الكل"}
                                  </button>
                                </div>
                                {showReviews && (
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {reviews.length > 0 ? (
                                      reviews.map((review) => (
                                        <div key={review.id} className="p-2 bg-secondary/50 rounded-lg">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold">{review.userName}</span>
                                            <div className="flex items-center gap-1">
                                              {[...Array(5)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`w-2.5 h-2.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground line-clamp-2">{review.comment}</p>
                                          <span className="text-[9px] text-muted-foreground">{review.date}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-[10px] text-muted-foreground text-center py-2">لا توجد تقييمات بعد</p>
                                    )}
                                    <button
                                      onClick={() => {
                                        const userName = prompt("اسمك:");
                                        const rating = parseInt(prompt("التقييم (1-5):") || "5");
                                        const comment = prompt("تعليقك:");
                                        if (userName && rating && comment) {
                                          addReview({ userName, rating: Math.min(5, Math.max(1, rating)), comment });
                                        }
                                      }}
                                      className="w-full py-1.5 px-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                                    >
                                      إضافة تقييم
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Menu Options */}
                              <div className="space-y-1">
                                <div className="bg-white rounded-lg p-3 border border-border flex items-center justify-between hover:bg-secondary transition-colors cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Bookmark className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-foreground">المفضلة ({favorites.length})</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-border flex items-center justify-between hover:bg-secondary transition-colors cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-foreground">الطلبات السابقة</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-border flex items-center justify-between hover:bg-secondary transition-colors cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-foreground">العناوين المحفوظة</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-border flex items-center justify-between hover:bg-secondary transition-colors cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-foreground">الإشعارات</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-border flex items-center justify-between hover:bg-secondary transition-colors cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-foreground">الإعدادات</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-border flex items-center justify-between hover:bg-secondary transition-colors cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    {isDarkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
                                    <span className="text-xs font-medium text-foreground">الوضع الليلي</span>
                                  </div>
                                  <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${isDarkMode ? "bg-primary" : "bg-gray-300"}`}
                                  >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? "translate-x-5" : ""}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          <Smartphone className="w-16 h-16 text-muted-foreground/30 mb-4" />
                          <p className="text-muted-foreground text-sm">
                            اكتب اسم {currentServiceType.name} أعلاه لترى المعاينة
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Navigation Bar - Fixed at Bottom */}
                    {isPreviewVisible && (
                      <div className="bg-white border-t border-border px-2 py-1.5 flex items-center justify-around flex-shrink-0">
                        <button
                          onClick={() => setCurrentPage("home")}
                          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${currentPage === "home" ? "" : "text-muted-foreground hover:text-primary"}`}
                          style={currentPage === "home" ? { color: currentTheme.accent } : {}}
                        >
                          <Home className="w-4 h-4" style={currentPage === "home" ? { fill: currentTheme.accent } : {}} />
                          <span className="text-[10px] font-medium">الرئيسية</span>
                        </button>
                        <button
                          onClick={() => setCurrentPage("menu")}
                          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${currentPage === "menu" ? "" : "text-muted-foreground hover:text-primary"}`}
                          style={currentPage === "menu" ? { color: currentTheme.accent } : {}}
                        >
                          <Search className="w-4 h-4" style={currentPage === "menu" ? { fill: currentTheme.accent } : {}} />
                          <span className="text-[10px] font-medium">القائمة</span>
                        </button>
                        <button
                          onClick={() => setCurrentPage("cart")}
                          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${currentPage === "cart" ? "" : "text-muted-foreground hover:text-primary"}`}
                          style={currentPage === "cart" ? { color: currentTheme.accent } : {}}
                        >
                          <ShoppingCart className="w-4 h-4" style={currentPage === "cart" ? { fill: currentTheme.accent } : {}} />
                          {cartCount > 0 && (
                            <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                              {cartCount}
                            </span>
                          )}
                          <span className="text-[10px] font-medium">السلة</span>
                        </button>
                        <button
                          onClick={() => setCurrentPage("profile")}
                          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${currentPage === "profile" ? "" : "text-muted-foreground hover:text-primary"}`}
                          style={currentPage === "profile" ? { color: currentTheme.accent } : {}}
                        >
                          <User className="w-4 h-4" style={currentPage === "profile" ? { fill: currentTheme.accent } : {}} />
                          <span className="text-[10px] font-medium">حسابي</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* QR Code Card - Only show when preview is visible */}
              {isPreviewVisible && (
                <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl glow-border-hover animate-fade-in">
                  <div className="text-center mb-3 sm:mb-4">
                    <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                      امسح للاختبار
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      افتح على الموبايل
                    </p>
                  </div>

                  <div className="bg-white p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                    <QRCodeSVG
                      value={`${window.location.origin}/demo?name=${encodeURIComponent(displayName)}&service=${serviceType}`}
                      size={160}
                      level="H"
                      includeMargin={true}
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      <strong className="text-foreground">{displayName}</strong>
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>استخدم كاميرا الموبايل</span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      const link = `${window.location.origin}/demo?name=${encodeURIComponent(displayName)}&service=${serviceType}`;
                      try {
                        if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(link);
                          toast.success("تم نسخ الرابط!");
                        } else {
                          // Fallback for older browsers
                          const textArea = document.createElement("textarea");
                          textArea.value = link;
                          textArea.style.position = "fixed";
                          textArea.style.opacity = "0";
                          document.body.appendChild(textArea);
                          textArea.select();
                          try {
                            document.execCommand("copy");
                            toast.success("تم نسخ الرابط!");
                          } catch (err) {
                            console.error("Failed to copy:", err);
                            toast.error("فشل نسخ الرابط. الرابط: " + link);
                          }
                          document.body.removeChild(textArea);
                        }
                      } catch (error) {
                        console.error("Failed to copy link:", error);
                        toast.error("فشل نسخ الرابط. الرابط: " + link);
                      }
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    نسخ الرابط
                  </button>
                </div>
              )}

              {/* Image Zoom Modal */}
              {selectedImage && (
                <div
                  className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="relative max-w-4xl w-full max-h-[90vh]">
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <img
                      src={selectedImage}
                      alt="Zoomed"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 sm:mt-12 lg:mt-16 text-center reveal px-4" style={{ animationDelay: "0.4s" }}>
          <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
            هذا مجرد معاينة بسيطة. {currentServiceType.itemLabel} الحقيقي بيكون أكثر احترافية وتفصيلاً!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              تصميم احترافي متقدم
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              {currentServiceType.itemLabel} تفاعلي كامل
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              نظام طلبات متكامل
            </span>
            {isPreviewVisible && (
              <>
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {stats.totalItems} عنصر
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  معاينة مباشرة
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LivePreviewTool;
