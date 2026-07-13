// frontend/src/pages/Dashboard.jsx
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

const STATS = [
  { label:"TOTAL CLIENTS",   value:"248", sub:"+12% this month",       subColor:"#22C55E", icon:"👥" },
  { label:"SESSIONS TODAY",  value:"42",  sub:"Fully booked",          subColor:"#64748B", icon:"📅" },
  { label:"ACTIVE TRAINERS", value:"18",  sub:"On floor today",        subColor:"#64748B", icon:"🏋️" },
  { label:"TODAY MEMBERS",   value:"31",  sub:"4 check-ins pending",   subColor:"#F59E0B", icon:"✅" },
  { label:"ABSENT MEMBERS",  value:"2",   sub:"Not active for 3 days", subColor:"#EF4444", icon:"⚠️" },
];

const TIMES = ["06 AM","07 AM","08 AM","09 AM","10 AM","11 AM","12 PM","01 PM","02 PM"];
const ROW_H = 64;

// ── DAY VIEW data ─────────────────────────────────────────────────────────────
const DAY_TRAINERS = [
  { name:"Micle Clark", color:"#22C55E" },
  { name:"Sara Ahmed",  color:"#3B82F6" },
  { name:"Tom Reed",    color:"#8B5CF6" },
  { name:"Nina Paul",   color:"#EC4899" },
  { name:"James Fox",   color:"#F59E0B" },
  { name:"Lena Hart",   color:"#EF4444" },
  { name:"Alex Kim",    color:"#14B8A6" },
];
const DAY_COLS = ["SUN 27","MON 28","TUE 29","WED 1","THU 2","FRI 3","SAT 4"];
const DAY_EVENTS = [
  { col:0, row:1, h:1, title:"Semi Private",      time:"07–08 AM", color:"#DCFCE7", border:"#22C55E" },
  { col:1, row:3, h:1, title:"Group Classes",     time:"09–10 AM", color:"#FEF9C3", border:"#F59E0B" },
  { col:2, row:2, h:1, title:"Personal Training", time:"08–09 AM", color:"#FCE7F3", border:"#EC4899" },
  { col:3, row:4, h:1, title:"Personal Training", time:"10–11 AM", color:"#DBEAFE", border:"#3B82F6" },
  { col:4, row:1, h:1, title:"Semi Private",      time:"07–08 AM", color:"#DCFCE7", border:"#22C55E" },
  { col:6, row:6, h:1, title:"Leave",             time:"",         color:"#F1F5F9", border:"#94A3B8" },
];

// ── WEEK VIEW data ────────────────────────────────────────────────────────────
const WEEK_DAYS = [
  { day:"WED", date:"19", isToday:true  },
  { day:"THU", date:"20", isToday:false },
  { day:"FRI", date:"21", isToday:false },
  { day:"SAT", date:"22", isToday:false },
  { day:"SUN", date:"23", isToday:false },
  { day:"MON", date:"24", isToday:false },
];
const WEEK_EVENTS = [
  { day:0, startRow:1, endRow:2, time:"06–07 AM", color:"#DCFCE7", border:"#22C55E", trainers:8,  clients:7  },
  { day:0, startRow:2, endRow:3, time:"07–08 AM", color:"#FCE7F3", border:"#EC4899", trainers:3,  clients:3  },
  { day:0, startRow:4, endRow:5, time:"09–10 AM", color:"#FEF9C3", border:"#F59E0B", trainers:8,  clients:11 },
  { day:1, startRow:5, endRow:6, time:"11–12 AM", color:"#DBEAFE", border:"#3B82F6", trainers:6,  clients:14 },
  { day:1, startRow:6, endRow:7, time:"12–01 PM", color:"#DCFCE7", border:"#22C55E", trainers:3,  clients:7  },
  { day:2, startRow:3, endRow:8, time:"Leave",    color:"#F1F5F9", border:"#94A3B8", isLeave:true },
];

// ── MONTH VIEW data ───────────────────────────────────────────────────────────
const MONTH_DAYS_HEADER = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const generateMonthDays = () => {
  const days = [];
  // March 2025 starts on Saturday (offset=6)
  for(let i=0;i<6;i++) days.push({ day:null, events:[] });
  const monthEvents = {
    5:  [{ title:"Semi Private",   color:"#22C55E" }],
    8:  [{ title:"Group Class",    color:"#3B82F6" }],
    10: [{ title:"Personal Train", color:"#EC4899" }],
    12: [{ title:"Semi Private",   color:"#22C55E" }, { title:"Yoga",  color:"#8B5CF6" }],
    15: [{ title:"Group Class",    color:"#3B82F6" }],
    17: [{ title:"Personal Train", color:"#EC4899" }],
    19: [{ title:"Semi Private",   color:"#22C55E" }, { title:"HIIT",  color:"#F59E0B" }],
    22: [{ title:"Group Class",    color:"#3B82F6" }],
    24: [{ title:"Personal Train", color:"#EC4899" }],
    26: [{ title:"Semi Private",   color:"#22C55E" }],
    29: [{ title:"Group Class",    color:"#3B82F6" }],
  };
  for(let d=1;d<=31;d++) {
    days.push({ day:d, isToday:d===19, events: monthEvents[d]||[] });
  }
  return days;
};
const MONTH_DAYS = generateMonthDays();

// ── YEAR VIEW data ────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEAR_DATA = [
  { month:"Jan", sessions:180, members:210 },
  { month:"Feb", sessions:220, members:230 },
  { month:"Mar", sessions:195, members:248 },
  { month:"Apr", sessions:260, members:270 },
  { month:"May", sessions:240, members:265 },
  { month:"Jun", sessions:300, members:290 },
  { month:"Jul", sessions:280, members:310 },
  { month:"Aug", sessions:320, members:340 },
  { month:"Sep", sessions:290, members:325 },
  { month:"Oct", sessions:350, members:360 },
  { month:"Nov", sessions:330, members:355 },
  { month:"Dec", sessions:380, members:390 },
];

// ── BAR CHART ─────────────────────────────────────────────────────────────────
const BAR_DATA = [
  {day:"MON",h:55},{day:"TUE",h:38},{day:"WED",h:82},
  {day:"THU",h:68},{day:"FRI",h:48},{day:"SAT",h:28},{day:"SUN",h:22},
];

const PACKAGE_MEMBERS = [
  { name:"Tahsan",  sub:"Pilates Group Class", left:2, color:"#22C55E" },
  { name:"Daafhin", sub:"Group Class",         left:3, color:"#3B82F6" },
  { name:"Hasan",   sub:"Pilates Group Class", left:1, color:"#EF4444" },
];

const ATTENTION = [
  { name:"Sameed Quasem", role:"Premium Curator",  badge:"2 Class Left",  badgeC:"#F59E0B", pkg:"Semi-Private Group Class", total:24, autoRenew:true  },
  { name:"Samira Quasem", role:"Standard Plus",    badge:"5 Days Left",   badgeC:"#3B82F6", pkg:"Private Group Class",      total:12, autoRenew:false },
  { name:"Reyan Anis",    role:"Legacy Member",    badge:"Ends Today",    badgeC:"#EF4444", pkg:"Semi-Private Group Class", total:24, autoRenew:true  },
  { name:"Sahar Abdal",   role:"Enterprise Lead",  badge:"3 Days Left",   badgeC:"#F59E0B", pkg:"Pilates Group Class",      total:12, autoRenew:true  },
  { name:"Ashna Huq",     role:"Collector",        badge:"4 Days Left",   badgeC:"#3B82F6", pkg:"Pilates Group Class",      total:24, autoRenew:false },
  { name:"Naimul Bashar", role:"Business Partner", badge:"Expiring Now",  badgeC:"#EF4444", pkg:"Pilates Group Class",      total:12, autoRenew:false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, color, size=36 }) => {
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
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
    background:"#FFFFFF", borderRadius:14,
    border:"1px solid #E8ECF0",
    boxShadow:"0 1px 4px rgba(0,0,0,.04)", ...style,
  }}>{children}</div>
);

// ══════════════════════════════════════════════════════════════════════════════
// CALENDAR VIEWS
// ══════════════════════════════════════════════════════════════════════════════

function DayView() {
  return (
    <div style={{ overflowX:"auto" }}>
      <div style={{ minWidth:750 }}>
        {/* Trainer avatar header */}
        <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ width:72, flexShrink:0 }}/>
          {DAY_COLS.map((col, ci) => (
            <div key={col} style={{
              flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", padding:"10px 4px",
              borderLeft:`1px solid ${C.border}`,
              background: col.includes("WED") ? "#F0FDF4" : "transparent",
            }}>
              <Avatar name={DAY_TRAINERS[ci]?.name||"T"}
                color={DAY_TRAINERS[ci]?.color||C.tl} size={30}/>
              <div style={{ fontSize:10, color:C.tm, marginTop:4,
                fontWeight:500, textAlign:"center" }}>
                {DAY_TRAINERS[ci]?.name?.split(" ")[0]||"—"}</div>
              <div style={{ fontSize:9, color:C.tl }}>Total Clients</div>
              <div style={{ fontSize:11, fontWeight:700,
                color: col.includes("WED") ? C.acc : C.tm }}>
                {col}</div>
            </div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display:"flex" }}>
          <div style={{ width:72, flexShrink:0 }}>
            {TIMES.map(t => (
              <div key={t} style={{
                height:ROW_H, display:"flex", alignItems:"flex-start",
                justifyContent:"flex-end", padding:"6px 10px 0 0",
                fontSize:11, color:C.tl, borderBottom:`1px solid ${C.border}`,
              }}>{t}</div>
            ))}
          </div>
          {DAY_COLS.map((col, ci) => (
            <div key={col} style={{
              flex:1, position:"relative",
              borderLeft:`1px solid ${C.border}`,
              background: col.includes("WED") ? "rgba(240,253,244,.25)" : "transparent",
            }}>
              {TIMES.map((_,ri) => (
                <div key={ri} style={{ height:ROW_H,
                  borderBottom:`1px solid ${C.border}` }}/>
              ))}
              {DAY_EVENTS.filter(e=>e.col===ci).map((ev,ei) => (
                <div key={ei} style={{
                  position:"absolute", top:ev.row*ROW_H+3,
                  height:ev.h*ROW_H-6, left:3, right:3,
                  background:ev.color, border:`1.5px solid ${ev.border}`,
                  borderRadius:9, padding:"5px 8px", cursor:"pointer",
                  overflow:"hidden",
                }}>
                  <div style={{ fontSize:11, fontWeight:700,
                    color:C.dark }}>{ev.title}</div>
                  {ev.time && (
                    <div style={{ fontSize:10, color:C.tm }}>{ev.time}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekView() {
  return (
    <div style={{ overflowX:"auto" }}>
      <div style={{ minWidth:650 }}>
        {/* Day headers */}
        <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ width:72, flexShrink:0 }}/>
          {WEEK_DAYS.map(d => (
            <div key={d.day} style={{
              flex:1, textAlign:"center", padding:"10px 0",
              background: d.isToday ? "#F0FDF4" : "transparent",
              borderLeft:`1px solid ${C.border}`,
            }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase",
                color: d.isToday ? C.acc : C.tm }}>{d.day}</div>
              <div style={{ fontSize:22, fontWeight:800,
                color: d.isToday ? C.acc : C.dark, lineHeight:1.2 }}>{d.date}</div>
              {d.isToday && (
                <div style={{ display:"inline-block", background:C.red,
                  color:"#fff", fontSize:9, fontWeight:700,
                  padding:"2px 6px", borderRadius:4, marginTop:2,
                }}>10:12 AM</div>
              )}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display:"flex" }}>
          <div style={{ width:72, flexShrink:0 }}>
            {TIMES.map(t => (
              <div key={t} style={{
                height:ROW_H, display:"flex", alignItems:"flex-start",
                justifyContent:"flex-end", padding:"6px 10px 0 0",
                fontSize:11, color:C.tl, borderBottom:`1px solid ${C.border}`,
              }}>{t}</div>
            ))}
          </div>
          {WEEK_DAYS.map((d, di) => (
            <div key={d.day} style={{
              flex:1, position:"relative",
              borderLeft:`1px solid ${C.border}`,
              background: d.isToday ? "rgba(240,253,244,.3)" : "transparent",
            }}>
              {TIMES.map((_,ri) => (
                <div key={ri} style={{ height:ROW_H,
                  borderBottom:`1px solid ${C.border}` }}/>
              ))}
              {WEEK_EVENTS.filter(e=>e.day===di).map((ev,ei) => (
                <div key={ei} style={{
                  position:"absolute",
                  top:ev.startRow*ROW_H+3,
                  height:(ev.endRow-ev.startRow)*ROW_H-6,
                  left:4, right:4,
                  background:ev.color, border:`1.5px solid ${ev.border}`,
                  borderRadius:10, padding:"6px 8px",
                  cursor:"pointer", overflow:"hidden",
                }}>
                  {ev.isLeave ? (
                    <div style={{ fontSize:12, color:C.tm,
                      fontWeight:600, marginTop:12 }}>Leave</div>
                  ) : (
                    <>
                      <div style={{ fontSize:10, color:C.tm,
                        marginBottom:4 }}>{ev.time}</div>
                      <div style={{ display:"flex", gap:6 }}>
                        <div style={{ flex:1, background:"rgba(255,255,255,.75)",
                          borderRadius:7, padding:"3px 5px", textAlign:"center" }}>
                          <div style={{ fontSize:9, color:C.tm }}>Trainers</div>
                          <div style={{ fontSize:16, fontWeight:800,
                            color:C.dark }}>{ev.trainers}</div>
                        </div>
                        <div style={{ flex:1, background:"rgba(255,255,255,.75)",
                          borderRadius:7, padding:"3px 5px", textAlign:"center" }}>
                          <div style={{ fontSize:9, color:C.tm }}>Clients</div>
                          <div style={{ fontSize:16, fontWeight:800,
                            color:C.dark }}>{ev.clients}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthView() {
  return (
    <div style={{ padding:"0 4px 8px" }}>
      {/* Day headers */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)",
        borderBottom:`1px solid ${C.border}`, marginBottom:0 }}>
        {MONTH_DAYS_HEADER.map(d => (
          <div key={d} style={{ textAlign:"center", padding:"10px 0",
            fontSize:12, fontWeight:700, color:C.tm,
            textTransform:"uppercase", letterSpacing:".05em" }}>{d}</div>
        ))}
      </div>
      {/* Days grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
        {MONTH_DAYS.map((d, i) => (
          <div key={i} style={{
            minHeight:90, padding:"6px 8px",
            border:`1px solid ${C.border}`,
            borderTop:"none",
            background: d.isToday ? "#F0FDF4" : d.day ? "#fff" : "#FAFAFA",
            marginLeft: i%7===0 ? 0 : -1,
          }}>
            {d.day && (
              <>
                <div style={{
                  width:26, height:26, borderRadius:"50%",
                  background: d.isToday ? C.acc : "transparent",
                  display:"flex", alignItems:"center",
                  justifyContent:"center", marginBottom:4,
                  fontSize:13, fontWeight: d.isToday ? 700 : 500,
                  color: d.isToday ? "#fff" : C.dark,
                }}>{d.day}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {d.events.map((ev,ei) => (
                    <div key={ei} style={{
                      background:ev.color+"22", color:ev.color,
                      fontSize:9, fontWeight:600, padding:"2px 5px",
                      borderRadius:4, border:`1px solid ${ev.color}44`,
                      overflow:"hidden", textOverflow:"ellipsis",
                      whiteSpace:"nowrap", cursor:"pointer",
                    }}>{ev.title}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function YearView() {
  const maxVal = 400;
  return (
    <div style={{ padding:"20px 16px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:14 }}>
        {YEAR_DATA.map((m, mi) => {
          const monthDays = [31,28,31,30,31,30,31,31,30,31,30,31];
          const days = [];
          for(let d=0;d<monthDays[mi];d++) {
            const intensity = Math.random();
            days.push(intensity > 0.7 ? C.acc
              : intensity > 0.5 ? "#86EFAC"
              : intensity > 0.3 ? "#D1FAE5"
              : "#F0FDF4");
          }
          return (
            <Card key={m.month} style={{ padding:"14px" }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.dark,
                marginBottom:10 }}>{m.month}</div>
              {/* Mini heatmap */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:2,
                marginBottom:10 }}>
                {days.map((color,di) => (
                  <div key={di} style={{
                    width:9, height:9, borderRadius:2, background:color,
                    cursor:"pointer",
                  }}/>
                ))}
              </div>
              {/* Stats */}
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:10, color:C.tl }}>Sessions</div>
                  <div style={{ fontSize:15, fontWeight:800,
                    color:C.acc }}>{m.sessions}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:C.tl }}>Members</div>
                  <div style={{ fontSize:15, fontWeight:800,
                    color:C.dark }}>{m.members}</div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop:8, height:4, background:"#E8ECF0",
                borderRadius:2, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:2,
                  background:C.acc,
                  width:`${(m.sessions/maxVal)*100}%`,
                  transition:"width .5s",
                }}/>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]             = useState(null);
  const [activeNav, setActiveNav]   = useState("Dashboard");
  const [calView, setCalView]       = useState("Week");
  const [memberTab, setMemberTab]   = useState("Monthly");
  const [chartRange, setChartRange] = useState("Weekly");

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

  const renderCalendar = () => {
    switch(calView) {
      case "Day":   return <DayView />;
      case "Week":  return <WeekView />;
      case "Month": return <MonthView />;
      case "Year":  return <YearView />;
      default:      return <WeekView />;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg,
      fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.dark }}>

      {/* TOP NAV */}
      <nav style={{
        background:C.nav, height:54, display:"flex", alignItems:"center",
        padding:"0 24px", position:"sticky", top:0, zIndex:200,
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
            cursor:"pointer" }} onClick={logout}>
            <Avatar name={user?.fullName||"U"} color={C.acc} size={32}/>
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
        boxShadow:"0 1px 4px rgba(0,0,0,.04)",
      }}>
        {NAV_ITEMS.map(({ label, icon }) => {
          const active = label === activeNav;
          return (
            <button key={label} onClick={() => { setActiveNav(label); if(label==="Trainers") navigate("/trainers"); if(label==="Packages") navigate("/packages"); if(label==="Members") navigate("/members"); }} style={{
              background:"none", border:"none", cursor:"pointer",
              padding:"13px 16px", fontSize:13,
              fontWeight: active ? 700 : 500,
              color: active ? C.acc : C.tm,
              borderBottom: active
                ? `2.5px solid ${C.acc}`
                : "2.5px solid transparent",
              fontFamily:"inherit", display:"flex",
              alignItems:"center", gap:5,
            }}>
              <span style={{ fontSize:14 }}>{icon}</span> {label}
            </button>
          );
        })}
      </div>

      {/* BODY */}
      <div style={{ padding:"20px 24px", maxWidth:1320, margin:"0 auto" }}>

        {/* STATS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)",
          gap:14, marginBottom:20 }}>
          {STATS.map(s => (
            <Card key={s.label} style={{ padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"flex-start" }}>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, letterSpacing:".1em",
                    textTransform:"uppercase", color:C.tl, marginBottom:6 }}>
                    {s.label}</p>
                  <div style={{ fontSize:34, fontWeight:800, color:C.dark,
                    fontFamily:"Georgia,serif", lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:12, color:s.subColor,
                    marginTop:6, fontWeight:500 }}>{s.sub}</div>
                </div>
                <span style={{ fontSize:22, opacity:.55 }}>{s.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* TRAINER CALENDAR CARD */}
        <Card style={{ marginBottom:20, overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:C.dark }}>Trainers</div>
              <div style={{ fontSize:12, color:C.tl }}>19 March, Thursday</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <button style={{
                background:C.acc, color:"#fff", border:"none",
                borderRadius:8, padding:"7px 18px", cursor:"pointer",
                fontSize:13, fontWeight:600, fontFamily:"inherit",
              }}>+ Add New</button>

              {/* ✅ View toggle buttons — clicking changes the calendar */}
              <div style={{ display:"flex", background:"#F1F5F9",
                borderRadius:8, padding:3, gap:2 }}>
                {["Day","Week","Month","Year"].map(v => (
                  <button key={v} onClick={() => setCalView(v)} style={{
                    background: calView===v ? C.dark : "transparent",
                    color: calView===v ? "#fff" : C.tm,
                    border:"none", borderRadius:6,
                    padding:"5px 14px", cursor:"pointer",
                    fontSize:12, fontFamily:"inherit", fontWeight:500,
                    transition:"all .18s",
                  }}>{v}</button>
                ))}
              </div>

              <select style={{
                border:`1px solid ${C.border}`, borderRadius:7,
                padding:"5px 10px", fontSize:12, color:C.tm,
                background:C.card, cursor:"pointer", outline:"none",
              }}>
                <option>All Instructors</option>
              </select>
            </div>
          </div>

          {/* Dynamic calendar view */}
          <div style={{ minHeight:200 }}>
            {renderCalendar()}
          </div>

          {/* FAB */}
          <div style={{ display:"flex", justifyContent:"flex-end",
            padding:"14px 20px" }}>
            <button style={{
              width:46, height:46, borderRadius:"50%",
              background:C.acc, color:"#fff", border:"none",
              fontSize:24, cursor:"pointer",
              boxShadow:`0 4px 14px rgba(26,107,74,.4)`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>+</button>
          </div>
        </Card>

        {/* MIDDLE ROW */}
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr",
          gap:16, marginBottom:20 }}>

          {/* Member Overview */}
          <Card style={{ padding:"18px" }}>
            <div style={{ fontWeight:700, fontSize:15, color:C.dark,
              marginBottom:2 }}>Member Overview</div>
            <div style={{ fontSize:12, color:C.tl, marginBottom:14 }}>
              Managing subscription expirations and package health.</div>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {["Monthly","Weekly"].map(t => (
                <button key={t} onClick={() => setMemberTab(t)} style={{
                  background: memberTab===t ? "#F0FDF4" : "transparent",
                  color: memberTab===t ? C.acc : C.tm,
                  border: memberTab===t
                    ? `1px solid ${C.acc2}` : `1px solid ${C.border}`,
                  borderRadius:20, padding:"4px 14px", cursor:"pointer",
                  fontSize:12, fontWeight:600, fontFamily:"inherit",
                }}>{t}</button>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between",
              marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:700,
                color:C.dark }}>Package Ending</span>
              <span style={{ fontSize:12, color:C.acc,
                cursor:"pointer", fontWeight:600 }}>View All</span>
            </div>
            {PACKAGE_MEMBERS.map((m,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center",
                gap:10, padding:"10px 0",
                borderBottom: i<PACKAGE_MEMBERS.length-1
                  ? `1px solid ${C.border}` : "none" }}>
                <Avatar name={m.name} color={m.color} size={36}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600,
                    color:C.dark }}>{m.name}</div>
                  <div style={{ fontSize:11, color:C.tl }}>{m.sub}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:16, fontWeight:800,
                    color: m.left===1 ? C.red : C.dark }}>{m.left}</div>
                  <div style={{ fontSize:10, color:C.tl }}>CLASS LEFT</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop:14, padding:"10px 12px",
              background:"#F8FAFC", borderRadius:10,
              border:`1px solid ${C.border}`,
              display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>🔔</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600,
                  color:C.dark }}>Notification Reminders</div>
                <div style={{ fontSize:11, color:C.tl }}>
                  Alert members 5 days before expiration</div>
              </div>
              <div style={{ width:34, height:18, borderRadius:9,
                background:C.dark, cursor:"pointer", position:"relative" }}>
                <div style={{ width:14, height:14, borderRadius:"50%",
                  background:"#fff", position:"absolute", right:2, top:2 }}/>
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Card style={{ padding:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:14 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15,
                    color:C.dark }}>Members Counting</div>
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
                    }}>{r}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end",
                gap:8, height:110 }}>
                {BAR_DATA.map(b => (
                  <div key={b.day} style={{ flex:1, display:"flex",
                    flexDirection:"column", alignItems:"center", gap:4 }}>
                    {b.day==="WED" && (
                      <div style={{ fontSize:10, color:C.acc,
                        fontWeight:700 }}>+3 Members</div>
                    )}
                    <div style={{
                      width:"100%", borderRadius:"6px 6px 0 0",
                      background: b.day==="WED" ? C.acc : "#D1FAE5",
                      height:b.h*0.95,
                    }}/>
                    <div style={{ fontSize:11,
                      color: b.day==="WED" ? C.acc : C.tl,
                      fontWeight: b.day==="WED" ? 700 : 400,
                    }}>{b.day}</div>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{ display:"grid",
              gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              <Card style={{ padding:"16px" }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.dark,
                  marginBottom:12 }}>Payment Status</div>
                <div style={{ fontSize:11, color:C.tl, marginBottom:4 }}>
                  Due Payments</div>
                <div style={{ fontSize:22, fontWeight:800,
                  color:C.dark, marginBottom:2 }}>₹ 45,500</div>
                <div style={{ fontSize:12, color:C.red,
                  marginBottom:14, fontWeight:500 }}>12 invoices pending</div>
                <div style={{ height:1, background:C.border, marginBottom:14 }}/>
                <div style={{ fontSize:11, color:C.tl, marginBottom:4 }}>
                  Total Revenue</div>
                <div style={{ fontSize:20, fontWeight:800,
                  color:C.dark, marginBottom:4 }}>₹ 3,20,000</div>
                <div style={{ fontSize:12, color:C.acc2,
                  fontWeight:600 }}>↑ 22% from last month</div>
              </Card>

              <Card style={{ padding:"16px" }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.dark,
                  marginBottom:12 }}>Popular Classes</div>
                <div style={{ display:"flex", gap:12 }}>
                  {[
                    { name:"Bodybuilding", members:14, color:C.acc, emoji:"🏋️" },
                    { name:"Group Class",  members:28, color:C.blue, emoji:"👥" },
                  ].map(cls => (
                    <div key={cls.name} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ width:54, height:54, borderRadius:12,
                        background:cls.color, margin:"0 auto 8px",
                        display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:24,
                      }}>{cls.emoji}</div>
                      <div style={{ fontSize:12, fontWeight:600,
                        color:C.dark }}>{cls.name}</div>
                      <div style={{ fontSize:11, color:C.tl }}>
                        {cls.members} Members</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{ padding:"16px" }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.dark,
                  marginBottom:12 }}>Members Growth</div>
                <div style={{ display:"flex", alignItems:"flex-end",
                  gap:5, height:72 }}>
                  {[28,42,32,58,78,52,68,88].map((h,i) => (
                    <div key={i} style={{ flex:1, height:h*0.75,
                      background: i===7 ? C.acc : "#E2E8F0",
                      borderRadius:"3px 3px 0 0" }}/>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginTop:8 }}>
                  {["MAY","JUN","JUL","AUG","SEP","OCT"].map(m => (
                    <span key={m} style={{ fontSize:9, color:C.tl }}>{m}</span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* MEMBER ATTENTION */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:16,
              color:C.dark }}>Member Attention Needed</div>
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
                <div style={{ display:"flex", alignItems:"center",
                  gap:10, marginBottom:12 }}>
                  <Avatar name={m.name}
                    color={[C.acc,C.blue,C.purple,C.yellow,C.pink,C.red][i]}
                    size={42}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700,
                      color:C.dark }}>{m.name}</div>
                    <div style={{ fontSize:11, color:C.tl }}>{m.role}</div>
                  </div>
                  <div style={{
                    background:m.badgeC+"22", color:m.badgeC,
                    fontSize:10, fontWeight:700, padding:"3px 8px",
                    borderRadius:20, border:`1px solid ${m.badgeC}55`,
                    whiteSpace:"nowrap",
                  }}>{m.badge}</div>
                </div>
                <div style={{ height:1, background:C.border, marginBottom:10 }}/>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.tl }}>Package Tier</span>
                  <span style={{ fontSize:12, fontWeight:600, color:C.dark,
                    textAlign:"right", maxWidth:150 }}>{m.pkg}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between",
                  marginBottom:14 }}>
                  <span style={{ fontSize:12,
                    color:C.tl }}>Total Number of Classes</span>
                  <span style={{ fontSize:12, fontWeight:700,
                    color:C.dark }}>{m.total}</span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{ flex:1, padding:"8px 0",
                    border:`1px solid ${C.border}`, borderRadius:8,
                    background:"#fff", cursor:"pointer",
                    fontSize:12, fontWeight:600, color:C.dark,
                    fontFamily:"inherit" }}>Send Reminder</button>
                  <button style={{ flex:1, padding:"8px 0", border:"none",
                    borderRadius:8,
                    background: m.autoRenew ? C.dark : "#F1F5F9",
                    cursor:"pointer", fontSize:12, fontWeight:600,
                    color: m.autoRenew ? "#fff" : C.tm,
                    fontFamily:"inherit",
                  }}>
                    {m.autoRenew ? "Auto-Renew" : "Disable Auto-Renew"}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ textAlign:"center", marginTop:18 }}>
            <button style={{ background:"none", border:"none",
              cursor:"pointer", color:C.acc, fontSize:13,
              fontWeight:600, fontFamily:"inherit" }}>
              View All Expiring Packages ↓
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"16px 0",
          fontSize:12, color:C.tl, borderTop:`1px solid ${C.border}` }}>
          © 2026 FitManager Copyright and rights reserved
        </div>
      </div>
    </div>
  );
}
