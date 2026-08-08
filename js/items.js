/* ============================================================
   CampusFind — Items (listings, search/filter/sort, details,
   report forms, matching)
   ============================================================ */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  whenReady(() => {
    const page = document.body.getAttribute("data-page") || "";
    if (page === "lost" || page === "found") initListings(page);
    if (page === "details") initDetails();
    if (page === "report-lost") initReport("lost");
    if (page === "report-found") initReport("found");
  });
});

/* ---------------- Listings (lost / found) ---------------- */
function initListings(type) {
  const grid = document.getElementById("items-grid");
  const countEl = document.getElementById("results-count");
  if (!grid) return;

  const state = {
    q: new URLSearchParams(window.location.search).get("q") || "",
    category: "all",
    location: "all",
    status: "all",
    date: "all",
    sort: "newest",
  };

  /* prefill search from hero */
  const searchInput = document.getElementById("filter-search");
  if (searchInput) searchInput.value = state.q;

  /* location options */
  const locations = [...new Set(Store.all("items").map((i) => i.location))].filter(Boolean).sort();
  const locSelect = document.getElementById("filter-location");
  if (locSelect) {
    locSelect.innerHTML =
      `<option value="all">All Locations</option>` +
      locations.map((l) => `<option value="${esc(l)}">${esc(l)}</option>`).join("");
  }

  const catSelect = document.getElementById("filter-category");
  if (catSelect) {
    catSelect.innerHTML =
      `<option value="all">All Categories</option>` +
      CATEGORIES.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  }

  function getFiltered() {
    const q = state.q.toLowerCase();
    let items = Store.all("items").filter((i) => i.type === type);

    if (q) {
      items = items.filter((i) =>
        [i.name, i.description, i.brand, i.location, i.category, i.identifyingFeatures]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (state.category !== "all") items = items.filter((i) => i.category === state.category);
    if (state.location !== "all") items = items.filter((i) => i.location === state.location);
    if (state.status !== "all") items = items.filter((i) => i.status === state.status);
    if (state.date === "week") items = items.filter((i) => Date.now() - new Date(i.createdAt).getTime() < 7 * 86400000);
    if (state.date === "month") items = items.filter((i) => Date.now() - new Date(i.createdAt).getTime() < 30 * 86400000);
    if (state.date === "3months") items = items.filter((i) => Date.now() - new Date(i.createdAt).getTime() < 90 * 86400000);

    const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    const byOldest = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
    const byUpdated = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);
    if (state.sort === "oldest") items.sort(byOldest);
    else if (state.sort === "updated") items.sort(byUpdated);
    else items.sort(byNewest);

    return items;
  }

  function render() {
    const items = getFiltered();
    countEl.textContent = items.length + (items.length === 1 ? " result" : " results");
    if (!items.length) {
      grid.innerHTML = emptyState(
        "No items found",
        "Try adjusting your search or filters, or check back soon.",
        `<a href="report-${type}.html" class="btn btn-primary">Report ${type === "lost" ? "Lost" : "Found"} Item</a>`
      );
      return;
    }
    grid.innerHTML = items.map(itemCard).join("");
  }

  document.getElementById("filter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    state.q = searchInput ? searchInput.value : "";
    render();
  });

  const bind = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => { state[key] = el.value; render(); });
  };
  bind("filter-category", "category");
  bind("filter-location", "location");
  bind("filter-status", "status");
  bind("filter-date", "date");
  bind("filter-sort", "sort");

  /* live search */
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.q = searchInput.value;
      render();
    });
  }

  const clearBtn = document.getElementById("clear-filters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.q = "";
      state.category = "all";
      state.location = "all";
      state.status = "all";
      state.date = "all";
      state.sort = "newest";
      if (searchInput) searchInput.value = "";
      [catSelect, locSelect].forEach((s) => s && (s.value = "all"));
      ["filter-status", "filter-date", "filter-sort"].forEach((id) => {
        const s = document.getElementById(id);
        if (s) s.value = "all";
      });
      render();
    });
  }

  grid.innerHTML = `<div class="skeleton skeleton-card"></div>`.repeat(3);
  if (countEl) countEl.textContent = "Loading results…";
  setTimeout(render, 280);
}

/* ---------------- Item details ---------------- */
function initDetails() {
  const id = new URLSearchParams(window.location.search).get("id");
  const wrap = document.getElementById("details-wrap");
  if (!wrap) return;

  const item = Store.get("items", id);
  if (!item) {
    wrap.innerHTML = emptyState("Item not found", "This report may have been removed.", `<a href="lost-items.html" class="btn btn-primary">Browse Items</a>`);
    return;
  }

  const user = currentUser();
  const isMine = user && item.reporterId === user.id;
  const otherItems = Store.all("items").filter((i) => i.id !== item.id && i.reporterId === item.reporterId);
  const hasActiveClaim = user && Store.all("claims").some((c) => c.itemId === item.id && c.claimantId === user.id);

  const reporter = Store.get("users", item.reporterId);
  const reporterType = reporter ? reporter.accountType : "—";

  const matches = item.type === "lost" ? findMatches(item) : [];

  wrap.innerHTML = `
  <div class="container details-wrap" style="padding:0">
    <a href="${item.type === "lost" ? "lost-items.html" : "found-items.html"}" class="btn btn-secondary btn-sm mb-16">&larr; Back to ${item.type === "lost" ? "Lost" : "Found"} Items</a>
    <div class="details-grid">
      <div class="details-img">${itemImage(item)}</div>
      <div class="details-panel">
        <div class="flex-between">
          <span class="type-tag ${item.type === "lost" ? "type-lost" : "type-found"}">${item.type.toUpperCase()} ITEM</span>
          ${statusBadge(item.status)}
        </div>
        <h1>${esc(item.name)}</h1>
        <div class="details-meta">
          <span class="report-id">${esc(item.reportId)}</span>
          <span class="muted small">&middot; reported ${timeAgo(item.createdAt)}</span>
        </div>

        <ul class="details-list">
          <li><span>Category</span><b>${esc(item.category)}</b></li>
          <li><span>Brand</span><b>${esc(item.brand || "—")}</b></li>
          <li><span>Color</span><b>${esc(item.color || "—")}</b></li>
          <li><span>Location</span><b>${esc(item.location || "—")}</b></li>
          <li><span>${item.type === "lost" ? "Date Lost" : "Date Found"}</span><b>${fmtDate(item.date)}${item.time ? " at " + esc(item.time) : ""}</b></li>
          <li><span>Reporter</span><b>${reporterType}${reporter ? " &middot; " + esc(reporter.fullName.split(" ")[0] + " " + (reporter.fullName.split(" ")[1] || "")) : ""}</b></li>
          ${item.storageLocation ? `<li><span>Stored At</span><b>${esc(item.storageLocation)}</b></li>` : ""}
        </ul>

        <p class="desc-box">${esc(item.description || "No description provided.")}</p>

        ${item.identifyingFeatures ? `<p class="small muted"><b>Identifying features:</b> ${esc(item.identifyingFeatures)}</p>` : ""}
        ${item.additionalNotes ? `<p class="small muted mt-8"><b>Notes:</b> ${esc(item.additionalNotes)}</p>` : ""}
        ${item.status === "rejected" && item.rejectReason ? `<p class="small mt-8" style="color:var(--danger)"><b>Rejection reason:</b> ${esc(item.rejectReason)}</p>` : ""}

        <div class="details-actions">
          ${item.type === "found"
            ? (user && canLogin(user) && !isMine && item.status === "verified"
              ? (hasActiveClaim
                ? `<button class="btn btn-secondary" disabled>Claim Submitted</button>`
                : `<button class="btn btn-primary btn-lg" onclick="openClaimForm('${item.id}')">Is this your item? &middot; Submit Claim</button>`)
              : (user && isMine ? `<span class="badge badge-inactive">This is your listing</span>` : `<a href="login.html" class="btn btn-primary btn-lg">Log in to claim this item</a>`))
            : ""}
          ${isMine ? `<a href="dashboard.html" class="btn btn-secondary btn-lg">Track in Dashboard</a>` : ""}
        </div>
      </div>
    </div>
  </div>`;

  /* Possible matches for lost items */
  if (item.type === "lost" && matches.length) {
    const matchHtml = `
    <div class="match-box" style="margin:28px auto 0;max-width:980px">
      <h3><span aria-hidden="true">${ICONS.flash}</span> Possible Match Found</h3>
      <p>${matches.length} found item${matches.length > 1 ? "s" : ""} may match your lost item. Matching is not automatic — contact the school office to verify.</p>
      <div class="cards-grid">
        ${matches.map((m) => matchCard(m.item, m.score)).join("")}
      </div>
    </div>`;
    wrap.insertAdjacentHTML("beforeend", matchHtml);
  }
}

/* ---------------- Report forms ---------------- */
function initReport(type) {
  const form = document.getElementById("report-form");
  if (!form) return;

  /* redirect if not logged in */
  if (!currentUser()) {
    toast("Please log in to report an item.", "warning");
    setTimeout(() => {
      window.location.href = "login.html?redirect=" + (type === "lost" ? "report-lost.html" : "report-found.html");
    }, 500);
    return;
  }

  const catSelect = form.querySelector("[name='category']");
  catSelect.innerHTML = CATEGORIES.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");

  const dateInput = form.querySelector("[name='date']");
  dateInput.max = new Date().toISOString().split("T")[0];

  const imgInput = form.querySelector("[name='image']");
  const imgPreview = document.getElementById("img-preview");
  let uploadedImage = null;

  if (imgInput) {
    imgInput.addEventListener("change", () => {
      const file = imgInput.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast("Please choose a valid image file.", "error");
        imgInput.value = "";
        return;
      }
      compressImage(file, 420, (dataUrl) => {
        uploadedImage = dataUrl;
        if (imgPreview) {
          imgPreview.src = dataUrl;
          imgPreview.style.display = "block";
        }
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = currentUser();
    if (!user) return;

    let valid = true;
    const req = ["name", "category", "date", "location"];
    if (type === "found") req.push("storageLocation");
    req.forEach((name) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el) return;
      const g = el.closest(".form-group");
      const bad = !sanitizeInput(el.value);
      g.classList.toggle("invalid", bad);
      if (bad) valid = false;
    });

    if (!valid) {
      toast("Please fill in the required fields.", "error");
      return;
    }

    let imageUrl = null;
    if (uploadedImage) {
      try {
        imageUrl = await uploadImage(uploadedImage, "items");
      } catch (err) {
        toast("Photo could not be uploaded — report saved without it.", "warning");
      }
    }

    const item = Store.insert("items", {
      id: uid("I"),
      reportId: await Store.nextReportId(type),
      type,
      name: sanitizeInput(form["name"].value),
      category: form["category"].value,
      description: sanitizeInput(form["description"].value),
      brand: sanitizeInput(form["brand"].value),
      color: sanitizeInput(form["color"].value),
      location: sanitizeInput(form["location"].value),
      date: new Date(form["date"].value).toISOString(),
      time: sanitizeInput(form["time"].value),
      image: imageUrl,
      status: "pending",
      reporterId: user.id,
      identifyingFeatures: sanitizeInput(form["identifyingFeatures"].value),
      contactInfo: sanitizeInput(form["contactInfo"].value),
      storageLocation: type === "found" ? sanitizeInput(form["storageLocation"].value) : "",
      additionalNotes: sanitizeInput(form["additionalNotes"].value),
      rejectReason: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    logActivity(user.id, "Submitted " + type + " report", item.reportId + " (" + item.name + ")");
    addNotification(user.id, type === "lost" ? "Report Submitted" : "Report Submitted", `Your report ${item.reportId} is now Pending Verification. An administrator will review it shortly.`);

    /* find possible matches after submitting a lost item */
    let matchHtml = "";
    if (type === "lost") {
      const matches = findMatches(item);
      if (matches.length) {
        matchHtml = `
        <div class="match-box" style="text-align:left;margin-top:22px">
<h3><span aria-hidden="true">${ICONS.flash}</span> Possible Match Found</h3>
          <p>We detected ${matches.length} found item${matches.length > 1 ? "s" : ""} that may match your lost item. A notification was sent to your dashboard.</p>
          <div class="cards-grid">
            ${matches.slice(0, 3).map((m) => matchCard(m.item, m.score)).join("")}
          </div>
        </div>`;
      } else {
        addNotification(user.id, "Still Looking", "No strong matches found for your lost item yet. Check back soon — we'll notify you when something appears.");
      }
    }

    form.parentElement.innerHTML = `
      <div class="confirm-page" style="max-width:640px">
        <div class="confirm-check" aria-hidden="true">${ICONS.check}</div>
        <h1>${type === "lost" ? "Lost item reported" : "Found item reported"}!</h1>
        <p>Your report has been submitted and is now <b>Pending Verification</b>. An administrator will review it shortly.</p>
        <div class="confirm-ref">${item.reportId}</div>
        <p class="muted small">Save this reference ID to track your report.</p>
        ${matchHtml}
        <div class="flex-between" style="justify-content:center;margin-top:24px">
          <a href="dashboard.html" class="btn btn-primary">Go to My Dashboard</a>
          <a href="${type === "lost" ? "report-found.html" : "report-lost.html"}" class="btn btn-secondary">Report Another</a>
        </div>
      </div>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
