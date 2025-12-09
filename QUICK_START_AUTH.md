# 🚀 Quick Start Guide - Lumos Authentication

## ⚡ 5-Minute Setup

### 1️⃣ Run SQL in Supabase (1 min)

```sql
-- Copy the entire SQL script from AUTH_SETUP.md
-- Paste in Supabase SQL Editor → Run
```

### 2️⃣ Create Your First User (1 min)

**Option A: Via Supabase UI**

1. Dashboard → Authentication → Add user
2. Enter email: `admin@lumos.com`
3. Enter password: `YourSecurePassword123!`
4. Table Editor → profiles → Set role to `super_admin`

**Option B: Via SQL**

```sql
-- After creating user in UI, run:
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'admin@lumos.com';
```

### 3️⃣ Test Login (1 min)

```bash
npm run dev
# Navigate to http://localhost:5173/login
# Login with your credentials
# You should be redirected to /admin-dashboard-2025
```

## 📖 Common Use Cases

### Use Case 1: Check if User is Logged In

```jsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return <p>Welcome {user.email}!</p>;
}
```

### Use Case 2: Show Content Based on Role

```jsx
import { useAuth } from "@/context/AuthContext";

function AdminPanel() {
  const { isSuperAdmin, isAdmin } = useAuth();

  return (
    <div>
      {isSuperAdmin && <SuperAdminTools />}
      {isAdmin && <AdminTools />}
      <RegularContent />
    </div>
  );
}
```

### Use Case 3: Protect a Specific Component

```jsx
import { useRequireAuth } from "@/hooks";

function SecretComponent() {
  const { user, checkAccess } = useRequireAuth({
    requiredRoles: ["super_admin"],
    redirectTo: "/login",
  });

  // Component only renders if user is super_admin
  return <div>Secret Data</div>;
}
```

### Use Case 4: Add Logout Button

```jsx
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Use Case 5: Update User Profile

```jsx
import { useAuth } from "@/context/AuthContext";

function ProfileForm() {
  const { profile, updateProfile } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      full_name: "John Doe",
      phone: "+20123456789",
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🎯 Testing Checklist

- [ ] Can access `/login` page
- [ ] Can login with valid credentials
- [ ] Redirects to dashboard after login
- [ ] Cannot access `/admin-dashboard-2025` without login
- [ ] Can see user info in UserMenu
- [ ] Can logout successfully
- [ ] Session persists on page refresh
- [ ] Wrong password shows error
- [ ] Invalid email shows error

## 🔑 Default Credentials

After setup, use the credentials you created:

- Email: `admin@lumos.com` (or whatever you set)
- Password: Your chosen password

## 🛠️ Quick Fixes

### Problem: "Cannot read properties of null"

**Solution:** Wrap component in `<AuthProvider>`

```jsx
// App.tsx
<AuthProvider>
  <YourComponents />
</AuthProvider>
```

### Problem: "Redirect loop"

**Solution:** Check if your protected route is correct

```jsx
// Should be:
<ProtectedRoute>
    <Dashboard />
</ProtectedRoute>

// Not:
<ProtectedRoute>
    <Navigate to="/dashboard" />
</ProtectedRoute>
```

### Problem: "User logged in but profile is null"

**Solution:** Check trigger is working

```sql
SELECT * FROM public.profiles WHERE id = auth.uid();
```

### Problem: "Access Denied" even with correct role

**Solution:** Verify role in database

```sql
SELECT email, role FROM public.profiles;
```

## 📞 Need Help?

Check these in order:

1. ✅ SQL script ran successfully?
2. ✅ User exists in auth.users?
3. ✅ Profile exists in public.profiles?
4. ✅ Role is set correctly?
5. ✅ AuthProvider wraps your app?
6. ✅ Browser console shows any errors?

## 🎨 Customization Examples

### Change Login Page Colors

```jsx
// src/pages/Login.jsx
// Line ~80: Change gradient
className =
  "min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900";
```

### Add Custom User Fields

```sql
-- Add to profiles table
ALTER TABLE public.profiles ADD COLUMN company TEXT;
ALTER TABLE public.profiles ADD COLUMN phone TEXT;

-- Update in AuthContext.jsx fetchProfile function
```

### Change Protected Route Redirect

```jsx
// src/components/ProtectedRoute.jsx
// Line ~15: Change redirectTo default
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = '/your-page' })
```

---

**Your authentication system is now ready! 🎉**

Login at: `http://localhost:5173/login`
