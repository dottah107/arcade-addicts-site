(() => {
  const sb = window.supabaseClient;
  const $ = (s)=>document.querySelector(s);
  const show = (id, m)=>{const el=document.getElementById(id); if(el){el.textContent=m; el.style.display="block";} else alert(m);};
  const ok  = (m)=>show("okbar", m);
  const err = (m)=>show("errbar", m);

  // ---- Forgot Password: send a real reset email (NO navigation) ----
  const forgotBtn =
    $("#forgot-btn") || $("#forgot") || $("#forgot-password") ||
    document.querySelector("[data-forgot]") ||
    document.querySelector('a[href*="forgot"],a[href*="reset"]');

  if (forgotBtn && !forgotBtn.dataset.wired) {
    forgotBtn.dataset.wired = "1";
    forgotBtn.addEventListener("click", async (e) => {
      // stop any link navigation
      e.preventDefault(); e.stopPropagation();

      const email = (
        $("#email")?.value ||
        $("#login-email")?.value ||
        $("#reg-email")?.value ||
        ""
      ).trim();

      if (!email) return err("Enter your email first, then click Forgot Password.");

      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: "https://arcade-addicts.com/reset-password.html"
      });
      if (error) return err(error.message);

      ok("Check your email for a password reset link.");
    });
  }

  // ---- Reset page: update password after clicking the email link ----
  const onReset = /\/reset-password(\.html)?$/i.test(location.pathname);
  if (onReset) {
    const form = document.getElementById("reset-form");
    if (form && !form.dataset.wired) {
      form.dataset.wired = "1";
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPass = (document.getElementById("new-password")?.value || "").trim();
        if (newPass.length < 6) return err("Password must be at least 6 characters.");

        const { data: { user }, error: ge } = await sb.auth.getUser();
        if (ge || !user) return err("Open this page from the reset email link, then try again.");

        const { error } = await sb.auth.updateUser({ password: newPass });
        if (error) return err(error.message);

        ok("Password updated. Redirecting to login…");
        setTimeout(()=>{ location.href="/login/"; }, 900);
      });
    }
  }
})();
