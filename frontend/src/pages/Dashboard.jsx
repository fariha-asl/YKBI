// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Palette & tokens ──────────────────────────────────────────────────────────
const C = {
  acc:    "#1A6B4A",
  acc2:   "#22C55E",
  dark:   "#0F172A",
  nav:    "#1C2333",
  bg:     "#F4F6F9",
  card:   "#FFFFFF",
  border: "#E8ECF0",
  tm:     "#64748B",
  tl:     "#94A3B8",
  red:    "#EF4444",
  yellow: "#F59E0B",
  blue:   "#3B82F6",
  purple: "#8B5CF6",
  pink:   "#EC4899",
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: "TOTAL CLIENTS",   value: "248", sub: "+12% this month",   subColor: C.acc2,  icon: "👥" },
  { label: "SESSIONS TODAY",  value: "42",  sub: "Fully booked",      subColor: C.tm,    icon: "📅" },
  { label: "ACTIVE TRAINERS", value: "18",  sub: "On floor today",    subColor: C.tm,    icon: "🏋️" },
  { label: "TODAY MEMBERS",   value: "31",  sub: "4 check-ins pending", subColor: C.yellow, icon: "✅" },
  { label: "ABSENT MEMBERS",  value: "2",   sub: "Not active for 3 days", subColor: C.red, icon: "⚠️" },
];

const TRAINERS = [
  { name: "Micle Clark", color: C.acc2  },
  { name: "Sara Ahmed",  color: C.blue  },
  { name: "Tom Reed",    color: C.purple},
  { name: "Nina Paul",   color: C.pink  },
  { name: "James Fox",   color: C.yellow},
  { name: "Lena Hart",   color: C.red   },
];

const DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const TIMES = ["07 AM","08 AM","09 AM","10 AM","11 AM","12 PM","01 PM","02 PM"];

const EVENTS = [
  { day:0, row:0, title:"Semi Private",      time:"07–08 AM", color:"#DCFCE7", border:C.acc2,   trainer:C.acc2  },
  { day:1, row:2, title:"Group Classes",     time:"09–10 AM", color:"#FEF9C3", border:C.yellow, trainer:C.yellow},
  { day:2, row:1, title:"Personal Training", time:"08–09 AM", color:"#FCE7F3", border:C.pink,   trainer:C.pink  },
  { day:3, row:3, title:"Personal Training", time:"10–11 AM", color:"#DBEAFE", border:C.blue,   trainer:C.blue  },
  { day:4, row:0, title:"Semi Private",      time:"07–08 AM", color:"#DCFCE7", border:C.acc2,   trainer:C.acc2  },
  { day:6, row:5, title:"Leave",             time:"",         color:"#F1F5F9", border:C.tl,     trainer:C.tl    },
];

const PACKAGE_MEMBERS = [
  { name:"Tahsan",  sub:"Pilates Group Class", left:2, color:C.acc2   },
  { name:"Daafhin", sub:"Group Class",         left:3, color:C.blue   },
  { name:"Hasan",   sub:"Pilates Group Class", left:1, color:C.red    },
];

const BAR_DATA = [
  { day:"MON", h:60  },
  { day:"TUE", h:40  },
  { day:"WED", h:85  },
  { day:"THU", h:70  },
  { day:"FRI", h:50  },
  { day:"SAT", h:30  },
  { day:"SUN", h:25  },
];

const ATTENTION = [
  { name:"Sameed Quasem", role:"Premium Curator",  badge:"2 Class Left",  badgeC:C.yellow, pkg:"Semi-Private Group Class", total:24, days:null   },
  { name:"Samira Quasem", role:"Standard Plus",    badge:"5 Days Left",   badgeC:C.blue,   pkg:"Private Group Class",      total:12, days:null   },
  { name:"Reyan Anis",    role:"Legacy Member",    badge:"Ends Today",    badgeC:C.red,    pkg:"Semi-Private Group Class", total:24, days:null   },
  { name:"Sahar Abdal",   role:"Enterprise Lead",  badge:"3 Days Left",   badgeC:C.yellow, pkg:"Pilates Group Class",      total:12, days:null   },
  { name:"Ashna Huq",     role:"Collector",        badge:"4 Days Left",   badgeC:C.blue,   pkg:"Pilates Group Class",      total:24, days:null   },
  { name:"Naimul Bashar", role:"Business Partner", badge:"Expiring Now",  badgeC:C.red,    pkg:"Pilates Group Class",      total:12, days:null   },
];

const NAV_ITEMS = ["Dashboard","Packages","Trainers","Members","Reports","Settings"];

// ── Small helpers ─────────────────────────────────────────────────────────────
const Avatar = ({ name, color, size=36 }) => {
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:color, display:"flex", alignItems:"center",
      justifyContent:"center", color:"#fff",
      fontSize:size*0.35, fontWeight:700, flexShrink:0,
    }}>{initials}</div>
  );
};

const Card = ({ children, style={} }) => (
  <div style={{
    background:C.card, borderRadius:14,
    border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(0,0,0,.04)",
    ...style,
  }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
    textTransform:"uppercase", color:C.tl, marginBottom:4 }}>
    {children}
  </p>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [calView, setCalView]   = useState("Day");
  const [memberTab, setMemberTab] = useState("Monthly");
  const [chartRange, setChartRange] = useState("Weekly");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>

      {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
      <nav style={{
        background:C.nav, height:52, display:"flex",
        alignItems:"center", padding:"0 20px",
        position:"sticky", top:0, zIndex:100,
        boxShadow:"0 2px 8px rgba(0,0,0,.18)",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:24 }}>
          <svg width="26" height="26" viewBox="0 0 32 32">
            <polygon points="16,2 30,16 16,30 2,16" fill={C.acc}/>
            <polygon points="16,8 24,16 16,24 8,16" fill={C.acc2}/>
          </svg>
          <span style={{ color:"#fff", fontWeight:700, fontSize:16,
            fontFamily:"'Playfair Display',serif" }}>FitManage</span>
        </div>

        {/* Branch selector */}
        <div style={{
          background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)",
          borderRadius:8, padding:"5px 12px", display:"flex", alignItems:"center",
          gap:6, cursor:"pointer", marginRight:"auto",
        }}>
          <span style={{ color:"#CBD5E1", fontSize:13 }}>YKBI Health & Fitness</span>
          <span style={{ color:C.tl, fontSize:10 }}>▾</span>
        </div>

        {/* Right icons */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:18, cursor:"pointer" }}>⚙️</span>
          <span style={{ fontSize:18, cursor:"pointer" }}>🔍</span>
          <div style={{ position:"relative", cursor:"pointer" }}>
            <span style={{ fontSize:18 }}>🔔</span>
            <div style={{
              position:"absolute", top:-3, right:-3,
              width:14, height:14, background:C.red,
              borderRadius:"50%", fontSize:8,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontWeight:700,
            }}>3</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
            onClick={logout}>
            <Avatar name={user?.fullName || "U"} color={C.acc} size={30}/>
            <span style={{ color:"#E2E8F0", fontSize:13, fontWeight:600 }}>
              {user?.fullName?.split(" ")[0] || "User"}
            </span>
            <span style={{ color:C.tl, fontSize:10 }}>▾</span>
          </div>
        </div>
      </nav>

      {/* ── SUB-NAV TABS ────────────────────────────────────────────────── */}
      <div style={{
        background:C.card, borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", padding:"0 24px",
        position:"sticky", top:52, zIndex:99,
        boxShadow:"0 1px 3px rgba(0,0,0,.05)",
      }}>
        {NAV_ITEMS.map(item => {
          const active = item === activeNav;
          return (
            <button key={item} onClick={() => setActiveNav(item)} style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"14px 16px", fontSize:13, fontWeight: active ? 700 : 500,
              color: active ? C.acc : C.tm,
              borderBottom: active ? `2.5px solid ${C.acc}` : "2.5px solid transparent",
              fontFamily:"inherit", transition:"all .15s",
              display:"flex", alignItems:"center", gap:6,
            }}>
              {item === "Dashboard" && "⊞ "}
              {item === "Packages"  && "📦 "}
              {item === "Trainers"  && "🏋️ "}
              {item === "Members"   && "👥 "}
              {item === "Reports"   && "📊 "}
              {item === "Settings"  && "⚙️ "}
              {item}
            </button>
          );
        })}
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div style={{ padding:"20px 24px", maxWidth:1280, margin:"0 auto" }}>

        {/* ── STATS ROW ─────────────────────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)",
          gap:14, marginBottom:20 }}>
          {STATS.map(s => (
            <Card key={s.label} style={{ padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"flex-start" }}>
                <div>
                  <SectionLabel>{s.label}</SectionLabel>
                  <div style={{ fontSize:32, fontWeight:800, color:C.dark,
                    fontFamily:"'Playfair Display',serif", lineHeight:1.1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize:12, color:s.subColor, marginTop:4,
                    fontWeight:500 }}>{s.sub}</div>
                </div>
                <div style={{ fontSize:24, opacity:.6 }}>{s.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── TRAINERS + CALENDAR ───────────────────────────────────────── */}
        <Card style={{ marginBottom:20, overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:C.dark }}>Trainers</div>
              <div style={{ fontSize:12, color:C.tl }}>19 March, Thursday</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button style={{
                background:C.acc, color:"#fff", border:"none",
                borderRadius:8, padding:"7px 16px", cursor:"pointer",
                fontSize:13, fontWeight:600, fontFamily:"inherit",
              }}>+ Add New</button>
              {["Day","Week","Month","Year"].map(v => (
                <button key={v} onClick={() => setCalView(v)} style={{
                  background: calView===v ? C.dark : "transparent",
                  color: calView===v ? "#fff" : C.tm,
                  border:`1px solid ${calView===v ? C.dark : C.border}`,
                  borderRadius:7, padding:"5px 12px", cursor:"pointer",
                  fontSize:12, fontFamily:"inherit", fontWeight:500,
                }}>{v}</button>
              ))}
              <select style={{
                border:`1px solid ${C.border}`, borderRadius:7,
                padding:"5px 10px", fontSize:12, color:C.tm,
                background:C.card, cursor:"pointer",
              }}>
                <option>All Instructors</option>
              </select>
            </div>
          </div>

          {/* Trainer row */}
          <div style={{ display:"flex", alignItems:"center",
            padding:"12px 20px", borderBottom:`1px solid ${C.border}`,
            gap:0, overflowX:"auto" }}>
            <div style={{ width:64, flexShrink:0 }}/>
            {DAYS.map((d,i) => (
              <div key={d} style={{ flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", gap:4, minWidth:100 }}>
                <Avatar name={TRAINERS[i]?.name || "?"} color={TRAINERS[i]?.color || C.tl} size={32}/>
                <div style={{ fontSize:11, color:C.tm, fontWeight:500 }}>
                  {TRAINERS[i]?.name?.split(" ")[0] || "—"}
                </div>
                <div style={{ fontSize:10, color:C.tl }}>Total Clients</div>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display:"flex", overflowX:"auto", position:"relative" }}>
            {/* Time labels */}
            <div style={{ width:64, flexShrink:0 }}>
              {TIMES.map(t => (
                <div key={t} style={{ height:60, display:"flex",
                  alignItems:"flex-start", justifyContent:"flex-end",
                  padding:"6px 8px 0 0", fontSize:11, color:C.tl }}>
                  {t}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((d, di) => (
              <div key={d} style={{ flex:1, minWidth:100,
                borderLeft:`1px solid ${C.border}`, position:"relative" }}>
                {/* Day header */}
                <div style={{
                  textAlign:"center", padding:"4px 0",
                  fontSize:11, fontWeight:600,
                  color: d==="WED" ? C.acc : C.tm,
                  background: d==="WED" ? "#F0FDF4" : "transparent",
                  borderBottom:`1px solid ${C.border}`,
                }}>
                  {d==="WED" && (
                    <span style={{
                      background:C.acc, color:"#fff",
                      borderRadius:4, padding:"1px 6px",
                      fontSize:10, marginRight:4,
                    }}>10:12 AM</span>
                  )}
                  {d}
                </div>

                {/* Time rows */}
                {TIMES.map((_,ri) => (
                  <div key={ri} style={{ height:60,
                    borderBottom:`1px solid ${C.border}`,
                    background: ri%2===0 ? "transparent" : "rgba(0,0,0,.008)" }}/>
                ))}

                {/* Events */}
                {EVENTS.filter(e=>e.day===di).map((ev,ei) => (
                  <div key={ei} style={{
                    position:"absolute",
                    top: 28 + ev.row*60 + 4,
                    left:4, right:4,
                    background:ev.color,
                    border:`1.5px solid ${ev.border}`,
                    borderRadius:8, padding:"4px 8px",
                    cursor:"pointer",
                  }}>
                    <div style={{ fontSize:11, fontWeight:700,
                      color:C.dark }}>{ev.title}</div>
                    {ev.time && (
                      <div style={{ fontSize:10, color:C.tm }}>{ev.time}</div>
                    )}
                    {ev.title !== "Leave" && (
                      <Avatar name={TRAINERS[di]?.name||"T"}
                        color={ev.trainer} size={16}/>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* FAB */}
          <div style={{ display:"flex", justifyContent:"flex-end",
            padding:"12px 20px" }}>
            <button style={{
              width:44, height:44, borderRadius:"50%",
              background:C.acc, color:"#fff", border:"none",
              fontSize:22, cursor:"pointer",
              boxShadow:"0 4px 12px rgba(26,107,74,.4)",
            }}>+</button>
          </div>
        </Card>

        {/* ── MIDDLE ROW ────────────────────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr",
          gap:16, marginBottom:20 }}>

          {/* Member Overview */}
          <Card style={{ padding:"18px" }}>
            <div style={{ fontWeight:700, fontSize:15, color:C.dark,
              marginBottom:2 }}>Member Overview</div>
            <div style={{ fontSize:12, color:C.tl, marginBottom:14 }}>
              Managing subscription expirations and package health.
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {["Monthly","Weekly"].map(t => (
                <button key={t} onClick={() => setMemberTab(t)} style={{
                  background: memberTab===t ? "#F0FDF4" : "transparent",
                  color: memberTab===t ? C.acc : C.tm,
                  border: memberTab===t ? `1px solid ${C.acc2}` : `1px solid ${C.border}`,
                  borderRadius:20, padding:"4px 14px", cursor:"pointer",
                  fontSize:12, fontWeight:600, fontFamily:"inherit",
                }}>{t}</button>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between",
              marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.dark }}>
                Package Ending</span>
              <span style={{ fontSize:12, color:C.acc, cursor:"pointer",
                fontWeight:600 }}>View All</span>
            </div>

            {PACKAGE_MEMBERS.map((m,i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center",
                gap:10, padding:"10px 0",
                borderBottom: i < PACKAGE_MEMBERS.length-1
                  ? `1px solid ${C.border}` : "none",
              }}>
                <Avatar name={m.name} color={m.color} size={36}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600,
                    color:C.dark }}>{m.name}</div>
                  <div style={{ fontSize:11, color:C.tl }}>{m.sub}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:16, fontWeight:800,
                    color: m.left===1 ? C.red : C.dark }}>{m.left}</div>
                  <div style={{ fontSize:10, color:C.tl,
                    whiteSpace:"nowrap" }}>CLASS LEFT</div>
                </div>
              </div>
            ))}

            {/* Notification reminder */}
            <div style={{
              marginTop:14, padding:"10px 12px",
              background:"#F8FAFC", borderRadius:10,
              border:`1px solid ${C.border}`,
              display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{ fontSize:18 }}>🔔</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600,
                  color:C.dark }}>Notification Reminders</div>
                <div style={{ fontSize:11, color:C.tl }}>
                  Alert members 5 days before expiration</div>
              </div>
              <div style={{
                width:32, height:18, borderRadius:9,
                background:C.acc, cursor:"pointer", position:"relative",
              }}>
                <div style={{
                  width:14, height:14, borderRadius:"50%",
                  background:"#fff", position:"absolute",
                  right:2, top:2,
                }}/>
              </div>
            </div>
          </Card>

          {/* Right column: chart + payment + popular + growth */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Bar chart card */}
            <Card style={{ padding:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:14 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:C.dark }}>
                    Members Counting</div>
                  <div style={{ fontSize:12, color:C.tl }}>
                    Real-time gym capacity vs member check-ins</div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {["Day","Weekly","Monthly"].map(r => (
                    <button key={r} onClick={() => setChartRange(r)} style={{
                      background: chartRange===r ? C.acc : "transparent",
                      color: chartRange===r ? "#fff" : C.tm,
                      border:`1px solid ${chartRange===r ? C.acc : C.border}`,
                      borderRadius:20, padding:"3px 12px",
                      fontSize:11, cursor:"pointer", fontFamily:"inherit",
                      fontWeight:500,
                    }}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Bar chart */}
              <div style={{ display:"flex", alignItems:"flex-end",
                gap:8, height:110, padding:"0 4px" }}>
                {BAR_DATA.map((b,i) => (
                  <div key={b.day} style={{ flex:1, display:"flex",
                    flexDirection:"column", alignItems:"center", gap:4 }}>
                    {b.day==="WED" && (
                      <div style={{ fontSize:10, color:C.acc,
                        fontWeight:700, whiteSpace:"nowrap" }}>
                        +3 Members</div>
                    )}
                    <div style={{
                      width:"100%", background: b.day==="WED" ? C.acc : "#D1FAE5",
                      borderRadius:"6px 6px 0 0",
                      height: b.h * 0.9,
                      transition:"height .3s",
                    }}/>
                    <div style={{ fontSize:11, color:C.tl,
                      fontWeight: b.day==="WED" ? 700 : 400,
                      color: b.day==="WED" ? C.acc : C.tl,
                    }}>{b.day}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment + Popular + Growth row */}
            <div style={{ display:"grid",
              gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>

              {/* Payment Status */}
              <Card style={{ padding:"16px" }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.dark,
                  marginBottom:12 }}>Payment Status</div>
                <div style={{ fontSize:11, color:C.tl,
                  marginBottom:4 }}>Due Payments</div>
                <div style={{ fontSize:22, fontWeight:800,
                  color:C.dark, marginBottom:2 }}>₹ 45,500</div>
                <div style={{ fontSize:12, color:C.red,
                  marginBottom:14, fontWeight:500 }}>12 invoices pending</div>
                <div style={{ height:1, background:C.border, marginBottom:14 }}/>
                <div style={{ fontSize:11, color:C.tl, marginBottom:4 }}>
                  Total Revenue</div>
                <div style={{ fontSize:20, fontWeight:800,
                  color:C.dark, marginBottom:4 }}>₹ 3,20,000</div>
                <div style={{ fontSize:12, color:C.acc2, fontWeight:600 }}>
                  ↑ 22% from last month</div>
              </Card>

              {/* Popular Classes */}
              <Card style={{ padding:"16px" }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.dark,
                  marginBottom:12 }}>Popular Classes</div>
                <div style={{ display:"flex", gap:10 }}>
                  {[
                    { name:"Bodybuilding", members:14, color:C.acc },
                    { name:"Group Class",  members:28, color:C.blue },
                  ].map(cls => (
                    <div key={cls.name} style={{ flex:1,
                      textAlign:"center" }}>
                      <div style={{
                        width:54, height:54, borderRadius:12,
                        background:cls.color,
                        margin:"0 auto 8px",
                        display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:22,
                      }}>🏋️</div>
                      <div style={{ fontSize:12, fontWeight:600,
                        color:C.dark }}>{cls.name}</div>
                      <div style={{ fontSize:11, color:C.tl }}>
                        {cls.members} Members</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Members Growth */}
              <Card style={{ padding:"16px" }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.dark,
                  marginBottom:12 }}>Members Growth</div>
                {/* Mini bar chart */}
                <div style={{ display:"flex", alignItems:"flex-end",
                  gap:5, height:70 }}>
                  {[30,45,35,60,80,55,70,90].map((h,i) => (
                    <div key={i} style={{
                      flex:1,
                      height: h * 0.7,
                      background: i===7 ? C.acc : "#E2E8F0",
                      borderRadius:"3px 3px 0 0",
                    }}/>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginTop:6 }}>
                  {["MAY","JUN","JUL","AUG","SEP","OCT"].map(m => (
                    <span key={m} style={{ fontSize:9, color:C.tl }}>{m}</span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* ── MEMBER ATTENTION ──────────────────────────────────────────── */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:16, color:C.dark }}>
              Member Attention Needed</div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:12, color:C.tl }}>
                Showing 6 prioritized members</span>
              <button style={{
                background:"none", border:`1px solid ${C.border}`,
                borderRadius:7, padding:"5px 12px", cursor:"pointer",
                fontSize:12, color:C.tm, fontFamily:"inherit",
              }}>View Filter ▾</button>
            </div>
          </div>

          <div style={{ display:"grid",
            gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {ATTENTION.map((m,i) => (
              <Card key={i} style={{ padding:"16px" }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center",
                  gap:10, marginBottom:14 }}>
                  <Avatar name={m.name} color={
                    [C.acc,C.blue,C.purple,C.yellow,C.pink,C.red][i]
                  } size={40}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700,
                      color:C.dark }}>{m.name}</div>
                    <div style={{ fontSize:11, color:C.tl }}>{m.role}</div>
                  </div>
                  <div style={{
                    background:m.badgeC+"22", color:m.badgeC,
                    fontSize:10, fontWeight:700,
                    padding:"3px 8px", borderRadius:20,
                    border:`1px solid ${m.badgeC}44`,
                    whiteSpace:"nowrap",
                  }}>{m.badge}</div>
                </div>

                {/* Details */}
                <div style={{ height:1, background:C.border, marginBottom:10 }}/>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.tl }}>Package Tier</span>
                  <span style={{ fontSize:12, fontWeight:600,
                    color:C.dark, textAlign:"right",
                    maxWidth:140 }}>{m.pkg}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginBottom:14 }}>
                  <span style={{ fontSize:12, color:C.tl }}>
                    Total Number of Classes</span>
                  <span style={{ fontSize:12, fontWeight:700,
                    color:C.dark }}>{m.total}</span>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{
                    flex:1, padding:"8px", border:`1px solid ${C.border}`,
                    borderRadius:8, background:"#fff", cursor:"pointer",
                    fontSize:12, fontWeight:600, color:C.dark,
                    fontFamily:"inherit",
                  }}>Send Reminder</button>
                  <button style={{
                    flex:1, padding:"8px", border:"none",
                    borderRadius:8, background:C.dark, cursor:"pointer",
                    fontSize:12, fontWeight:600, color:"#fff",
                    fontFamily:"inherit",
                  }}>Auto-Renew</button>
                </div>
              </Card>
            ))}
          </div>

          {/* View all */}
          <div style={{ textAlign:"center", marginTop:16 }}>
            <button style={{
              background:"none", border:"none", cursor:"pointer",
              color:C.acc, fontSize:13, fontWeight:600,
              fontFamily:"inherit",
            }}>View All Expiring Packages ↓</button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"16px 0",
          fontSize:12, color:C.tl,
          borderTop:`1px solid ${C.border}` }}>
          © 2026 FitManager Copyright and rights reserved
        </div>
      </div>
    </div>
  );
}
