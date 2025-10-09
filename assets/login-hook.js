(() => {
  const API = "/api/login"; // fallback if not using Supabase
  function notify(m){ try{alert(m)}catch(_){ } console.log(m); }

  async function supabaseLogin(email, password){
    if (!window.supabase || !window.supabase.auth) return {used:false};
    try {
      const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
      if (error) return {used:true, ok:false, msg:error.message};
      return {used:true, ok:true, data};
    } catch(e){ return {used:true, ok:false, msg:e.message||"Supabase error"}; }
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
    location.href = "/dashboard/";
  }

  function findLoginForm(){
    const forms = Array.from(document.querySelectorAll("form"));
    for (const f of forms){
      const email = f.querySelector('input[type="email"],#email,[name="email"]');
      const pass  = f.querySelector('input[type="password"],#password,[name="password"]');
      if (email && pass) return {f,email,pass};
    }
    return null;
  }

  function bind(){
    const found = findLoginForm();
    if (!found){ console.warn("No login form found"); return; }
    const {f,email,pass} = found;
    f.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const em=(email.value||"").trim(), pw=pass.value||"";
      if (!em || !pw){ notify("Enter email and password."); return; }

      const sb = await supabaseLogin(em,pw);
      if (sb.used){
        if (sb.ok){ location.href="/dashboard/"; return; }
        console.warn("Supabase login failed:", sb.msg);
      }
      await apiLogin(em,pw);
    });
    console.log("Bound login form to Supabase/API.");
  }
  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded", bind); else bind();
})();
