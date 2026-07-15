// frontend/src/pages/AccountInfoPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  acc:"#1A6B4A", acc2:"#22C55E", dark:"#0F172A",
  nav:"#1C2333", bg:"#F4F6F9", card:"#FFFFFF",
  border:"#E8ECF0", tm:"#64748B", tl:"#94A3B8",
  red:"#EF4444", yellow:"#F59E0B", blue:"#3B82F6",
  purple:"#8B5CF6", pink:"#EC4899",
};

const NAV_ITEMS = [
  { label:"Dashboard", icon:"⊞" },
  { label:"Packages",  icon:"📦" },
  { label:"Trainers",  icon:"🏋️" },
  { label:"Members",   icon:"👥" },
  { label:"Reports",   icon:"📊" },
  { label:"Settings",  icon:"⚙️" },
];

const ROLE_LABELS = { admin:"Administrator", trainer:"Trainer", member:"Member" };

const NOTIFICATIONS = [
  { icon:"📅", color:C.blue,   title:"Zubayer Mahbub: personal training session", desc:"Your upcoming one-on-one session at the Central Atelier has been confirmed for tomorrow at 8:00 AM.", time:"2 MINS AGO" },
  { icon:"👥", color:C.acc,    title:"News & Events: Pilates Group class",        desc:"A new 'Core Essentials' class has been added to the Thursday evening schedule. Limited spots available.", time:"4 HOURS AGO" },
  { icon:"📆", color:C.purple, title:"Semi Private Group Class",                  desc:"The location for your semi-private session has been moved to the Rooftop Terrace due to optimal conditions.", time:"1 DAY AGO" },
  { icon:"🥤", color:C.yellow, title:"Curated Refreshments",                      desc:"Your post-workout green juice selection has been updated based on your recent dietary preferences.", time:"2 DAYS AGO" },
];

const PREFS_KEY = "fm_account_prefs";
const loadPrefs = () => {
  try {
    const s = localStorage.getItem(PREFS_KEY);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return { email:"", country:"Bangladesh", language:"English (US) - Default" };
};
const savePrefs = (p) => {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (e) {}
};

const formatMonthYear = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month:"long", year:"numeric" });
};
const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { dateStyle:"medium", timeStyle:"short" });
};

const Avatar = ({ name, color, size=36 }) => {
  const initials = (name||"U").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", background:color,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#fff", fontSize:size*0.35, fontWeight:700, flexShrink:0,
    }}>{initials}</div>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{
    background:C.card, borderRadius:14, border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(0,0,0,.04)", ...style,
  }}>{children}</div>
);

const Field = ({ label, icon, children }) => (
  <div>
    <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
      textTransform:"uppercase", color:C.tl, marginBottom:8 }}>{label}</p>
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      border:`1px solid ${C.border}`, borderRadius:10,
      padding:"11px 14px", background:"#fff",
    }}>
      <span style={{ fontSize:15, opacity:.6 }}>{icon}</span>
      {children}
    </div>
  </div>
);

const textInputStyle = {
  border:"none", outline:"none", fontSize:14, color:C.dark,
  fontFamily:"inherit", flex:1, background:"transparent",
};

export default function AccountInfoPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifTab, setNotifTab] = useState("week");
  const [showAllStub, setShowAllStub] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs());
  const [savedFlash, setSavedFlash] = useState(false);
  const [stubNote, setStubNote] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  const handleNavClick = (label) => {
    if (label === "Dashboard") navigate("/dashboard");
    if (label === "Trainers")  navigate("/trainers");
    if (label === "Packages")  navigate("/packages");
    if (label === "Members")   navigate("/members");
    if (label === "Settings")  navigate("/settings");
  };

  const handleLogout = () => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");
    navigate("/login");
  };

  const handleChange = (field) => (e) =>
    setPrefs((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = () => {
    savePrefs(prefs);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleCancel = () => setPrefs(loadPrefs());

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] || user.role || "Member";

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.dark }}>

      {/* TOP NAV */}
      <nav style={{
        background:C.nav, height:54, display:"flex", alignItems:"center",
        padding:"0 24px", position:"sticky", top:0, zIndex:300,
        boxShadow:"0 2px 8px rgba(0,0,0,.2)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:20 }}>
          <svg width="28" height="28" viewBox="0 0 32 32">
            <polygon points="16,2 30,16 16,30 2,16" fill={C.acc}/>
            <polygon points="16,8 24,16 16,24 8,16" fill={C.acc2}/>
          </svg>
          <span style={{ color:"#fff", fontWeight:700, fontSize:17,
            fontFamily:"Georgia,serif" }}>FitManage</span>
        </div>
        <div style={{
          background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)",
          borderRadius:8, padding:"5px 14px", display:"flex", alignItems:"center",
          gap:8, cursor:"pointer", marginRight:"auto",
        }}>
          <span style={{ color:"#CBD5E1", fontSize:13 }}>YKBI Health & Fitness</span>
          <span style={{ color:C.tl, fontSize:11 }}>▾</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <span onClick={() => navigate("/settings")}
            style={{ fontSize:20, cursor:"pointer", opacity:.7 }}>⚙️</span>
          <span style={{ fontSize:20, cursor:"pointer", opacity:.7 }}>🔍</span>
          <div style={{ position:"relative" }}>
            <div style={{ position:"relative", cursor:"pointer" }}
              onClick={() => setShowNotifMenu(v => !v)}>
              <span style={{ fontSize:20 }}>🔔</span>
              <div style={{
                position:"absolute", top:-4, right:-4, width:16, height:16,
                background:C.red, borderRadius:"50%", fontSize:9,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontWeight:700, border:"2px solid "+C.nav,
              }}>{NOTIFICATIONS.length}</div>
            </div>
            {showNotifMenu && (
              <>
                <div onClick={() => setShowNotifMenu(false)}
                  style={{ position:"fixed", inset:0, zIndex:400 }}/>
                <div style={{
                  position:"absolute", top:"calc(100% + 10px)", right:-60, width:340,
                  background:C.card, borderRadius:14, boxShadow:"0 12px 32px rgba(0,0,0,.2)",
                  zIndex:401, padding:18,
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontWeight:800, fontSize:16, fontFamily:"Georgia,serif",
                      color:C.dark }}>Notifications</div>
                    <div style={{ display:"flex", gap:6 }}>
                      {["week","all"].map((t) => (
                        <button key={t} onClick={() => setNotifTab(t)} style={{
                          padding:"5px 10px", borderRadius:8, border:"none", cursor:"pointer",
                          fontSize:11, fontWeight:700, fontFamily:"inherit",
                          background: notifTab === t ? C.acc : C.bg,
                          color: notifTab === t ? "#fff" : C.tm,
                        }}>{t === "week" ? "This Week" : "All Time"}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:".08em",
                    color:C.tl, marginBottom:8 }}>RECENT ACTIVITY</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10,
                    maxHeight:320, overflowY:"auto" }}>
                    {NOTIFICATIONS.map((n, i) => (
                      <div key={i} style={{ display:"flex", gap:10, padding:10,
                        borderRadius:10, background:C.bg }}>
                        <div style={{ width:34, height:34, borderRadius:9, background:n.color,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:15, flexShrink:0 }}>{n.icon}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", gap:6 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:C.dark }}>{n.title}</span>
                            <span style={{ fontSize:9, color:C.tl, whiteSpace:"nowrap" }}>{n.time}</span>
                          </div>
                          <p style={{ fontSize:11, color:C.tm, margin:"3px 0 0" }}>{n.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => {
                    setShowAllStub(true);
                    setTimeout(() => setShowAllStub(false), 3000);
                  }} style={{
                    width:"100%", marginTop:14, padding:"10px", background:C.acc,
                    color:"#fff", border:"none", borderRadius:9, fontWeight:700,
                    fontSize:12, cursor:"pointer", fontFamily:"inherit",
                  }}>SHOW ALL NOTIFICATIONS</button>
                  {showAllStub && (
                    <p style={{ fontSize:11, color:C.tl, textAlign:"center", marginTop:8 }}>
                      🚧 Full notification history is under development.</p>
                  )}
                </div>
              </>
            )}
          </div>
          <div style={{ position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
              onClick={() => setShowProfileMenu((v) => !v)}>
              <Avatar name={user.fullName||"U"} color={C.acc} size={32}/>
              <span style={{ color:"#E2E8F0", fontSize:13, fontWeight:600 }}>
                {user.fullName?.split(" ")[0]||"User"}</span>
              <span style={{ color:C.tl, fontSize:10 }}>▾</span>
            </div>
            {showProfileMenu && (
              <>
                <div onClick={() => setShowProfileMenu(false)}
                  style={{ position:"fixed", inset:0, zIndex:400 }}/>
                <div style={{
                  position:"absolute", top:"calc(100% + 10px)", right:0, width:260,
                  background:C.card, borderRadius:14, overflow:"hidden",
                  boxShadow:"0 12px 32px rgba(0,0,0,.2)", zIndex:401,
                }}>
                  <div style={{ background:C.acc, padding:"20px 18px", color:"#fff" }}>
                    <Avatar name={user.fullName||"U"} color={C.acc2} size={44}/>
                    <div style={{ fontWeight:700, fontSize:15, marginTop:10 }}>{user.fullName}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                      <span style={{ fontSize:10, fontWeight:700, letterSpacing:".05em",
                        background:"rgba(255,255,255,.18)", borderRadius:6, padding:"2px 7px" }}>
                        {roleLabel.toUpperCase()}</span>
                      <span style={{ fontSize:11, opacity:.85 }}>ID: {user.id}</span>
                    </div>
                  </div>
                  <div style={{ padding:"8px 0" }}>
                    <button onClick={() => { setShowProfileMenu(false); navigate("/account"); }}
                      style={menuItemStyle}>👤 Account Information</button>
                    <div style={{ ...menuItemStyle, cursor:"default", color:C.tl }}>
                      🏷️ Fit-Manage Subscription
                      <span style={soonPillStyle}>SOON</span>
                    </div>
                    <div style={{ ...menuItemStyle, cursor:"default", color:C.tl }}>
                      🔔 Notification Settings
                      <span style={soonPillStyle}>SOON</span>
                    </div>
                  </div>
                  <div style={{ borderTop:`1px solid ${C.border}`, padding:"10px 14px" }}>
                    <button onClick={handleLogout} style={{
                      width:"100%", padding:"9px", background:"#F1F5F9", border:"none",
                      borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600,
                      color:C.dark, fontFamily:"inherit",
                    }}>↪ Sign Out</button>
                  </div>
                  <div style={{ textAlign:"center", padding:"10px 14px 14px",
                    fontSize:11, color:C.tl }}>
                    Need assistance? <span style={{ color:C.acc, fontWeight:600,
                      cursor:"pointer" }}>Contact Support</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* SUB-NAV */}
      <div style={{
        background:C.card, borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", padding:"0 24px",
        position:"sticky", top:54, zIndex:299,
        boxShadow:"0 1px 4px rgba(0,0,0,.04)",
      }}>
        {NAV_ITEMS.map(({ label, icon }) => (
          <button key={label} onClick={() => handleNavClick(label)} style={{
            background:"none", border:"none", cursor:"pointer",
            padding:"13px 16px", fontSize:13, fontWeight:500, color:C.tm,
            borderBottom:"2.5px solid transparent",
            fontFamily:"inherit", display:"flex", alignItems:"center", gap:5,
          }}>
            <span style={{ fontSize:14 }}>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div style={{ padding:"20px 24px", maxWidth:1320, margin:"0 auto" }}>
        <div onClick={() => navigate("/dashboard")} style={{
          display:"flex", alignItems:"center", gap:8, cursor:"pointer",
          fontSize:12, fontWeight:700, letterSpacing:".05em", color:C.tm,
          textTransform:"uppercase", marginBottom:16,
        }}>← Return to Dashboard</div>

        <Card style={{ display:"grid", gridTemplateColumns:"300px 1fr",
          padding:0, overflow:"hidden" }}>
          {/* LEFT: profile summary */}
          <div style={{ padding:28, borderRight:`1px solid ${C.border}` }}>
            <Avatar name={user.fullName||"U"} color={C.acc} size={96}/>
            <div style={{ fontSize:19, fontWeight:800, fontFamily:"Georgia,serif",
              color:C.dark, marginTop:14 }}>{user.fullName}</div>
            <div style={{ fontSize:12, fontWeight:700, color:C.acc,
              letterSpacing:".05em", marginTop:2 }}>{roleLabel.toUpperCase()}</div>
            <div style={{ display:"inline-block", background:C.bg, border:`1px solid ${C.border}`,
              borderRadius:20, padding:"3px 12px", fontSize:11, color:C.tm, marginTop:10 }}>
              ID: {user.id}</div>

            <div style={{ marginTop:26 }}>
              <p style={labelStyle}>Member Since</p>
              <p style={valueStyle}>{formatMonthYear(user.createdAt)}</p>
            </div>
            <div style={{ marginTop:16 }}>
              <p style={labelStyle}>Last Activity</p>
              <p style={valueStyle}>{formatDateTime(user.lastLogin)}</p>
            </div>
          </div>

          {/* RIGHT: editable info */}
          <div style={{ padding:28 }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start" }}>
              <div>
                <h2 style={{ fontSize:22, fontFamily:"Georgia,serif",
                  color:C.dark, margin:0 }}>My Account Information</h2>
                <p style={{ fontSize:13, color:C.tm, marginTop:6 }}>
                  Personalize your professional credentials and identity.</p>
              </div>
              <span style={{ background:"#DCFCE7", color:"#15803D", fontSize:11,
                fontWeight:700, borderRadius:20, padding:"5px 12px" }}>VERIFIED PROFILE</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
              gap:18, marginTop:22 }}>
              <Field label="Email Address" icon="✉️">
                <input type="email" placeholder="you@example.com" style={textInputStyle}
                  value={prefs.email} onChange={handleChange("email")}/>
              </Field>
              <Field label="Contact Number" icon="📞">
                <input type="text" style={textInputStyle}
                  value={user.whatsapp||""} readOnly/>
              </Field>
              <Field label="Password" icon="🔒">
                <input type={showPassword ? "text" : "password"} readOnly
                  style={textInputStyle} value="fitmanage-secure"/>
                <span onClick={() => setShowPassword((v) => !v)}
                  style={{ cursor:"pointer", opacity:.6 }}>{showPassword ? "🙈" : "👁"}</span>
              </Field>
              <Field label="Country / Region" icon="🌍">
                <select style={{ ...textInputStyle, cursor:"pointer" }}
                  value={prefs.country} onChange={handleChange("country")}>
                  <option>Bangladesh</option>
                  <option>United States</option>
                  <option>United Arab Emirates</option>
                  <option>United Kingdom</option>
                </select>
              </Field>
              <Field label="Account Status" icon={user.isActive ? "✅" : "⛔"}>
                <span style={{ fontWeight:600, color: user.isActive ? "#15803D" : C.red }}>
                  {user.isActive ? "Active & Secured" : "Inactive"}</span>
              </Field>
              <Field label="Dashboard Language" icon="🌐">
                <select style={{ ...textInputStyle, cursor:"pointer" }}
                  value={prefs.language} onChange={handleChange("language")}>
                  <option>English (US) - Default</option>
                  <option>Bengali</option>
                  <option>English (UK)</option>
                </select>
              </Field>
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end",
              alignItems:"center", gap:10, marginTop:26 }}>
              {savedFlash && (
                <span style={{ fontSize:12, color:"#15803D", fontWeight:600 }}>
                  ✓ Saved for this session</span>
              )}
              <button onClick={handleCancel} style={{
                padding:"10px 18px", background:"#F1F5F9", border:"none",
                borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600,
                color:C.dark, fontFamily:"inherit",
              }}>Cancel Changes</button>
              <button onClick={handleSave} style={{
                padding:"10px 20px", background:C.acc, border:"none",
                borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700,
                color:"#fff", fontFamily:"inherit",
              }}>Save Credentials</button>
            </div>
          </div>
        </Card>

        {/* BOTTOM CARDS */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:16, marginTop:16 }}>
          <Card style={{ padding:20, display:"flex", gap:14 }}>
            <span style={{ fontSize:22 }}>🛡️</span>
            <div>
              <div style={{ fontWeight:700, color:C.dark }}>Two-Factor Authentication</div>
              <p style={{ fontSize:12, color:C.tm, margin:"4px 0 8px" }}>
                Not yet available for this account.</p>
              <span onClick={() => setStubNote(stubNote === "security" ? null : "security")}
                style={{ fontSize:12, fontWeight:700, color:C.acc, cursor:"pointer" }}>
                MANAGE SECURITY</span>
              {stubNote === "security" && (
                <p style={{ fontSize:12, color:C.tl, marginTop:6 }}>🚧 Under development.</p>
              )}
            </div>
          </Card>
          <Card style={{ padding:20, display:"flex", gap:14 }}>
            <span style={{ fontSize:22 }}>📱</span>
            <div>
              <div style={{ fontWeight:700, color:C.dark }}>Connected Devices</div>
              <p style={{ fontSize:12, color:C.tm, margin:"4px 0 8px" }}>
                Session tracking is not yet available.</p>
              <span onClick={() => setStubNote(stubNote === "sessions" ? null : "sessions")}
                style={{ fontSize:12, fontWeight:700, color:C.acc, cursor:"pointer" }}>
                VIEW SESSIONS</span>
              {stubNote === "sessions" && (
                <p style={{ fontSize:12, color:C.tl, marginTop:6 }}>🚧 Under development.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const menuItemStyle = {
  width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
  gap:8, padding:"10px 18px", background:"none", border:"none",
  fontSize:13, fontWeight:500, color:C.dark, fontFamily:"inherit",
  cursor:"pointer", textAlign:"left",
};
const soonPillStyle = {
  fontSize:9, fontWeight:700, color:C.tl, background:C.bg,
  border:`1px solid ${C.border}`, borderRadius:10, padding:"2px 6px",
};
const labelStyle = {
  fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase",
  color:C.tl, marginBottom:4,
};
const valueStyle = { fontSize:13, fontWeight:600, color:C.dark, margin:0 };
