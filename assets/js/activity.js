(async function(){
  const supa = window.supabaseClient;
  const feed = document.getElementById("feed"); if(!feed) return;
  const { data:{ user } } = await supa.auth.getUser(); if(!user){location.href="login.html";return;}
  const { data, error } = await supa.from("activity_feed").select("*").order("created_at",{ascending:false}).limit(20);
  feed.innerHTML = (error || !data?.length) ? `<div class="body mono">No recent activity yet.</div>` :
    data.map(r=>`<div class="feed-item"><div class="mono">${new Date(r.created_at).toLocaleString()}</div><div>${r.text||''}</div></div>`).join("");
})();
