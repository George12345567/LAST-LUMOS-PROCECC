# 🔐 Lumos Authentication System

Complete secure authentication implementation using Supabase Auth with React.

## 📋 Implementation Checklist

### ✅ Step 1: Database Setup (Run in Supabase SQL Editor)

1. Go to your Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the entire SQL script from below and execute it:

```sql
-- ============================================
-- LUMOS AUTHENTICATION SYSTEM - SQL SCHEMA
-- ============================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'viewer')),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role has full access"
    ON public.profiles FOR ALL
    USING (auth.role() = 'service_role');

-- 4. Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Create index
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
```

### ✅ Step 2: Create Your First Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. After creation, go to SQL Editor and run:

```sql
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'your-email@example.com';
```

OR use the Supabase UI:

- Go to Table Editor → profiles
- Find your user row
- Change role to `super_admin`

### ✅ Step 3: Files Created

All files have been automatically created:

- ✅ `src/context/AuthContext.jsx` - Authentication context provider
- ✅ `src/pages/Login.jsx` - Beautiful login page
- ✅ `src/components/ProtectedRoute.jsx` - Route protection wrapper
- ✅ `src/components/UserMenu.jsx` - User dropdown menu
- ✅ `src/App.tsx` - Updated with AuthProvider and routes

## 🚀 Usage

### Using the Auth Context

```jsx
import { useAuth } from "@/context/AuthContext";

function YourComponent() {
  const {
    user, // Current user object
    profile, // User profile from public.profiles
    loading, // Loading state
    isAuthenticated, // Boolean
    isAdmin, // Boolean
    isSuperAdmin, // Boolean
    login, // Login function
    logout, // Logout function
    signUp, // Sign up function
    updateProfile, // Update profile function
    resetPassword, // Reset password function
  } = useAuth();

  // Your component logic
}
```

### Adding UserMenu to Dashboard

Add this to your Dashboard header:

```jsx
import UserMenu from "@/components/UserMenu";

function Dashboard() {
  return (
    <div>
      <header className="flex items-center justify-between p-4">
        <h1>Dashboard</h1>
        <UserMenu /> {/* Add this */}
      </header>
      {/* Rest of your dashboard */}
    </div>
  );
}
```

### Creating Protected Routes

```jsx
// In App.tsx
<Route
    path="/admin-dashboard-2025"
    element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <Dashboard />
        </ProtectedRoute>
    }
/>

// Or without role restriction
<Route
    path="/profile"
    element={
        <ProtectedRoute>
            <Profile />
        </ProtectedRoute>
    }
/>
```

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Automatic profile creation on signup
- ✅ Role-based access control
- ✅ Secure password handling
- ✅ Session management
- ✅ Protected routes
- ✅ CSRF protection via Supabase

## 🎨 Available Roles

- `super_admin` - Full system access
- `admin` - Standard admin access
- `viewer` - Read-only access

## 📝 Environment Setup

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Testing the System

1. **Start your dev server:**

   ```bash
   npm run dev
   ```

2. **Test login flow:**

   - Go to `/login`
   - Enter your credentials
   - Should redirect to `/admin-dashboard-2025`

3. **Test protected routes:**

   - Try accessing `/admin-dashboard-2025` without login
   - Should redirect to `/login`

4. **Test logout:**
   - Click UserMenu → Logout
   - Should clear session and redirect

## 🔧 Customization

### Change Password Requirements

Edit `src/pages/Login.jsx`:

```jsx
if (formData.password.length < 8) {
  // Change minimum length
  newErrors.password = "Password must be at least 8 characters";
}
```

### Add More User Fields

1. Update SQL schema:

```sql
ALTER TABLE public.profiles ADD COLUMN phone TEXT;
```

2. Update trigger function to include new fields

3. Update `AuthContext.jsx` to fetch new fields

### Custom Redirect After Login

Edit `src/pages/Login.jsx`:

```jsx
const from = location.state?.from?.pathname || "/your-custom-path";
```

## 🐛 Troubleshooting

### "Profile not found" error

- Check if trigger is working: `SELECT * FROM public.profiles;`
- Manually create profile if needed

### Login redirects but shows loading forever

- Check Supabase auth settings
- Verify RLS policies are correct
- Check browser console for errors

### "User not authorized" on dashboard

- Verify user role in profiles table
- Check `allowedRoles` in ProtectedRoute

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/overview)

## 🎯 Next Steps

1. ✅ Add "Forgot Password" page
2. ✅ Add "Sign Up" page (if needed)
3. ✅ Add profile editing functionality
4. ✅ Add email verification flow
5. ✅ Add 2FA (Two-factor authentication)
6. ✅ Add user management for super_admins

---

**Created with 🔐 Security Best Practices**
