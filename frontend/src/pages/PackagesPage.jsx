// frontend/src/pages/PackagesPage.jsx
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

const SERVICE_TYPES = ["Classes","Appointments","Packages","Memberships"];
const SERVICE_CATEGORIES = [
  "Yoga & Pilates","Personal Training","Group Fitness",
  "Bodybuilding","CrossFit","Swimming","Boxing","Nutrition",
];
const REVENUE_CATEGORIES = [
  "Sales: Services","Sales: Products","Sales: Memberships","Sales: Other",
];
const FREQUENCY_OPTIONS = ["Unrestricted","Once per day","Once per week","Once per month"];
const MEMBERSHIP_LINKS  = ["None","Basic","Premium","VIP"];
const TRIGGER_OPTIONS   = ["From date of sale","From first use","From specific date"];
const DURATION_UNITS    = ["Days","Weeks","Months","Years"];

// ── Type badge color ──────────────────────────────────────────────────────────
const TYPE_COLORS = {
  Classes:      { bg:"#DCFCE7", color:"#166534" },
  Appointments: { bg:"#DBEAFE", color:"#1e40af" },
  Packages:     { bg:"#FEF9C3", color:"#854d0e" },
  Memberships:  { bg:"#F3E8FF", color:"#6b21a8" },
};

// ── Storage helpers ───────────────────────────────────────────────────────────
const PKG_KEY = "fm_packages";

const DEMO_PACKAGES = [
  { id:1,  name:"1 Foundation",             sessions:1,  type:"Classes",      category:"Pilates",          price:2875, active:true,  sellOnline:true  },
  { id:2,  name:"DT-1 Day a Week 1 Month",  sessions:12, type:"Appointments", category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:3,  name:"DT-3 Days a Week 2 Months",sessions:5,  type:"Packages",     category:"Yoga",             price:450,  active:true,  sellOnline:false },
  { id:4,  name:"DT-1 Day a Week 1 Month",  sessions:12, type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:5,  name:"DT-1 Day a Week 1 Month",  sessions:12, type:"Appointments", category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:6,  name:"DT-1 Day a Week 1 Month",  sessions:12, type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:7,  name:"DT-1 Day a Week 1 Month",  sessions:12, type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:8,  name:"DT-1 Day a Week 1 Month",  sessions:12, type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:9,  name:"DT-1 Day a Week 1 Month",  sessions:12, type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:10, name:"DT-1 Day a Week 1 Month",  sessions:12, type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
];

const loadPackages = () => {
  try {
    const saved = localStorage.getItem(PKG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {}
  localStorage.setItem(PKG_KEY, JSON.stringify(DEMO_PACKAGES));
  return DEMO_PACKAGES;
};

const savePackages = (data) => {
  try { localStorage.setItem(PKG_KEY, JSON.stringify(data)); } catch(e) {}
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, borderRadius:14,
    border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(0,0,0,.04)", ...style }}>
    {children}
  </div>
);

const Toggle = ({ on, onChange }) => (
  <div onClick={() => onChange(!on)} style={{
    width:38, height:20, borderRadius:10,
    background: on ? C.acc : "#E2E8F0",
    cursor:"pointer", position:"relative", transition:"background .2s",
  }}>
    <div style={{
      width:16, height:16, borderRadius:"50%", background:"#fff",
      position:"absolute", top:2, left: on ? 20 : 2,
      transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)",
    }}/>
  </div>
);

const Radio = ({ checked, onChange, label }) => (
  <label style={{ display:"flex", alignItems:"center", gap:8,
    cursor:"pointer", fontSize:13, color:C.dark }}>
    <div onClick={onChange} style={{
      width:16, height:16, borderRadius:"50%",
      border:`2px solid ${checked ? C.acc : C.border}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor:"pointer", background:"#fff",
      transition:"border-color .15s",
    }}>
      {checked && <div style={{ width:8, height:8,
        borderRadius:"50%", background:C.acc }}/>}
    </div>
    {label}
  </label>
);

// ══════════════════════════════════════════════════════════════════════════════
// ADD NEW PACKAGE FORM
// ══════════════════════════════════════════════════════════════════════════════
function AddPackageForm({ onSave, onDiscard }) {
  const [form, setForm] = useState({
    name:"", type:"Classes", category:"Yoga & Pilates",
    price:"", sellOnline:false,
    duration:"12", durationUnit:"Months", trigger:"From date of sale",
    sessionFreq:"Single Session",
    introOffer:"No", contractRequired:"No",
    revenueCategory:"Sales: Services", frequencyOfUse:"Unrestricted",
    membershipLink:"None", advancedSettings:"Standard",
    active:true,
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) =>
    setForm(f => ({ ...f, [k]: e.target.type==="checkbox" ? e.target.checked : e.target.value }));
  const setV = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Package name is required";
    if (!form.price)        e.price = "Price is required";
    return e;
  };

  const handleSave = (addAnother=false) => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const pkg = {
      id: Date.now(),
      name: form.name.trim(),
      sessions: parseInt(form.duration) || 1,
      type: form.type,
      category: form.category,
      price: parseFloat(form.price) || 0,
      active: true,
      sellOnline: form.sellOnline,
      sessionFreq: form.sessionFreq,
      introOffer: form.introOffer,
      contractRequired: form.contractRequired,
      revenueCategory: form.revenueCategory,
      frequencyOfUse: form.frequencyOfUse,
      membershipLink: form.membershipLink,
    };
    onSave(pkg, addAnother);
    if (addAnother) {
      setForm({
        name:"", type:"Classes", category:"Yoga & Pilates",
        price:"", sellOnline:false,
        duration:"12", durationUnit:"Months", trigger:"From date of sale",
        sessionFreq:"Single Session", introOffer:"No", contractRequired:"No",
        revenueCategory:"Sales: Services", frequencyOfUse:"Unrestricted",
        membershipLink:"None", advancedSettings:"Standard", active:true,
      });
      setErrors({});
    }
  };

  const inputStyle = (err) => ({
    width:"100%", border:`1.5px solid ${err ? C.red : C.border}`,
    borderRadius:8, padding:"10px 14px", fontSize:13,
    fontFamily:"inherit", color:C.dark, outline:"none",
    background:"#fff", boxSizing:"border-box",
    transition:"border-color .2s",
  });

  const labelStyle = {
    display:"block", fontSize:11, fontWeight:700,
    letterSpacing:".08em", textTransform:"uppercase",
    color:C.tm, marginBottom:6,
  };

  const selectStyle = { ...inputStyle(false), cursor:"pointer", appearance:"auto" };

  const SectionCard = ({ children, style={} }) => (
    <div style={{
      background:"#fff", borderRadius:12,
      border:`1px solid ${C.border}`,
      padding:"20px 24px", ...style,
    }}>{children}</div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'DM Sans',sans-serif" }}>

      <div style={{ padding:"24px 32px", maxWidth:900, margin:"0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize:12, color:C.tl, marginBottom:14,
          display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ cursor:"pointer", color:C.acc }}
            onClick={onDiscard}>DASHBOARD</span>
          <span>/</span>
          <span style={{ cursor:"pointer", color:C.acc }}
            onClick={onDiscard}>PACKAGES</span>
          <span>/</span>
          <span style={{ fontWeight:600, color:C.dark }}>NEW ENTRY</span>
        </div>

        {/* Page title */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.dark,
            marginBottom:4 }}>Add New Package</h1>
          <p style={{ fontSize:13, color:C.tl }}>
            Performance Period: April 2026</p>
        </div>

        {/* PRICING OPTION NAME */}
        <SectionCard style={{ marginBottom:16 }}>
          <label style={labelStyle}>Pricing Option Name</label>
          <input value={form.name} onChange={set("name")}
            placeholder="e.g., Summer Wellness Pass"
            style={inputStyle(errors.name)}/>
          {errors.name && (
            <p style={{ color:C.red, fontSize:11, marginTop:4 }}>
              {errors.name}</p>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:16, marginTop:16 }}>
            <div>
              <label style={labelStyle}>Type of Service</label>
              <select value={form.type} onChange={set("type")}
                style={selectStyle}>
                {SERVICE_TYPES.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Service Category</label>
              <select value={form.category} onChange={set("category")}
                style={selectStyle}>
                {SERVICE_CATEGORIES.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop:16, display:"flex",
            alignItems:"flex-end", gap:16 }}>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Price</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:12, top:"50%",
                  transform:"translateY(-50%)", color:C.tm,
                  fontSize:14 }}>$</span>
                <input value={form.price} onChange={set("price")}
                  type="number" placeholder="0.00"
                  style={{ ...inputStyle(errors.price), paddingLeft:28 }}/>
              </div>
              {errors.price && (
                <p style={{ color:C.red, fontSize:11, marginTop:4 }}>
                  {errors.price}</p>
              )}
            </div>
            <label style={{ display:"flex", alignItems:"center",
              gap:8, cursor:"pointer", fontSize:13, color:C.dark,
              paddingBottom:10 }}>
              <input type="checkbox" checked={form.sellOnline}
                onChange={set("sellOnline")}
                style={{ width:15, height:15, accentColor:C.acc }}/>
              Available for online purchase
            </label>
          </div>
        </SectionCard>

        {/* EXPIRATION RULES + SESSION FREQUENCY */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:16, marginBottom:16 }}>

          {/* Expiration Rules */}
          <SectionCard>
            <label style={{ ...labelStyle, marginBottom:14 }}>
              Expiration Rules</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
              gap:12, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>Duration</label>
                <input value={form.duration} onChange={set("duration")}
                  type="number" min="1"
                  style={inputStyle(false)}/>
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <select value={form.durationUnit}
                  onChange={set("durationUnit")}
                  style={selectStyle}>
                  {DURATION_UNITS.map(u => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Trigger</label>
              <select value={form.trigger} onChange={set("trigger")}
                style={selectStyle}>
                {TRIGGER_OPTIONS.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </SectionCard>

          {/* Session Frequency */}
          <SectionCard>
            <label style={{ ...labelStyle, marginBottom:16 }}>
              Session Frequency</label>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {["Single Session","Multiple Sessions","Unlimited"].map(opt => (
                <div key={opt} style={{
                  border:`1.5px solid ${form.sessionFreq===opt
                    ? C.acc : C.border}`,
                  borderRadius:8, padding:"10px 14px",
                  cursor:"pointer",
                  background: form.sessionFreq===opt ? "#F0FDF4" : "#fff",
                  transition:"all .15s",
                }} onClick={() => setV("sessionFreq", opt)}>
                  <Radio checked={form.sessionFreq===opt}
                    onChange={() => setV("sessionFreq", opt)}
                    label={opt}/>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* SETTINGS GRID */}
        <SectionCard style={{ marginBottom:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:24 }}>

            {/* Introductory Offer */}
            <div>
              <label style={labelStyle}>Introductory Offer</label>
              <div style={{ display:"flex", gap:20 }}>
                {["No","Yes"].map(v => (
                  <Radio key={v} checked={form.introOffer===v}
                    onChange={() => setV("introOffer", v)} label={v}/>
                ))}
              </div>
            </div>

            {/* Contract Required */}
            <div>
              <label style={labelStyle}>Contract Required</label>
              <div style={{ display:"flex", gap:20 }}>
                {["No","Yes"].map(v => (
                  <Radio key={v} checked={form.contractRequired===v}
                    onChange={() => setV("contractRequired", v)} label={v}/>
                ))}
              </div>
            </div>

            {/* Revenue Category */}
            <div>
              <label style={labelStyle}>Revenue Category</label>
              <select value={form.revenueCategory}
                onChange={set("revenueCategory")} style={selectStyle}>
                {REVENUE_CATEGORIES.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Frequency of Use */}
            <div>
              <label style={labelStyle}>Frequency of Use</label>
              <select value={form.frequencyOfUse}
                onChange={set("frequencyOfUse")} style={selectStyle}>
                {FREQUENCY_OPTIONS.map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Membership Link */}
            <div>
              <label style={labelStyle}>Membership Link</label>
              <select value={form.membershipLink}
                onChange={set("membershipLink")} style={selectStyle}>
                {MEMBERSHIP_LINKS.map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Advanced Settings */}
            <div>
              <label style={labelStyle}>Advanced Settings</label>
              <div style={{ display:"flex", gap:20 }}>
                {["Standard","Custom"].map(v => (
                  <Radio key={v}
                    checked={form.advancedSettings===v}
                    onChange={() => setV("advancedSettings", v)}
                    label={v}/>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Footer actions */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center" }}>
          <button onClick={onDiscard} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:13, fontWeight:600, color:C.tm,
            fontFamily:"inherit", letterSpacing:".05em",
            textTransform:"uppercase",
          }}>Discard Changes</button>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => handleSave(true)} style={{
              background:"#F0FDF4", border:`1px solid ${C.acc2}`,
              borderRadius:9, padding:"11px 22px", cursor:"pointer",
              fontSize:13, fontWeight:600, color:C.acc,
              fontFamily:"inherit",
            }}>Save & Add Another</button>
            <button onClick={() => handleSave(false)} style={{
              background:C.acc, border:"none",
              borderRadius:9, padding:"11px 28px", cursor:"pointer",
              fontSize:13, fontWeight:700, color:"#fff",
              fontFamily:"inherit",
            }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PACKAGES DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function PackageDashboard({ packages, setPackages, onAddNew, navigate, user, activeNav, setActiveNav }) {

  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [activeFilters, setFilters] = useState({
    type:"All", channel:"Digital", membership:"Premium", status:"Active",
  });
  const PER_PAGE = 10;

  const totalRevenue = packages.reduce((s, p) => s + p.price, 0);
  const liquidCash   = packages.filter(p => p.type!=="Memberships")
    .reduce((s,p) => s + p.price, 0);
  const creditCard   = packages.filter(p => p.type==="Memberships")
    .reduce((s,p) => s + p.price, 0);

  const STATS_DATA = [
    { label:"TOTAL VOLUME",        value:`$${(totalRevenue/1000).toFixed(1)}M`,
      sub:"+12.4% vs last period", subColor:C.acc2 },
    { label:"TOTAL PACKAGE SALES", value:packages.length,
      sub:"Focused in Q3 target list", subColor:C.tm },
    { label:"LIQUID CASH",         value:`$${liquidCash.toLocaleString()}`,
      sub:"", subColor:C.tm },
    { label:"CREDIT CARD",         value:`$${creditCard.toLocaleString()}`,
      sub:"", subColor:C.tm },
  ];

  const handleToggleActive = (id) => {
    const updated = packages.map(p =>
      p.id===id ? { ...p, active:!p.active } : p
    );
    setPackages(updated);
    savePackages(updated);
  };

  const handleToggleOnline = (id) => {
    const updated = packages.map(p =>
      p.id===id ? { ...p, sellOnline:!p.sellOnline } : p
    );
    setPackages(updated);
    savePackages(updated);
  };

  const handleDelete = (id) => {
    const updated = packages.filter(p => p.id !== id);
    setPackages(updated);
    savePackages(updated);
  };

  const handleNavClick = (label) => {
    setActiveNav(label);
    if (label === "Dashboard") navigate("/dashboard");
    if (label === "Trainers")  navigate("/trainers");
  };

  const filtered = packages.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const TypeBadge = ({ type }) => {
    const style = TYPE_COLORS[type] || { bg:"#F1F5F9", color:C.tm };
    return (
      <span style={{
        background:style.bg, color:style.color,
        fontSize:10, fontWeight:700, padding:"3px 8px",
        borderRadius:5, letterSpacing:".05em",
        textTransform:"uppercase",
      }}>{type}</span>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'DM Sans',sans-serif" }}>

      {/* TOP NAV */}
      <nav style={{
        background:C.nav, height:54, display:"flex",
        alignItems:"center", padding:"0 24px",
        position:"sticky", top:0, zIndex:200,
        boxShadow:"0 2px 8px rgba(0,0,0,.2)",
      }}>
        <div style={{ display:"flex", alignItems:"center",
          gap:8, marginRight:20 }}>
          <svg width="28" height="28" viewBox="0 0 32 32">
            <polygon points="16,2 30,16 16,30 2,16" fill={C.acc}/>
            <polygon points="16,8 24,16 16,24 8,16" fill={C.acc2}/>
          </svg>
          <span style={{ color:"#fff", fontWeight:700, fontSize:17,
            fontFamily:"Georgia,serif" }}>FitManage</span>
        </div>
        <div style={{
          background:"rgba(255,255,255,.1)",
          border:"1px solid rgba(255,255,255,.15)",
          borderRadius:8, padding:"5px 14px",
          display:"flex", alignItems:"center",
          gap:8, cursor:"pointer", marginRight:"auto",
        }}>
          <span style={{ color:"#CBD5E1", fontSize:13 }}>
            YKBI Health & Fitness</span>
          <span style={{ color:C.tl, fontSize:11 }}>▾</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <span style={{ fontSize:20, cursor:"pointer", opacity:.7 }}>⚙️</span>
          <span style={{ fontSize:20, cursor:"pointer", opacity:.7 }}>🔍</span>
          <div style={{ position:"relative", cursor:"pointer" }}>
            <span style={{ fontSize:20 }}>🔔</span>
            <div style={{
              position:"absolute", top:-4, right:-4, width:16, height:16,
              background:C.red, borderRadius:"50%", fontSize:9,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontWeight:700, border:"2px solid "+C.nav,
            }}>3</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8,
            cursor:"pointer" }}
            onClick={() => {
              localStorage.removeItem("fm_token");
              localStorage.removeItem("fm_user");
              navigate("/login");
            }}>
            <div style={{ width:32, height:32, borderRadius:"50%",
              background:C.acc, display:"flex", alignItems:"center",
              justifyContent:"center", color:"#fff",
              fontSize:13, fontWeight:700 }}>
              {user?.fullName?.[0]||"U"}</div>
            <span style={{ color:"#E2E8F0", fontSize:13, fontWeight:600 }}>
              {user?.fullName?.split(" ")[0]||"HABIB"}</span>
            <span style={{ color:C.tl, fontSize:10 }}>▾</span>
          </div>
        </div>
      </nav>

      {/* SUB-NAV */}
      <div style={{
        background:C.card, borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", padding:"0 24px",
        position:"sticky", top:54, zIndex:199,
      }}>
        {NAV_ITEMS.map(({ label, icon }) => {
          const active = label === activeNav;
          return (
            <button key={label} onClick={() => handleNavClick(label)} style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"13px 16px", fontSize:13,
              fontWeight: active ? 700 : 500,
              color: active ? C.acc : C.tm,
              borderBottom: active
                ? `2.5px solid ${C.acc}` : "2.5px solid transparent",
              fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <span>{icon}</span> {label}
            </button>
          );
        })}
      </div>

      {/* BODY */}
      <div style={{ padding:"24px 28px", maxWidth:1280, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.dark,
              marginBottom:4 }}>Packages</h1>
            <p style={{ fontSize:13, color:C.tl }}>
              Performance Period: April 2026</p>
          </div>
          <button onClick={onAddNew} style={{
            background:C.acc, border:"none", borderRadius:9,
            padding:"11px 20px", cursor:"pointer",
            fontSize:13, fontWeight:700, color:"#fff",
            fontFamily:"inherit", display:"flex",
            alignItems:"center", gap:7,
          }}>+ Add New Package</button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          gap:14, marginBottom:22 }}>
          {STATS_DATA.map(s => (
            <Card key={s.label} style={{ padding:"18px 20px" }}>
              <p style={{ fontSize:10, fontWeight:700,
                letterSpacing:".1em", textTransform:"uppercase",
                color:C.tl, marginBottom:6 }}>{s.label}</p>
              <div style={{ fontSize:28, fontWeight:800, color:C.dark,
                fontFamily:"Georgia,serif", lineHeight:1 }}>{s.value}</div>
              {s.sub && (
                <div style={{ fontSize:11, color:s.subColor,
                  marginTop:5, fontWeight:500 }}>
                  ↑ {s.sub}</div>
              )}
            </Card>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display:"flex", alignItems:"center",
          gap:10, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center",
            gap:6, padding:"7px 12px", background:"#fff",
            border:`1px solid ${C.border}`, borderRadius:8,
            fontSize:12, color:C.tm, cursor:"pointer" }}>
            <span>⚙</span> FILTERS
          </div>
          {[
            { label:"Service Types: All" },
            { label:"Sales Channels: Digital" },
            { label:"Memberships: Premium" },
            { label:"Status: Active" },
          ].map(f => (
            <div key={f.label} style={{
              padding:"6px 12px", background:"#F0FDF4",
              border:`1px solid ${C.acc2}`, borderRadius:20,
              fontSize:12, color:C.acc, fontWeight:600,
              cursor:"pointer", display:"flex",
              alignItems:"center", gap:6,
            }}>
              {f.label}
              <span style={{ fontSize:14, color:C.acc2 }}>×</span>
            </div>
          ))}
          <button style={{ marginLeft:"auto", background:"none",
            border:"none", cursor:"pointer", fontSize:12,
            fontWeight:700, color:C.red,
            fontFamily:"inherit", letterSpacing:".06em" }}>
            CLEAR ALL</button>
        </div>

        {/* Table */}
        <Card style={{ overflow:"hidden", marginBottom:16 }}>
          {/* Table header */}
          <div style={{ display:"grid",
            gridTemplateColumns:"2fr 80px 130px 150px 120px 70px 90px 60px",
            padding:"12px 20px",
            borderBottom:`2px solid ${C.border}`,
            background:"#FAFBFC" }}>
            {["SERVICE NAME","SESSIONS","SERVICE TYPE",
              "CATEGORY","PRICE","ACTIVE","SELL ONLINE","ACTIONS"].map(h => (
              <div key={h} style={{ fontSize:10, fontWeight:700,
                letterSpacing:".08em", color:C.tl,
                textTransform:"uppercase" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div style={{ padding:"40px", textAlign:"center",
              color:C.tl, fontSize:14 }}>
              No packages found. <button onClick={onAddNew}
                style={{ color:C.acc, background:"none", border:"none",
                  cursor:"pointer", fontWeight:600,
                  fontFamily:"inherit" }}>Add one now →</button>
            </div>
          ) : paginated.map((pkg, i) => (
            <div key={pkg.id} style={{
              display:"grid",
              gridTemplateColumns:"2fr 80px 130px 150px 120px 70px 90px 60px",
              padding:"14px 20px",
              borderBottom: i<paginated.length-1
                ? `1px solid ${C.border}` : "none",
              background: i%2===0 ? "#fff" : "#FAFBFC",
              alignItems:"center",
              transition:"background .1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#F0FDF4"}
              onMouseLeave={e => e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFC"}>

              {/* Name */}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:6, height:6, borderRadius:"50%",
                  background:C.acc, flexShrink:0 }}/>
                <span style={{ fontSize:13, fontWeight:500,
                  color:C.dark }}>{pkg.name}</span>
              </div>

              {/* Sessions */}
              <div style={{ fontSize:13, color:C.tm }}>{pkg.sessions}</div>

              {/* Type badge */}
              <div><TypeBadge type={pkg.type}/></div>

              {/* Category */}
              <div style={{ fontSize:13, color:C.tm }}>{pkg.category}</div>

              {/* Price */}
              <div style={{ fontSize:13, fontWeight:600,
                color:C.dark }}>
                USD {pkg.price.toLocaleString("en-US",{
                  minimumFractionDigits:2 })}</div>

              {/* Active toggle */}
              <div>
                <Toggle on={pkg.active}
                  onChange={() => handleToggleActive(pkg.id)}/>
              </div>

              {/* Sell Online toggle */}
              <div>
                <Toggle on={pkg.sellOnline}
                  onChange={() => handleToggleOnline(pkg.id)}/>
              </div>

              {/* Actions */}
              <div style={{ position:"relative" }}>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${pkg.name}"?`)) {
                      handleDelete(pkg.id);
                    }
                  }}
                  style={{ background:"none", border:"none",
                    cursor:"pointer", fontSize:18, color:C.tl,
                    padding:"4px 8px", borderRadius:6,
                  }}>⋮</button>
              </div>
            </div>
          ))}
        </Card>

        {/* Pagination */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.tl }}>
            Showing {Math.min((page-1)*PER_PAGE+1, filtered.length)}
            {" "}to{" "}{Math.min(page*PER_PAGE, filtered.length)}
            {" "}of {filtered.length} options
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))}
              disabled={page===1} style={{
                width:32, height:32, borderRadius:8,
                border:`1px solid ${C.border}`,
                background:"#fff", cursor: page===1 ? "default" : "pointer",
                fontSize:14, color: page===1 ? C.tl : C.dark,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>‹</button>
            {Array.from({ length:totalPages }, (_,i) => i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width:32, height:32, borderRadius:8,
                border:`1px solid ${page===p ? C.acc : C.border}`,
                background: page===p ? C.acc : "#fff",
                color: page===p ? "#fff" : C.dark,
                cursor:"pointer", fontSize:13, fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))}
              disabled={page===totalPages} style={{
                width:32, height:32, borderRadius:8,
                border:`1px solid ${C.border}`,
                background:"#fff",
                cursor: page===totalPages ? "default" : "pointer",
                fontSize:14, color: page===totalPages ? C.tl : C.dark,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>›</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign:"center", padding:"16px 0",
        fontSize:12, color:C.tl }}>
        © 2026 FitManager Copyright and rights reserved
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PACKAGES PAGE — switches between Add form and Dashboard
// ══════════════════════════════════════════════════════════════════════════════
export default function PackagesPage() {
  const navigate    = useNavigate();
  const [user, setUser]         = useState(null);
  const [view, setView]         = useState("dashboard"); // "dashboard" | "add"
  const [packages, setPackages] = useState(() => loadPackages());
  const [activeNav, setActiveNav] = useState("Packages");

  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
    // Always load from storage on mount
    setPackages(loadPackages());
  }, []);

  const handleSavePackage = (pkg, addAnother) => {
    setPackages(prev => {
      const updated = [...prev, pkg];
      savePackages(updated);      // ✅ persists to localStorage
      return updated;
    });
    if (!addAnother) {
      setView("dashboard");       // ✅ go to dashboard after save
    }
  };

  const handleDiscard = () => setView("dashboard");

  if (view === "add") {
    return (
      <div>
        {/* Mini nav for Add form */}
        <nav style={{
          background:C.nav, height:54, display:"flex",
          alignItems:"center", padding:"0 24px",
          position:"sticky", top:0, zIndex:200,
          boxShadow:"0 2px 8px rgba(0,0,0,.2)",
        }}>
          <div style={{ display:"flex", alignItems:"center",
            gap:8, marginRight:20 }}>
            <svg width="28" height="28" viewBox="0 0 32 32">
              <polygon points="16,2 30,16 16,30 2,16" fill={C.acc}/>
              <polygon points="16,8 24,16 16,24 8,16" fill={C.acc2}/>
            </svg>
            <span style={{ color:"#fff", fontWeight:700, fontSize:17,
              fontFamily:"Georgia,serif" }}>FitManage</span>
          </div>
          <div style={{
            background:"rgba(255,255,255,.1)",
            border:"1px solid rgba(255,255,255,.15)",
            borderRadius:8, padding:"5px 14px",
            display:"flex", alignItems:"center",
            gap:8, cursor:"pointer", marginRight:"auto",
          }}>
            <span style={{ color:"#CBD5E1", fontSize:13 }}>
              YKBI Health & Fitness</span>
          </div>
          <span style={{ color:"#E2E8F0", fontSize:13, cursor:"pointer" }}
            onClick={() => setView("dashboard")}>← Back to Packages</span>
        </nav>
        <div style={{
          background:C.card, borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", padding:"0 24px",
          position:"sticky", top:54, zIndex:199,
        }}>
          {NAV_ITEMS.map(({ label, icon }) => (
            <button key={label} onClick={() => {
              if (label==="Dashboard") navigate("/dashboard");
              else if (label==="Packages") setView("dashboard");
              else if (label==="Trainers") navigate("/trainers");
            }} style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"13px 16px", fontSize:13,
              fontWeight: label==="Packages" ? 700 : 500,
              color: label==="Packages" ? C.acc : C.tm,
              borderBottom: label==="Packages"
                ? `2.5px solid ${C.acc}` : "2.5px solid transparent",
              fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
        <AddPackageForm
          onSave={handleSavePackage}
          onDiscard={handleDiscard}/>
      </div>
    );
  }

  return (
    <PackageDashboard
      packages={packages}
      setPackages={setPackages}
      onAddNew={() => setView("add")}
      navigate={navigate}
      user={user}
      activeNav={activeNav}
      setActiveNav={setActiveNav}/>
  );
}
