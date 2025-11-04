(function(){
  const supa = window.supabaseClient;
  const showMsg = (id, msg)=>{ const el=document.getElementById(id); if(el){ el.textContent=msg; el.style.display="block";}};
  const err = (m)=> showMsg("errbar", m);

  // ---------------- Forgot password (email only) ----------------
  const forgotEl =
    document.getElementById("forgot-btn") ||
    document.getElementById("forgot") ||
    document.getElementById("forgot-password") ||
    document.querySelector("[data-forgot]") ||
    document.querySelector('a[href*="forgot"],a[href*="reset"]');

  if (forgotEl && !forgotEl.dataset.wired) {
    forgotEl.dataset.wired = "1";
    forgotEl.addEventListener("click", async (ev)=>{
      ev.preventDefault();
      const email = (document.getElementById("email")?.value || document.getElementById("login-email")?.value || "").trim();
      if(!email){ return err("Enter your email, then click Forgot password."); }
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: "https://arcade-addicts.com/change-password/"
      });
      if(error){ return err(error.message); }
      alert("Password reset email sent. Check your inbox (and spam).");
    });
  }

  // ---------------- change-password page ----------------
  const onChangePasswordPage = /\/change-password\/?(\.html)?$/i.test(location.pathname);
  if (!onChangePasswordPage) return;

  (async ()=>{
    // 1) Try to establish a session from URL (both new and legacy formats)
    try {
      const hash  = new URLSearchParams(location.hash.slice(1));
      const query = new URLSearchParams(location.search);

      // new code flow (email → redirectTo + ?code=...)
      const code = query.get("code") || hash.get("code");
      if (code) {
        const { error } = await supa.auth.exchangeCodeForSession({ code });
        if (error) err(error.message);
      }

      // legacy hash flow
      const at = hash.get("access_token");
      const rt = hash.get("refresh_token");
      if (at && rt) {
        const { error } = await supa.auth.setSession({ access_token: at, refresh_token: rt });
        if (error) err(error.message);
      }

      // if Supabase already appended an error in the hash, surface it
      const ecode = hash.get("error_code");
      if (ecode) {
        if (ecode === "otp_expired") {
          err("Reset link is invalid or expired. Click “Resend reset email” to get a fresh link.");
        } else {
          err(hash.get("error_description") || "Link error.");
        }
      }
    } catch(e) {
      err(e.message || String(e));
    }

    // 2) Also listen for PASSWORD_RECOVERY event; some providers prefetch links
    supa.auth.onAuthStateChange(async (event)=>{
      if (event === "PASSWORD_RECOVERY") {
        showMsg("info", "Session ready. Set your new password below.");
      }
    });

    // 3) Wire the password update form
    const form = document.getElementById("reset-form");
    if (form && !form.dataset.wired) {
      form.dataset.wired = "1";
      form.addEventListener("submit", async (ev)=>{
        ev.preventDefault();
        const newPass = document.getElementById("new-password")?.value || "";
        if (newPass.length < 6) return err("New password must be at least 6 characters.");
        const { data:{ user }, error: ge } = await supa.auth.getUser();
        if (ge || !user) return err("Open this page from the latest email link (or resend a new one).");
        const { error } = await supa.auth.updateUser({ password: newPass });
        if (error) return err(error.message);
        alert("Password updated. Log in now.");
        location.href = "https://arcade-addicts.com/login/";
      });
    }

    // 4) Resend reset email from the page if the link expired
    const resendBtn = document.getElementById("resend-reset");
    if (resendBtn && !resendBtn.dataset.wired) {
      resendBtn.dataset.wired = "1";
      resendBtn.addEventListener("click", async ()=>{
        const email = prompt("Enter the account email to send a fresh reset link:");
        if(!email) return;
        const { error } = await supa.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: "https://arcade-addicts.com/change-password/"
        });
        if (error) return err(error.message);
        alert("New reset email sent. Check your inbox.");
      });
    }
  })();
})();
