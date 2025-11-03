(function(){
  const el = document.getElementById("aa-header");
  if (!el) return;
  el.innerHTML = `
    <nav class="header-bar">
      <a href="/index.html">Home</a>
      <a href="/members.html">Dashboard</a>
      <a href="/friends.html">Friends</a>
      <a href="/account.html">Account</a>
      <a href="/tournaments.html">Tournaments</a>
      <a href="/aaalounge.html">AAALounge</a>
      <a href="/pay.html">Pay</a>
      <button id="aa-logout" class="btn secondary" style="padding:6px 10px">Logout</button>
    </nav>
  `;
  const logoutBtn = document.getElementById("aa-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login.html";
  });
})();
