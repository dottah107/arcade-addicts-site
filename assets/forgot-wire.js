/* assets/forgot-wire.js — sends password reset email */
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  function msg(el, text, ok=false){ if(!el) return; el.style.color = ok ? "#86efac" : "#fca5a5"; el.textContent = text||""; }
  function ready(fn){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",fn); else fn(); }

  ready(()=> {
    if(!window.supabase){ console.warn("Supabase SDK missing on Login page"); return; }

    // Try common selectors
    const form   = $("#loginForm") || $("form");
    const email  = $("#email") || $('input[type="email"]') || (form && form.querySelector('input[type="email"]'));
    const forgot = $("#forgotBtn") || $('[data-forgot]') || Array.from(document.querySelectorAll("a,button")).find(el => /forgot/i.test(el.textContent||""));
    let out = $("#forgotMsg");
    if(!out && form){ out = document.createElement("div"); out.id="forgotMsg"; out.style.marginTop="10px"; out.style.fontWeight="700"; form.appendChild(out); }

    if (!forgot) { console.warn("No Forgot button/link found"); return; }

    const send = async () => {
      const val = (email && (email.value||"").trim()) || "";
      if (!val) return msg(out, "Enter your email first.");
      msg(out, "Sending…", true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(val, { redirectTo: "' + $Redirect + '" });
        if (error) return msg(out, error.message);
        msg(out, "Check your email for the reset link.", true);
      } catch(e){ msg(out, e?.message || "Could not send reset email."); }
    };

    // Click + optional intercept of “Forgot?” links
    forgot.addEventListener("click", (e)=>{ e.preventDefault(); send(); });
  });
})();
