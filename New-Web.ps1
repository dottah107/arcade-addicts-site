# =========================================================
# Arcade Addicts â€" full static site + Supabase integration
# Path: C:\Users\dgoda\Desktop\New WEB
# GitHub: https://github.com/dottah107/arcade-addicts-site
# Domain: Cloudflare (points to GitHub Pages)
# =========================================================

# --- 0) Variables ---
$root = "C:\Users\dgoda\Desktop\New WEB"
$repo = "https://github.com/dottah107/arcade-addicts-site.git"

# --- 1) Create base folders ---
$folders = @("assets/js", "assets/css", "sql", "uploads")
foreach ($f in $folders) {
  $path = Join-Path $root $f
  if (!(Test-Path $path)) { New-Item -ItemType Directory $path | Out-Null }
}

# --- 2) Core config files ---
@'
# Arcade Addicts - Project Config
Live via GitHub Pages + Cloudflare
Supabase Project: https://xvhkwyhncuivsfwfmvbg.supabase.co
'@ | Set-Content -Encoding UTF8 "$root\README.md"

# --- 3) Supabase initialization script ---
@'
const SUPABASE_URL = "https://xvhkwyhncuivsfwfmvbg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGt3eWhuY3VpdnNmd2ZtdmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzQxNjgsImV4cCI6MjA3NDQxMDE2OH0.oeCz6LHCCzLvHqO7q9cNiiiotrUm8kzmzdJjfzBIA-8";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
'@ | Set-Content -Encoding UTF8 "$root\assets\js\supabase-init.js"

# --- 4) Base HTML pages ---
$pages = @{
  "index.html" = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Arcade Addicts - Home</title>
  <link rel="stylesheet" href="assets/css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
  <script src="assets/js/supabase-init.js"></script>
</head>
<body>
  <header>
    <h1>ðŸŽ® Arcade Addicts</h1>
    <nav>
      <a href="login.html">Login</a> |
      <a href="register.html">Register</a> |
      <a href="members.html">Members</a> |
      <a href="friends.html">Friends</a> |
      <a href="account.html">Account</a>
    </nav>
  </header>

  <main>
    <h2>Welcome to the Arena</h2>
    <p>Connect with other gamers, share highlights, and compete in tournaments.</p>
  </main>

  <footer>Â© 2025 Arcade Addicts</footer>
</body>
</html>
'@

  "login.html" = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login - Arcade Addicts</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
  <script src="assets/js/supabase-init.js"></script>
  <script src="assets/js/auth.js"></script>
</head>
<body>
  <h1>Member Login</h1>
  <form id="login-form">
    <input type="email" id="email" placeholder="Email" required><br>
    <input type="password" id="password" placeholder="Password" required><br>
    <button type="submit">Login</button>
  </form>
  <p><a href="register.html">Register Here</a> | <a href="reset-password.html">Forgot Password?</a></p>
</body>
</html>
'@

  "register.html" = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Register - Arcade Addicts</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
  <script src="assets/js/supabase-init.js"></script>
  <script src="assets/js/auth.js"></script>
</head>
<body>
  <h1>Register</h1>
  <form id="register-form">
    <input type="email" id="reg-email" placeholder="Email" required><br>
    <input type="password" id="reg-password" placeholder="Password" required><br>
    <button type="submit">Register Now</button>
  </form>
</body>
</html>
'@
}

foreach ($page in $pages.Keys) {
  $path = Join-Path $root $page
  $pages[$page] | Set-Content -Encoding UTF8 $path
}

# --- 5) Inject Supabase CDN into all HTML files ---
$files = Get-ChildItem -Path $root -Filter *.html
foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  if ($content -notmatch "cdn\.jsdelivr\.net") {
    $content = $content -replace "</head>", "  <script src=`"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js`"></script>`n</head>"
    Set-Content -Encoding UTF8 $file.FullName $content
  }
}

# --- 6) Initialize git and push ---
if (!(Test-Path "$root\.git")) {
  git init | Out-Null
  git config user.name "dottah107"
  git config user.email "you@example.com"
  git add .
  git commit -m "Arcade Addicts MVP: auth, profiles, uploads, friends, lounge" | Out-Null
  git branch -M main
  git remote add origin $repo
} else {
  git add .
  git commit -m "Update site files" | Out-Null
}

try {
  git push -u origin main
} catch {
  Write-Host "Git push failed -- ensure credentials/personal access token are set." -ForegroundColor Yellow
}

Write-Host "Done! Now open Supabase > Storage > create 'user-content' bucket and verify redirect URLs." -ForegroundColor Cyan



