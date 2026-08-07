/* ============================================================
   CampusFind — Notifications
   Dropdown lives in the global nav (rendered by app.js).
   This file adds the dashboard feed + live badge refresh.
   ============================================================ */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* keep the bell badge fresh */
  setInterval(() => refreshBell(), 15000);

  if (document.body.getAttribute("data-page") === "dashboard") {
    renderNotificationFeed();
  }
});

function renderNotificationFeed() {
  const user = currentUser();
  const container = document.getElementById("notif-feed");
  if (!user || !container) return;

  const list = Store.all("notifications")
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const head = `
    <div class="dash-aside-head">
      <h3 class="dash-aside-title">Recent Activity</h3>
      ${list.length ? `<button class="btn-ghost btn-ghost-sm" onclick="markAllRead()">Mark all read</button>` : ""}
    </div>`;

  const body = list.length ? `
    <ul class="notif-list">
      ${list.slice(0, 8).map((n) => `
        <li class="notif-row ${n.read ? "" : "unread"}">
          <span class="notif-row-dot" aria-hidden="true"></span>
          <div class="notif-row-main">
            <div class="notif-row-title">${esc(n.title)}</div>
            <div class="notif-row-msg muted small">${esc(n.message)}</div>
            <div class="notif-row-time">${timeAgo(n.createdAt)}</div>
          </div>
        </li>`).join("")}
    </ul>` : `
    <div class="dash-empty">
      <div class="empty-icon" aria-hidden="true">${ICONS.bell}</div>
      <p>No notifications yet. We'll let you know about approvals, claims and returns here.</p>
    </div>`;

  container.innerHTML = head + body;
}
