// ============================================
// CREATIVE STUDIO TYPES
// ============================================

// ============ PROJECT TYPES ============

export interface Project {
  id: string;
  user_id: string;
  client_id?: string;
  name: string;
  description?: string;
  type: 'logo' | 'app' | 'full';
  industry?: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'completed' | 'archived';
  is_public: boolean;
  thumbnail?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_edited_at: string;
  completed_at?: string;
  views: number;
  likes: number;
}

export interface ProjectWithDetails extends Project {
  logo?: LogoDesign;
  app_design?: AppDesign;
  version_count?: number;
  collaborator_count?: number;
  comment_count?: number;
}

// ============ LOGO TYPES ============

export interface LogoConfig {
  // Text settings
  text: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  letterSpacing: number;
  textGradient: boolean;
  textColorStart: string;
  textColorEnd: string;
  
  // Icon settings
  iconName: string;
  iconSize: number;
  iconRotation: number;
  iconGradient: boolean;
  iconColorStart: string;
  iconColorEnd: string;
  
  // Layout settings
  layoutMode: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  gap: number;
  padding: number;
  
  // Background settings
  bgType: 'transparent' | 'solid' | 'gradient';
  bgColorStart: string;
  bgColorEnd: string;
  borderRadius: number;
  shadow: boolean;
  glow: boolean;
}

export interface LogoVariants {
  light?: string;
  dark?: string;
  mono?: string;
  color?: string;
}

export interface LogoMockups {
  canvas?: string;
  tshirt?: string;
  neon?: string;
  card?: string;
  web?: string;
  billboard?: string;
  packaging?: string;
  social?: string;
}

export interface LogoExports {
  png?: string;
  svg?: string;
  pdf?: string;
  eps?: string;
}

export interface BrandKit {
  colors: string[];
  fonts: string[];
  spacing: Record<string, number>;
  usage_guidelines: string;
}

export interface LogoDesign {
  id: string;
  project_id: string;
  config: LogoConfig;
  variants: LogoVariants;
  mockups: LogoMockups;
  exports: LogoExports;
  brand_kit: BrandKit;
  is_final: boolean;
  version_number: number;
  created_at: string;
  updated_at: string;
}

// ============ APP DESIGN TYPES ============

export interface AppTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text?: string;
    textSecondary?: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
  };
  spacing: {
    padding: number;
    margin: number;
    borderRadius: number;
  };
  custom?: boolean;
  gradient?: string;
}

export interface AppPage {
  id: string;
  name: string;
  type: 'landing' | 'menu' | 'category' | 'detail' | 'cart' | 'profile' | 'contact' | 'custom';
  content: Record<string, any>;
  order: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  featured?: boolean;
  time?: string;
  rating?: number;
  badge?: string;
}

export interface AppNavigation {
  type: 'bottom' | 'side' | 'top';
  items: {
    id: string;
    label: string;
    icon: string;
    page_id?: string;
  }[];
}

export interface AppSettings {
  language: 'ar' | 'en';
  rtl: boolean;
  darkMode: boolean;
  showRatings: boolean;
  showSearch: boolean;
  enableAnimations: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

export interface AppFeatures {
  cart: boolean;
  favorites: boolean;
  reviews: boolean;
  notifications: boolean;
  search: boolean;
  filters: boolean;
  socialShare: boolean;
  chat: boolean;
  booking: boolean;
  payment: boolean;
}

export interface AppSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface AppDesign {
  id: string;
  project_id: string;
  business_name: string;
  service_type: string;
  pages: AppPage[];
  theme: AppTheme;
  items: MenuItem[];
  settings: AppSettings;
  features: AppFeatures;
  navigation: AppNavigation;
  seo: AppSEO;
  exports: {
    pwa?: string;
    reactNative?: string;
    flutter?: string;
    html?: string;
  };
  is_final: boolean;
  version_number: number;
  created_at: string;
  updated_at: string;
}

// ============ TEMPLATE TYPES ============

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'logo' | 'app' | 'full';
  category?: string;
  industry?: string[];
  config: LogoConfig | Partial<AppDesign> | { logo: LogoConfig; app: Partial<AppDesign> };
  preview_url?: string;
  is_premium: boolean;
  price: number;
  is_public: boolean;
  created_by?: string;
  is_official: boolean;
  downloads: number;
  views: number;
  likes: number;
  rating: number;
  rating_count: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// ============ ASSET TYPES ============

export interface Asset {
  id: string;
  user_id: string;
  project_id?: string;
  file_name: string;
  file_type: 'image' | 'icon' | 'video' | 'document' | 'font';
  mime_type?: string;
  file_url: string;
  file_size?: number;
  width?: number;
  height?: number;
  format?: string;
  folder?: string;
  tags?: string[];
  used_in?: string[];
  usage_count: number;
  alt_text?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  uploaded_at: string;
}

// ============ VERSION TYPES ============

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  version_name?: string;
  notes?: string;
  snapshot: {
    logo?: LogoDesign;
    app?: AppDesign;
    project: Partial<Project>;
  };
  changes: {
    logo: boolean;
    app: boolean;
    settings: boolean;
  };
  created_by?: string;
  is_auto_save: boolean;
  created_at: string;
}

// ============ COLLABORATION TYPES ============

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  permissions: {
    edit: boolean;
    comment: boolean;
    export: boolean;
    delete: boolean;
    invite: boolean;
  };
  status: 'pending' | 'active' | 'inactive';
  invited_by?: string;
  created_at: string;
  accepted_at?: string;
  last_active_at?: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  comment: string;
  target_type?: 'logo' | 'app' | 'page' | 'general';
  target_id?: string;
  coordinates?: { x: number; y: number };
  parent_id?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  reactions?: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

// ============ STUDIO STATE TYPES ============

export type StudioTab = 'logo' | 'app' | 'preview' | 'assets' | 'settings';
export type ActiveTool = 'logo' | 'app' | 'assets';

export interface StudioState {
  activeTab: StudioTab;
  activeTool: ActiveTool;
  currentProjectId: string | null;
  isPreviewOpen: boolean;
  project: Project | null;
  logo: LogoDesign | null;
  appDesign: AppDesign | null;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface StudioContextType extends StudioState {
  setActiveTab: (tab: StudioTab) => void;
  loadProject: (projectId: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  saveProject: () => Promise<void>;
  updateLogo: (config: Partial<LogoConfig>) => void;
  updateAppDesign: (data: Partial<AppDesign>) => void;
  syncLogoToApp: () => void;
  exportProject: (format: string) => Promise<void>;
  resetStudio: () => void;
}

// ============ SERVICE TYPES ============

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============ SYNC TYPES ============

export interface SyncConfig {
  syncColors: boolean;
  syncFonts: boolean;
  syncLogo: boolean;
  autoSync: boolean;
}

export interface SyncState {
  lastSync: Date | null;
  isSyncing: boolean;
  syncErrors: string[];
}
