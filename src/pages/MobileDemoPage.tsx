import { useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ShoppingCart, Plus, Star, Clock, Home, Search, User, X, Heart, Grid3x3, List, Moon, Sun, Bell, Filter, ZoomIn, Bookmark, MapPin, Settings, ArrowRight, Flame, Sparkles, Phone, MessageCircle, Share2, Award, TrendingUp, CheckCircle2 } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  rating: number;
  time: string;
  featured?: boolean;
}

const MobileDemoPage = () => {
  const [searchParams] = useSearchParams();
  const businessName = searchParams.get("name") || "Your Business";
  const serviceType = searchParams.get("service") || "restaurant";
  const [cartCount, setCartCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<"home" | "menu" | "cart" | "profile">("home");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [showLumosInfo, setShowLumosInfo] = useState(false);

  // Show welcome banner on mount (QR code scan)
  useEffect(() => {
    // Auto-hide welcome banner after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcomeBanner(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Get menu items based on service type
  const getMenuItems = (): MenuItem[] => {
    const itemsByService: Record<string, MenuItem[]> = {
      restaurant: [
        {
          id: 1,
          name: "ريش ضاني مدخنة",
          description: "ريش ضاني طازجة مدخنة على الفحم مع الأرز والسلطة",
          price: "265",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
          rating: 4.8,
          time: "25 دقيقة",
          featured: true,
        },
        {
          id: 2,
          name: "شطيرة بريسكت",
          description: "بريسكت مشوي مع الخضار الطازج والصلصة الخاصة",
          price: "210",
          image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400",
          rating: 4.9,
          time: "15 دقيقة",
          featured: true,
        },
        {
          id: 3,
          name: "طبق كباب مشوي",
          description: "كباب لحم طازج مع البطاطس المحمرة والسلطة",
          price: "240",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
          rating: 4.7,
          time: "20 دقيقة",
          featured: true,
        },
        {
          id: 4,
          name: "كوب شاي تركي",
          description: "شاي تركي أصيل مع النعناع والليمون",
          price: "25",
          image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400",
          rating: 4.6,
          time: "5 دقائق",
        },
        {
          id: 5,
          name: "تشيز كيك فريش",
          description: "تشيز كيك كريمي مع التوت الطازج",
          price: "85",
          image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400",
          rating: 4.9,
          time: "10 دقائق",
        },
        {
          id: 6,
          name: "برجر لحم كلاسيكي",
          description: "برجر لحم طازج مع الجبن والخضار والصلصة",
          price: "180",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
          rating: 4.8,
          time: "18 دقيقة",
        },
      ],
      cafe: [
        {
          id: 101,
          name: "إسبريسو إيطالي",
          description: "قهوة إسبريسو قوية ومكثفة من أجود أنواع البن",
          price: "35",
          image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400",
          rating: 4.9,
          time: "3 دقائق",
          featured: true,
        },
        {
          id: 102,
          name: "كابتشينو كريمي",
          description: "كابتشينو مع رغوة الحليب الكريمية والكاكاو",
          price: "45",
          image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
          rating: 4.8,
          time: "5 دقائق",
          featured: true,
        },
        {
          id: 103,
          name: "آيس كوفي",
          description: "قهوة باردة مع الحليب والثلج",
          price: "40",
          image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400",
          rating: 4.8,
          time: "4 دقائق",
          featured: true,
        },
        {
          id: 104,
          name: "كرواسون بالشوكولاتة",
          description: "كرواسون طازج محشو بالشوكولاتة الداكنة",
          price: "30",
          image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
          rating: 4.6,
          time: "2 دقيقة",
        },
        {
          id: 105,
          name: "مافن التوت",
          description: "مافن طازج مع التوت الأزرق والكريمة",
          price: "35",
          image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400",
          rating: 4.7,
          time: "2 دقيقة",
        },
        {
          id: 106,
          name: "فرابتشينو شوكولاتة",
          description: "مشروب قهوة بارد مع الشوكولاتة والكريمة",
          price: "55",
          image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400",
          rating: 4.9,
          time: "5 دقائق",
        },
      ],
      salon: [
        {
          id: 201,
          name: "قص شعر رجالي",
          description: "قص شعر احترافي مع تصفيف وتشذيب",
          price: "120",
          image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400",
          rating: 4.8,
          time: "30 دقيقة",
          featured: true,
        },
        {
          id: 202,
          name: "قص شعر نسائي",
          description: "قص وتشذيب احترافي مع نصائح للعناية",
          price: "150",
          image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
          rating: 4.9,
          time: "45 دقيقة",
          featured: true,
        },
        {
          id: 203,
          name: "تصفيف شعر",
          description: "تصفيف احترافي مع مجفف ومكواة",
          price: "80",
          image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400",
          rating: 4.7,
          time: "25 دقيقة",
        },
        {
          id: 204,
          name: "صبغة شعر كاملة",
          description: "صبغة شعر احترافية مع منتجات عالية الجودة",
          price: "350",
          image: "https://images.unsplash.com/photo-1560869713-7d563b774f42?w=400",
          rating: 4.8,
          time: "90 دقيقة",
          featured: true,
        },
        {
          id: 205,
          name: "علاج الشعر",
          description: "علاج عميق للشعر التالف والمجهد",
          price: "200",
          image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400",
          rating: 4.9,
          time: "60 دقيقة",
        },
        {
          id: 206,
          name: "تسريحة مناسبة",
          description: "تسريحة احترافية للمناسبات",
          price: "100",
          image: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=400",
          rating: 4.8,
          time: "40 دقيقة",
        },
      ],
      pharmacy: [
        {
          id: 301,
          name: "باراسيتامول 500 مجم",
          description: "مسكن للآلام وخافض للحرارة",
          price: "15",
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
          rating: 4.7,
          time: "متوفر",
          featured: true,
        },
        {
          id: 302,
          name: "فيتامين د3",
          description: "مكمل غذائي لفيتامين د3 1000 وحدة",
          price: "85",
          image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400",
          rating: 4.8,
          time: "متوفر",
          featured: true,
        },
        {
          id: 303,
          name: "كريم مرطب للوجه",
          description: "كريم مرطب يومي للبشرة الحساسة",
          price: "120",
          image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
          rating: 4.6,
          time: "متوفر",
        },
        {
          id: 304,
          name: "شامبو للأطفال",
          description: "شامبو لطيف خالي من الكيماويات",
          price: "45",
          image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400",
          rating: 4.9,
          time: "متوفر",
        },
        {
          id: 305,
          name: "أوميغا 3",
          description: "مكمل غذائي من زيت السمك",
          price: "150",
          image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
          rating: 4.7,
          time: "متوفر",
        },
        {
          id: 306,
          name: "مضاد حيوي",
          description: "أموكسيسيلين 500 مجم - بوصفة طبية",
          price: "35",
          image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
          rating: 4.5,
          time: "بوصفة",
        },
      ],
      store: [
        {
          id: 401,
          name: "هاتف ذكي",
          description: "هاتف ذكي بشاشة 6.7 بوصة وكاميرا 108 ميجابكسل",
          price: "8500",
          image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
          rating: 4.8,
          time: "متوفر",
          featured: true,
        },
        {
          id: 402,
          name: "تيشيرت قطني",
          description: "تيشيرت قطني 100% بألوان متعددة",
          price: "150",
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
          rating: 4.6,
          time: "متوفر",
          featured: true,
        },
        {
          id: 403,
          name: "سجادة منزلية",
          description: "سجادة فاخرة من الصوف الطبيعي",
          price: "1200",
          image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
          rating: 4.7,
          time: "متوفر",
        },
        {
          id: 404,
          name: "كرة قدم",
          description: "كرة قدم احترافية من الجلد الطبيعي",
          price: "250",
          image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400",
          rating: 4.8,
          time: "متوفر",
        },
        {
          id: 405,
          name: "سماعات لاسلكية",
          description: "سماعات بلوتوث مع إلغاء الضوضاء",
          price: "450",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          rating: 4.9,
          time: "متوفر",
        },
        {
          id: 406,
          name: "جينز كلاسيكي",
          description: "بنطلون جينز بقصة مستقيمة",
          price: "320",
          image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
          rating: 4.7,
          time: "متوفر",
        },
      ],
      clinic: [
        {
          id: 501,
          name: "استشارة طبية عامة",
          description: "فحص طبي شامل مع طبيب مختص",
          price: "200",
          image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
          rating: 4.9,
          time: "30 دقيقة",
          featured: true,
        },
        {
          id: 502,
          name: "فحص ضغط الدم",
          description: "قياس ضغط الدم مع تقرير طبي",
          price: "50",
          image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
          rating: 4.7,
          time: "10 دقائق",
        },
        {
          id: 503,
          name: "علاج فيزيائي",
          description: "جلسة علاج فيزيائي للعضلات والمفاصل",
          price: "300",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
          rating: 4.8,
          time: "45 دقيقة",
          featured: true,
        },
        {
          id: 504,
          name: "تحليل دم شامل",
          description: "تحليل دم كامل مع تقرير مفصل",
          price: "400",
          image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400",
          rating: 4.9,
          time: "15 دقيقة",
        },
        {
          id: 505,
          name: "استشارة أسنان",
          description: "فحص الأسنان واللثة مع طبيب أسنان",
          price: "150",
          image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400",
          rating: 4.8,
          time: "20 دقيقة",
        },
        {
          id: 506,
          name: "فحص النظر",
          description: "فحص شامل للعين والنظر",
          price: "180",
          image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
          rating: 4.8,
          time: "25 دقيقة",
        },
      ],
    };

    return itemsByService[serviceType] || itemsByService.restaurant;
  };

  const menuItems = getMenuItems();

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory === "featured") {
      filtered = filtered.filter(item => item.featured);
    }

    return filtered;
  }, [menuItems, searchQuery, selectedCategory]);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  const cartItems = filteredItems.slice(0, cartCount);
  const totalPrice = cartItems.reduce((sum, item) => sum + parseInt(item.price), 0);

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
      {/* Status Bar */}
      <div className="bg-slate-900 px-4 py-1 flex items-center justify-between text-white text-xs">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-white rounded-sm">
            <div className="w-3 h-1.5 bg-white rounded-sm m-0.5" />
          </div>
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </div>

      {/* Welcome Banner - Shows when QR code is scanned */}
      {showWelcomeBanner && (
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white px-4 py-3 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <div>
                <p className="text-sm font-bold">مرحباً بك في {businessName}!</p>
                <p className="text-xs opacity-90">هذه معاينة تفاعلية من Lumos Agency</p>
              </div>
            </div>
            <button
              onClick={() => setShowWelcomeBanner(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lumos Agency Info Banner */}
      {showLumosInfo && (
        <div className={`${isDarkMode ? "bg-slate-800" : "bg-gradient-to-r from-primary/10 to-primary/5"} border-b ${isDarkMode ? "border-slate-700" : "border-primary/20"} px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Lumos Agency</p>
                <p className="text-xs text-muted-foreground">نحول عملك إلى علامة تجارية رقمية</p>
              </div>
            </div>
            <button
              onClick={() => setShowLumosInfo(false)}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <a
              href="https://wa.me/201279897482"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-semibold hover:bg-[#25D366]/90 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              واتساب
            </a>
            <a
              href="tel:+201279897482"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              اتصل بنا
            </a>
            <button
              onClick={() => {
                navigator.share?.({
                  title: `${businessName} - معاينة من Lumos Agency`,
                  text: `جرب معاينة ${businessName} التفاعلية!`,
                  url: window.location.href,
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("تم نسخ الرابط!");
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              مشاركة
            </button>
          </div>
        </div>
      )}

      {/* App Header */}
      <header className="bg-gradient-to-r from-primary via-primary to-primary/90 text-white px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-90 mb-0.5">Welcome to</p>
            <h1 className="text-xl font-bold">{businessName}</h1>
          </div>
          <button
            onClick={() => setShowLumosInfo(!showLumosInfo)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title="معلومات عن Lumos Agency"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {currentPage === "home" && (
              <div className="relative">
                <button
                  onClick={() => setNotifications(0)}
                  className="p-1.5 rounded-lg transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {notifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
            )}
            {currentPage === "menu" && (
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1.5 rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs opacity-90">
          {serviceType === "restaurant" ? "مفتوح الآن • توصيل 30-45 دقيقة" :
           serviceType === "cafe" ? "مفتوح الآن • جاهز للاستلام" :
           serviceType === "salon" ? "مفتوح الآن • احجز موعدك" :
           serviceType === "pharmacy" ? "مفتوح الآن • متوفر للطلب" :
           serviceType === "store" ? "مفتوح الآن • توصيل سريع" :
           serviceType === "clinic" ? "مفتوح الآن • احجز موعدك" :
           "مفتوح الآن"}
        </p>
      </header>

      {/* Search Bar */}
      {showSearch && currentPage === "menu" && (
        <div className="px-4 py-2 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن..."
              className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Home Page */}
      {currentPage === "home" && (
        <>
          {/* Hero Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={
                serviceType === "restaurant" ? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" :
                serviceType === "cafe" ? "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800" :
                serviceType === "salon" ? "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800" :
                serviceType === "pharmacy" ? "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800" :
                serviceType === "store" ? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" :
                serviceType === "clinic" ? "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800" :
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
              }
              alt={businessName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-white text-lg font-bold mb-1">
                {serviceType === "restaurant" ? "أطباق لذيذة في انتظارك" :
                 serviceType === "cafe" ? "مشروبات ساخنة وباردة" :
                 serviceType === "salon" ? "خدمات تجميل احترافية" :
                 serviceType === "pharmacy" ? "منتجات صحية وطبية" :
                 serviceType === "store" ? "منتجات متنوعة" :
                 serviceType === "clinic" ? "خدمات طبية متخصصة" :
                 "خدماتنا"}
              </h2>
              <p className="text-white/90 text-sm">
                {serviceType === "restaurant" ? "اطلب الآن واستمتع بوجبات طازجة" :
                 serviceType === "cafe" ? "استمتع بأجود أنواع القهوة" :
                 serviceType === "salon" ? "احجز موعدك الآن" :
                 serviceType === "pharmacy" ? "اطلب منتجاتك الآن" :
                 serviceType === "store" ? "تسوق الآن" :
                 serviceType === "clinic" ? "احجز موعدك الآن" :
                 "اطلب الآن"}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 text-center border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                <div className="text-xl font-bold text-primary">{filteredItems.length}</div>
                <div className="text-xs text-gray-500">عنصر</div>
              </div>
              <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 text-center border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                <div className="text-xl font-bold text-primary">4.8</div>
                <div className="text-xs text-gray-500">تقييم</div>
              </div>
              <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 text-center border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                <div className="text-xl font-bold text-primary">{filteredItems.filter(item => item.featured).length}</div>
                <div className="text-xs text-gray-500">مميز</div>
              </div>
            </div>

            {/* Featured Items */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">الأكثر طلباً</h3>
              <div className="space-y-3">
                {filteredItems.filter(item => item.featured).slice(0, 3).map((item) => (
                  <div key={item.id} className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 flex gap-3 border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-1 mb-1">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{item.price} EGP</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentPage("menu")}
              className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <span>تصفح القائمة</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Lumos Agency CTA Card */}
            <div className={`mt-4 ${isDarkMode ? "bg-gradient-to-r from-primary/20 to-primary/10" : "bg-gradient-to-r from-primary/10 to-primary/5"} rounded-xl p-4 border ${isDarkMode ? "border-primary/30" : "border-primary/20"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">صمم منيوك الرقمي مع Lumos</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                هذه معاينة تفاعلية. احصل على منيو رقمي احترافي كامل مع نظام طلبات متكامل!
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>تصميم احترافي</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>نظام طلبات</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>إدارة كاملة</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>دعم فني</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="https://wa.me/201279897482"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#25D366]/90 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  تواصل معنا
                </a>
                <a
                  href="tel:+201279897482"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  اتصل الآن
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Menu Page */}
      {currentPage === "menu" && (
        <div className="px-4 py-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-gray-400"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-gray-400"}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg text-gray-400"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === "all" ? "bg-primary text-white" : isDarkMode ? "bg-slate-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedCategory("featured")}
              className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-1 ${selectedCategory === "featured" ? "bg-primary text-white" : isDarkMode ? "bg-slate-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}
            >
              <Flame className="w-3 h-3" />
              مميز
            </button>
          </div>

          <h3 className="text-xl font-bold mb-4 text-gray-900">
            {serviceType === "restaurant" ? "الأطباق الشائعة" :
             serviceType === "cafe" ? "المشروبات الشائعة" :
             serviceType === "salon" ? "الخدمات الشائعة" :
             serviceType === "pharmacy" ? "المنتجات الشائعة" :
             serviceType === "store" ? "المنتجات الشائعة" :
             serviceType === "clinic" ? "الخدمات الشائعة" :
             "العناصر الشائعة"}
          </h3>

          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-xl shadow-sm border ${isDarkMode ? "border-slate-700" : "border-gray-100"} overflow-hidden`}
                >
                  <div className="flex gap-3 p-3">
                    <div
                      className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                      onClick={() => setSelectedImage(item.image)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {item.featured && (
                        <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
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
                        className="absolute bottom-1 left-1 p-1 bg-white/90 backdrop-blur-sm rounded-full"
                      >
                        <Heart className={`w-3 h-3 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                        <span className="font-bold text-primary text-sm whitespace-nowrap">
                          {item.price} EGP
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-primary text-white py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {serviceType === "restaurant" ? "أضف للسلة" :
                         serviceType === "cafe" ? "أضف للسلة" :
                         serviceType === "salon" ? "احجز الآن" :
                         serviceType === "pharmacy" ? "أضف للسلة" :
                         serviceType === "store" ? "أضف للسلة" :
                         serviceType === "clinic" ? "احجز الآن" :
                         "أضف للسلة"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-xl shadow-sm border ${isDarkMode ? "border-slate-700" : "border-gray-100"} overflow-hidden`}
                >
                  <div
                    className="relative aspect-square cursor-pointer group"
                    onClick={() => setSelectedImage(item.image)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {item.featured && (
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        <Star className="w-2 h-2 fill-white inline" />
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
                      className="absolute bottom-1 left-1 p-1 bg-white/90 backdrop-blur-sm rounded-full"
                    >
                      <Heart className={`w-3 h-3 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    </button>
                  </div>
                  <div className="p-2">
                    <h4 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-gray-600 mb-2 line-clamp-1">{item.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary">{item.price} EGP</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px]">{item.rating}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-primary text-white py-1.5 rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      أضف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cart Page */}
      {currentPage === "cart" && (
        <div className="px-4 py-4">
          {cartCount > 0 ? (
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-xl p-4 border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">السلة ({cartCount})</h3>
                <button
                  onClick={() => setCartCount(0)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  مسح الكل
                </button>
              </div>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-600">{item.price} EGP</p>
                    </div>
                    <button className="text-red-500 hover:text-red-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">المجموع</span>
                  <span className="text-lg font-bold text-primary">{totalPrice} EGP</span>
                </div>
                <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold">
                  إتمام الطلب
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">السلة فارغة</p>
              <button
                onClick={() => setCurrentPage("menu")}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold"
              >
                تصفح القائمة
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Page */}
      {currentPage === "profile" && (
        <div className="px-4 py-4">
          <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-xl p-4 mb-4 border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{businessName}</h3>
              <p className="text-sm text-gray-600">عضو منذ 2024</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 text-center border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
              <div className="text-xl font-bold text-primary">{cartCount}</div>
              <div className="text-xs text-gray-500">طلبات</div>
            </div>
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 text-center border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
              <div className="text-xl font-bold text-primary">4.8</div>
              <div className="text-xs text-gray-500">تقييم</div>
            </div>
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 text-center border ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
              <div className="text-xl font-bold text-primary">{favorites.length}</div>
              <div className="text-xs text-gray-500">مفضلة</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-900">المفضلة ({favorites.length})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-900">الطلبات السابقة</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-900">العناوين المحفوظة</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-900">الإشعارات</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-900">الإعدادات</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`${isDarkMode ? "bg-slate-800" : "bg-white"} rounded-lg p-3 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                {isDarkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
                <span className="text-sm font-medium text-gray-900">الوضع الليلي</span>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${isDarkMode ? "bg-primary" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isDarkMode ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
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

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? "bg-slate-800" : "bg-white"} border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"} px-4 py-2 flex items-center justify-around shadow-lg`}>
        <button
          onClick={() => setCurrentPage("home")}
          className={`flex flex-col items-center gap-1 py-1 ${currentPage === "home" ? "text-primary" : "text-gray-400"}`}
        >
          <Home className="w-5 h-5" style={currentPage === "home" ? { fill: "currentColor" } : {}} />
          <span className="text-xs font-medium">الرئيسية</span>
        </button>
        <button
          onClick={() => setCurrentPage("menu")}
          className={`flex flex-col items-center gap-1 py-1 ${currentPage === "menu" ? "text-primary" : "text-gray-400"}`}
        >
          <Search className="w-5 h-5" style={currentPage === "menu" ? { fill: "currentColor" } : {}} />
          <span className="text-xs font-medium">القائمة</span>
        </button>
        <button
          onClick={() => setCurrentPage("cart")}
          className={`relative flex flex-col items-center gap-1 py-1 ${currentPage === "cart" ? "text-primary" : "text-gray-400"}`}
        >
          <ShoppingCart className="w-5 h-5" style={currentPage === "cart" ? { fill: "currentColor" } : {}} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
          <span className="text-xs font-medium">السلة</span>
        </button>
        <button
          onClick={() => setCurrentPage("profile")}
          className={`flex flex-col items-center gap-1 py-1 ${currentPage === "profile" ? "text-primary" : "text-gray-400"}`}
        >
          <User className="w-5 h-5" style={currentPage === "profile" ? { fill: "currentColor" } : {}} />
          <span className="text-xs font-medium">حسابي</span>
        </button>
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-16"></div>
    </div>
  );
};

export default MobileDemoPage;
