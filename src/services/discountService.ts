import { supabase } from '@/lib/supabaseClient';

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_until: string | null;
  is_active: boolean;
}

export const validateDiscountCode = async (code: string): Promise<{ success: boolean; data?: DiscountCode; error?: string }> => {
  try {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'برجاء إدخال كود خصم' };
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, error: 'كود الخصم غير صحيح أو غير مفعل' };
    }

    // Check expiration if any
    if (data.valid_until) {
      const expirationDate = new Date(data.valid_until);
      const now = new Date();
      if (now > expirationDate) {
        return { success: false, error: 'لقد انتهت صلاحية هذا الكود' };
      }
    }

    // Check usage limits if any
    if (data.max_uses !== null && data.current_uses >= data.max_uses) {
      return { success: false, error: 'لقد تم الوصول للحد الأقصى لاستخدام هذا الكود' };
    }

    return { success: true, data: data as DiscountCode };
  } catch (err: unknown) {
    console.error('Error validating discount code:', err);
    return { success: false, error: 'حدث خطأ أثناء فحص الكود، يرجى المحاولة لاحقاً' };
  }
};
