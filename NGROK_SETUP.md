# ngrok Setup for myPOS Webhook Testing

## Problem
myPOS requires **HTTPS** webhook URLs that are **publicly accessible**. Localhost URLs like `http://localhost:3000` won't work.

**Error**: `E_INVALID_PARAMS: url_notify` (Error code: 5)

---

## Solution: Use ngrok

ngrok creates a secure tunnel from a public HTTPS URL to your local development server.

---

## Step-by-Step Setup

### 1. Install ngrok

**Option A: Direct Download**
- Go to https://ngrok.com/download
- Download for Windows
- Extract `ngrok.exe` to a folder in your PATH

**Option B: Using Chocolatey** (if installed)
```powershell
choco install ngrok
```

**Option C: Using Scoop** (if installed)
```powershell
scoop install ngrok
```

---

### 2. Start ngrok Tunnel

Open a **new terminal** and run:

```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       (your account)
Version                       3.x.x
Region                        Europe (eu)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1
                              0       0       0.00
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

---

### 3. Add ngrok URL to `.env.local`

Add this line to your `.env.local` file:

```bash
# ngrok URL for local webhook testing (update with YOUR ngrok URL)
NEXT_PUBLIC_WEBHOOK_URL=https://abc123.ngrok-free.app
```

**Important**: Replace `abc123.ngrok-free.app` with YOUR actual ngrok URL!

---

### 4. Restart Your Dev Server

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
pnpm dev
```

---

### 5. Test Payment

1. Go to your **ngrok URL**: `https://abc123.ngrok-free.app/checkout`
   - (Or use localhost: `http://localhost:3000/checkout` - same app, different URL)

2. Add items to cart

3. Proceed to payment

4. The console should now show:
   ```
   🚀 Initialing myPOS payment with params: {
     ...
     urlNotify: "https://abc123.ngrok-free.app/api/webhooks/mypos"  ✅
     ...
   }
   ```

5. **Payment form should load successfully!** 🎉

---

## Monitoring Webhooks

ngrok provides a **Web Interface** to inspect all HTTP requests:

**Open**: http://127.0.0.1:4040

You can:
- See all incoming requests
- Inspect webhook payloads from myPOS
- Debug webhook responses
- Replay requests

---

## Important Notes

### Free ngrok Limitations
- URL changes every time you restart ngrok
- Limited to 40 requests/minute
- Session expires after 2 hours

**Solution**: Sign up for a free ngrok account to get:
- Static domain (URL doesn't change)
- Unlimited sessions
- More requests

### Update URL After Restart

Each time you restart ngrok:
1. **Copy the new HTTPS URL**
2. **Update `NEXT_PUBLIC_WEBHOOK_URL` in `.env.local`**
3. **Restart dev server**: `pnpm dev`

### Keep ngrok Running

Keep the ngrok terminal window **open** while testing. If you close it, the tunnel stops.

---

## Quick Command Reference

```bash
# Start ngrok
ngrok http 3000

# With ngrok account (static domain)
ngrok http 3000 --domain=your-static-domain.ngrok-free.app

# View all active tunnels
ngrok status

# Stop ngrok
# Just close the terminal or press Ctrl+C
```

---

## Testing Checklist

After setup:
- [ ] ngrok is running and shows "Session Status: online"
- [ ] Copied HTTPS URL from ngrok
- [ ] Added `NEXT_PUBLIC_WEBHOOK_URL` to `.env.local`
- [ ] Restarted dev server (`pnpm dev`)
- [ ] Console log shows HTTPS URL for `urlNotify`
- [ ] Payment form loads without error code 5

---

## Production Deployment

**You don't need ngrok in production!**

When deployed to a real server:
1. Remove `NEXT_PUBLIC_WEBHOOK_URL` from `.env` (or leave it empty)
2. The code will automatically use `window.location.origin`
3. Your production domain already has HTTPS ✅

---

**Status**: Ready to test with ngrok! 🚀

**Next**: 
1. Install ngrok
2. Run `ngrok http 3000`
3. Copy HTTPS URL
4. Add to `.env.local` as `NEXT_PUBLIC_WEBHOOK_URL`
5. Restart dev server
6. Test payment!
