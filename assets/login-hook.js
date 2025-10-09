(() => {
  // Keeps Supabase first; uses API fallback only if needed.
  const API = "/api/login";
  function notify(m){ try{alert(m)}catch(_){ } console.log(m); }

  async function supabaseLogin(email, password){
    if (!window.supabase || !window.supabase.auth) return {used:false};
    try{
      const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
      if (error) return {used:true, ok:false, msg:error.message};
      return {used:true, ok:true, data};
    }catch(e){ return {used:true, ok:false, msg:e.message||"Supabase error"}; }
  }

  async function apiLogin(email, password){
    const res = await fetch(API, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email:(email||"").trim(), password:password||"" })
    });
    if (!res.ok){ notify("Login failed: " + (await res.text().catch(()=>res.statusText))); return; }
    let data={}; try{ data = await res.json(); }catch(_){}
    if (data.token) try{ localStorage.setItem("aa_token", data.token) }catch(_){}
    location.href = "/members/";
  }

  // robust selectors (no form required)
  function getEmailEl(){
    return document.querySelector('input[type="email"], #email, [name="email"], [name*="email" i]');
  }
  function getPassEl(){
    return document.querySelector('input[type="password"], #password, [name="password"], [name*="password" i]');
  }
  function findSignInButtons(){
    const list = [];
    list.push(...document.querySelectorAll('[data-signin], [data-action="signin"], #loginBtn, .login-btn, .signin-btn, button, a[role="button"], input[type="submit"], input[type="button"]'));
    return Array.from(new Set(list)).filter(el=>{
      const t = (el.value || el.textContent || "").trim().toLowerCase();
      return ["sign in","signin","log in","login"].includes(t);
    });
  }

  async function handleLogin(e){ if(e){ e.preventDefault(); e.stopPropagation(); }
    const emailEl = getEmailEl();
    const passEl  = getPassEl();
    if (!emailEl || !passEl){ console.warn("Email/password inputs not found"); notify("Enter email and password."); return; }
    const em = (emailEl.value||"").trim();
    const pw = passEl.value||"";
    if (!em || !pw){ notify("Enter email and password."); return; }

    console.log("Sign In clicked → trying Supabase…");
    const sb = await supabaseLogin(em, pw);
    if (sb.used){
      if (sb.ok){ location.href = "/members/"; return; }
      console.warn("Supabase login failed:", sb.msg);
    }
    console.log("Falling back to API /api/login");
    await apiLogin(em, pw);
  }

  function init(){
    // 1) Bind any existing form but DO NOT require it
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", handleLogin);
      console.log("Bound existing form submit.");
    } else {
      console.warn("No form detected — using button handler.");
    }

    // 2) Always bind buttons by text
    const btns = findSignInButtons();
    btns.forEach(btn => btn.addEventListener("click", handleLogin));
    console.log("Bound sign-in buttons:", btns.length);

    // 3) Global error hooks
    window.addEventListener("error", e => console.error("Window error:", e.error || e.message));
    window.addEventListener("unhandledrejection", e => console.error("Promise rejection:", e.reason));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

