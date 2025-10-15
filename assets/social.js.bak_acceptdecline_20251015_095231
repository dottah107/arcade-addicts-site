/* social.js — v2 names patch */
window.AA = window.AA || {};
AA._profileCache = AA._profileCache || new Map();

AA._getProfilesByIds = async function(ids){
  const uniq = Array.from(new Set((ids||[]).filter(Boolean)));
  const missing = uniq.filter(id => !AA._profileCache.has(id));
  if (missing.length){
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .in("id", missing);
    if (error) throw error;
    for (const p of (data||[])) AA._profileCache.set(p.id, p);
    for (const id of missing) if (!AA._profileCache.has(id)) AA._profileCache.set(id, null);
  }
  return uniq.map(id => AA._profileCache.get(id));
};

AA.listIncomingRequests = async function(){
  const { data:{ session } } = await supabase.auth.getSession();
  const myId = session?.user?.id;
  if (!myId) throw new Error("No session");
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, status, requester, recipient, created_at")
    .eq("recipient", myId)
    .order("created_at", { ascending:false });
  if (error) throw error;

  const reqIds = Array.from(new Set((data||[]).map(r => r.requester).filter(Boolean)));
  const profs = await AA._getProfilesByIds(reqIds);
  const map = new Map(profs.filter(Boolean).map(p => [p.id, p]));
  return (data||[]).map(r => {
    const p = map.get(r.requester);
    return {
      ...r,
      requester_name:  p?.display_name || null,
      requester_email: p?.email || null
    };
  });
};

AA.listOutgoingRequests = async function(){
  const { data:{ session } } = await supabase.auth.getSession();
  const myId = session?.user?.id;
  if (!myId) throw new Error("No session");
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, status, requester, recipient, created_at")
    .eq("requester", myId)
    .order("created_at", { ascending:false });
  if (error) throw error;

  const recIds = Array.from(new Set((data||[]).map(r => r.recipient).filter(Boolean)));
  const profs = await AA._getProfilesByIds(recIds);
  const map = new Map(profs.filter(Boolean).map(p => [p.id, p]));
  return (data||[]).map(r => {
    const p = map.get(r.recipient);
    return {
      ...r,
      recipient_name:  p?.display_name || null,
      recipient_email: p?.email || null
    };
  });
};

AA.sendFriendRequestByEmail = async function(email){
  const { data:{ session } } = await supabase.auth.getSession();
  const myId = session?.user?.id;
  if (!myId) throw new Error("No session");

  const { data: rec, error: e1 } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .limit(1).single();
  if (e1 || !rec?.id) throw new Error("User not found");

  const { error: e2 } = await supabase.from("friend_requests").insert({
    requester: myId,
    recipient: rec.id,
    status: "pending"
  });
  if (e2) throw e2;
};
