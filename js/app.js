/* ============================================================
   CampusFind — Core Application (data layer, helpers, UI shell)
   All storage goes through the Store object so it can later be
   swapped for a real backend/API.
   ============================================================ */
"use strict";

/* ---------------- Theme system ---------------- */
(function initTheme() {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600&display=swap";
  document.head.appendChild(link);
})();

const THEME_KEY = "campusfind_theme";

function getTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeIcons(theme);
}

function toggleTheme() {
  applyTheme(getTheme() === "light" ? "dark" : "light");
}

function updateThemeIcons(theme) {
  const ico = theme === "light" ? ICONS.moon : ICONS.sun;
  document.querySelectorAll(".theme-ico").forEach((el) => {
    el.innerHTML = ico;
  });
}

const CATEGORIES = [
  "Electronics",
  "Wallet/Purse",
  "ID/Card",
  "Keys",
  "Clothing",
  "Books",
  "School Supplies",
  "Accessories",
  "Documents",
  "Other",
];

const CATEGORY_ICONS = {
  Electronics: '<svg class="ic" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="9" rx="1.5"/><path d="M3 18h18"/><path d="M8 21h8"/></svg>',
  "Wallet/Purse": '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></svg>',
  "ID/Card": '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 17a4 4 0 0 1 6 0"/><path d="M16 9h3"/><path d="M16 13h3"/></svg>',
  Keys: '<svg class="ic" viewBox="0 0 24 24"><circle cx="8.5" cy="15" r="4.5"/><path d="M11.8 11.8 20 4.5"/><path d="m15 8 2.5 2.5"/><path d="m18 5-2 2"/></svg>',
  Clothing: '<svg class="ic" viewBox="0 0 24 24"><path d="M9 4 3 8l3 3 1-1v10h10V10l1 1 3-3-6-4a2.5 2.5 0 0 1-5 0z"/></svg>',
  Books: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 6c-1.8-1.4-4.5-2-7.5-1.2v17c3-.8 5.7-.1 7.5 1.2z"/><path d="M12 6v17c1.8-1.3 4.5-2 7.5-1.2v-17C16.5.4 13.8 1 12 2.8z"/></svg>',
  "School Supplies": '<svg class="ic" viewBox="0 0 24 24"><path d="m15 5 5 5L8 21H3v-5z"/><path d="m13 7 5 5"/></svg>',
  Accessories: '<svg class="ic" viewBox="0 0 24 24"><circle cx="7" cy="14" r="3.5"/><circle cx="17" cy="14" r="3.5"/><path d="M10.5 14h3"/><path d="M5.5 14 4 8.5"/><path d="M18.5 14 20 8.5"/></svg>',
  Documents: '<svg class="ic" viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 13h5"/><path d="M10 17h5"/></svg>',
  Other: '<svg class="ic" viewBox="0 0 24 24"><path d="M21 8.5v9l-9 5-9-5v-9"/><path d="M3 8.5 12 13l9-4.5"/><path d="M12 3v10"/></svg>',
};

/* Clean, consistent line icons for the sidebar / header navigation */
const ICONS = {
  menu: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>',
  close: '<svg class="ic" viewBox="0 0 24 24"><path d="m6 6 12 12"/><path d="M18 6 6 18"/></svg>',
  home: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>',
  search: '<svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  pin: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  help: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.6 2.6 0 0 1 5.1-.8c0 1.7-2.4 2.2-2.4 3.8"/><path d="M12 16.8h.01"/></svg>',
  info: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16.2v-5"/><path d="M12 8h.01"/></svg>',
  reportLost: '<svg class="ic" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 11.5V18"/><path d="M8.8 14.7h6.4"/></svg>',
  reportFound: '<svg class="ic" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9.5 14.5 1.8 1.8 3.4-3.4"/></svg>',
  bell: '<svg class="ic" viewBox="0 0 24 24"><path d="M18.2 8a6.2 6.2 0 0 0-12.4 0c0 7-3.3 8.2-3.3 8.2h18.9s-3.2-1.2-3.2-8.2"/><path d="M13.8 20a2 2 0 0 1-3.6 0"/></svg>',
  moon: '<svg class="ic" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  sun: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/></svg>',
  logout: '<svg class="ic" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
  user: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  userPlus: '<svg class="ic" viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6"/><path d="M16 11h6"/></svg>',
  dashboard: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  calendar: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 10h18"/></svg>',
  lock: '<svg class="ic" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  check: '<svg class="ic" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  clipboard: '<svg class="ic" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a3 3 0 0 1 6 0"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>',
  chart: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M7 17v-6"/><path d="M12 17V7"/><path d="M17 17v-9"/></svg>',
  doc: '<svg class="ic" viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5"/><path d="M10 16h5"/></svg>',
  note: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  users: '<svg class="ic" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 3.6a3.5 3.5 0 0 1 0 6.8"/><path d="M16 14a5 5 0 0 1 5 5"/></svg>',
  eye: '<svg class="ic" viewBox="0 0 24 24"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.2 3.9"/><path d="M6.6 6.6A16.5 16.5 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  trash: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 7V4h6v3"/><path d="M6 7l1 14h10l1-14"/></svg>',
  returned: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/></svg>',
  flash: '<svg class="ic" viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
};

const STATUS_META = {
  pending: { label: "Pending Verification", cls: "badge-pending" },
  verified: { label: "Verified", cls: "badge-verified" },
  rejected: { label: "Rejected", cls: "badge-rejected" },
  "claim-approved": { label: "Claim Approved", cls: "badge-claim-approved" },
  returned: { label: "Returned", cls: "badge-returned" },
  active: { label: "Active", cls: "badge-active" },
  suspended: { label: "Suspended", cls: "badge-suspended" },
};

const CLAIM_STATUS_META = {
  pending: { label: "Pending Review", cls: "badge-pending" },
  investigation: { label: "Under Investigation", cls: "badge-investigation" },
  approved: { label: "Approved", cls: "badge-approved" },
  rejected: { label: "Rejected", cls: "badge-rejected" },
  completed: { label: "Completed", cls: "badge-completed" },
};

/* Seed data has moved to supabase/schema.sql — the app now reads and
   writes everything through Supabase (see the Store object below). */

/* ---------------- Storage layer (Supabase-backed) --------------
   The app keeps a synchronous in-memory snapshot of every collection
   so all existing call sites work unchanged. Writes are applied to
   memory immediately (snappy UI) and mirrored to Supabase in the
   background. Store.init() hydrates the snapshot from the database
   and restores the auth session on page load. */
const Store = {
  SESSION_KEY: "campusfind_session",
  client: null,
  data: { users: [], items: [], claims: [], notifications: [], activityLogs: [], settings: [] },
  bootError: null,
  ready: null,

  TABLE_OF: {
    users: "users",
    items: "items",
    claims: "claims",
    notifications: "notifications",
    activityLogs: "activity_logs",
    settings: "settings",
  },

  /* snake_case (database) → camelCase (app) column names */
  COLUMN_MAP: {
    users: { full_name: "fullName", school_id: "schoolId", account_type: "accountType", created_at: "createdAt" },
    items: { report_id: "reportId", reporter_id: "reporterId", identifying_features: "identifyingFeatures", contact_info: "contactInfo", storage_location: "storageLocation", additional_notes: "additionalNotes", reject_reason: "rejectReason", created_at: "createdAt", updated_at: "updatedAt" },
    claims: { claim_id: "claimId", item_id: "itemId", claimant_id: "claimantId", identifying_details: "identifyingDetails", admin_notes: "adminNotes", created_at: "createdAt", updated_at: "updatedAt" },
    notifications: { user_id: "userId", created_at: "createdAt" },
    activityLogs: { admin_id: "adminId" },
    settings: { site_name: "siteName", contact_email: "contactEmail", auto_match: "autoMatch", notify_finders: "notifyFinders" },
  },

  dbToObj(coll, row) {
    const map = this.COLUMN_MAP[coll] || {};
    const obj = {};
    Object.keys(row).forEach((k) => { obj[map[k] || k] = row[k]; });
    return obj;
  },

  objToDb(coll, obj) {
    const map = this.COLUMN_MAP[coll] || {};
    const rev = {};
    Object.keys(map).forEach((db) => { rev[map[db]] = db; });
    const row = {};
    Object.keys(obj).forEach((k) => { row[rev[k] || k] = obj[k]; });
    return row;
  },

  /* ---------- boot ---------- */
  init() {
    this.ready = (async () => {
      try {
        /* Resolve config.js relative to app.js's own folder (the js/ dir) so
           it works from any page depth and subpath deployments. */
        let cfgPath = "js/config.js";
        const appScript = document.querySelector('script[src*="app.js"]');
        if (appScript && appScript.src) {
          const dir = appScript.src.substring(0, appScript.src.lastIndexOf("/") + 1);
          cfgPath = new URL("config.js", dir).href;
        }
        await loadScript(cfgPath);
        if (!window.CAMPUSFIND_CONFIG || !window.CAMPUSFIND_CONFIG.supabaseUrl || !window.CAMPUSFIND_CONFIG.supabaseAnonKey) {
          throw new Error("Supabase is not configured. Open js/config.js and paste your project URL and anon key.");
        }
        this.client = await initSupabaseClient(window.CAMPUSFIND_CONFIG);
        await this.hydrate();
        await this.restoreSession();
      } catch (e) {
        this.bootError = e.message || String(e);
        console.error("CampusFind boot error:", e);
      } finally {
        this.hydrated = true;
      }
    })();
    return this.ready;
  },

  async hydrate() {
    const tables = this.TABLE_OF;
    for (const coll of Object.keys(tables)) {
      const { data, error } = await this.client.from(tables[coll]).select("*");
      if (error) throw error;
      this.data[coll] = (data || []).map((r) => this.dbToObj(coll, r));
    }
  },

  async restoreSession() {
    /* Capture the auth-flow event (email confirmation / password reset)
       from the URL hash BEFORE supabase-js consumes and strips it. */
    const hash = window.location.hash || "";
    if (hash.includes("type=recovery")) this._authUrlEvent = "recovery";
    else if (hash.includes("type=signup")) this._authUrlEvent = "signup";

    const { data: { session } } = await this.client.auth.getSession();
    if (session && session.user) {
      const profile = this.get("users", session.user.id);
      if (profile && profile.status === "active") {
        localStorage.setItem(this.SESSION_KEY, session.user.id);
        setRoleCookie(profile);
        setCachedProfile(profile);
      } else {
        await this.client.auth.signOut();
        localStorage.removeItem(this.SESSION_KEY);
        setRoleCookie(null);
        setCachedProfile(null);
      }
    }
    this.client.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem(this.SESSION_KEY);
        setCachedProfile(null);
      } else if (event === "SIGNED_IN" && nextSession) {
        const profile = this.data.users.find((u) => u.id === nextSession.user.id);
        if (profile) {
          localStorage.setItem(this.SESSION_KEY, nextSession.user.id);
          setRoleCookie(profile);
          setCachedProfile(profile);
        } else {
          /* Brand-new account (e.g. just confirmed via email) — fetch its profile. */
          this.client
            .from("users")
            .select("*")
            .eq("id", nextSession.user.id)
            .maybeSingle()
            .then(({ data }) => {
              if (data) {
                const cached = this.dbToObj("users", data);
                this.data.users.push(cached);
                localStorage.setItem(this.SESSION_KEY, nextSession.user.id);
                setCachedProfile(cached);
              }
            })
            .catch(() => {});
        }
      }
    });
  },

  /* ---------- synchronous snapshot API (unchanged for call sites) ---------- */
  all(coll) { return this.data ? this.data[coll] || [] : []; },
  get(coll, id) { return this.data ? (this.data[coll] || []).find((r) => r.id === id) : undefined; },

  insert(coll, record) {
    this.data[coll].push(record);
    this.persist(coll, record, "insert");
    return record;
  },

  update(coll, id, patch) {
    const rec = this.get(coll, id);
    if (rec) Object.assign(rec, patch);
    if (rec) this.persist(coll, rec, "update");
    return rec;
  },

  remove(coll, id) {
    this.data[coll] = this.data[coll].filter((r) => r.id !== id);
    this.persist(coll, { id }, "remove");
  },

  /* ---------- async write-through ---------- */
  persist(coll, record, op) {
    if (!this.client) return;
    const table = this.TABLE_OF[coll];
    const row = this.objToDb(coll, record);
    let q;
    if (op === "remove") q = this.client.from(table).delete().eq("id", record.id);
    else if (op === "update") q = this.client.from(table).update(row).eq("id", record.id);
    else q = this.client.from(table).insert(row);
    q.then(({ error }) => {
      if (error) {
        console.error("Supabase write failed:", coll, error);
        toast("Could not save to the server. Check your connection.", "error");
      }
    });
  },

  /* ---------- server-side helpers ---------- */
  async nextSeq(prefix) {
    try {
      const { data, error } = await this.client.rpc("next_counter", { cname: prefix });
      if (error) throw error;
      return String(data).padStart(4, "0");
    } catch (e) {
      const used = this.data.items.filter((i) => i.reportId && i.reportId.startsWith(prefix)).length;
      return String(used + 1).padStart(4, "0");
    }
  },

  async nextReportId(type) {
    const year = new Date().getFullYear();
    const prefix = (type === "lost" ? "LF" : "FD") + "-" + year;
    return prefix + "-" + (await this.nextSeq(prefix));
  },

  async nextClaimId() {
    const year = new Date().getFullYear();
    return "CL-" + year + "-" + (await this.nextSeq("CL-" + year));
  },

  async saveSettings(obj) {
    const row = this.objToDb("settings", Object.assign({ id: 1 }, obj));
    const { error } = await this.client.from("settings").upsert(row);
    if (error) throw error;
    this.data.settings = [this.dbToObj("settings", row)];
  },

  async resetDemo() {
    const { error } = await this.client.rpc("reset_demo_data");
    if (error) throw error;
    await this.hydrate();
  },
};

/* ---------------- Supabase client bootstrap ---------------- */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

async function initSupabaseClient(cfg) {
  if (!window.supabase) {
    await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
  }
  return window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
}

/* Run fn once the store has been hydrated (or after a boot failure). */
function whenReady(fn) {
  Store.ready.then(() => {
    if (Store.bootError && !whenReady._warned) {
      whenReady._warned = true;
      toast(Store.bootError, "error");
    }
    fn();
  });
}

/* After an email-confirmation or password-reset link, Supabase redirects the
   user back to the site with tokens in the URL hash. This finishes those
   flows with proper UI. */
function handleAuthRedirect() {
  const ev = Store._authUrlEvent;
  if (!ev) return;

  if (ev === "signup") {
    toast("Email confirmed! Welcome to CampusFind.", "success");
    if (!/dashboard\.html$/.test(window.location.pathname)) {
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1400);
    }
    return;
  }

  if (ev === "recovery") {
    const m = openModal(`
      <div data-title="Set a New Password"></div>
      <div data-body>
        <p class="modal-text">Choose a new password for your account.</p>
        <div class="form-group">
          <label for="reset-pw">New password</label>
          <span class="pw-wrap">
            <input type="password" id="reset-pw" placeholder="At least 8 characters">
            <button type="button" class="pw-toggle" onclick="togglePw('reset-pw', this)" aria-label="Show password" title="Show password"><span>${ICONS.eye}</span></button>
          </span>
        </div>
        <div class="form-group">
          <label for="reset-pw2">Confirm new password</label>
          <input type="password" id="reset-pw2" placeholder="Re-enter your password">
        </div>
        <div class="confirm-btns">
          <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" id="reset-pw-save">Update Password</button>
        </div>
      </div>`);
    const save = m.querySelector("#reset-pw-save");
    save.addEventListener("click", async () => {
      const pw = document.getElementById("reset-pw").value;
      const pw2 = document.getElementById("reset-pw2").value;
      if (pw.length < 8) { toast("Password must be at least 8 characters.", "error"); return; }
      if (pw !== pw2) { toast("Passwords do not match.", "error"); return; }
      save.disabled = true;
      const { error } = await Store.client.auth.updateUser({ password: pw });
      save.disabled = false;
      if (error) {
        toast("Could not update password: " + error.message, "error");
        return;
      }
      closeModal();
      toast("Password updated! You can now log in.", "success");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
    });
  }
}

/* Upload a compressed data URL to Supabase Storage and return its public URL. */
async function uploadImage(dataUrl, folder) {
  if (!Store.client) throw new Error("Not connected to the server.");
  const blob = await (await fetch(dataUrl)).blob();
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const path = (folder || "items") + "/" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + "." + ext;
  const { data, error } = await Store.client.storage.from("item-images").upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  return Store.client.storage.from("item-images").getPublicUrl(path).data.publicUrl;
}

/* ---------------- Utility helpers ---------------- */
function uid(prefix) {
  return prefix + "-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase();
}

/* Report/claim reference IDs are now generated server-side in
   sequential order via Store.nextReportId() / Store.nextClaimId(). */
function fmtDate(iso, withTime) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  const opts = withTime
    ? { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : { year: "numeric", month: "short", day: "numeric" };
  return d.toLocaleDateString(undefined, opts);
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return m + " min ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " hr" + (h > 1 ? "s" : "") + " ago";
  const d = Math.floor(h / 24);
  if (d < 30) return d + " day" + (d > 1 ? "s" : "") + " ago";
  const mo = Math.floor(d / 30);
  if (mo < 12) return mo + " month" + (mo > 1 ? "s" : "") + " ago";
  return Math.floor(mo / 12) + " yr ago";
}

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeInput(str) {
  return String(str == null ? "" : str).trim().replace(/[<>]/g, "");
}

/* Password hashing is now handled server-side by Supabase Auth
   (bcrypt). No credential material ever touches the client. */

function wordOverlap(a, b) {
  const words = (s) =>
    String(s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3);
  const wa = new Set(words(a));
  const wb = words(b);
  if (!wb.length || !wa.size) return 0;
  return wb.filter((w) => wa.has(w)).length / Math.min(wa.size, wb.length || 1);
}

function colorSimilar(a, b) {
  if (!a || !b) return false;
  return String(a).toLowerCase() === String(b).toLowerCase();
}

/* ---------------- Auth / Session ---------------- */
const PROFILE_CACHE_KEY = "campusfind_profile";

/* Remembers the last-known profile so the shell can render the logged-in
   state instantly on the next page load (before Supabase data arrives).
   Display only — the real session/authorization still comes from Supabase. */
function setCachedProfile(user) {
  try {
    if (user) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (e) {}
}

function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function currentUser() {
  const uidSession = localStorage.getItem(Store.SESSION_KEY);
  if (!uidSession) return null;
  const found = Store.get("users", uidSession);
  if (found) return found;
  /* Pre-hydration fallback only: the last-known profile, so the sidebar
     never flashes the logged-out state while Supabase data is loading.
     Once hydration has finished (success or failure) the in-memory store
     is the sole source of truth. */
  if (Store.hydrated) return null;
  const cached = getCachedProfile();
  return cached && cached.id === uidSession ? cached : null;
}

function setSession(user) {
  localStorage.setItem(Store.SESSION_KEY, user.id);
  setCachedProfile(user);
}

function clearSession() {
  localStorage.removeItem(Store.SESSION_KEY);
  setCachedProfile(null);
}

function logout() {
  if (Store.client) Store.client.auth.signOut().catch(() => {});
  clearSession();
  setRoleCookie(null);
  const isAdmin = window.location.pathname.includes("/admin/");
  window.location.href = isAdmin ? "../index.html" : "index.html";
}

/* A convenience cookie (cf_role) lets Vercel middleware gate the /admin/*
   pages. It is NOT the security layer — Supabase Row Level Security is.
   This only stops casual visitors from ever seeing the admin files. */
function setRoleCookie(user) {
  try {
    const role = user ? user.role : "";
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    if (role === "admin" || role === "staff") {
      document.cookie = "cf_role=" + role + "; path=/; max-age=2592000; SameSite=Lax" + secure;
    } else {
      document.cookie = "cf_role=; path=/; max-age=0; SameSite=Lax" + secure;
    }
  } catch (e) { /* cookies unavailable — middleware will simply redirect */ }
}

function requireAuth() {
  const u = currentUser();
  if (!u) {
    window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname.split("/").pop());
    return null;
  }
  return u;
}

function isStaffOrAdmin(user) {
  return !!user && (user.role === "admin" || user.role === "staff");
}

function requireAdmin() {
  const u = currentUser();
  if (!u) {
    window.location.href = "../login.html";
    return null;
  }
  if (!isStaffOrAdmin(u)) {
    window.location.href = "../index.html";
    return null;
  }
  return u;
}

function canLogin(user) {
  return user && user.status === "active";
}

/* ---------------- Notifications ---------------- */
function addNotification(userId, title, message) {
  Store.insert("notifications", {
    id: uid("N"),
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

function unreadCount(userId) {
  return Store.all("notifications").filter((n) => n.userId === userId && !n.read).length;
}

function logActivity(adminId, action, target) {
  Store.insert("activityLogs", {
    id: uid("L"),
    adminId,
    action,
    target,
    timestamp: new Date().toISOString(),
  });
}

/* ---------------- Toasts ---------------- */
function toast(message, type) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  t.className = "toast " + (type || "info");
  const icons = { success: "\u2713", error: "\u2715", warning: "\u26A0", info: "\u2139" };
  t.innerHTML = `<span aria-hidden="true">${icons[type] || icons.info}</span><span>${esc(message)}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add("hide");
    setTimeout(() => t.remove(), 300);
  }, 3800);
}

/* ---------------- Modals & confirm ---------------- */
function openModal(html) {
  let overlay = document.getElementById("modal-root");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modal-root";
    document.body.appendChild(overlay);
  }
  overlay.className = "modal-overlay open";
  overlay.innerHTML = `<div class="modal"><div class="modal-head"><h3 id="modal-title"></h3><button class="modal-close" onclick="closeModal()">&times;</button></div><div id="modal-body"></div></div>`;
  const tmp = document.createElement("div");
  tmp.innerHTML = html.trim();
  const title = tmp.querySelector("[data-title]");
  const body = tmp.querySelector("[data-body]");
  if (title) overlay.querySelector("#modal-title").innerHTML = title.getAttribute("data-title");
  if (body) overlay.querySelector("#modal-body").innerHTML = body.innerHTML;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  return overlay.querySelector(".modal");
}

function closeModal() {
  const overlay = document.getElementById("modal-root");
  if (overlay) overlay.className = "modal-overlay";
}

function confirmDialog(title, message, onConfirm, confirmLabel, danger) {
  const m = openModal(`
    <div data-title="${esc(title)}"></div>
    <div data-body>
      <p class="modal-text">${esc(message)}</p>
      <div class="confirm-btns">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="confirm-ok">${esc(confirmLabel || "Confirm")}</button>
      </div>
    </div>`);
  m.querySelector("#confirm-ok").addEventListener("click", () => {
    closeModal();
    onConfirm();
  });
}

/* ---------------- Status badges ---------------- */
function statusBadge(status, isClaim) {
  const meta = isClaim ? CLAIM_STATUS_META[status] : STATUS_META[status];
  if (!meta) return "";
  return `<span class="badge ${meta.cls}">${meta.label}</span>`;
}

/* ---------------- Image helpers ---------------- */
function itemImage(item) {
  if (item.image) return `<img src="${item.image}" alt="${esc(item.name)}" loading="lazy" decoding="async">`;
  return `<span class="no-img" aria-hidden="true">${CATEGORY_ICONS[item.category] || ICONS.reportLost}</span>`;
}

function compressImage(file, maxSize, cb) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      cb(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => cb(null);
    img.src = e.target.result;
  };
  reader.onerror = () => cb(null);
  reader.readAsDataURL(file);
}

/* ---------------- Matching system ---------------- */
function computeMatchScore(lost, found) {
  let score = 0;
  if (lost.category === found.category) score += 30;
  if (lost.location && found.location && String(lost.location).toLowerCase() === String(found.location).toLowerCase()) score += 15;
  if (colorSimilar(lost.color, found.color)) score += 10;
  if (lost.brand && found.brand && String(lost.brand).toLowerCase() === String(found.brand).toLowerCase()) score += 15;
  score += Math.round(wordOverlap(lost.name, found.name) * 20);
  score += Math.round(wordOverlap(lost.description, found.description) * 10);
  return score;
}

function findMatches(lostItem, threshold) {
  const th = threshold || 45;
  const matches = Store.all("items")
    .filter((i) => i.type === "found" && i.id !== lostItem.id)
    .filter((i) => i.status === "verified" || i.status === "pending")
    .map((f) => ({ item: f, score: computeMatchScore(lostItem, f) }))
    .filter((m) => m.score >= th)
    .sort((a, b) => b.score - a.score);
  return matches.slice(0, 4);
}

/* ---------------- Charts ---------------- */
function renderBarChart(el, data, color) {
  const max = Math.max(...data.map((d) => d.value), 1);
  el.innerHTML = "";
  data.forEach((d) => {
    const col = document.createElement("div");
    col.className = "bar-col";
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = Math.max(3, (d.value / max) * 100) + "%";
    if (color) bar.style.background = color;
    bar.title = d.label + ": " + d.value;
    col.innerHTML = `<div class="bar-val">${d.value}</div>`;
    col.insertBefore(bar, col.firstChild);
    const lbl = document.createElement("div");
    lbl.className = "bar-label";
    lbl.textContent = d.label;
    col.appendChild(lbl);
    el.appendChild(col);
  });
}

/* ============================================================
   Global UI shell (side navigation + top bar, notifications)
   ============================================================ */
function renderNav() {
  const nav = document.getElementById("global-nav");
  if (!nav) return;

  /* If the shell is re-rendered (e.g. after data hydration), keep any page
     content that was already moved into the frame. */
  const previousFrame = nav.querySelector(".site-main-content");
  const preserved = previousFrame ? Array.from(previousFrame.children) : [];

  const user = currentUser();
  const page = document.body.getAttribute("data-page") || "";
  const isAuthPage = ["login", "register"].includes(page);

  const themeBtn = `<button class="icon-round theme-toggle" onclick="toggleTheme()" title="Toggle dark mode" aria-label="Toggle dark mode"><span class="theme-ico"></span></button>`;

  /* ---------- Auth pages: keep a compact top bar ---------- */
  if (isAuthPage) {
    nav.classList.add("navbar");
    nav.innerHTML = `
      <div class="navbar-inner container">
        <a href="index.html" class="brand">
          <span class="brand-icon" aria-hidden="true">${ICONS.search}</span>
          <span>Campus<em>Find</em></span>
        </a>
        <div class="nav-actions">
          ${themeBtn}
          <a href="index.html" class="btn btn-secondary btn-sm">Back to Home</a>
        </div>
      </div>`;
    updateThemeIcons(getTheme());
    return;
  }

  /* ---------- Public pages: compact icon rail + blue portal header ---------- */
  document.body.classList.add("site-layout");

  const pageTitles = {
    home: "Home",
    lost: "Lost Items",
    found: "Found Items",
    how: "How It Works",
    about: "About Us",
    dashboard: "My Dashboard",
    details: "Item Details",
    claim: "Claim Item",
    "report-lost": "Report a Lost Item",
    "report-found": "Report a Found Item",
  };
  const pageTitle = pageTitles[page] || "CampusFind";

  const navItems = [
    { page: "home", href: "index.html", icon: ICONS.home, label: "Home" },
    { page: "lost", href: "lost-items.html", icon: ICONS.search, label: "Lost Items" },
    { page: "found", href: "found-items.html", icon: ICONS.pin, label: "Found Items" },
    { page: "how", href: "how-it-works.html", icon: ICONS.help, label: "How It Works" },
    { page: "about", href: "about.html", icon: ICONS.info, label: "About" },
  ];
  const reportItems = [
    { page: "report-lost", href: "report-lost.html", icon: ICONS.reportLost, label: "Report Lost" },
    { page: "report-found", href: "report-found.html", icon: ICONS.reportFound, label: "Report Found" },
  ];

  const navList = (items) =>
    items
      .map(
        (it) => `<a href="${it.href}" class="${page === it.page ? "active" : ""}" onclick="closeNav()" title="${it.label}" ${page === it.page ? 'aria-current="page"' : ""}><span class="s-ico" aria-hidden="true">${it.icon}</span><span class="nav-label">${it.label}</span></a>`
      )
      .join("");

  let acctHtml = "";
  let headerRight = "";
  if (user) {
    const staffOrAdmin = isStaffOrAdmin(user);
    const dashUrl = staffOrAdmin ? "admin/dashboard.html" : "dashboard.html";
    const initials = user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const roleLbl = user.role === "admin" ? "Administrator" : user.accountType === "staff" ? "Staff Member" : "Student";
    acctHtml = `
      <span class="side-acct-user" title="${esc(user.fullName)}">
        <span class="side-avatar" aria-hidden="true">${esc(initials)}</span>
        <span class="side-user-meta">
          <span class="side-user-name">${esc(user.fullName)}</span>
          <span class="side-user-role">${esc(roleLbl)}</span>
        </span>
      </span>
      <a class="side-acct-item" href="${dashUrl}" title="${user.role === "admin" ? "Admin panel" : "My dashboard"}"><span class="s-ico" aria-hidden="true">${ICONS.dashboard}</span><span class="acct-label">Dashboard</span></a>
      <button class="side-acct-item theme-toggle-side" onclick="toggleTheme()" title="Toggle dark mode" aria-label="Toggle dark mode"><span class="s-ico theme-ico" aria-hidden="true"></span><span class="acct-label">Dark Mode</span></button>
      <button class="side-acct-item is-danger" onclick="logout()" title="Log out" aria-label="Log out"><span class="s-ico" aria-hidden="true">${ICONS.logout}</span><span class="acct-label">Log out</span></button>`;
    headerRight = `
      <div class="notif-wrap">
        <button class="header-icon bell-btn" onclick="toggleNotifPanel(event)" aria-label="Notifications" title="Notifications"><span class="s-ico" aria-hidden="true">${ICONS.bell}</span><span class="bell-badge" id="bell-badge"></span></button>
        <div class="notif-panel" id="notif-panel"></div>
      </div>
      ${themeBtn}
      <a href="${dashUrl}" class="header-avatar-link" title="My dashboard"><span class="header-avatar">${esc(initials)}</span></a>`;
  } else {
    acctHtml = `
      <a href="login.html" class="side-acct-item" title="Log in"><span class="s-ico" aria-hidden="true">${ICONS.user}</span><span class="acct-label">Log In</span></a>
      <a href="register.html" class="side-acct-item is-primary" title="Create account"><span class="s-ico" aria-hidden="true">${ICONS.userPlus}</span><span class="acct-label">Sign Up</span></a>
      <button class="side-acct-item theme-toggle-side" onclick="toggleTheme()" title="Toggle dark mode" aria-label="Toggle dark mode"><span class="s-ico theme-ico" aria-hidden="true"></span><span class="acct-label">Dark Mode</span></button>`;
    headerRight = `
      ${themeBtn}
      <a href="login.html" class="header-icon" title="Log in" aria-label="Log in"><span class="s-ico" aria-hidden="true">${ICONS.user}</span></a>`;
  }

  nav.innerHTML = `
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="closeNav()"></div>
    <div class="site-frame">
      <aside class="site-sidebar" id="site-sidebar">
        <div class="sidebar-head">
          <button class="sidebar-toggle" id="sidebar-toggle" onclick="toggleNav()" aria-label="Collapse sidebar" aria-expanded="true" title="Collapse sidebar"><span class="chev chev-left" aria-hidden="true">${ICONS.menu}</span><span class="chev chev-right" aria-hidden="true">${ICONS.menu}</span></button>
          <div class="brand-name">Campus<em>Find</em></div>
          <button class="sidebar-close" onclick="closeNav()" aria-label="Close menu" title="Close menu">${ICONS.close}</button>
        </div>
        <nav class="site-nav" aria-label="Primary navigation">
          <div class="nav-sect"><span>Browse</span></div>
          ${navList(navItems)}
          <div class="nav-sect"><span>Report</span></div>
          ${navList(reportItems)}
        </nav>
        <div class="side-account">${acctHtml}</div>
      </aside>
      <div class="site-main">
        <header class="site-header">
          <div class="header-left">
            <button class="header-icon" id="nav-toggle-mobile" onclick="toggleNav()" aria-label="Toggle menu" title="Toggle menu">${ICONS.menu}</button>
            <span class="header-title">${esc(pageTitle)}</span>
          </div>
          <div class="header-right">${headerRight}</div>
        </header>
        <div class="site-main-content"></div>
      </div>
    </div>`;

  refreshBell();
  updateThemeIcons(getTheme());

  if (window.innerWidth > 1100) {
    let collapsed = false;
    try {
      collapsed = localStorage.getItem("campusfind_side_collapsed") === "1";
    } catch (e) {}
    document.body.classList.toggle("side-collapsed", collapsed);
  }
  updateSidebarToggle();
  mountSiteFrame();

  /* Restore content preserved across a re-render (hydration refresh). */
  const frameBox = nav.querySelector(".site-main-content");
  if (frameBox && preserved.length) {
    preserved.forEach((el) => frameBox.appendChild(el));
  }
}

/* Move the page's own content (everything up to the footer) inside the
   main column so the sticky sidebar/header scroll away before the footer. */
function mountSiteFrame() {
  const nav = document.getElementById("global-nav");
  if (!nav) return;
  const box = nav.querySelector(".site-main-content");
  if (!box) return;
  let el = nav.nextElementSibling;
  while (el && el.tagName !== "FOOTER") {
    const next = el.nextElementSibling;
    box.appendChild(el);
    el = next;
  }
}

function toggleNav() {
  const sidebar = document.getElementById("site-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || !backdrop) return;

  if (window.innerWidth > 1100) {
    const collapsed = document.body.classList.toggle("side-collapsed");
    try {
      localStorage.setItem("campusfind_side_collapsed", collapsed ? "1" : "0");
    } catch (e) {}
    updateSidebarToggle();
    return;
  }

  const willOpen = !sidebar.classList.contains("open");
  sidebar.classList.toggle("open", willOpen);
  backdrop.classList.toggle("show", willOpen);
  /* Lock scroll on <html> too — body overflow no longer propagates to the
     viewport when html has a non-visible overflow guard (overflow-x: clip). */
  document.documentElement.classList.toggle("no-scroll", willOpen);
  document.body.classList.toggle("no-scroll", willOpen);
}

function updateSidebarToggle() {
  const btn = document.getElementById("sidebar-toggle");
  if (!btn) return;
  const collapsed = document.body.classList.contains("side-collapsed");
  const expanded = !collapsed;
  btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  btn.setAttribute("aria-label", expanded ? "Collapse sidebar" : "Expand sidebar");
  btn.setAttribute("title", expanded ? "Collapse sidebar" : "Expand sidebar");
}

function closeNav() {
  const sidebar = document.getElementById("site-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar) sidebar.classList.remove("open");
  if (backdrop) backdrop.classList.remove("show");
  document.documentElement.classList.remove("no-scroll");
  document.body.classList.remove("no-scroll");
}

function toggleNotifPanel(e) {
  if (e) e.stopPropagation();
  const panel = document.getElementById("notif-panel");
  if (!panel) return;
  const willOpen = !panel.classList.contains("open");
  document.querySelectorAll(".notif-panel.open").forEach((p) => p.classList.remove("open"));
  if (willOpen) {
    renderNotifPanel(panel);
    panel.classList.add("open");
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".notif-panel") && !e.target.closest(".bell-btn")) {
    document.querySelectorAll(".notif-panel.open").forEach((p) => p.classList.remove("open"));
  }
});


function refreshBell() {
  const user = currentUser();
  const badge = document.getElementById("bell-badge");
  if (!badge) return;
  if (!user) return;
  const n = unreadCount(user.id);
  badge.textContent = n > 99 ? "99+" : n;
  badge.classList.toggle("show", n > 0);
}

function renderNotifPanel(panel) {
  const user = currentUser();
  panel.innerHTML = "";
  if (!user) return;
  const list = Store.all("notifications")
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30);

  panel.innerHTML = `
    <div class="notif-panel-head">
      <span>Notifications</span>
      <button onclick="markAllRead()">Mark all read</button>
    </div>
    <div class="notif-list">${list.length ? list.map((n) => `
      <div class="notif-item ${n.read ? "" : "unread"}" onclick="markNotifRead('${n.id}')">
        <div class="notif-icon" aria-hidden="true">${ICONS.bell}</div>
        <div>
          <div class="notif-title">${esc(n.title)}</div>
          <div class="notif-msg">${esc(n.message)}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
      </div>`).join("") : `<div class="notif-empty">No notifications yet</div>`}
    </div>`;
}

function markNotifRead(id) {
  Store.update("notifications", id, { read: true });
  refreshBell();
  const panel = document.getElementById("notif-panel");
  if (panel && panel.classList.contains("open")) renderNotifPanel(panel);
}

function markAllRead() {
  const user = currentUser();
  if (!user) return;
  Store.all("notifications")
    .filter((n) => n.userId === user.id && !n.read)
    .forEach((n) => Store.update("notifications", n.id, { read: true }));
  refreshBell();
  const panel = document.getElementById("notif-panel");
  if (panel && panel.classList.contains("open")) renderNotifPanel(panel);
}

/* ---------------- Item card / helpers for listings ---------------- */
function itemCard(item) {
  const user = currentUser();
  const detailUrl = `item-details.html?id=${item.id}`;
  const isMine = user && item.reporterId === user.id;
  return `
  <div class="item-card">
    <a href="${detailUrl}">
      <div class="item-card-img">
        ${itemImage(item)}
        <div class="card-badges">
          <span class="type-tag ${item.type === "lost" ? "type-lost" : "type-found"}">${item.type === "lost" ? "LOST" : "FOUND"}</span>
          ${statusBadge(item.status)}
        </div>
      </div>
    </a>
    <div class="item-card-body">
      <h3>${esc(item.name)}</h3>
      <div class="item-card-cat"><span aria-hidden="true">${CATEGORY_ICONS[item.category] || ""}</span> ${esc(item.category)}${item.brand ? " &middot; " + esc(item.brand) : ""}</div>
      <div class="item-card-meta">
        <span><span aria-hidden="true">${ICONS.pin}</span> ${esc(item.location || "Unknown")}</span>
        <span><span aria-hidden="true">${ICONS.calendar}</span> ${item.type === "lost" ? "Lost" : "Found"} ${fmtDate(item.date)} &middot; reported ${timeAgo(item.createdAt)}</span>
      </div>
      <p class="item-card-desc">${esc(item.description || "")}</p>
      ${isMine ? `<span class="badge badge-inactive" style="margin-bottom:10px;align-self:flex-start">Your report &middot; ${esc(item.reportId)}</span>` : ""}
      <a href="${detailUrl}" class="btn btn-outline btn-sm btn-block">View Details</a>
    </div>
  </div>`;
}

/* Compact card used for possible-match suggestions */
function matchCard(found, score) {
  const detailUrl = `item-details.html?id=${found.id}`;
  return `
  <div class="item-card">
    <a href="${detailUrl}">
      <div class="item-card-img" style="height:130px">
        ${itemImage(found)}
        <div class="card-badges">
          <span class="badge badge-matched">${score}% match</span>
          ${statusBadge(found.status)}
        </div>
      </div>
    </a>
    <div class="item-card-body" style="padding:12px 14px">
      <h3 style="font-size:15px">${esc(found.name)}</h3>
      <div class="item-card-meta" style="margin:4px 0 10px">
        <span><span aria-hidden="true">${ICONS.pin}</span> ${esc(found.location || "Unknown")}</span>
        <span><span aria-hidden="true">${ICONS.calendar}</span> found ${fmtDate(found.date)}</span>
      </div>
      <a href="${detailUrl}" class="btn btn-outline btn-sm btn-block">Compare &amp; Verify</a>
    </div>
  </div>`;
}

/* Toggle password visibility (login / register) */
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  btn.innerHTML = show ? ICONS.eyeOff : ICONS.eye;
  btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
  btn.title = show ? "Hide password" : "Show password";
}

function emptyState(title, sub, btnHtml) {
  return `
  <div class="empty-state">
    <div class="empty-icon" aria-hidden="true">${ICONS.search}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(sub)}</p>
    ${btnHtml || ""}
  </div>`;
}

/* Replace every [data-ico] placeholder with its inline SVG icon */
function hydrateIcons() {
  document.querySelectorAll("[data-ico]").forEach((el) => {
    if (el.dataset.ico && ICONS[el.dataset.ico]) el.innerHTML = ICONS[el.dataset.ico];
  });
}

/* ---------------- Init ---------------- */
/* Boot the app: load config, connect to Supabase, hydrate the in-memory
   store and restore the session. Page modules use whenReady() so they
   only run once data is available. */
Store.init();

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getTheme());
  hydrateIcons();
  /* Render the shell immediately (no blank flash while data loads), then
     re-render after hydration so the session-aware parts update. */
  renderNav();
  whenReady(() => {
    renderNav();
    handleAuthRedirect();
  });
});
