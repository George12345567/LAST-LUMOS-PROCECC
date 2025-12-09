# 🚀 إعداد قاعدة بيانات Supabase

## 📊 الجداول المطلوبة

### 1️⃣ جدول الطلبات (orders) 📦

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  plan_details JSONB NOT NULL,
  auto_collected_data JSONB,
  location_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**محتوى plan_details:**

```json
{
  "package_id": "START",
  "package_name": "باقة ستارت",
  "package_name_en": "START",
  "price": 3900,
  "features": [...],
  "highlight": "مثالية للمشاريع الصغيرة"
}
```

أو للخطط المخصصة:

```json
{
  "type": "custom",
  "services": [
    {"id": "web_landing", "name": "موقع Landing Page", "price": 5000, "category": "WEB"},
    ...
  ],
  "subtotal": 15000,
  "tech_ops_fee": 1500,
  "total": 16500
}
```

---

### 2️⃣ جدول التواصل (contacts) 📩

```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  auto_collected_data JSONB,
  location_url TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
```

---

### 3️⃣ جدول بيانات التسويق (marketing_data) 📊

```sql
CREATE TABLE marketing_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  device_type TEXT,
  screen_width INTEGER,
  full_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_marketing_contact ON marketing_data(contact_id);
CREATE INDEX idx_marketing_order ON marketing_data(order_id);
```

**محتوى full_data:**

```json
{
  "browser": "Chrome",
  "os": "Windows",
  "language": "ar-EG",
  "deviceType": "Desktop",
  "screenWidth": 1920,
  "screenHeight": 1080,
  "timezone": "Africa/Cairo",
  "referrer": "https://google.com",
  "timestamp": "2025-11-30T10:30:00.000Z"
}
```

---

### 4️⃣ جدول سجل الأنشطة (activity_log) 📝

```sql
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);
```

**activity_type أمثلة:**

- `form_submission`
- `plan_viewed`
- `package_selected`
- `contact_form_submitted`

---

### 5️⃣ جدول الخلاصة (dashboard_overview) 👁️

هذا **View** وليس جدول حقيقي:

```sql
CREATE OR REPLACE VIEW dashboard_overview AS
SELECT
  o.id,
  o.client_name AS العميل,
  o.phone AS الهاتف,
  'طلب باقة' AS النوع,
  o.total_price AS السعر,
  o.status AS الحالة,
  o.created_at AS التاريخ,
  o.plan_details,
  o.location_url
FROM orders o

UNION ALL

SELECT
  c.id,
  c.name AS العميل,
  c.phone AS الهاتف,
  'رسالة تواصل' AS النوع,
  NULL AS السعر,
  c.status AS الحالة,
  c.created_at AS التاريخ,
  NULL AS plan_details,
  c.location_url
FROM contacts c

ORDER BY التاريخ DESC;
```

---

## 🔐 إعدادات الأمان (Row Level Security)

### لتعطيل RLS للتطوير (مؤقتاً):

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
```

### لتفعيل RLS للإنتاج:

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert on orders" ON orders
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert on contacts" ON contacts
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert on marketing_data" ON marketing_data
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow public insert on activity_log" ON activity_log
  FOR INSERT TO public
  WITH CHECK (true);
```

---

## ⚡ تنفيذ سريع

انسخ والصق هذا الكود في **SQL Editor** في Supabase:

```sql
-- Create all tables
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  plan_details JSONB NOT NULL,
  auto_collected_data JSONB,
  location_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  auto_collected_data JSONB,
  location_url TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marketing_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  device_type TEXT,
  screen_width INTEGER,
  full_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_marketing_contact ON marketing_data(contact_id);
CREATE INDEX idx_marketing_order ON marketing_data(order_id);
CREATE INDEX idx_activity_type ON activity_log(activity_type);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);

-- Create dashboard view
CREATE OR REPLACE VIEW dashboard_overview AS
SELECT
  o.id,
  o.client_name AS "العميل",
  o.phone AS "الهاتف",
  'طلب باقة' AS "النوع",
  o.total_price AS "السعر",
  o.status AS "الحالة",
  o.created_at AS "التاريخ",
  o.plan_details,
  o.location_url
FROM orders o
UNION ALL
SELECT
  c.id,
  c.name AS "العميل",
  c.phone AS "الهاتف",
  'رسالة تواصل' AS "النوع",
  NULL AS "السعر",
  c.status AS "الحالة",
  c.created_at AS "التاريخ",
  NULL AS plan_details,
  c.location_url
FROM contacts c
ORDER BY "التاريخ" DESC;

-- Disable RLS for development
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
```

---

## ✅ التحقق من النجاح

بعد تنفيذ الأكواد، تحقق من:

1. ✅ وجود 4 جداول في **Table Editor**
2. ✅ وجود **View** واحد (dashboard_overview)
3. ✅ جرب إرسال طلب من الموقع
4. ✅ تحقق من البيانات في جدول `orders`

---

## 🎯 الخطوات التالية

1. افتح Supabase Dashboard: https://hkiczkmdxldshooaelio.supabase.co
2. اذهب إلى **SQL Editor**
3. انسخ الكود من قسم "تنفيذ سريع"
4. اضغط **Run**
5. ارجع للموقع وجرب الباقات! 🚀

---

## 📞 الدعم

إذا واجهت أي مشكلة، تحقق من:

- Console في المتصفح (F12)
- Logs في Supabase Dashboard
- تأكد من صحة API Keys

تم التحديث: 30 نوفمبر 2025
