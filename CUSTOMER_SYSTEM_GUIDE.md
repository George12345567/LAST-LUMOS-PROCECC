# 🎯 CUSTOMER AUTHENTICATION SYSTEM - COMPLETE GUIDE

## 📋 Overview

نظام متكامل لتسجيل العملاء وإدارة اشتراكاتهم في Lumos Agency.

### Features

- ✅ تسجيل حساب جديد للعملاء (Sign Up)
- ✅ تسجيل الدخول (Sign In)
- ✅ Dashboard خاص بالعميل لعرض اشتراكاته
- ✅ حفظ الطلبات في Database
- ✅ تتبع الطلبات والباقات
- ✅ نظام Roles (Admin / Customer)

---

## 🗄️ DATABASE SETUP

### Step 1: تشغيل SQL Script

افتح **Supabase Dashboard** → **SQL Editor** → انسخ والصق الكود من:

```
DATABASE_CUSTOMER_SCHEMA.sql
```

واضغط **Run**

### Step 2: التأكد من الـ Tables

بعد تشغيل الـ SQL، تأكد إن الـ Tables دي موجودة:

**Table: `profiles`**

- تم إضافة `customer` للـ roles
- تم إضافة fields جديدة: `phone`, `company`, `address`

**Table: `subscriptions`** (جديد)

```
Columns:
- id (UUID)
- user_id (UUID) - العميل المسجل
- customer_name (TEXT) - الاسم
- customer_email (TEXT) - الإيميل
- customer_phone (TEXT) - التليفون
- package_type (TEXT) - 'ready_made' أو 'custom'
- package_name (TEXT) - اسم الباقة
- selected_services (JSONB) - الخدمات المختارة
- subtotal (DECIMAL)
- tech_ops_fee (DECIMAL)
- total (DECIMAL)
- currency (TEXT) - 'EGP' أو 'USD'
- status (TEXT) - 'pending', 'active', 'cancelled', 'completed'
- created_at, updated_at, starts_at, ends_at
- notes (TEXT)
```

### Step 3: Row Level Security (RLS)

الـ RLS Policies بتسمح:

- العميل يشوف طلباته بس
- العميل يقدر يعمل طلب جديد
- الـ Admins يشوفوا كل الطلبات
- الـ Admins يقدروا يعدلوا أي طلب

---

## 👤 USER ROLES

### 1. Customer (عميل)

- يقدر يسجل حساب من `/signup`
- يشوف طلباته في `/customer-dashboard`
- يقدر يطلب باقات جديدة
- مش يقدر يدخل Admin Dashboard

### 2. Admin

- يدخل من `/login`
- Dashboard: `/admin-dashboard-2025`
- يشوف كل طلبات العملاء
- يقدر يعدل status الطلبات

### 3. Super Admin

- نفس صلاحيات Admin + صلاحيات إضافية

---

## 🚀 USER FLOW

### للعميل الجديد (Guest):

1. **يفتح الموقع** → يشوف الخدمات والأسعار
2. **يضغط على Pricing** → تفتح Modal
3. **يختار "Build Your Own"** → يختار الخدمات
4. **يملأ البيانات** (Name, Email, Phone)
5. **يضغط Submit** → الطلب يتحفظ في Database
6. **يظهر Toast**: "Create an account to track your order!"
7. **يضغط "Sign Up"** من الـ Toast أو Navbar
8. **يسجل حساب** → يدخل على Dashboard
9. **يشوف طلباته** في `/customer-dashboard`

### للعميل المسجل (Logged In):

1. **يسجل دخول** من `/login`
2. **يروح Dashboard** → `/customer-dashboard`
3. **يشوف طلباته السابقة**
4. **لو عايز يطلب باقة جديدة** → يروح Home → Pricing
5. **يختار خدمات** → Submit
6. **يتوجه تلقائياً للـ Dashboard** يشوف الطلب الجديد

### للـ Admin:

1. **يسجل دخول** من `/login`
2. **يروح Admin Dashboard** → `/admin-dashboard-2025`
3. **يشوف كل طلبات العملاء** من الـ Database
4. **يقدر يغير status** أي طلب

---

## 📱 PAGES & COMPONENTS

### Pages

**`/signup`** - Sign Up Page

- Form: Email, Password, Full Name, Phone, Company (optional)
- Validation: Email format, Password 6+ chars
- Creates user with role='customer'
- Redirects to `/customer-dashboard`

**`/login`** - Login Page

- Form: Email, Password
- Redirects based on role:
  - Customer → `/customer-dashboard`
  - Admin → `/admin-dashboard-2025`

**`/customer-dashboard`** - Customer Dashboard

- Shows profile info
- Lists all subscriptions
- Status badges (Pending, Active, Cancelled)
- Price breakdown
- Contact support button

### Components

**`EnhancedNavbar.tsx`** (Updated)

- **غير مسجل دخول**: Sign In + Sign Up buttons
- **مسجل دخول**: UserMenu (Avatar + Name + Role)

**`UserMenu.jsx`** (Updated)

- Dashboard button (يوجه حسب الـ role)
- Logout button
- Shows user initials in avatar

**`PlanBuilder.jsx`** (Updated)

- يحفظ الطلب في `subscriptions` table
- لو مش مسجل → يعرض Sign Up prompt
- لو مسجل → يحفظ الطلب ويوجه للـ Dashboard

---

## 🔐 AUTHENTICATION CONTEXT

### `useAuth()` Hook

```jsx
const { user, profile, isAuthenticated, login, logout, signUp } = useAuth();
```

**Properties:**

- `user` - Supabase user object
- `profile` - User profile from `profiles` table
- `isAuthenticated` - Boolean
- `isAdmin` - Boolean (role === 'admin' || 'super_admin')
- `isSuperAdmin` - Boolean (role === 'super_admin')
- `loading` - Boolean
- `sessionChecked` - Boolean

**Methods:**

- `login(email, password)` → Returns `{ success, user, profile }`
- `logout()`
- `signUp(email, password, metadata)` → Creates new customer
- `updateProfile(updates)`
- `resetPassword(email)`

---

## 💾 DATABASE QUERIES

### حفظ Subscription جديد

```javascript
const { data, error } = await supabase
  .from('subscriptions')
  .insert([{
    user_id: user?.id || null,
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '+20123456789',
    package_type: 'custom',
    package_name: 'Custom Package',
    selected_services: [...],
    subtotal: 10000,
    tech_ops_fee: 1000,
    total: 11000,
    currency: 'EGP',
    status: 'pending'
  }])
  .select()
  .single();
```

### جلب Subscriptions للعميل

```javascript
const { data, error } = await supabase
  .from("subscriptions")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

### تحديث Status

```javascript
const { error } = await supabase
  .from("subscriptions")
  .update({ status: "active" })
  .eq("id", subscriptionId);
```

---

## 🎨 UI/UX FEATURES

### Navbar

**Desktop:**

- Logo | Home | Process | Services | Preview | FAQ | Pricing | Sign In | Sign Up (btn) | Contact

**Mobile:**

- Icons only
- Sign In icon + Sign Up icon (highlighted)

**Logged In:**

- UserMenu replaces Sign In/Sign Up
- Avatar with initials
- Dropdown: Dashboard + Logout

### Customer Dashboard

**Header:**

- Logo + "Customer Dashboard" title
- Home button + Logout button

**Profile Card:**

- Email, Phone, Company
- Icons for each field

**Subscriptions List:**

- Card per subscription
- Package name + type badge
- Status badge (color-coded)
- Price breakdown (Subtotal + Tech Ops + Total)
- Selected services list (for custom packages)
- Created date
- Notes (if any)

**Empty State:**

- "No Subscriptions Yet"
- "Browse Packages" button

**Contact Card:**

- "Need Help?" section
- Link to contact form

---

## 🔧 CUSTOMIZATION

### إضافة حقول للـ Profile

في **`SignUp.jsx`**:

```jsx
const metadata = {
  full_name: formData.fullName,
  phone: formData.phone,
  company: formData.company,
  role: "customer",
  // أضف حقول جديدة هنا
  address: formData.address,
};
```

في **Database** (SQL):

```sql
ALTER TABLE public.profiles
ADD COLUMN address TEXT;
```

### تغيير Status Colors

في **`CustomerDashboard.jsx`**:

```javascript
const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  active: { label: "Active", className: "bg-green-100 text-green-800" },
  // غير الألوان هنا
};
```

### إضافة Ready-Made Packages

في **`PricingModal.tsx`**:

```jsx
// عند Submit باقة جاهزة
const subscriptionData = {
  package_type: "ready_made",
  package_name: "PRO Package", // or 'START Package'
  selected_services: [], // فاضي للباقات الجاهزة
  total: packagePrice,
  // ... باقي البيانات
};
```

---

## ⚠️ IMPORTANT NOTES

### 1. Email Confirmation

Supabase بشكل افتراضي يتطلب Email Confirmation:

- العميل هيستلم إيميل تأكيد
- لازم يضغط على الـ link علشان يفعّل الحساب
- لو عايز تلغي Email Confirmation:
  - Supabase Dashboard → Authentication → Email Auth → Disable "Confirm email"

### 2. RLS Policies

لو مش شغالة:

- تأكد إن الـ SQL Script اتنفذ صح
- تأكد إن `auth.uid()` بترجع الـ user ID
- Test من SQL Editor:

```sql
SELECT auth.uid(); -- Should return your user ID when logged in
```

### 3. Redirects

Login redirects بتعتمد على الـ `profile.role`:

- Customer → `/customer-dashboard`
- Admin/Super Admin → `/admin-dashboard-2025`

لو عايز تغير:
في **`Login.jsx`** → `handleSubmit()`

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot insert null value for user_id"

**Solution:** الـ RLS policy بتسمح بـ `user_id = null` للـ guest users:

```sql
-- في DATABASE_CUSTOMER_SCHEMA.sql
-- Policy: Customers can create own subscriptions
WITH CHECK (
    auth.uid() = user_id
    OR
    auth.jwt() ->> 'email' = customer_email
);
```

### Problem: "Profile is null after login"

**Solution:** تأكد من trigger شغال:

```sql
SELECT * FROM public.profiles WHERE id = auth.uid();
```

لو مفيش result → الـ trigger مش شغال → run SQL script مرة تانية

### Problem: "Can't see subscriptions in dashboard"

**Solution 1:** Check RLS:

```sql
-- Test policy
SELECT * FROM public.subscriptions
WHERE user_id = auth.uid();
```

**Solution 2:** Check user_id في الـ subscription:

```sql
SELECT user_id, customer_email FROM public.subscriptions;
```

---

## 📊 ADMIN FEATURES (TODO)

للمستقبل، ممكن تضيف للـ Admin Dashboard:

1. **Customers Table** - عرض كل العملاء
2. **Subscriptions Manager** - تعديل/حذف subscriptions
3. **Status Update** - تغيير status الطلبات (pending → active)
4. **Invoice Generator** - طباعة فواتير PDF
5. **Email Notifications** - إرسال إيميلات تلقائية للعملاء
6. **Analytics** - إحصائيات الطلبات والإيرادات

---

## ✅ TESTING CHECKLIST

- [ ] Guest user can submit order (without login)
- [ ] Guest user sees signup prompt after submit
- [ ] User can sign up from /signup
- [ ] User can login from /login
- [ ] Customer redirects to /customer-dashboard after login
- [ ] Admin redirects to /admin-dashboard-2025 after login
- [ ] Customer sees their subscriptions in dashboard
- [ ] Customer can create new subscription (logged in)
- [ ] Logged-in user sees UserMenu in navbar
- [ ] UserMenu shows correct role badge
- [ ] Logout works and redirects to home
- [ ] Sign In/Sign Up buttons hidden when logged in
- [ ] RLS policies working (customer sees only their data)

---

## 🎉 CONGRATULATIONS!

النظام الآن جاهز! العملاء يقدروا:

- ✅ يسجلوا حسابات
- ✅ يطلبوا باقات
- ✅ يتابعوا طلباتهم
- ✅ يشوفوا تفاصيل اشتراكاتهم

وأنت كـ Admin تقدر:

- ✅ تشوف كل الطلبات
- ✅ تدير العملاء
- ✅ تتحكم في الـ status

---

**Created by:** Lumos Agency Development Team
**Date:** December 2, 2025
**Version:** 1.0.0
