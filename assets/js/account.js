(function(){
  const supa = window.supabaseClient;
  const byId = (x)=>document.getElementById(x);
  byId("save-profile")?.addEventListener("click", async ()=>{
    const { data:{ user } } = await supa.auth.getUser(); if(!user){location.href="login.html";return;}
    const username = byId("username").value.trim();
    const platform = byId("platform").value.trim();
    const { error } = await supa.from("profiles")
      .upsert({ id:user.id, username, platform, updated_at: new Date().toISOString() }, { onConflict:"id" });
    if(error) alert(error.message); else alert("Profile saved!");
  });
  byId("upload-btn")?.addEventListener("click", async ()=>{
    const f = byId("upload-file").files?.[0]; if(!f){alert("Pick a file first."); return;}
    const { data:{ user } } = await supa.auth.getUser(); if(!user){location.href="login.html";return;}
    const path = `${user.id}/${Date.now()}-${f.name}`;
    const { error } = await supa.storage.from("user-content").upload(path, f, { upsert:true });
    if(error) return alert(error.message);
    const { data } = supa.storage.from("user-content").getPublicUrl(path);
    const wrap = byId("my-uploads"); if(wrap){
      const div = document.createElement("div"); div.className="card"; div.innerHTML=`<div class="body"><a href="${data.publicUrl}" target="_blank">Uploaded: ${f.name}</a></div>`;
      wrap.prepend(div);
    }
  });
})();
