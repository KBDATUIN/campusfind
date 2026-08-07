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

/* ---------------- Seed data ---------------- */
function seedData() {
  const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
  const item = (o) => ({
    id: uid("I"),
    reportId: o.reportId,
    type: o.type,
    name: o.name,
    category: o.category,
    description: o.description,
    brand: o.brand,
    color: o.color,
    location: o.location,
    date: o.date,
    time: o.time,
    image: null,
    status: o.status || "pending",
    reporterId: o.reporterId,
    identifyingFeatures: o.identifyingFeatures || "",
    contactInfo: o.contactInfo || "",
    storageLocation: o.storageLocation || "",
    additionalNotes: o.additionalNotes || "",
    rejectReason: o.rejectReason || "",
    createdAt: o.createdAt || daysAgo(2),
    updatedAt: o.createdAt || daysAgo(2),
  });

  const users = [
    { id: "U-ADMIN1", fullName: "Dr. Sarah Mitchell", schoolId: "ADM-001", email: "admin@campusfind.edu", passwordHash: hashPassword("admin123"), role: "admin", status: "active", accountType: "staff", createdAt: daysAgo(120) },
    { id: "U-STU1", fullName: "James Carter", schoolId: "STU-2401", email: "james.carter@campusfind.edu", passwordHash: hashPassword("student123"), role: "student", status: "active", accountType: "student", createdAt: daysAgo(90) },
    { id: "U-STU2", fullName: "Priya Sharma", schoolId: "STU-1893", email: "priya.sharma@campusfind.edu", passwordHash: hashPassword("student123"), role: "student", status: "active", accountType: "student", createdAt: daysAgo(75) },
    { id: "U-STU3", fullName: "Daniel Okafor", schoolId: "STU-2210", email: "daniel.okafor@campusfind.edu", passwordHash: hashPassword("student123"), role: "student", status: "active", accountType: "student", createdAt: daysAgo(60) },
    { id: "U-STU4", fullName: "Emily Nguyen", schoolId: "STU-1755", email: "emily.nguyen@campusfind.edu", passwordHash: hashPassword("student123"), role: "student", status: "suspended", accountType: "student", createdAt: daysAgo(45) },
    { id: "U-STF1", fullName: "Ms. Elena Rodriguez", schoolId: "STF-120", email: "elena.rodriguez@campusfind.edu", passwordHash: hashPassword("staff123"), role: "staff", status: "active", accountType: "staff", createdAt: daysAgo(200) },
    { id: "U-STF2", fullName: "Mr. Marcus Webb", schoolId: "STF-096", email: "marcus.webb@campusfind.edu", passwordHash: hashPassword("staff123"), role: "staff", status: "active", accountType: "staff", createdAt: daysAgo(150) },
    { id: "U-STU5", fullName: "Lucas Bennett", schoolId: "STU-2034", email: "lucas.bennett@campusfind.edu", passwordHash: hashPassword("student123"), role: "student", status: "active", accountType: "student", createdAt: daysAgo(20) },
  ];

  const items = [
    // LOST items
    item({ reportId: "LF-2026-0001", type: "lost", name: "MacBook Pro 14\"", category: "Electronics", description: "Silver MacBook Pro 14 inch with a small dent on the left corner. Charger not included. Home screen shows a mountain wallpaper.", brand: "Apple", color: "Silver", location: "Main Library", date: daysAgo(1), time: "15:30", status: "verified", reporterId: "U-STU1", identifyingFeatures: "Sticker of a fox on the lid, tiny dent on left corner", additionalNotes: "Very important — all my project files are on it.", createdAt: daysAgo(1) }),
    item({ reportId: "LF-2026-0002", type: "lost", name: "Student ID Card", category: "ID/Card", description: "Blue student ID card with photo. Name on card is James Carter.", brand: "Campus ID Office", color: "Blue", location: "Student Center", date: daysAgo(3), time: "12:10", status: "verified", reporterId: "U-STU1", identifyingFeatures: "Name: James Carter, ID ends in 2401", createdAt: daysAgo(3) }),
    item({ reportId: "LF-2026-0003", type: "lost", name: "Wireless Earbuds", category: "Electronics", description: "White wireless earbuds in a charging case. Case has a small scratch near the hinge.", brand: "Sony", color: "White", location: "Gymnasium", date: daysAgo(2), time: "17:45", status: "pending", reporterId: "U-STU2", identifyingFeatures: "Scratch on the charging case hinge", createdAt: daysAgo(2) }),
    item({ reportId: "LF-2026-0004", type: "lost", name: "Leather Wallet", category: "Wallet/Purse", description: "Brown leather wallet with a metal clasp. Contains a few cards and some cash.", brand: "Fossil", color: "Brown", location: "Cafeteria", date: daysAgo(4), time: "13:20", status: "verified", reporterId: "U-STF1", identifyingFeatures: "Metal clasp engraved with initials ER", createdAt: daysAgo(4) }),
    item({ reportId: "LF-2026-0005", type: "lost", name: "House Keys", category: "Keys", description: "Set of 4 keys on a blue keychain with a small rubber duck charm.", brand: "—", color: "Silver", location: "Science Building", date: daysAgo(5), time: "16:00", status: "verified", reporterId: "U-STU3", identifyingFeatures: "Rubber duck keychain charm", createdAt: daysAgo(5) }),
    item({ reportId: "LF-2026-0006", type: "lost", name: "Navy Blue Jacket", category: "Clothing", description: "Navy blue winter jacket, size M. Zipped pockets. Left pocket contains a train ticket.", brand: "North Face", color: "Navy", location: "Lecture Hall B", date: daysAgo(6), time: "14:40", status: "rejected", reporterId: "U-STU4", rejectReason: "Reported item appears to be a duplicate of an already resolved listing. Please contact the office for details.", createdAt: daysAgo(6) }),
    item({ reportId: "LF-2026-0007", type: "lost", name: "Calculus Textbook", category: "Books", description: "Calculus: Early Transcendentals, 9th edition. Wrapped in brown paper.", brand: "Cengage", color: "Brown", location: "Engineering Building", date: daysAgo(7), time: "11:30", status: "verified", reporterId: "U-STU5", identifyingFeatures: "Wrapped in brown paper, name written inside cover", createdAt: daysAgo(7) }),
    item({ reportId: "LF-2026-0008", type: "lost", name: "USB-C Charger", category: "Electronics", description: "White Apple-style USB-C 61W power adapter with braided cable.", brand: "Apple", color: "White", location: "Student Center", date: daysAgo(8), time: "10:15", status: "verified", reporterId: "U-STU2", identifyingFeatures: "Braided white cable, taped label with initials PS", createdAt: daysAgo(8) }),

    // FOUND items
    item({ reportId: "FD-2026-0001", type: "found", name: "MacBook Pro", category: "Electronics", description: "Silver MacBook Pro found plugged in near the 2nd floor study tables of the library. Slightly dented on the left corner.", brand: "Apple", color: "Silver", location: "Main Library", date: daysAgo(1), time: "16:20", status: "verified", reporterId: "U-STF2", storageLocation: "Library Front Desk, Locker B-12", identifyingFeatures: "Dent on left corner, fox sticker on lid", createdAt: daysAgo(1) }),
    item({ reportId: "FD-2026-0002", type: "found", name: "Wireless Earbuds Case", category: "Electronics", description: "White earbud case found in the locker room. No earbuds inside the case.", brand: "Sony", color: "White", location: "Gymnasium", date: daysAgo(2), time: "18:05", status: "verified", reporterId: "U-STU5", storageLocation: "Gym Office", identifyingFeatures: "Scratch near the hinge", createdAt: daysAgo(2) }),
    item({ reportId: "FD-2026-0003", type: "found", name: "Brown Wallet", category: "Wallet/Purse", description: "Brown leather wallet found on a cafeteria table. Contains cards and a small amount of cash.", brand: "Fossil", color: "Brown", location: "Cafeteria", date: daysAgo(4), time: "13:45", status: "claim-approved", reporterId: "U-STU3", storageLocation: "Security Office Safe", identifyingFeatures: "Metal clasp, initials ER engraved", createdAt: daysAgo(4) }),
    item({ reportId: "FD-2026-0004", type: "found", name: "Keyring with Keys", category: "Keys", description: "Four keys on a blue keyring with a duck charm, found in Science Building room 204.", brand: "—", color: "Blue", location: "Science Building", date: daysAgo(5), time: "16:30", status: "returned", reporterId: "U-STF1", storageLocation: "Science Building Reception", identifyingFeatures: "Blue keyring with rubber duck charm", createdAt: daysAgo(5) }),
    item({ reportId: "FD-2026-0005", type: "found", name: "Graphing Calculator", category: "Electronics", description: "TI-84 Plus graphing calculator found in Lecture Hall B.", brand: "Texas Instruments", color: "Black", location: "Lecture Hall B", date: daysAgo(9), time: "09:50", status: "verified", reporterId: "U-STF2", storageLocation: "Lecture Hall B Podium", identifyingFeatures: "Name sticker partially peeled", createdAt: daysAgo(9) }),
    item({ reportId: "FD-2026-0006", type: "found", name: "Backpack", category: "Accessories", description: "Black school backpack with a red zipper found near the fountain in the quad.", brand: "Nike", color: "Black", location: "Quad Area", date: daysAgo(10), time: "15:15", status: "pending", reporterId: "U-STU1", storageLocation: "Lost & Found Office", identifyingFeatures: "Red zipper, white Nike logo", createdAt: daysAgo(10) }),
    item({ reportId: "FD-2026-0007", type: "found", name: "Reading Glasses", category: "Accessories", description: "Black-framed reading glasses in a hard navy case found in the faculty lounge.", brand: "—", color: "Black", location: "Admin Building", date: daysAgo(11), time: "12:00", status: "verified", reporterId: "U-STF1", storageLocation: "Admin Office", identifyingFeatures: "Navy hard case", createdAt: daysAgo(11) }),
    item({ reportId: "FD-2026-0008", type: "found", name: "Umbrella", category: "Other", description: "Dark blue umbrella with wooden handle, found by the main entrance.", brand: "—", color: "Dark Blue", location: "Main Entrance", date: daysAgo(12), time: "08:30", status: "returned", reporterId: "U-STU4", storageLocation: "Security Booth", identifyingFeatures: "Wooden hook handle", createdAt: daysAgo(12) }),
  ];

  const claims = [
    { id: uid("C"), claimId: "CL-2026-0001", itemId: items[8].id, claimantId: "U-STU1", explanation: "This is my MacBook. I was working on my thesis at the library 2nd floor and left it plugged in while I went to the restroom. It has my project files and a fox sticker.", identifyingDetails: "Fox sticker on the lid and a small dent on the left corner from a previous fall.", evidence: null, status: "approved", adminNotes: "Claimant description matches identifying features exactly. Arranged handover at library front desk.", createdAt: daysAgo(1) },
    { id: uid("C"), claimId: "CL-2026-0002", itemId: items[9].id, claimantId: "U-STU2", explanation: "I lost my white Sony earbuds case at the gym after practice. The scratch on the hinge matches the damage from when I dropped them.", identifyingDetails: "Small scratch near the hinge of the case.", evidence: null, status: "pending", adminNotes: "", createdAt: daysAgo(1) },
    { id: uid("C"), claimId: "CL-2026-0003", itemId: items[10].id, claimantId: "U-STF1", explanation: "This wallet is mine — I ate lunch at the cafeteria and must have left it on the table. It has my staff ID and debit cards.", identifyingDetails: "Metal clasp engraved with initials ER for Elena Rodriguez.", evidence: null, status: "completed", adminNotes: "Item handed over at security office. Receipt signed.", createdAt: daysAgo(3) },
    { id: uid("C"), claimId: "CL-2026-0004", itemId: items[11].id, claimantId: "U-STU3", explanation: "These are my house keys with the duck keychain my sister gave me. I dropped them in the Science Building.", identifyingDetails: "Rubber duck charm on a blue keyring.", evidence: null, status: "completed", adminNotes: "Verified and returned at Science Building reception.", createdAt: daysAgo(5) },
    { id: uid("C"), claimId: "CL-2026-0005", itemId: items[12].id, claimantId: "U-STU2", explanation: "I lost my TI-84 calculator in Lecture Hall B during my math final.", identifyingDetails: "Partially peeled name sticker.", evidence: null, status: "investigation", adminNotes: "Requested the claimant bring the original purchase receipt.", createdAt: daysAgo(8) },
    { id: uid("C"), claimId: "CL-2026-0006", itemId: items[15].id, claimantId: "U-STF1", explanation: "My reading glasses went missing from my desk in the faculty lounge. Navy case with glasses inside.", identifyingDetails: "Black frames, navy hard case.", evidence: null, status: "rejected", adminNotes: "Glasses were claimed and returned to a different staff member the previous day. Item was re-checked.", createdAt: daysAgo(10) },
  ];

  const notifications = [
    { id: uid("N"), userId: "U-STU1", title: "Report Approved", message: "Your report for MacBook Pro 14\" (LF-2026-0001) has been verified and published.", read: false, createdAt: daysAgo(1) },
    { id: uid("N"), userId: "U-STU1", title: "Claim Approved", message: "Your claim CL-2026-0001 for MacBook Pro has been approved. Pick it up at the Library Front Desk.", read: false, createdAt: daysAgo(1) },
    { id: uid("N"), userId: "U-STU2", title: "Possible Match Found", message: "A found item may match your lost Wireless Earbuds report. Check the details.", read: false, createdAt: daysAgo(2) },
    { id: uid("N"), userId: "U-STU2", title: "Claim Status Changed", message: "Your claim CL-2026-0002 is now Pending Review.", read: true, createdAt: daysAgo(1) },
    { id: uid("N"), userId: "U-STF1", title: "Item Returned", message: "Your found item Keyring with Keys (FD-2026-0004) has been returned to its owner. Thank you!", read: true, createdAt: daysAgo(4) },
    { id: uid("N"), userId: "U-STU4", title: "Report Rejected", message: "Your report for Navy Blue Jacket (LF-2026-0006) was rejected. Reason: duplicate listing.", read: false, createdAt: daysAgo(6) },
  ];

  const activityLogs = [
    { id: uid("L"), adminId: "U-ADMIN1", action: "Approved report", target: "LF-2026-0001 (MacBook Pro 14\")", timestamp: daysAgo(1) },
    { id: uid("L"), adminId: "U-ADMIN1", action: "Approved claim", target: "CL-2026-0001 (MacBook Pro 14\")", timestamp: daysAgo(1) },
    { id: uid("L"), adminId: "U-ADMIN1", action: "Rejected report", target: "LF-2026-0006 (Navy Blue Jacket)", timestamp: daysAgo(5) },
    { id: uid("L"), adminId: "U-ADMIN1", action: "Marked item returned", target: "FD-2026-0004 (Keyring with Keys)", timestamp: daysAgo(4) },
    { id: uid("L"), adminId: "U-ADMIN1", action: "Suspended user", target: "emily.nguyen@campusfind.edu", timestamp: daysAgo(3) },
  ];

  return { version: 1, users, items, claims, notifications, activityLogs };
}

/* ---------------- Storage layer ---------------- */
const Store = {
  DB_KEY: "campusfind_db",
  SESSION_KEY: "campusfind_session",

  data: null,

  load() {
    try {
      const raw = localStorage.getItem(this.DB_KEY);
      this.data = raw ? JSON.parse(raw) : null;
    } catch (e) {
      this.data = null;
    }
    if (!this.data || this.data.version !== 1) {
      this.data = seedData();
      this.save();
    }
  },

  save() {
    localStorage.setItem(this.DB_KEY, JSON.stringify(this.data));
  },

  reset() {
    localStorage.removeItem(this.DB_KEY);
    this.data = null;
    this.load();
  },

  /* collection helpers */
  all(coll) { return this.data ? this.data[coll] || [] : []; },
  get(coll, id) { return this.data ? (this.data[coll] || []).find((r) => r.id === id) : undefined; },
  insert(coll, record) {
    this.data[coll].push(record);
    this.save();
    return record;
  },
  update(coll, id, patch) {
    const rec = this.get(coll, id);
    if (rec) Object.assign(rec, patch);
    this.save();
    return rec;
  },
  remove(coll, id) {
    this.data[coll] = this.data[coll].filter((r) => r.id !== id);
    this.save();
  },
};

/* ---------------- Utility helpers ---------------- */
function uid(prefix) {
  return prefix + "-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function reportId(type) {
  const prefix = type === "lost" ? "LF" : "FD";
  const year = new Date().getFullYear();
  const count = Store.all("items").filter((i) => i.reportId && i.reportId.startsWith(prefix + "-" + year)).length + 1;
  return `${prefix}-${year}-${String(count).padStart(4, "0")}`;
}

function claimId() {
  const year = new Date().getFullYear();
  const count = Store.all("claims").filter((c) => c.claimId && c.claimId.startsWith("CL-" + year)).length + 1;
  return `CL-${year}-${String(count).padStart(4, "0")}`;
}

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

function hashPassword(pw) {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) + h + pw.charCodeAt(i)) | 0;
  }
  return "h$" + (h >>> 0).toString(36) + "$" + pw.length;
}

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
function currentUser() {
  const uidSession = localStorage.getItem(Store.SESSION_KEY);
  if (!uidSession) return null;
  /* Store may not be loaded yet when called from early inline scripts */
  if (!Store.data) return null;
  return Store.get("users", uidSession) || null;
}

function setSession(user) {
  localStorage.setItem(Store.SESSION_KEY, user.id);
}

function clearSession() {
  localStorage.removeItem(Store.SESSION_KEY);
}

function logout() {
  clearSession();
  const isAdmin = window.location.pathname.includes("/admin/");
  window.location.href = isAdmin ? "../index.html" : "index.html";
}

function requireAuth() {
  const u = currentUser();
  if (!u) {
    window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname.split("/").pop());
    return null;
  }
  return u;
}

function requireAdmin() {
  const u = currentUser();
  if (!u) {
    window.location.href = "../login.html";
    return null;
  }
  if (u.role !== "admin") {
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
  if (item.image) return `<img src="${item.image}" alt="${esc(item.name)}">`;
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
    const dashUrl = user.role === "admin" ? "admin/dashboard.html" : "dashboard.html";
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
/* Load data synchronously so inline scripts that run before
   DOMContentLoaded (e.g. the home stats renderer) can read the store. */
Store.load();

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getTheme());
  renderNav();
  hydrateIcons();
});
