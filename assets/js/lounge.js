(function(){
  const supa = window.supabaseClient;
  const send = document.getElementById("chat-send");
  if(!send) return;
  send.addEventListener("click", async ()=>{
    const t = document.getElementById("chat-text").value.trim(); if(!t) return;
    await supa.from("activity_feed").insert({ text: t, created_at: new Date().toISOString() });
    document.getElementById("chat-text").value="";
    alert("Sent (demo writes to activity_feed).");
  });
})();
