# ✅ FIX: WebStorm PostgreSQL Connection to Supabase

## 🚨 YOUR CURRENT ERROR

```
postgres@localhost
[99999] Unable to parse URL jdbc:postgresql://localhost:5432/postgres.
```

**Problem:** You're using `localhost` - but your database is NOT on localhost, it's on Supabase cloud!

---

## 🔧 EXACT STEPS TO FIX IN WEBSTORM

### Step 1: Delete the Current Connection (if exists)

1. In Database panel, right-click on the failed connection
2. Select "Remove" or "Delete"

### Step 2: Create NEW Connection with Correct Settings

1. **Click the `+` button** in Database panel
2. **Select:** Data Source → PostgreSQL
3. **DON'T close the dialog** - follow these exact settings:

---

## 📋 COPY THESE EXACT VALUES:

### General Tab:

| Field              | Value                                 |
|--------------------|---------------------------------------|
| **Name**           | `Supabase - Lumos DB`                 |
| **Host**           | `db.hkiczkmdxldshooaelio.supabase.co` |
| **Port**           | `5432`                                |
| **Authentication** | `User & Password`                     |
| **User**           | `postgres`                            |
| **Password**       | `BNo2AkWyYR4zYQon`                    |
| **Database**       | `postgres`                            |
| **Save password**  | ✅ CHECK THIS                          |

### ⚠️ CRITICAL: SSH/SSL Tab Settings

1. Click on **SSH/SSL** tab
2. **Check:** ✅ Use SSL
3. **SSL Mode:** Select `require` from dropdown
4. Click **Apply**

---

## 🎯 ALTERNATIVE: Use URL Method

If manual setup doesn't work, try this:

1. Click `+` → Data Source → PostgreSQL
2. In the **URL** field, paste this EXACT string:

```
jdbc:postgresql://db.hkiczkmdxldshooaelio.supabase.co:5432/postgres
```

3. Then set:
    - **User:** `postgres`
    - **Password:** `BNo2AkWyYR4zYQon`
4. Go to SSH/SSL tab → Enable SSL → Mode: `require`
5. Click "Test Connection"

---

## ✅ VERIFICATION CHECKLIST

Before clicking "Test Connection", verify:

- [ ] Host is `db.hkiczkmdxldshooaelio.supabase.co` (NOT localhost!)
- [ ] Port is `5432`
- [ ] User is `postgres`
- [ ] Password is `BNo2AkWyYR4zYQon`
- [ ] Database is `postgres`
- [ ] SSL is ENABLED (this is mandatory for Supabase!)
- [ ] SSL Mode is set to `require`

---

## 🔍 COMMON MISTAKES TO AVOID

❌ **DON'T use:** `localhost`  
✅ **USE:** `db.hkiczkmdxldshooaelio.supabase.co`

❌ **DON'T skip:** SSL configuration  
✅ **ENABLE:** SSL with mode `require`

❌ **DON'T use:** old/wrong password  
✅ **USE:** `BNo2AkWyYR4zYQon`

---

## 🎉 AFTER SUCCESSFUL CONNECTION

Once connected, you can:

1. Browse all tables in the `public` schema
2. Run queries directly
3. Edit data
4. View table structures

Test with this query:

```sql
SELECT COUNT(*)
FROM clients;
```

---

## 🆘 STILL NOT WORKING?

### Error: "Connection timeout" or "Cannot connect"

- **Check:** Your internet connection
- **Check:** Firewall isn't blocking port 5432
- **Try:** Disable VPN if you're using one

### Error: "SSL connection required"

- **Fix:** You forgot to enable SSL in SSH/SSL tab

### Error: "password authentication failed"

- **Fix:** Double-check password is exactly: `BNo2AkWyYR4zYQon`
- **Note:** Passwords are case-sensitive!

### Error: "Database does not exist"

- **Fix:** Make sure Database field says `postgres` (lowercase)

---

## 📞 QUICK REFERENCE CARD

```
┌─────────────────────────────────────────────┐
│   SUPABASE CONNECTION - QUICK REFERENCE     │
├─────────────────────────────────────────────┤
│ Host: db.hkiczkmdxldshooaelio.supabase.co  │
│ Port: 5432                                  │
│ User: postgres                              │
│ Pass: BNo2AkWyYR4zYQon                      │
│ DB:   postgres                              │
│ SSL:  REQUIRED (mode: require)              │
└─────────────────────────────────────────────┘
```

**Copy this and keep it handy!**

