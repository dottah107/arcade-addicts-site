(function(){
  const supa = window.supabaseClient;
  const errbar = (msg)=>{ const e=document.getElementById("errbar"); if(e){e.textContent=msg; e.style.display="block";} else {alert(msg);} };

  // bind to your existing "Forgot password" link/button
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
      try {
        // use the email already typed on the login form
        const emailInput = document.getElementById("email") || document.getElementById("login-email");
        const email = (emailInput?.value || "").trim();
        if(!email) return errbar("Enter your email, then click Forgot password.");

        // IMPORTANT: this is where we force the redirect page from the email
        const { error } = await supa.auth.resetPasswordForEmail(email, {
          redirectTo: "https://arcade-addicts.com/change-password/"
        });
        if (error) return errbar(error.message);

        alert("Password reset email sent. Check your inbox (and spam).");
      } catch (e) {
        errbar(e.message || String(e));
      }
    });
  }

  // change-password page handler (user lands here from email)
  const resetForm = document.getElementById("reset-form");
  if(resetForm){
    resetForm.addEventListener("submit", async (ev)=>{
      ev.preventDefault();
      const newPass = document.getElementById("new-password")?.value || "";
      if(newPass.length < 6) return errbar("New password must be at least 6 characters.");
      const { data:{ user }, error: ge } = await supa.auth.getUser();
      if(ge || !user) return errbar("Open this page from the email link to reset your password.");
      const { error } = await supa.auth.updateUser({ password: newPass });
      if(error) return errbar(error.message);
      alert("Password updated. Log in now."); location.href="https://arcade-addicts.com/login/";
    });
  }
})();
