(async function(){
  // Gate: must be logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace("/login.html"); return; }
  const user = session.user;

  // Ensure profile exists
  async function ensureProfile(){
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) { console.error(error); return; }
    if (!data) {
      await supabase.from("profiles").insert({
        id: user.id, username: user.email.split("@")[0], platform: ""
      });
    }
  }

  await ensureProfile();

  // Load & populate profile form
  async function loadProfile(){
    const { data, error } = await supabase
      .from("profiles")
      .select("username, platform")
      .eq("id", user.id)
      .single();
    if (!error && data) {
      document.getElementById("pf-username").value = data.username || "";
      document.getElementById("pf-platform").value = data.platform || "";
    }
  }
  await loadProfile();

  document.getElementById("profile-form")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const username = document.getElementById("pf-username").value.trim();
    const platform = document.getElementById("pf-platform").value.trim();
    const { error } = await supabase.from("profiles")
      .update({ username, platform })
      .eq("id", user.id);
    document.getElementById("pf-msg").textContent = error? error.message : "Profile saved.";
  });

  // Uploads
  const bucket = "user-content";
  document.getElementById("upload-form")?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const file = document.getElementById("upload-file").files[0];
    if (!file) return;

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    const out = document.getElementById("up-msg");
    if (upErr) { out.textContent = upErr.message; return; }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    const kind = file.type.startsWith("video/") ? "video" : "image";

    await supabase.from("uploads").insert({
      user_id: user.id, url: pub.publicUrl, kind, title: file.name
    });

    out.textContent = "Uploaded.";
    await renderUploads();
  });

  async function renderUploads(){
    const root = document.getElementById("my-uploads");
    root.innerHTML = "";
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return;

    const menuTpl = document.getElementById("upload-menu");

    for (const u of data) {
      const box = document.createElement("div");
      box.className = "thumb";
      const media = u.kind === "video"
        ? `<video src="${u.url}" muted></video>`
        : `<img src="${u.url}" alt="">`;
      box.innerHTML = media + menuTpl.innerHTML;

      // attach menu actions
      box.querySelectorAll("[data-action]").forEach(btn=>{
        btn.addEventListener("click", async ()=>{
          const action = btn.getAttribute("data-action");
          if (action === "set-profile") {
            await supabase.from("profiles").update({ avatar_url: u.url }).eq("id", user.id);
          } else if (action === "set-background") {
            await supabase.from("profiles").update({ banner_url: u.url }).eq("id", user.id);
          } else if (action === "post-activity") {
            await supabase.from("activity").insert({
              user_id: user.id, kind: "upload", content_url: u.url, text: u.title
            });
          } else if (action === "delete") {
            await supabase.from("uploads").delete().eq("id", u.id);
            // also remove from activity that references this url
            await supabase.from("activity").delete().eq("content_url", u.url).eq("user_id", user.id);
          }
          await renderUploads();
        });
      });

      root.appendChild(box);
    }
  }
  await renderUploads();

})();
