/* ============================================================
   CampusFind — Claim Requests
   ============================================================ */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.getAttribute("data-page") === "claim") whenReady(initClaimForm);
});

/* Called from item-details page */
function openClaimForm(itemId) {
  const item = Store.get("items", itemId);
  if (!item) return;
  const user = currentUser();
  if (!user || !canLogin(user)) {
    window.location.href = "login.html?redirect=item-details.html?id=" + itemId;
    return;
  }

  openModal(`
    <div data-title="Submit Claim &middot; ${esc(item.name)}"></div>
    <div data-body>
      <p class="modal-text">You are claiming this found item: <b>${esc(item.reportId)}</b> (${esc(item.location)}). Our team will review your claim and compare it with the owner's identifying details.</p>
      <form id="claim-form" novalidate>
        <div class="form-group">
          <label for="cf-claim-name">Claimant Name <span class="req">*</span></label>
          <input name="claimName" id="cf-claim-name" value="${esc(user.fullName)}" required>
        </div>
        <div class="form-group">
          <label for="cf-claim-id">Student/Staff ID <span class="req">*</span></label>
          <input name="claimSchoolId" id="cf-claim-id" value="${esc(user.schoolId)}" required>
        </div>
        <div class="form-group">
          <label for="cf-claim-email">School Email <span class="req">*</span></label>
          <input type="email" name="claimEmail" id="cf-claim-email" value="${esc(user.email)}" required>
        </div>
        <div class="form-group">
          <label for="cf-explain">Why do you believe this item is yours? <span class="req">*</span></label>
          <textarea name="claimExplanation" id="cf-explain" placeholder="Describe the situation — when and where you lost it, etc." required></textarea>
        </div>
        <div class="form-group">
          <label for="cf-details">Identifying details only the owner would know <span class="req">*</span></label>
          <textarea name="claimDetails" id="cf-details" placeholder="Scratches, stickers, marks, contents, etc." required></textarea>
        </div>
        <div class="form-group">
          <label for="cf-evidence">Supporting image/document (optional)</label>
          <input type="file" name="claimEvidence" id="cf-evidence" accept="image/*">
          <span class="hint">Photo of the item, receipt, or other proof.</span>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Submit Claim</button>
        </div>
      </form>
    </div>`);

  const form = document.getElementById("claim-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const explanation = sanitizeInput(form["claimExplanation"].value);
    const details = sanitizeInput(form["claimDetails"].value);
    const evidenceFile = form["claimEvidence"].files[0];

    if (explanation.length < 10 || details.length < 3) {
      toast("Please provide a proper explanation and identifying details.", "error");
      return;
    }

    const already = Store.all("claims").some(
      (c) => c.itemId === itemId && c.claimantId === user.id && c.status !== "rejected"
    );
    if (already) {
      toast("You already have an active claim for this item.", "warning");
      closeModal();
      return;
    }

    const processEvidence = async (evidence) => {
      const claim = Store.insert("claims", {
        id: uid("C"),
        claimId: await Store.nextClaimId(),
        itemId,
        claimantId: user.id,
        explanation,
        identifyingDetails: details,
        evidence,
        status: "pending",
        adminNotes: "",
        createdAt: new Date().toISOString(),
      });

      addNotification(user.id, "Claim Submitted", `Your claim ${claim.claimId} for "${item.name}" is now Pending Review.`);
      logActivity(user.id, "Submitted claim", claim.claimId + " for " + item.reportId);

      /* notify the finder, if different person */
      if (item.reporterId !== user.id) {
        addNotification(item.reporterId, "New Claim on Your Item", `Someone submitted a claim (${claim.claimId}) for your found item "${item.name}".`);
      }

      closeModal();
      toast("Claim submitted! Track its status from your dashboard.", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html?tab=claims";
      }, 900);
    };

    if (evidenceFile && evidenceFile.type.startsWith("image/")) {
      compressImage(evidenceFile, 420, async (dataUrl) => {
        let url = "";
        try {
          url = await uploadImage(dataUrl, "evidence");
        } catch (err) {
          toast("Evidence image could not be uploaded — claim submitted without it.", "warning");
        }
        processEvidence(url);
      });
    } else {
      processEvidence("");
    }
  });
}

/* ---------------- Claim form page (standalone) ---------------- */
function initClaimForm() {
  const itemId = new URLSearchParams(window.location.search).get("item");
  const container = document.getElementById("claim-page");
  if (!container) return;
  const user = requireAuth();
  if (!user) return;

  const item = Store.get("items", itemId);
  if (!item || item.type !== "found") {
    container.innerHTML = emptyState("Invalid claim target", "The item you're trying to claim doesn't exist.");
    return;
  }
  container.innerHTML = "";
  document.title = "Claim " + item.name + " | CampusFind";
  const btn = document.createElement("button");
  btn.className = "btn btn-primary btn-lg";
  btn.textContent = "Open Claim Form";
  btn.onclick = () => openClaimForm(item.id);
  container.appendChild(btn);
  btn.click();
}
