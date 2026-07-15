
// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

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

const STATS = [
  { label:"TOTAL CLIENTS",   value:"248", sub:"+12% this month",       subColor:"#22C55E", icon:"👥" },
  { label:"SESSIONS TODAY",  value:"42",  sub:"Fully booked",          subColor:"#64748B", icon:"📅" },
  { label:"ACTIVE TRAINERS", value:"18",  sub:"On floor today",        subColor:"#64748B", icon:"🏋️" },
  { label:"TODAY MEMBERS",   value:"31",  sub:"4 check-ins pending",   subColor:"#F59E0B", icon:"✅" },
  { label:"ABSENT MEMBERS",  value:"2",   sub:"Not active for 3 days", subColor:"#EF4444", icon:"⚠️" },
];

const TIMES = ["06 AM","07 AM","08 AM","09 AM","10 AM","11 AM","12 PM","01 PM","02 PM",
  "03 PM","04 PM","05 PM","06 PM","07 PM","08 PM"];
const ROW_H = 64;
const CALENDAR_GRID_MAX_HEIGHT = 480;
const TODAY = new Date();

// Maps a "HH:MM" (24h) time input to the matching row in TIMES, clamped to the visible range.
const timeToRow = (hhmm) => {
  const hour = parseInt((hhmm || "").split(":")[0], 10);
  if (Number.isNaN(hour)) return 1;
  const period = hour < 12 ? "AM" : "PM";
  let h12 = hour % 12; if (h12 === 0) h12 = 12;
  const label = `${String(h12).padStart(2,"0")} ${period}`;
  const idx = TIMES.indexOf(label);
  if (idx !== -1) return idx;
  return hour < 6 ? 0 : TIMES.length - 1;
};

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
const WEEK_DAY_LABELS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const toISODate = (d) => {
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
};
const generateWeekDays = () => {
  const days = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() + i);
    days.push({ day: WEEK_DAY_LABELS[d.getDay()], date: String(d.getDate()), iso: toISODate(d), isToday: i === 0 });
  }
  return days;
};
const WEEK_DAYS = generateWeekDays();

// Converts a saved "Add Member" appointment into a WeekView-shaped event.
// Returns null if the appointment's date falls outside the currently visible week.
const appointmentToWeekEvent = (appt) => {
  const dayIndex = WEEK_DAYS.findIndex((d) => d.iso === appt.date);
  if (dayIndex === -1) return null;
  const startRow = timeToRow(appt.time);
  const [hh, mm] = (appt.time || "00:00").split(":").map(Number);
  const displayTime = new Date(2000, 0, 1, hh, mm).toLocaleTimeString("en-US",
    { hour:"numeric", minute:"2-digit" });
  return {
    id: `appt-${appt.id}`,
    day: dayIndex, startRow, endRow: startRow + 1,
    time: displayTime, color:"#DBEAFE", border:"#3B82F6",
    trainers: 1, clients: appt.members?.length || 0,
  };
};
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
const CURRENT_MONTH_LABEL = TODAY.toLocaleDateString("en-US", { month:"long", year:"numeric" });

const generateMonthDays = () => {
  const days = [];
  const year = TODAY.getFullYear();
  const month = TODAY.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++) days.push({ day:null, events:[] });

  // Illustrative sample sessions sprinkled across the real days of the current month
  const sampleEvents = [
    { title:"Semi Private",   color:"#22C55E" },
    { title:"Group Class",    color:"#3B82F6" },
    { title:"Personal Train", color:"#EC4899" },
    { title:"Yoga",           color:"#8B5CF6" },
    { title:"HIIT",           color:"#F59E0B" },
  ];
  for (let d = 1; d <= daysInMonth; d++) {
    const events = d % 3 === 0 ? [sampleEvents[d % sampleEvents.length]] : [];
    days.push({ day:d, isToday: d === TODAY.getDate(), events });
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
const BAR_DATA_BY_RANGE = {
  Day: [
    {day:"6 AM",h:20},{day:"9 AM",h:58},{day:"12 PM",h:70},
    {day:"3 PM",h:45},{day:"6 PM",h:82},{day:"9 PM",h:34},
  ],
  Weekly: [
    {day:"MON",h:55},{day:"TUE",h:38},{day:"WED",h:82},
    {day:"THU",h:68},{day:"FRI",h:48},{day:"SAT",h:28},{day:"SUN",h:22},
  ],
  Monthly: [
    {day:"WEEK 1",h:60},{day:"WEEK 2",h:78},{day:"WEEK 3",h:52},{day:"WEEK 4",h:88},
  ],
};

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

function DayView({ events, onEventClick }) {
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
        {/* Grid — scrolls vertically so extended hours don't push the whole page down */}
        <div style={{ maxHeight:CALENDAR_GRID_MAX_HEIGHT, overflowY:"auto" }}>
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
              {events.filter(e=>e.col===ci).map((ev) => (
                <div key={ev.id} onClick={() => onEventClick(ev)} style={{
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
    </div>
  );
}

function WeekView({ events, onEventClick }) {
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
                }}>{TODAY.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" })}</div>
              )}
            </div>
          ))}
        </div>
        {/* Grid — scrolls vertically so extended hours don't push the whole page down */}
        <div style={{ maxHeight:CALENDAR_GRID_MAX_HEIGHT, overflowY:"auto" }}>
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
              {events.filter(e=>e.day===di).map((ev) => (
                <div key={ev.id} onClick={() => onEventClick(ev)} style={{
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
    </div>
  );
}

function MonthView() {
  return (
    <div style={{ padding:"0 4px 8px" }}>
      <div style={{ fontWeight:700, fontSize:15, color:C.dark, padding:"8px 4px 14px" }}>
        {CURRENT_MONTH_LABEL}</div>
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
// ADD APPOINTMENT MODAL
// ══════════════════════════════════════════════════════════════════════════════
const APPT_KEY = "fm_appointments";
const loadAppointments = () => {
  try {
    const s = localStorage.getItem(APPT_KEY);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return [];
};
const saveAppointments = (list) => {
  try { localStorage.setItem(APPT_KEY, JSON.stringify(list)); } catch (e) {}
};

const memberSince = (createdAt) => {
  if (!createdAt) return "Member";
  return `Member since ${new Date(createdAt).getFullYear()}`;
};

function AddAppointmentModal({ onClose, onCreated }) {
  const [category, setCategory] = useState("Personal Training");
  const [sessionType, setSessionType] = useState("Private");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("Does not repeat");

  const [trainerSearch, setTrainerSearch] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  const [notifyClient, setNotifyClient] = useState(true);
  const [notifyClientChannels, setNotifyClientChannels] = useState(["WHATSAPP"]);
  const [notifyTrainer, setNotifyTrainer] = useState(false);
  const [notifyTrainerChannels, setNotifyTrainerChannels] = useState([]);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // TrainerPage.jsx keeps its trainers in localStorage rather than the
    // real backend — read the same list here so the picker matches what's
    // actually shown on the Trainers page.
    let list = [];
    try {
      const s = localStorage.getItem("fm_trainers");
      if (s) list = JSON.parse(s);
    } catch (e) {}
    const q = trainerSearch.trim().toLowerCase();
    const filtered = q
      ? list.filter((t) =>
          t.name?.toLowerCase().includes(q) || t.role?.toLowerCase().includes(q))
      : list;
    setTrainers(filtered);
  }, [trainerSearch]);

  useEffect(() => {
    if (!showMemberSearch) return;
    let cancelled = false;
    api.get("/members", { params: { search: memberSearch, limit: 8 } })
      .then((res) => { if (!cancelled) setMemberResults(res.data.data || []); })
      .catch(() => { if (!cancelled) setMemberResults([]); });
    return () => { cancelled = true; };
  }, [memberSearch, showMemberSearch]);

  const isSelected = (m) => selectedMembers.some((x) => x.id === m.id);

  const toggleMember = (m) => {
    setSelectedMembers((prev) => {
      if (prev.some((x) => x.id === m.id)) return prev.filter((x) => x.id !== m.id);
      if (prev.length >= 12) return prev;
      return [...prev, m];
    });
  };

  const toggleChannel = (channels, setChannels, ch) => {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  const handleSubmit = () => {
    if (!selectedTrainer) return setError("Please select a trainer.");
    if (selectedMembers.length === 0) return setError("Please add at least one member.");
    if (!date || !time) return setError("Please choose a date and time.");
    setError("");

    const appt = {
      id: Date.now(),
      category, sessionType, date, time, repeat,
      trainer: { id: selectedTrainer.id, name: selectedTrainer.name },
      members: selectedMembers.map((m) => ({ id: m.id, name: `${m.firstName} ${m.lastName}` })),
      notifyClient, notifyClientChannels,
      notifyTrainer, notifyTrainerChannels,
      createdAt: new Date().toISOString(),
    };
    saveAppointments([...loadAppointments(), appt]);
    onCreated?.(appt);
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  const segStyle = (active) => ({
    flex:1, padding:"10px", textAlign:"center", borderRadius:9, cursor:"pointer",
    fontSize:13, fontWeight:600, fontFamily:"inherit", border:"none",
    background: active ? "#fff" : "transparent",
    color: active ? C.dark : C.tm,
    boxShadow: active ? "0 1px 4px rgba(0,0,0,.08)" : "none",
  });

  const channelPill = (active) => ({
    padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
    border:`1px solid ${active ? C.acc : C.border}`,
    background: active ? "#DCFCE7" : "#fff",
    color: active ? "#15803D" : C.tm,
  });

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:20,
    }}>
      <div style={{
        background:"#fff", borderRadius:16, width:"100%", maxWidth:560,
        maxHeight:"90vh", overflowY:"auto", padding:28,
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h2 style={{ fontSize:22, fontFamily:"Georgia,serif", color:C.dark, margin:0 }}>
              Add Member</h2>
            <p style={{ fontSize:12, color:C.tm, marginTop:4 }}>Create your studio schedule</p>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:"50%", border:`1px solid ${C.border}`,
            background:"#fff", cursor:"pointer", fontSize:15, color:C.tm,
          }}>✕</button>
        </div>

        <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
          textTransform:"uppercase", color:C.tl, margin:"20px 0 8px" }}>Service Category</p>
        <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:11, padding:4 }}>
          {["Personal Training","Group Class"].map((c) => (
            <button key={c} onClick={() => setCategory(c)} style={segStyle(category === c)}>{c}</button>
          ))}
        </div>

        <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
          textTransform:"uppercase", color:C.tl, margin:"20px 0 8px" }}>Session Type</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { key:"Private", label:"Private Sessions" },
            { key:"Semi-Private", label:"Semi-Private Sessions" },
          ].map((s) => {
            const active = sessionType === s.key;
            return (
              <div key={s.key} onClick={() => setSessionType(s.key)} style={{
                border:`1.5px solid ${active ? C.acc : C.border}`,
                background: active ? "#F0FDF4" : "#fff",
                borderRadius:12, padding:14, cursor:"pointer",
              }}>
                <div style={{ fontSize:18, marginBottom:8 }}>👥</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.dark }}>{s.label}</div>
                <div style={{ fontSize:11, color:C.tl, marginTop:2 }}>60 Minutes</div>
              </div>
            );
          })}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:20 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
              textTransform:"uppercase", color:C.tl, marginBottom:8 }}>Date</p>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{
              width:"100%", border:`1px solid ${C.border}`, borderRadius:10,
              padding:"10px 12px", fontSize:13, fontFamily:"inherit", color:C.dark,
            }}/>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
              textTransform:"uppercase", color:C.tl, marginBottom:8 }}>Time</p>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{
              width:"100%", border:`1px solid ${C.border}`, borderRadius:10,
              padding:"10px 12px", fontSize:13, fontFamily:"inherit", color:C.dark,
            }}/>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          margin:"20px 0 8px" }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
            textTransform:"uppercase", color:C.tl, margin:0 }}>Select Trainer</p>
        </div>
        <input placeholder="Search by name or specialty" value={trainerSearch}
          onChange={(e) => setTrainerSearch(e.target.value)} style={{
            width:"100%", border:`1px solid ${C.border}`, borderRadius:10,
            padding:"10px 12px", fontSize:13, fontFamily:"inherit", marginBottom:12,
          }}/>
        <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:4 }}>
          {trainers.map((t) => {
            const active = selectedTrainer?.id === t.id;
            return (
              <div key={t.id} onClick={() => setSelectedTrainer(t)} style={{
                flexShrink:0, width:100, textAlign:"center", cursor:"pointer",
                border:`1.5px solid ${active ? C.acc : "transparent"}`,
                borderRadius:12, padding:8,
              }}>
                <Avatar name={t.name} color={active ? C.acc : C.purple} size={52}/>
                <div style={{ fontSize:12, fontWeight:700, color:C.dark, marginTop:6 }}>{t.name}</div>
                <div style={{ fontSize:10, color:C.tl }}>{t.role}</div>
              </div>
            );
          })}
          {trainers.length === 0 && (
            <div style={{ fontSize:12, color:C.tl, padding:"8px 0" }}>No trainers found.</div>
          )}
        </div>

        <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
          textTransform:"uppercase", color:C.tl, margin:"20px 0 8px" }}>Repeat</p>
        <select value={repeat} onChange={(e) => setRepeat(e.target.value)} style={{
          width:"100%", border:`1px solid ${C.border}`, borderRadius:10,
          padding:"10px 12px", fontSize:13, fontFamily:"inherit", cursor:"pointer", color:C.dark,
        }}>
          {["Does not repeat","Daily","Weekly","Monthly"].map((r) => <option key={r}>{r}</option>)}
        </select>

        <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
          textTransform:"uppercase", color:C.tl, margin:"20px 0 8px" }}>
          Member ({selectedMembers.length}/12)</p>
        {selectedMembers.map((m) => (
          <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10,
            padding:"9px 10px", background:C.bg, borderRadius:10, marginBottom:6 }}>
            <Avatar name={`${m.firstName} ${m.lastName}`} color={C.blue} size={32}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.dark }}>
                {m.firstName} {m.lastName}</div>
              <div style={{ fontSize:10, color:C.tl }}>{memberSince(m.createdAt)}</div>
            </div>
            <span onClick={() => toggleMember(m)} style={{
              width:22, height:22, borderRadius:"50%", background:C.acc2,
              color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, cursor:"pointer",
            }}>✓</span>
          </div>
        ))}

        {showMemberSearch ? (
          <>
            <input placeholder="Search members by name" value={memberSearch} autoFocus
              onChange={(e) => setMemberSearch(e.target.value)} style={{
                width:"100%", border:`1px solid ${C.border}`, borderRadius:10,
                padding:"10px 12px", fontSize:13, fontFamily:"inherit", marginBottom:8,
              }}/>
            {memberResults.map((m) => (
              <div key={m.id} onClick={() => toggleMember(m)} style={{
                display:"flex", alignItems:"center", gap:10, padding:"9px 10px",
                borderRadius:10, cursor:"pointer",
                background: isSelected(m) ? "#F0FDF4" : "transparent",
              }}>
                <Avatar name={`${m.firstName} ${m.lastName}`} color={C.blue} size={32}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.dark }}>
                    {m.firstName} {m.lastName}</div>
                  <div style={{ fontSize:10, color:C.tl }}>{memberSince(m.createdAt)}</div>
                </div>
                {isSelected(m) && <span style={{ color:C.acc, fontWeight:700 }}>✓</span>}
              </div>
            ))}
          </>
        ) : (
          <div onClick={() => setShowMemberSearch(true)} style={{
            border:`1.5px dashed ${C.border}`, borderRadius:10, padding:"11px",
            textAlign:"center", fontSize:12, fontWeight:600, color:C.tm, cursor:"pointer",
          }}>👤➕ Add more clients</div>
        )}

        <p style={{ fontSize:13, fontWeight:700, color:C.dark,
          margin:"24px 0 12px" }}>🔔 Notification Preferences</p>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          marginBottom:8 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.dark }}>Send Notification to Client</div>
            <div style={{ fontSize:11, color:C.tl, marginTop:2 }}>
              Confirm booking immediately via chosen channels.</div>
          </div>
          <div onClick={() => setNotifyClient((v) => !v)} style={{
            width:36, height:20, borderRadius:10, cursor:"pointer", flexShrink:0,
            background: notifyClient ? C.acc : "#CBD5E1", position:"relative",
          }}>
            <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff",
              position:"absolute", top:2, left: notifyClient ? 18 : 2, transition:"left .15s" }}/>
          </div>
        </div>
        {notifyClient && (
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["WHATSAPP","EMAIL"].map((ch) => (
              <span key={ch} onClick={() => toggleChannel(notifyClientChannels, setNotifyClientChannels, ch)}
                style={channelPill(notifyClientChannels.includes(ch))}>{ch}</span>
            ))}
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          marginBottom:8 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.dark }}>Send Notification to Trainer</div>
            <div style={{ fontSize:11, color:C.tl, marginTop:2 }}>
              Alert the assigned trainer about this new session.</div>
          </div>
          <div onClick={() => setNotifyTrainer((v) => !v)} style={{
            width:36, height:20, borderRadius:10, cursor:"pointer", flexShrink:0,
            background: notifyTrainer ? C.acc : "#CBD5E1", position:"relative",
          }}>
            <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff",
              position:"absolute", top:2, left: notifyTrainer ? 18 : 2, transition:"left .15s" }}/>
          </div>
        </div>
        {notifyTrainer && (
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            {["WHATSAPP","EMAIL"].map((ch) => (
              <span key={ch} onClick={() => toggleChannel(notifyTrainerChannels, setNotifyTrainerChannels, ch)}
                style={channelPill(notifyTrainerChannels.includes(ch))}>{ch}</span>
            ))}
          </div>
        )}
        <p style={{ fontSize:10, color:C.tl, marginTop:4 }}>
          Note: no messaging service is connected yet — this won't actually send anything.</p>

        {error && (
          <p style={{ fontSize:12, color:C.red, fontWeight:600, marginTop:14 }}>{error}</p>
        )}
        {saved && (
          <p style={{ fontSize:12, color:"#15803D", fontWeight:600, marginTop:14 }}>
            ✓ Appointment saved.</p>
        )}

        <button onClick={handleSubmit} style={{
          width:"100%", marginTop:18, padding:"13px", background:C.acc, color:"#fff",
          border:"none", borderRadius:11, fontWeight:700, fontSize:14, cursor:"pointer",
          fontFamily:"inherit",
        }}>Add Appointment</button>
        <div onClick={onClose} style={{
          textAlign:"center", marginTop:12, fontSize:12, fontWeight:700,
          color:C.tm, cursor:"pointer",
        }}>CANCEL</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT SESSION MODAL
// ══════════════════════════════════════════════════════════════════════════════
function EditSessionModal({ event, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: event.title || "",
    time: event.time || "",
    trainers: event.trainers ?? "",
    clients: event.clients ?? "",
  });

  const fieldStyle = {
    width:"100%", border:`1px solid ${C.border}`, borderRadius:10,
    padding:"10px 12px", fontSize:13, fontFamily:"inherit", color:C.dark,
  };

  const handleSave = () => {
    const updated = { ...event, ...form };
    if (event.trainers !== undefined) updated.trainers = Number(form.trainers) || 0;
    if (event.clients !== undefined) updated.clients = Number(form.clients) || 0;
    onSave(updated);
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:20,
    }}>
      <div style={{
        background:"#fff", borderRadius:16, width:"100%", maxWidth:420,
        padding:26, fontFamily:"'DM Sans',sans-serif",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <h2 style={{ fontSize:19, fontFamily:"Georgia,serif", color:C.dark, margin:0 }}>
            Edit Session</h2>
          <button onClick={onClose} style={{
            width:30, height:30, borderRadius:"50%", border:`1px solid ${C.border}`,
            background:"#fff", cursor:"pointer", fontSize:14, color:C.tm,
          }}>✕</button>
        </div>

        {event.title !== undefined && (
          <div style={{ marginTop:18 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
              textTransform:"uppercase", color:C.tl, marginBottom:8 }}>Title</p>
            <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title:e.target.value }))}
              style={fieldStyle}/>
          </div>
        )}

        <div style={{ marginTop:16 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
            textTransform:"uppercase", color:C.tl, marginBottom:8 }}>Time</p>
          <input value={form.time} onChange={(e) => setForm(f => ({ ...f, time:e.target.value }))}
            placeholder="e.g. 07–08 AM" style={fieldStyle}/>
        </div>

        {event.trainers !== undefined && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
                textTransform:"uppercase", color:C.tl, marginBottom:8 }}>Trainers</p>
              <input type="number" min="0" value={form.trainers}
                onChange={(e) => setForm(f => ({ ...f, trainers:e.target.value }))} style={fieldStyle}/>
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:".08em",
                textTransform:"uppercase", color:C.tl, marginBottom:8 }}>Clients</p>
              <input type="number" min="0" value={form.clients}
                onChange={(e) => setForm(f => ({ ...f, clients:e.target.value }))} style={fieldStyle}/>
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:24 }}>
          <button onClick={() => onDelete(event)} style={{
            padding:"11px 16px", background:"#FEF2F2", color:C.red, border:"none",
            borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit",
          }}>Delete</button>
          <button onClick={handleSave} style={{
            flex:1, padding:"11px", background:C.acc, color:"#fff", border:"none",
            borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"inherit",
          }}>Save Changes</button>
        </div>
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifTab, setNotifTab] = useState("week");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllStub, setShowAllStub] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [remindersOn, setRemindersOn] = useState(true);
  const [attention, setAttention] = useState(ATTENTION);
  const [sentReminders, setSentReminders] = useState({});
  const [attentionFilter, setAttentionFilter] = useState("All Members");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const toggleAutoRenew = (name) => {
    setAttention((prev) => prev.map((m) => m.name === name ? { ...m, autoRenew: !m.autoRenew } : m));
  };

  const sendReminder = (name) => {
    setSentReminders((prev) => ({ ...prev, [name]: true }));
    setTimeout(() => setSentReminders((prev) => ({ ...prev, [name]: false })), 2000);
  };

  const ATTENTION_FILTERS = ["All Members", "Auto-Renew Only", "Manual Renew Only", "Urgent"];
  const filteredAttention = attention.filter((m) => {
    if (attentionFilter === "Auto-Renew Only") return m.autoRenew;
    if (attentionFilter === "Manual Renew Only") return !m.autoRenew;
    if (attentionFilter === "Urgent") return m.badge === "Ends Today" || m.badge === "Expiring Now";
    return true;
  });
  const [selectedInstructor, setSelectedInstructor] = useState("All Instructors");
  const [dayEvents, setDayEvents] = useState(() => DAY_EVENTS.map((e, i) => ({ ...e, id:`day-${i}` })));
  const [weekEvents, setWeekEvents] = useState(() => WEEK_EVENTS.map((e, i) => ({ ...e, id:`week-${i}` })));
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingEventSource, setEditingEventSource] = useState(null);

  const openEventEditor = (source) => (ev) => {
    setEditingEvent(ev);
    setEditingEventSource(source);
  };
  const closeEventEditor = () => { setEditingEvent(null); setEditingEventSource(null); };
  const saveEvent = (updated) => {
    const setter = editingEventSource === "day" ? setDayEvents : setWeekEvents;
    setter((prev) => prev.map((e) => e.id === updated.id ? updated : e));
    closeEventEditor();
  };
  const deleteEvent = (ev) => {
    const setter = editingEventSource === "day" ? setDayEvents : setWeekEvents;
    setter((prev) => prev.filter((e) => e.id !== ev.id));
    closeEventEditor();
  };

  // Adds one saved "Add Member" appointment onto the calendar if its date falls
  // within the currently visible week; skips it (silently) otherwise.
  const addAppointmentToCalendar = (appt) => {
    const ev = appointmentToWeekEvent(appt);
    if (ev) {
      setWeekEvents((prev) => [...prev, ev]);
      setCalView("Week");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));

    // Same trainer list shown on TrainerPage.jsx (kept in localStorage there).
    try {
      const s = localStorage.getItem("fm_trainers");
      if (s) setInstructors(JSON.parse(s));
    } catch (e) {}

    // Show any previously-saved appointments that fall in the visible week.
    try {
      const saved = JSON.parse(localStorage.getItem("fm_appointments") || "[]");
      const events = saved.map(appointmentToWeekEvent).filter(Boolean);
      if (events.length) setWeekEvents((prev) => [...prev, ...events]);
    } catch (e) {}
  }, []);

  const logout = () => {
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");
    navigate("/login");
  };

  const renderCalendar = () => {
    switch(calView) {
      case "Day":   return <DayView events={dayEvents} onEventClick={openEventEditor("day")}/>;
      case "Week":  return <WeekView events={weekEvents} onEventClick={openEventEditor("week")}/>;
      case "Month": return <MonthView />;
      case "Year":  return <YearView />;
      default:      return <WeekView events={weekEvents} onEventClick={openEventEditor("week")}/>;
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
            <div style={{ display:"flex", alignItems:"center", gap:8,
              cursor:"pointer" }} onClick={() => setShowProfileMenu(v => !v)}>
              <Avatar name={user?.fullName||"U"} color={C.acc} size={32}/>
              <span style={{ color:"#E2E8F0", fontSize:13, fontWeight:600 }}>
                {user?.fullName?.split(" ")[0]||"HABIB"}</span>
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
                    <Avatar name={user?.fullName||"U"} color={C.acc2} size={44}/>
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
                    <button onClick={logout} style={{
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
        position:"sticky", top:54, zIndex:199,
        boxShadow:"0 1px 4px rgba(0,0,0,.04)",
      }}>
        {NAV_ITEMS.map(({ label, icon }) => {
          const active = label === activeNav;
          return (
            <button key={label} onClick={() => { setActiveNav(label); if(label==="Trainers") navigate("/trainers"); if(label==="Packages") navigate("/packages"); if(label==="Members") navigate("/members"); if(label==="Settings") navigate("/settings"); }} style={{
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
              <div style={{ fontSize:12, color:C.tl }}>
                {TODAY.toLocaleDateString("en-US", { day:"numeric", month:"long", weekday:"long" })}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <button onClick={() => setShowAddModal(true)} style={{
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

              <select value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)} style={{
                border:`1px solid ${C.border}`, borderRadius:7,
                padding:"5px 10px", fontSize:12, color:C.tm,
                background:C.card, cursor:"pointer", outline:"none",
              }}>
                <option>All Instructors</option>
                {instructors.map((t) => <option key={t.id}>{t.name}</option>)}
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
            <button onClick={() => setShowAddModal(true)} style={{
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
                color:C.dark }}>Package Ending
                <span style={{ fontWeight:500, color:C.tl }}>
                  {" "}({memberTab === "Weekly" ? "this week" : "this month"})</span></span>
              <span onClick={() => navigate("/members")} style={{ fontSize:12, color:C.acc,
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
              <div onClick={() => setRemindersOn((v) => !v)} style={{
                width:34, height:18, borderRadius:9, cursor:"pointer",
                position:"relative", background: remindersOn ? C.dark : "#CBD5E1",
              }}>
                <div style={{ width:14, height:14, borderRadius:"50%",
                  background:"#fff", position:"absolute",
                  left: remindersOn ? 18 : 2, top:2, transition:"left .15s" }}/>
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
                {(() => {
                  const data = BAR_DATA_BY_RANGE[chartRange] || BAR_DATA_BY_RANGE.Weekly;
                  const peak = data.reduce((m, b) => b.h > m.h ? b : m, data[0]);
                  return data.map(b => (
                  <div key={b.day} style={{ flex:1, display:"flex",
                    flexDirection:"column", alignItems:"center", gap:4 }}>
                    {b.day===peak.day && (
                      <div style={{ fontSize:10, color:C.acc,
                        fontWeight:700 }}>Peak</div>
                    )}
                    <div style={{
                      width:"100%", borderRadius:"6px 6px 0 0",
                      background: b.day===peak.day ? C.acc : "#D1FAE5",
                      height:b.h*0.95,
                    }}/>
                    <div style={{ fontSize:11,
                      color: b.day===peak.day ? C.acc : C.tl,
                      fontWeight: b.day===peak.day ? 700 : 400,
                    }}>{b.day}</div>
                  </div>
                  ));
                })()}
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
            <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative" }}>
              <span style={{ fontSize:12, color:C.tl }}>
                Showing {filteredAttention.length} prioritized member{filteredAttention.length===1?"":"s"}</span>
              <button onClick={() => setShowFilterMenu((v) => !v)} style={{
                background:"none", border:`1px solid ${C.border}`,
                borderRadius:7, padding:"5px 12px", cursor:"pointer",
                fontSize:12, color:C.tm, fontFamily:"inherit",
              }}>{attentionFilter} ▾</button>
              {showFilterMenu && (
                <>
                  <div onClick={() => setShowFilterMenu(false)}
                    style={{ position:"fixed", inset:0, zIndex:400 }}/>
                  <div style={{
                    position:"absolute", top:"calc(100% + 6px)", right:0, width:190,
                    background:C.card, borderRadius:10, overflow:"hidden",
                    boxShadow:"0 12px 32px rgba(0,0,0,.18)", zIndex:401,
                    border:`1px solid ${C.border}`,
                  }}>
                    {ATTENTION_FILTERS.map((f) => (
                      <div key={f} onClick={() => { setAttentionFilter(f); setShowFilterMenu(false); }}
                        style={{
                          padding:"9px 14px", fontSize:12, cursor:"pointer",
                          fontWeight: f===attentionFilter ? 700 : 500,
                          color: f===attentionFilter ? C.acc : C.dark,
                          background: f===attentionFilter ? "#F0FDF4" : "transparent",
                        }}>{f}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display:"grid",
            gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {filteredAttention.length === 0 && (
              <div style={{ gridColumn:"1 / -1", textAlign:"center",
                color:C.tl, fontSize:13, padding:"20px 0" }}>
                No members match this filter.</div>
            )}
            {filteredAttention.map((m,i) => (
              <Card key={i} style={{ padding:"16px" }}>
                <div style={{ display:"flex", alignItems:"center",
                  gap:10, marginBottom:12 }}>
                  <Avatar name={m.name}
                    color={[C.acc,C.blue,C.purple,C.yellow,C.pink,C.red][i % 6]}
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
                  <button onClick={() => sendReminder(m.name)} style={{ flex:1, padding:"8px 0",
                    border:`1px solid ${C.border}`, borderRadius:8,
                    background: sentReminders[m.name] ? "#F0FDF4" : "#fff", cursor:"pointer",
                    fontSize:12, fontWeight:600,
                    color: sentReminders[m.name] ? C.acc : C.dark,
                    fontFamily:"inherit" }}>
                    {sentReminders[m.name] ? "✓ Sent" : "Send Reminder"}</button>
                  <button onClick={() => toggleAutoRenew(m.name)} style={{ flex:1, padding:"8px 0", border:"none",
                    borderRadius:8,
                    background: m.autoRenew ? C.dark : "#F1F5F9",
                    cursor:"pointer", fontSize:12, fontWeight:600,
                    color: m.autoRenew ? "#fff" : C.tm,
                    fontFamily:"inherit",
                  }}>
                    {m.autoRenew ? "Auto-Renew: ON" : "Enable Auto-Renew"}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ textAlign:"center", marginTop:18 }}>
            <button onClick={() => navigate("/members")} style={{ background:"none", border:"none",
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

      {showAddModal && (
        <AddAppointmentModal onClose={() => setShowAddModal(false)} onCreated={addAppointmentToCalendar} />
      )}

      {editingEvent && (
        <EditSessionModal event={editingEvent} onClose={closeEventEditor}
          onSave={saveEvent} onDelete={deleteEvent}/>
      )}
    </div>
  );
}
