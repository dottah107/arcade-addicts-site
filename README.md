# Arcade Addicts — Static + Supabase

## Run locally
Open index.html or use a local server (e.g., `npx serve .`). For Supabase auth on `file://` you may prefer a tiny server.

## Supabase setup
1) Run `sql/schema.sql` in Supabase SQL editor.
2) Storage: create a public bucket named **user-content**.
3) Auth > URL config:
   - **Site URL**: https://arcade-addicts.com
   - **Redirect URLs (allowed)**:
     - https://arcade-addicts.com/login.html
     - https://arcade-addicts.com/reset-password.html   (your change-password page)
4) Auth email templates: keep defaults for now.

## DNS/Hosting
- Point Cloudflare DNS to GitHub Pages (CNAME your apex/subdomain to `dottah107.github.io`), or use Cloudflare Pages if you prefer (static export).
