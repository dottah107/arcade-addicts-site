/* register-wire.js — only used on /register/ */
(function(){
  function $(sel, root=document){ return root.querySelector(sel); }

  function findForm(){
    return $('#regForm') || document.querySelector('form[action*="register"], form[action=""], form:not([action])');
  }
  function findInput(sel){
    return $(sel) || $('input[type="email"]') || $('[name="email"]');
  }
  function findPass(){
    return $('#regPass') || $('[name="password"]') || $('input[type="password"]');
  }
  function findTag(){
    return $('#regGamertag') || $('[name="gamertag"]') || $('[name="display_name"]');
  }
  function msgEl(){ return $('#regMsg') || (function(){ const el=document.createElement('div'); el.id='regMsg'; el.style.marginTop='10px'; el.style.color='#fca5a5'; const f=findForm(); if (f) f.appendChild(el); return el; })(); }

  async function onSubmit(e){
    e.preventDefault();
    if (!window.supabase){ alert("Missing Supabase SDK"); return; }
    const form = findForm();
    const email = (findInput('#regEmail')?.value || $('[name="email"]')?.value || '').trim();
    const password = (findPass()?.value || '').trim();
    const gamertag = (findTag()?.value || '').trim();
    const out = msgEl();
    out.textContent = "";

    if (!email || !password){ out.textContent = "Enter email and password."; return; }

    // disable button(s)
    const btn = form?.querySelector('button[type="submit"],input[type="submit"]');
    if (btn){ btn.disabled = true; btn.dataset.__txt = btn.innerText || btn.value; if (btn.innerText) btn.innerText = "Registering..."; if (btn.value) btn.value = "Registering..."; }

    try{
      const redirectUrl = location.origin + "/member/";
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: redirectUrl, data: gamertag ? { display_name: gamertag } : undefined }
      });

      if (error){ out.textContent = error.message; return; }

      // If email confirmation is on, Supabase won't log them in immediately.
      // Show a friendly message then send them to login.
      out.style.color = "#86efac";
      out.textContent = "Check your email to confirm your account.";
      setTimeout(()=>{ location.href = "/login/?check-email=1"; }, 1200);
    } catch (err){
      out.textContent = err.message || "Could not register.";
    } finally {
      if (btn){ btn.disabled = false; if (btn.innerText) btn.innerText = btn.dataset.__txt; if (btn.value) btn.value = btn.dataset.__txt; }
    }
  }

  function ready(fn){ if (document.readyState==="loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  ready(()=> {
    const form = findForm();
    if (!form) return;
    // kill native navigation (prevents the weird letters/raw JSON reload)
    form.setAttribute('action','');
    form.addEventListener('submit', onSubmit);
  });
})();
