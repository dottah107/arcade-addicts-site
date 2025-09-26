# Arcade Addicts — Cloudflare Pages Setup

This repo is ready for Cloudflare Pages. Steps:

1) Create a public or private GitHub repo (e.g., `arcade-addicts-site`).
2) Add these files and push to the `main` branch.
3) In Cloudflare Dashboard → Pages → Create project → Connect to Git → choose the repo.
   - Framework: None
   - Build command: (leave blank)
   - Output directory: `/`
4) In Pages → Custom domains → add `arcade-addicts.com` (and `www.arcade-addicts.com`).
5) Turn on: Always Use HTTPS. TLS certs are automatic.
6) This repo has a `_headers` file with strict security headers and CSP.

## Updating content
Edit `index.html` and push to `main`. Cloudflare auto-deploys.
If you want to stage changes, create a branch and open a Pull Request to get a preview URL.

## Optional — GitHub Actions (validation only)
This repo includes `.github/workflows/validate.yml` which runs on PRs to catch broken links and HTML errors.