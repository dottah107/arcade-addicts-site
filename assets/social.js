window.AA = (() => {
  async function sessionOrKick() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { location.href = "/login/"; throw new Error("No session"); }
    return session;
  }

  // Save a file to Storage bucket user-content and record it in uploads
  async function uploadContent(file, title = "") {
    await sessionOrKick();
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session.user.id;

    const path = ${uid}/_;
    const { error: upErr } = await supabase.storage
      .from("user-content")
      .upload(path, file, { upsert: true, contentType: file.type || "application/octet-stream" });
    if (upErr) throw upErr;

    const { error: dbErr } = await supabase.from("uploads").insert({ user_id: uid, path, title });
    if (dbErr) throw dbErr;

    const { data } = supabase.storage.from("user-content").getPublicUrl(path);
    return { path, url: data.publicUrl, title };
  }

  // List my uploads with public URLs
  async function listMyUploads() {
    await sessionOrKick();
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session.user.id;

    const { data, error } = await supabase
      .from("uploads")
      .select("id, path, title, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return data.map(r => ({
      ...r,
      url: supabase.storage.from("user-content").getPublicUrl(r.path).data.publicUrl
    }));
  }

  return { uploadContent, listMyUploads };
})();
