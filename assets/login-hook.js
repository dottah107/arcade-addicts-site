(() => {
  const API = "/api/login";

  function notify(msg){ try{alert(msg)}catch(_){ } console.log(msg); }

  function findSignInButtons(){
    const list = [];
    // Marked elements (preferred)
    list.push(...document.querySelectorAll('[data-signin], [data-action="signin"]'));
    // Common IDs/classes
    list.push(...document.querySelectorAll('#loginBtn, .login-btn, .signin-btn'));
    // Text match (buttons & links)
    const candidates = Array.from(document.querySelectorAll('a,button,input[type="button"],input[type="submit"]'));
    for (const el of candidates) {
      const txt = (el.value || el.textContent || "").trim().toLowerCase();
      if (txt === "sign in" || txt === "signin" || txt === "log in" || txt === "login") list.push(el);
    }
    // de-dup
    return Array.from(new Set(list)).filter(Boolean);
  }

  async function doLogin(email, password){
    const payload = { email: (email||"").trim(), password: password||"" };
    if (!payload.email || !payload.password){ notify("Enter email and password."); return; }
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // credentials: "include", // uncomment if using cross-site cookie auth
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

  function bindForm(){
    const form = document.querySelector('#loginForm') || document.querySelector('form[action*="login"]');
    if (!form) return false;
    const email = form.querySelector('#email,[name="email"],input[type="email"]');
    const pass  = form.querySelector('#password,[name="password"],input[type="password"]');
    if (!email || !pass) return false;

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      doLogin(email.value, pass.value).catch(err=>{console.error(err); notify("Network error. Check Console/Network.");});
    }, { once:false });
    return true;
  }

  function bindButtons(){
    const email = document.querySelector('#email,[name="email"],input[type="email"]');
    const pass  = document.querySelector('#password,[name="password"],input[type="password"]');
    const btns = findSignInButtons();
    btns.forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        console.log('Login button clicked');
        // If wrapped in a form we'll let the form handler manage it.
        if (email && pass){
          e.preventDefault();
          doLogin(email.value, pass.value).catch(err=>{console.error(err); notify("Network error. Check Console/Network.");});
        }
      });
    });
    if (btns.length) console.log('Bound sign-in buttons:', btns.length);
  }

  window.addEventListener('error', e => console.error('Window error:', e.error || e.message));
  window.addEventListener('unhandledrejection', e => console.error('Promise rejection:', e.reason));

  function init(){
    const hasForm = bindForm();   // prefer real form submit
    bindButtons();                // also catch bare buttons/links
    if (!hasForm) console.warn('No login form detected—using button handler only.');
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
