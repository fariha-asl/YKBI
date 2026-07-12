// frontend/src/pages/PackagesPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Palette ───────────────────────────────────────────────────────────────────
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

const SERVICE_TYPES      = ["Classes","Appointments","Packages","Memberships"];
const SERVICE_CATEGORIES = ["Yoga & Pilates","Personal Training","Group Fitness","Bodybuilding","CrossFit","Swimming","Boxing","Nutrition"];
const REVENUE_CATEGORIES = ["Sales: Services","Sales: Products","Sales: Memberships","Sales: Other"];
const FREQUENCY_OPTIONS  = ["Unrestricted","Once per day","Once per week","Once per month"];
const MEMBERSHIP_LINKS   = ["None","Basic","Premium","VIP"];
const TRIGGER_OPTIONS    = ["From date of sale","From first use","From specific date"];
const DURATION_UNITS     = ["Days","Weeks","Months","Years"];

const TYPE_COLORS = {
  Classes:      { bg:"#DCFCE7", color:"#166534" },
  Appointments: { bg:"#DBEAFE", color:"#1e40af" },
  Packages:     { bg:"#FEF9C3", color:"#854d0e" },
  Memberships:  { bg:"#F3E8FF", color:"#6b21a8" },
};

// ── Storage ───────────────────────────────────────────────────────────────────
const PKG_KEY = "fm_packages";

const DEMO_PACKAGES = [
  { id:1,  name:"1 Foundation",              sessions:1,  type:"Classes",      category:"Pilates",           price:2875, active:true,  sellOnline:true  },
  { id:2,  name:"DT-1 Day a Week for 1 Month",sessions:12,type:"Appointments", category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:3,  name:"DT-3 Days a Week 2 Months", sessions:5,  type:"Packages",     category:"Yoga",              price:450,  active:true,  sellOnline:false },
  { id:4,  name:"DT-1 Day a Week for 1 Month",sessions:12,type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:5,  name:"DT-1 Day a Week for 1 Month",sessions:12,type:"Appointments", category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:6,  name:"DT-1 Day a Week for 1 Month",sessions:12,type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:7,  name:"DT-1 Day a Week for 1 Month",sessions:12,type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:8,  name:"DT-1 Day a Week for 1 Month",sessions:12,type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:9,  name:"DT-1 Day a Week for 1 Month",sessions:12,type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
  { id:10, name:"DT-1 Day a Week for 1 Month",sessions:12,type:"Memberships",  category:"Personal Training", price:4200, active:true,  sellOnline:true  },
];

const loadPackages = () => {
  try {
    const s = localStorage.getItem(PKG_KEY);
    if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length) return p; }
  } catch(e) {}
  localStorage.setItem(PKG_KEY, JSON.stringify(DEMO_PACKAGES));
  return DEMO_PACKAGES;
};
const savePackages = (d) => { try { localStorage.setItem(PKG_KEY, JSON.stringify(d)); } catch(e) {} };

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, borderRadius:14,
    border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(0,0,0,.04)", ...style }}>
    {children}
  </div>
);

const Toggle = ({ on, onChange }) => (
  <div onClick={() => onChange(!on)} style={{
    width:40, height:22, borderRadius:11,
    background: on ? C.acc : "#CBD5E1",
    cursor:"pointer", position:"relative",
    transition:"background .2s", flexShrink:0,
  }}>
    <div style={{
      width:18, height:18, borderRadius:"50%",
      background:"#fff", position:"absolute",
      top:2, left: on ? 20 : 2,
      transition:"left .2s",
      boxShadow:"0 1px 4px rgba(0,0,0,.25)",
    }}/>
  </div>
);

// ── Top Nav (shared) ──────────────────────────────────────────────────────────
function TopNav({ user, activeNav, onNavClick, onLogout }) {
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
          <span style={{ fontSize:18, cursor:"pointer", opacity:.7 }}>⚙️</span>
          <span style={{ fontSize:18, cursor:"pointer", opacity:.7 }}>🔍</span>
          <div style={{ position:"relative", cursor:"pointer" }}>
            <span style={{ fontSize:18 }}>🔔</span>
            <div style={{
              position:"absolute", top:-4, right:-4, width:16, height:16,
              background:C.red, borderRadius:"50%", fontSize:9,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontWeight:700, border:"2px solid "+C.nav,
            }}>3</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
            onClick={onLogout}>
            <div style={{
              width:32, height:32, borderRadius:"50%", background:C.acc,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:13, fontWeight:700,
            }}>{user?.fullName?.[0] || "U"}</div>
            <span style={{ color:"#E2E8F0", fontSize:13, fontWeight:600 }}>
              {user?.fullName?.split(" ")[0] || "HABIB"}</span>
            <span style={{ color:C.tl, fontSize:10 }}>▾</span>
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
// ADD PACKAGE FORM
// ══════════════════════════════════════════════════════════════════════════════
function AddPackageForm({ onSave, onDiscard, user, onNavClick, onLogout }) {

  // ── All form state in ONE object — updated with spread, never recreated ──
  const [form, setForm] = useState({
    name:"", type:"Classes", category:"Yoga & Pilates",
    price:"", sellOnline:false,
    duration:"12", durationUnit:"Months",
    trigger:"From date of sale",
    sessionFreq:"Single Session",
    introOffer:"No", contractRequired:"No",
    revenueCategory:"Sales: Services",
    frequencyOfUse:"Unrestricted",
    membershipLink:"None",
    advancedSettings:"Standard",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ── Stable field updater — useCallback prevents re-creation on render ──
  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Package name is required";
    if (!form.price)        e.price = "Price is required";
    else if (isNaN(parseFloat(form.price))) e.price = "Enter a valid price";
    return e;
  };

  const handleSave = (addAnother = false) => {
    const e = validate();
    setTouched({ name:true, price:true });
    if (Object.keys(e).length) { setErrors(e); return; }

    const pkg = {
      id: Date.now(),
      name:              form.name.trim(),
      sessions:          parseInt(form.duration) || 1,
      type:              form.type,
      category:          form.category,
      price:             parseFloat(form.price) || 0,
      active:            true,
      sellOnline:        form.sellOnline,
      sessionFreq:       form.sessionFreq,
      introOffer:        form.introOffer,
      contractRequired:  form.contractRequired,
      revenueCategory:   form.revenueCategory,
      frequencyOfUse:    form.frequencyOfUse,
      membershipLink:    form.membershipLink,
      advancedSettings:  form.advancedSettings,
    };

    onSave(pkg, addAnother);

    if (addAnother) {
      setForm({
        name:"", type:"Classes", category:"Yoga & Pilates",
        price:"", sellOnline:false,
        duration:"12", durationUnit:"Months",
        trigger:"From date of sale", sessionFreq:"Single Session",
        introOffer:"No", contractRequired:"No",
        revenueCategory:"Sales: Services", frequencyOfUse:"Unrestricted",
        membershipLink:"None", advancedSettings:"Standard",
      });
      setErrors({});
      setTouched({});
    }
  };

  // ── Style helpers ─────────────────────────────────────────────────────────
  const inputCls = (field) => ({
    width:"100%", padding:"11px 14px", fontSize:14,
    fontFamily:"inherit", color:C.dark,
    border:`1.5px solid ${touched[field] && errors[field] ? C.red : C.border}`,
    borderRadius:9, outline:"none", background:"#fff",
    boxSizing:"border-box",
    transition:"border-color .2s, box-shadow .2s",
  });

  const selectCls = {
    width:"100%", padding:"11px 14px", fontSize:14,
    fontFamily:"inherit", color:C.dark,
    border:`1.5px solid ${C.border}`,
    borderRadius:9, outline:"none", background:"#fff",
    boxSizing:"border-box", cursor:"pointer",
    transition:"border-color .2s",
  };

  const labelCls = {
    display:"block", fontSize:11, fontWeight:700,
    letterSpacing:".08em", textTransform:"uppercase",
    color:C.tm, marginBottom:7,
  };

  const Section = ({ children, style={} }) => (
    <div style={{
      background:"#fff", borderRadius:12,
      border:`1px solid ${C.border}`,
      padding:"22px 24px", marginBottom:16, ...style,
    }}>{children}</div>
  );

  const RadioOpt = ({ field, value, label }) => {
    const checked = form[field] === value;
    return (
      <label style={{
        display:"flex", alignItems:"center", gap:9,
        cursor:"pointer", fontSize:13, color:C.dark,
        userSelect:"none",
      }}>
        <div
          onClick={() => handleChange(field, value)}
          style={{
            width:18, height:18, borderRadius:"50%",
            border:`2px solid ${checked ? C.acc : C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"#fff", cursor:"pointer",
            transition:"border-color .15s", flexShrink:0,
          }}>
          {checked && (
            <div style={{ width:9, height:9, borderRadius:"50%",
              background:C.acc }}/>
          )}
        </div>
        {label}
      </label>
    );
  };

  const FreqOption = ({ value }) => {
    const checked = form.sessionFreq === value;
    return (
      <div onClick={() => handleChange("sessionFreq", value)} style={{
        border:`1.5px solid ${checked ? C.acc : C.border}`,
        borderRadius:9, padding:"11px 14px", cursor:"pointer",
        background: checked ? "#F0FDF4" : "#fff",
        display:"flex", alignItems:"center", gap:10,
        transition:"all .15s",
      }}>
        <div style={{
          width:18, height:18, borderRadius:"50%",
          border:`2px solid ${checked ? C.acc : C.border}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"#fff", flexShrink:0,
        }}>
          {checked && <div style={{ width:9, height:9, borderRadius:"50%",
            background:C.acc }}/>}
        </div>
        <span style={{ fontSize:13, color:C.dark, fontWeight: checked ? 600 : 400 }}>
          {value}
        </span>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'DM Sans',sans-serif" }}>
      <TopNav user={user} activeNav="Packages"
        onNavClick={onNavClick} onLogout={onLogout}/>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"28px 28px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
          color:C.tl, marginBottom:16,
          display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ cursor:"pointer", color:C.acc }}
            onClick={() => onNavClick("Dashboard")}>DASHBOARD</span>
          <span>/</span>
          <span style={{ cursor:"pointer", color:C.acc }}
            onClick={onDiscard}>PACKAGES</span>
          <span>/</span>
          <span style={{ color:C.dark }}>NEW ENTRY</span>
        </div>

        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.dark, marginBottom:4 }}>
            Add New Package</h1>
          <p style={{ fontSize:13, color:C.tl }}>Performance Period: April 2026</p>
        </div>

        {/* ── 1. Package Name ── */}
        <Section>
          <label style={labelCls}>Pricing Option Name</label>
          <input
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
            onFocus={e => { e.target.style.borderColor = C.acc; e.target.style.boxShadow = `0 0 0 3px #D1FAE5`; }}
            onBlur={e  => { handleBlur("name"); e.target.style.borderColor = touched.name && errors.name ? C.red : C.border; e.target.style.boxShadow = "none"; }}
            placeholder="e.g., Summer Wellness Pass"
            style={inputCls("name")}
            autoComplete="off"
          />
          {touched.name && errors.name && (
            <p style={{ color:C.red, fontSize:11, marginTop:5 }}>⚠ {errors.name}</p>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:16, marginTop:18 }}>
            <div>
              <label style={labelCls}>Type of Service</label>
              <select
                value={form.type}
                onChange={e => handleChange("type", e.target.value)}
                style={selectCls}>
                {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelCls}>Service Category</label>
              <select
                value={form.category}
                onChange={e => handleChange("category", e.target.value)}
                style={selectCls}>
                {SERVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"flex-end",
            gap:20, marginTop:18 }}>
            <div style={{ flex:"0 0 200px" }}>
              <label style={labelCls}>Price</label>
              <div style={{ position:"relative" }}>
                <span style={{
                  position:"absolute", left:13, top:"50%",
                  transform:"translateY(-50%)",
                  color:C.tm, fontSize:14, pointerEvents:"none",
                }}>$</span>
                <input
                  value={form.price}
                  onChange={e => handleChange("price", e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.acc; e.target.style.boxShadow = `0 0 0 3px #D1FAE5`; }}
                  onBlur={e  => { handleBlur("price"); e.target.style.borderColor = touched.price && errors.price ? C.red : C.border; e.target.style.boxShadow = "none"; }}
                  type="number" min="0" step="0.01" placeholder="0.00"
                  style={{ ...inputCls("price"), paddingLeft:30 }}
                  autoComplete="off"
                />
              </div>
              {touched.price && errors.price && (
                <p style={{ color:C.red, fontSize:11, marginTop:5 }}>⚠ {errors.price}</p>
              )}
            </div>
            <label style={{
              display:"flex", alignItems:"center", gap:9,
              cursor:"pointer", fontSize:13, color:C.dark,
              paddingBottom:4, userSelect:"none",
            }}>
              <input
                type="checkbox"
                checked={form.sellOnline}
                onChange={e => handleChange("sellOnline", e.target.checked)}
                style={{ width:16, height:16, accentColor:C.acc, cursor:"pointer" }}
              />
              Available for online purchase
            </label>
          </div>
        </Section>

        {/* ── 2. Expiration + Session Frequency ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:16, marginBottom:16 }}>

          <Section style={{ marginBottom:0 }}>
            <label style={{ ...labelCls, marginBottom:16 }}>Expiration Rules</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
              gap:12, marginBottom:14 }}>
              <div>
                <label style={labelCls}>Duration</label>
                <input
                  value={form.duration}
                  onChange={e => handleChange("duration", e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.acc}
                  onBlur={e  => e.target.style.borderColor = C.border}
                  type="number" min="1"
                  style={inputCls("duration")}
                />
              </div>
              <div>
                <label style={labelCls}>Unit</label>
                <select
                  value={form.durationUnit}
                  onChange={e => handleChange("durationUnit", e.target.value)}
                  style={selectCls}>
                  {DURATION_UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelCls}>Trigger</label>
              <select
                value={form.trigger}
                onChange={e => handleChange("trigger", e.target.value)}
                style={selectCls}>
                {TRIGGER_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </Section>

          <Section style={{ marginBottom:0 }}>
            <label style={{ ...labelCls, marginBottom:16 }}>Session Frequency</label>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <FreqOption value="Single Session"/>
              <FreqOption value="Multiple Sessions"/>
              <FreqOption value="Unlimited"/>
            </div>
          </Section>
        </div>

        {/* ── 3. Settings ── */}
        <Section>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:24 }}>

            <div>
              <label style={labelCls}>Introductory Offer</label>
              <div style={{ display:"flex", gap:24, marginTop:4 }}>
                <RadioOpt field="introOffer" value="No"  label="No"/>
                <RadioOpt field="introOffer" value="Yes" label="Yes"/>
              </div>
            </div>

            <div>
              <label style={labelCls}>Contract Required</label>
              <div style={{ display:"flex", gap:24, marginTop:4 }}>
                <RadioOpt field="contractRequired" value="No"  label="No"/>
                <RadioOpt field="contractRequired" value="Yes" label="Yes"/>
              </div>
            </div>

            <div>
              <label style={labelCls}>Revenue Category</label>
              <select
                value={form.revenueCategory}
                onChange={e => handleChange("revenueCategory", e.target.value)}
                style={selectCls}>
                {REVENUE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelCls}>Frequency of Use</label>
              <select
                value={form.frequencyOfUse}
                onChange={e => handleChange("frequencyOfUse", e.target.value)}
                style={selectCls}>
                {FREQUENCY_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label style={labelCls}>Membership Link</label>
              <select
                value={form.membershipLink}
                onChange={e => handleChange("membershipLink", e.target.value)}
                style={selectCls}>
                {MEMBERSHIP_LINKS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={labelCls}>Advanced Settings</label>
              <div style={{ display:"flex", gap:24, marginTop:4 }}>
                <RadioOpt field="advancedSettings" value="Standard" label="Standard"/>
                <RadioOpt field="advancedSettings" value="Custom"   label="Custom"/>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Footer ── */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginTop:8 }}>
          <button onClick={onDiscard} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:12, fontWeight:700, color:C.tm,
            fontFamily:"inherit", letterSpacing:".08em",
            textTransform:"uppercase",
          }}>Discard Changes</button>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => handleSave(true)} style={{
              background:"#F0FDF4", border:`1.5px solid ${C.acc2}`,
              borderRadius:9, padding:"11px 24px", cursor:"pointer",
              fontSize:13, fontWeight:600, color:C.acc, fontFamily:"inherit",
              transition:"background .15s",
            }}>Save & Add Another</button>
            <button onClick={() => handleSave(false)} style={{
              background:C.acc, border:"none",
              borderRadius:9, padding:"11px 32px", cursor:"pointer",
              fontSize:13, fontWeight:700, color:"#fff", fontFamily:"inherit",
              transition:"background .15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#155C3E"}
              onMouseLeave={e => e.currentTarget.style.background = C.acc}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PACKAGES DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function PackageDashboard({ packages, setPackages, onAddNew, user, activeNav, onNavClick, onLogout }) {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const PER_PAGE = 10;

  const totalRevenue = packages.reduce((s,p) => s+p.price, 0);
  const liquidCash   = packages.filter(p=>p.type!=="Memberships").reduce((s,p)=>s+p.price, 0);
  const creditCard   = packages.filter(p=>p.type==="Memberships").reduce((s,p)=>s+p.price, 0);

  const STATS_DATA = [
    { label:"TOTAL VOLUME",        value:`$${(totalRevenue/1000).toFixed(1)}M`, sub:"+12.4% vs last period", subColor:C.acc2 },
    { label:"TOTAL PACKAGE SALES", value:packages.length, sub:"Focused in Q3 target list", subColor:C.tm },
    { label:"LIQUID CASH",         value:`$${liquidCash.toLocaleString()}`, sub:"", subColor:C.tm },
    { label:"CREDIT CARD",         value:`$${creditCard.toLocaleString()}`,  sub:"", subColor:C.tm },
  ];

  const updatePackages = useCallback((updated) => {
    setPackages(updated);
    savePackages(updated);
  }, [setPackages]);

  const handleToggleActive  = (id) => updatePackages(packages.map(p => p.id===id ? {...p,active:!p.active}       : p));
  const handleToggleOnline  = (id) => updatePackages(packages.map(p => p.id===id ? {...p,sellOnline:!p.sellOnline}: p));
  const handleDelete        = (id) => {
    if (window.confirm("Delete this package?"))
      updatePackages(packages.filter(p => p.id!==id));
  };

  const filtered   = packages.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const TypeBadge = ({ type }) => {
    const s = TYPE_COLORS[type] || { bg:"#F1F5F9", color:C.tm };
    return (
      <span style={{ background:s.bg, color:s.color, fontSize:10,
        fontWeight:700, padding:"3px 9px", borderRadius:5,
        letterSpacing:".04em", textTransform:"uppercase" }}>
        {type}
      </span>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'DM Sans',sans-serif" }}>
      <TopNav user={user} activeNav={activeNav}
        onNavClick={onNavClick} onLogout={onLogout}/>

      <div style={{ padding:"24px 28px", maxWidth:1280, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:22 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.dark, marginBottom:4 }}>Packages</h1>
            <p style={{ fontSize:13, color:C.tl }}>Performance Period: April 2026</p>
          </div>
          <button onClick={onAddNew} style={{
            background:C.acc, border:"none", borderRadius:9,
            padding:"11px 20px", cursor:"pointer",
            fontSize:13, fontWeight:700, color:"#fff", fontFamily:"inherit",
            display:"flex", alignItems:"center", gap:7,
            transition:"background .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background="#155C3E"}
            onMouseLeave={e => e.currentTarget.style.background=C.acc}>
            + Add New Package
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
          gap:14, marginBottom:22 }}>
          {STATS_DATA.map(s => (
            <Card key={s.label} style={{ padding:"18px 20px" }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:".1em",
                textTransform:"uppercase", color:C.tl, marginBottom:6 }}>{s.label}</p>
              <div style={{ fontSize:28, fontWeight:800, color:C.dark,
                fontFamily:"Georgia,serif", lineHeight:1 }}>{s.value}</div>
              {s.sub && (
                <div style={{ fontSize:11, color:s.subColor,
                  marginTop:5, fontWeight:500 }}>↑ {s.sub}</div>
              )}
            </Card>
          ))}
        </div>

        {/* Search + filter bar */}
        <div style={{ display:"flex", alignItems:"center",
          gap:10, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:12, top:"50%",
              transform:"translateY(-50%)", color:C.tl, fontSize:14 }}>🔍</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search packages..."
              style={{
                border:`1px solid ${C.border}`, borderRadius:8,
                padding:"8px 12px 8px 34px", fontSize:13,
                fontFamily:"inherit", color:C.dark, outline:"none",
                background:"#fff", width:200,
              }}
            />
          </div>
          {[
            "Service Types: All","Sales Channels: Digital",
            "Memberships: Premium","Status: Active",
          ].map(f => (
            <div key={f} style={{
              padding:"6px 12px", background:"#F0FDF4",
              border:`1px solid ${C.acc2}`, borderRadius:20,
              fontSize:12, color:C.acc, fontWeight:600, cursor:"pointer",
              display:"flex", alignItems:"center", gap:6,
            }}>
              {f} <span style={{ fontSize:14 }}>×</span>
            </div>
          ))}
          <button style={{
            marginLeft:"auto", background:"none", border:"none",
            cursor:"pointer", fontSize:11, fontWeight:700,
            color:C.red, fontFamily:"inherit", letterSpacing:".07em",
          }}>CLEAR ALL</button>
        </div>

        {/* Table */}
        <Card style={{ overflow:"hidden", marginBottom:16 }}>
          {/* Header row */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"2.5fr 70px 140px 160px 130px 70px 100px 50px",
            padding:"11px 20px",
            borderBottom:`2px solid ${C.border}`,
            background:"#F8FAFC",
          }}>
            {["SERVICE NAME","SESSIONS","SERVICE TYPE","CATEGORY",
              "PRICE","ACTIVE","SELL ONLINE","ACTIONS"].map(h => (
              <div key={h} style={{ fontSize:10, fontWeight:700,
                letterSpacing:".08em", color:C.tl,
                textTransform:"uppercase" }}>{h}</div>
            ))}
          </div>

          {/* Data rows */}
          {paginated.length === 0 ? (
            <div style={{ padding:"48px", textAlign:"center" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📦</div>
              <div style={{ fontSize:15, fontWeight:700, color:C.dark,
                marginBottom:6 }}>No packages found</div>
              <button onClick={onAddNew} style={{
                background:C.acc, border:"none", borderRadius:8,
                padding:"9px 20px", cursor:"pointer",
                fontSize:13, fontWeight:600, color:"#fff",
                fontFamily:"inherit",
              }}>+ Add New Package</button>
            </div>
          ) : paginated.map((pkg, i) => (
            <div key={pkg.id} style={{
              display:"grid",
              gridTemplateColumns:"2.5fr 70px 140px 160px 130px 70px 100px 50px",
              padding:"13px 20px",
              borderBottom: i<paginated.length-1 ? `1px solid ${C.border}` : "none",
              background:"#fff",
              alignItems:"center",
              transition:"background .12s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#F0FDF4"}
              onMouseLeave={e => e.currentTarget.style.background="#fff"}>

              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <div style={{ width:7, height:7, borderRadius:"50%",
                  background: pkg.active ? C.acc : C.tl, flexShrink:0 }}/>
                <span style={{ fontSize:13, color:C.dark, fontWeight:500,
                  overflow:"hidden", textOverflow:"ellipsis",
                  whiteSpace:"nowrap" }}>{pkg.name}</span>
              </div>

              <div style={{ fontSize:13, color:C.tm }}>{pkg.sessions}</div>

              <TypeBadge type={pkg.type}/>

              <div style={{ fontSize:13, color:C.tm,
                overflow:"hidden", textOverflow:"ellipsis",
                whiteSpace:"nowrap" }}>{pkg.category}</div>

              <div style={{ fontSize:13, fontWeight:600, color:C.dark }}>
                USD {pkg.price.toLocaleString("en-US",{minimumFractionDigits:2})}
              </div>

              <Toggle on={pkg.active}   onChange={() => handleToggleActive(pkg.id)}/>
              <Toggle on={pkg.sellOnline} onChange={() => handleToggleOnline(pkg.id)}/>

              <button onClick={() => handleDelete(pkg.id)} style={{
                background:"none", border:"none", cursor:"pointer",
                fontSize:18, color:C.tl, padding:"4px 8px",
                borderRadius:6, transition:"color .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.color=C.red}
                onMouseLeave={e => e.currentTarget.style.color=C.tl}>
                ⋮
              </button>
            </div>
          ))}
        </Card>

        {/* Pagination */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.tl }}>
            Showing {filtered.length === 0 ? 0 : (page-1)*PER_PAGE+1}
            {" "}to {Math.min(page*PER_PAGE, filtered.length)}
            {" "}of {filtered.length} options
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))}
              disabled={page===1} style={{
                width:32, height:32, borderRadius:8,
                border:`1px solid ${C.border}`, background:"#fff",
                cursor:page===1?"not-allowed":"pointer",
                fontSize:16, color:page===1?C.tl:C.dark,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>‹</button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width:32, height:32, borderRadius:8,
                border:`1px solid ${page===p?C.acc:C.border}`,
                background:page===p?C.acc:"#fff",
                color:page===p?"#fff":C.dark,
                cursor:"pointer", fontSize:13, fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all .15s",
              }}>{p}</button>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))}
              disabled={page>=totalPages} style={{
                width:32, height:32, borderRadius:8,
                border:`1px solid ${C.border}`, background:"#fff",
                cursor:page>=totalPages?"not-allowed":"pointer",
                fontSize:16, color:page>=totalPages?C.tl:C.dark,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>›</button>
          </div>
        </div>
      </div>

      <div style={{ textAlign:"center", padding:"20px 0",
        fontSize:12, color:C.tl }}>
        © 2026 FitManager Copyright and rights reserved
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT — switches between dashboard ↔ add form
// ══════════════════════════════════════════════════════════════════════════════
export default function PackagesPage() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [view, setView]           = useState("dashboard");
  const [packages, setPackages]   = useState(() => loadPackages());
  const [activeNav, setActiveNav] = useState("Packages");

  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
    setPackages(loadPackages());
  }, []);

  const handleNavClick = useCallback((label) => {
    setActiveNav(label);
    if (label === "Dashboard") navigate("/dashboard");
    if (label === "Trainers")  navigate("/trainers");
    if (label === "Packages")  setView("dashboard");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");
    navigate("/login");
  }, [navigate]);

  const handleSavePackage = useCallback((pkg, addAnother) => {
    setPackages(prev => {
      const updated = [...prev, pkg];
      savePackages(updated);
      return updated;
    });
    if (!addAnother) setView("dashboard");
  }, []);

  if (view === "add") {
    return (
      <AddPackageForm
        user={user}
        onSave={handleSavePackage}
        onDiscard={() => setView("dashboard")}
        onNavClick={handleNavClick}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <PackageDashboard
      packages={packages}
      setPackages={setPackages}
      onAddNew={() => setView("add")}
      user={user}
      activeNav={activeNav}
      onNavClick={handleNavClick}
      onLogout={handleLogout}
    />
  );
}
