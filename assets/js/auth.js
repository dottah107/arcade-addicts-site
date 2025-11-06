(() => {
  const sb = window.supabaseClient;
  const $  = (s)=>document.querySelector(s);
  const show = (id, m)=>{const el=document.getElementById(id); if(el){el.textContent=m; el.style.display="block";} else alert(m);};
  const ok  = (m)=>show("okbar", m);
  const err = (m)=>show("errbar", m);

  // ------------------ LOGIN (email + password) ------------------
  const loginForm = document.getElementById("login-form") || document.querySelector("form[data-login]");
  if (loginForm && !loginForm.dataset.wired) {
    loginForm.dataset.wired = "1";
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = ($("#login-email")?.value || $("#email")?.value || "").trim();
      const password = ($("#password")?.value || "").trim();
      if (!email || !password) return err("Enter email and password.");

      const { error } = await sb.auth.signInWithPassword({ email, password });
<<<<<<< HEAD
      if (error) return err(error.message || "Login failed.");
      ok("Welcome back!");
=======
      if (error) {
        // Common messages: Invalid login credentials, Email not confirmed, etc.
        return err(error.message || "Login failed.");
      }
      ok("Welcome back!");
      // go to your members/dashboard page
>>>>>>> 7e67c1f (Inject guard.js + logout link to protected pages)
      location.href = "/members/";
    });
  }

  // --------------- FORGOT PASSWORD: send reset email ---------------
  const forgotBtn =
    $("#forgot-btn") || $("#forgot") || $("#forgot-password") ||
    document.querySelector("[data-forgot]") ||
    document.querySelector('a[href*="forgot"],a[href*="reset"]');

  if (forgotBtn && !forgotBtn.dataset.wired) {
    forgotBtn.dataset.wired = "1";
    forgotBtn.addEventListener("click", async (e) => {
      e.preventDefault(); e.stopPropagation();
      const email = ($("#email")?.value || $("#login-email")?.value || $("#reg-email")?.value || "").trim();
      if (!email) return err("Enter your email first, then click Forgot Password.");

      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: "https://arcade-addicts.com/reset-password.html"
      });
      if (error) return err(error.message);
      ok("Check your email for a password reset link.");
    });
  }

  // ---------------- RESET PAGE: update password ----------------
  const onReset = /\/reset-password(\.html)?$/i.test(location.pathname);
  if (onReset) {
    const form = document.getElementById("reset-form");
    if (form && !form.dataset.wired) {
      form.dataset.wired = "1";
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPass = (document.getElementById("new-password")?.value || "").trim();
        if (newPass.length < 6) return err("Password must be at least 6 characters.");

        const { data:{ user }, error: ge } = await sb.auth.getUser();
        if (ge || !user) return err("Open this page from the reset email link, then try again.");

        const { error } = await sb.auth.updateUser({ password: newPass });
        if (error) return err(error.message);

        ok("Password updated. Redirecting to login…");
        setTimeout(()=>{ location.href="/login/"; }, 900);
      });
    }
  }
})();
