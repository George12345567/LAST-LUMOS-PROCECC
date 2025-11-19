import { useState, FormEvent } from "react";
import { toast } from "sonner";

// Declare emailjs as a global variable
declare const emailjs: {
  init: (publicKey: string) => void;
  send: (serviceId: string, templateId: string, templateParams: Record<string, unknown>) => Promise<{ status: number; text: string }>;
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    restaurantName: "",
    serviceType: "",
    details: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!formData.phone) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Initialize EmailJS with your public key
      // REPLACE 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
      emailjs.init('YOUR_PUBLIC_KEY');

      // Send email using EmailJS
      // REPLACE 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        {
          from_name: formData.name,
          phone: formData.phone,
          restaurant_name: formData.restaurantName,
          service_type: formData.serviceType,
          message: formData.details,
        }
      );

      // Success message
      toast.success("Your request has been received successfully! We'll contact you soon.", {
        duration: 5000,
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        restaurantName: "",
        serviceType: "",
        details: "",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An error occurred while sending your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
          Ready to <span className="glow-text">Elevate Your Business?</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Fill out the form and we'll get in touch with you shortly
        </p>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-6">
          {/* Name */}
          <div>
            <label className="block text-foreground mb-2 font-semibold">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-foreground mb-2 font-semibold">
              Phone Number <span className="text-primary">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
              placeholder="01XXXXXXXXX"
              required
            />
          </div>

          {/* Restaurant Name */}
          <div>
            <label className="block text-foreground mb-2 font-semibold">Restaurant Name</label>
            <input
              type="text"
              value={formData.restaurantName}
              onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
              placeholder="Enter your restaurant name"
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-foreground mb-2 font-semibold">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
              required
            >
              <option value="">Select Service</option>
              <option value="website">Web & Smart Menu</option>
              <option value="media">Media Production</option>
              <option value="social">Social Media Management</option>
              <option value="package">Full Package</option>
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="block text-foreground mb-2 font-semibold">Additional Details</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground min-h-[120px]"
              placeholder="Tell us more about your project..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-glow py-4 rounded-lg text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
