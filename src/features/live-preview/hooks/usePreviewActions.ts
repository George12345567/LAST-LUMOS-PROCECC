import { useState } from "react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import type { MenuItem } from "@/types";

export const usePreviewActions = () => {
    const [isSubmittingCopyForm, setIsSubmittingCopyForm] = useState(false);
    const [copied, setCopied] = useState(false);

    // Handle adding new item
    const handleAddItem = (
        newItem: { name: string; description: string; price: string; image: string; category: string },
        serviceType: string,
        customItems: MenuItem[],
        setCustomItems: (items: MenuItem[]) => void,
        setNewItem: (item: any) => void,
        setShowAddItemForm: (show: boolean) => void
    ) => {
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
        setNewItem({ name: "", description: "", price: "", image: "", category: "" });
        setShowAddItemForm(false);
    };

    // Handle removing custom item
    const handleRemoveItem = (
        id: number,
        customItems: MenuItem[],
        setCustomItems: (items: MenuItem[]) => void
    ) => {
        setCustomItems(customItems.filter(item => item.id !== id));
    };

    // Duplicate Item
    const duplicateItem = (item: MenuItem, setCustomItems: (fn: (prev: MenuItem[]) => MenuItem[]) => void) => {
        const newItem: MenuItem = {
            ...item,
            id: Date.now(),
            name: `${item.name} (نسخة)`
        };
        setCustomItems(prev => [...prev, newItem]);
        toast.success("تم نسخ العنصر");
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
                } finally {
                    try {
                        if (textArea.parentNode) {
                            document.body.removeChild(textArea);
                        }
                    } catch (removeError) {
                        console.error("Failed to remove textArea:", removeError);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to copy link:", error);
            toast.error("فشل نسخ الرابط. الرابط: " + link);
        }
    };

    // Submit Copy Form
    const submitCopyForm = async (
        actionType: "copy" | "copyAndSend",
        copyFormData: { name: string; phone: string; description: string },
        displayName: string,
        serviceType: string,
        setCopyFormData: (data: any) => void,
        setShowCopyForm: (show: boolean) => void,
        setHasSubmittedOnce: (submitted: boolean) => void
    ) => {
        if (!copyFormData.name || !copyFormData.phone) {
            toast.error("الرجاء إدخال الاسم ورقم التليفون");
            return;
        }

        setIsSubmittingCopyForm(true);

        try {
            const link = `${window.location.origin}/demo?name=${encodeURIComponent(displayName)}&service=${serviceType}`;

            await emailjs.send(
                'service_qz9ng4q',
                'template_a1gpr19',
                {
                    form_type: 'Copy Preview Link',
                    user_name: copyFormData.name,
                    user_phone: copyFormData.phone,
                    user_description: copyFormData.description || 'لم يتم تقديم وصف',
                    preview_link: link,
                    business_name: displayName,
                    service_type: serviceType,
                    timestamp: new Date().toLocaleString('ar-EG'),
                    action_type: actionType === "copy" ? "نسخ فقط" : "نسخ وإرسال",
                },
                'QSbdI14b9C7c3rBmg'
            );

            console.log('✅ Copy link email sent successfully!');

            try {
                if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(link);
                } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = link;
                    textArea.style.position = "fixed";
                    textArea.style.opacity = "0";
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    if (textArea.parentNode) {
                        document.body.removeChild(textArea);
                    }
                }
            } catch (copyError) {
                console.error("Copy error:", copyError);
            }

            console.log('✅ Link copied and data sent successfully!');
            setCopyFormData({ name: "", phone: "", description: "" });
            setShowCopyForm(false);
            setHasSubmittedOnce(true);
        } catch (error) {
            console.error("❌ Error submitting copy form:", error);
            toast.error("حدث خطأ في إرسال البيانات");
        } finally {
            setIsSubmittingCopyForm(false);
        }
    };

    // Export data as JSON
    const exportData = (businessName: string, serviceType: string, selectedTheme: string, allMenuItems: MenuItem[]) => {
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
    const importData = (
        event: React.ChangeEvent<HTMLInputElement>,
        menuItems: MenuItem[],
        setBusinessName: (name: string) => void,
        setServiceType: (type: string) => void,
        setSelectedTheme: (theme: string) => void,
        setCustomItems: (items: MenuItem[]) => void
    ) => {
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

    // Download preview
    const downloadPreview = async () => {
        try {
            toast.success("ميزة التحميل قريباً! يمكنك استخدام زر Print Screen لحفظ المعاينة.");
        } catch (error) {
            toast.error("حدث خطأ أثناء التحميل");
        }
    };

    return {
        handleAddItem,
        handleRemoveItem,
        duplicateItem,
        copyShareLink,
        submitCopyForm,
        exportData,
        importData,
        downloadPreview,
        isSubmittingCopyForm,
        copied,
    };
};
