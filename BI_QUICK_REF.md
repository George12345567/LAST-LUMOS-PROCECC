# 🚀 BI ANALYTICS - QUICK REFERENCE

## 📦 New Data Structure

```javascript
const userData = await collectUserData();

// Access different data categories:
userData.tech; // Device & Browser specs
userData.marketing; // UTM & Traffic source
userData.location_ip; // IP-based geolocation
userData.location_gps; // GPS coordinates
userData.behavior; // Engagement metrics
```

---

## 🎯 Key Features

### **1. Marketing Attribution**

```javascript
userData.marketing = {
  source: "facebook", // utm_source or detected
  medium: "cpc", // utm_medium or detected
  campaign: "summer_sale", // utm_campaign
  term: "web_design", // utm_term
  content: null, // utm_content
  attribution_type: "utm_tracked", // or "organic", "social", "direct"
};
```

### **2. IP Geolocation** (No Permission Needed)

```javascript
userData.location_ip = {
  ip: "156.xxx.xxx.xxx",
  city: "Cairo",
  country: "Egypt",
  isp: "TE Data",
  latitude: 30.0444,
  longitude: 31.2357,
};
```

### **3. Engagement Metrics**

```javascript
userData.behavior = {
  time_on_site_sec: 45, // Seconds on page
  visit_count: 3, // Total visits
  is_returning_visitor: true, // Returning user?
  first_visit_date: "2025-11-15", // First visit
  days_since_first_visit: 15, // Days since first
};
```

### **4. Technical Data**

```javascript
userData.tech = {
  device_type: "Mobile", // Mobile/Tablet/Desktop
  os: "iOS",
  browser: "Safari",
  screen_width: 390,
  network_type: "4g",
  language: "ar-EG",
};
```

---

## 🧪 Quick Test

### **Test UTM Tracking:**

```
http://localhost:8080/?utm_source=instagram&utm_campaign=test
```

Submit form → Check `marketing.source` = "instagram"

### **Test Visit Count:**

1. Submit form → `visit_count: 1`
2. Refresh → Submit → `visit_count: 2`
3. Clear localStorage → Reset

### **Test IP Location:**

Submit form → Check console for IP API response

---

## 📊 Database Queries

### **Top Marketing Sources:**

```sql
SELECT
  auto_collected_data->'marketing'->>'source' as source,
  COUNT(*) as count
FROM orders
GROUP BY source
ORDER BY count DESC;
```

### **Geographic Distribution:**

```sql
SELECT
  auto_collected_data->'location_ip'->>'country' as country,
  COUNT(*) as leads
FROM contacts
GROUP BY country;
```

### **Returning Visitors:**

```sql
SELECT
  COUNT(*) FILTER (WHERE (auto_collected_data->'behavior'->>'is_returning_visitor')::boolean = true) as returning,
  COUNT(*) FILTER (WHERE (auto_collected_data->'behavior'->>'is_returning_visitor')::boolean = false) as new
FROM contacts;
```

---

## 🔧 Usage in Components

**Old way (still works):**

```javascript
const data = await getTechData();
```

**New way (recommended):**

```javascript
import { collectUserData } from "@/utils/analytics";

const userData = await collectUserData();
console.log("Marketing:", userData.marketing);
console.log("Location:", userData.location_ip.city);
console.log("Visit #", userData.behavior.visit_count);
```

---

## ⚡ Performance

- **Parallel API calls** (IP + GPS at same time)
- **5-second timeout** on GPS
- **Graceful fallback** if APIs fail
- **Zero blocking** on form submission

---

## 🔒 Privacy

- ✅ IP geolocation uses **public data only**
- ✅ No cookies set
- ✅ localStorage only for visit tracking
- ✅ GPS requires user permission
- ✅ Works even if APIs are blocked

---

## 📁 Modified Files

```
✅ src/utils/analytics.js    - Main BI engine
✅ src/services/db.js        - Updated to use new data
```

---

## ✨ **READY TO USE!**

All existing forms now automatically collect Business Intelligence data.  
No component changes needed - it just works! 🎉
