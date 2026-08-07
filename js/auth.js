/* ============================================================
   CampusFind — Authentication (login / register / logout)
   ============================================================ */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page") || "";
  if (page === "register") initRegister();
  if (page === "login") initLogin();

  /* If already logged in on an auth page, skip straight through */
  const user = currentUser();
  const skip = localStorage.getItem("campusfind_auth_skip");
  if (page === "login" && user && canLogin(user) && skip === "1") {
    window.location.href = "dashboard.html";
  }
});

/* ---------------- Registration ---------------- */
function initRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const pwInput = document.getElementById("reg-password");
  const pwStrength = document.getElementById("pw-strength-bar");
  if (pwInput && pwStrength) {
    pwInput.addEventListener("input", () => {
      const v = pwInput.value;
      let cls = "";
      if (v.length === 0) cls = "";
      else if (v.length < 8) cls = "weak";
      else if (!/[0-9]/.test(v) || !/[A-Za-z]/.test(v)) cls = "fair";
      else if (v.length < 12) cls = "fair";
      else cls = "strong";
      pwStrength.className = "pw-strength-bar " + cls;
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fullName = sanitizeInput(form["fullName"].value);
    const schoolId = sanitizeInput(form["schoolId"].value);
    const email = sanitizeInput(form["email"].value).toLowerCase();
    const password = form["password"].value;
    const confirm = form["confirm"].value;
    const accountType = form["accountType"].value;

    let valid = true;
    const setInvalid = (name, bad) => {
      const g = form.querySelector(`[name="${name}"]`).closest(".form-group");
      g.classList.toggle("invalid", bad);
      if (bad) valid = false;
    };

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setInvalid("fullName", fullName.length < 3);
    setInvalid("schoolId", schoolId.length < 2);
    setInvalid("email", !emailOk);
    setInvalid("password", password.length < 8);
    setInvalid("confirm", confirm !== password || confirm.length === 0);

    if (!valid) return;

    const exists = Store.all("users").some((u) => u.email === email);
    if (exists) {
      toast("An account with this email already exists. Try logging in.", "error");
      setInvalid("email", true);
      return;
    }

    const user = Store.insert("users", {
      id: uid("U"),
      fullName,
      schoolId,
      email,
      passwordHash: hashPassword(password),
      role: accountType === "staff" ? "staff" : "student",
      status: "active",
      accountType,
      createdAt: new Date().toISOString(),
    });

    addNotification(
      user.id,
      "Welcome to CampusFind!",
      "Your account has been created. Report lost items or claim found ones anytime."
    );
    setSession(user);
    toast("Account created successfully. Welcome to CampusFind!", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 900);
  });
}

/* ---------------- Login ---------------- */
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  /* Prefill remembered email */
  const remembered = localStorage.getItem("campusfind_remember");
  if (remembered) {
    form["identifier"].value = remembered;
    form["remember"].checked = true;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const identifier = sanitizeInput(form["identifier"].value).toLowerCase();
    const password = form["password"].value;
    const remember = form["remember"].checked;

    const user = Store.all("users").find(
      (u) => u.email === identifier || String(u.schoolId).toLowerCase() === identifier
    );

    if (!user || user.passwordHash !== hashPassword(password)) {
      toast("Invalid email/ID or password. Please try again.", "error");
      form.querySelector("[name='password']").closest(".form-group").classList.add("invalid");
      return;
    }
    if (user.status !== "active") {
      toast("This account has been suspended. Contact the school office.", "error");
      return;
    }

    if (remember) localStorage.setItem("campusfind_remember", user.email);
    else localStorage.removeItem("campusfind_remember");

    setSession(user);
    localStorage.setItem("campusfind_auth_skip", "1");
    toast("Welcome back, " + user.fullName.split(" ")[0] + "!", "success");

    const redirect = new URLSearchParams(window.location.search).get("redirect");
    setTimeout(() => {
      if (redirect) window.location.href = redirect;
      else if (user.role === "admin") window.location.href = "admin/dashboard.html";
      else window.location.href = "dashboard.html";
    }, 800);
  });

  /* Forgot password */
  const forgotBtn = document.getElementById("forgot-link");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(`
        <div data-title="Forgot Password"></div>
        <div data-body>
          <p class="modal-text">Enter your school email and we will send you a password reset link. (Demo: this prototype stores passwords locally.)</p>
          <div class="form-group">
            <label for="forgot-email">School Email</label>
            <input type="email" id="forgot-email" placeholder="you@campusfind.edu">
          </div>
          <div class="confirm-btns">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" id="forgot-send">Send Reset Link</button>
          </div>
        </div>`);
      const sendBtn = document.getElementById("forgot-send");
      sendBtn.addEventListener("click", () => {
        const email = sanitizeInput(document.getElementById("forgot-email").value).toLowerCase();
        const user = Store.all("users").find((u) => u.email === email);
        if (!user) {
          toast("No account found with that email.", "error");
          return;
        }
        addNotification(user.id, "Password Reset", "A password reset link has been emailed to you. (Demo notification)");
        closeModal();
        toast("Reset link sent! Check your inbox (demo).", "success");
      });
    });
  }
}

/* Demo quick-login helpers (visible on login page for convenience) */
function demoLogin(email, password) {
  const user = Store.all("users").find((u) => u.email === email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    toast("Demo account error.", "error");
    return;
  }
  setSession(user);
  localStorage.setItem("campusfind_auth_skip", "1");
  toast("Signed in as " + user.fullName, "success");
  setTimeout(() => {
    if (user.role === "admin") window.location.href = "admin/dashboard.html";
    else window.location.href = "dashboard.html";
  }, 700);
}
