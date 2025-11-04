(function(){
  const supa = window.supabaseClient;
  const err = (m)=>{ const e=document.getElementById("errbar"); if(e){e.textContent=m; e.style.display="block";} else alert(m); };

  // --- Forgot password -> send Magic Link to change-password ---
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

      // Send magic link that lands on change-password
      const { error } = await supa.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: "https://arcade-addicts.com/change-password/" }
      });
      if(error) return err(error.message);
      alert("Check your email for a secure sign-in link. After you click it, you can set a new password on this page.");
    });
  }

  // --- change-password page: update password if user has a session ---
  const onChange = /\/change-password\/?(\.html)?$/i.test(location.pathname);
  if (onChange) {
    const form = document.getElementById("reset-form");
    if (form && !form.dataset.wired) {
      form.dataset.wired = "1";
      form.addEventListener("submit", async (ev)=>{
        ev.preventDefault();
        const newPass = document.getElementById("new-password")?.value || "";
        if(newPass.length < 6) return err("New password must be at least 6 characters.");
        const { data:{ user }, error: ge } = await supa.auth.getUser();
        if (ge || !user) return err("Open this page from the email link first, then set your new password.");
        const { error } = await supa.auth.updateUser({ password: newPass });
        if (error) return err(error.message);
        alert("Password updated. Log in now.");
        location.href = "https://arcade-addicts.com/login/";
      });
    }
  }
})();
