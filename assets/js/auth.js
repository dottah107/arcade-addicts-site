(function(){
  const supa = window.supabaseClient;
  const show = (id, msg)=>{const el=document.getElementById(id); if(el){el.textContent=msg; el.style.display="block";}};
  const err = (m)=> show("errbar", m);

  // ---------- FORGOT PASSWORD: send email only ----------
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
      if(!email) return err("Enter your email, then click Forgot password.");
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: "https://arcade-addicts.com/change-password/"
      });
      if(error) return err(error.message);
      alert("Password reset email sent. Check your inbox (and spam).");
    });
  }

  // ---------- CHANGE-PASSWORD PAGE HANDLER ----------
  const onChangePasswordPage =
    /\/change-password\/?(\.html)?$/i.test(location.pathname);

  if (onChangePasswordPage) {
    (async () => {
      // 1) Turn URL fragments into a session if present
      const hash = new URLSearchParams(location.hash.slice(1));
      const query = new URLSearchParams(location.search);

      try {
        // v2 magic link (code=...)
        const code = query.get("code") || hash.get("code");
        if (code) {
          const { error } = await supa.auth.exchangeCodeForSession({ code });
          if (error) err(error.message);
        }

        // legacy style returns access/refresh in hash
        const at = hash.get("access_token");
        const rt = hash.get("refresh_token");
        if (at && rt) {
          const { error } = await supa.auth.setSession({ access_token: at, refresh_token: rt });
          if (error) err(error.message);
        }

        // if Supabase redirected with error in hash, surface it nicely
        const ecode = hash.get("error_code");
        if (ecode) {
          if (ecode === "otp_expired") {
            err("Reset link is invalid or expired. Click “Forgot password” again to get a new email.");
          } else {
            err(hash.get("error_description") || "Link error.");
          }
        }
      } catch (e) {
        err(e.message || String(e));
      }

      // 2) Handle the actual password update form
      const form = document.getElementById("reset-form");
      if (form && !form.dataset.wired) {
        form.dataset.wired = "1";
        form.addEventListener("submit", async (ev)=>{
          ev.preventDefault();
          const newPass = document.getElementById("new-password")?.value || "";
          if(newPass.length < 6) return err("New password must be at least 6 characters.");
          const { data:{ user }, error: ge } = await supa.auth.getUser();
          if(ge || !user) return err("Open this page from the email link (or request a new link).");
          const { error } = await supa.auth.updateUser({ password: newPass });
          if(error) return err(error.message);
          alert("Password updated. Log in now.");
          location.href = "https://arcade-addicts.com/login/";
        });
      }
    })();
  }
})();
