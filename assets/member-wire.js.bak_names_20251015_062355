(async () => {
  try {
    const { data:{ session } } = await supabase.auth.getSession();
    if (!session) { location.href = "/login/"; return; }

    // ---------- element refs ----------
    const emailInput   = document.getElementById("aaFriendEmail");
    const sendBtn      = document.getElementById("aaSendReq");
    const incUL        = document.getElementById("aaIncoming");
    const outUL        = document.getElementById("aaOutgoing");

    const upTitleInput = document.getElementById("aaUploadTitle");
    const upFileInput  = document.getElementById("aaUploadFile");
    const upBtn        = document.getElementById("aaUploadBtn");
    const upList       = document.getElementById("aaUploadsList");

    // ---------- render helpers ----------
    async function renderIncoming(){
      if (!incUL) return;
      try {
        const rows = await AA.listIncomingRequests();
        incUL.innerHTML = rows.map(fr => `
          <li>
            From: <code>${fr.requester}</code> · ${new Date(fr.created_at).toLocaleString()}
            <button data-acc="${fr.id}">Accept</button>
            <button data-dec="${fr.id}">Decline</button>
          </li>`).join("");
        incUL.querySelectorAll("[data-acc]").forEach(b => b.onclick = async () => { await AA.acceptRequest(b.dataset.acc); renderIncoming(); });
        incUL.querySelectorAll("[data-dec]").forEach(b => b.onclick = async () => { await AA.declineRequest(b.dataset.dec); renderIncoming(); });
      } catch (e) { console.error("renderIncoming", e); }
    }

    async function renderOutgoing(){
      if (!outUL) return;
      try {
        const rows = await AA.listOutgoingRequests();
        outUL.innerHTML = rows.map(fr => `
          <li>To: <code>${fr.recipient}</code> · ${fr.status}</li>`).join("");
      } catch (e) { console.error("renderOutgoing", e); }
    }

    async function renderUploads(){
      if (!upList) return;
      try {
        const rows = await AA.listMyUploads();
        upList.innerHTML = rows.length
          ? rows.map(r => `<li><a href="${r.url}" target="_blank">${r.title || r.path.split('/').pop()}</a> · ${new Date(r.created_at).toLocaleString()}</li>`).join("")
          : "<li>No uploads yet.</li>";
      } catch (e) { console.error("renderUploads", e); }
    }

    // ---------- events ----------
    sendBtn?.addEventListener("click", async () => {
      const email = emailInput?.value?.trim();
      if (!email) return alert("Enter a friend's email");
      try {
        await AA.sendFriendRequestByEmail(email);
        alert("Request sent");
        await renderOutgoing();
      } catch (e) { alert(e.message || "Could not send"); }
    });

    upBtn?.addEventListener("click", async () => {
      try {
        const f = upFileInput?.files?.[0];
        if (!f) return alert("Choose a file");
        await AA.uploadContent(f, upTitleInput?.value || "");
        upTitleInput.value = "";
        upFileInput.value = "";
        await renderUploads();
        alert("Uploaded");
      } catch (e) { alert(e.message || "Upload failed"); }
    });

    // ---------- initial paint ----------
    await renderIncoming();
    await renderOutgoing();
    await renderUploads();
  } catch (e) {
    console.error("member-wire init", e);
  }
})();
