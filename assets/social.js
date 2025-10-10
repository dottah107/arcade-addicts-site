window.AA = {
  async getSession(){
    const { data:{ session } } = await supabase.auth.getSession();
    if (!session) { location.href = "/login/"; throw new Error("No session"); }
    return session;
  },

  // ---------- Uploads ----------
  async uploadContent(file, title=""){
    const { user:{ id } } = await this.getSession();
    const path = `${id}/${Date.now()}_${file.name}`;
    const up = await supabase.storage.from("user-content")
      .upload(path, file, { upsert:true, contentType: file.type || "application/octet-stream" });
    if (up.error) throw up.error;

    const db = await supabase.from("uploads").insert({ user_id:id, path, title });
    if (db.error) throw db.error;

    return supabase.storage.from("user-content").getPublicUrl(path).data.publicUrl;
  },

  async listMyUploads(){
    const { user:{ id } } = await this.getSession();
    const r = await supabase.from("uploads")
      .select("id,path,title,created_at")
      .eq("user_id", id)
      .order("created_at", { ascending:false });
    if (r.error) throw r.error;

    return r.data.map(row => ({
      ...row,
      url: supabase.storage.from("user-content").getPublicUrl(row.path).data.publicUrl
    }));
  },

  // ---------- Friends ----------
  async sendFriendRequestByEmail(email){
    const e = (email||"").trim().toLowerCase();
    if (!e) throw new Error("Email required");
    const q = await supabase.from("profiles").select("id").eq("email", e).limit(1);
    if (q.error) throw q.error;
    if (!q.data?.length) throw new Error("User not found");
    return this.sendFriendRequest(q.data[0].id);
  },

  async sendFriendRequest(recipientId){
    const { user:{ id } } = await this.getSession();
    if (recipientId === id) throw new Error("Can't friend yourself");
    const ins = await supabase.from("friend_requests").insert({ requester:id, recipient:recipientId });
    if (ins.error) throw ins.error;
    return true;
  },

  async listIncomingRequests(){
    const { user:{ id } } = await this.getSession();
    const r = await supabase.from("friend_requests")
      .select("id,requester,status,created_at")
      .eq("recipient", id).eq("status","pending")
      .order("created_at",{ ascending:false });
    if (r.error) throw r.error;
    return r.data;
  },

  async listOutgoingRequests(){
    const { user:{ id } } = await this.getSession();
    const r = await supabase.from("friend_requests")
      .select("id,recipient,status,created_at")
      .eq("requester", id)
      .order("created_at",{ ascending:false });
    if (r.error) throw r.error;
    return r.data;
  },

  async acceptRequest(id){
    const u = await supabase.from("friend_requests").update({ status:"accepted" }).eq("id", id);
    if (u.error) throw u.error;
  },

  async declineRequest(id){
    const u = await supabase.from("friend_requests").update({ status:"declined" }).eq("id", id);
    if (u.error) throw u.error;
  }
};
