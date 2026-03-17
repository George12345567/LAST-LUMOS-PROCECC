# ⚡ Live Preview Tool - Quick Wins & Immediate Improvements

## 🎯 التحسينات السريعة (يمكن تنفيذها في أيام)

هذه تحسينات فورية يمكن إضافتها للأداة الحالية بسرعة لتحسين تجربة المستخدم مباشرة.

---

## 1️⃣ State Management Cleanup (Priority: 🔴 High)
**الوقت المتوقع: 3-4 ساعات**

### المشكلة الحالية:
- 50+ useState في component واحد
- Re-renders كثيرة غير ضرورية
- صعوبة في الصيانة

### الحل السريع:
استخدام `useReducer` لتجميع state مرتبطة

```typescript
// hooks/usePreviewReducer.ts
type PreviewAction = 
  | { type: 'SET_BUSINESS_NAME'; payload: string }
  | { type: 'SET_SERVICE_TYPE'; payload: string }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'ADD_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_UI'; payload: Partial<UIState> }
  | { type: 'TOGGLE_FEATURE'; payload: keyof FeatureToggles };

interface PreviewState {
  business: {
    name: string;
    serviceType: string;
  };
  ui: {
    currentPage: PageType;
    deviceView: DeviceType;
    viewMode: ViewMode;
    isDarkMode: boolean;
  };
  content: {
    items: MenuItem[];
    customItems: MenuItem[];
  };
  features: {
    showTime: boolean;
    showRatings: boolean;
    showFeatured: boolean;
  };
  cart: {
    items: number[];
    count: number;
  };
}

const previewReducer = (state: PreviewState, action: PreviewAction): PreviewState => {
  switch (action.type) {
    case 'SET_BUSINESS_NAME':
      return { ...state, business: { ...state.business, name: action.payload } };
    
    case 'ADD_ITEM':
      return { 
        ...state, 
        content: { 
          ...state.content, 
          customItems: [...state.content.customItems, action.payload] 
        } 
      };
    
    case 'UPDATE_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    
    case 'TOGGLE_FEATURE':
      return {
        ...state,
        features: {
          ...state.features,
          [action.payload]: !state.features[action.payload]
        }
      };
    
    default:
      return state;
  }
};

export const usePreviewReducer = () => {
  const [state, dispatch] = useReducer(previewReducer, initialState);
  return { state, dispatch };
};
```

### Benefits:
- ✅ Cleaner code
- ✅ Better performance
- ✅ Easier testing
- ✅ Predictable state updates

---

## 2️⃣ Component Splitting (Priority: 🔴 High)
**الوقت المتوقع: 2-3 ساعات**

### Extract Pages to Separate Components:

```typescript
// components/PreviewPages/HomePage.tsx
export const HomePage = ({ 
  businessName, 
  stats, 
  featuredItems, 
  currentTheme,
  onNavigateToMenu 
}: HomePageProps) => {
  return (
    <div className="space-y-3 animate-fade-in">
      <HeroBanner businessName={businessName} theme={currentTheme} />
      <QuickStats stats={stats} />
      <FeaturedItemsList items={featuredItems} />
      <CTAButton onClick={onNavigateToMenu} />
    </div>
  );
};

// components/PreviewPages/MenuPage.tsx
export const MenuPage = ({
  items,
  categories,
  onAddToCart,
  viewMode,
  searchQuery,
  currentTheme
}: MenuPageProps) => {
  return (
    <>
      <Toolbar />
      <CategoryTabs categories={categories} />
      {viewMode === 'list' ? (
        <ItemsList items={items} onAddToCart={onAddToCart} />
      ) : (
        <ItemsGrid items={items} onAddToCart={onAddToCart} />
      )}
    </>
  );
};

// components/PreviewPages/index.ts
export { HomePage } from './HomePage';
export { MenuPage } from './MenuPage';
export { CartPage } from './CartPage';
export { ProfilePage } from './ProfilePage';

// في LivePreviewTool.tsx
import { HomePage, MenuPage, CartPage, ProfilePage } from './components/PreviewPages';

// Use:
{currentPage === 'home' && <HomePage {...homeProps} />}
{currentPage === 'menu' && <MenuPage {...menuProps} />}
{currentPage === 'cart' && <CartPage {...cartProps} />}
{currentPage === 'profile' && <ProfilePage {...profileProps} />}
```

---

## 3️⃣ Performance - Virtual Scrolling (Priority: 🟡 Medium)
**الوقت المتوقع: 1-2 ساعات**

### المشكلة:
عند وجود 100+ عنصر، الأداء يبطئ

### الحل:
استخدام virtual scrolling

```bash
npm install @tanstack/react-virtual
```

```typescript
// components/VirtualizedItemsList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualizedItemsList = ({ items, onAddToCart }: Props) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // تقدير ارتفاع العنصر
    overscan: 5 // عدد العناصر الإضافية خارج الشاشة
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <MenuItem item={item} onAddToCart={onAddToCart} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### Results:
- ✅ Smooth scrolling مع آلاف العناصر
- ✅ Memory efficient
- ✅ Better FPS

---

## 4️⃣ Image Optimization (Priority: 🟡 Medium)
**الوقت المتوقع: 1 ساعة**

### Add Progressive Image Loading:

```typescript
// components/OptimizedImage.tsx
import { useState } from 'react';

export const OptimizedImage = ({ src, alt, className }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Generate blur placeholder
  const blurDataURL = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0' filter='url(%23b)'/%3E%3C/svg%3E`;
  
  return (
    <div className={`relative ${className}`}>
      {/* Blur placeholder */}
      {!isLoaded && !isError && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
        />
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <ImageOff className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
    </div>
  );
};

// Usage in MenuItem:
<OptimizedImage 
  src={item.image} 
  alt={item.name}
  className="w-20 h-20 rounded-lg"
/>
```

---

## 5️⃣ Local Storage Persistence (Priority: 🟡 Medium)
**الوقت المتوقع: 30 دقيقة**

### Auto-save to localStorage:

```typescript
// hooks/useAutoSave.ts
import { useEffect } from 'react';
import { debounce } from 'lodash';

export const useAutoSave = (data: any, key: string) => {
  useEffect(() => {
    const saveData = debounce(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log('✅ Auto-saved');
      } catch (error) {
        console.error('Failed to save:', error);
      }
    }, 1000); // Save after 1 second of inactivity
    
    saveData();
    
    return () => saveData.cancel();
  }, [data, key]);
};

// في LivePreviewTool:
const previewData = {
  businessName,
  serviceType,
  selectedTheme,
  customItems,
  // ... all relevant state
};

useAutoSave(previewData, 'live-preview-draft');

// Load on mount:
useEffect(() => {
  const saved = localStorage.getItem('live-preview-draft');
  if (saved) {
    const data = JSON.parse(saved);
    setBusinessName(data.businessName);
    setServiceType(data.serviceType);
    // ... restore all state
    toast.success('تم استرجاع المسودة المحفوظة');
  }
}, []);
```

---

## 6️⃣ Keyboard Shortcuts Enhancement (Priority: 🟢 Low)
**الوقت المتوقع: 30 دقيقة**

### Add More Shortcuts:

```typescript
// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

export const useKeyboardShortcuts = (actions: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;
      
      if (!isModifier) return;
      
      const shortcuts: Record<string, () => void> = {
        's': (e) => { e.preventDefault(); actions.save(); },
        'z': (e) => { e.preventDefault(); actions.undo(); },
        'y': (e) => { e.preventDefault(); actions.redo(); },
        'n': (e) => { e.preventDefault(); actions.addNew(); },
        'd': (e) => { e.preventDefault(); actions.duplicate(); },
        'Delete': (e) => { e.preventDefault(); actions.delete(); },
        'f': (e) => { e.preventDefault(); actions.search(); },
        '1': (e) => { e.preventDefault(); actions.goToHome(); },
        '2': (e) => { e.preventDefault(); actions.goToMenu(); },
        '3': (e) => { e.preventDefault(); actions.goToCart(); },
      };
      
      const action = shortcuts[e.key];
      if (action) action(e);
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [actions]);
};

// Show shortcuts modal:
const ShortcutsModal = () => (
  <div className="grid gap-2">
    <ShortcutRow keys={['Ctrl', 'S']} action="حفظ" />
    <ShortcutRow keys={['Ctrl', 'Z']} action="تراجع" />
    <ShortcutRow keys={['Ctrl', 'Y']} action="إعادة" />
    <ShortcutRow keys={['Ctrl', 'N']} action="عنصر جديد" />
    <ShortcutRow keys={['Ctrl', 'D']} action="نسخ" />
    <ShortcutRow keys={['Ctrl', 'F']} action="بحث" />
    <ShortcutRow keys={['Ctrl', '1']} action="الرئيسية" />
    <ShortcutRow keys={['Ctrl', '2']} action="القائمة" />
  </div>
);
```

---

## 7️⃣ Undo/Redo System (Priority: 🔴 High)
**الوقت المتوقع: 2 ساعات**

### Implement History Stack:

```typescript
// hooks/useHistory.ts
import { useState, useCallback } from 'react';

export const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentState = history[currentIndex];
  
  const setState = useCallback((newState: T) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);
  
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);
  
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);
  
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  return { 
    state: currentState, 
    setState, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  };
};

// في LivePreviewTool:
const { state, setState, undo, redo, canUndo, canRedo } = useHistory({
  businessName,
  serviceType,
  customItems,
  selectedTheme,
  // ... all state
});

// UI:
<div className="flex items-center gap-2">
  <button 
    onClick={undo} 
    disabled={!canUndo}
    className="p-2 rounded hover:bg-secondary disabled:opacity-50"
  >
    <Undo className="w-4 h-4" />
  </button>
  <button 
    onClick={redo} 
    disabled={!canRedo}
    className="p-2 rounded hover:bg-secondary disabled:opacity-50"
  >
    <Redo className="w-4 h-4" />
  </button>
</div>
```

---

## 8️⃣ Better Loading States (Priority: 🟡 Medium)
**الوقت المتوقع: 1 ساعة**

### Add Skeleton Loaders:

```typescript
// components/Skeletons/MenuItemSkeleton.tsx
export const MenuItemSkeleton = () => (
  <div className="bg-white rounded-xl p-2 animate-pulse">
    <div className="flex gap-2">
      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  </div>
);

// Usage:
{isLoading ? (
  <>
    <MenuItemSkeleton />
    <MenuItemSkeleton />
    <MenuItemSkeleton />
  </>
) : (
  items.map(item => <MenuItem key={item.id} item={item} />)
)}
```

---

## 9️⃣ Error Boundaries (Priority: 🔴 High)
**الوقت المتوقع: 30 دقيقة**

### Catch Errors Gracefully:

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PreviewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Preview Error:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-lg font-bold mb-2">حدث خطأ غير متوقع</h3>
          <p className="text-muted-foreground mb-4">
            عذراً، حدث خطأ أثناء عرض المعاينة
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Wrap components:
<PreviewErrorBoundary>
  <LivePreviewTool />
</PreviewErrorBoundary>
```

---

## 🔟 Toast Notifications System (Priority: 🟢 Low)
**الوقت المتوقع: 30 دقيقة**

### Better Feedback:

```typescript
// lib/toast-config.ts
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      duration: 3000,
      position: 'top-center',
      className: 'text-right',
      icon: '✅'
    });
  },
  
  error: (message: string) => {
    sonnerToast.error(message, {
      duration: 4000,
      position: 'top-center',
      className: 'text-right',
      icon: '❌'
    });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      position: 'top-center',
      className: 'text-right'
    });
  },
  
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      position: 'top-center',
      className: 'text-right'
    });
  }
};

// Usage:
const handleSave = async () => {
  await toast.promise(
    saveProject(),
    {
      loading: 'جاري الحفظ...',
      success: 'تم الحفظ بنجاح!',
      error: 'فشل الحفظ'
    }
  );
};
```

---

## 1️⃣1️⃣ Search with Highlights (Priority: 🟢 Low)
**الوقت المتوقع: 45 دقيقة**

### Enhanced Search:

```typescript
// components/SearchHighlight.tsx
export const SearchHighlight = ({ text, query }: Props) => {
  if (!query) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, i) => (
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-foreground px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </span>
  );
};

// Usage:
<SearchHighlight 
  text={item.name} 
  query={searchQuery} 
/>
```

---

## 1️⃣2️⃣ Drag to Reorder Items (Priority: 🟡 Medium)
**الوقت المتوقع: 2 ساعات**

### Add Drag & Drop:

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

```typescript
// components/SortableItemsList.tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ item }: { item: MenuItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-2">
        <button {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <MenuItem item={item} />
      </div>
    </div>
  );
};

export const SortableItemsList = ({ items, onReorder }: Props) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over?.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(item => (
          <SortableItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  );
};
```

---

## 1️⃣3️⃣ Responsive Font Sizing (Priority: 🟢 Low)
**الوقت المتوقع: 15 دقيقة**

### Better Typography:

```typescript
// Add to global CSS:
html {
  font-size: 16px;
}

@media (max-width: 640px) {
  html {
    font-size: 14px;
  }
}

// Or use clamp() for fluid typography:
.fluid-text {
  font-size: clamp(0.875rem, 0.8rem + 0.5vw, 1rem);
}

// في Tailwind config:
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'fluid-sm': 'clamp(0.75rem, 0.7rem + 0.4vw, 0.875rem)',
        'fluid-base': 'clamp(0.875rem, 0.8rem + 0.5vw, 1rem)',
        'fluid-lg': 'clamp(1rem, 0.9rem + 0.6vw, 1.125rem)',
        'fluid-xl': 'clamp(1.125rem, 1rem + 0.8vw, 1.25rem)',
      }
    }
  }
};
```

---

## 1️⃣4️⃣ Copy Preview URL (Priority: 🟡 Medium)
**الوقت المتوقع: 30 دقيقة**

### Shareable URLs:

```typescript
// utils/url-generator.ts
export const generatePreviewURL = (data: PreviewData): string => {
  const encoded = btoa(JSON.stringify({
    name: data.businessName,
    type: data.serviceType,
    theme: data.selectedTheme,
    items: data.customItems.slice(0, 5) // Limit for URL length
  }));
  
  return `${window.location.origin}/preview/${encoded}`;
};

// في LivePreviewTool:
const handleShare = () => {
  const url = generatePreviewURL({
    businessName,
    serviceType,
    selectedTheme,
    customItems
  });
  
  if (navigator.share) {
    // Mobile native share
    navigator.share({
      title: `معاينة ${businessName}`,
      text: 'شوف التصميم الجديد!',
      url
    });
  } else {
    // Copy to clipboard
    copyToClipboard(url, 'تم نسخ الرابط!', 'فشل النسخ');
  }
};
```

---

## 1️⃣5️⃣ Analytics Events (Priority: 🟡 Medium)
**الوقت المتوقع: 1 ساعة**

### Track User Behavior:

```typescript
// lib/analytics.ts
import mixpanel from 'mixpanel-browser';

mixpanel.init('YOUR_TOKEN');

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    mixpanel.track(event, properties);
  },
  
  identify: (userId: string) => {
    mixpanel.identify(userId);
  },
  
  page: (pageName: string) => {
    mixpanel.track('Page View', { page: pageName });
  }
};

// في LivePreviewTool:
// Track business creation
useEffect(() => {
  if (businessName) {
    analytics.track('Preview Created', {
      businessName,
      serviceType,
      theme: selectedTheme
    });
  }
}, [businessName]);

// Track item additions
const handleAddItem = (item: MenuItem) => {
  setCustomItems([...customItems, item]);
  analytics.track('Item Added', {
    itemName: item.name,
    category: item.category,
    serviceType
  });
};

// Track exports
const handleExport = (format: string) => {
  analytics.track('Export', {
    format,
    itemCount: allMenuItems.length,
    serviceType
  });
  // ... export logic
};

// Track page navigation
useEffect(() => {
  analytics.track('Page Changed', {
    from: previousPage,
    to: currentPage
  });
}, [currentPage]);
```

---

## 📊 Implementation Priority

### Week 1 (High Priority):
1. ✅ State Management Cleanup
2. ✅ Component Splitting
3. ✅ Error Boundaries
4. ✅ Undo/Redo System

### Week 2 (Medium Priority):
5. ✅ Virtual Scrolling
6. ✅ Image Optimization
7. ✅ Local Storage
8. ✅ Drag to Reorder

### Week 3 (Nice to Have):
9. ✅ Better Loading States
10. ✅ Enhanced Keyboard Shortcuts
11. ✅ Search Highlights
12. ✅ Toast System
13. ✅ Analytics

---

## 🎯 Expected Results

بعد تنفيذ هذه التحسينات:
- ⚡ **50% faster** performance
- 🎨 **Better** user experience
- 🐛 **Fewer** bugs & crashes
- 📈 **More** user engagement
- 🔧 **Easier** to maintain
- 📊 **Better** insights via analytics

---

## 💡 Quick Tips

### Code Quality:
```typescript
// ✅ DO: Small, focused components
const Button = ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
);

// ❌ DON'T: Giant components with 1000+ lines

// ✅ DO: Custom hooks for logic
const useItemManager = () => {
  const [items, setItems] = useState([]);
  const addItem = (item) => setItems([...items, item]);
  return { items, addItem };
};

// ❌ DON'T: All logic in component

// ✅ DO: TypeScript interfaces
interface MenuItem {
  id: number;
  name: string;
  price: string;
}

// ❌ DON'T: any types everywhere
```

### Performance:
```typescript
// ✅ DO: useMemo for expensive calculations
const filteredItems = useMemo(
  () => items.filter(item => item.featured),
  [items]
);

// ✅ DO: useCallback for functions
const handleClick = useCallback(() => {
  // logic
}, [dependency]);

// ✅ DO: React.memo for pure components
const MenuItem = React.memo(({ item }) => {
  return <div>{item.name}</div>;
});
```

---

## 🚀 Next Steps

1. **Pick 3-4** من القائمة أعلاه
2. **Implement** واحدة واحدة
3. **Test** thoroughly
4. **Measure** impact
5. **Iterate** and improve

**Remember**: Perfect is the enemy of good. Start with quick wins! 💪
