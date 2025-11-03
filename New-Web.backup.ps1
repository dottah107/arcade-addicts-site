# =========================================================
# Arcade Addicts — full static site + Supabase integration
# Path: C:\Users\dgoda\Desktop\New WEB
# GitHub: https://github.com/dottah107/arcade-addicts-site
# Domain: Cloudflare (points to GitHub Pages)
# =========================================================

$root = "C:\Users\dgoda\Desktop\New WEB"
$repo = "https://github.com/dottah107/arcade-addicts-site.git"

# --- 0) Clean & make folders
if (!(Test-Path $root)) { New-Item -ItemType Directory -Path $root | Out-Null }
Set-Location $root

$folders = @(
  "assets","assets/js","assets/css","assets/img",
  "sql"
)
$folders | ForEach-Object { if (!(Test-Path $_)) { New-Item -ItemType Directory -Path $_ | Out-Null } }

# --- 1) Write site files

# index.html (HOME)
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Arcade Addicts — Home</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container">
    <section class="hero">
      <h1>Arcade Addicts Tournaments</h1>
      <p>Compete, make friends, and show off your skills.</p>
      <div class="cta-row">
        <a class="btn" href="/login.html">Login</a>
        <a class="btn secondary" href="/register.html">Register</a>
      </div>
    </section>

    <section class="grid-2">
      <div class="card">
        <h2>Build Your Squad</h2>
        <p>Send, accept, and decline friend requests to set up tournaments fast.</p>
        <a class="link" href="/friends.html">Friends</a>
      </div>
      <div class="card">
        <h2>Show Your Skill</h2>
        <p>Upload clips, set your profile & background, and share recent activity.</p>
        <a class="link" href="/account.html">Account</a>
      </div>
    </section>

    <section class="card">
      <h2>AAA Lounge</h2>
      <p>Chat about wins, losses, and rematches. Discord embed + realtime lounge.</p>
      <a class="link" href="/aaalounge.html">Enter Lounge</a>
    </section>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\index.html"

# login.html
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Login — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
  <script defer src="/assets/js/auth.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container narrow">
    <h1>Login</h1>
    <form id="login-form" class="card form">
      <label>Email <input type="email" id="login-email" required></label>
      <label>Password <input type="password" id="login-password" required></label>
      <button class="btn" type="submit">Login</button>
    </form>

    <div class="row-links">
      <a href="/reset-password.html">Forgot password?</a>
      <a href="/register.html">Register here</a>
    </div>
    <p id="login-msg" class="msg"></p>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\login.html"

# register.html
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Register — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
  <script defer src="/assets/js/auth.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container narrow">
    <h1>Create your account</h1>
    <form id="register-form" class="card form">
      <label>Email <input type="email" id="reg-email" required></label>
      <label>Password <input type="password" id="reg-password" minlength="6" required></label>
      <button class="btn" type="submit">Register now</button>
    </form>
    <p class="hint">We’ll email you a verification link. After verifying, log in normally.</p>
    <p id="reg-msg" class="msg"></p>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\register.html"

# reset-password.html (change-password page)
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Change Password — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
  <script defer src="/assets/js/auth.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container narrow">
    <h1>Reset your password</h1>
    <form id="change-pass-form" class="card form">
      <label>New password <input type="password" id="new-pass" minlength="6" required></label>
      <button class="btn" type="submit">Update password</button>
    </form>
    <p id="change-msg" class="msg"></p>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\reset-password.html"

# account.html
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Account — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
  <script defer src="/assets/js/account.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container">
    <h1>Account</h1>

    <section class="grid-2">
      <div class="card">
        <h2>Update Profile</h2>
        <form id="profile-form" class="form">
          <label>Username / Gamertag <input type="text" id="pf-username" required></label>
          <label>Platform <input type="text" id="pf-platform" placeholder="PS, Xbox, PC, Switch..."></label>
          <button class="btn" type="submit">Save Profile</button>
        </form>
        <div id="pf-msg" class="msg"></div>
      </div>

      <div class="card">
        <h2>Upload Content</h2>
        <form id="upload-form" class="form">
          <input type="file" id="upload-file" accept="image/*,video/*" required />
          <button class="btn" type="submit">Upload</button>
        </form>
        <p class="hint">Images & short clips supported. Uploaded to Supabase Storage.</p>
        <div id="up-msg" class="msg"></div>
      </div>
    </section>

    <section class="card">
      <h2>My Uploads</h2>
      <div id="my-uploads" class="thumbs"></div>
      <template id="upload-menu">
        <div class="hover-menu">
          <button data-action="set-profile">Set as Profile</button>
          <button data-action="set-background">Set as Background</button>
          <button data-action="post-activity">Post to Activity</button>
          <button class="danger" data-action="delete">Delete</button>
        </div>
      </template>
    </section>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\account.html"

# members.html (dashboard)
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Members — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
  <script defer src="/assets/js/activity.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container">
    <section class="profile-banner">
      <div class="banner-img" id="banner-img"></div>
      <div class="avatar" id="avatar"></div>
      <h1 id="member-username">@member</h1>
      <p id="member-platform"></p>
    </section>

    <section class="card">
      <h2>Recent Activity (You + Friends)</h2>
      <div id="activity-feed" class="feed"></div>
    </section>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\members.html"

# friends.html
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Friends — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
  <script defer src="/assets/js/friends.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container">
    <h1>Friends</h1>

    <section class="grid-3">
      <div class="card">
        <h2>Friend Requests</h2>
        <div id="requests"></div>
      </div>

      <div class="card">
        <h2>Your Friends</h2>
        <div id="friends"></div>
      </div>

      <div class="card">
        <h2>Find Members</h2>
        <input id="search" placeholder="Search username..." />
        <div id="all-members"></div>
      </div>
    </section>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\friends.html"

# aaalounge.html
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>AAA Lounge — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
  <script defer src="/assets/js/lounge.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container">
    <h1>AAA Lounge</h1>

    <section class="grid-2">
      <div class="card">
        <h2>Discord</h2>
        <!-- Replace with your actual Discord widget values when ready -->
        <iframe src="https://discord.com/widget?id=1234567890&theme=dark" width="100%" height="400" allowtransparency="true" frameborder="0"></iframe>
      </div>

      <div class="card">
        <h2>Realtime Lounge Chat</h2>
        <div id="lounge-messages" class="feed"></div>
        <form id="lounge-form" class="form row">
          <input id="lounge-text" placeholder="Say something..." required />
          <button class="btn" type="submit">Send</button>
        </form>
      </div>
    </section>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\aaalounge.html"

# pay.html
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Pay — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container narrow">
    <h1>Support & Entry Fees</h1>
    <div class="card">
      <h2>Options</h2>
      <ul class="list">
        <li><a class="btn" href="https://cash.app/$ArcadeAddicts" target="_blank">Cash App</a></li>
        <li><a class="btn" href="https://www.paypal.me/ArcadeAddicts" target="_blank">PayPal</a></li>
        <li><a class="btn" href="#" onclick="alert('Apple Pay on the web requires domain verification + a payment processor. Add later.'); return false;">Apple Pay</a></li>
      </ul>
    </div>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\pay.html"

# tournaments.html (stub for later)
@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Tournaments — Arcade Addicts</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/assets/css/styles.css">
  <script defer src="/assets/js/supabase-init.js"></script>
  <script defer src="/assets/js/header.js"></script>
</head>
<body>
  <header id="aa-header"></header>
  <main class="container">
    <h1>Tournaments</h1>
    <p class="hint">We’ll hook this up last, per your plan.</p>
  </main>
</body>
</html>
'@ | Set-Content -Encoding UTF8 "$root\tournaments.html"

# assets/css/styles.css
@'
:root {
  --primary: #00FFFF;
  --bg: #000000;
  --muted: #101316;
  --text: #E8F1F2;
  --accent: #00FFFF;
  --danger: #ff3b30;
}
* { box-sizing: border-box; }
body {
  margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background: var(--bg); color: var(--text);
}
a { color: var(--accent); text-decoration: none; }
.container { width: min(1100px, 92%); margin: 32px auto; }
.container.narrow { width: min(680px, 92%); }
.hero { text-align: center; padding: 40px 0; }
.btn {
  background: var(--primary); color: #000; border: none; padding: 12px 16px;
  border-radius: 14px; font-weight: 700; display: inline-block; cursor: pointer;
}
.btn.secondary { background: transparent; border: 1px solid var(--primary); color: var(--primary); }
.btn.danger { background: var(--danger); color: #fff; }
.card { background: var(--muted); border: 1px solid #0f1a1e; border-radius: 16px; padding: 16px; margin: 16px 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
@media (max-width: 900px){ .grid-2, .grid-3 { grid-template-columns: 1fr; } }
.form label { display: block; margin-bottom: 10px; }
.form input, .form select {
  width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #1f2a2e; background: #0a0d10; color: var(--text);
}
.row-links { display: flex; gap: 16px; justify-content: center; margin-top: 12px; }
.msg { margin-top: 12px; min-height: 20px; }
.profile-banner { position: relative; }
.banner-img { height: 180px; border-radius: 12px; background: #0b0f12 center/cover no-repeat; }
.avatar { width: 96px; height: 96px; border-radius: 50%; background: #0b0f12 center/cover no-repeat;
  border: 3px solid var(--primary); position: relative; top: -48px; margin-left: 16px; }
#member-username { margin: -32px 0 0 128px; }
.thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.thumb { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #172027; }
.thumb video, .thumb img { width: 100%; height: 140px; object-fit: cover; display: block; }
.hover-menu {
  position: absolute; inset: 0; background: rgba(0,0,0,.7);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; opacity: 0;
  transition: opacity .2s;
}
.thumb:hover .hover-menu { opacity: 1; }
.feed { display: flex; flex-direction: column; gap: 12px; }
.feed-item { background: #0b0f12; border: 1px solid #18222a; border-radius: 12px; padding: 12px; }
.feed-item .meta { opacity: .7; font-size: 14px; }
.header-bar { display: flex; justify-content: flex-end; gap: 10px; padding: 12px; border-bottom: 1px solid #10161a; background: #06090c; }
.header-bar a, .header-bar button { color: var(--text); }
.link { color: var(--primary); font-weight: 600; }
.list { list-style: none; padding-left: 0; }
.row { display: flex; gap: 8px; }
'@ | Set-Content -Encoding UTF8 "$root\assets\css\styles.css"

# assets/js/supabase-init.js (use your provided project url/key)
@'
/* Supabase client init */
window.supabase = supabase.createClient(
  "https://xvhkwyhncuivsfwfmvbg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aGt3eWhuY3VpdnNmd2ZtdmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzQxNjgsImV4cCI6MjA3NDQxMDE2OH0.oeCz6LHCCzLvHqO7q9cNiiiotrUm8kzmzdJjfzBIA-8",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
'@ | Set-Content -Encoding UTF8 "$root\assets\js\supabase-init.js"

# assets/js/header.js
@'
(function(){
  const el = document.getElementById("aa-header");
  if (!el) return;
  el.innerHTML = `
    <nav class="header-bar">
      <a href="/index.html">Home</a>
      <a href="/members.html">Dashboard</a>
      <a href="/friends.html">Friends</a>
      <a href="/account.html">Account</a>
      <a href="/tournaments.html">Tournaments</a>
      <a href="/aaalounge.html">AAALounge</a>
      <a href="/pay.html">Pay</a>
      <button id="aa-logout" class="btn secondary" style="padding:6px 10px">Logout</button>
    </nav>
  `;
  const logoutBtn = document.getElementById("aa-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login.html";
  });
})();
'@ | Set-Content -Encoding UTF8 "$root\assets\js\header.js"

# assets/js/auth.js
@'
(async function(){
  // Redirect logged-in users away from auth pages to /members.html
  const { data: { session } } = await supabase.auth.getSession();
  const path = location.pathname;

  const onAuthPage = /login\.html$|register\.html$|reset-password\.html$/.test(path);
  if (session && onAuthPage) {
    location.replace("/members.html");
    return;
  }

  // LOGIN
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const out = document.getElementById("login-msg");
      out.textContent = "Signing in...";
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { out.textContent = error.message; return; }
      location.href = "/members.html";
    });
  }

  #region REGISTER
  const regForm = document.getElementById("register-form");
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const out = document.getElementById("reg-msg");
      out.textContent = "Creating account...";
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: "https://arcade-addicts.com/login.html"
        }
      });
      if (error) { out.textContent = error.message; return; }
      out.textContent = "Check your email to verify, then log in.";
    });
  }
  #endregion

  // RESET (request email)
  // We expose this via link on login page to /reset-password.html
  // That page also handles updating the password after the email link.
  if (path.endsWith("/login.html")) {
    // nothing else; button links to /reset-password.html
  }

  // CHANGE PASSWORD page (after email link)
  const changeForm = document.getElementById("change-pass-form");
  if (changeForm) {
    changeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPass = document.getElementById("new-pass").value;
      const out = document.getElementById("change-msg");
      out.textContent = "Updating password...";
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        out.textContent = "No active session. Use the email link or log in.";
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) { out.textContent = error.message; return; }
      out.textContent = "Password updated. You can close this tab and log in.";
    });
  }

  // Utility to request a reset email from anywhere:
  window.requestPasswordReset = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://arcade-addicts.com/reset-password.html"
    });
  };

})();
'@ | Set-Content -Encoding UTF8 "$root\assets\js\auth.js"

# assets/js/account.js
@'
(async function(){
  // Gate: must be logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace("/login.html"); return; }
  const user = session.user;

  // Ensure profile exists
  async function ensureProfile(){
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) { console.error(error); return; }
    if (!data) {
      await supabase.from("profiles").insert({
        id: user.id, username: user.email.split("@")[0], platform: ""
      });
    }
  }

  await ensureProfile();

  // Load & populate profile form
  async function loadProfile(){
    const { data, error } = await supabase
      .from("profiles")
      .select("username, platform")
      .eq("id", user.id)
      .single();
    if (!error && data) {
      document.getElementById("pf-username").value = data.username || "";
      document.getElementById("pf-platform").value = data.platform || "";
    }
  }
  await loadProfile();

  document.getElementById("profile-form")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const username = document.getElementById("pf-username").value.trim();
    const platform = document.getElementById("pf-platform").value.trim();
    const { error } = await supabase.from("profiles")
      .update({ username, platform })
      .eq("id", user.id);
    document.getElementById("pf-msg").textContent = error? error.message : "Profile saved.";
  });

  // Uploads
  const bucket = "user-content";
  document.getElementById("upload-form")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const file = document.getElementById("upload-file").files[0];
    if (!file) return;

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    const out = document.getElementById("up-msg");
    if (upErr) { out.textContent = upErr.message; return; }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    const kind = file.type.startsWith("video/") ? "video" : "image";

    await supabase.from("uploads").insert({
      user_id: user.id, url: pub.publicUrl, kind, title: file.name
    });

    out.textContent = "Uploaded.";
    await renderUploads();
  });

  async function renderUploads(){
    const root = document.getElementById("my-uploads");
    root.innerHTML = "";
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return;

    const menuTpl = document.getElementById("upload-menu");

    for (const u of data) {
      const box = document.createElement("div");
      box.className = "thumb";
      const media = u.kind === "video"
        ? `<video src="${u.url}" muted></video>`
        : `<img src="${u.url}" alt="">`;
      box.innerHTML = media + menuTpl.innerHTML;

      // attach menu actions
      box.querySelectorAll("[data-action]").forEach(btn=>{
        btn.addEventListener("click", async ()=>{
          const action = btn.getAttribute("data-action");
          if (action === "set-profile") {
            await supabase.from("profiles").update({ avatar_url: u.url }).eq("id", user.id);
          } else if (action === "set-background") {
            await supabase.from("profiles").update({ banner_url: u.url }).eq("id", user.id);
          } else if (action === "post-activity") {
            await supabase.from("activity").insert({
              user_id: user.id, kind: "upload", content_url: u.url, text: u.title
            });
          } else if (action === "delete") {
            await supabase.from("uploads").delete().eq("id", u.id);
            // also remove from activity that references this url
            await supabase.from("activity").delete().eq("content_url", u.url).eq("user_id", user.id);
          }
          await renderUploads();
        });
      });

      root.appendChild(box);
    }
  }
  await renderUploads();

})();
'@ | Set-Content -Encoding UTF8 "$root\assets\js\account.js"

# assets/js/activity.js
@'
(async function(){
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace("/login.html"); return; }
  const user = session.user;

  // load own profile (avatar/banner/username/platform)
  const { data: prof } = await supabase
    .from("profiles")
    .select("username, platform, avatar_url, banner_url")
    .eq("id", user.id).single();

  if (prof) {
    document.getElementById("member-username").textContent = prof.username || "@member";
    document.getElementById("member-platform").textContent = prof.platform || "";
    if (prof.avatar_url) document.getElementById("avatar").style.backgroundImage = `url('${prof.avatar_url}')`;
    if (prof.banner_url) document.getElementById("banner-img").style.backgroundImage = `url('${prof.banner_url}')`;
  }

  // friends list (accepted)
  const { data: friends } = await supabase.rpc("get_friends_ids", { p_user_id: user.id });

  const ids = new Set([user.id, ...(friends||[])]);

  // recent activity by self + friends
  const { data: feed } = await supabase
    .from("activity_view")    /* view joins usernames */
    .select("*")
    .lte("created_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(100);

  const filtered = (feed||[]).filter(x => ids.has(x.user_id));
  const root = document.getElementById("activity-feed");
  root.innerHTML = "";

  for (const item of filtered) {
    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `
      <div class="meta">${item.username} — ${new Date(item.created_at).toLocaleString()}</div>
      ${item.content_url ? (item.kind==="upload" && item.content_url.match(/\.mp4|\.webm/i) ? `<video src="${item.content_url}" controls></video>` : `<img src="${item.content_url}" style="max-width:100%;border-radius:12px;" />`) : ""}
      ${item.text ? `<p>${item.text}</p>` : ""}
    `;
    root.appendChild(div);
  }
})();
'@ | Set-Content -Encoding UTF8 "$root\assets\js\activity.js"

# assets/js/friends.js
@'
(async function(){
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace("/login.html"); return; }
  const user = session.user;

  // Ensure profile to search by username
  await supabase.from("profiles").upsert({ id: user.id, username: user.email.split("@")[0] }, { onConflict: "id" });

  async function render() {
    await renderRequests();
    await renderFriends();
    await renderMembers();
  }

  async function renderRequests(){
    const root = document.getElementById("requests");
    root.innerHTML = "";
    const { data } = await supabase
      .from("friendships_view") /* view provides usernames */
      .select("*")
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    for (const r of (data||[])) {
      const row = document.createElement("div");
      row.className = "feed-item";
      row.innerHTML = `
        <div class="meta">@${r.requester_username} wants to connect</div>
        <div class="row">
          <button class="btn" data-act="accept" data-id="${r.id}">Accept</button>
          <button class="btn danger" data-act="decline" data-id="${r.id}">Decline</button>
        </div>
      `;
      root.appendChild(row);
    }

    root.querySelectorAll("[data-act]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const id = btn.getAttribute("data-id");
        const act = btn.getAttribute("data-act");
        if (act === "accept") {
          await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
        } else {
          await supabase.from("friendships").delete().eq("id", id);
        }
        await renderRequests();
        await renderFriends();
      });
    });
  }

  async function renderFriends(){
    const root = document.getElementById("friends");
    root.innerHTML = "";
    const { data } = await supabase
      .from("friends_of_user_view")
      .select("*")
      .eq("user_id", user.id);
    for (const f of (data||[])) {
      const row = document.createElement("div");
      row.className = "feed-item";
      row.innerHTML = `<div class="meta">@${f.username}</div>`;
      root.appendChild(row);
    }
  }

  async function renderMembers(){
    const root = document.getElementById("all-members");
    root.innerHTML = "";
    const q = document.getElementById("search").value?.toLowerCase() || "";
    let query = supabase.from("profiles").select("id, username").order("username");
    if (q) query = query.ilike("username", `%${q}%`);
    const { data } = await query.limit(100);
    for (const m of (data||[])) {
      if (m.id === user.id) continue;
      const row = document.createElement("div");
      row.className = "feed-item";
      row.innerHTML = `
        <div class="meta">@${m.username}</div>
        <button class="btn" data-send="${m.id}">Add Friend</button>
      `;
      root.appendChild(row);
    }
    root.querySelectorAll("[data-send]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const addressee = btn.getAttribute("data-send");
        await supabase.from("friendships").insert({
          requester_id: user.id,
          addressee_id: addressee,
          status: "pending"
        });
        alert("Request sent.");
      });
    });
  }

  document.getElementById("search")?.addEventListener("input", render);
  await render();
})();
'@ | Set-Content -Encoding UTF8 "$root\assets\js\friends.js"

# assets/js/lounge.js (realtime chat)
@'
(async function(){
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace("/login.html"); return; }
  const user = session.user;

  // fetch username
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  const username = profile?.username || user.email;

  const msgsRoot = document.getElementById("lounge-messages");
  async function loadRecent() {
    const { data } = await supabase
      .from("lounge_messages_view") /* includes username */
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    msgsRoot.innerHTML = "";
    for (const m of (data||[]).reverse()) appendMsg(m.username, m.text, m.created_at);
  }
  function appendMsg(u, t, ts){
    const div = document.createElement("div"); div.className = "feed-item";
    div.innerHTML = `<div class="meta">@${u} — ${new Date(ts).toLocaleString()}</div><p>${t}</p>`;
    msgsRoot.appendChild(div);
    msgsRoot.scrollTop = msgsRoot.scrollHeight;
  }

  await loadRecent();

  // insert
  const form = document.getElementById("lounge-form");
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const text = document.getElementById("lounge-text").value.trim();
    if (!text) return;
    await supabase.from("lounge_messages").insert({ user_id: user.id, text });
    document.getElementById("lounge-text").value = "";
  });

  // realtime subscribe
  supabase.channel("lounge")
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "lounge_messages" },
      async (payload) => {
        const row = payload.new;
        // get username via view for consistency
        const { data } = await supabase
          .from("profiles").select("username").eq("id", row.user_id).single();
        appendMsg(data?.username || "user", row.text, row.created_at);
      }
    ).subscribe();
})();
'@ | Set-Content -Encoding UTF8 "$root\assets\js\lounge.js"

# --- 2) SQL for Supabase (run these in Supabase SQL editor)

@'
-- SCHEMA: profiles, uploads, activity, friendships, lounge_messages + storage policies

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  platform text,
  avatar_url text,
  banner_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.uploads (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  url text not null,
  kind text check (kind in (''image'',''video'')) default ''image'',
  title text,
  created_at timestamp with time zone default now()
);

create table if not exists public.activity (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  kind text check (kind in (''upload'',''note'')) default ''upload'',
  text text,
  content_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.friendships (
  id bigserial primary key,
  requester_id uuid references public.profiles(id) on delete cascade,
  addressee_id uuid references public.profiles(id) on delete cascade,
  status text check (status in (''pending'',''accepted'')) default ''pending'',
  created_at timestamp with time zone default now(),
  unique(requester_id, addressee_id)
);

create or replace view public.friendships_view as
select f.*,
  pr.username as requester_username,
  pa.username as addressee_username
from friendships f
left join profiles pr on pr.id = f.requester_id
left join profiles pa on pa.id = f.addressee_id;

-- your friends (accepted, symmetric)
create or replace view public.friends_of_user_view as
select
  case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end as friend_id,
  case when f.requester_id = auth.uid() then pa.username else pr.username end as username,
  auth.uid() as user_id
from friendships f
left join profiles pr on pr.id = f.requester_id
left join profiles pa on pa.id = f.addressee_id
where f.status = ''accepted'' and (f.requester_id = auth.uid() or f.addressee_id = auth.uid());

-- helper function to return friend ids for a given user
create or replace function public.get_friends_ids(p_user_id uuid)
returns uuid[]
language plpgsql security definer as $$
declare arr uuid[];
begin
  select array_agg( case when requester_id = p_user_id then addressee_id else requester_id end )
  into arr
  from friendships
  where status = 'accepted' and (requester_id = p_user_id or addressee_id = p_user_id);
  return coalesce(arr, '{}');
end $$;

-- activity view joined to usernames
create or replace view public.activity_view as
select a.*, p.username
from activity a
left join profiles p on p.id = a.user_id;

-- Lounge chat
create table if not exists public.lounge_messages (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone default now()
);

create or replace view public.lounge_messages_view as
select m.*, p.username
from lounge_messages m
left join profiles p on p.id = m.user_id;

-- Storage: create bucket
-- (Do this one-time in Storage UI, name: user-content, public)
-- Or via RPC if you enable storage admin; UI is simpler.

-- RLS
alter table profiles enable row level security;
alter table uploads enable row level security;
alter table activity enable row level security;
alter table friendships enable row level security;
alter table lounge_messages enable row level security;

-- PROFILES
create policy "profiles_select_self_or_public" on profiles
for select using (true);

create policy "profiles_insert_self" on profiles
for insert with check (id = auth.uid());

create policy "profiles_update_self" on profiles
for update using (id = auth.uid());

-- UPLOADS
create policy "uploads_select_all" on uploads
for select using (true);

create policy "uploads_insert_owner" on uploads
for insert with check (user_id = auth.uid());

create policy "uploads_update_owner" on uploads
for update using (user_id = auth.uid());

create policy "uploads_delete_owner" on uploads
for delete using (user_id = auth.uid());

-- ACTIVITY
create policy "activity_select_all" on activity
for select using (true);

create policy "activity_cud_owner" on activity
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- FRIENDSHIPS
create policy "friendships_select_involving_me" on friendships
for select using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "friendships_insert_me_as_requester" on friendships
for insert with check (requester_id = auth.uid());

create policy "friendships_update_if_addressee" on friendships
for update using (addressee_id = auth.uid());

create policy "friendships_delete_if_involving_me" on friendships
for delete using (requester_id = auth.uid() or addressee_id = auth.uid());

-- LOUNGE
create policy "lounge_select_all" on lounge_messages
for select using (true);

create policy "lounge_insert_self" on lounge_messages
for insert with check (user_id = auth.uid());

create policy "lounge_owner_delete" on lounge_messages
for delete using (user_id = auth.uid());
'@ | Set-Content -Encoding UTF8 "$root\sql\schema.sql"

# policies.sql kept for future extensions (already included above)
@'
-- Additional policies can be appended here if needed.
'@ | Set-Content -Encoding UTF8 "$root\sql\policies.sql"

# --- 3) README quick tips
@'
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
'@ | Set-Content -Encoding UTF8 "$root\README.md"

# --- 4) Add supabase-js script (CDN) into /assets/vendor
if (!(Test-Path "$root\assets\vendor")) { New-Item -ItemType Directory "$root\assets\vendor" | Out-Null }
@'
/* empty placeholder to keep folder; supabase-js loaded from CDN in each page */
'@ | Set-Content -Encoding UTF8 "$root\assets\vendor\README.txt"

# Inject Supabase CDN into pages (using a simple replace-free approach: append before closing body in each HTML)
$pages = Get-ChildItem -Path $root -Filter *.html
foreach ($p in $pages) {
  $h = Get-Content $p.FullName -Raw
  if ($h -notmatch "cdn\.jsdelivr\.net") {
    $h = $h -replace "</head>", "  <script src=""https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js""></script>`n</head>"
    Set-Content -Encoding UTF8 $p.FullName $h
  }
}

# --- 5) Initialize git and push
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

# Try push (first-time might require auth)
try {
  git push -u origin main
} catch {
  Write-Host "Git push failed — ensure credentials/personal access token are set." -ForegroundColor Yellow
}

Write-Host "Done. Next: run sql/schema.sql in Supabase, create 'user-content' bucket, and set auth redirects." -ForegroundColor Cyan
'@ | Set-Content -Encoding UTF8 "$root\New-Web.ps1"
