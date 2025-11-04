(function () {
  const supa = window.supabaseClient;
  const showError = (msg) => {
    const bar = document.getElementById("errbar");
    if (bar) {
      bar.textContent = msg;
      bar.style.display = "block";
    } else alert(msg);
  };
  const showOK = (msg) => {
    const bar = document.getElementById("okbar");
    if (bar) {
      bar.textContent = msg;
      bar.style.display = "block";
    } else alert(msg);
  };

  // ---- FORGOT PASSWORD ----
  const forgotBtn =
    document.getElementById("forgot-btn") ||
    document.getElementById("forgot") ||
    document.getElementById("forgot-password") ||
    document.querySelector("[data-forgot]") ||
    document.querySelector('a[href*="forgot"],a[href*="reset"]');

  if (forgotBtn && !forgotBtn.dataset.ready) {
    forgotBtn.dataset.ready = "1";
    forgotBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const email =
        (document.getElementById("email")?.value ||
          document.getElementById("login-email")?.value ||
          "").trim();
      if (!email) return showError("Enter your email before clicking reset.");

      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: "https://arcade-addicts.com/reset-password.html",
      });
      if (error) return showError(error.message);
      showOK("Check your email for a reset link to change your password.");
    });
  }

  // ---- RESET PASSWORD PAGE ----
  const isResetPage = /reset-password/i.test(location.pathname);
  if (isResetPage) {
    const form = document.getElementById("reset-form");
    if (form && !form.dataset.ready) {
      form.dataset.ready = "1";

      // handle Supabase token after clicking email link
      (async () => {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const access_token = hash.get("access_token");
        const refresh_token = hash.get("refresh_token");
        if (access_token && refresh_token) {
          await supa.auth.setSession({ access_token, refresh_token });
        }
      })();

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPass = document
          .getElementById("new-password")
          ?.value.trim();
        if (newPass.length < 6)
          return showError("Password must be at least 6 characters.");

        const { data, error: getErr } = await supa.auth.getUser();
        if (getErr || !data.user)
          return showError(
            "Session missing or expired. Please click the email link again."
          );

        const { error } = await supa.auth.updateUser({ password: newPass });
        if (error) return showError(error.message);

        showOK("Password updated successfully. You can now log in.");
        location.href = "/login/";
      });
    }
  }
})();

