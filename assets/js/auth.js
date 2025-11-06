// =========================
// Arcade Addicts Auth Logic
// =========================
(function () {
  const supa = window.supabaseClient;
  const err = (m) => {
    const e = document.getElementById("errbar");
    if (e) { e.textContent = m; e.style.display = "block"; }
    else alert(m);
  };
  const ok = (m) => {
    const e = document.getElementById("okbar");
    if (e) { e.textContent = m; e.style.display = "block"; }
    else alert(m);
  };

  // ---------- LOGIN ----------
  const form = document.getElementById("login-form");
  if (form && !form.dataset.wired) {
    form.dataset.wired = "1";
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const email = (document.getElementById("email")?.value || "").trim();
      const password = document.getElementById("password")?.value || "";

      if (!email || !password) return err("Enter your email and password.");

      try {
        await supa.auth.signOut(); // clear old sessions
        const { data, error } = await supa.auth.signInWithPassword({ email, password });

        if (error) {
          if (/confirm/i.test(error.message)) return err("Please confirm your email first.");
          return err(error.message);
        }

        ok("Login successful! Redirecting...");
        setTimeout(() => location.href = "/members.html", 800);
      } catch (e) {
        err(e?.message || "Unexpected error.");
      }
    });
  }

  // ---------- FORGOT PASSWORD ----------
  const forgotEl =
    document.getElementById("forgot-password") ||
    document.querySelector("[data-forgot]");

  if (forgotEl && !forgotEl.dataset.wired) {
    forgotEl.dataset.wired = "1";
    forgotEl.addEventListener("click", async (ev) => {
      ev.preventDefault();
      const email = (document.getElementById("email")?.value || "").trim();
      if (!email) return err("Enter your email, then click Forgot Password.");

      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: "https://arcade-addicts.com/reset-password.html"
      });

      if (error) return err(error.message);
      ok("Check your email for a reset link to set a new password.");
    });
  }

  // ---------- RESET PASSWORD PAGE ----------
  const onReset = /\/reset-password/i.test(location.pathname);
  if (onReset) {
    const resetForm = document.getElementById("reset-form");
    if (resetForm && !resetForm.dataset.wired) {
      resetForm.dataset.wired = "1";
      resetForm.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const newPass = document.getElementById("new-password")?.value || "";
        if (newPass.length < 6) return err("Password must be at least 6 characters.");

        const { data: { user }, error: getErr } = await supa.auth.getUser();
        if (getErr || !user) return err("Open this page from your email link.");

        const { error } = await supa.auth.updateUser({ password: newPass });
        if (error) return err(error.message);

        ok("Password updated. You can now log in.");
        setTimeout(() => location.href = "/login.html", 1200);
      });
    }
  }

  // ---------- LOGOUT (for protected pages) ----------
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn && !logoutBtn.dataset.wired) {
    logoutBtn.dataset.wired = "1";
    logoutBtn.addEventListener("click", async (ev) => {
      ev.preventDefault();
      await supa.auth.signOut();
      location.href = "/login.html";
    });
  }
})();
