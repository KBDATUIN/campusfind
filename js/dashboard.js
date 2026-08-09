/* ============================================================
   FindBack — User Dashboard
   ============================================================ */
"use strict";

/* whenReady() has already hydrated the store — render immediately. */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.getAttribute("data-page") !== "dashboard") return;
  whenReady(() => {
    const user = requireAuth();
    if (!user) return;
    renderDashboard(user);
  });
});

function renderDashboard(user) {
  const myLost = Store.all("items").filter((i) => i.reporterId === user.id && i.type === "lost");
  const myFound = Store.all("items").filter((i) => i.reporterId === user.id && i.type === "found");
  const myClaims = Store.all("claims").filter((c) => c.claimantId === user.id);
  const returned = [...myLost, ...myFound].filter((i) => i.status === "returned");
  const pendingClaims = myClaims.filter((c) => c.status === "pending" || c.status === "investigation");

  /* Greeting */
  const greet = document.getElementById("dash-greet");
  if (greet) {
    const hour = new Date().getHours();
    const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const today = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    greet.innerHTML = `
      <div class="dash-hero">
        <div class="dash-hero-main">
          <span class="dash-eyebrow">My Dashboard</span>
          <h1>${part}, ${esc(user.fullName.split(" ")[0])}!</h1>
          <p>Here's what's happening with your lost &amp; found activity.</p>
          <time class="dash-hero-date">${esc(today)}</time>
        </div>
        <div class="dash-actions">
          <a href="report-lost.html" class="btn btn-primary"><span aria-hidden="true">${ICONS.reportLost}</span> Report Lost Item</a>
          <a href="report-found.html" class="btn btn-success"><span aria-hidden="true">${ICONS.reportFound}</span> Report Found Item</a>
        </div>
      </div>`;
  }

  /* Profile summary */
  const profile = document.getElementById("dash-profile");
  if (profile) {
    const initials = user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const roleLabel = user.role === "admin" ? "Administrator" : user.accountType === "staff" ? "Staff Member" : "Student";
    profile.innerHTML = `
      <div class="profile-summary">
        <div class="avatar-lg" aria-hidden="true">${esc(initials)}</div>
        <div class="profile-info">
          <div class="profile-name-line">
            <h2>${esc(user.fullName)}</h2>
            <span class="chip role-${user.role}">${roleLabel}</span>
          </div>
          <div class="sub">${esc(user.email)}</div>
          <div class="sub">School ID: ${esc(user.schoolId)}</div>
        </div>
        <div class="profile-chips">
          <span class="chip">Member since ${fmtDate(user.createdAt)}</span>
          <span class="chip chip-status"><i aria-hidden="true"></i> Active</span>
        </div>
      </div>`;
  }

  /* Stat cards */
  const stats = [
    { icon: "search", cls: "blue", num: myLost.length, label: "Lost Reports" },
    { icon: "reportFound", cls: "green", num: myFound.length, label: "Found Reports" },
    { icon: "clipboard", cls: "amber", num: pendingClaims.length, label: "Pending Claims" },
    { icon: "returned", cls: "red", num: returned.length, label: "Completed Returns" },
  ];
  const statsEl = document.getElementById("dash-stats");
  if (statsEl) {
    statsEl.innerHTML = stats
      .map((s) => `
        <div class="stat-card stat-${s.cls}">
          <div class="stat-icon ${s.cls}" aria-hidden="true">${ICONS[s.icon] || ""}</div>
          <div class="stat-info">
            <div class="num" data-count="${s.num}">${s.num}</div>
            <div class="label">${s.label}</div>
          </div>
        </div>`)
      .join("");
    animateNumbers(statsEl);
  }

  /* Sections */
  const section = (iconKey, title, count, link, content) => `
    <div class="dash-section">
      <div class="dash-section-head">
        <div class="dash-section-title">
          <span class="sec-ico" aria-hidden="true">${ICONS[iconKey] || ""}</span>
          <h3>${title}</h3>
          ${typeof count === "number" && count > 0 ? `<span class="sec-count">${count}</span>` : ""}
        </div>
        ${link}
      </div>
      ${content}
    </div>`;

  const empty = (msg) => `<div class="empty-state dash-empty"><div class="empty-icon" aria-hidden="true">${ICONS.note}</div><p>${msg}</p></div>`;

  const viewAll = (href) => `<a href="${href}" class="btn-ghost btn-ghost-sm">View all<span aria-hidden="true">&rarr;</span></a>`;

  const container = document.getElementById("dash-sections");
  if (!container) return;

  const claimedItemIds = new Set(myClaims.map((c) => c.itemId));
  const returnedItems = returned.map((i) => i);

  container.innerHTML =
    section(
      "search",
      "My Lost Reports",
      myLost.length,
      viewAll("lost-items.html"),
      myLost.length
        ? `<div class="cards-grid">${myLost.map(itemCard).join("")}</div>`
        : empty("You haven't reported any lost items yet.")
    ) +
    section(
      "pin",
      "My Found Reports",
      myFound.length,
      viewAll("found-items.html"),
      myFound.length
        ? `<div class="cards-grid">${myFound.map(itemCard).join("")}</div>`
        : empty("You haven't reported any found items yet.")
    ) +
    section(
      "clipboard",
      "My Claim Requests",
      myClaims.length,
      "",
      myClaims.length
        ? `<div class="table-wrap"><table class="data-table">
            <thead><tr><th>Claim ID</th><th>Item</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${myClaims
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((c) => {
                  const it = Store.get("items", c.itemId);
                  return `<tr>
                    <td><b>${esc(c.claimId)}</b></td>
                    <td>${it ? `<a href="item-details.html?id=${it.id}">${esc(it.name)}</a>` : "Removed item"}</td>
                    <td>${fmtDate(c.createdAt)}</td>
                    <td>${statusBadge(c.status, true)}</td>
                    <td class="actions"><button class="icon-btn" title="View claim" onclick="viewMyClaim('${c.id}')">${ICONS.eye}</button></td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table></div>`
        : empty("You haven't submitted any claims yet.")
    ) +
    section(
      "returned",
      "Successfully Returned Items",
      returnedItems.length,
      "",
      returnedItems.length
        ? `<div class="mini-cards">${returnedItems.map(itemCard).join("")}</div>`
        : empty("No returned items yet. When your item is recovered, it will show up here.")
    );

  /* handle ?tab=claims */
  const tab = new URLSearchParams(window.location.search).get("tab");
  if (tab === "claims" && myClaims.length) {
    document.querySelectorAll(".dash-section")[2].scrollIntoView({ behavior: "smooth" });
  }

  /* unclaimed found items in queue for the user's lost items */
  const lostNotClaimed = myLost.filter((i) => i.status === "verified" && !claimedItemIds.has(i.id) && i.type === "lost");
  if (lostNotClaimed.length) {
    const matchesSection = lostNotClaimed
      .map((l) => {
        const ms = findMatches(l);
        return ms.length
          ? `<h4 class="mt-16 mb-16" style="font-size:15px">For "${esc(l.name)}" (${esc(l.reportId)})</h4><div class="mini-cards">${ms.map((m) => itemCard(m.item)).join("")}</div>`
          : "";
      })
      .join("");
    if (matchesSection) {
      container.insertAdjacentHTML(
        "beforeend",
        section(
          "flash",
          "Possible Matches for My Lost Items",
          undefined,
          `<span class="badge badge-matched">auto-detected</span>`,
          matchesSection
        )
      );
    }
  }
}

function animateNumbers(root) {
  root.querySelectorAll(".num[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (!target) return;
    const dur = 650;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function viewMyClaim(id) {
  const claim = Store.get("claims", id);
  if (!claim) return;
  const item = Store.get("items", claim.itemId);
  openModal(`
    <div data-title="Claim ${esc(claim.claimId)}"></div>
    <div data-body>
      <div class="flex-between mb-16">${statusBadge(claim.status, true)}<span class="muted small">Submitted ${fmtDate(claim.createdAt, true)}</span></div>
      <p class="small muted mb-16">Item: <b>${item ? esc(item.name) + " (" + esc(item.reportId) + ")" : "Removed"}</b></p>
      <p class="small mb-16"><b>Your explanation:</b><br>${esc(claim.explanation)}</p>
      <p class="small mb-16"><b>Identifying details provided:</b><br>${esc(claim.identifyingDetails || "—")}</p>
      ${claim.evidence ? `<img src="${claim.evidence}" alt="Claim evidence" style="border-radius:8px;max-height:180px;margin-bottom:12px">` : ""}
      ${claim.adminNotes ? `<p class="small" style="background:var(--info-soft);padding:12px;border-radius:8px"><b>Admin note:</b> ${esc(claim.adminNotes)}</p>` : ""}
    </div>`);
}
