(function(){
  const supa = window.supabaseClient;
  const errbar = (msg)=>{ const e=document.getElementById("errbar"); if(e){e.textContent=msg; e.style.display="block";}};
  // login
  const lf = document.getElementById("login-form");
  if(lf){ lf.addEventListener("submit", async (ev)=>{
      ev.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const { error } = await supa.auth.signInWithPassword({ email, password });
      if(error) return errbar(error.message);
      location.href = "members.html";
  });}
  // register
  const rf = document.getElementById("register-form");
  if(rf){ rf.addEventListener("submit", async (ev)=>{
      ev.preventDefault();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const { error } = await supa.auth.signUp({ email, password, options:{ emailRedirectTo: "https://arcade-addicts.com/login/" }});
      if(error) return errbar(error.message);
      alert("Check your email to confirm your account, then log in.");
      location.href = "login.html";
  });}
  // reset-password
  const rs = document.getElementById("reset-form");
  if(rs){ rs.addEventListener("submit", async (ev)=>{
      ev.preventDefault();
      const newPass = document.getElementById("new-password").value;
      const { data:{ user }, error:ue } = await supa.auth.getUser();
      if(ue || !user) return errbar("Open this page from your email link after requesting reset.");
      const { error } = await supa.auth.updateUser({ password: newPass });
      if(error) return errbar(error.message);
      alert("Password updated. Log in now."); location.href="login.html";
  });}
})();
