(() => {
  // Default API (used only if there's no native form and no Supabase)
  const API = "/api/login";

  function notify(msg){ try{ alert(msg) }catch(_){} console.log(msg); }

  async function supabaseLogin(email, password){
    if (!window.supabase || !window.supabase.auth) return null; // not available
    try {
      const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok:false, message: error.message };
      return { ok:true, data };
    } catch (e) {
      return { ok:false, message: e.message || "Supabase error" };
    }
  }

  async function apiLogin(email, password){
    const payload = { email: (email||"").trim(), password: password||"" };
    if (!payload.email || !payload.password) { notify("Enter email and password."); return; }
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // credentials: "include", // uncomment if your API uses cross-site cookies
      body: JSON.stringify(payload)
    });
    if (!res.ok){
      const t = await res.text().catch(()=>res.statusText);
      notify("Login failed: " + (t || (res.status + " " + res.statusText)));
      return;
    }
    let data = {}; try { data = await res.json(); } catch(_){}
    if (data.token){ try { localStorage.setItem('aa_token', data.token); } catch(_){ } }
    location.href = data.redirect || "/dashboard/";
  }

  function findSignInButtons(){
    const list = [];
    list.push(...document.querySelectorAll('[data-signin], [data-action="signin"]'));
    list.push(...document.querySelectorAll('#loginBtn, .login-btn, .signin-btn'));
    const candidates = Array.from(document.querySelectorAll('a,button,input[type="button"],input[type="submit"]'));
    for (const el of candidates) {
      const txt = (el.value || el.textContent || "").trim().toLowerCase();
      if (txt === "sign in" || txt === "signin" || txt === "log in" || txt === "login") list.push(el);
    }
    return Array.from(new Set(list)).filter(Boolean);
  }

  function bindForm(){
    const form = document.querySelector('#loginForm') || document.querySelector('form[action*="login"]');
    if (!form) return false;

    // If the form already has a real action, let the browser submit it natively.
    const action = (form.getAttribute('action') || "").trim();
    if (action && action !== "#" && action !== "javascript:void(0)"){
      console.log("Using native form submit to:", action);
      return true; // do NOT attach preventDefault; server will handle it
    }

    // Otherwise, we wire up JS login (Supabase or API)
    const email = form.querySelector('#email,[name="email"],input[type="email"]');
    const pass  = form.querySelector('#password,[name="password"],input[type="password"]');
    if (!email || !pass) return false;

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      // Try Supabase first
      const sb = await supabaseLogin(email.value, pass.value);
      if (sb && sb.ok){
        location.href = "/dashboard/";
        return;
      }
      if (sb && !sb.ok){
        console.warn("Supabase login failed:", sb.message);
      }
      // Fallback to custom API
      apiLogin(email.value, pass.value).catch(err=>{ console.error(err); notify("Network error. Check Console/Network."); });
    });
    return true;
  }

  function bindButtons(){
    const email = document.querySelector('#email,[name="email"],input[type="email"]');
    const pass  = document.querySelector('#password,[name="password"],input[type="password"]');
    const btns = findSignInButtons();
    btns.forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        console.log('Login button clicked');

        // If a native form submit exists, let it proceed
        const form = btn.closest('form');
        const hasNative = form && (form.getAttribute('action') || "").trim() && (form.getAttribute('action') || "").trim() !== "#" ;
        if (hasNative) return; // don't prevent default

        if (email && pass){
          e.preventDefault();
          // Try Supabase, then fallback
          supabaseLogin(email.value, pass.value)
            .then(sb=>{
              if (sb && sb.ok){ location.href = "/dashboard/"; return; }
              if (sb && !sb.ok) console.warn("Supabase login failed:", sb.message);
              return apiLogin(email.value, pass.value);
            })
            .catch(err=>{ console.error(err); notify("Network error. Check Console/Network."); });
        }
      });
    });
    if (btns.length) console.log('Bound sign-in buttons:', btns.length);
  }

  window.addEventListener('error', e => console.error('Window error:', e.error || e.message));
  window.addEventListener('unhandledrejection', e => console.error('Promise rejection:', e.reason));

  function init(){
    const hasForm = bindForm();   // prefer native or JS form
    bindButtons();                // also catch bare buttons/links
    if (!hasForm) console.warn('No login form detected—using button handler only.');
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
