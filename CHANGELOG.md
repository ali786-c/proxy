# UpgradedProxy — Changelog

All changes are logged here in reverse chronological order (newest first).

---

## 2026-02-21

### Phase 1: Auth Bridge Integrated (Laravel Sanctum)
- **Files:** `AuthContext.tsx`, `client.ts`, `api.php`, `AuthController.php`, `cors.php`
- **Goal:** Full migration from Supabase Auth to Laravel Sanctum Backend
- **Major Changes:**
  - **AuthContext Rewrite:** Systematic removal of `@supabase/supabase-js`. Now uses `/auth/login`, `/auth/signup`, and `/auth/me` endpoints.
  - **API Client Fix:** Implemented `Bearer` token injection via `localStorage` and global 401 interceptor for auto-logout.
  - **Backend Routes:** Aligned routes to `/auth` prefix to match frontend.
  - **CORS Config:** Created `api/config/cors.php` to allow cross-origin requests from `devwithguru.site`.

### Permanent Fix: Supabase Purge (Anti-Crash)
- **Problem:** "SupabaseUrl is required" error causing white page on live site.
- **Root Cause:** Legacy components (CurrencyContext, Admin Pages) still initializing Supabase client.
- **Fix:**
  - Mocked Supabase client in `integrations/supabase/client.ts` to satisfy orphans.
  - Purged `supabase.from` calls from high-level contexts.
  - Migrated `CurrencyContext` to static data + `Intl.NumberFormat`.

### Fix: Install Wizard — HTTP 500 on Install Now Button
- **File:** `api/install.php` (complete rewrite)
- **Problem:** Clicking "Install Now" caused HTTP 500 on cPanel
- **Root Cause:** No error handling around `exec()` calls + wrong PHP binary path on shared hosting
- **Fix:**
  - Added `ob_start()` + `error_reporting(0)` + `try/catch(Throwable)` to prevent all 500 errors
  - PHP binary autodetection: tries 8 cPanel-specific paths (`ea-php83`, `ea-php82`, `/usr/local/bin/php`, etc.)
  - `exec()` availability check with `shell_exec()` fallback
  - Graceful degradation: if both disabled, shows friendly message to run migrations via cPanel Terminal

### Fix: Install Wizard — React Router 404 on `/api/install.php`
- **File:** `htdocs/index.php` (complete rewrite)
- **Problem:** Visiting root domain showed React's 404 page instead of install wizard
- **Root Cause:** `index.php` redirecting to `/api/install.php` caused an infinite redirect loop → browser loaded React SPA → React Router showed 404
- **Fix:** Embedded the full installation wizard **directly inside `index.php`** — no redirect at all. When `installed.lock` is missing, PHP serves the wizard HTML. When installed, serves React SPA.

### Fix: api/.htaccess — Updated for install.php passthrough
- **File:** `api/.htaccess`
- **Change:** Added `RewriteRule ^install\.php$ - [L]` to serve `api/install.php` directly without bridging to `public/`

### New File: `api/install.php`
- Moved install wizard from `api/public/install.php` to `api/install.php` (root of api folder)
- Accessible directly at `yourdomain.com/api/install.php` without `.htaccess` bridging

---

## 2026-02-20

### Build: cPanel Deployment Setup
- Compiled React frontend with `npm run build`
- Copied `dist/` contents to `htdocs/`
- Configured `.htaccess` for SPA routing + API proxy
- Created `api/.htaccess` to bridge requests to Laravel `public/`

### New File: Root `index.php`
- PHP entry point at `htdocs/` root
- Checks `api/storage/installed.lock` to decide: show installer or serve React SPA

### New File: `api/public/install.php`  *(superseded by `api/install.php`)*
- Original 5-step install wizard
- Replaced by the version at `api/install.php`

---

## UI Rebuild Reminder
> **Every time React/frontend code changes:**
> ```
> cd htdocs-react-src
> npm run build
> cp -r dist/* c:\xampp\htdocs\
> git add . && git commit -m "..." && git push
> ```
