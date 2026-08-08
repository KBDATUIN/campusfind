/* ============================================================
   CampusFind — Admin Module
   (dashboard stats & charts, report verification, claims
   management, user management, activity logs, settings)
   ============================================================ */
"use strict";

/* Show a lightweight loading placeholder immediately so admin pages never
   appear blank while the store hydrates from Supabase. */
(function () {
  const shell = document.getElementById("admin-shell");
  if (shell && !shell.innerHTML.trim()) {
    shell.innerHTML = `
      <div class="admin-boot-loading">
        <div class="skeleton skeleton-stat" style="max-width:560px;margin:48px auto 16px"></div>
        <div class="skeleton skeleton-row" style="max-width:560px;margin:0 auto 12px"></div>
        <div class="skeleton skeleton-row" style="max-width:560px;margin:0 auto 12px"></div>
      </div>`;
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page") || "";
  if (!page.startsWith("admin-")) return;
  whenReady(() => {
    const admin = requireAdmin();
    if (!admin) return;

    renderAdminShell(admin, page);

    if (page === "admin-dashboard") initAdminDashboard(admin);
    if (page === "admin-reports") initAdminReports();
    if (page === "admin-claims") initAdminClaims();
    if (page === "admin-users") initAdminUsers(admin);
    if (page === "admin-settings") initAdminSettings(admin);
  });
});

/* ---------------- Admin shell (same design as the public pages) ---------------- */
function renderAdminShell(admin, page) {
  const shell = document.getElementById("admin-shell");
  if (!shell) return;

  const menu = [
    { key: "admin-dashboard", href: "dashboard.html", ico: "chart", label: "Dashboard" },
    { key: "admin-reports", href: "reports.html", ico: "doc", label: "Lost / Found Reports" },
    { key: "admin-claims", href: "claims.html", ico: "clipboard", label: "Claims" },
    { key: "admin-users", href: "users.html", ico: "users", label: "Users" },
  ];

  const missing = Store.all("items").filter((i) => i.status === "pending").length;
  const pendingClaims = Store.all("claims").filter((c) => c.status === "pending" || c.status === "investigation").length;
  const initials = admin.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const pageLabel = (menu.find((m) => m.key === page) || {}).label || "Admin";
  const roleLabel = admin.role === "staff" ? "Staff Member" : "Administrator";

  const badge = (n) => (n ? `<span class="bell-badge show" style="position:static;border:none">${n}</span>` : "");

  const navLinks = menu
    .map((m) => {
      const count = m.key === "admin-reports" ? missing : m.key === "admin-claims" ? pendingClaims : 0;
      return `<a href="${m.href}" class="${page === m.key ? "active" : ""}" onclick="closeNav()" title="${m.label}" ${page === m.key ? 'aria-current="page"' : ""}><span class="s-ico" aria-hidden="true">${ICONS[m.ico] || ""}</span><span class="nav-label">${m.label}</span>${badge(count)}</a>`;
    })
    .join("");

  const themeBtn = `<button class="icon-round theme-toggle" onclick="toggleTheme()" title="Toggle dark mode" aria-label="Toggle dark mode"><span class="theme-ico"></span></button>`;

  shell.innerHTML = `
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="closeNav()"></div>
    <div class="site-frame">
      <aside class="site-sidebar" id="site-sidebar">
        <div class="sidebar-head">
          <button class="sidebar-toggle" id="sidebar-toggle" onclick="toggleNav()" aria-label="Collapse sidebar" aria-expanded="true" title="Collapse sidebar"><span class="chev chev-left" aria-hidden="true">${ICONS.menu}</span><span class="chev chev-right" aria-hidden="true">${ICONS.menu}</span></button>
          <div class="brand-name">Campus<em>Find</em></div>
          <button class="sidebar-close" onclick="closeNav()" aria-label="Close menu" title="Close menu">${ICONS.close}</button>
        </div>
        <nav class="site-nav" aria-label="Admin navigation">
          <div class="nav-sect"><span>Manage</span></div>
          ${navLinks}
          <div class="nav-sect"><span>Support</span></div>
          <a href="../index.html" onclick="closeNav()" title="Public Site"><span class="s-ico" aria-hidden="true">${ICONS.home}</span><span class="nav-label">Public Site</span></a>
        </nav>
        <div class="side-account">
          <span class="side-acct-user" title="${esc(admin.fullName)}">
            <span class="side-avatar" aria-hidden="true">${esc(initials)}</span>
            <span class="side-user-meta">
              <span class="side-user-name">${esc(admin.fullName)}</span>
              <span class="side-user-role">${esc(roleLabel)}</span>
            </span>
          </span>
          <a class="side-acct-item" href="dashboard.html" title="Admin dashboard"><span class="s-ico" aria-hidden="true">${ICONS.dashboard}</span><span class="acct-label">Dashboard</span></a>
          <button class="side-acct-item theme-toggle-side" onclick="toggleTheme()" title="Toggle dark mode" aria-label="Toggle dark mode"><span class="s-ico theme-ico" aria-hidden="true"></span><span class="acct-label">Dark Mode</span></button>
          <button class="side-acct-item is-danger" onclick="logout()" title="Log out" aria-label="Log out"><span class="s-ico" aria-hidden="true">${ICONS.logout}</span><span class="acct-label">Log out</span></button>
        </div>
      </aside>
      <div class="site-main">
        <header class="site-header">
          <div class="header-left">
            <button class="header-icon" id="nav-toggle-mobile" onclick="toggleNav()" aria-label="Toggle menu" title="Toggle menu">${ICONS.menu}</button>
            <span class="header-title">${esc(pageLabel)}</span>
          </div>
          <div class="header-right">
            <div class="notif-wrap">
              <button class="header-icon bell-btn" onclick="toggleNotifPanel(event)" aria-label="Notifications" title="Notifications"><span class="s-ico" aria-hidden="true">${ICONS.bell}</span><span class="bell-badge" id="bell-badge"></span></button>
              <div class="notif-panel" id="notif-panel"></div>
            </div>
            ${themeBtn}
            <a href="dashboard.html" class="header-avatar-link" title="Admin dashboard"><span class="header-avatar">${esc(initials)}</span></a>
          </div>
        </header>
        <div class="site-main-content">
          <main class="admin-content"></main>
        </div>
        <footer class="admin-footer">&copy; <span id="admin-year"></span> CampusFind &mdash; School Lost &amp; Found System. All rights reserved.</footer>
      </div>
    </div>`;

  const yearEl = shell.querySelector("#admin-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  refreshBell();
  updateThemeIcons(getTheme());

  /* Restore the persisted collapsed state on desktop, same as the public pages */
  if (window.innerWidth > 1100) {
    let collapsed = false;
    try {
      collapsed = localStorage.getItem("campusfind_side_collapsed") === "1";
    } catch (e) {}
    document.body.classList.toggle("side-collapsed", collapsed);
  }
  updateSidebarToggle();
}

/* ---------------- Shared helpers ---------------- */
function setAdminContent(html) {
  const content = document.querySelector(".admin-content");
  if (content) content.innerHTML = html;
}

function statusLabel(status) {
  const m = STATUS_META[status];
  return m ? m.label : status;
}

function adminItemRow(item, admin) {
  const reporter = Store.get("users", item.reporterId);
  const claims = Store.all("claims").filter((c) => c.itemId === item.id);
  const pendingClaims = claims.filter((c) => c.status === "pending" || c.status === "investigation").length;
  return `
    <tr>
      <td><b>${esc(item.reportId)}</b><br><span class="muted small">${item.type.toUpperCase()}</span></td>
      <td><a href="../item-details.html?id=${item.id}">${esc(item.name)}</a><br><span class="muted small">${esc(item.category)}</span></td>
      <td>${reporter ? esc(reporter.fullName) : "—"}<br><span class="muted small">${reporter ? esc(reporter.schoolId) : ""}</span></td>
      <td>${esc(item.location || "—")}</td>
      <td>${fmtDate(item.createdAt)}</td>
      <td>${statusBadge(item.status)}${pendingClaims ? ` <span class="badge badge-investigation">${pendingClaims} claim${pendingClaims > 1 ? "s" : ""}</span>` : ""}</td>
      <td class="actions">
        <button class="icon-btn" title="View" onclick="viewReport('${item.id}')">${ICONS.eye}</button>
        ${item.status === "pending" ? `<button class="icon-btn success" title="Approve" onclick="approveReport('${item.id}')">${ICONS.check}</button>
        <button class="icon-btn danger" title="Reject" onclick="rejectReport('${item.id}')">${ICONS.close}</button>` : ""}
        <button class="icon-btn warn" title="Edit" onclick="editReport('${item.id}')">${ICONS.note}</button>
        <button class="icon-btn danger" title="Remove" onclick="removeReport('${item.id}')">${ICONS.trash}</button>
      </td>
    </tr>`;
}

function adminEmpty(colspan, msg) {
  return `<tr><td colspan="${colspan}" style="text-align:center;color:var(--text-muted);padding:36px">${msg}</td></tr>`;
}

/* ---------------- Admin Dashboard ---------------- */
function initAdminDashboard(admin) {
  setAdminContent(`
    <div class="flex-between mb-24">
      <div>
        <h2 style="font-size:22px">Dashboard Overview</h2>
        <p class="muted small">System activity across all reports, claims and users.</p>
      </div>
      <a href="reports.html" class="btn btn-primary btn-sm">Review Pending Reports</a>
    </div>
    <div class="dash-grid" id="admin-stats"></div>
    <div class="charts-grid">
      <div class="chart-card"><h3>Lost vs Found Reports</h3><div class="bar-chart" id="chart-lost-vs-found"></div>
        <div class="legend"><span><i style="background:var(--danger)"></i> Lost</span><span><i style="background:var(--success)"></i> Found</span></div></div>
      <div class="chart-card"><h3>Reports by Category</h3><div class="bar-chart" id="chart-categories"></div></div>
      <div class="chart-card"><h3>Reports by Location</h3><div class="bar-chart" id="chart-locations"></div></div>
      <div class="chart-card"><h3>Monthly Returned Items</h3><div class="bar-chart" id="chart-returns"></div></div>
    </div>
    <div class="dash-section">
      <div class="dash-section-head"><h3>Recent Reports</h3><a href="reports.html" class="small">Manage all &rarr;</a></div>
      <div id="admin-recent"></div>
    </div>
    <div class="dash-section">
      <div class="dash-section-head"><h3>Recent Activity Log</h3></div>
      <div id="admin-activity"></div>
    </div>`);

  const statsEl = document.getElementById("admin-stats");
  if (statsEl) statsEl.innerHTML = `<div class="skeleton skeleton-stat"></div>`.repeat(5);
  const recentEl = document.getElementById("admin-recent");
  if (recentEl) recentEl.innerHTML = `<div class="skeleton skeleton-row"></div>`.repeat(3);
  const actEl = document.getElementById("admin-activity");
  if (actEl) actEl.innerHTML = `<div class="skeleton skeleton-row"></div>`.repeat(3);
  fillAdminDashboard(admin);
}

function fillAdminDashboard(admin) {
  const items = Store.all("items");
  const users = Store.all("users");
  const claims = Store.all("claims");

  const stats = [
    { icon: "chart", cls: "blue", num: items.length, label: "Total Reports" },
    { icon: "clipboard", cls: "amber", num: items.filter((i) => i.status === "pending").length, label: "Pending Verification" },
    { icon: "doc", cls: "red", num: claims.filter((c) => c.status === "pending" || c.status === "investigation").length, label: "Pending Claims" },
    { icon: "returned", cls: "green", num: items.filter((i) => i.status === "returned").length, label: "Items Returned" },
    { icon: "users", cls: "purple", num: users.filter((u) => u.status === "active").length, label: "Active Users" },
  ];
  const statsEl = document.getElementById("admin-stats");
  if (statsEl) {
    statsEl.innerHTML = stats
      .map((s) => `<div class="stat-card"><div class="stat-icon ${s.cls}" aria-hidden="true">${ICONS[s.icon] || ""}</div><div><div class="num">${s.num}</div><div class="label">${s.label}</div></div></div>`)
      .join("");
  }

  /* Chart 1: lost vs found */
  const lost = items.filter((i) => i.type === "lost").length;
  const found = items.filter((i) => i.type === "found").length;
  const lv = document.getElementById("chart-lost-vs-found");
  if (lv) renderBarChart(lv, [
    { label: "Lost", value: lost },
    { label: "Found", value: found },
  ], "linear-gradient(180deg,#dc2626,#991b1b)");

  /* Chart 2: by category */
  const catData = CATEGORIES.map((c) => ({ label: c, value: items.filter((i) => i.category === c).length }))
    .filter((d) => d.value > 0);
  const cv = document.getElementById("chart-categories");
  if (cv) renderBarChart(cv, catData, "linear-gradient(180deg,#2563eb,#1e40af)");

  /* Chart 3: by location */
  const locs = {};
  items.forEach((i) => { locs[i.location || "Unknown"] = (locs[i.location || "Unknown"] || 0) + 1; });
  const locData = Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ label: k, value: v }));
  const lc = document.getElementById("chart-locations");
  if (lc) renderBarChart(lc, locData, "linear-gradient(180deg,#7c3aed,#5b21b6)");

  /* Chart 4: monthly returned */
  const months = {};
  items.filter((i) => i.status === "returned").forEach((i) => {
    const key = new Date(i.updatedAt).toLocaleString("en", { month: "short" });
    months[key] = (months[key] || 0) + 1;
  });
  const mr = document.getElementById("chart-returns");
  if (mr) renderBarChart(mr, Object.entries(months).map(([k, v]) => ({ label: k, value: v })), "linear-gradient(180deg,#16a34a,#15803d)");

  /* Recent reports table */
  const recentEl = document.getElementById("admin-recent");
  if (recentEl) {
    const recent = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
    recentEl.innerHTML = `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Report</th><th>Item</th><th>Reporter</th><th>Location</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${recent.map((i) => adminItemRow(i, admin)).join("") || adminEmpty(7, "No reports yet.")}</tbody>
    </table></div>`;
  }

  /* Recent activity */
  const actEl = document.getElementById("admin-activity");
  if (actEl) {
    const logs = [...Store.all("activityLogs")].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);
    const adminName = (id) => { const u = Store.get("users", id); return u ? u.fullName : "Unknown"; };
    actEl.innerHTML = logs.length
      ? `<div class="table-wrap"><table class="data-table">
          <thead><tr><th>Admin</th><th>Action</th><th>Target</th><th>Time</th></tr></thead>
          <tbody>${logs.map((l) => `<tr><td>${esc(adminName(l.adminId))}</td><td>${esc(l.action)}</td><td>${esc(l.target)}</td><td class="muted small">${fmtDate(l.timestamp, true)}</td></tr>`).join("")}</tbody>
        </table></div>`
      : `<div class="empty-state" style="padding:36px"><p>No activity recorded yet.</p></div>`;
  }
}

/* ---------------- Report verification ---------------- */
function initAdminReports() {
  setAdminContent(`
    <div class="flex-between mb-24">
      <div>
        <h2 style="font-size:22px">Lost &amp; Found Reports</h2>
        <p class="muted small">Review, verify and moderate every submission.</p>
      </div>
      <div class="dash-actions">
        <select class="select-mini" id="report-type">
          <option value="all">All types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select class="select-mini" id="report-status">
          <option value="all">All statuses</option>
          <option value="pending">Pending Verification</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="claim-approved">Claim Approved</option>
          <option value="returned">Returned</option>
        </select>
      </div>
    </div>
    <div class="results-info mb-16"><span id="reports-count"></span></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Report ID</th><th>Item</th><th>Reporter</th><th>Location</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody id="reports-body"></tbody>
    </table></div>`);

  const filterType = document.getElementById("report-type");
  const filterStatus = document.getElementById("report-status");
  const tableBody = document.getElementById("reports-body");

  function render() {
    let items = Store.all("items");
    if (filterType.value !== "all") items = items.filter((i) => i.type === filterType.value);
    if (filterStatus.value !== "all") items = items.filter((i) => i.status === filterStatus.value);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    tableBody.innerHTML = items.map((i) => adminItemRow(i)).join("") || adminEmpty(7, "No reports match the selected filters.");
    const count = document.getElementById("reports-count");
    if (count) count.textContent = items.length + " report(s)";
  }

  filterType.addEventListener("change", render);
  filterStatus.addEventListener("change", render);
  tableBody.innerHTML = `<tr><td colspan="7"><div class="skeleton skeleton-row"></div></td></tr>`.repeat(4);
  render();
}

/* Private contact info for a report (stored in item_contacts — only
   reporters and staff/admins can read it via RLS). */
function contactText(itemId) {
  const contact = Store.get("contacts", itemId);
  return contact && contact.contactInfo
    ? `<p class="small mt-8"><b>Contact info (private):</b> ${esc(contact.contactInfo)}</p>`
    : "";
}

function viewReport(id) {
  const item = Store.get("items", id);
  if (!item) return;
  const reporter = Store.get("users", item.reporterId);
  const claims = Store.all("claims").filter((c) => c.itemId === id);
  openModal(`
    <div data-title="Report ${esc(item.reportId)}"></div>
    <div data-body>
      <div class="flex-between mb-16">
        <span class="type-tag ${item.type === "lost" ? "type-lost" : "type-found"}">${item.type.toUpperCase()}</span>
        ${statusBadge(item.status)}
      </div>
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:14px">
        <div style="width:110px;height:110px;border-radius:10px;background:var(--primary-50);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
          ${itemImage(item)}
        </div>
        <div>
          <h3>${esc(item.name)}</h3>
          <p class="muted small">${esc(item.category)}${item.brand ? " &middot; " + esc(item.brand) : ""}${item.color ? " &middot; " + esc(item.color) : ""}</p>
          <p class="muted small">${esc(item.location || "—")} &middot; ${fmtDate(item.date)}${item.time ? " " + esc(item.time) : ""}</p>
        </div>
      </div>
      <p class="small"><b>Description:</b> ${esc(item.description || "—")}</p>
      <p class="small mt-8"><b>Identifying features:</b> ${esc(item.identifyingFeatures || "—")}</p>
      ${item.storageLocation ? `<p class="small mt-8"><b>Stored at:</b> ${esc(item.storageLocation)}</p>` : ""}
      ${contactText(id)}
      <hr class="divider">
      <p class="small"><b>Reporter:</b> ${reporter ? esc(reporter.fullName) + " (" + esc(reporter.schoolId) + ")" : "—"}</p>
      <p class="small mt-8"><b>Reported:</b> ${fmtDate(item.createdAt, true)}</p>
      ${item.rejectReason ? `<p class="small mt-8" style="color:var(--danger)"><b>Reject reason:</b> ${esc(item.rejectReason)}</p>` : ""}
      ${claims.length ? `<hr class="divider"><p class="small"><b>${claims.length} claim(s) on this item:</b></p>${claims.map((c) => { const cl = Store.get("users", c.claimantId); return `<p class="small mt-8">${esc(c.claimId)} &middot; ${cl ? esc(cl.fullName) : "—"} ${statusBadge(c.status, true)}</p>`; }).join("")}` : ""}
    </div>`);
}

function approveReport(id) {
  const item = Store.get("items", id);
  if (!item) return;
  confirmDialog(
    "Approve report " + item.reportId + "?",
    'The item "' + item.name + '" will be published with status "Verified" and will be visible to everyone.',
    () => {
      Store.update("items", id, { status: "verified", updatedAt: new Date().toISOString() });
      const u = currentUser();
      if (u) logActivity(u.id, "Approved report", item.reportId + " (" + item.name + ")");
      addNotification(item.reporterId, "Report Approved", `Your report ${item.reportId} for "${item.name}" has been verified and published.`);
      toast("Report approved and published.", "success");
      reloadAdminTable();
    },
    "Approve"
  );
}

function rejectReport(id) {
  const item = Store.get("items", id);
  if (!item) return;
  openModal(`
    <div data-title="Reject report ${esc(item.reportId)}"></div>
    <div data-body>
      <p class="modal-text">You are about to reject the report for "<b>${esc(item.name)}</b>". Please provide a reason — the reporter will see it.</p>
      <div class="form-group">
        <label for="reject-reason">Rejection reason <span class="req">*</span></label>
        <textarea id="reject-reason" placeholder="e.g. Duplicate listing, insufficient information, inappropriate content..." required></textarea>
      </div>
      <div class="confirm-btns">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" id="reject-confirm">Reject Report</button>
      </div>
    </div>`);
  document.getElementById("reject-confirm").addEventListener("click", () => {
    const reason = sanitizeInput(document.getElementById("reject-reason").value);
    if (reason.length < 5) {
      toast("Please provide a reason for the rejection.", "error");
      return;
    }
    Store.update("items", id, { status: "rejected", rejectReason: reason, updatedAt: new Date().toISOString() });
    const u = currentUser();
    if (u) logActivity(u.id, "Rejected report", item.reportId + " (" + item.name + ")");
    addNotification(item.reporterId, "Report Rejected", `Your report ${item.reportId} for "${item.name}" was rejected. Reason: ${reason}`);
    closeModal();
    toast("Report rejected. The reporter has been notified.", "warning");
    reloadAdminTable();
  });
}

function editReport(id) {
  const item = Store.get("items", id);
  if (!item) return;
  openModal(`
    <div data-title="Edit report ${esc(item.reportId)}"></div>
    <div data-body>
      <form id="edit-report-form" novalidate>
        <div class="form-group">
          <label for="er-name">Item Name</label>
          <input name="name" id="er-name" value="${esc(item.name)}">
        </div>
        <div class="form-group">
          <label for="er-description">Description</label>
          <textarea name="description" id="er-description">${esc(item.description || "")}</textarea>
        </div>
        <div class="form-group">
          <label for="er-location">Location</label>
          <input name="location" id="er-location" value="${esc(item.location || "")}">
        </div>
        <div class="form-group">
          <label for="er-color">Color</label>
          <input name="color" id="er-color" value="${esc(item.color || "")}">
        </div>
        <div class="form-group">
          <label for="er-brand">Brand</label>
          <input name="brand" id="er-brand" value="${esc(item.brand || "")}">
        </div>
        ${item.storageLocation ? `<div class="form-group"><label for="er-storage">Storage Location</label><input name="storageLocation" id="er-storage" value="${esc(item.storageLocation)}"></div>` : ""}
        <div class="form-group">
          <label for="er-admin-notes">Admin Notes (internal)</label>
          <input name="adminNotes" id="er-admin-notes" placeholder="Visible only to admins" value="${esc(item.adminNotes || "")}">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        </div>
      </form>
    </div>`);
  const form = document.getElementById("edit-report-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const patch = {
      name: sanitizeInput(form["name"].value) || item.name,
      description: sanitizeInput(form["description"].value),
      location: sanitizeInput(form["location"].value),
      color: sanitizeInput(form["color"].value),
      brand: sanitizeInput(form["brand"].value),
      adminNotes: sanitizeInput(form["adminNotes"].value),
      updatedAt: new Date().toISOString(),
    };
    if (form["storageLocation"]) patch.storageLocation = sanitizeInput(form["storageLocation"].value);
    Store.update("items", id, patch);
    const u = currentUser();
    if (u) logActivity(u.id, "Edited report", item.reportId + " (" + patch.name + ")");
    closeModal();
    toast("Report updated.", "success");
    reloadAdminTable();
  });
}

function removeReport(id) {
  const item = Store.get("items", id);
  if (!item) return;
  confirmDialog(
    "Remove report permanently?",
    'This will permanently delete report ' + item.reportId + ' ("' + item.name + '") and cannot be undone.',
    () => {
      Store.remove("items", id);
      const u = currentUser();
      if (u) logActivity(u.id, "Removed report", item.reportId + " (" + item.name + ")");
      toast("Report removed.", "warning");
      reloadAdminTable();
    },
    "Remove Permanently",
    true
  );
}

function reloadAdminTable() {
  /* re-run the current admin page initializer by simulating a fresh render */
  const page = document.body.getAttribute("data-page") || "";
  if (page === "admin-reports") initAdminReports();
  if (page === "admin-claims") initAdminClaims();
  if (page === "admin-dashboard") initAdminDashboard(currentUser());
}

/* ---------------- Claim management ---------------- */
function initAdminClaims() {
  setAdminContent(`
    <div class="flex-between mb-24">
      <div>
        <h2 style="font-size:22px">Claim Management</h2>
        <p class="muted small">Review evidence, approve or reject claims, and complete returns.</p>
      </div>
      <select class="select-mini" id="claim-status">
        <option value="all">All statuses</option>
        <option value="pending">Pending Review</option>
        <option value="investigation">Under Investigation</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="completed">Completed</option>
      </select>
    </div>
    <div class="results-info mb-16"><span id="claims-count"></span></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Claim ID</th><th>Item</th><th>Claimant</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody id="claims-body"></tbody>
    </table></div>`);

  const filterStatus = document.getElementById("claim-status");
  const tableBody = document.getElementById("claims-body");

  function render() {
    let claims = Store.all("claims");
    if (filterStatus.value !== "all") claims = claims.filter((c) => c.status === filterStatus.value);
    claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    tableBody.innerHTML = claims
      .map((c) => {
        const item = Store.get("items", c.itemId);
        const claimant = Store.get("users", c.claimantId);
        return `
        <tr>
          <td><b>${esc(c.claimId)}</b></td>
          <td>${item ? `<a href="../item-details.html?id=${item.id}">${esc(item.name)}</a><br><span class="muted small">${esc(item.reportId)}</span>` : "Removed item"}</td>
          <td>${claimant ? esc(claimant.fullName) : "—"}<br><span class="muted small">${claimant ? esc(claimant.schoolId) : ""}</span></td>
          <td>${fmtDate(c.createdAt)}</td>
          <td>${statusBadge(c.status, true)}</td>
          <td class="actions">
            <button class="icon-btn" title="View / review evidence" onclick="viewClaimAdmin('${c.id}')">${ICONS.eye}</button>
            ${c.status === "pending" || c.status === "investigation" ? `
              <button class="icon-btn" title="Request more info" onclick="requestClaimInfo('${c.id}')">${ICONS.note}</button>
              <button class="icon-btn success" title="Approve claim" onclick="approveClaim('${c.id}')">${ICONS.check}</button>
              <button class="icon-btn danger" title="Reject claim" onclick="rejectClaim('${c.id}')">${ICONS.close}</button>` : ""}
            ${item && item.status !== "returned" && c.status === "approved" ? `<button class="icon-btn success" title="Mark item returned" onclick="markReturned('${c.id}')">${ICONS.returned}</button>` : ""}
          </td>
        </tr>`;
      })
      .join("") || adminEmpty(6, "No claims match the selected filters.");
    const count = document.getElementById("claims-count");
    if (count) count.textContent = claims.length + " claim(s)";
  }

  filterStatus.addEventListener("change", render);
  tableBody.innerHTML = `<tr><td colspan="6"><div class="skeleton skeleton-row"></div></td></tr>`.repeat(4);
  render();
}

function viewClaimAdmin(id) {
  const claim = Store.get("claims", id);
  if (!claim) return;
  const item = Store.get("items", claim.itemId);
  const claimant = Store.get("users", claim.claimantId);
  openModal(`
    <div data-title="Claim ${esc(claim.claimId)}"></div>
    <div data-body>
      <div class="flex-between mb-16">${statusBadge(claim.status, true)}<span class="muted small">${fmtDate(claim.createdAt, true)}</span></div>
      <p class="small"><b>Item:</b> ${item ? esc(item.name) + " &middot; " + esc(item.reportId) : "Removed"}</p>
      <p class="small mt-8"><b>Claimant:</b> ${claimant ? esc(claimant.fullName) + " &middot; " + esc(claimant.schoolId) + " &middot; " + esc(claimant.email) : "—"}</p>
      <hr class="divider">
      <p class="small"><b>Explanation:</b><br>${esc(claim.explanation)}</p>
      <p class="small mt-16"><b>Identifying details provided:</b><br>${esc(claim.identifyingDetails || "—")}</p>
      ${claim.evidence ? `<p class="small mt-16"><b>Evidence:</b></p><img src="${claim.evidence}" alt="Claim evidence" style="border-radius:8px;max-height:220px;margin-top:6px">` : `<p class="small mt-16 muted">No supporting evidence uploaded.</p>`}
      <hr class="divider">
      <p class="small"><b>Owner's identifying features (from report):</b> ${item ? esc(item.identifyingFeatures || "—") : "—"}</p>
      ${claim.adminNotes ? `<p class="small mt-16" style="background:var(--info-soft);padding:12px;border-radius:8px"><b>Admin notes:</b> ${esc(claim.adminNotes)}</p>` : ""}
    </div>`);
}

function requestClaimInfo(id) {
  const claim = Store.get("claims", id);
  if (!claim) return;
  const claimant = Store.get("users", claim.claimantId);
  openModal(`
    <div data-title="Request more information"></div>
    <div data-body>
      <p class="modal-text">Request additional information from the claimant (<b>${claimant ? esc(claimant.fullName) : "—"}</b>). A notification will be sent to them.</p>
      <div class="form-group">
        <label for="info-request">What additional information do you need?</label>
        <textarea id="info-request" placeholder="e.g. Please provide the purchase receipt or another identifying detail..."></textarea>
      </div>
      <div class="confirm-btns">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" id="info-send">Send Request</button>
      </div>
    </div>`);
  document.getElementById("info-send").addEventListener("click", () => {
    const msg = sanitizeInput(document.getElementById("info-request").value);
    Store.update("claims", id, { status: "investigation", updatedAt: new Date().toISOString() });
    addNotification(claim.claimantId, "Additional Information Requested", `For claim ${claim.claimId}: ${msg || "Please provide more details to support your claim."}`);
    const u = currentUser();
    if (u) logActivity(u.id, "Requested claim information", claim.claimId);
    closeModal();
    toast("Request sent to the claimant.", "success");
    reloadAdminTable();
  });
}

function approveClaim(id) {
  const claim = Store.get("claims", id);
  if (!claim) return;
  const item = Store.get("items", claim.itemId);
  if (!item) {
    toast("The claimed item no longer exists.", "error");
    return;
  }
  confirmDialog(
    "Approve claim " + claim.claimId + "?",
    'Approving this claim sets the item "' + item.name + '" to "Claim Approved" and notifies both parties. Physical handover must still be arranged.',
    () => {
      Store.update("claims", id, { status: "approved", updatedAt: new Date().toISOString() });
      Store.update("items", item.id, { status: "claim-approved", updatedAt: new Date().toISOString() });
      const u = currentUser();
      if (u) logActivity(u.id, "Approved claim", claim.claimId + " for " + item.reportId);
      addNotification(claim.claimantId, "Claim Approved!", `Great news — your claim ${claim.claimId} for "${item.name}" was approved. Arrange pick-up with the lost & found office.`);
      if (item.reporterId !== claim.claimantId) {
        addNotification(item.reporterId, "Claim Approved on Your Item", `The claim ${claim.claimId} for your found item "${item.name}" was approved. Please arrange the handover.`);
      }
      toast("Claim approved. Item marked as Claim Approved.", "success");
      reloadAdminTable();
    },
    "Approve Claim"
  );
}

function rejectClaim(id) {
  const claim = Store.get("claims", id);
  if (!claim) return;
  const item = Store.get("items", claim.itemId);
  openModal(`
    <div data-title="Reject claim ${esc(claim.claimId)}"></div>
    <div data-body>
      <p class="modal-text">Reject the claim by <b>${item ? esc(item.name) : "item"}</b>. The claimant will be notified. You may include an internal admin note.</p>
      <div class="form-group">
        <label for="reject-claim-reason">Reason / admin note</label>
        <textarea id="reject-claim-reason" placeholder="Why is this claim being rejected?"></textarea>
      </div>
      <div class="confirm-btns">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" id="reject-claim-confirm">Reject Claim</button>
      </div>
    </div>`);
  document.getElementById("reject-claim-confirm").addEventListener("click", () => {
    const note = sanitizeInput(document.getElementById("reject-claim-reason").value);
    Store.update("claims", id, { status: "rejected", adminNotes: note, updatedAt: new Date().toISOString() });
    const u = currentUser();
    if (u) logActivity(u.id, "Rejected claim", claim.claimId + (note ? " — " + note : ""));
    addNotification(claim.claimantId, "Claim Rejected", `Your claim ${claim.claimId} was rejected. ${note ? "Reason: " + note : "Contact the lost & found office for details."}`);
    closeModal();
    toast("Claim rejected and claimant notified.", "warning");
    reloadAdminTable();
  });
}

function markReturned(id) {
  const claim = Store.get("claims", id);
  if (!claim) return;
  const item = Store.get("items", claim.itemId);
  if (!item) return;
  confirmDialog(
    "Mark item as returned?",
    'This completes the process: item "' + item.name + '" will be marked as "Returned" and the claim as "Completed".',
    () => {
      Store.update("claims", id, { status: "completed", updatedAt: new Date().toISOString() });
      Store.update("items", item.id, { status: "returned", updatedAt: new Date().toISOString() });
      const u = currentUser();
      if (u) logActivity(u.id, "Marked item returned", item.reportId + " (" + item.name + ")");
      addNotification(claim.claimantId, "Item Returned!", `You can collect "${item.name}" — your claim ${claim.claimId} is complete. Thank you!`);
      if (item.reporterId !== claim.claimantId) {
        addNotification(item.reporterId, "Item Returned", `Your found item "${item.name}" has been returned to its owner. Thank you for reporting it!`);
      }
      toast("Item marked as returned. Claim completed.", "success");
      reloadAdminTable();
    },
    "Mark as Returned"
  );
}

/* ---------------- User management ---------------- */
function initAdminUsers(admin) {
  setAdminContent(`
    <div class="flex-between mb-24">
      <div>
        <h2 style="font-size:22px">User Management</h2>
        <p class="muted small">Manage student and staff accounts across the system.</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-row">
        <div class="form-group search-grow">
          <label for="user-search">Search users</label>
          <input type="text" id="user-search" placeholder="Search by name, email or ID...">
        </div>
        <div class="form-group">
          <label for="user-role">Role</label>
          <select id="user-role">
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label for="user-status">Status</label>
          <select id="user-status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
    </div>
    <div class="results-info mb-16"><span id="users-count"></span></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>User</th><th>School ID</th><th>Role</th><th>Registered</th><th>Reports</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody id="users-body"></tbody>
    </table></div>`);

  const search = document.getElementById("user-search");
  const filterRole = document.getElementById("user-role");
  const filterStatus = document.getElementById("user-status");
  const tableBody = document.getElementById("users-body");

  function render() {
    let users = Store.all("users");
    const q = (search.value || "").toLowerCase();
    if (q) {
      users = users.filter((u) => [u.fullName, u.email, u.schoolId].join(" ").toLowerCase().includes(q));
    }
    if (filterRole.value !== "all") users = users.filter((u) => u.role === filterRole.value);
    if (filterStatus.value !== "all") users = users.filter((u) => u.status === filterStatus.value);

    tableBody.innerHTML = users
      .map((u) => {
        const initials = u.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        const itemCount = Store.all("items").filter((i) => i.reporterId === u.id).length;
        return `
        <tr>
          <td><div class="user-cell"><div class="avatar">${esc(initials)}</div><div><b>${esc(u.fullName)}</b><br><span class="muted small">${esc(u.email)}</span></div></div></td>
          <td>${esc(u.schoolId)}</td>
          <td><span class="chip role-${u.role}">${u.role === "admin" ? "Admin" : u.role === "staff" ? "Staff" : "Student"}</span></td>
          <td>${fmtDate(u.createdAt)}</td>
          <td>${itemCount} report(s)</td>
          <td>${statusBadge(u.status === "active" ? "active" : "suspended", false)}</td>
          <td class="actions">
            <button class="icon-btn" title="View profile" onclick="viewUser('${u.id}')">${ICONS.eye}</button>
            ${u.role !== "admin" ? `
              ${u.status === "active"
                ? `<button class="icon-btn warn" title="Suspend" onclick="suspendUser('${u.id}')">${ICONS.moon}</button>`
                : `<button class="icon-btn success" title="Activate" onclick="activateUser('${u.id}')">${ICONS.sun}</button>`}
              <button class="icon-btn danger" title="Delete" onclick="deleteUser('${u.id}')">${ICONS.trash}</button>` : ""}
          </td>
        </tr>`;
      })
      .join("") || adminEmpty(7, "No users match the current filters.");
    const count = document.getElementById("users-count");
    if (count) count.textContent = users.length + " user(s)";
  }

  search.addEventListener("input", render);
  filterRole.addEventListener("change", render);
  filterStatus.addEventListener("change", render);
  tableBody.innerHTML = `<tr><td colspan="7"><div class="skeleton skeleton-row"></div></td></tr>`.repeat(4);
  render();
}

function viewUser(id) {
  const u = Store.get("users", id);
  if (!u) return;
  const items = Store.all("items").filter((i) => i.reporterId === id);
  const claims = Store.all("claims").filter((c) => c.claimantId === id);
  openModal(`
    <div data-title="User profile"></div>
    <div data-body>
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px">
        <div class="avatar" style="width:52px;height:52px;font-size:18px">${esc(u.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase())}</div>
        <div>
          <h3>${esc(u.fullName)}</h3>
          <p class="muted small">${esc(u.email)}</p>
        </div>
      </div>
      <div class="details-list" style="grid-template-columns:1fr 1fr">
        <li><span>School ID</span><b>${esc(u.schoolId)}</b></li>
        <li><span>Role</span><b>${esc(u.role)}</b></li>
        <li><span>Account</span><b>${esc(u.accountType)}</b></li>
        <li><span>Status</span><b>${esc(u.status)}</b></li>
        <li><span>Registered</span><b>${fmtDate(u.createdAt)}</b></li>
        <li><span>Reports</span><b>${items.length}</b></li>
      </div>
      ${claims.length ? `<p class="small mt-16"><b>Claims:</b> ${claims.length}</p>` : ""}
    </div>`);
}

function suspendUser(id) {
  const u = Store.get("users", id);
  if (!u) return;
  confirmDialog(
    "Suspend " + u.fullName + "?",
    "The user will no longer be able to log in until the account is reactivated.",
    () => {
      Store.update("users", id, { status: "suspended" });
      const admin = currentUser();
      if (admin) logActivity(admin.id, "Suspended user", u.email);
      addNotification(id, "Account Suspended", "Your CampusFind account has been suspended. Contact the school office for assistance.");
      toast("User suspended.", "warning");
      reloadAdminTable();
    },
    "Suspend"
  );
}

function activateUser(id) {
  const u = Store.get("users", id);
  if (!u) return;
  Store.update("users", id, { status: "active" });
  const admin = currentUser();
  if (admin) logActivity(admin.id, "Activated user", u.email);
  addNotification(id, "Account Reactivated", "Your CampusFind account has been reactivated. Welcome back!");
  toast("User activated.", "success");
  reloadAdminTable();
}

function deleteUser(id) {
  const u = Store.get("users", id);
  if (!u) return;
  confirmDialog(
    "Delete account permanently?",
    "This permanently deletes the account of " + u.fullName + " (" + u.email + "). Their reports and claims will remain but be shown as removed.",
    async () => {
      try {
        const { error } = await Store.client.rpc("admin_delete_user", { p_uid: id });
        if (error) throw error;
        Store.remove("users", id);
        const admin = currentUser();
        if (admin) logActivity(admin.id, "Deleted user", u.email);
        toast("User account deleted.", "success");
      } catch (err) {
        toast("Could not delete account: " + (err.message || "server error"), "error");
      }
      reloadAdminTable();
    },
    "Delete Account",
    true
  );
}

/* ---------------- Settings ---------------- */
function initAdminSettings(admin) {
  setAdminContent(`
    <div class="flex-between mb-24">
      <div>
        <h2 style="font-size:22px">System Settings</h2>
        <p class="muted small">Configure system behaviour and manage demo data.</p>
      </div>
    </div>
    <div class="dash-grid" style="grid-template-columns:1fr;max-width:720px">
      <div class="form-card" style="max-width:none;margin:0">
        <h2>General Settings</h2>
        <form id="settings-form" style="margin-top:20px">
          <div class="form-group mb-16">
            <label for="set-site-name">System Name</label>
            <input type="text" name="siteName" id="set-site-name">
          </div>
          <div class="form-group mb-16">
            <label for="set-contact-email">Lost &amp; Found Contact Email</label>
            <input type="email" name="contactEmail" id="set-contact-email">
          </div>
          <div class="form-group mb-16">
            <label class="checkbox-row"><input type="checkbox" name="autoMatch"><span>Enable automatic item matching (lost vs found)</span></label>
          </div>
          <div class="form-group mb-16">
            <label class="checkbox-row"><input type="checkbox" name="notifyFinders"><span>Notify finders when a claim is submitted</span></label>
          </div>
          <button type="submit" class="btn btn-primary">Save Settings</button>
        </form>
      </div>
      <div class="form-card" style="max-width:none;margin:0">
        <h2 style="color:var(--danger)">Danger Zone</h2>
        <p class="form-sub">Wipe all reports, claims, notifications and activity logs.</p>
        <button class="btn btn-danger" id="reset-data">Reset All Demo Data</button>
      </div>
    </div>`);

  const form = document.getElementById("settings-form");
  if (!form) return;
  const current = (Store.data.settings && Store.data.settings[0]) || {};
  form["siteName"].value = current.siteName || "CampusFind";
  form["contactEmail"].value = current.contactEmail || "";
  form["autoMatch"].checked = current.autoMatch !== false;
  form["notifyFinders"].checked = current.notifyFinders !== false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const siteName = sanitizeInput(form["siteName"].value) || "CampusFind";
    const contactEmail = sanitizeInput(form["contactEmail"].value);
    try {
      await Store.saveSettings({
        siteName,
        contactEmail,
        autoMatch: form["autoMatch"].checked,
        notifyFinders: form["notifyFinders"].checked,
      });
      const u = currentUser();
      if (u) logActivity(u.id, "Updated system settings", "Site: " + siteName);
      toast("Settings saved.", "success");
    } catch (err) {
      toast("Could not save settings: " + (err.message || "server error"), "error");
    }
  });

  const resetBtn = document.getElementById("reset-data");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      confirmDialog(
        "Reset all data?",
        "This wipes all reports, claims, notifications and activity logs. User accounts are kept. This cannot be undone.",
        async () => {
          try {
            await Store.resetDemo();
            toast("Data reset complete.", "success");
            setTimeout(() => window.location.reload(), 900);
          } catch (err) {
            toast("Could not reset data: " + (err.message || "server error"), "error");
          }
        },
        "Reset Data",
        true
      );
    });
  }
}
