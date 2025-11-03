(async function(){
  const supa = window.supabaseClient;
  const { data:{ user } } = await supa.auth.getUser(); if(!user){location.href="login.html";return;}
  const set = (id,html)=>{ const el=document.getElementById(id); if(el) el.innerHTML=html; };

  // requests
  const req = await supa.from("friend_requests").select("*").eq("to_id", user.id);
  set("friend-requests", (req.error||!req.data?.length) ? `<div class="body mono">No requests.</div>` :
    req.data.map(x=>`<div class="feed-item">${x.from_name||x.from_id}
      <button class="btn" data-a="${x.id}">Accept</button>
      <button class="btn" data-d="${x.id}">Decline</button></div>`).join(""));

  // your friends
  const fr = await supa.from("friends").select("*").or(`a.eq.${user.id},b.eq.${user.id}`);
  set("your-friends", (fr.error||!fr.data?.length) ? `<div class="body mono">No friends yet.</div>` :
    fr.data.map(x=>`<div class="feed-item">${x.a===user.id?x.b_name||x.b:x.a_name||x.a}</div>`).join(""));

  // find
  const all = await supa.from("profiles").select("id,username").neq("id",user.id).limit(24);
  set("find-friends", (all.error||!all.data?.length) ? `<div class="body mono">No members found.</div>` :
    all.data.map(p=>`<div class="card"><div class="body"><b>${p.username||p.id}</b>
      <button class="btn" data-send="${p.id}">Add</button></div></div>`).join(""));
})();
