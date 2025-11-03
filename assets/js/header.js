window.addEventListener("DOMContentLoaded", async () => {
  const supa = window.supabaseClient;
  const { data:{ user } } = await supa.auth.getUser();
  const el = document.getElementById("site-header"); if(!el) return;
  const is = (f) => location.pathname.endsWith(f);
  el.innerHTML = `
  <header class="header">
    <div class="nav container">
      <a class="brand" href="index.html"><span class="dot"></span>Arcade Addicts</a>
      <nav class="row">
        <a class="${is('index.html')?'active':''}" href="index.html">Home</a>
        <a class="${is('members.html')?'active':''}" href="members.html">Dashboard</a>
        <a class="${is('tournaments.html')?'active':''}" href="tournaments.html">Tournaments</a>
        <a class="${is('friends.html')?'active':''}" href="friends.html">Friends</a>
        <a class="${is('account.html')?'active':''}" href="account.html">Account</a>
        <a class="${is('aaalounge.html')?'active':''}" href="aaalounge.html">AAALounge</a>
        <a class="${is('pay.html')?'active':''}" href="pay.html">Pay</a>
        ${user ? `<button id="logout" class="btn">Logout</button>` : `<a class="btn" href="login.html">Login</a>`}
      </nav>
    </div>
  </header>`;
  document.getElementById("logout")?.addEventListener("click", async () => {
    await supa.auth.signOut(); location.href = "login.html";
  });
});
