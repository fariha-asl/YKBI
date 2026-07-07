// frontend/src/pages/TrainerPage.jsx
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

const INITIAL_TRAINERS = [
  { id:1,  name:"Elena Vance",   role:"Senior Design Lead",      location:"Gulshan 1, Dhaka", status:"ACTIVE",  email:"elena@studio.com",   phone:"+1 (555) 012-3456", emergency:"Faisal Ahmed (Husband)", bio:"Elena leads the visual language of the Curator ecosystem. With over a decade of experience in editorial design and architecture, she brings a structured yet fluid approach to product development.", tenure:"6.4 Yrs", classes:1254, desk:true,  instructor:true,  teacher:false, avatar:"EV", color:"#8B5CF6" },
  { id:2,  name:"Julian Rossi",  role:"Technical Architect",     location:"Bariuri, Dhaka",   status:"AWAY",    email:"julian@studio.com",  phone:"+1 (555) 023-4567", emergency:"Maria Rossi (Wife)",    bio:"Julian is the technical backbone of the team, specializing in system architecture and cloud infrastructure. He ensures scalability across all platforms.",                                  tenure:"4.2 Yrs", classes:980,  desk:true,  instructor:false, teacher:true,  avatar:"JR", color:"#3B82F6" },
  { id:3,  name:"Sarah Drasner", role:"Senior Researcher",       location:"Gulshan 2, Dhaka", status:"ACTIVE",  email:"sarah@studio.com",   phone:"+1 (555) 034-5678", emergency:"Tom Drasner (Brother)", bio:"Sarah brings deep expertise in user research and behavioral psychology. She transforms raw data into actionable design insights that drive product decisions.",                           tenure:"3.8 Yrs", classes:756,  desk:false, instructor:true,  teacher:true,  avatar:"SD", color:"#22C55E" },
  { id:4,  name:"Marcus Thorne", role:"Operations Manager",      location:"Dhanmondi, Dhaka", status:"OFFLINE", email:"marcus@studio.com",  phone:"+1 (555) 045-6789", emergency:"Lisa Thorne (Spouse)",  bio:"Marcus oversees the day-to-day operations of our global offices. His background in logistics and process optimization has streamlined workflows across 12 departments.",                tenure:"7.1 Yrs", classes:1456, desk:true,  instructor:false, teacher:false, avatar:"MT", color:"#F59E0B" },
  { id:5,  name:"Lina Zhang",    role:"Visual Designer",         location:"Singpara, Dhaka",  status:"ACTIVE",  email:"lina@studio.com",    phone:"+1 (555) 056-7890", emergency:"Wei Zhang (Father)",    bio:"Lina crafts the visual experiences that define our brand. Her expertise in motion design and illustration brings personality to every pixel.",                                           tenure:"2.5 Yrs", classes:542,  desk:true,  instructor:true,  teacher:false, avatar:"LZ", color:"#EC4899" },
];

const STATS = [
  { label:"TOTAL STAFF",      value:"31",    sub:"+12% this month",     icon:"👥", subColor:C.acc2 },
  { label:"ATTENDANCE RATE",  value:"98.2%", sub:"Across 8 departments", icon:"📊", subColor:C.tm, bar:true },
  { label:"ACTIVE ROLES",     value:"30",    sub:"Across 8 departments", icon:"💼", subColor:C.tm  },
  { label:"LEAVE",            value:"1",     sub:"Emergency leave",      icon:"📅", subColor:C.tm  },
];

const STATUS_COLORS = {
  ACTIVE:"#22C55E", AWAY:"#F59E0B", OFFLINE:"#94A3B8",
};

const Avatar = ({ initials, color, size=40, src }) => (
  <div style={{
    width:size, height:size, borderRadius:"50%",
    background: src ? "transparent" : color,
    display:"flex", alignItems:"center", justifyContent:"center",
    color:"#fff", fontSize:size*0.35, fontWeight:700,
    flexShrink:0, overflow:"hidden", border:`2px solid ${color}33`,
  }}>
    {src
      ? <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
      : initials}
  </div>
);

const Card = ({ children, style={} }) => (
  <div style={{
    background:C.card, borderRadius:14,
    border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(0,0,0,.04)", ...style,
  }}>{children}</div>
);

const Toggle = ({ on, onChange }) => (
  <div onClick={() => onChange(!on)} style={{
    width:38, height:20, borderRadius:10,
    background: on ? C.acc : "#E2E8F0",
    cursor:"pointer", position:"relative",
    transition:"background .2s",
  }}>
    <div style={{
      width:16, height:16, borderRadius:"50%", background:"#fff",
      position:"absolute", top:2,
      left: on ? 20 : 2,
      transition:"left .2s",
      boxShadow:"0 1px 3px rgba(0,0,0,.2)",
    }}/>
  </div>
);

// ── ADD STAFF MODAL ───────────────────────────────────────────────────────────
function AddStaffModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    firstName:"", lastName:"", gender:"", location:"",
    email:"", phone:"+880", role:"",
    sendEmail:false, startDate:"",
  });
  const [profileImg, setProfileImg] = useState(null);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) =>
    setForm(f => ({ ...f, [k]: e.target.type==="checkbox" ? e.target.checked : e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email.trim())     e.email     = "Required";
    if (!form.role)             e.role      = "Required";
    return e;
  };

  const handleSave = (addAnother=false) => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newTrainer = {
      id: Date.now(),
      name:`${form.firstName} ${form.lastName}`,
      role: form.role,
      location: form.location,
      status:"ACTIVE",
      email: form.email,
      phone: form.phone,
      emergency:"—",
      bio:`${form.firstName} is a new ${form.role} at FitManage.`,
      tenure:"0 Yrs", classes:0,
      desk:false, instructor:false, teacher:false,
      avatar:`${form.firstName[0]||"?"}${form.lastName[0]||"?"}`.toUpperCase(),
      color:["#22C55E","#3B82F6","#8B5CF6","#EC4899","#F59E0B"][Math.floor(Math.random()*5)],
      profileImg,
    };
    onSave(newTrainer, addAnother);
    if (addAnother) {
      setForm({ firstName:"", lastName:"", gender:"", location:"",
        email:"", phone:"+880", role:"", sendEmail:false, startDate:"" });
      setProfileImg(null);
      setErrors({});
    }
  };

  const handleImgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const inputStyle = (err) => ({
    width:"100%", border:`1.5px solid ${err ? C.red : C.border}`,
    borderRadius:8, padding:"9px 12px", fontSize:13,
    fontFamily:"inherit", color:C.dark, outline:"none",
    background:"#fff", boxSizing:"border-box",
    transition:"border-color .2s",
  });

  const labelStyle = {
    display:"block", fontSize:11, fontWeight:700,
    letterSpacing:".07em", textTransform:"uppercase",
    color:C.tm, marginBottom:5,
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:20,
    }}>
      <div style={{
        background:"#fff", borderRadius:16, width:"100%", maxWidth:540,
        maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 20px 60px rgba(0,0,0,.2)",
        animation:"fadeUp .25s ease",
      }}>
        {/* Modal header */}
        <div style={{ padding:"22px 26px 16px",
          borderBottom:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between",
          alignItems:"flex-start" }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:C.dark,
              marginBottom:4 }}>Add New Staff</h2>
            <p style={{ fontSize:13, color:C.tl }}>
              Introduce a new professional to your curated collection.
              All fields are required for initial synchronization.</p>
          </div>
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:20, color:C.tl, padding:4, lineHeight:1,
          }}>✕</button>
        </div>

        <div style={{ padding:"20px 26px" }}>

          {/* Personal Identity */}
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:".1em",
            textTransform:"uppercase", color:C.tl, marginBottom:14 }}>
            Personal Identity
          </div>

          {/* Profile Image */}
          <div style={{ display:"flex", alignItems:"center",
            gap:14, marginBottom:18 }}>
            <div style={{
              width:70, height:70, borderRadius:"50%",
              background:"#F1F5F9", border:`2px dashed ${C.border}`,
              display:"flex", alignItems:"center",
              justifyContent:"center", overflow:"hidden",
              flexShrink:0, cursor:"pointer", position:"relative",
            }}
              onClick={() => document.getElementById("imgInput").click()}>
              {profileImg
                ? <img src={profileImg} alt=""
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontSize:28, opacity:.4 }}>👤</span>
              }
              <div style={{
                position:"absolute", bottom:0, right:0,
                background:C.acc, borderRadius:"50%",
                width:22, height:22, display:"flex",
                alignItems:"center", justifyContent:"center",
                color:"#fff", fontSize:12,
              }}>✎</div>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600,
                color:C.dark, marginBottom:2 }}>Profile Image</div>
              <div style={{ fontSize:11, color:C.tl }}>
                SVG, PNG, or JPG (Max. 800×800px)</div>
              <input id="imgInput" type="file"
                accept="image/*" style={{ display:"none" }}
                onChange={handleImgUpload}/>
            </div>
          </div>

          {/* Name row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:14, marginBottom:14 }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input value={form.firstName} onChange={set("firstName")}
                placeholder="e.g. Julian" style={inputStyle(errors.firstName)}/>
              {errors.firstName && (
                <p style={{ color:C.red, fontSize:11, marginTop:3 }}>
                  {errors.firstName}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input value={form.lastName} onChange={set("lastName")}
                placeholder="e.g. Hops" style={inputStyle(errors.lastName)}/>
              {errors.lastName && (
                <p style={{ color:C.red, fontSize:11, marginTop:3 }}>
                  {errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Gender + Location */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:14, marginBottom:20 }}>
            <div>
              <label style={labelStyle}>Gender</label>
              <select value={form.gender} onChange={set("gender")}
                style={inputStyle(false)}>
                <option value="">Select orientation</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input value={form.location} onChange={set("location")}
                placeholder="e.g. Dhaka Studio"
                style={inputStyle(false)}/>
            </div>
          </div>

          {/* Contact & Access */}
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:".1em",
            textTransform:"uppercase", color:C.tl, marginBottom:14 }}>
            Contact & Access
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={labelStyle}>Email</label>
            <input value={form.email} onChange={set("email")}
              type="email" placeholder="talent@email.com"
              style={inputStyle(errors.email)}/>
            {errors.email && (
              <p style={{ color:C.red, fontSize:11, marginTop:3 }}>
                {errors.email}</p>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:14, marginBottom:20 }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input value={form.phone} onChange={set("phone")}
                placeholder="+880 00 0000 00 00"
                style={inputStyle(false)}/>
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select value={form.role} onChange={set("role")}
                style={inputStyle(errors.role)}>
                <option value="">Select organization role</option>
                <option>Senior Trainer</option>
                <option>Junior Trainer</option>
                <option>Operations Manager</option>
                <option>Technical Architect</option>
                <option>Visual Designer</option>
                <option>Senior Researcher</option>
                <option>Design Lead</option>
              </select>
              {errors.role && (
                <p style={{ color:C.red, fontSize:11, marginTop:3 }}>
                  {errors.role}</p>
              )}
            </div>
          </div>

          {/* Onboarding */}
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:".1em",
            textTransform:"uppercase", color:C.tl, marginBottom:14 }}>
            Onboarding
          </div>

          <div style={{
            background:"#F8FAFC", borderRadius:10,
            border:`1px solid ${C.border}`, padding:"14px 16px",
            marginBottom:14,
          }}>
            <div style={{ display:"flex", alignItems:"center",
              justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600,
                  color:C.dark }}>Send Account Setup Email Date</div>
                <div style={{ fontSize:11, color:C.tl }}>
                  Automatically invitation will be dispatched at 09:00 AM
                  on this date.</div>
              </div>
              <input type="checkbox" checked={form.sendEmail}
                onChange={set("sendEmail")}
                style={{ width:16, height:16, accentColor:C.acc }}/>
            </div>
            <input type="date" value={form.startDate}
              onChange={set("startDate")}
              style={{ ...inputStyle(false), background:"#fff" }}/>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding:"16px 26px",
          borderTop:`1px solid ${C.border}`,
          display:"flex", justifyContent:"flex-end", gap:10,
        }}>
          <button onClick={onClose} style={{
            background:"none", border:`1px solid ${C.border}`,
            borderRadius:8, padding:"9px 20px", cursor:"pointer",
            fontSize:13, fontWeight:600, color:C.tm, fontFamily:"inherit",
          }}>Cancel</button>
          <button onClick={() => handleSave(true)} style={{
            background:"#F0FDF4", border:`1px solid ${C.acc2}`,
            borderRadius:8, padding:"9px 20px", cursor:"pointer",
            fontSize:13, fontWeight:600, color:C.acc, fontFamily:"inherit",
          }}>Save and Add Another</button>
          <button onClick={() => handleSave(false)} style={{
            background:C.acc, border:"none",
            borderRadius:8, padding:"9px 24px", cursor:"pointer",
            fontSize:13, fontWeight:700, color:"#fff", fontFamily:"inherit",
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── TRAINER PROFILE PANEL ─────────────────────────────────────────────────────
function TrainerProfile({ trainer, onUpdate }) {
  const [activeTab, setActiveTab] = useState("Staff Profile");
  const [mgmt, setMgmt] = useState({
    desk: trainer.desk,
    instructor: trainer.instructor,
    teacher: trainer.teacher,
  });

  const TABS = ["Staff Profile","Staff Appointment Setup",
    "Appointment Availability","Class Pay Rates"];

  const handleToggle = (key) => {
    const updated = { ...mgmt, [key]: !mgmt[key] };
    setMgmt(updated);
    onUpdate({ ...trainer, ...updated });
  };

  return (
    <div style={{ flex:1, minWidth:0 }}>
      {/* Photo + name header */}
      <div style={{
        background:"#fff", borderRadius:14,
        border:`1px solid ${C.border}`,
        overflow:"hidden", marginBottom:14,
      }}>
        {/* Cover + avatar */}
        <div style={{ height:100, background:`linear-gradient(135deg, ${C.acc} 0%, #0D4F35 100%)`,
          position:"relative" }}>
          <div style={{ position:"absolute", bottom:-30, left:20,
            width:68, height:68, borderRadius:"50%",
            border:"3px solid #fff", overflow:"hidden",
            background:trainer.color,
            display:"flex", alignItems:"center",
            justifyContent:"center", color:"#fff",
            fontSize:24, fontWeight:700,
          }}>
            {trainer.profileImg
              ? <img src={trainer.profileImg} alt=""
                  style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : trainer.avatar}
          </div>
        </div>

        <div style={{ padding:"36px 20px 16px",
          display:"flex", alignItems:"flex-start",
          justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:11, color:C.acc, fontWeight:600,
              letterSpacing:".08em", marginBottom:2 }}>
              EMPLOYEE ID #1026</div>
            <div style={{ fontSize:20, fontWeight:800,
              color:C.dark }}>{trainer.name}</div>
            <div style={{ fontSize:13, color:C.tm,
              marginTop:2 }}>{trainer.role}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ background:"#F1F5F9", border:"none",
              borderRadius:8, padding:"6px 10px", cursor:"pointer",
              fontSize:16 }}>✉️</button>
            <button style={{ background:"#F1F5F9", border:"none",
              borderRadius:8, padding:"6px 10px", cursor:"pointer",
              fontSize:16 }}>⋮</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderTop:`1px solid ${C.border}`,
          overflowX:"auto" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"11px 16px", fontSize:12, fontWeight:500,
              color: activeTab===tab ? C.acc : C.tm,
              borderBottom: activeTab===tab
                ? `2px solid ${C.acc}` : "2px solid transparent",
              whiteSpace:"nowrap", fontFamily:"inherit",
            }}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Profile content */}
      {activeTab === "Staff Profile" && (
        <div style={{ display:"grid",
          gridTemplateColumns:"1fr auto", gap:14 }}>
          {/* Left: bio + contact */}
          <div>
            <Card style={{ padding:"18px", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center",
                gap:8, marginBottom:14 }}>
                <span style={{ fontSize:18 }}>✏️</span>
                <span style={{ fontWeight:700, fontSize:14,
                  color:C.dark }}>Bio & Vision</span>
              </div>
              <p style={{ fontSize:13, color:C.tm, lineHeight:1.7 }}>
                {trainer.bio}</p>
            </Card>

            <Card style={{ padding:"18px" }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.dark,
                marginBottom:14 }}>Contact Information</div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:C.tl, marginBottom:4,
                  fontWeight:600, textTransform:"uppercase",
                  letterSpacing:".07em" }}>Primary Email</div>
                <div style={{ background:"#F8FAFC",
                  border:`1px solid ${C.border}`, borderRadius:8,
                  padding:"9px 12px", fontSize:13,
                  color:C.dark }}>{trainer.email}</div>
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:C.tl, marginBottom:4,
                  fontWeight:600, textTransform:"uppercase",
                  letterSpacing:".07em" }}>Phone</div>
                <div style={{ background:"#F8FAFC",
                  border:`1px solid ${C.border}`, borderRadius:8,
                  padding:"9px 12px", fontSize:13,
                  color:C.dark }}>{trainer.phone}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:C.tl, marginBottom:4,
                  fontWeight:600, textTransform:"uppercase",
                  letterSpacing:".07em" }}>Emergency Contact</div>
                <div style={{ background:"#F8FAFC",
                  border:`1px solid ${C.border}`, borderRadius:8,
                  padding:"9px 12px", fontSize:13,
                  color:C.dark }}>{trainer.emergency}</div>
              </div>
            </Card>
          </div>

          {/* Right: management + engagement */}
          <div style={{ width:200 }}>
            <Card style={{ padding:"16px", marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.dark,
                marginBottom:14, letterSpacing:".05em",
                textTransform:"uppercase", fontSize:11,
                color:C.tl }}>Staff Management</div>
              {[
                { key:"desk",       label:"Desk staff", icon:"🖥️" },
                { key:"instructor", label:"Instructor",  icon:"🏋️" },
                { key:"teacher",    label:"Teacher",     icon:"📚" },
              ].map(item => (
                <div key={item.key} style={{
                  display:"flex", alignItems:"center",
                  justifyContent:"space-between",
                  marginBottom:12,
                }}>
                  <div style={{ display:"flex", alignItems:"center",
                    gap:7 }}>
                    <span style={{ fontSize:14 }}>{item.icon}</span>
                    <span style={{ fontSize:13, color:C.dark }}>
                      {item.label}</span>
                  </div>
                  <Toggle on={mgmt[item.key]}
                    onChange={() => handleToggle(item.key)}/>
                </div>
              ))}
              <button style={{
                width:"100%", marginTop:6, padding:"8px",
                background:"#FEF2F2", border:`1px solid #FECACA`,
                borderRadius:8, cursor:"pointer", fontSize:12,
                fontWeight:600, color:C.red, fontFamily:"inherit",
                display:"flex", alignItems:"center",
                justifyContent:"center", gap:6,
              }}>
                Terminate Employment <span>⚠</span>
              </button>
            </Card>

            <Card style={{ padding:"16px" }}>
              <div style={{ fontSize:11, fontWeight:700,
                textTransform:"uppercase", letterSpacing:".07em",
                color:C.tl, marginBottom:14 }}>Engagement</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                gap:10, marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:10, color:C.tl,
                    marginBottom:2 }}>TENURE</div>
                  <div style={{ fontSize:18, fontWeight:800,
                    color:C.dark }}>{trainer.tenure}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:C.tl,
                    marginBottom:2 }}>CLASSES</div>
                  <div style={{ fontSize:18, fontWeight:800,
                    color:C.dark }}>{trainer.classes}</div>
                </div>
              </div>
              <button style={{
                width:"100%", padding:"9px",
                background:C.acc, border:"none",
                borderRadius:8, cursor:"pointer",
                fontSize:12, fontWeight:600, color:"#fff",
                fontFamily:"inherit",
                display:"flex", alignItems:"center",
                justifyContent:"center", gap:6,
              }}>
                ✎ Modify Clearances
              </button>
            </Card>
          </div>
        </div>
      )}

      {activeTab !== "Staff Profile" && (
        <Card style={{ padding:"40px", textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🚧</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.dark,
            marginBottom:6 }}>{activeTab}</div>
          <div style={{ fontSize:13, color:C.tl }}>
            This section is under development.</div>
        </Card>
      )}
    </div>
  );
}

// ── MAIN TRAINER PAGE ─────────────────────────────────────────────────────────
export default function TrainerPage() {
  const navigate = useNavigate();
  const [user, setUser]                 = useState(null);
  const [trainers, setTrainers]         = useState(INITIAL_TRAINERS);
  const [selectedTrainer, setSelected]  = useState(INITIAL_TRAINERS[0]);
  const [showModal, setShowModal]       = useState(false);
  const [search, setSearch]             = useState("");
  const [activeNav, setActiveNav]       = useState("Trainers");
  const [filter, setFilter]             = useState("ALL STAFF");

  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");
    navigate("/login");
  };

  const handleNavClick = (label) => {
    setActiveNav(label);
    if (label === "Dashboard") navigate("/dashboard");
  };

  const handleSaveTrainer = (newTrainer, addAnother) => {
    setTrainers(prev => [...prev, newTrainer]);
    if (!addAnother) {
      setShowModal(false);
      setSelected(newTrainer);
    }
  };

  const handleUpdateTrainer = (updated) => {
    setTrainers(prev => prev.map(t => t.id===updated.id ? updated : t));
    setSelected(updated);
  };

  const filtered = trainers.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
      || t.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL STAFF"
      || (filter === "ON SHIFT" && t.status === "ACTIVE");
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.dark }}>

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
          <span style={{ fontSize:20, cursor:"pointer", opacity:.7 }}>🔍</span>
          <span style={{ fontSize:20, cursor:"pointer", opacity:.7 }}>⚙️</span>
          <div style={{ position:"relative", cursor:"pointer" }}>
            <span style={{ fontSize:20 }}>🔔</span>
            <div style={{
              position:"absolute", top:-4, right:-4,
              width:16, height:16, background:C.red,
              borderRadius:"50%", fontSize:9,
              display:"flex", alignItems:"center",
              justifyContent:"center", color:"#fff",
              fontWeight:700, border:"2px solid "+C.nav,
            }}>3</div>
          </div>
          <div style={{ display:"flex", alignItems:"center",
            gap:8, cursor:"pointer" }} onClick={logout}>
            <div style={{ width:32, height:32, borderRadius:"50%",
              background:C.acc, display:"flex", alignItems:"center",
              justifyContent:"center", color:"#fff",
              fontSize:13, fontWeight:700 }}>
              {user?.fullName?.[0]||"U"}</div>
            <span style={{ color:"#E2E8F0", fontSize:13,
              fontWeight:600 }}>
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
                ? `2.5px solid ${C.acc}`
                : "2.5px solid transparent",
              fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <span>{icon}</span> {label}
            </button>
          );
        })}
      </div>

      {/* PAGE BODY */}
      <div style={{ padding:"20px 24px", maxWidth:1320, margin:"0 auto" }}>

        {/* Page title */}
        <div style={{ marginBottom:16 }}>
          <h1 style={{ fontSize:20, fontWeight:700, color:C.dark,
            marginBottom:2 }}>Trainers/Staff Overview</h1>
          <p style={{ fontSize:12, color:C.tl }}>
            Performance Period: April 2026 · All Departments</p>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid",
          gridTemplateColumns:"1fr 1fr 1fr 1fr auto",
          gap:14, marginBottom:20, alignItems:"stretch" }}>
          {STATS.map(s => (
            <Card key={s.label} style={{ padding:"16px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:10, fontWeight:700,
                    letterSpacing:".1em", textTransform:"uppercase",
                    color:C.tl, marginBottom:6,
                    display:"flex", alignItems:"center", gap:6 }}>
                    {s.label}
                    <span style={{ fontSize:14 }}>{s.icon}</span>
                  </p>
                  <div style={{ fontSize:28, fontWeight:800, color:C.dark,
                    fontFamily:"Georgia,serif", lineHeight:1 }}>
                    {s.value}</div>
                  {s.bar && (
                    <div style={{ marginTop:6, height:4,
                      background:"#E8ECF0", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:"98.2%",
                        background:C.acc, borderRadius:2 }}/>
                    </div>
                  )}
                  <div style={{ fontSize:11, color:s.subColor,
                    marginTop:s.bar?4:6, fontWeight:500 }}>{s.sub}</div>
                </div>
              </div>
            </Card>
          ))}

          {/* Hiring Pipeline — accent card */}
          <div style={{
            background:C.acc, borderRadius:14, padding:"16px 20px",
            minWidth:160, display:"flex", flexDirection:"column",
            justifyContent:"space-between",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start" }}>
              <p style={{ fontSize:10, fontWeight:700,
                letterSpacing:".1em", textTransform:"uppercase",
                color:"rgba(255,255,255,.7)", marginBottom:6 }}>
                Hiring Pipeline</p>
              <span style={{ fontSize:16 }}>👥</span>
            </div>
            <div style={{ fontSize:44, fontWeight:800, color:"#fff",
              fontFamily:"Georgia,serif", lineHeight:1 }}>3</div>
            <button style={{ background:"rgba(255,255,255,.15)",
              border:"1px solid rgba(255,255,255,.3)",
              borderRadius:7, padding:"7px 12px", cursor:"pointer",
              fontSize:11, fontWeight:700, color:"#fff",
              fontFamily:"inherit", marginTop:8,
              letterSpacing:".06em", textTransform:"uppercase",
            }}>Manage Recruits</button>
          </div>
        </div>

        {/* Main content: directory + profile */}
        <div style={{ display:"grid",
          gridTemplateColumns:"280px 1fr", gap:16 }}>

          {/* LEFT: Directory */}
          <div>
            {/* Search + Add */}
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <div style={{ flex:1, position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%",
                  transform:"translateY(-50%)", fontSize:14,
                  color:C.tl }}>🔍</span>
                <input value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search the roster..."
                  style={{ width:"100%", border:`1px solid ${C.border}`,
                    borderRadius:9, padding:"9px 12px 9px 32px",
                    fontSize:13, fontFamily:"inherit", color:C.dark,
                    outline:"none", background:"#fff",
                    boxSizing:"border-box" }}/>
              </div>
              <button onClick={() => setShowModal(true)} style={{
                background:C.acc, border:"none", borderRadius:9,
                padding:"9px 14px", cursor:"pointer",
                fontSize:12, fontWeight:700, color:"#fff",
                fontFamily:"inherit", whiteSpace:"nowrap",
              }}>+ Add Staff</button>
            </div>

            <Card style={{ overflow:"hidden" }}>
              <div style={{ padding:"14px 16px",
                borderBottom:`1px solid ${C.border}` }}>
                <div style={{ fontWeight:700, fontSize:14,
                  color:C.dark, marginBottom:10 }}>Directory</div>
                <div style={{ display:"flex", gap:6 }}>
                  {["ALL STAFF","ON SHIFT"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                      background: filter===f ? C.dark : "#F1F5F9",
                      color: filter===f ? "#fff" : C.tm,
                      border:"none", borderRadius:6,
                      padding:"4px 10px", cursor:"pointer",
                      fontSize:10, fontWeight:700,
                      fontFamily:"inherit", letterSpacing:".05em",
                    }}>
                      {f} {f==="ALL STAFF"
                        ? trainers.length
                        : trainers.filter(t=>t.status==="ACTIVE").length}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ maxHeight:520, overflowY:"auto" }}>
                {filtered.map(t => (
                  <div key={t.id} onClick={() => setSelected(t)}
                    style={{
                      display:"flex", alignItems:"center",
                      gap:10, padding:"12px 16px",
                      borderBottom:`1px solid ${C.border}`,
                      cursor:"pointer",
                      background: selectedTrainer?.id===t.id
                        ? "#F0FDF4" : "#fff",
                      borderLeft: selectedTrainer?.id===t.id
                        ? `3px solid ${C.acc}` : "3px solid transparent",
                      transition:"background .15s",
                    }}>
                    <Avatar initials={t.avatar} color={t.color}
                      size={38} src={t.profileImg}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600,
                        color:C.dark, whiteSpace:"nowrap",
                        overflow:"hidden",
                        textOverflow:"ellipsis" }}>{t.name}</div>
                      <div style={{ fontSize:11, color:C.tl,
                        whiteSpace:"nowrap", overflow:"hidden",
                        textOverflow:"ellipsis" }}>{t.role}</div>
                      <div style={{ fontSize:10, color:C.tl,
                        display:"flex", alignItems:"center",
                        gap:3 }}>
                        <span>📍</span>{t.location}</div>
                    </div>
                    <div style={{
                      fontSize:9, fontWeight:700,
                      color:STATUS_COLORS[t.status]||C.tl,
                      letterSpacing:".05em",
                    }}>{t.status}</div>
                  </div>
                ))}
                {filtered.length===0 && (
                  <div style={{ padding:24, textAlign:"center",
                    color:C.tl, fontSize:13 }}>
                    No staff found</div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT: Profile */}
          {selectedTrainer && (
            <TrainerProfile
              trainer={selectedTrainer}
              onUpdate={handleUpdateTrainer}/>
          )}
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveTrainer}/>
      )}
    </div>
  );
}
