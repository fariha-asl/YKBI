// frontend/src/pages/CompanyDetailsPage.jsx
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

const COMPANY_KEY = "fm_company_details";
const loadCompany = () => {
  try {
    const s = localStorage.getItem(COMPANY_KEY);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return { email:"", phone:"", country:"Bangladesh", status:"Active" };
};
const saveCompany = (c) => {
  try { localStorage.setItem(COMPANY_KEY, JSON.stringify(c)); } catch (e) {}
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

const Field = ({ label, children }) => (
  <div>
    <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
      textTransform:"uppercase", color:C.tl, marginBottom:8 }}>{label}</p>
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      border:`1px solid ${C.border}`, borderRadius:10,
      padding:"11px 14px", background:"#fff",
    }}>{children}</div>
  </div>
);

const textInputStyle = {
  border:"none", outline:"none", fontSize:14, color:C.dark,
  fontFamily:"inherit", flex:1, background:"transparent",
};

export default function CompanyDetailsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifTab, setNotifTab] = useState("week");
  const [showPassword, setShowPassword] = useState(false);
  const [company, setCompany] = useState(loadCompany());
  const [savedFlash, setSavedFlash] = useState(false);
  const [stubMessage, setStubMessage] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  const showStub = (name) => {
    setStubMessage(`🚧 ${name} — coming soon.`);
    setTimeout(() => setStubMessage(null), 3000);
  };

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
    setCompany((c) => ({ ...c, [field]: e.target.value }));

  const handleSave = () => {
    saveCompany(company);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleDiscard = () => setCompany(loadCompany());

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

          {/* NOTIFICATIONS */}
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
                  <button onClick={() => showStub("Full notification history")} style={{
                    width:"100%", marginTop:14, padding:"10px", background:C.acc,
                    color:"#fff", border:"none", borderRadius:9, fontWeight:700,
                    fontSize:12, cursor:"pointer", fontFamily:"inherit",
                  }}>SHOW ALL NOTIFICATIONS</button>
                </div>
              </>
            )}
          </div>

          {/* PROFILE */}
          <div style={{ position:"relative" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
              onClick={() => setShowProfileMenu(v => !v)}>
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
                      style={{ width:"100%", display:"flex", alignItems:"center",
                        justifyContent:"space-between", gap:8, padding:"10px 18px",
                        background:"none", border:"none", fontSize:13, fontWeight:500,
                        color:C.dark, fontFamily:"inherit", cursor:"pointer",
                        textAlign:"left" }}>👤 Account Information</button>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      gap:8, padding:"10px 18px", fontSize:13, fontWeight:500, color:C.tl }}>
                      🏷️ Fit-Manage Subscription
                      <span style={{ fontSize:9, fontWeight:700, color:C.tl, background:C.bg,
                        border:`1px solid ${C.border}`, borderRadius:10, padding:"2px 6px" }}>SOON</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      gap:8, padding:"10px 18px", fontSize:13, fontWeight:500, color:C.tl }}>
                      🔔 Notification Settings
                      <span style={{ fontSize:9, fontWeight:700, color:C.tl, background:C.bg,
                        border:`1px solid ${C.border}`, borderRadius:10, padding:"2px 6px" }}>SOON</span>
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
        {NAV_ITEMS.map(({ label, icon }) => {
          const active = label === "Settings";
          return (
            <button key={label} onClick={() => handleNavClick(label)} style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"13px 16px", fontSize:13,
              fontWeight: active ? 700 : 500,
              color: active ? C.acc : C.tm,
              borderBottom: active ? `2.5px solid ${C.acc}` : "2.5px solid transparent",
              fontFamily:"inherit", display:"flex", alignItems:"center", gap:5,
            }}>
              <span style={{ fontSize:14 }}>{icon}</span> {label}
            </button>
          );
        })}
      </div>

      {/* BODY */}
      <div style={{ padding:"20px 24px", maxWidth:1000, margin:"0 auto" }}>
        <h1 style={{ fontSize:24, fontFamily:"Georgia,serif", color:C.dark,
          margin:"0 0 18px" }}>Company Details</h1>

        {stubMessage && (
          <div style={{ background:"#FEF9C3", color:"#854D0E", padding:"10px 16px",
            borderRadius:10, fontSize:13, fontWeight:600, marginBottom:16 }}>
            {stubMessage}
          </div>
        )}

        <Card style={{ padding:28 }}>
          <div style={{ display:"flex", gap:24, alignItems:"flex-start",
            paddingBottom:24, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:110, height:110, borderRadius:12, background:"#fff",
              border:`1px solid ${C.border}`, display:"flex", alignItems:"center",
              justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontWeight:800, fontSize:20, fontFamily:"Georgia,serif",
                background:`linear-gradient(90deg, ${C.acc}, ${C.acc2})`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>YKBI</span>
            </div>
            <div>
              <h3 style={{ fontSize:17, color:C.dark, margin:0 }}>Company Profile Image</h3>
              <p style={{ fontSize:12, color:C.tm, margin:"6px 0 12px" }}>
                Update your company's visual identity across the curator suite.</p>
              <div style={{ display:"flex", gap:16 }}>
                <button onClick={() => showStub("Change Logo")} style={{
                  padding:"8px 16px", background:C.bg, border:`1px solid ${C.border}`,
                  borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700,
                  color:C.dark, fontFamily:"inherit" }}>CHANGE LOGO</button>
                <button onClick={() => showStub("Remove Logo")} style={{
                  padding:"8px 4px", background:"none", border:"none",
                  cursor:"pointer", fontSize:12, fontWeight:700,
                  color:C.red, fontFamily:"inherit" }}>REMOVE</button>
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginTop:24 }}>
            <Field label="Official Email Address">
              <input type="email" placeholder="you@company.com" style={textInputStyle}
                value={company.email} onChange={handleChange("email")}/>
            </Field>
            <Field label="Contact Phone">
              <input type="text" placeholder="+880 1XXX XXXXXX" style={textInputStyle}
                value={company.phone} onChange={handleChange("phone")}/>
            </Field>
            <Field label="Country of Operation">
              <select style={{ ...textInputStyle, cursor:"pointer" }}
                value={company.country} onChange={handleChange("country")}>
                <option>Bangladesh</option>
                <option>United States</option>
                <option>United Arab Emirates</option>
                <option>United Kingdom</option>
              </select>
            </Field>
            <Field label="Entity Status">
              <span style={{ fontWeight:600, color:"#15803D", flex:1 }}>{company.status}</span>
              <span style={{ opacity:.6 }}>✅</span>
            </Field>
          </div>

          <div style={{ marginTop:20 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
              textTransform:"uppercase", color:C.tl, marginBottom:8 }}>
              Management Key (Password)</p>
            <div style={{ display:"flex", alignItems:"center", gap:10,
              border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 14px" }}>
              <input type={showPassword ? "text" : "password"} readOnly
                style={textInputStyle} value="fitmanage-secure-key"/>
              <span onClick={() => setShowPassword((v) => !v)}
                style={{ cursor:"pointer", opacity:.6 }}>{showPassword ? "🙈" : "👁"}</span>
            </div>
            <p style={{ fontSize:11, color:C.tl, marginTop:6 }}>
              Last rotated 14 days ago for security compliance.</p>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            marginTop:26, paddingTop:20, borderTop:`1px solid ${C.border}` }}>
            <span onClick={handleDiscard} style={{ fontSize:12, fontWeight:700,
              color:C.dark, textDecoration:"underline", cursor:"pointer" }}>
              DISCARD CHANGES</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {savedFlash && (
                <span style={{ fontSize:12, color:"#15803D", fontWeight:600 }}>
                  ✓ Saved for this session</span>
              )}
              <button onClick={() => showStub("Archive Account")} style={{
                padding:"10px 18px", background:"#F1F5F9", border:"none",
                borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600,
                color:C.dark, fontFamily:"inherit" }}>Archive Account</button>
              <button onClick={handleSave} style={{
                padding:"10px 20px", background:C.acc, border:"none",
                borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700,
                color:"#fff", fontFamily:"inherit" }}>Save Entity Details</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
