import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Globe,
  Github,
  Linkedin,
  LockKeyhole,
  LogOut,
  Save,
  ShieldCheck,
  Sparkles,
  Twitter,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { profileService } from "@/services/profileService";
import { adminText } from "@/data/adminI18n";

const AVATARS = [
  "/AVATARS/10491830.jpg",
  "/AVATARS/9434619.jpg",
  "/AVATARS/9439678.jpg",
  "/AVATARS/androgynous-avatar-non-binary-queer-person(1).jpg",
  "/AVATARS/androgynous-avatar-non-binary-queer-person.jpg",
];

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #f6faf4 0%, #e3efe7 52%, #dbe9e1 100%)",
  "linear-gradient(135deg, #f9f4ec 0%, #ece5d7 50%, #d9ead9 100%)",
  "linear-gradient(135deg, #f5f7f1 0%, #e4ede1 48%, #dce8d6 100%)",
  "linear-gradient(135deg, #f8f3ef 0%, #efe2d6 46%, #deecdf 100%)",
  "linear-gradient(135deg, #f4f6f3 0%, #dfece4 56%, #d5e4dc 100%)",
];

function resolveCoverGradient(value?: string | null): string {
  if (!value) return COVER_GRADIENTS[0];
  if (value.includes("gradient(")) return value;

  const legacyMap: Record<string, string> = {
    "from-indigo-600 via-purple-600 to-pink-500": COVER_GRADIENTS[0],
    "from-slate-800 via-slate-700 to-slate-600": COVER_GRADIENTS[2],
    "from-emerald-500 via-teal-600 to-cyan-600": COVER_GRADIENTS[4],
    "from-orange-500 via-pink-500 to-rose-500": COVER_GRADIENTS[3],
    "from-violet-600 via-indigo-600 to-blue-600": COVER_GRADIENTS[1],
  };

  return legacyMap[value] || COVER_GRADIENTS[0];
}

type FocusArea = "photo" | "identity" | "security" | "notifications";
type Socials = { twitter: string; linkedin: string; github: string };

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const SectionCard = ({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) => (
  <section className="rounded-[32px] border border-[color:rgba(127,142,106,0.22)] bg-white/88 p-6 shadow-[0_24px_70px_rgba(36,119,54,0.08)] backdrop-blur-xl sm:p-7">
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:rgba(36,119,54,0.72)]">{eyebrow}</p>
    <h2 className="mt-3 text-xl font-semibold text-[var(--lumos-dark)]">{title}</h2>
    <div className="mt-5">{children}</div>
  </section>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block space-y-2">
    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:rgba(36,119,54,0.65)]">{label}</span>
    {children}
  </label>
);

const ActionPill = ({
  title,
  description,
  icon,
  isActive,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-center justify-between rounded-[24px] border px-5 py-4 text-left transition-all duration-200 ${isActive
      ? "border-[color:rgba(7,127,91,0.35)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(234,243,236,0.9)_100%)] shadow-[0_20px_40px_rgba(7,127,91,0.08)]"
      : "border-[color:rgba(127,142,106,0.18)] bg-white/72 hover:border-[color:rgba(7,127,91,0.28)] hover:bg-white/92"
      }`}
  >
    <span className="flex items-start gap-3">
      <span className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(7,127,91,0.08)] text-[var(--lumos-primary)]">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-[var(--lumos-dark)]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[var(--lumos-secondary)]">{description}</span>
      </span>
    </span>
    <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? "translate-x-0.5 text-[var(--lumos-primary)]" : "text-[color:rgba(36,119,54,0.46)] group-hover:translate-x-0.5"}`} />
  </button>
);

const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[color:rgba(127,142,106,0.18)] bg-[color:rgba(255,255,255,0.65)] px-4 py-4">
    <div>
      <p className="text-sm font-semibold text-[var(--lumos-dark)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--lumos-secondary)]">{description}</p>
    </div>
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 rounded-full transition-colors ${checked ? "bg-[var(--lumos-primary)]" : "bg-[color:rgba(127,142,106,0.28)]"}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-7" : "translate-x-1"}`}
      />
    </button>
  </div>
);

const UserBadge = ({ username }: { username: string }) => (
  <div className="inline-flex items-center gap-3 rounded-full border border-[color:rgba(127,142,106,0.26)] bg-white/82 px-3 py-2 shadow-[0_12px_30px_rgba(36,119,54,0.08)] backdrop-blur-xl">
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(7,127,91,0.16)_0%,rgba(36,119,54,0.08)_100%)] text-sm font-semibold text-[var(--lumos-primary)]">
      {username.slice(0, 2).toUpperCase()}
    </span>
    <span>
      <span className="block text-xs font-medium uppercase tracking-[0.22em] text-[color:rgba(36,119,54,0.56)]">User Badge</span>
      <span className="block text-sm font-semibold text-[var(--lumos-dark)]">{username}</span>
    </span>
  </div>
);

const AdminProfile = () => {
  const navigate = useNavigate();
  const { client, logout, loading: authLoading } = useAuth();
  const { isArabic } = useLanguage();
  const tx = (key: Parameters<typeof adminText>[0]) => adminText(key, isArabic);

  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeArea, setActiveArea] = useState<FocusArea>("photo");

  const [displayName, setDisplayName] = useState("George Kamel");
  const [tagline, setTagline] = useState("Founder, creative strategist, and systems builder.");
  const [bio, setBio] = useState("Building elegant digital products with calm systems, premium brand direction, and practical execution.");
  const [website, setWebsite] = useState("");
  const [socials, setSocials] = useState<Socials>({ twitter: "", linkedin: "", github: "" });
  const [brandColors, setBrandColors] = useState<string[]>(["#077F5B", "#247736"]);
  const [themeAccent, setThemeAccent] = useState("#077F5B");
  const [avatarUrl, setAvatarUrl] = useState(AVATARS[0]);
  const [coverGradient, setCoverGradient] = useState(COVER_GRADIENTS[0]);
  const [timezone, setTimezone] = useState("UTC+3 Cairo");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);
  const [productNews, setProductNews] = useState(false);
  const [commentNotifications, setCommentNotifications] = useState(true);

  useEffect(() => {
    if (!authLoading && !client) {
      navigate("/admin/login", { replace: true });
    }
  }, [authLoading, client, navigate]);

  const loadData = useCallback(async () => {
    if (!client?.id) return;

    const profile = await profileService.getProfile(client.id);
    if (!profile) return;

    if (profile.display_name) setDisplayName(profile.display_name);
    if (profile.tagline) setTagline(profile.tagline);
    if (profile.bio) setBio(profile.bio);
    if (profile.website) setWebsite(profile.website);
    if (profile.social_links) {
      const socialLinks = profile.social_links as Partial<Socials>;
      setSocials({
        twitter: socialLinks.twitter || "",
        linkedin: socialLinks.linkedin || "",
        github: socialLinks.github || "",
      });
    }
    if (profile.brand_colors?.length) setBrandColors(profile.brand_colors);
    if (profile.theme_accent) setThemeAccent(profile.theme_accent);
    if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
    if (profile.cover_gradient) setCoverGradient(resolveCoverGradient(profile.cover_gradient));
    if (profile.timezone) setTimezone(profile.timezone);
  }, [client?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!client?.id) return;

    setSaving(true);
    const ok = await profileService.updateProfile(client.id, {
      display_name: displayName,
      tagline,
      bio,
      website,
      social_links: socials,
      brand_colors: brandColors,
      theme_accent: themeAccent,
      avatar_url: avatarUrl,
      cover_gradient: coverGradient,
      timezone,
    });
    setSaving(false);

    if (ok) {
      toast.success(tx("profileSaved"));
      return;
    }

    toast.error(tx("saveFailed"));
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!client?.id || !file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile image must be smaller than 5 MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `profile-avatars/${client.id}-${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("client-assets").upload(path, file, { upsert: true });

      if (error) {
        console.error("Admin avatar upload error:", error);
        toast.error(tx("uploadFailed"));
        return;
      }

      const { data } = supabase.storage.from("client-assets").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success(tx("profilePhotoUpdated"));
    } catch (error) {
      console.error(error);
      toast.error(tx("uploadFailed"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const applyAction = (area: FocusArea, sectionId: string) => {
    setActiveArea(area);
    scrollToSection(sectionId);
  };

  const completionScore = Math.round(
    ([displayName, tagline, bio, website, timezone, socials.linkedin, avatarUrl].filter(Boolean).length / 7) * 100,
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f3]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#077F5B] border-t-transparent" />
      </div>
    );
  }

  if (!client) return null;

  const username = client.username || "George Kamel";

  return (
    <div
      className="min-h-screen bg-[var(--lumos-light)] text-[var(--lumos-dark)]"
      style={
        {
          "--lumos-light": "#F4F6F3",
          "--lumos-dark": "#1E1E1E",
          "--lumos-primary": "#077F5B",
          "--lumos-secondary": "#247736",
          "--lumos-moss": "#7F8E6A",
        } as React.CSSProperties
      }
    >
      <EnhancedNavbar />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(circle_at_top,rgba(7,127,91,0.16),transparent_58%)]" />
        <div className="absolute left-[-8%] top-[24%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(36,119,54,0.1),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[8%] right-[-6%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(127,142,106,0.12),transparent_70%)] blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-6xl px-4 pb-36 pt-28 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-4 self-start rounded-full border border-[color:rgba(127,142,106,0.22)] bg-white/75 px-4 py-3 shadow-[0_14px_40px_rgba(36,119,54,0.06)] backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:rgba(7,127,91,0.14)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(226,239,231,0.94)_100%)] shadow-inner">
              <Sparkles className="h-5 w-5 text-[var(--lumos-primary)]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:rgba(36,119,54,0.56)]">LUMOS</p>
              <p className="text-sm text-[var(--lumos-secondary)]">Simple luxury profile settings</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <UserBadge username={username} />
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[color:rgba(127,142,106,0.24)] bg-white/78 px-4 text-sm font-medium text-[var(--lumos-dark)] shadow-[0_12px_30px_rgba(36,119,54,0.05)] backdrop-blur-xl transition-colors hover:bg-white"
            >
              <LogOut className="h-4 w-4 text-[var(--lumos-primary)]" />
              {tx("signOut")}
            </button>
          </div>
        </header>

        <section
          className="overflow-hidden rounded-[40px] border border-[color:rgba(127,142,106,0.22)] bg-white/62 p-6 shadow-[0_40px_120px_rgba(36,119,54,0.08)] backdrop-blur-2xl sm:p-8"
          style={{ backgroundImage: `${coverGradient}, linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(244,246,243,0.92) 100%)` }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="relative mx-auto mb-6 h-36 w-36 sm:h-40 sm:w-40">
              <div className="absolute inset-[-18px] rounded-full bg-[radial-gradient(circle,rgba(7,127,91,0.18),transparent_70%)] blur-2xl" />
              <div className="relative h-full w-full rounded-full border border-white/80 bg-white/75 p-2 shadow-[0_30px_80px_rgba(7,127,91,0.18)] backdrop-blur-xl">
                <img src={avatarUrl} alt="Profile avatar" className="h-full w-full rounded-full object-cover" />
                <label className="absolute bottom-2 right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/80 bg-[var(--lumos-primary)] text-white shadow-lg transition-transform hover:scale-105">
                  {avatarUploading ? <Upload className="h-4 w-4 animate-pulse" /> : <Camera className="h-4 w-4" />}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => void handleAvatarUpload(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:rgba(36,119,54,0.56)]">Hello, {displayName.split(" ")[0]}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--lumos-dark)] sm:text-5xl">Premium profile settings, refined for trust.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--lumos-secondary)] sm:text-lg">
              Keep your identity polished, your account secure, and your communication preferences intentional.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/84 px-4 py-2 text-sm text-[var(--lumos-dark)] shadow-sm">
                <ShieldCheck className="h-4 w-4 text-[var(--lumos-primary)]" />
                Verified admin
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/84 px-4 py-2 text-sm text-[var(--lumos-dark)] shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-[var(--lumos-primary)]" />
                {completionScore}% profile complete
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/84 px-4 py-2 text-sm text-[var(--lumos-dark)] shadow-sm">
                <Globe className="h-4 w-4 text-[var(--lumos-primary)]" />
                {timezone}
              </span>
            </div>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2 xl:grid-cols-4">
              <ActionPill
                title="Change Profile Picture"
                description="Upload a clean headshot or swap to a preset image."
                icon={<Camera className="h-5 w-5" />}
                isActive={activeArea === "photo"}
                onClick={() => applyAction("photo", "photo-section")}
              />
              <ActionPill
                title="Update Name & Bio"
                description="Refine your intro, headline, and social presence."
                icon={<User className="h-5 w-5" />}
                isActive={activeArea === "identity"}
                onClick={() => applyAction("identity", "identity-section")}
              />
              <ActionPill
                title="Account Security"
                description="Control login safety, sessions, and recovery alerts."
                icon={<LockKeyhole className="h-5 w-5" />}
                isActive={activeArea === "security"}
                onClick={() => applyAction("security", "security-section")}
              />
              <ActionPill
                title="Notification Settings"
                description="Choose which signals deserve your attention."
                icon={<Bell className="h-5 w-5" />}
                isActive={activeArea === "notifications"}
                onClick={() => applyAction("notifications", "notifications-section")}
              />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div id="photo-section">
              <SectionCard eyebrow="Profile Photo" title="A calm, recognizable identity">
                <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
                  <div className="overflow-hidden rounded-[28px] border border-[color:rgba(127,142,106,0.2)] bg-[linear-gradient(180deg,#ffffff_0%,#edf3ee_100%)] p-2 shadow-inner">
                    <img src={avatarUrl} alt="Current profile avatar" className="aspect-square w-full rounded-[22px] object-cover" />
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm leading-7 text-[var(--lumos-secondary)]">
                      Your profile picture appears across conversations, account surfaces, and admin views. Keep it clean, well-lit, and instantly recognizable.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:rgba(127,142,106,0.24)] bg-white px-4 py-3 text-sm font-medium text-[var(--lumos-dark)] transition-colors hover:border-[color:rgba(7,127,91,0.32)] hover:bg-[color:rgba(255,255,255,0.92)]">
                        <Upload className="h-4 w-4 text-[var(--lumos-primary)]" />
                        {avatarUploading ? tx("uploading") : tx("uploadNewPhoto")}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => void handleAvatarUpload(e.target.files?.[0] || null)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(AVATARS[0])}
                        className="inline-flex items-center rounded-full border border-[color:rgba(127,142,106,0.24)] bg-[color:rgba(255,255,255,0.72)] px-4 py-3 text-sm font-medium text-[var(--lumos-secondary)] transition-colors hover:bg-white"
                      >
                        Reset to default
                      </button>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:rgba(36,119,54,0.58)]">Quick picks</p>
                      <div className="mt-3 grid grid-cols-5 gap-3">
                        {AVATARS.map(avatar => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setAvatarUrl(avatar)}
                            className={`overflow-hidden rounded-[20px] border p-1 transition-all ${avatarUrl === avatar
                              ? "border-[color:rgba(7,127,91,0.36)] bg-white shadow-[0_12px_24px_rgba(7,127,91,0.12)]"
                              : "border-transparent hover:border-[color:rgba(127,142,106,0.24)] hover:bg-white/80"
                              }`}
                          >
                            <img src={avatar} alt="Avatar preset" className="aspect-square w-full rounded-[16px] object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div id="identity-section">
              <SectionCard eyebrow="Identity" title="Present yourself with clarity">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Display Name">
                    <input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full rounded-[20px] border border-[color:rgba(127,142,106,0.22)] bg-white/82 px-4 py-3 text-sm text-[var(--lumos-dark)] outline-none transition-colors placeholder:text-[color:rgba(36,119,54,0.34)] focus:border-[color:rgba(7,127,91,0.34)]"
                    />
                  </Field>
                  <Field label="Headline">
                    <input
                      value={tagline}
                      onChange={e => setTagline(e.target.value)}
                      placeholder="Short positioning statement"
                      className="w-full rounded-[20px] border border-[color:rgba(127,142,106,0.22)] bg-white/82 px-4 py-3 text-sm text-[var(--lumos-dark)] outline-none transition-colors placeholder:text-[color:rgba(36,119,54,0.34)] focus:border-[color:rgba(7,127,91,0.34)]"
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4">
                  <Field label="Bio">
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={5}
                      className="w-full resize-none rounded-[24px] border border-[color:rgba(127,142,106,0.22)] bg-white/82 px-4 py-3 text-sm leading-7 text-[var(--lumos-dark)] outline-none transition-colors placeholder:text-[color:rgba(36,119,54,0.34)] focus:border-[color:rgba(7,127,91,0.34)]"
                    />
                  </Field>
                  <Field label="Website">
                    <input
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      placeholder="https://your-site.com"
                      className="w-full rounded-[20px] border border-[color:rgba(127,142,106,0.22)] bg-white/82 px-4 py-3 text-sm text-[var(--lumos-dark)] outline-none transition-colors placeholder:text-[color:rgba(36,119,54,0.34)] focus:border-[color:rgba(7,127,91,0.34)]"
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { key: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4 text-[var(--lumos-primary)]" />, placeholder: "https://twitter.com/" },
                    { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4 text-[var(--lumos-primary)]" />, placeholder: "https://linkedin.com/in/" },
                    { key: "github", label: "GitHub", icon: <Github className="h-4 w-4 text-[var(--lumos-primary)]" />, placeholder: "https://github.com/" },
                  ].map(item => (
                    <Field key={item.key} label={item.label}>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{item.icon}</span>
                        <input
                          value={socials[item.key as keyof Socials]}
                          onChange={e => setSocials({ ...socials, [item.key]: e.target.value })}
                          placeholder={item.placeholder}
                          className="w-full rounded-[20px] border border-[color:rgba(127,142,106,0.22)] bg-white/82 py-3 pl-11 pr-4 text-sm text-[var(--lumos-dark)] outline-none transition-colors placeholder:text-[color:rgba(36,119,54,0.34)] focus:border-[color:rgba(7,127,91,0.34)]"
                        />
                      </div>
                    </Field>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="space-y-6">
            <SectionCard eyebrow="Visual System" title="Light, polished brand controls">
              <Field label="Timezone">
                <input
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full rounded-[20px] border border-[color:rgba(127,142,106,0.22)] bg-white/82 px-4 py-3 text-sm text-[var(--lumos-dark)] outline-none transition-colors focus:border-[color:rgba(7,127,91,0.34)]"
                />
              </Field>

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:rgba(36,119,54,0.65)]">Accent color</p>
                <div className="mt-3 flex items-center gap-4 rounded-[24px] border border-[color:rgba(127,142,106,0.18)] bg-white/72 p-4">
                  <input
                    type="color"
                    value={themeAccent}
                    onChange={e => setThemeAccent(e.target.value)}
                    className="h-14 w-14 cursor-pointer rounded-2xl border-0 bg-transparent p-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--lumos-dark)]">{themeAccent.toUpperCase()}</p>
                    <p className="mt-1 text-sm text-[var(--lumos-secondary)]">Primary accent used across your admin profile surfaces.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:rgba(36,119,54,0.65)]">Brand palette</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {brandColors.map((color, index) => (
                    <input
                      key={`${color}-${index}`}
                      type="color"
                      value={color}
                      onChange={e => {
                        const next = [...brandColors];
                        next[index] = e.target.value;
                        setBrandColors(next);
                      }}
                      className="h-11 w-11 cursor-pointer rounded-2xl border-0 bg-transparent p-0"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:rgba(36,119,54,0.65)]">Cover treatment</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {COVER_GRADIENTS.map(gradient => (
                    <button
                      key={gradient}
                      type="button"
                      onClick={() => setCoverGradient(gradient)}
                      className={`h-20 rounded-[22px] border transition-all ${coverGradient === gradient
                        ? "border-[color:rgba(7,127,91,0.32)] shadow-[0_16px_30px_rgba(7,127,91,0.12)]"
                        : "border-transparent hover:border-[color:rgba(127,142,106,0.2)]"
                        }`}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>
            </SectionCard>

            <div id="security-section">
              <SectionCard eyebrow="Security" title="Keep access intentional">
                <div className="space-y-3">
                  <ToggleRow
                    title="Two-factor authentication"
                    description="Require an additional verification step on admin sign-in."
                    checked={twoFactorEnabled}
                    onChange={setTwoFactorEnabled}
                  />
                  <ToggleRow
                    title="Session alerts"
                    description="Send a notice when your account is used from a new browser."
                    checked={sessionAlerts}
                    onChange={setSessionAlerts}
                  />
                </div>

                <div className="mt-4 rounded-[24px] border border-[color:rgba(127,142,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(241,246,242,0.78)_100%)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:rgba(36,119,54,0.62)]">Account handle</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--lumos-dark)]">{username}</p>
                  <p className="mt-2 text-sm text-[var(--lumos-secondary)]">Keep your recovery email and password current inside the auth management flow.</p>
                </div>
              </SectionCard>
            </div>

            <div id="notifications-section">
              <SectionCard eyebrow="Notifications" title="Only the signals that matter">
                <div className="space-y-3">
                  <ToggleRow
                    title="Comment notifications"
                    description="Receive updates when clients reply or mention you."
                    checked={commentNotifications}
                    onChange={setCommentNotifications}
                  />
                  <ToggleRow
                    title="Product news"
                    description="Stay informed about platform improvements and releases."
                    checked={productNews}
                    onChange={setProductNews}
                  />
                </div>
              </SectionCard>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[26px] bg-[var(--lumos-primary)] px-5 py-4 text-sm font-semibold text-white shadow-[0_24px_60px_rgba(7,127,91,0.2)] transition-all hover:bg-[#06694c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
              {saving ? tx("savingProfile") : tx("saveChanges")}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminProfile;
