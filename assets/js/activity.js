(async function(){
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace("/login.html"); return; }
  const user = session.user;

  // load own profile (avatar/banner/username/platform)
  const { data: prof } = await supabase
    .from("profiles")
    .select("username, platform, avatar_url, banner_url")
    .eq("id", user.id).single();

  if (prof) {
    document.getElementById("member-username").textContent = prof.username || "@member";
    document.getElementById("member-platform").textContent = prof.platform || "";
    if (prof.avatar_url) document.getElementById("avatar").style.backgroundImage = `url('${prof.avatar_url}')`;
    if (prof.banner_url) document.getElementById("banner-img").style.backgroundImage = `url('${prof.banner_url}')`;
  }

  // friends list (accepted)
  const { data: friends } = await supabase.rpc("get_friends_ids", { p_user_id: user.id });

  const ids = new Set([user.id, ...(friends||[])]);

  // recent activity by self + friends
  const { data: feed } = await supabase
    .from("activity_view")    /* view joins usernames */
    .select("*")
    .lte("created_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(100);

  const filtered = (feed||[]).filter(x => ids.has(x.user_id));
  const root = document.getElementById("activity-feed");
  root.innerHTML = "";

  for (const item of filtered) {
    const div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `
      <div class="meta">${item.username} — ${new Date(item.created_at).toLocaleString()}</div>
      ${item.content_url ? (item.kind==="upload" && item.content_url.match(/\.mp4|\.webm/i) ? `<video src="${item.content_url}" controls></video>` : `<img src="${item.content_url}" style="max-width:100%;border-radius:12px;" />`) : ""}
      ${item.text ? `<p>${item.text}</p>` : ""}
    `;
    root.appendChild(div);
  }
})();
