/* assets/change-email-wire.js — Change Email: sends verification to NEW email */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  function status(el, text, ok = false) {
    if (!el) return;
    el.style.color = ok ? "#86efac" : "#fca5a5"; // green / red
    el.textContent = text || "";
  }
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(() => {
    if (!window.supabase) { console.warn("Supabase SDK missing on Change Email page"); return; }

    // Find a form + email input (use your IDs if you have them)
    const form  = $("#emailForm") || document.querySelector('form[action*="email"]') || document.querySelector("form");
    if (!form) return;

    const input = $("#newEmail") || form.querySelector('input[type="email"], [name="email"], [name="new_email"]');
    const out   = $("#emailMsg") || (() => {
      const d = document.createElement("div");
      d.id = "emailMsg";
      d.style.marginTop = "10px";
      d.style.fontWeight = "700";
      form.appendChild(d);
      return d;
    })();

    // Stop native navigation (prevents raw JSON showing on page)
    form.setAttribute("action", "");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status(out, "");

      const newEmail = (input?.value || "").trim();
      if (!newEmail) return status(out, "Enter a new email.");

      // Must be logged in to change email
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) return status(out, sessErr.message);
      if (!session) return status(out, "Please log in first.");

      const btn = form.querySelector('button[type="submit"], input[type="submit"]');
      const old = btn?.innerText || btn?.value;
      if (btn) { btn.disabled = true; if ("innerText" in btn) btn.innerText = "Updating..."; else btn.value = "Updating..."; }

      try {
        // Redirect here AFTER the user clicks the email link:
        const { error } = await supabase.auth.updateUser(
          { email: newEmail },
          { emailRedirectTo: "https://www.arcade-addicts.com/change-password/" }
        );

        if (error) return status(out, error.message);
        status(out, "We sent a verification link to your new email. Open it to confirm the change.", true);
      } catch (err) {
        status(out, err?.message || "Could not update email.");
      } finally {
        if (btn) { btn.disabled = false; if ("innerText" in btn) btn.innerText = old; else btn.value = old; }
      }
    });
  });
})();





