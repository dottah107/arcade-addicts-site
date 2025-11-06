(() => {
  const sb = window.supabaseClient;
  if (!sb) return;

  // Which pages require login?
  const protectedPaths = [
    /\/members/i,
    /\/account/i,
    /\/friends/i,
    /\/tournaments/i,
    /\/aaalounge/i,
    /\/lounge/i,
    /\/pay/i
  ];

  const needsAuth = protectedPaths.some((re) => re.test(location.pathname));
  if (needsAuth) {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) location.href = "/login/";
    })();
  }

  // Optional logout link handler
  const logoutEl = document.getElementById("logout");
  if (logoutEl && !logoutEl.dataset.wired) {
    logoutEl.dataset.wired = "1";
    logoutEl.addEventListener("click", async (e) => {
      e.preventDefault();
      await sb.auth.signOut();
      location.href = "/login/";
    });
  }
})();
