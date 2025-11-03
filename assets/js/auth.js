(async function(){
  // Redirect logged-in users away from auth pages to /members.html
  const { data: { session } } = await supabase.auth.getSession();
  const path = location.pathname;

  const onAuthPage = /login\.html$|register\.html$|reset-password\.html$/.test(path);
  if (session && onAuthPage) {
    location.replace("/members.html");
    return;
  }

  // LOGIN
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const out = document.getElementById("login-msg");
      out.textContent = "Signing in...";
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { out.textContent = error.message; return; }
      location.href = "/members.html";
    });
  }

  #region REGISTER
  const regForm = document.getElementById("register-form");
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const out = document.getElementById("reg-msg");
      out.textContent = "Creating account...";
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: "https://arcade-addicts.com/login.html"
        }
      });
      if (error) { out.textContent = error.message; return; }
      out.textContent = "Check your email to verify, then log in.";
    });
  }
  #endregion

  // RESET (request email)
  // We expose this via link on login page to /reset-password.html
  // That page also handles updating the password after the email link.
  if (path.endsWith("/login.html")) {
    // nothing else; button links to /reset-password.html
  }

  // CHANGE PASSWORD page (after email link)
  const changeForm = document.getElementById("change-pass-form");
  if (changeForm) {
    changeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPass = document.getElementById("new-pass").value;
      const out = document.getElementById("change-msg");
      out.textContent = "Updating password...";
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        out.textContent = "No active session. Use the email link or log in.";
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) { out.textContent = error.message; return; }
      out.textContent = "Password updated. You can close this tab and log in.";
    });
  }

  // Utility to request a reset email from anywhere:
  window.requestPasswordReset = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://arcade-addicts.com/reset-password.html"
    });
  };

})();
