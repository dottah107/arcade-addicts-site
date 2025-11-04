(() => {
  // We expect window.supabaseClient to be created by assets/js/supabase-init.js
  const sb = window.supabaseClient;
  if (!sb) {
    console.warn("supabaseClient not found. Check supabase-init.js include order.");
    return;
  }

  const $ = (sel) => document.querySelector(sel);
  const show = (id, msg) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg || ""; el.style.display = "block"; }
  };
  const hide = (id) => { const el = document.getElementById(id); if (el) el.style.display = "none"; };
  const err = (m) => show("errbar", m);
  const ok  = (m) => show("okbar",  m);

  // ---------- FORGOT PASSWORD: send a reset email (NOT a login magic link) ----------
  // Looks for common buttons/links on your login page.
  const forgotEl =
    $("#forgot-btn") ||
    $("#forgot") ||
    $("#forgot-password") ||
    document.querySelector("[data-forgot]") ||
    document.querySelector('a[href*="forgot"],a[href*="reset"]');

  if (forgotEl && !forgotEl.dataset.wired) {
    forgotEl.dataset.wired = "1";
    forgotEl.addEventListener("click", async (ev) => {
      ev.preventDefault();
      hide("errbar"); hide("okbar");

      // Try typical email inputs on your login page
      const email =
        ($("#email") && $("#email").value) ||
        ($("#login-email") && $("#login-email").value) ||
        ($("#reg-email") && $("#reg-email").value) ||
        "";

      if (!email.trim()) return err("Enter your email, then click Forgot password.");

      // Send the Supabase **password reset** email (not magic-link login)
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "https://arcade-addicts.com/reset-password.html",
      });
      if (error) return err(error.message);

      ok("Check your email for the reset link. Open it and you'll be returned here to set a new password.");
      alert("Check your email for the reset link.");
    });
  }

  // ---------- RESET PAGE: /reset-password.html ----------
  const onReset = /\/reset-password(\.html)?$/i.test(location.pathname);
  if (onReset) {
    // If the user arrived via the emailed link, Supabase will attach a recovery session.
    // We listen just in case, but we also try getUser() on submit.
    sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        ok("Recovery session detected. You can set a new password.");
      }
    });

    const form = document.getElementById("reset-form");
    if (form && !form.dataset.wired) {
      form.dataset.wired = "1";
      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        hide("errbar"); hide("okbar");

        const newPassEl = document.getElementById("new-password");
        const newPass = (newPassEl && newPassEl.value) || "";
        if (newPass.length < 6) return err("New password must be at least 6 characters.");

        // Must have a user session created by the recovery link
        const { data: { user }, error: ge } = await sb.auth.getUser();
        if (ge) return err(ge.message);
        if (!user) return err("Open this page from the reset email link, then set your new password.");

        const { error: ue } = await sb.auth.updateUser({ password: newPass });
        if (ue) return err(ue.message);

        ok("Password updated. Redirecting to login…");
        setTimeout(() => { location.href = "https://arcade-addicts.com/login/"; }, 800);
      });
    }
  }
})();
