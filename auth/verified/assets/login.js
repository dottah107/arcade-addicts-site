(() => {
  function notify(msg){ try { alert(msg); } catch(e){} console.log(msg); }
  function setup(){
    const form = document.getElementById('loginForm');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const btn = document.getElementById('loginBtn');
    if (!form || !email || !password || !btn){ console.warn('Login elements not found; skipping bind.'); return; }
    btn.addEventListener('click', ()=>console.log('Login button clicked'));
    window.addEventListener('error', e => console.error('Window error:', e.error || e.message));
    window.addEventListener('unhandledrejection', e => console.error('Promise rejection:', e.reason));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = { email: (email.value||'').trim(), password: password.value||'' };
      if (!payload.email || !payload.password){ notify('Enter email and password.'); return; }
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
          // credentials: "include" // uncomment if your API uses cross-site cookies
        });
        if (!res.ok){ notify("Login failed: " + (await res.text().catch(()=>res.statusText))); return; }
        let data = {}; try { data = await res.json(); } catch(_) {}
        if (data.token) { try { localStorage.setItem('aa_token', data.token); } catch(_){} }
        location.href = data.redirect || "/dashboard/";
      } catch (err) { console.error(err); notify("Network error. Check Console/Network."); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup); else setup();
})();
