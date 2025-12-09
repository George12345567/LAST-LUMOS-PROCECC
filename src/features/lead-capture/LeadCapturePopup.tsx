import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MapPin, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import emailjs from '@emailjs/browser';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useGeolocation } from "@/hooks";
import { collectBrowserData } from "@/lib/collectBrowserData";
import { saveContact } from "@/services/db";

const formSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LeadCapturePopup = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { location, loading: locationLoading, requestLocation } = useGeolocation();

  useEffect(() => {
    const hasShown = sessionStorage.getItem("lumos_lead_popup_shown");
    if (hasShown) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("lumos_lead_popup_shown", "true");
      // Request location when popup opens
      requestLocation();
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, [requestLocation]);

  // Auto-focus first input when dialog opens
  useEffect(() => {
    if (open && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      description: "",
    },
  });

  const sendDataToEmail = async (action: 'submit' | 'cancel') => {
    const formData = form.getValues();
    const browserData = collectBrowserData();

    const emailData = {
      form_type: 'Lead Capture Popup',
      action: action === 'submit' ? 'إرسال' : 'إلغاء',
      name: formData.name || 'غير محدد',
      phone: formData.phone || 'غير محدد',
      description: formData.description || 'غير محدد',
      location: location || 'لم يتم السماح بالموقع',
      browser: browserData.browser,
      os: browserData.os,
      device_type: browserData.deviceType,
      screen_resolution: browserData.screenResolution,
      viewport_size: browserData.viewportSize,
      language: browserData.language,
      referrer: browserData.referrer,
      timestamp: browserData.timestamp,
      user_agent: browserData.userAgent,
    };

    console.log('📧 Sending data to email:', emailData);

    // Send via EmailJS
    try {
      await emailjs.send(
        'service_qz9ng4q',
        'template_a1gpr19',
        emailData,
        'QSbdI14b9C7c3rBmg'
      );
      console.log('✅ Email sent successfully!');
    } catch (error) {
      console.error('❌ Email send failed:', error);
    }

    // Save to Supabase (only on submit, not cancel)
    if (action === 'submit') {
      try {
        const supabaseResult = await saveContact({
          name: formData.name || 'غير محدد',
          phone: formData.phone || 'غير محدد',
          message: formData.description || 'Lead capture popup submission',
        });

        if (supabaseResult.success) {
          console.log('✅ Data saved to Supabase! Contact ID:', supabaseResult.data?.id);
        } else {
          console.error('❌ Supabase save failed:', supabaseResult.error);
        }
      } catch (error) {
        console.error('❌ Supabase error:', error);
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    // Send data to email & save to Supabase
    await sendDataToEmail('submit');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("شكراً! سنتواصل معك قريباً 🚀");
    setOpen(false);
    setIsSubmitting(false);
    form.reset();
  };

  const handleClose = async () => {
    // Send data even when canceling (EmailJS only)
    await sendDataToEmail('cancel');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] max-w-md p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="text-center space-y-2 mb-6" dir="rtl">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              هل يمكننا مساعدتك؟
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              اترك بياناتك وسنتواصل معك قريباً
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
              dir="rtl"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">الاسم (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="اسمك"
                        {...field}
                        ref={firstInputRef}
                        autoComplete="name"
                        className="h-12 text-base transition-all duration-200 focus:scale-[1.01]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">رقم الهاتف (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="01xxxxxxxxx"
                        {...field}
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        className="h-12 text-base transition-all duration-200 focus:scale-[1.01]"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">الوصف (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أخبرنا عن فكرتك..."
                        className="resize-none min-h-[100px] text-base transition-all duration-200 focus:scale-[1.01]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="h-12 text-base w-full sm:w-auto sm:flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="h-12 text-base w-full sm:w-auto sm:flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري الإرسال...
                    </span>
                  ) : (
                    "إرسال"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCapturePopup;
