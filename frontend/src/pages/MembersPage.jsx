// frontend/src/pages/MembersPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

// ── Palette (same tokens used across Dashboard / Trainers / Packages) ────────
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

const COUNTRIES = ["United States","Bangladesh","United Kingdom","Canada","Australia","United Arab Emirates"];
const GENDERS = ["Male","Female","Other","Prefer not to say"];
const REFERRAL_TYPES = ["Internal","External","Online","Walk-in","Referral"];

// ── Shared UI (same helpers used in TrainerPage / PackagesPage) ─────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, borderRadius:14,
    border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(0,0,0,.04)", ...style }}>
    {children}
  </div>
);

function TopNav({ user, activeNav, onNavClick, onLogout }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifTab, setNotifTab] = useState("week");
  const [showAllStub, setShowAllStub] = useState(false);
  return (
    <>
      <nav style={{
        background:C.nav, height:54, display:"flex",
        alignItems:"center", padding:"0 24px",
        position:"sticky", top:0, zIndex:300,
        boxShadow:"0 2px 8px rgba(0,0,0,.2)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:20 }}>
          <svg width="28" height="28" viewBox="0 0 32 32">
            <polygon points="16,2 30,16 16,30 2,16" fill={C.acc}/>
            <polygon points="16,8 24,16 16,24 8,16" fill={C.acc2}/>
          </svg>
          <span style={{ color:"#fff", fontWeight:700, fontSize:17, fontFamily:"Georgia,serif" }}>FitManage</span>
        </div>
        <div style={{
          background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)",
          borderRadius:8, padding:"5px 14px", display:"flex",
          alignItems:"center", gap:8, cursor:"pointer", marginRight:"auto",
        }}>
          <span style={{ color:"#CBD5E1", fontSize:13 }}>YKBI Health & Fitness</span>
          <span style={{ color:C.tl, fontSize:10 }}>▾</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <span onClick={() => navigate("/settings")}
            style={{ fontSize:18, cursor:"pointer", opacity:.7 }}>⚙️</span>
          <span style={{ fontSize:18, cursor:"pointer", opacity:.7 }}>🔍</span>
          <div style={{ position:"relative" }}>
            <div style={{ position:"relative", cursor:"pointer" }}
              onClick={() => setShowNotifMenu(v => !v)}>
              <span style={{ fontSize:18 }}>🔔</span>
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
              onClick={() => setShowProfileMenu(v => !v)}>
              <div style={{
                width:32, height:32, borderRadius:"50%", background:C.acc,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontSize:13, fontWeight:700,
              }}>{user?.fullName?.[0] || "U"}</div>
              <span style={{ color:"#E2E8F0", fontSize:13, fontWeight:600 }}>
                {user?.fullName?.split(" ")[0] || "HABIB"}</span>
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
                    <div style={{ width:44, height:44, borderRadius:"50%",
                      background:C.acc2, display:"flex", alignItems:"center",
                      justifyContent:"center", color:"#fff", fontSize:16, fontWeight:700 }}>
                      {user?.fullName?.[0]||"U"}</div>
                    <div style={{ fontWeight:700, fontSize:15, marginTop:10 }}>
                      {user?.fullName}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                      <span style={{ fontSize:10, fontWeight:700, letterSpacing:".05em",
                        background:"rgba(255,255,255,.18)", borderRadius:6, padding:"2px 7px" }}>
                        {(ROLE_LABELS[user?.role]||user?.role||"Member").toUpperCase()}</span>
                      <span style={{ fontSize:11, opacity:.85 }}>ID: {user?.id}</span>
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
                    <button onClick={onLogout} style={{
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

      <div style={{
        background:C.card, borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", padding:"0 24px",
        position:"sticky", top:54, zIndex:299,
        boxShadow:"0 1px 3px rgba(0,0,0,.04)",
      }}>
        {NAV_ITEMS.map(({ label, icon }) => {
          const active = label === activeNav;
          return (
            <button key={label} onClick={() => onNavClick(label)} style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"13px 16px", fontSize:13,
              fontWeight: active ? 700 : 500,
              color: active ? C.acc : C.tm,
              borderBottom: active ? `2.5px solid ${C.acc}` : "2.5px solid transparent",
              fontFamily:"inherit", display:"flex", alignItems:"center", gap:5,
              transition:"color .15s",
            }}>
              <span style={{ fontSize:14 }}>{icon}</span> {label}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADD MEMBER FORM
// ══════════════════════════════════════════════════════════════════════════════
const emptyFamilyMember = () => ({ clientId:"", firstName:"", lastName:"" });

const initialForm = {
  isCompany:false, clientId:"", firstName:"", lastName:"", middleName:"",
  email:"", emailOptOut:false, phoneType:"mobile", phoneNumber:"",
  address:{ street:"", city:"", state:"", country:"United States", postalCode:"" },
  gender:"Male", birthday:"", referralType:"Internal", isProspect:false,
  subscriptions:{
    pilotGroupClass:true, semiPrivateGroupClass:true,
    newsAndPromos:false, welcomeEmail:false, whatsappNotification:true,
  },
  emergencyContact:{ name:"", relationship:"", phone:"", email:"" },
  relatedClientIds:[], familyMembers:[],
};

// Hoisted to module scope on purpose: defining these *inside* AddMemberForm
// would recreate them (and their JSX types) on every keystroke, which makes
// React remount the underlying <input> each time and drop focus after one
// character. Keeping them here means they're created once, ever.
const inputCls = {
  width:"100%", padding:"10px 13px", fontSize:13,
  fontFamily:"inherit", color:C.dark,
  border:`1.5px solid ${C.border}`, borderRadius:9,
  outline:"none", background:"#fff", boxSizing:"border-box",
  transition:"border-color .2s",
};
const selectCls = { ...inputCls, cursor:"pointer" };
const labelCls = {
  display:"block", fontSize:11, fontWeight:700,
  letterSpacing:".08em", textTransform:"uppercase",
  color:C.tm, marginBottom:7,
};

const Section = ({ title, children, right }) => (
  <div style={{
    background:"#fff", borderRadius:12, border:`1px solid ${C.border}`,
    padding:"22px 24px", marginBottom:16,
  }}>
    <div style={{ display:"flex", justifyContent:"space-between",
      alignItems:"center", marginBottom:18 }}>
      <h2 style={{ fontSize:16, fontWeight:800, color:C.dark }}>{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

const Row = ({ children, cols="1fr 1fr 1fr" }) => (
  <div style={{ display:"grid", gridTemplateColumns:cols, gap:16 }}>{children}</div>
);

const Field = ({ label, children }) => (
  <div><label style={labelCls}>{label}</label>{children}</div>
);

function AddMemberForm({ onSaved, onDiscard, user, onNavClick, onLogout }) {
  const [form, setForm] = useState(initialForm);
  const [relationshipQuery, setRelationshipQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const setField = useCallback((path, value) => {
    setForm(prev => {
      const next = { ...prev };
      const keys = path.split(".");
      let cursor = next;
      for (let i=0;i<keys.length-1;i++) {
        cursor[keys[i]] = { ...cursor[keys[i]] };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length-1]] = value;
      return next;
    });
  }, []);

  const addFamilyMember = () => setForm(f => ({ ...f, familyMembers:[...f.familyMembers, emptyFamilyMember()] }));
  const updateFamilyMember = (i, field, value) => setForm(f => {
    const familyMembers = [...f.familyMembers];
    familyMembers[i] = { ...familyMembers[i], [field]: value };
    return { ...f, familyMembers };
  });
  const removeFamilyMember = (i) => setForm(f => ({ ...f, familyMembers: f.familyMembers.filter((_,idx)=>idx!==i) }));

  const addRelationship = () => {
    if (!relationshipQuery.trim()) return;
    setForm(f => ({ ...f, relatedClientIds:[...f.relatedClientIds, relationshipQuery.trim()] }));
    setRelationshipQuery("");
  };
  const removeRelationship = (id) => setForm(f => ({ ...f, relatedClientIds: f.relatedClientIds.filter(r=>r!==id) }));

  const handleSave = async (asDraft=false) => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/members", { ...form, status: asDraft ? "inactive" : "active" });
      onSaved(res.data.member);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans',sans-serif" }}>
      <TopNav user={user} activeNav="Members" onNavClick={onNavClick} onLogout={onLogout}/>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"28px 28px 60px" }}>

        <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
          color:C.tl, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ cursor:"pointer", color:C.acc }} onClick={() => onNavClick("Dashboard")}>DASHBOARD</span>
          <span>/</span>
          <span style={{ cursor:"pointer", color:C.acc }} onClick={onDiscard}>MEMBERS</span>
          <span>/</span>
          <span style={{ color:C.dark }}>NEW ENTRY</span>
        </div>

        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.dark, marginBottom:4 }}>Create Member</h1>
          <p style={{ fontSize:13, color:C.tl }}>
            Curate and manage your high-value client network with precision and editorial
          </p>
        </div>

        {error && (
          <div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`,
            borderRadius:9, padding:"12px 16px", marginBottom:16,
            color:C.red, fontSize:13, fontWeight:600 }}>{error}</div>
        )}

        {/* Identity */}
        <Section title="Identity" right={
          <label style={{ display:"flex", alignItems:"center", gap:8,
            fontSize:12, fontWeight:600, color:C.tm, cursor:"pointer" }}>
            <input type="checkbox" checked={form.isCompany}
              onChange={e => setField("isCompany", e.target.checked)}/>
            IS A COMPANY
          </label>
        }>
          <Row>
            <Field label="Client ID">
              <input style={inputCls} placeholder="Auto-generated if left blank"
                value={form.clientId} onChange={e => setField("clientId", e.target.value)}/>
            </Field>
            <Field label="First Name *">
              <input style={inputCls} value={form.firstName}
                onChange={e => setField("firstName", e.target.value)}/>
            </Field>
            <Field label="Last Name *">
              <input style={inputCls} value={form.lastName}
                onChange={e => setField("lastName", e.target.value)}/>
            </Field>
          </Row>
          <div style={{ height:16 }}/>
          <Row cols="1fr 1fr">
            <Field label="Middle Name">
              <input style={inputCls} value={form.middleName}
                onChange={e => setField("middleName", e.target.value)}/>
            </Field>
            <Field label="Email Address">
              <div style={{ display:"flex", gap:10 }}>
                <input style={inputCls} type="email" placeholder="name@domain.com"
                  value={form.email} onChange={e => setField("email", e.target.value)}/>
                <label style={{ display:"flex", alignItems:"center", gap:6,
                  fontSize:12, fontWeight:600, color:C.tm, whiteSpace:"nowrap", cursor:"pointer" }}>
                  <input type="checkbox" checked={form.emailOptOut}
                    onChange={e => setField("emailOptOut", e.target.checked)}/>
                  OPT-OUT
                </label>
              </div>
            </Field>
          </Row>
          <div style={{ height:16 }}/>
          <label style={labelCls}>Phone Number</label>
          <div style={{ display:"inline-flex", border:`1px solid ${C.border}`,
            borderRadius:8, overflow:"hidden", marginBottom:8 }}>
            {["mobile","home"].map(type => (
              <button key={type} type="button" onClick={() => setField("phoneType", type)}
                style={{
                  border:"none", padding:"7px 16px", cursor:"pointer",
                  fontSize:11, fontWeight:700, textTransform:"uppercase",
                  fontFamily:"inherit",
                  background: form.phoneType===type ? "#F0FDF4" : "#fff",
                  color: form.phoneType===type ? C.acc : C.tm,
                }}>{type}</button>
            ))}
          </div>
          <input style={{ ...inputCls, maxWidth:320 }} placeholder="+1 (555) 000-0000"
            value={form.phoneNumber} onChange={e => setField("phoneNumber", e.target.value)}/>
        </Section>

        {/* Address & Location */}
        <Section title="Address & Location">
          <Field label="Street Address">
            <input style={inputCls} value={form.address.street}
              onChange={e => setField("address.street", e.target.value)}/>
          </Field>
          <div style={{ height:16 }}/>
          <Row cols="1fr 1fr">
            <Field label="City">
              <input style={inputCls} value={form.address.city}
                onChange={e => setField("address.city", e.target.value)}/>
            </Field>
            <Field label="State / Province">
              <input style={inputCls} value={form.address.state}
                onChange={e => setField("address.state", e.target.value)}/>
            </Field>
          </Row>
          <div style={{ height:16 }}/>
          <Row cols="1fr 1fr">
            <Field label="Country">
              <select style={selectCls} value={form.address.country}
                onChange={e => setField("address.country", e.target.value)}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Postal Code">
              <input style={inputCls} value={form.address.postalCode}
                onChange={e => setField("address.postalCode", e.target.value)}/>
            </Field>
          </Row>
        </Section>

        {/* Personal Info */}
        <Section title="Personal Info">
          <Row>
            <Field label="Gender">
              <select style={selectCls} value={form.gender}
                onChange={e => setField("gender", e.target.value)}>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Birthday">
              <input type="date" style={inputCls} value={form.birthday}
                onChange={e => setField("birthday", e.target.value)}/>
            </Field>
            <Field label="Referral Type">
              <select style={selectCls} value={form.referralType}
                onChange={e => setField("referralType", e.target.value)}>
                {REFERRAL_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </Row>
          <label style={{ display:"flex", alignItems:"center", gap:8,
            fontSize:12, fontWeight:600, color:C.tm, marginTop:16, cursor:"pointer" }}>
            <input type="checkbox" checked={form.isProspect}
              onChange={e => setField("isProspect", e.target.checked)}/>
            MARK AS PROSPECT (NON-FUNDED)
          </label>
        </Section>

        {/* Subscriptions */}
        <Section title="Subscriptions">
          {[
            ["pilotGroupClass","Pilot Group Class","Direct communications regarding holdings"],
            ["semiPrivateGroupClass","Semi-Private Group Class","Compliance and meeting alerts"],
          ].map(([key,title,desc]) => (
            <label key={key} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              border:`1px solid ${C.border}`, borderRadius:9, padding:"14px 16px",
              marginBottom:10, cursor:"pointer",
            }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.dark }}>{title}</div>
                <div style={{ fontSize:11, color:C.tl }}>{desc}</div>
              </div>
              <input type="checkbox" checked={form.subscriptions[key]}
                onChange={e => setField(`subscriptions.${key}`, e.target.checked)}/>
            </label>
          ))}
          <Row>
            {[
              ["newsAndPromos","News & Promos"],
              ["welcomeEmail","Welcome Email"],
              ["whatsappNotification","WhatsApp Notification"],
            ].map(([key,title]) => (
              <label key={key} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                border:`1px solid ${C.border}`, borderRadius:9, padding:"14px 16px", cursor:"pointer",
              }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.dark }}>{title}</span>
                <input type="checkbox" checked={form.subscriptions[key]}
                  onChange={e => setField(`subscriptions.${key}`, e.target.checked)}/>
              </label>
            ))}
          </Row>
        </Section>

        {/* Emergency Contact */}
        <Section title="Emergency Contact">
          <Row cols="1fr 1fr">
            <Field label="Contact Name">
              <input style={inputCls} value={form.emergencyContact.name}
                onChange={e => setField("emergencyContact.name", e.target.value)}/>
            </Field>
            <Field label="Relationship">
              <input style={inputCls} placeholder="e.g. Spouse" value={form.emergencyContact.relationship}
                onChange={e => setField("emergencyContact.relationship", e.target.value)}/>
            </Field>
          </Row>
          <div style={{ height:16 }}/>
          <Row cols="1fr 1fr">
            <Field label="Phone">
              <input style={inputCls} value={form.emergencyContact.phone}
                onChange={e => setField("emergencyContact.phone", e.target.value)}/>
            </Field>
            <Field label="Email">
              <input style={inputCls} type="email" value={form.emergencyContact.email}
                onChange={e => setField("emergencyContact.email", e.target.value)}/>
            </Field>
          </Row>
        </Section>

        {/* Relationships */}
        <Section title="Relationships">
          <div style={{ display:"flex", gap:10 }}>
            <input style={inputCls} placeholder="Search existing clients..."
              value={relationshipQuery} onChange={e => setRelationshipQuery(e.target.value)}/>
            <button type="button" onClick={addRelationship} style={{
              background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:9,
              padding:"0 18px", cursor:"pointer", fontSize:12, fontWeight:700,
              color:C.dark, fontFamily:"inherit", whiteSpace:"nowrap",
            }}>ADD RELATIONSHIP</button>
          </div>
          {form.relatedClientIds.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:12 }}>
              {form.relatedClientIds.map(id => (
                <span key={id} style={{
                  display:"flex", alignItems:"center", gap:6,
                  background:"#F1F5F9", borderRadius:20, padding:"5px 12px",
                  fontSize:12, fontWeight:600, color:C.tm,
                }}>
                  {id}
                  <span onClick={() => removeRelationship(id)}
                    style={{ cursor:"pointer", color:C.tl }}>×</span>
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* Family Members */}
        <Section title="Family Members">
          <button type="button" onClick={addFamilyMember} style={{
            width:"100%", border:`1.5px dashed ${C.border}`, borderRadius:9,
            padding:"16px 0", cursor:"pointer", background:"none",
            fontSize:13, fontWeight:700, color:C.tm, fontFamily:"inherit",
          }}>+ Add Family Member</button>

          {form.familyMembers.map((fm, i) => (
            <div key={i} style={{
              display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto",
              gap:12, border:`1px solid ${C.border}`, borderRadius:9,
              padding:16, marginTop:12, alignItems:"end",
            }}>
              <Field label="Client ID">
                <input style={inputCls} value={fm.clientId}
                  onChange={e => updateFamilyMember(i,"clientId",e.target.value)}/>
              </Field>
              <Field label="First Name">
                <input style={inputCls} value={fm.firstName}
                  onChange={e => updateFamilyMember(i,"firstName",e.target.value)}/>
              </Field>
              <Field label="Last Name">
                <input style={inputCls} value={fm.lastName}
                  onChange={e => updateFamilyMember(i,"lastName",e.target.value)}/>
              </Field>
              <button type="button" onClick={() => removeFamilyMember(i)} style={{
                background:"none", border:"none", cursor:"pointer",
                fontSize:12, fontWeight:700, color:C.red, fontFamily:"inherit",
                padding:"10px 0",
              }}>Remove</button>
            </div>
          ))}
        </Section>

        {/* Footer actions */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginTop:8 }}>
          <button onClick={() => handleSave(true)} disabled={submitting} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:12, fontWeight:700, color:C.tm, fontFamily:"inherit",
            letterSpacing:".08em", textTransform:"uppercase",
          }}>Save as Draft</button>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={onDiscard} style={{
              background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:9,
              padding:"11px 24px", cursor:"pointer", fontSize:13, fontWeight:700,
              color:C.dark, fontFamily:"inherit",
            }}>Cancel</button>
            <button onClick={() => handleSave(false)} disabled={submitting} style={{
              background:C.acc, border:"none", borderRadius:9,
              padding:"11px 28px", cursor: submitting ? "default" : "pointer",
              fontSize:13, fontWeight:700, color:"#fff", fontFamily:"inherit",
              opacity: submitting ? .7 : 1,
            }}>{submitting ? "Saving…" : "Confirm & Create Profile"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MEMBERS DASHBOARD (Overview)
// ══════════════════════════════════════════════════════════════════════════════
const FILTERS = [
  { key:"all", label:"All Members" },
  { key:"active", label:"Active Members" },
  { key:"ending", label:"Package Ending" },
];

function initials(first="", last="") {
  return `${first[0]||""}${last[0]||""}`.toUpperCase();
}

function MembersDashboard({ onAddNew, user, activeNav, onNavClick, onLogout, notice }) {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ totalMembers:0, activeMembers:0 });
  const [pagination, setPagination] = useState({ total:0, page:1, totalPages:1 });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setPage(1); }, [search, filter]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/members", { params: { search, filter, page, limit: 10 } });
        if (cancelled) return;
        setMembers(res.data.data);
        setStats(res.data.stats);
        setPagination(res.data.pagination);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Could not load members.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [search, filter, page, notice]);

  const revenueForecast = members.reduce((sum,m) => sum + (m.remainingClasses||0) * 120, 0);
  const packagesEnding = members.filter(m => m.packageExpiry && m.packageExpiry !== "Unlimited").length;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans',sans-serif" }}>
      <TopNav user={user} activeNav={activeNav} onNavClick={onNavClick} onLogout={onLogout}/>

      <div style={{ padding:"24px 28px", maxWidth:1280, margin:"0 auto" }}>

        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:22 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.dark, marginBottom:4 }}>Members Overview</h1>
            <p style={{ fontSize:13, color:C.tl }}>
              Curate and manage your high-value client network with precision and editorial
            </p>
          </div>
          <button onClick={onAddNew} style={{
            background:C.acc, border:"none", borderRadius:9,
            padding:"11px 20px", cursor:"pointer", fontSize:13, fontWeight:700,
            color:"#fff", fontFamily:"inherit", display:"flex",
            alignItems:"center", gap:7, transition:"background .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background="#155C3E"}
            onMouseLeave={e => e.currentTarget.style.background=C.acc}>
            + Add New Members
          </button>
        </div>

        {notice && (
          <div style={{ background:"#F0FDF4", border:`1px solid ${C.acc2}`,
            borderRadius:9, padding:"12px 16px", marginBottom:16,
            color:C.acc, fontSize:13, fontWeight:600 }}>{notice}</div>
        )}

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
          <Card style={{ padding:"18px 20px" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:".1em",
              textTransform:"uppercase", color:C.tl, marginBottom:6 }}>Total Members</p>
            <div style={{ fontSize:28, fontWeight:800, color:C.dark,
              fontFamily:"Georgia,serif", lineHeight:1 }}>{stats.totalMembers}</div>
            <div style={{ fontSize:11, color:C.acc2, marginTop:5, fontWeight:500 }}>Live from database</div>
          </Card>
          <Card style={{ padding:"18px 20px" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:".1em",
              textTransform:"uppercase", color:C.tl, marginBottom:6 }}>Active Members</p>
            <div style={{ fontSize:28, fontWeight:800, color:C.dark,
              fontFamily:"Georgia,serif", lineHeight:1 }}>{stats.activeMembers}</div>
            <div style={{ fontSize:11, color:C.tm, marginTop:5, fontWeight:500 }}>
              {Math.max(stats.totalMembers - stats.activeMembers, 0)} inactive</div>
          </Card>
          <div style={{ background:C.acc, borderRadius:14, padding:"18px 20px" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:".1em",
              textTransform:"uppercase", color:"rgba(255,255,255,.7)", marginBottom:6 }}>Revenue Forecast</p>
            <div style={{ fontSize:28, fontWeight:800, color:"#fff",
              fontFamily:"Georgia,serif", lineHeight:1 }}>${(revenueForecast/1000).toFixed(0)}k</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.8)", marginTop:5, fontWeight:500 }}>
              Estimated from this page</div>
          </div>
          <Card style={{ padding:"18px 20px" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:".1em",
              textTransform:"uppercase", color:C.tl, marginBottom:6 }}>Package Ending</p>
            <div style={{ fontSize:28, fontWeight:800, color:C.dark,
              fontFamily:"Georgia,serif", lineHeight:1 }}>{packagesEnding}</div>
            <div style={{ fontSize:11, color:C.red, marginTop:5, fontWeight:500 }}>On this page</div>
          </Card>
        </div>

        {/* Table card */}
        <Card style={{ overflow:"hidden" }}>
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between",
            alignItems:"center", gap:12, padding:16, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:".05em",
                textTransform:"uppercase", color:C.tl, marginRight:4 }}>Filter by:</span>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  border:"none", borderRadius:20, padding:"7px 16px", cursor:"pointer",
                  fontSize:12, fontWeight:600, fontFamily:"inherit",
                  background: filter===f.key ? "#F0FDF4" : "#F1F5F9",
                  color: filter===f.key ? C.acc : C.tm,
                }}>{f.label}</button>
              ))}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter members..." style={{
                border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px",
                fontSize:13, fontFamily:"inherit", color:C.dark, outline:"none",
                background:"#fff", width:220,
              }}/>
          </div>

          {error && <div style={{ padding:16, color:C.red, fontSize:13, fontWeight:600 }}>{error}</div>}

          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", minWidth:900, borderCollapse:"collapse",
              textAlign:"left", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["Name","Client ID","Package","Session Type","Total Classes",
                    "Service Name","Remaining Class","Package Expiry"].map(h => (
                    <th key={h} style={{ padding:"12px 16px", fontSize:10, fontWeight:700,
                      letterSpacing:".08em", textTransform:"uppercase", color:C.tl }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding:"40px 16px", textAlign:"center", color:C.tl }}>Loading members…</td></tr>
                ) : members.length===0 ? (
                  <tr><td colSpan={8} style={{ padding:"40px 16px", textAlign:"center", color:C.tl }}>
                    No members found. Try adjusting your filters, or add a new member.</td></tr>
                ) : members.map(m => (
                  <tr key={m._id} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:"50%",
                          background:"#F0FDF4", color:C.acc, fontSize:12, fontWeight:700,
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {initials(m.firstName, m.lastName)}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, color:C.dark }}>{m.firstName} {m.lastName}</div>
                          <div style={{ fontSize:11, color:C.tl }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", color:C.tm }}>{m.clientId}</td>
                    <td style={{ padding:"12px 16px", color:C.tm }}>{m.package || "—"}</td>
                    <td style={{ padding:"12px 16px", color:C.tm }}>{m.sessionType || "—"}</td>
                    <td style={{ padding:"12px 16px", color:C.tm }}>{m.totalClasses ?? "—"}</td>
                    <td style={{ padding:"12px 16px", color:C.tm }}>{m.serviceName || "—"}</td>
                    <td style={{ padding:"12px 16px", color:C.tm }}>{m.remainingClasses ?? "—"}</td>
                    <td style={{ padding:"12px 16px", color:C.tm }}>{m.packageExpiry || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", padding:16, fontSize:12, color:C.tl }}>
            <span>
              Showing {members.length ? (pagination.page-1)*10+1 : 0} to{" "}
              {(pagination.page-1)*10 + members.length} of {pagination.total} clients
            </span>
            <div style={{ display:"flex", gap:4 }}>
              <button disabled={pagination.page<=1} onClick={() => setPage(p => Math.max(p-1,1))}
                style={{ width:28, height:28, borderRadius:7, border:`1px solid ${C.border}`,
                  background:"#fff", cursor:"pointer", opacity: pagination.page<=1 ? .4 : 1 }}>‹</button>
              {Array.from({length: pagination.totalPages}, (_,i)=>i+1).slice(0,5).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width:28, height:28, borderRadius:7, cursor:"pointer",
                  border: p===pagination.page ? "none" : `1px solid ${C.border}`,
                  background: p===pagination.page ? C.acc : "#fff",
                  color: p===pagination.page ? "#fff" : C.tm,
                  fontWeight:600, fontSize:12,
                }}>{p}</button>
              ))}
              <button disabled={pagination.page>=pagination.totalPages}
                onClick={() => setPage(p => Math.min(p+1, pagination.totalPages))}
                style={{ width:28, height:28, borderRadius:7, border:`1px solid ${C.border}`,
                  background:"#fff", cursor:"pointer",
                  opacity: pagination.page>=pagination.totalPages ? .4 : 1 }}>›</button>
            </div>
          </div>
        </Card>

        <div style={{ textAlign:"center", padding:"24px 0 0", fontSize:12, color:C.tl }}>
          © 2026 FitManager Copyright and rights reserved
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT — switches between dashboard ↔ add form (same pattern as PackagesPage)
// ══════════════════════════════════════════════════════════════════════════════
export default function MembersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [activeNav, setActiveNav] = useState("Members");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
  }, []);

  const handleNavClick = useCallback((label) => {
    setActiveNav(label);
    if (label === "Dashboard") navigate("/dashboard");
    if (label === "Trainers")  navigate("/trainers");
    if (label === "Packages")  navigate("/packages");
    if (label === "Settings")  navigate("/settings");
    if (label === "Members")   setView("dashboard");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");
    navigate("/login");
  }, [navigate]);

  const handleSaved = useCallback((member) => {
    setView("dashboard");
    setNotice(`${member.firstName} ${member.lastName} was added to Members.`);
    setTimeout(() => setNotice(""), 4000);
  }, []);

  if (view === "add") {
    return (
      <AddMemberForm
        user={user}
        onSaved={handleSaved}
        onDiscard={() => setView("dashboard")}
        onNavClick={handleNavClick}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <MembersDashboard
      onAddNew={() => setView("add")}
      user={user}
      activeNav={activeNav}
      onNavClick={handleNavClick}
      onLogout={handleLogout}
      notice={notice}
    />
  );
}
