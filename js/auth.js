/* ============================================================
   FindBack — Authentication (login / register / logout)
   Backed by Supabase Auth — passwords are hashed with bcrypt
   server-side and never touch the client.
   ============================================================ */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page") || "";
  whenReady(() => {
    if (page === "register") initRegister();
    if (page === "login") initLogin();

    /* If already logged in on an auth page, skip straight through */
    const user = currentUser();
    const skip = localStorage.getItem("campusfind_auth_skip");
    if (page === "login" && user && canLogin(user) && skip === "1") {
      window.location.href = "dashboard.html";
    }
  });
});

/* ---------------- Registration ----------------
   Self-registration always creates a STUDENT account. Staff and admin
   accounts are created by the school office (see README / schema.sql). */
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = sanitizeInput(form["fullName"].value);
    const schoolId = sanitizeInput(form["schoolId"].value);
    const email = sanitizeInput(form["email"].value).toLowerCase();
    const password = form["password"].value;
    const confirm = form["confirm"].value;

    let valid = true;
    const setInvalid = (name, bad) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el) return;
      const g = el.closest(".form-group");
      if (g) g.classList.toggle("invalid", bad);
      if (bad) valid = false;
    };

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setInvalid("fullName", fullName.length < 3);
    setInvalid("schoolId", schoolId.length < 2);
    setInvalid("email", !emailOk);
    setInvalid("password", password.length < 8);
    setInvalid("confirm", confirm !== password || confirm.length === 0);

    if (!valid) return;

    if (Store.all("users").some((u) => u.email === email)) {
      toast("An account with this email already exists. Try logging in.", "error");
      setInvalid("email", true);
      return;
    }

    const btn = form.querySelector("button[type='submit']");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Creating account…";
    }

    try {
      const { data, error } = await Store.client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, school_id: schoolId },
        },
      });
      if (error) throw error;

      /* The profile row is created by the DB trigger on auth.users insert. */
      const { data: profile, error: pErr } = await Store.client
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      if (pErr) throw pErr;

      if (profile) {
        const profileObj = Store.dbToObj("users", profile);
        if (!Store.get("users", profileObj.id)) Store.data.users.push(profileObj);

        if (data.session) {
          setSession(profileObj);
          setRoleCookie(profileObj);
          localStorage.setItem("campusfind_auth_skip", "1");
          addNotification(profileObj.id, "Welcome to FindBack!", "Your account has been created. Report lost items or claim found ones anytime.");
          toast("Account created successfully. Welcome to FindBack!", "success");
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 900);
        } else {
          toast("Account created! Check your inbox to confirm your email, then log in.", "success");
        }
      } else {
        toast("Account created! Confirm your email and log in to get started.", "success");
      }
    } catch (err) {
      const msg = (err && err.message) || String(err);
      if (/already registered|already been registered|already exists|duplicate/i.test(msg)) {
        toast("An account with this email already exists. Try logging in.", "error");
        setInvalid("email", true);
      } else {
        toast("Could not create your account: " + msg, "error");
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Create Account";
      }
    }
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = sanitizeInput(form["identifier"].value).toLowerCase();
    const password = form["password"].value;
    const remember = form["remember"].checked;

    const profile = Store.all("users").find(
      (u) => u.email === identifier || String(u.schoolId).toLowerCase() === identifier
    );

    if (!profile) {
      toast("Invalid email/ID or password. Please try again.", "error");
      form.querySelector("[name='password']").closest(".form-group").classList.add("invalid");
      return;
    }
    if (profile.status !== "active") {
      toast("This account has been suspended. Contact the school office.", "error");
      return;
    }

    const btn = form.querySelector("button[type='submit']");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Signing in…";
    }

    const { error } = await Store.client.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (btn) {
      btn.disabled = false;
      btn.textContent = "Log In";
    }

    if (error) {
      if (/confirmed/i.test(error.message)) {
        toast("Please confirm your email first — check your inbox for the confirmation link.", "error");
      } else {
        toast("Invalid email/ID or password. Please try again.", "error");
      }
      form.querySelector("[name='password']").closest(".form-group").classList.add("invalid");
      return;
    }

    if (remember) localStorage.setItem("campusfind_remember", profile.email);
    else localStorage.removeItem("campusfind_remember");

    setSession(profile);
    setRoleCookie(profile);
    localStorage.setItem("campusfind_auth_skip", "1");
    toast("Welcome back, " + profile.fullName.split(" ")[0] + "!", "success");

    const redirect = new URLSearchParams(window.location.search).get("redirect");
    setTimeout(() => {
      if (redirect) window.location.href = redirect;
      else if (isStaffOrAdmin(profile)) window.location.href = "admin/dashboard.html";
      else window.location.href = "dashboard.html";
    }, 800);
  });

  /* Forgot password — sends a real Supabase reset email */
  const forgotBtn = document.getElementById("forgot-link");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(`
        <div data-title="Forgot Password"></div>
        <div data-body>
          <p class="modal-text">Enter your school email and we will send you a password reset link.</p>
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
      sendBtn.addEventListener("click", async () => {
        const email = sanitizeInput(document.getElementById("forgot-email").value).toLowerCase();
        if (!email) {
          toast("Please enter your email address.", "error");
          return;
        }
        sendBtn.disabled = true;
        const { error } = await Store.client.auth.resetPasswordForEmail(email);
        sendBtn.disabled = false;
        closeModal();
        if (error) {
          toast("Could not send the reset link: " + error.message, "error");
        } else {
          toast("If that email is registered, a reset link has been sent. Check your inbox.", "success");
        }
      });
    });
  }
}
