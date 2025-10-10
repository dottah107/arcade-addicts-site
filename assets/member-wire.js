(async () => {
  try {
    const { data:{ session } } = await supabase.auth.getSession();
    if (!session) { location.href = "/login/"; return; }

    // Elements
    const emailInput = document.getElementById("aaFriendEmail");
    const sendBtn    = document.getElementById("aaSendReq");
    const incUL      = document.getElementById("aaIncoming");
    const outUL      = document.getElementById("aaOutgoing");

    async function renderIncoming(){
      try {
        const rows = await AA.listIncomingRequests();
        incUL.innerHTML = "";
        rows.forEach(fr => {
          const li = document.createElement("li");
          li.textContent = `From: ${fr.requester} · ${new Date(fr.created_at).toLocaleString()}`;
          const a = document.createElement("button"); a.textContent = "Accept";
          const d = document.createElement("button"); d.textContent = "Decline";
          a.onclick = async () => { await AA.acceptRequest(fr.id); await renderIncoming(); };
          d.onclick = async () => { await AA.declineRequest(fr.id); await renderIncoming(); };
          li.append(" ", a, " ", d);
          incUL.appendChild(li);
        });
      } catch (e) { console.error("renderIncoming", e); }
    }

    async function renderOutgoing(){
      try {
        const rows = await AA.listOutgoingRequests();
        outUL.innerHTML = "";
        rows.forEach(fr => {
          const li = document.createElement("li");
          li.textContent = `To: ${fr.recipient} · ${fr.status}`;
          outUL.appendChild(li);
        });
      } catch (e) { console.error("renderOutgoing", e); }
    }

    sendBtn?.addEventListener("click", async () => {
      const email = emailInput?.value?.trim();
      if (!email) return alert("Enter a friend's email");
      try {
        await AA.sendFriendRequestByEmail(email);
        alert("Request sent");
        await renderOutgoing();
      } catch (e) { alert(e.message || "Could not send"); }
    });

    await renderIncoming();
    await renderOutgoing();
  } catch (e) {
    console.error("member-wire init", e);
  }
})();
