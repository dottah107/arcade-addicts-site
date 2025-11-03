(async function(){
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace("/login.html"); return; }
  const user = session.user;

  // fetch username
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  const username = profile?.username || user.email;

  const msgsRoot = document.getElementById("lounge-messages");
  async function loadRecent() {
    const { data } = await supabase
      .from("lounge_messages_view") /* includes username */
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    msgsRoot.innerHTML = "";
    for (const m of (data||[]).reverse()) appendMsg(m.username, m.text, m.created_at);
  }
  function appendMsg(u, t, ts){
    const div = document.createElement("div"); div.className = "feed-item";
    div.innerHTML = `<div class="meta">@${u} — ${new Date(ts).toLocaleString()}</div><p>${t}</p>`;
    msgsRoot.appendChild(div);
    msgsRoot.scrollTop = msgsRoot.scrollHeight;
  }

  await loadRecent();

  // insert
  const form = document.getElementById("lounge-form");
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const text = document.getElementById("lounge-text").value.trim();
    if (!text) return;
    await supabase.from("lounge_messages").insert({ user_id: user.id, text });
    document.getElementById("lounge-text").value = "";
  });

  // realtime subscribe
  supabase.channel("lounge")
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "lounge_messages" },
      async (payload) => {
        const row = payload.new;
        // get username via view for consistency
        const { data } = await supabase
          .from("profiles").select("username").eq("id", row.user_id).single();
        appendMsg(data?.username || "user", row.text, row.created_at);
      }
    ).subscribe();
})();
