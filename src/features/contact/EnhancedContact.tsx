import { useState, FormEvent, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { MapPin, CheckCircle } from "lucide-react";
import { useGeolocation } from "@/hooks";
import { collectBrowserData } from "@/lib/collectBrowserData";
import { saveContact } from "@/services/db";

const EnhancedContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    industry: "",
    serviceNeeded: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { location, loading: locationLoading, requestLocation } = useGeolocation();

  useEffect(() => {
    // Request location when component mounts
    requestLocation();
  }, [requestLocation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (!formData.phone) {
      toast.error("الرجاء إدخال رقم الهاتف");
      return;
    }

    setIsSubmitting(true);

    try {
      const browserData = collectBrowserData();


      const emailData = {
        // Form Type
        form_type: 'Contact Form',

        // User Inputs
        from_name: formData.name,
        phone: formData.phone,
        business_name: formData.businessName,
        industry: formData.industry,
        service_needed: formData.serviceNeeded,
        message: formData.message,

        // Location Data
        location: location || 'لم يتم السماح بالموقع',
        location_url: location || 'غير متاح', // Google Maps Link

        // Browser & Device Info
        browser: browserData.browser,
        os: browserData.os,
        device_type: browserData.deviceType,
        screen_resolution: browserData.screenResolution,
        viewport_size: browserData.viewportSize,
        language: browserData.language,
        referrer: browserData.referrer,
        timestamp: browserData.timestamp,
        user_agent: browserData.userAgent,

        // Additional Technical Data
        timezone: browserData.timezone || 'Unknown',
        platform: browserData.platform || 'Unknown',
        cookies_enabled: browserData.cookiesEnabled ? 'Yes' : 'No',
        do_not_track: browserData.doNotTrack || 'Unspecified',
        network_type: browserData.networkStatus?.effectiveType || 'Unknown',
        network_downlink: browserData.networkStatus?.downlink || 'Unknown',
        network_rtt: browserData.networkStatus?.rtt || 'Unknown',
      };


      console.log('📧 Sending contact form data:', emailData);

      await emailjs.send(
        'service_qz9ng4q',
        'template_a1gpr19',
        emailData,
        'QSbdI14b9C7c3rBmg'
      );

      console.log('✅ Email sent successfully!');

      // Save to Supabase with new service
      let supabaseSuccess = false;
      try {
        const supabaseResult = await saveContact({
          name: formData.name,
          phone: formData.phone,
          message: `${formData.message}\n\nBusiness: ${formData.businessName}\nIndustry: ${formData.industry}\nService Needed: ${formData.serviceNeeded}`,
        });

        if (supabaseResult.success) {
          console.log('✅ Data saved to Supabase! Contact ID:', supabaseResult.data?.id);
          supabaseSuccess = true;
        } else {
          console.error('❌ Supabase save failed:', supabaseResult.error);
        }
      } catch (supaError) {
        console.error('❌ Supabase error:', supaError);
      }

      // Show success message regardless of Supabase status (EmailJS succeeded)
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً 🎉', { duration: 5000 });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        businessName: "",
        industry: "",
        serviceNeeded: "",
        message: "",
      });
    } catch (error) {
      console.error("❌ Error sending email:", error);
      const errorMessage =
        typeof error === "object" && error !== null && "text" in error
          ? (error as { text?: string }).text
          : (error as Error | undefined)?.message ?? "الرجاء المحاولة مرة أخرى";
      toast.error(`حدث خطأ: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-foreground">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4 text-white reveal px-2">
          Let's Build Something <span className="text-primary">Great</span>
        </h2>
        <p className="text-center text-white/80 mb-8 sm:mb-10 lg:mb-12 text-sm sm:text-base lg:text-lg reveal px-2">
          Fill out the form and we'll get in touch with you shortly
        </p>

        <form
          onSubmit={handleSubmit}
          className="glass-card p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl space-y-4 sm:space-y-5 lg:space-y-6 reveal bg-white glow-ring"
        >
          {/* Name */}
          <div>
            <label className="block text-foreground mb-1.5 sm:mb-2 font-semibold text-sm sm:text-base">
              Your Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              autoComplete="name"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground text-sm sm:text-base"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-foreground mb-1.5 sm:mb-2 font-semibold text-sm sm:text-base">
              Phone Number <span className="text-primary">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              autoComplete="tel"
              inputMode="tel"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground text-sm sm:text-base"
              placeholder="+20 XXX XXX XXXX"
              required
            />
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-foreground mb-1.5 sm:mb-2 font-semibold text-sm sm:text-base">
              Company / Business Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground text-sm sm:text-base"
              placeholder="Your Business Name"
              required
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-foreground mb-1.5 sm:mb-2 font-semibold text-sm sm:text-base">
              Industry <span className="text-primary">*</span>
            </label>
            <select
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground text-sm sm:text-base appearance-none cursor-pointer"
              required
            >
              <option value="" disabled>Select Industry</option>
              <option value="restaurant">Restaurant / Cafe</option>
              <option value="retail">Retail / E-commerce</option>
              <option value="factory">Factory / Industrial</option>
              <option value="realestate">Real Estate</option>
              <option value="healthcare">Healthcare / Clinic</option>
              <option value="education">Education</option>
              <option value="salon">Salon / Beauty</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Service Needed */}
          <div>
            <label className="block text-foreground mb-1.5 sm:mb-2 font-semibold text-sm sm:text-base">
              Service Needed <span className="text-primary">*</span>
            </label>
            <select
              value={formData.serviceNeeded}
              onChange={(e) =>
                setFormData({ ...formData, serviceNeeded: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground text-sm sm:text-base appearance-none cursor-pointer"
              required
            >
              <option value="" disabled>Select Service</option>
              <option value="web">Web Development</option>
              <option value="media">Media Production</option>
              <option value="social">Social Media Management</option>
              <option value="package">Full Package (All Services)</option>
              <option value="consultation">Consultation Only</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-foreground mb-1.5 sm:mb-2 font-semibold text-sm sm:text-base">
              Message / Details
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground min-h-[100px] sm:min-h-[120px] text-sm sm:text-base resize-none"
              placeholder="Tell us about your project..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-white py-3 sm:py-4 rounded-lg text-sm sm:text-base lg:text-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-lift relative overflow-hidden"
          >
            <span className="relative z-10">{isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}</span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent shimmer-line opacity-60" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default EnhancedContact;
