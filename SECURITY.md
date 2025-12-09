/\*\*

- Security Best Practices Documentation
- Important security notes for the Lumos project
  \*/

# 🔐 Security Best Practices

## ⚠️ CRITICAL SECURITY ISSUES

### 1. Service Role Key Exposure

**PROBLEM:**
The `supabaseAdmin` client with Service Role Key is currently imported in `Dashboard.tsx` (frontend).
This is a **CRITICAL SECURITY VULNERABILITY**.

**Why it's dangerous:**

- Service Role Key bypasses Row Level Security (RLS)
- Anyone can inspect frontend code and steal the key
- Attacker can access/modify/delete ANY data in your database
- Can create admin accounts
- Can read sensitive customer data

**CURRENT CODE (❌ WRONG):**

```typescript
// src/pages/Dashboard.tsx
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// This runs in the browser - ANYONE can see this!
const { data } = await supabaseAdmin.from("orders").select("*");
```

**CORRECT SOLUTION:**

#### Option 1: Supabase Edge Functions (Recommended)

```typescript
// supabase/functions/admin-get-orders/index.ts
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
  // Verify user is admin
  const authHeader = req.headers.get("Authorization")!;
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Verify admin role
  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }

  // NOW use Service Role Key (safely on server)
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return new Response(JSON.stringify({ orders }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

```typescript
// src/pages/Dashboard.tsx (Frontend)
import { supabase } from "@/lib/supabaseClient"; // Only Anon Key

const fetchOrders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Call Edge Function
  const response = await fetch(
    `https://YOUR_PROJECT.supabase.co/functions/v1/admin-get-orders`,
    {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    }
  );

  const { orders } = await response.json();
  return orders;
};
```

#### Option 2: Use RLS Policies (Best for most cases)

```sql
-- Instead of using Service Role, create proper RLS policies

-- Policy: Admins can see all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can update orders
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: Admins can delete orders
CREATE POLICY "Admins can delete orders"
ON orders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);
```

```typescript
// src/pages/Dashboard.tsx (Frontend)
import { supabase } from "@/lib/supabaseClient"; // Only Anon Key

// Now this works safely with RLS
const { data: orders } = await supabase
  .from("orders")
  .select("*")
  .order("created_at", { ascending: false });
```

---

### 2. Rate Limiting

**PROBLEM:**
No rate limiting on login/signup endpoints.

**SOLUTION:**

```typescript
// Use Supabase Auth Rate Limiting (built-in)
// Or add custom middleware:

import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// In your API route:
app.post("/api/login", loginLimiter, async (req, res) => {
  // Login logic
});
```

---

### 3. Email Verification

**PROBLEM:**
Users can access system without verifying email.

**SOLUTION:**

```typescript
// src/context/AuthContext.jsx
const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/verify-email`,
      data: metadata,
    },
  });

  if (error) throw error;

  // Don't auto-login until email is verified
  toast.success("Please check your email to verify your account");
  return { success: true, needsVerification: true };
};

// Add middleware to check verification
const checkEmailVerified = (user) => {
  if (user && !user.email_confirmed_at) {
    toast.error("Please verify your email first");
    navigate("/verify-email");
    return false;
  }
  return true;
};
```

---

### 4. Input Validation & Sanitization

**PROBLEM:**
User input not validated properly.

**SOLUTION:**

```typescript
// Use Zod for validation
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const handleLogin = async (formData) => {
  // Validate
  const result = loginSchema.safeParse(formData);

  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors);
    return;
  }

  // Proceed with validated data
  await login(result.data.email, result.data.password);
};
```

---

## 🛡️ Security Checklist

### Essential (Must Have):

- [ ] Move Service Role Key to backend/Edge Functions
- [ ] Implement proper RLS policies
- [ ] Add rate limiting
- [ ] Enable email verification
- [ ] Add input validation (Zod)
- [ ] Sanitize user inputs
- [ ] Add CSRF protection
- [ ] Use HTTPS only
- [ ] Implement session timeout
- [ ] Add password strength requirements

### Recommended:

- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Implement audit logging
- [ ] Add IP whitelisting for admin
- [ ] Use security headers
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Monitor for suspicious activity
- [ ] Implement account lockout after failed attempts

### Advanced:

- [ ] Add CAPTCHA for forms
- [ ] Implement Content Security Policy (CSP)
- [ ] Use Subresource Integrity (SRI)
- [ ] Add security monitoring (Sentry)
- [ ] Regular dependency updates
- [ ] Security training for developers

---

## 🔒 Environment Variables Security

**NEVER commit these to Git:**

```bash
# .env (must be in .gitignore)
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
VITE_SUPABASE_SERVICE_KEY=xxx  # ⚠️ Never use in frontend!
```

**For production (Vercel/Netlify):**

- Add all env vars in hosting dashboard
- Never include in code
- Use different keys for dev/staging/prod

---

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)

---

## 🚨 Immediate Action Required

1. **Stop using supabaseAdmin in frontend** (Dashboard.tsx)
2. **Implement RLS policies** for all tables
3. **Create Edge Functions** for admin operations
4. **Enable email verification**
5. **Add rate limiting**

**Estimated time to fix:** 2-3 days
**Risk if not fixed:** CRITICAL - Database compromise

---

Last updated: December 3, 2025
