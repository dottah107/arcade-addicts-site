(function(){
  if (!window.supabase) { console.error("Supabase not initialized"); return; }

  async function getSessionOrKick(){
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { location.href = "/login/"; throw new Error("No session"); }
    return session;
  }

  // ===== Uploads =====
  async function uploadContent(file, title){
    const { user } = (await getSessionOrKick()).session;
    const path = ${user.id}/_;
    const { error: upErr } = await supabase.storage.from("user-content").upload(path, file, {
      upsert: true, contentType: file.type || "application/octet-stream"
    });
    if (upErr) throw upErr;

    const { error: dbErr } = await supabase.from("uploads").insert({ user_id: user.id, path, title: title||null });
    if (dbErr) throw dbErr;

    const { data } = supabase.storage.from("user-content").getPublicUrl(path); // if private, switch to createSignedUrl
    return { path, url: data.publicUrl };
  }

  async function listMyUploads(){
    const { user } = (await getSessionOrKick()).session;
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(r => ({
      ...r,
      url: supabase.storage.from("user-content").getPublicUrl(r.path).data.publicUrl
    }));
  }

  // ===== Friends =====
  async function sendFriendRequestByEmail(email){
    const sess = await getSessionOrKick();
    const me = sess.session.user.id;
    const clean = (email||"").trim().toLowerCase();
    if (!clean) throw new Error("Email required");

    // Lookup recipient by profiles.email
    const { data: recs, error: perr } = await supabase
      .from("profiles")
      .select("id,email")
      .eq("email", clean)
      .limit(1);
    if (perr || !recs || !recs.length) throw new Error("User not found");
    const recipient = recs[0].id;
    if (recipient === me) throw new Error("You can't friend yourself");

    const { error } = await supabase.from("friend_requests").insert({ requester: me, recipient });
    if (error && (error.code !== "23505")) { // ignore unique violation duplicate
      throw error;
    }
    return true;
  }

  async function listIncoming(){
    const { session } = await getSessionOrKick();
    const { data, error } = await supabase
      .from("friend_requests")
      .select("id, requester, status, created_at, profiles!friend_requests_requester_fkey(id,email,display_name)")
      .eq("recipient", session.user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async function listOutgoing(){
    const { session } = await getSessionOrKick();
    const { data, error } = await supabase
      .from("friend_requests")
      .select("id, recipient, status, created_at, profiles!friend_requests_recipient_fkey(id,email,display_name)")
      .eq("requester", session.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async function acceptRequest(id){
    const { error } = await supabase.from("friend_requests").update({ status: "accepted" }).eq("id", id);
    if (error) throw error;
  }
  async function declineRequest(id){
    const { error } = await supabase.from("friend_requests").update({ status: "declined" }).eq("id", id);
    if (error) throw error;
  }
  async function cancelRequest(id){
    const { error } = await supabase.from("friend_requests").delete().eq("id", id);
    if (error) throw error;
  }

  // ===== Minimal UI wiring on /member/ =====
  async function renderUploads(){
    try{
      const items = await listMyUploads();
      const ul = document.getElementById("myUploads");
      if (!ul) return;
      ul.innerHTML = "";
      for (const it of items){
        const li = document.createElement("li");
        li.innerHTML = \<a href="\" target="_blank" rel="noopener">\</a>\;
        ul.appendChild(li);
      }
    }catch(e){ console.error(e); }
  }

  async function renderIncoming(){
    try{
      const list = await listIncoming();
      const ul = document.getElementById("incoming");
      if (!ul) return;
      ul.innerHTML = "";
      for (const fr of list){
        const li = document.createElement("li");
        li.textContent = \From: \\;
        const a = document.createElement("button"); a.textContent = "Accept";
        const d = document.createElement("button"); d.textContent = "Decline";
        a.onclick = async ()=>{ await acceptRequest(fr.id); renderIncoming(); };
        d.onclick = async ()=>{ await declineRequest(fr.id); renderIncoming(); };
        li.append(" ", a, " ", d);
        ul.appendChild(li);
      }
    }catch(e){ console.error(e); }
  }

  async function renderOutgoing(){
    try{
      const list = await listOutgoing();
      const ul = document.getElementById("outgoing");
      if (!ul) return;
      ul.innerHTML = "";
      for (const fr of list){
        const li = document.createElement("li");
        li.textContent = \To: \ (\)\;
        if (fr.status === "pending"){
          const c = document.createElement("button"); c.textContent = "Cancel";
          c.onclick = async ()=>{ await cancelRequest(fr.id); renderOutgoing(); };
          li.append(" ", c);
        }
        ul.appendChild(li);
      }
    }catch(e){ console.error(e); }
  }

  function bindUI(){
    const upBtn = document.getElementById("upBtn");
    upBtn?.addEventListener("click", async ()=>{
      const file = document.getElementById("upFile").files[0];
      if (!file) return alert("Choose a file first");
      const title = document.getElementById("upTitle").value;
      const status = document.getElementById("upStatus");
      status.textContent = "Uploading...";
      try { await uploadContent(file, title); status.textContent = "Uploaded!"; await renderUploads(); }
      catch(e){ console.error(e); status.textContent = ""; alert(e.message || "Upload failed"); }
    });

    document.getElementById("sendReq")?.addEventListener("click", async ()=>{
      const email = document.getElementById("friendEmail").value;
      if (!email) return alert("Enter friend's email");
      try { await sendFriendRequestByEmail(email); alert("Request sent"); await renderOutgoing(); }
      catch(e){ alert(e.message || "Could not send request"); }
    });
  }

  document.addEventListener("DOMContentLoaded", async ()=>{
    // guard /member
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { location.href = "/login/"; return; }

    bindUI();
    renderUploads();
    renderIncoming();
    renderOutgoing();

    // simple logout hook (optional)
    document.getElementById("logoutBtn")?.addEventListener("click", async ()=>{
      await supabase.auth.signOut(); location.href = "/login/";
    });
  });
})();
