// frontend/src/pages/LoginPage.jsx
import LoginPage from "./pages/LoginPage.jsx";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const only_digits = (s) => s.replace(/\D/g, "");

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "info") => {
    setToast({ msg, type, id: Date.now() });
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  return [toast, show];
}

/* ─── sub-components ────────────────────────────────────────────────────────── */

function Toast({ toast }) {
  if (!toast) return null;
  const colors = {
    info:    "#1A6B4A",
    success: "#22C55E",
    error:   "#EF4444",
    warn:    "#F59E0B",
  };
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%",
      transform: "translateX(-50%)",
      background: colors[toast.type] || colors.info,
      color: "#fff", padding: "11px 24px",
      borderRadius: 50, fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 30px rgba(0,0,0,.18)",
      animation: "fadeUp .3s ease",
      zIndex: 9999, whiteSpace: "nowrap",
    }}>
      {toast.msg}
    </div>
  );
}

function Input({
  label, name, type = "text", value, onChange, error,
  placeholder, prefix, suffix, autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "var(--red)" : focused ? "var(--acc)" : "var(--border)";

  return (
    <div style={{ marginBottom: 4 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 11, fontWeight: 700,
          letterSpacing: ".08em", color: "var(--text-m)",
          textTransform: "uppercase", marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <div style={{
        display: "flex", alignItems: "center",
        background: "var(--ibg)",
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10, overflow: "hidden",
        transition: "border-color .2s",
        boxShadow: focused ? `0 0 0 3px ${error ? "#FEE2E2" : "#D1FAE5"}` : "none",
      }}>
        {prefix && (
          <span style={{
            padding: "0 10px 0 14px", color: "var(--text-m)",
            fontSize: 15, userSelect: "none", whiteSpace: "nowrap",
          }}>
            {prefix}
          </span>
        )}
        <input
          name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none",
            padding: prefix ? "12px 12px 12px 4px" : "12px 14px",
            fontSize: 15, background: "transparent",
            color: "var(--text-d)", fontFamily: "inherit",
          }}
        />
        {suffix}
      </div>
      {error && (
        <p style={{
          color: "var(--red)", fontSize: 12,
          marginTop: 4, animation: "fadeIn .2s",
        }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function WhatsAppInput({ cc, setCC, number, setNumber, error }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "var(--red)" : focused ? "#25D366" : "var(--border)";
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        letterSpacing: ".08em", color: "var(--text-m)",
        textTransform: "uppercase", marginBottom: 6,
      }}>
        WhatsApp Number
      </label>
      <div style={{
        display: "flex", alignItems: "center",
        background: "var(--ibg)",
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10, overflow: "hidden",
        transition: "border-color .2s, box-shadow .2s",
        boxShadow: focused
          ? `0 0 0 3px ${error ? "#FEE2E2" : "#DCFCE7"}`
          : "none",
      }}>
        {/* WA icon */}
        <span style={{
          padding: "0 8px 0 14px", fontSize: 18,
          display: "flex", alignItems: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.847L.057 23.868c-.07.284.178.532.461.461l6.022-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 01-5.002-1.37l-.358-.214-3.724.909.933-3.624-.234-.373A9.808 9.808 0 012.182 12C2.182 6.574 6.574 2.182 12 2.182S21.818 6.574 21.818 12 17.426 21.818 12 21.818z"/>
          </svg>
        </span>
        {/* Country code */}
        <input
          value={cc} onChange={(e) => setCC(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: 52, border: "none", outline: "none",
            padding: "12px 4px 12px 0",
            fontSize: 15, background: "transparent",
            color: "var(--text-d)", fontFamily: "inherit",
            fontWeight: 600,
          }}
        />
        {/* Divider */}
        <div style={{
          width: 1, height: 22, background: "var(--border)",
          margin: "0 8px",
        }} />
        {/* Number */}
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="01XXXXXXXXX"
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", outline: "none",
            padding: "12px 14px 12px 4px",
            fontSize: 15, background: "transparent",
            color: "var(--text-d)", fontFamily: "inherit",
          }}
        />
      </div>
      {error && (
        <p style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: "2.5px solid rgba(255,255,255,.3)",
      borderTopColor: "#fff", borderRadius: "50%",
      animation: "spin .7s linear infinite",
      display: "inline-block",
    }} />
  );
}

function PrimaryBtn({ children, loading, onClick, style }) {
  return (
    <button
      onClick={onClick} disabled={loading}
      style={{
        width: "100%", padding: "14px", border: "none",
        borderRadius: 10, background: loading ? "#2d8a62" : "var(--acc)",
        color: "#fff", fontSize: 15, fontWeight: 700,
        cursor: loading ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 10, transition: "background .2s, transform .1s",
        fontFamily: "inherit",
        ...style,
      }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--acc-h)"; }}
      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--acc)"; }}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

/* ─── VIEWS ─────────────────────────────────────────────────────────────────── */

function LoginView({ onRegister, onForgot, showToast }) {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [remember, setRemember] = useState(
    () => localStorage.getItem("fm_remember") === "true"
  );

  // auto-fill remembered username
  useEffect(() => {
    const saved = localStorage.getItem("fm_username");
    if (saved && remember) setForm((f) => ({ ...f, username: saved }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password)        e.password = "Password is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        username: form.username.trim().toLowerCase(),
        password: form.password,
      });
      localStorage.setItem("fm_token", data.token);
      localStorage.setItem("fm_user",  JSON.stringify(data.user));
      if (remember) {
        localStorage.setItem("fm_remember", "true");
        localStorage.setItem("fm_username", form.username.trim().toLowerCase());
      } else {
        localStorage.removeItem("fm_remember");
        localStorage.removeItem("fm_username");
      }
      showToast(`✔  Welcome back, ${data.user.fullName}!`, "success");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      if (msg.toLowerCase().includes("password")) setErrors({ password: msg });
      else setErrors({ username: msg });
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <button
      type="button" onClick={() => setShowPw(!showPw)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "0 14px", color: "var(--text-m)",
        display: "flex", alignItems: "center",
      }}
    >
      {showPw
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  return (
    <div style={{ animation: "fadeUp .5s ease" }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        Welcome back
      </h1>
      <p style={{ color: "var(--text-m)", marginBottom: 28, fontSize: 15 }}>
        Sign in to your professional workspace
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input
          label="Username" name="username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Enter your username"
          error={errors.username} autoComplete="username"
        />
        <Input
          label="Password" name="password"
          type={showPw ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter your password"
          error={errors.password} autoComplete="current-password"
          suffix={<EyeIcon />}
        />
      </div>

      {/* Remember + Forgot */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", margin: "14px 0 20px",
      }}>
        <label style={{
          display: "flex", alignItems: "center", gap: 7,
          cursor: "pointer", fontSize: 14, color: "var(--text-m)",
        }}>
          <input type="checkbox" checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ accentColor: "var(--acc)", width: 15, height: 15 }}
          />
          Remember me
        </label>
        <button onClick={onForgot} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--acc)", fontSize: 14, fontWeight: 600,
          textDecoration: "underline", fontFamily: "inherit",
        }}>
          Forgot password?
        </button>
      </div>

      <PrimaryBtn loading={loading} onClick={handleSubmit}>
        Sign In
      </PrimaryBtn>

      {/* Social row */}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {[
          { icon: "🔵", label: "Google" },
          { icon: "◎",  label: "Biometric" },
        ].map(({ icon, label }) => (
          <button key={label}
            onClick={() => showToast(`${label} auth not configured`, "warn")}
            style={{
              flex: 1, padding: "11px", border: "1.5px solid var(--border)",
              borderRadius: 10, background: "#fff", cursor: "pointer",
              fontSize: 14, fontWeight: 600, color: "var(--text-d)",
              fontFamily: "inherit", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 7,
              transition: "background .18s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F1F5F9"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Register link */}
      <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: "var(--text-m)" }}>
        New to the platform?{" "}
        <button onClick={onRegister} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--acc)", fontWeight: 700,
          textDecoration: "underline", fontFamily: "inherit", fontSize: 14,
        }}>
          Create account
        </button>
      </p>
    </div>
  );
}

/* ── Register View ──────────────────────────────────────────────────────────── */
function RegisterView({ onBack, showToast }) {
  const [form, setForm]   = useState({
    fullName: "", username: "", password: "", confirmPassword: "",
  });
  const [cc, setCC]         = useState("+880");
  const [waNum, setWaNum]   = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())          e.fullName = "Full name is required";
    if (!form.username.trim() || form.username.length < 3)
                                        e.username = "Min 3 characters";
    if (form.password.length < 6)       e.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
                                        e.confirmPassword = "Passwords don't match";
    const digits = only_digits(waNum);
    if (digits.length < 7)             e.whatsapp = "Enter a valid WhatsApp number";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);
    try {
      const whatsapp = cc + only_digits(waNum);
      await api.post("/auth/register", { ...form, whatsapp });
      showToast(`✔  Account created!  Please sign in.`, "success");
      setTimeout(onBack, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      if (msg.toLowerCase().includes("username")) setErrors({ username: msg });
      else showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeUp .5s ease" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--acc)", fontWeight: 700, fontSize: 14,
        marginBottom: 16, fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        ← Back to Sign In
      </button>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
        Create Account
      </h1>
      <p style={{ color: "var(--text-m)", marginBottom: 22, fontSize: 14 }}>
        Register to join FitManage
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Full Name" name="fullName" value={form.fullName}
          onChange={set("fullName")} placeholder="e.g. Ashley Admin"
          error={errors.fullName} />

        <Input label="Username" name="username" value={form.username}
          onChange={set("username")} placeholder="Choose a username"
          error={errors.username} autoComplete="username" />

        <Input label="Password" name="password"
          type={showPw ? "text" : "password"} value={form.password}
          onChange={set("password")} placeholder="Min 6 characters"
          error={errors.password} autoComplete="new-password"
          suffix={
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{
                background:"none", border:"none", cursor:"pointer",
                padding:"0 14px", color:"var(--text-m)",
                display:"flex", alignItems:"center",
              }}>
              {showPw ? "🙈" : "👁"}
            </button>
          }
        />

        <Input label="Confirm Password" name="confirmPassword"
          type="password" value={form.confirmPassword}
          onChange={set("confirmPassword")} placeholder="Re-enter password"
          error={errors.confirmPassword} autoComplete="new-password" />

        <WhatsAppInput
          cc={cc} setCC={setCC}
          number={waNum} setNumber={setWaNum}
          error={errors.whatsapp}
        />
      </div>

      <div style={{ marginTop: 22 }}>
        <PrimaryBtn loading={loading} onClick={handleSubmit}>
          Create Account
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ── Forgot Password View ───────────────────────────────────────────────────── */
function ForgotView({ onBack, showToast }) {
  const [step, setStep]     = useState(1);
  const [username, setUsername] = useState("");
  const [cc, setCC]           = useState("+880");
  const [waNum, setWaNum]     = useState("");
  const [newPw, setNewPw]     = useState("");
  const [confPw, setConfPw]   = useState("");
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const e = {};
    if (!username.trim())   e.username = "Username is required";
    const digits = only_digits(waNum);
    if (digits.length < 7) e.whatsapp = "Enter a valid WhatsApp number";
    if (newPw.length < 6)  e.newPw = "Min 6 characters";
    if (newPw !== confPw)  e.confPw = "Passwords don't match";
    if (Object.keys(e).length) { setErrors(e); return; }

    setErrors({}); setLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        username: username.trim().toLowerCase(),
        whatsapp: cc + digits,
        newPassword: newPw,
        confirmPassword: confPw,
      });
      showToast("✔  Password reset!  Please sign in.", "success");
      setTimeout(onBack, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed.";
      showToast(msg, "error");
      if (msg.toLowerCase().includes("username")) setErrors({ username: msg });
      else if (msg.toLowerCase().includes("whatsapp")) setErrors({ whatsapp: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeUp .5s ease" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--acc)", fontWeight: 700, fontSize: 14,
        marginBottom: 16, fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        ← Back to Sign In
      </button>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
        Reset Password
      </h1>
      <p style={{ color: "var(--text-m)", marginBottom: 22, fontSize: 14 }}>
        Enter your username and registered WhatsApp number
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Username" name="username" value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username" error={errors.username} />

        <WhatsAppInput
          cc={cc} setCC={setCC}
          number={waNum} setNumber={setWaNum}
          error={errors.whatsapp}
        />

        <Input label="New Password" name="newPw" type="password"
          value={newPw} onChange={(e) => setNewPw(e.target.value)}
          placeholder="Min 6 characters" error={errors.newPw}
          autoComplete="new-password" />

        <Input label="Confirm New Password" name="confPw" type="password"
          value={confPw} onChange={(e) => setConfPw(e.target.value)}
          placeholder="Re-enter new password" error={errors.confPw}
          autoComplete="new-password" />
      </div>

      <div style={{ marginTop: 22 }}>
        <PrimaryBtn loading={loading} onClick={handleReset}>
          Reset Password
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [view, setView] = useState("login"); // "login" | "register" | "forgot"
  const [toast, showToast] = useToast();

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* ── LEFT HERO PANEL ──────────────────────────────────────────────────── */}
      <div style={{
        flex: "0 0 45%", background: "var(--panel-l)",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "48px 48px 40px",
        minHeight: "100vh",
      }}>
        {/* Decorative circles (gym lights) */}
        {[
          { top: -40, left: 50,  size: 130 },
          { top: -20, left: 210, size: 100 },
          { top: 60,  left: 340, size: 70  },
          { top: 130, left: -20, size: 50  },
        ].map((c, i) => (
          <div key={i} style={{
            position: "absolute", top: c.top, left: c.left,
            width: c.size, height: c.size, borderRadius: "50%",
            background: "radial-gradient(circle, #e5e5e5 30%, #2a2a3a 100%)",
            boxShadow: "0 0 60px rgba(255,255,255,.06)",
          }} />
        ))}

        {/* Gradient mesh */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(26,107,74,.35) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 20%, rgba(34,197,94,.12) 0%, transparent 70%)
          `,
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,2 30,16 16,30 2,16" fill="#1A6B4A" />
              <polygon points="16,8 24,16 16,24 8,16"  fill="#22C55E" />
            </svg>
            <span style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22, fontWeight: 700, color: "#fff",
            }}>
              FitManage
            </span>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 38, fontWeight: 700, color: "#fff",
            lineHeight: 1.2, marginBottom: 16,
          }}>
            Maximize Potential<br />with Fitness<br />Excellence.
          </h2>
          <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.6, maxWidth: 300 }}>
            Management refined for the modern leader.<br />
            Elevate your team's workflow.
          </p>

          {/* Stats strip */}
          <div style={{
            display: "flex", gap: 28, marginTop: 36,
            paddingTop: 28, borderTop: "1px solid rgba(255,255,255,.08)",
          }}>
            {[["248", "Sessions"], ["42", "Classes"], ["31", "Members"]].map(
              ([n, l]) => (
                <div key={l}>
                  <div style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 26, fontWeight: 700, color: "#22C55E",
                  }}>
                    {n}
                  </div>
                  <div style={{ color: "#64748B", fontSize: 13 }}>{l}</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Version */}
        <div style={{
          position: "relative", zIndex: 1,
          color: "#334155", fontSize: 12, fontWeight: 500,
        }}>
          v2.0 · FitManage Pro
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, background: "var(--panel-r)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "40px 24px",
        position: "relative",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {view === "login" && (
            <LoginView
              onRegister={() => setView("register")}
              onForgot={() => setView("forgot")}
              showToast={showToast}
            />
          )}
          {view === "register" && (
            <RegisterView
              onBack={() => setView("login")}
              showToast={showToast}
            />
          )}
          {view === "forgot" && (
            <ForgotView
              onBack={() => setView("login")}
              showToast={showToast}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{
          position: "absolute", bottom: 20,
          display: "flex", gap: 24, fontSize: 12,
          color: "var(--text-l)",
        }}>
          {["© 2026 FitManage", "Privacy", "Terms", "Security"].map((t) => (
            <span key={t} style={{ cursor: "pointer" }}
              onMouseEnter={(e) => e.target.style.color = "var(--acc)"}
              onMouseLeave={(e) => e.target.style.color = "var(--text-l)"}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
