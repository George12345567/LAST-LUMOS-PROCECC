# Supabase Database Connection Guide

## ✅ Your Updated Credentials

Your database password has been updated to: `BNo2AkWyYR4zYQon`

## 🔧 Connection Methods

### Method 1: Using WebStorm Database Console

**Connection String:**

```
postgresql://postgres:BNo2AkWyYR4zYQon@db.hkiczkmdxldshooaelio.supabase.co:5432/postgres
```

**Manual Configuration:**

- **Host:** `db.hkiczkmdxldshooaelio.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** `BNo2AkWyYR4zYQon`
- **SSL Mode:** `require`

### Method 2: Using Application (Supabase Client)

Your application uses the **Supabase API keys** (not the database password):

- **URL:** `https://hkiczkmdxldshooaelio.supabase.co`
- **Anon Key:** Already configured in `.env`
- **Service Key:** Already configured in `.env`

These API keys should still work for your application unless you've also reset them in Supabase dashboard.

## 🔍 Troubleshooting Database Connection Issues

### Issue 1: "Connection Failed" in Application

**Solution:** Your application doesn't use the database password directly. It uses API keys. The keys in your `.env`
file should still be valid.

### Issue 2: "Connection Failed" in WebStorm/psql

**Solution:** Use the direct connection string above with the new password.

### Issue 3: API Keys Don't Work

If you reset your Supabase project or regenerated keys, you need to:

1. Go to Supabase Dashboard → Settings → API
2. Copy the new `anon` key and `service_role` key
3. Update them in `.env` file:
   ```
   VITE_SUPABASE_ANON_KEY=your_new_anon_key
   VITE_SUPABASE_SERVICE_KEY=your_new_service_role_key
   ```

## ⚡ Testing Connection

### Test Application Connection

```bash
npm run dev
```

Then try to login or access any feature that uses the database.

### Test Direct Database Connection (WebStorm)

1. Open Database panel (View → Tool Windows → Database)
2. Click `+` → Data Source → PostgreSQL
3. Enter the connection details above
4. Click "Test Connection"

## 📝 Important Notes

1. **Database Password** is used for direct database access (psql, WebStorm, etc.)
2. **API Keys** are used by your application through Supabase client
3. Changing the database password does NOT invalidate API keys
4. API keys are JWT tokens that remain valid until you explicitly reset them

## 🔐 Security Reminder

- Never commit `.env` file to git
- Keep your service role key secret (it bypasses Row Level Security)
- Use anon key for client-side code only

