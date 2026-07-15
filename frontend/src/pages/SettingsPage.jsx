// frontend/src/pages/SettingsPage.jsx
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

const SIDEBAR_ITEMS = [
  { key:"general",   label:"General",         icon:"⚙️" },
  { key:"services",  label:"Services",        icon:"🔗" },
  { key:"pricing",   label:"Pricing",         icon:"💳" },
  { key:"staff",     label:"Staff",           icon:"🪪" },
  { key:"clients",   label:"Clients",         icon:"👥" },
  { key:"news",      label:"News & Events",   icon:"🗞️" },
  { key:"revenue",   label:"Revenue",         icon:"🏛️" },
  { key:"api",       label:"API Integrations", icon:"⚡" },
];

const NOTIFICATIONS = [
  { icon:"📅", color:C.blue,   title:"Zubayer Mahbub: personal training session", desc:"Your upcoming one-on-one session at the Central Atelier has been confirmed for tomorrow at 8:00 AM.", time:"2 MINS AGO" },
  { icon:"👥", color:C.acc,    title:"News & Events: Pilates Group class",        desc:"A new 'Core Essentials' class has been added to the Thursday evening schedule. Limited spots available.", time:"4 HOURS AGO" },
  { icon:"📆", color:C.purple, title:"Semi Private Group Class",                  desc:"The location for your semi-private session has been moved to the Rooftop Terrace due to optimal conditions.", time:"1 DAY AGO" },
  { icon:"🥤", color:C.yellow, title:"Curated Refreshments",                      desc:"Your post-workout green juice selection has been updated based on your recent dietary preferences.", time:"2 DAYS AGO" },
];

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

const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{
    background:C.card, borderRadius:14, border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(0,0,0,.04)", ...style,
  }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
    textTransform:"uppercase", color:C.tl, margin:"28px 0 12px" }}>{children}</p>
);

const SettingsRow = ({ icon, title, desc, action }) => (
  <Card style={{ padding:"18px 20px", display:"flex", alignItems:"center",
    justifyContent:"space-between", gap:14, marginBottom:10 }}>
    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:C.bg,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{icon}</div>
      <div>
        <div style={{ fontWeight:700, color:C.dark, fontSize:14 }}>{title}</div>
        <div style={{ fontSize:12, color:C.tm, marginTop:2 }}>{desc}</div>
      </div>
    </div>
    {action}
  </Card>
);

const GridCard = ({ icon, title, onClick, dark }) => (
  <div onClick={onClick} style={{
    background: dark ? "rgba(255,255,255,.08)" : C.bg,
    border:`1px solid ${dark ? "rgba(255,255,255,.12)" : C.border}`,
    borderRadius:12, padding:"16px 16px", cursor:"pointer",
  }}>
    <div style={{ fontSize:19, marginBottom:22 }}>{icon}</div>
    <div style={{ fontSize:13, fontWeight:600, color: dark ? "#fff" : C.dark }}>{title}</div>
  </div>
);

const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{
    width:40, height:22, borderRadius:11,
    background: on ? C.acc : "#CBD5E1",
    cursor:"pointer", position:"relative", flexShrink:0,
  }}>
    <div style={{
      width:16, height:16, borderRadius:"50%", background:"#fff",
      position:"absolute", top:3, left: on ? 21 : 3, transition:"left .15s",
    }}/>
  </div>
);

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifTab, setNotifTab] = useState("week");
  const [activeSidebar, setActiveSidebar] = useState("general");
  const [lightMode, setLightMode] = useState(true);
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
      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:24,
        padding:"20px 24px", maxWidth:1320, margin:"0 auto" }}>

        {/* SIDEBAR */}
        <div>
          <div style={{ fontWeight:800, fontSize:17, color:C.dark,
            fontFamily:"Georgia,serif" }}>Settings</div>
          <div style={{ fontSize:11, color:C.tl, marginBottom:16 }}>Global Dashboard</div>
          {SIDEBAR_ITEMS.map((s) => {
            const active = s.key === activeSidebar;
            return (
              <button key={s.key} onClick={() => setActiveSidebar(s.key)} style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"10px 12px", marginBottom:4, borderRadius:9, border:"none",
                cursor:"pointer", fontFamily:"inherit", fontSize:12.5, fontWeight:700,
                letterSpacing:".03em", textAlign:"left",
                background: active ? C.acc : "transparent",
                color: active ? "#fff" : C.tm,
              }}>
                <span style={{ fontSize:14 }}>{s.icon}</span> {s.label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div>
          {stubMessage && (
            <div style={{ background:"#FEF9C3", color:"#854D0E", padding:"10px 16px",
              borderRadius:10, fontSize:13, fontWeight:600, marginBottom:16 }}>
              {stubMessage}
            </div>
          )}

          {activeSidebar !== "general" ? (
            <Card style={{ padding:"48px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🚧</div>
              <div style={{ fontSize:16, fontWeight:700, color:C.dark, marginBottom:6 }}>
                {SIDEBAR_ITEMS.find(s => s.key === activeSidebar)?.label}</div>
              <div style={{ fontSize:13, color:C.tl }}>This section is under development.</div>
            </Card>
          ) : (
            <>
              <h2 style={{ fontSize:22, fontFamily:"Georgia,serif", color:C.dark, margin:0 }}>
                Workspace Settings</h2>
              <p style={{ fontSize:13, color:C.tm, marginTop:8, maxWidth:640 }}>
                Refine your operational environment. Manage your profile, preferences,
                and workspace controls through this centralized curator interface.</p>

              <SectionLabel>Core Settings</SectionLabel>
              <SettingsRow icon="👤" title="Account Identity"
                desc="Update your name, bio, and organizational role."
                action={<button onClick={() => navigate("/company")} style={{
                  padding:"7px 16px", background:C.bg, border:`1px solid ${C.border}`,
                  borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700,
                  color:C.dark, fontFamily:"inherit" }}>EDIT</button>}
              />
              <SettingsRow icon="🎨" title="Visual Theme"
                desc="Configure workspace appearance and editorial density."
                action={
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:C.tm }}>
                      {lightMode ? "LIGHT MODE" : "DARK MODE"}</span>
                    <Toggle on={!lightMode} onChange={() => {
                      setLightMode((v) => !v);
                      if (lightMode) showStub("Dark mode");
                    }}/>
                  </div>
                }
              />
              <SettingsRow icon="🛡️" title="Security & Key Access"
                desc="Manage 2FA, biometric logs, and password rotation."
                action={<button onClick={() => showStub("Security & Key Access")} style={{
                  padding:"7px 16px", background:C.bg, border:`1px solid ${C.border}`,
                  borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700,
                  color:C.dark, fontFamily:"inherit" }}>MANAGE</button>}
              />

              <SectionLabel>Services & Scheduling</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {[
                  ["🧭","Service Categories"], ["🗓️","Appointment Availability"], ["🎓","Class Type"],
                  ["📅","Manage Schedules"], ["📚","Class and Course Options"], ["🧩","Appointment Options"],
                  ["⏸️","Suspension Types"], ["⏱️","Scheduling Increments"],
                ].map(([icon, title]) => (
                  <GridCard key={title} icon={icon} title={title} onClick={() => showStub(title)}/>
                ))}
              </div>

              <Card style={{ background:C.acc, border:"none", color:"#fff",
                padding:24, marginTop:28 }}>
                <div style={{ fontSize:19, fontWeight:800, fontFamily:"Georgia,serif" }}>
                  Financial Engine</div>
                <p style={{ fontSize:13, opacity:.85, margin:"6px 0 18px", maxWidth:480 }}>
                  Optimize your revenue streams, manage contracts, and streamline
                  payment processing.</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                  {[
                    ["💳","Pricing Options",()=>showStub("Pricing Options")],
                    ["📋","Organize Pricing",()=>showStub("Organize Pricing")],
                    ["🧾","Accounts Payments",()=>showStub("Accounts Payments")],
                    ["🏬","Manage Sales",()=>showStub("Manage Sales")],
                    ["📜","Contracts",()=>showStub("Contracts")],
                    ["📦","Package",()=>navigate("/packages")],
                    ["🎟️","Promo Codes",()=>showStub("Promo Codes")],
                  ].map(([icon, title, onClick]) => (
                    <GridCard key={title} icon={icon} title={title} onClick={onClick} dark/>
                  ))}
                </div>
              </Card>

              <SectionLabel>Personnel & Workforce</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {[
                  ["🔐","Staff Permission"], ["🧘","Self Clock In"], ["✅","Time Clock Tasks"],
                ].map(([icon, title]) => (
                  <GridCard key={title} icon={icon} title={title} onClick={() => showStub(title)}/>
                ))}
              </div>

              <SectionLabel>CRM & Marketing</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
                {[
                  ["🔍","Client Indexes","Classify your customer base"],
                  ["👤","Clients Statuses","Track active and inactive users"],
                  ["🗂️","Client Types","Define custom labels for clients"],
                  ["💻","Membership Settings","Subscription tiers and rules"],
                ].map(([icon, title, desc]) => (
                  <Card key={title} onClick={() => showStub(title)} style={{
                    padding:16, display:"flex", gap:12, cursor:"pointer" }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:C.bg,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:16, flexShrink:0 }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:C.dark }}>{title}</div>
                      <div style={{ fontSize:11, color:C.tm, marginTop:2 }}>{desc}</div>
                    </div>
                  </Card>
                ))}
              </div>

              <SectionLabel>Communications & Intelligence</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12 }}>
                <Card style={{ padding:22 }}>
                  <div style={{ fontWeight:800, fontSize:16, color:C.dark,
                    fontFamily:"Georgia,serif" }}>News & Events</div>
                  <p style={{ fontSize:12, color:C.tm, margin:"6px 0 14px", maxWidth:340 }}>
                    Broadcast updates to your entire client base instantly through
                    the dashboard.</p>
                  <button onClick={() => showStub("Manage Broadcasts")} style={{
                    padding:"9px 18px", background:C.acc, color:"#fff", border:"none",
                    borderRadius:9, fontWeight:700, fontSize:12, cursor:"pointer",
                    fontFamily:"inherit" }}>MANAGE BROADCASTS</button>
                </Card>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <GridCard icon="✉️" title="Email Notification" onClick={() => showStub("Email Notification")}/>
                  <GridCard icon="💬" title="WhatsApp Notification" onClick={() => showStub("WhatsApp Notification")}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:12 }}>
                {[
                  ["📊","Revenue Categories"], ["🏦","Payment Methods"], ["🧮","Product Revenue Categories"],
                ].map(([icon, title]) => (
                  <GridCard key={title} icon={icon} title={title} onClick={() => showStub(title)}/>
                ))}
              </div>

              <SectionLabel>Developer & Ecosystem</SectionLabel>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12,
                marginBottom:20 }}>
                <GridCard icon="🧩" title="API Integration's" onClick={() => showStub("API Integrations")}/>
                <GridCard icon="🖥️" title="Branded App Web Admin Portal" onClick={() => showStub("Branded App Web Admin Portal")}/>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
