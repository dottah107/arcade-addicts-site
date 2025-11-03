(async function(){
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace("/login.html"); return; }
  const user = session.user;

  // Ensure profile to search by username
  await supabase.from("profiles").upsert({ id: user.id, username: user.email.split("@")[0] }, { onConflict: "id" });

  async function render() {
    await renderRequests();
    await renderFriends();
    await renderMembers();
  }

  async function renderRequests(){
    const root = document.getElementById("requests");
    root.innerHTML = "";
    const { data } = await supabase
      .from("friendships_view") /* view provides usernames */
      .select("*")
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    for (const r of (data||[])) {
      const row = document.createElement("div");
      row.className = "feed-item";
      row.innerHTML = `
        <div class="meta">@${r.requester_username} wants to connect</div>
        <div class="row">
          <button class="btn" data-act="accept" data-id="${r.id}">Accept</button>
          <button class="btn danger" data-act="decline" data-id="${r.id}">Decline</button>
        </div>
      `;
      root.appendChild(row);
    }

    root.querySelectorAll("[data-act]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const id = btn.getAttribute("data-id");
        const act = btn.getAttribute("data-act");
        if (act === "accept") {
          await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
        } else {
          await supabase.from("friendships").delete().eq("id", id);
        }
        await renderRequests();
        await renderFriends();
      });
    });
  }

  async function renderFriends(){
    const root = document.getElementById("friends");
    root.innerHTML = "";
    const { data } = await supabase
      .from("friends_of_user_view")
      .select("*")
      .eq("user_id", user.id);
    for (const f of (data||[])) {
      const row = document.createElement("div");
      row.className = "feed-item";
      row.innerHTML = `<div class="meta">@${f.username}</div>`;
      root.appendChild(row);
    }
  }

  async function renderMembers(){
    const root = document.getElementById("all-members");
    root.innerHTML = "";
    const q = document.getElementById("search").value?.toLowerCase() || "";
    let query = supabase.from("profiles").select("id, username").order("username");
    if (q) query = query.ilike("username", `%${q}%`);
    const { data } = await query.limit(100);
    for (const m of (data||[])) {
      if (m.id === user.id) continue;
      const row = document.createElement("div");
      row.className = "feed-item";
      row.innerHTML = `
        <div class="meta">@${m.username}</div>
        <button class="btn" data-send="${m.id}">Add Friend</button>
      `;
      root.appendChild(row);
    }
    root.querySelectorAll("[data-send]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const addressee = btn.getAttribute("data-send");
        await supabase.from("friendships").insert({
          requester_id: user.id,
          addressee_id: addressee,
          status: "pending"
        });
        alert("Request sent.");
      });
    });
  }

  document.getElementById("search")?.addEventListener("input", render);
  await render();
})();
