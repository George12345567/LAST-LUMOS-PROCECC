# WebStorm Database Connection Setup

## ❌ Current Error

You're trying to connect to `localhost` but your database is on Supabase cloud, not running locally.

## ✅ Correct Configuration

### Method 1: JDBC URL (Copy & Paste)

```
jdbc:postgresql://db.hkiczkmdxldshooaelio.supabase.co:5432/postgres?user=postgres&password=BNo2AkWyYR4zYQon&sslmode=require
```

### Method 2: Manual Configuration

**Host:** `db.hkiczkmdxldshooaelio.supabase.co`  
**Port:** `5432`  
**Database:** `postgres`  
**User:** `postgres`  
**Password:** `BNo2AkWyYR4zYQon`  
**SSL Mode:** `require` (IMPORTANT!)

## 📝 Step-by-Step Instructions

1. Open WebStorm
2. Go to **View** → **Tool Windows** → **Database**
3. Click the **`+`** button in the Database panel
4. Select **Data Source** → **PostgreSQL**
5. In the dialog that opens:
    - **Name:** Lumos Supabase DB
    - **Host:** `db.hkiczkmdxldshooaelio.supabase.co`
    - **Port:** `5432`
    - **Database:** `postgres`
    - **User:** `postgres`
    - **Password:** `BNo2AkWyYR4zYQon`
    - **Save password:** ✓ (check this)
6. Click on the **SSH/SSL** tab
    - Select **Use SSL**
    - SSL Mode: **require** or **verify-full**
7. Click **Download missing driver files** if prompted
8. Click **Test Connection**
9. If successful, click **OK**

## 🔍 Troubleshooting

### Error: "Unable to parse URL jdbc:postgresql://localhost:5432/postgres"

**Problem:** You're using localhost instead of the Supabase host  
**Solution:** Replace `localhost` with `db.hkiczkmdxldshooaelio.supabase.co`

### Error: "Connection refused"

**Problem:** SSL is not enabled  
**Solution:** Enable SSL in the SSH/SSL tab and set mode to "require"

### Error: "password authentication failed"

**Problem:** Wrong password  
**Solution:** Use password: `BNo2AkWyYR4zYQon`

### Error: "SSL connection required"

**Problem:** Supabase requires SSL connections  
**Solution:** Enable SSL in connection settings

## 🎯 Quick Test

After connecting, try running this query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see tables like: `contacts`, `clients`, `saved_designs`, etc.

## 📚 Your Database Tables

- `contacts` - Contact form submissions
- `clients` - Customer accounts
- `saved_designs` - User-created designs
- `profiles` - User profiles and settings
- `magic_links` - Authentication magic links
- And more...

## 🔐 Security Notes

- This password is for DATABASE access only (not the same as API keys)
- Never commit these credentials to git
- Keep this file in `.gitignore`

