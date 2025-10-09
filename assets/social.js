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
;(function(){
  // ===== Friends =====
  async function AA_session() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { location.href = "/login/"; throw new Error("No session"); }
    return session;
  }

  // Send by recipient email (uses profiles.email we populated)
  AA.sendFriendRequestByEmail = async function(email){
    const e = (email||"").trim().toLowerCase();
    if (!e) throw new Error("Email required");
    await AA_session();
    const { data: profs, error } = await supabase
      .from("profiles").select("id,email").eq("email", e).limit(1);
    if (error) throw error;
    if (!profs?.length) throw new Error("User not found");
    return AA.sendFriendRequest(profs[0].id);
  };

  // Direct by user_id
  AA.sendFriendRequest = async function(recipientId){
    const { data: { session } } = await supabase.auth.getSession();
    const requester = session.user.id;
    if (recipientId === requester) throw new Error("Can't friend yourself");
    const { error } = await supabase.from("friend_requests")
      .insert({ requester, recipient: recipientId });
    if (error) throw error;
    return true;
  };

  AA.listIncomingRequests = async function(){
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from("friend_requests")
      .select("id, requester, status, created_at")
      .eq("recipient", session.user.id)
      .eq("status","pending")
      .order("created_at",{ascending:false});
    if (error) throw error;
    return data;
  };

  AA.listOutgoingRequests = async function(){
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from("friend_requests")
      .select("id, recipient, status, created_at")
      .eq("requester", session.user.id)
      .order("created_at",{ascending:false});
    if (error) throw error;
    return data;
  };

  AA.acceptRequest = async function(id){
    const { error } = await supabase.from("friend_requests")
      .update({ status: "accepted" }).eq("id", id);
    if (error) throw error;
  };

  AA.declineRequest = async function(id){
    const { error } = await supabase.from("friend_requests")
      .update({ status: "declined" }).eq("id", id);
    if (error) throw error;
  };

  AA.cancelRequest = async function(id){
    const { error } = await supabase.from("friend_requests")
      .delete().eq("id", id);
    if (error) throw error;
  };

  AA.listFriends = async function(){
    const { data: { session } } = await supabase.auth.getSession();
    const me = session.user.id;
    const { data, error } = await supabase.from("friend_requests")
      .select("requester, recipient, status")
      .or(equester.eq.,recipient.eq.)
      .eq("status","accepted");
    if (error) throw error;
    return data.map(r => (r.requester === me ? r.recipient : r.requester));
  };
})();
