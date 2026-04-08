import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

var supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://mretgmwksftvqeltfbfk.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZXRnbXdrc2Z0dnFlbHRmYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTk0NjEsImV4cCI6MjA5MTEzNTQ2MX0.W6e-ptM0Gp-v3z-W60-HsB6XXmmo2rSaMqemxwv2qXI"
);

var MEAL_TYPES = ["Veg", "Non-Veg", "Chapathi"];
var BILLING_CYCLES = ["Weekly", "15 Days", "30 Days"];
var ROUTES = ["Route 1", "Route 2", "Route 3", "Route 4", "Route 5"];
var TABS = ["Dashboard", "Customers", "Operations", "Kitchen", "Billing", "Delivery", "Reports"];

var fmt = function(d) { return typeof d === "string" ? d : d.toISOString().split("T")[0]; };
var today = fmt(new Date());
var toINR = function(n) { return "\u20B9" + Number(n || 0).toLocaleString("en-IN"); };
var genId = function(n) { return "MLB" + String(n).padStart(3, "0"); };

// Check if a date is Sunday
function isSunday(dateStr) { return new Date(dateStr + "T00:00:00").getDay() === 0; }
// Check if a date is Saturday
function isSaturday(dateStr) { return new Date(dateStr + "T00:00:00").getDay() === 6; }
// Count working days between two dates (exclude Sundays, optionally Saturdays)
function countWorkingDays(start, end, noSaturday) {
  var count = 0;
  var d = new Date(start + "T00:00:00");
  var endD = new Date(end + "T00:00:00");
  while (d <= endD) {
    var day = d.getDay();
    if (day !== 0) { // not Sunday
      if (!(noSaturday && day === 6)) count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return count;
}

var C = {
  bg: "#0C0F12", card: "#151920", cardHover: "#1A2029", border: "#222933",
  accent: "#E8A838", accentDim: "#E8A83833", accentText: "#0C0F12",
  text: "#E8ECF1", textDim: "#7B8594", textMid: "#A3ADBA",
  green: "#34D399", red: "#F87171", blue: "#60A5FA", purple: "#A78BFA",
};

var ICON = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  ops: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  cup: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  map: "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16",
  bar: "M18 20V10M12 20V4M6 20v-6",
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  dl: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  money: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  wa: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z",
  trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  cal: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
};
var tabIcons = { Dashboard: ICON.home, Customers: ICON.users, Operations: ICON.ops, Kitchen: ICON.cup, Billing: ICON.file, Delivery: ICON.map, Reports: ICON.bar };

var Ico = function({ d, s, c }) { return <svg width={s||18} height={s||18} viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>; };
var Badge = function({ children, color }) { color = color || C.accent; return <span style={{ background: color + "20", color: color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: .5, whiteSpace: "nowrap" }}>{children}</span>; };
var Btn = function({ children, onClick, primary, small, danger, disabled, style: st }) { return <button disabled={disabled} onClick={onClick} style={Object.assign({ padding: small ? "6px 14px" : "10px 22px", borderRadius: 8, border: primary || danger ? "none" : "1px solid " + C.border, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: small ? 12 : 13, display: "inline-flex", alignItems: "center", gap: 6, transition: "all .15s", fontFamily: "inherit", background: danger ? C.red : primary ? C.accent : C.card, color: danger ? "#fff" : primary ? C.accentText : C.text, opacity: disabled ? .5 : 1 }, st || {})}>{children}</button>; };
var Inp = function({ label, value, onChange, type, options, placeholder, style: st, textarea }) {
  type = type || "text";
  var base = { padding: "9px 12px", borderRadius: 8, border: "1px solid " + C.border, background: C.bg, color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" };
  return (
    <div style={Object.assign({ display: "flex", flexDirection: "column", gap: 4 }, st || {})}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      {options ? <select value={value} onChange={function(e){onChange(e.target.value)}} style={base}>{options.map(function(o){return <option key={o} value={o}>{o}</option>})}</select>
       : textarea ? <textarea value={value} onChange={function(e){onChange(e.target.value)}} placeholder={placeholder} rows={3} style={Object.assign({}, base, {resize:"vertical"})} />
       : <input type={type} value={value} onChange={function(e){onChange(e.target.value)}} placeholder={placeholder} style={base} />}
    </div>
  );
};
var Card = function({ children, style: st }) { return <div style={Object.assign({ background: C.card, borderRadius: 14, border: "1px solid " + C.border, padding: 24 }, st || {})}>{children}</div>; };
var Stat = function({ label, value, sub, accent }) { return (<Card style={{ flex: 1, minWidth: 170 }}><div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div><div style={{ fontSize: 26, fontWeight: 700, color: accent || C.text, fontFamily: "'DM Mono', monospace" }}>{value}</div>{sub && <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{sub}</div>}</Card>); };
var Modal = function({ title, onClose, children }) { return (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}><div onClick={function(e){e.stopPropagation()}} style={{ background: C.card, borderRadius: 16, border: "1px solid " + C.border, padding: 28, width: 560, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}><h2 style={{ margin: 0, fontSize: 18, color: C.text }}>{title}</h2><button onClick={onClose} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer" }}><Ico d={ICON.x} /></button></div>{children}</div></div>); };
var Tbl = function({ columns, data, actions }) { return (<div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid " + C.border }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr>{columns.map(function(c){return <th key={c.key} style={{ textAlign: "left", padding: "12px 14px", background: C.bg, color: C.textDim, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid " + C.border, whiteSpace: "nowrap" }}>{c.label}</th>})}{actions && <th style={{ textAlign: "right", padding: "12px 14px", background: C.bg, color: C.textDim, fontWeight: 600, fontSize: 10, letterSpacing: 1, borderBottom: "1px solid " + C.border }}>Actions</th>}</tr></thead><tbody>{data.map(function(row, i){return (<tr key={row.id || i} style={{ borderBottom: "1px solid " + C.border }}>{columns.map(function(c){return <td key={c.key} style={{ padding: "10px 14px", color: C.text, whiteSpace: "nowrap" }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>})}{actions && <td style={{ padding: "10px 14px", textAlign: "right" }}>{actions(row)}</td>}</tr>)})}</tbody></table>{data.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.textDim }}>No data found</div>}</div>); };
var Header = function({ children, right }) { return (<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{children}</h2><div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{right}</div></div>); };
var Toast = function({ msg, type, onClose }) { return (<div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, background: type === "error" ? C.red : C.green, color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>{msg}<button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><Ico d={ICON.x} s={14} /></button></div>); };
var exportCSV = function(filename, headers, rows) { var csv = [headers.join(",")].concat(rows.map(function(r){return r.map(function(v){return '"'+String(v||"").replace(/"/g,'""')+'"'}).join(",")})).join("\n"); var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = filename; a.click(); };

function getCounts(cust, date, overrides) {
  // Sundays = always 0 (not operational)
  if (isSunday(date)) return { veg: 0, nonveg: 0, chapathi: 0 };
  // Saturdays = 0 if customer has no_saturday
  if (isSaturday(date) && cust.no_saturday) return { veg: 0, nonveg: 0, chapathi: 0 };
  var ov = overrides.find(function(o){ return o.customer_id === cust.id && o.override_date === date; });
  if (ov) return { veg: ov.veg_count || 0, nonveg: ov.nonveg_count || 0, chapathi: ov.chapathi_count || 0 };
  return { veg: cust.default_veg || 0, nonveg: cust.default_nonveg || 0, chapathi: cust.default_chapathi || 0 };
}
function totalMeals(counts) { return counts.veg + counts.nonveg + counts.chapathi; }

var MealCounts = function({ counts }) {
  var parts = [];
  if (counts.veg > 0) parts.push(<span key="v" style={{color:C.green}}>{counts.veg}V</span>);
  if (counts.nonveg > 0) parts.push(<span key="n" style={{color:C.red}}>{counts.nonveg}NV</span>);
  if (counts.chapathi > 0) parts.push(<span key="c" style={{color:C.accent}}>{counts.chapathi}Ch</span>);
  if (parts.length === 0) return <span style={{color:C.textDim}}>0</span>;
  return <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace", display: "inline-flex", gap: 6 }}>{parts}</span>;
};

// LOGIN
function LoginScreen({ onLogin }) {
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [isSignup, setIsSignup] = useState(false);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var handleSubmit = async function() {
    if (!email || !password) { setError("Please enter email and password"); return; }
    if (password.length < 6) { setError("Min 6 characters"); return; }
    setLoading(true); setError("");
    try {
      var result = isSignup ? await supabase.auth.signUp({ email: email, password: password }) : await supabase.auth.signInWithPassword({ email: email, password: password });
      if (result.error) throw result.error;
      if (result.data.user) onLogin(result.data.user);
    } catch (e) { setError(e.message || "Failed"); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
      <div style={{ background: C.card, borderRadius: 20, border: "1px solid " + C.border, padding: 40, width: 400, maxWidth: "95vw" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, " + C.accent + ", #D4842A)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24, color: C.accentText, marginBottom: 16 }}>M</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text }}>Mullai</h1>
          <p style={{ margin: "4px 0 0", color: C.textDim, fontSize: 13 }}>Meal Delivery Dashboard</p>
        </div>
        <Inp label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" style={{ marginBottom: 16 }} />
        <Inp label="Password" value={password} onChange={setPassword} type="password" placeholder="Min 6 characters" style={{ marginBottom: 16 }} />
        {error && <div style={{ background: C.red + "20", color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: 12, marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        <Btn primary disabled={loading} onClick={handleSubmit} style={{ width: "100%", justifyContent: "center", padding: "12px 0", fontSize: 14, marginBottom: 12 }}><Ico d={ICON.lock} s={16} /> {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}</Btn>
        <div style={{ textAlign: "center" }}><button onClick={function(){ setIsSignup(!isSignup); setError(""); }} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>{isSignup ? "Already have an account? Sign In" : "First time? Create Account"}</button></div>
      </div>
    </div>
  );
}

// OPERATIONS
function OperationsTab({ customers, overrides, selDate, setSelDate, onSaveOverride, onRemoveOverride, showToast }) {
  var [editId, setEditId] = useState(null);
  var [editVeg, setEditVeg] = useState(0);
  var [editNV, setEditNV] = useState(0);
  var [editCh, setEditCh] = useState(0);

  var isSun = isSunday(selDate);

  var details = useMemo(function() {
    return customers.map(function(c) {
      var counts = getCounts(c, selDate, overrides);
      return Object.assign({}, c, { counts: counts, total: totalMeals(counts) });
    });
  }, [customers, selDate, overrides]);

  var startEdit = function(row) {
    if (isSun) { showToast("Sundays are off - no deliveries", "error"); return; }
    if (isSaturday(selDate) && row.no_saturday) { showToast("This customer is off on Saturdays", "error"); return; }
    setEditId(row.id); setEditVeg(row.counts.veg); setEditNV(row.counts.nonveg); setEditCh(row.counts.chapathi);
  };
  var saveEdit = function(id) { onSaveOverride(id, selDate, parseInt(editVeg)||0, parseInt(editNV)||0, parseInt(editCh)||0); setEditId(null); };
  var numInp = function(val, setter, color) { return <input type="number" value={val} onChange={function(e){setter(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")saveEdit(editId);if(e.key==="Escape")setEditId(null)}} style={{ width: 50, padding: "4px 6px", borderRadius: 6, border: "1px solid " + color, background: C.bg, color: color, fontSize: 13, outline: "none", fontFamily: "'DM Mono', monospace", textAlign: "center" }} />; };

  return (
    <div>
      <Header right={<Inp value={selDate} onChange={function(v){setSelDate(v);setEditId(null)}} type="date" />}>{"Operations - " + selDate}</Header>
      {isSun && <div style={{ padding: "12px 20px", background: C.red+"15", border: "1px solid "+C.red+"30", borderRadius: 10, marginBottom: 16, color: C.red, fontSize: 13, fontWeight: 600 }}>Sunday - No deliveries (not operational)</div>}
      <Tbl columns={[
        { key: "id", label: "ID", render: function(v){ return <Badge>{v}</Badge>; } },
        { key: "name", label: "Office", render: function(v,row){ return <div><span style={{ fontWeight: 600 }}>{v}</span>{row.no_saturday ? <Badge color={C.purple}> No Sat</Badge> : null}</div>; } },
        { key: "counts", label: "Veg", render: function(v, row) { if (editId === row.id) return numInp(editVeg, setEditVeg, C.green); return <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace", color: C.green }}>{v.veg}</span>; }},
        { key: "_nv", label: "Non-Veg", render: function(v, row) { if (editId === row.id) return numInp(editNV, setEditNV, C.red); return <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace", color: C.red }}>{row.counts.nonveg}</span>; }},
        { key: "_ch", label: "Chapathi", render: function(v, row) { if (editId === row.id) return numInp(editCh, setEditCh, C.accent); return <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace", color: C.accent }}>{row.counts.chapathi}</span>; }},
        { key: "total", label: "Total", render: function(v) { return <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{v}</span>; } },
        { key: "route", label: "Route" },
      ]} data={details} actions={function(row) {
        var isOv = overrides.some(function(o){ return o.customer_id === row.id && o.override_date === selDate; });
        if (editId === row.id) return (<div style={{ display: "flex", gap: 4 }}><Btn small primary onClick={function(){ saveEdit(row.id); }}><Ico d={ICON.check} s={14} /></Btn><Btn small onClick={function(){ setEditId(null); }}><Ico d={ICON.x} s={14} /></Btn></div>);
        return (<div style={{ display: "flex", gap: 4 }}>
          <Btn small onClick={function(){ startEdit(row); }} disabled={isSun}><Ico d={ICON.edit} s={14} /></Btn>
          {isOv && <Btn small danger onClick={function(){ onRemoveOverride(row.id, selDate); }}>Reset</Btn>}
        </div>);
      }} />
      <div style={{ marginTop: 16, padding: 14, background: C.card, borderRadius: 10, border: "1px solid " + C.border, fontSize: 12, color: C.textDim }}>
        Select any date (today or future) using the calendar above. Click edit icon to change counts. Sundays are always off. Customers marked "No Sat" get 0 on Saturdays.
      </div>
    </div>
  );
}

// REPORTS (separate component for hooks)
function ReportsTab({ customers, overrides, invoices, prices, reportDate, setReportDate, reportDateEnd, setReportDateEnd, reportTab, setReportTab }) {
  var repKitchen = useMemo(function() {
    var d = { veg: 0, nonveg: 0, chapathi: 0, total: 0, details: [] };
    customers.forEach(function(c) {
      var counts = getCounts(c, reportDate, overrides);
      var t = totalMeals(counts);
      d.veg += counts.veg; d.nonveg += counts.nonveg; d.chapathi += counts.chapathi; d.total += t;
      d.details.push(Object.assign({}, c, { counts: counts, totalMeals: t }));
    });
    return d;
  }, [customers, reportDate, overrides]);

  var routeGroupsReport = useMemo(function() {
    var g = {};
    customers.forEach(function(c) {
      if (!g[c.route]) g[c.route] = [];
      var counts = getCounts(c, reportDate, overrides);
      g[c.route].push(Object.assign({}, c, { counts: counts, totalMeals: totalMeals(counts) }));
    });
    return g;
  }, [customers, reportDate, overrides]);

  var RTYPES = ["Kitchen", "Billing", "Customer", "Delivery", "Route", "Payments"];

  return (<div>
    <Header>Reports</Header>
    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>{RTYPES.map(function(r){return <Btn key={r} small primary={reportTab===r} onClick={function(){setReportTab(r)}}>{r}</Btn>})}</div>
    <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
      <Inp label="Date" value={reportDate} onChange={setReportDate} type="date" />
      {(reportTab === "Billing" || reportTab === "Payments") && <Inp label="To" value={reportDateEnd} onChange={setReportDateEnd} type="date" />}
    </div>
    {reportTab === "Kitchen" && <div>
      {isSunday(reportDate) && <div style={{ padding: "12px 20px", background: C.red+"15", borderRadius: 10, marginBottom: 16, color: C.red, fontSize: 13, fontWeight: 600 }}>Sunday - No deliveries</div>}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}><Stat label="Total" value={repKitchen.total} accent={C.accent} /><Stat label="Veg" value={repKitchen.veg} accent={C.green} /><Stat label="NV" value={repKitchen.nonveg} accent={C.red} /><Stat label="Ch" value={repKitchen.chapathi} accent={C.accent} /></div>
      <Tbl columns={[{key:"id",label:"ID",render:function(v){return <Badge>{v}</Badge>}},{key:"name",label:"Office",render:function(v){return <span style={{fontWeight:600}}>{v}</span>}},{key:"counts",label:"V",render:function(v){return <span style={{color:C.green,fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{v.veg}</span>}},{key:"_nv",label:"NV",render:function(v,r){return <span style={{color:C.red,fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{r.counts.nonveg}</span>}},{key:"_ch",label:"Ch",render:function(v,r){return <span style={{color:C.accent,fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{r.counts.chapathi}</span>}},{key:"totalMeals",label:"Total",render:function(v){return <span style={{fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{v}</span>}},{key:"route",label:"Route"}]} data={repKitchen.details} />
      <div style={{marginTop:12}}><Btn onClick={function(){exportCSV("kitchen_"+reportDate+".csv",["ID","Office","Veg","NV","Ch","Total","Route"],repKitchen.details.map(function(c){return [c.id,c.name,c.counts.veg,c.counts.nonveg,c.counts.chapathi,c.totalMeals,c.route]}))}}><Ico d={ICON.dl} s={14} /> Export</Btn></div>
    </div>}
    {reportTab === "Billing" && <Tbl columns={[{key:"id",label:"Invoice"},{key:"customer_id",label:"Customer",render:function(v){var c=customers.find(function(x){return x.id===v});return c?c.name:v}},{key:"period_label",label:"Period"},{key:"amount",label:"Amount",render:function(v){return toINR(v)}},{key:"status",label:"Status",render:function(v){return <Badge color={v==="Paid"?C.green:C.red}>{v}</Badge>}}]} data={invoices} />}
    {reportTab === "Customer" && <Tbl columns={[{key:"id",label:"ID"},{key:"name",label:"Name"},{key:"route",label:"Route"},{key:"default_veg",label:"V",render:function(v){return v||0}},{key:"default_nonveg",label:"NV",render:function(v){return v||0}},{key:"default_chapathi",label:"Ch",render:function(v){return v||0}},{key:"billing_cycle",label:"Cycle"},{key:"no_saturday",label:"Sat Off",render:function(v){return v?<Badge color={C.purple}>Yes</Badge>:"-"}}]} data={customers} />}
    {reportTab === "Delivery" && <Tbl columns={[{key:"id",label:"ID"},{key:"name",label:"Office"},{key:"route",label:"Route"},{key:"counts",label:"Meals",render:function(v){return <MealCounts counts={v} />}},{key:"totalMeals",label:"Total",render:function(v){return <span style={{fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{v}</span>}}]} data={repKitchen.details} />}
    {reportTab === "Route" && Object.entries(routeGroupsReport).map(function(e){return (<Card key={e[0]} style={{marginBottom:16}}><div style={{fontWeight:700,marginBottom:12}}>{e[0]+" - "+e[1].length+" customers | "+e[1].reduce(function(s,c){return s+c.totalMeals},0)+" meals"}</div><Tbl columns={[{key:"name",label:"Office"},{key:"counts",label:"Meals",render:function(v){return <MealCounts counts={v} />}},{key:"totalMeals",label:"Total"}]} data={e[1]} /></Card>)})}
    {reportTab === "Payments" && <Tbl columns={[{key:"id",label:"Invoice"},{key:"customer_id",label:"Customer",render:function(v){var c=customers.find(function(x){return x.id===v});return c?c.name:v}},{key:"amount",label:"Amount",render:function(v){return <span style={{fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{toINR(v)}</span>}},{key:"status",label:"Status",render:function(v){return <Badge color={v==="Paid"?C.green:C.red}>{v}</Badge>}}]} data={invoices} />}
  </div>);
}

// MAIN APP
export default function App() {
  var [user, setUser] = useState(null);
  var [authLoading, setAuthLoading] = useState(true);
  var [tab, setTab] = useState("Dashboard");
  var [customers, setCustomers] = useState([]);
  var [prices, setPrices] = useState({ Veg: 90, "Non-Veg": 120, Chapathi: 75 });
  var [overrides, setOverrides] = useState([]);
  var [invoices, setInvoices] = useState([]);
  var [loading, setLoading] = useState(true);
  var [modal, setModal] = useState(null);
  var [editCust, setEditCust] = useState(null);
  var [selDate, setSelDate] = useState(today);
  var [searchQ, setSearchQ] = useState("");
  var [routeFilter, setRouteFilter] = useState("All");
  var [reportTab, setReportTab] = useState("Kitchen");
  var [reportDate, setReportDate] = useState(today);
  var [reportDateEnd, setReportDateEnd] = useState(today);
  var [sidebar, setSidebar] = useState(window.innerWidth > 768);
  var [toast, setToast] = useState(null);
  var [deleteConfirm, setDeleteConfirm] = useState(null);
  var [deleteInvConfirm, setDeleteInvConfirm] = useState(null);
  var [billGenCust, setBillGenCust] = useState(null);

  var showToast = function(msg, type) { setToast({ msg: msg, type: type || "success" }); setTimeout(function(){ setToast(null); }, 3000); };

  useEffect(function() {
    supabase.auth.getSession().then(function(resp) { setUser(resp.data.session ? resp.data.session.user : null); setAuthLoading(false); });
    var sub = supabase.auth.onAuthStateChange(function(_ev, session) { setUser(session ? session.user : null); });
    return function() { sub.data.subscription.unsubscribe(); };
  }, []);

  var handleLogout = async function() { await supabase.auth.signOut(); setUser(null); };

  var loadAll = useCallback(async function() {
    setLoading(true);
    try {
      var results = await Promise.all([
        supabase.from("customers").select("*").order("created_at"),
        supabase.from("pricing").select("*"),
        supabase.from("daily_overrides").select("*"),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      ]);
      if (results[0].data) setCustomers(results[0].data);
      if (results[1].data) { var p = {}; results[1].data.forEach(function(r){ p[r.meal_type] = r.price; }); setPrices(p); }
      if (results[2].data) setOverrides(results[2].data);
      if (results[3].data) setInvoices(results[3].data);
    } catch (e) { console.error(e); showToast("Failed to load", "error"); }
    setLoading(false);
  }, []);

  useEffect(function() { if (user) loadAll(); }, [user, loadAll]);

  var kitchenData = useMemo(function() {
    var d = { veg: 0, nonveg: 0, chapathi: 0, total: 0, details: [] };
    customers.forEach(function(c) {
      var counts = getCounts(c, selDate, overrides);
      var t = totalMeals(counts);
      d.veg += counts.veg; d.nonveg += counts.nonveg; d.chapathi += counts.chapathi; d.total += t;
      d.details.push(Object.assign({}, c, { counts: counts, totalMeals: t }));
    });
    return d;
  }, [customers, selDate, overrides]);

  var routeGroups = useMemo(function() {
    var g = {};
    customers.forEach(function(c) {
      if (!g[c.route]) g[c.route] = [];
      var counts = getCounts(c, selDate, overrides);
      g[c.route].push(Object.assign({}, c, { counts: counts, totalMeals: totalMeals(counts) }));
    });
    return g;
  }, [customers, selDate, overrides]);

  var pendingTotal = invoices.filter(function(i){return i.status==="Unpaid"}).reduce(function(s,i){return s+Number(i.amount)}, 0);

  // CRUD
  var saveCustomer = async function(data) {
    try {
      if (editCust && editCust.id && customers.find(function(c){return c.id===editCust.id})) {
        var res = await supabase.from("customers").update({
          name: data.name, address: data.address, phone1: data.phone1, phone2: data.phone2,
          map_link: data.map_link, default_veg: data.default_veg, default_nonveg: data.default_nonveg,
          default_chapathi: data.default_chapathi, billing_cycle: data.billing_cycle, route: data.route,
          no_saturday: data.no_saturday, updated_at: new Date().toISOString(),
        }).eq("id", editCust.id);
        if (res.error) throw res.error;
        showToast("Updated!");
      } else {
        var settRes = await supabase.from("app_settings").select("value").eq("key", "customer_counter").single();
        var nextNum = (parseInt(settRes.data ? settRes.data.value : "0") + 1);
        var newId = genId(nextNum);
        var insRes = await supabase.from("customers").insert({
          id: newId, name: data.name, address: data.address, phone1: data.phone1, phone2: data.phone2,
          map_link: data.map_link, default_veg: data.default_veg, default_nonveg: data.default_nonveg,
          default_chapathi: data.default_chapathi, default_meals: data.default_veg + data.default_nonveg + data.default_chapathi,
          meal_type: "Veg", billing_cycle: data.billing_cycle, route: data.route, no_saturday: data.no_saturday,
          balance: 0, last_billed: today,
        });
        if (insRes.error) throw insRes.error;
        await supabase.from("app_settings").update({ value: String(nextNum) }).eq("key", "customer_counter");
        showToast("Customer " + newId + " added!");
      }
      await loadAll(); setModal(null); setEditCust(null);
    } catch (e) { console.error(e); showToast("Error: " + e.message, "error"); }
  };

  var deleteCustomer = async function(id) {
    var res = await supabase.from("customers").delete().eq("id", id);
    if (res.error) { showToast("Error: " + res.error.message, "error"); return; }
    showToast("Deleted"); setDeleteConfirm(null); loadAll();
  };

  var saveOverride = async function(custId, date, veg, nonveg, chapathi) {
    try {
      var res = await supabase.from("daily_overrides").upsert(
        { customer_id: custId, override_date: date, veg_count: veg, nonveg_count: nonveg, chapathi_count: chapathi, meal_count: veg+nonveg+chapathi },
        { onConflict: "customer_id,override_date" }
      );
      if (res.error) throw res.error;
      showToast("Updated!"); loadAll();
    } catch (e) { showToast("Error: " + e.message, "error"); }
  };

  var removeOverride = async function(custId, date) {
    await supabase.from("daily_overrides").delete().eq("customer_id", custId).eq("override_date", date);
    showToast("Reset"); loadAll();
  };

  var markPaid = async function(id) {
    await supabase.from("invoices").update({ status: "Paid", paid_at: new Date().toISOString() }).eq("id", id);
    showToast("Paid!"); loadAll();
  };

  var deleteInvoice = async function(id) {
    var res = await supabase.from("invoices").delete().eq("id", id);
    if (res.error) { showToast("Error: " + res.error.message, "error"); return; }
    showToast("Invoice deleted"); setDeleteInvConfirm(null); loadAll();
  };

  var createInvoice = async function(data) {
    try {
      var res = await supabase.from("invoices").insert(data);
      if (res.error) throw res.error;
      showToast("Invoice created!"); loadAll(); setModal(null);
    } catch (e) { showToast("Error: " + e.message, "error"); }
  };

  var updatePricing = async function(np) {
    try {
      for (var i = 0; i < MEAL_TYPES.length; i++) { await supabase.from("pricing").update({ price: np[MEAL_TYPES[i]], updated_at: new Date().toISOString() }).eq("meal_type", MEAL_TYPES[i]); }
      setPrices(np); showToast("Pricing updated!"); setModal(null);
    } catch (e) { showToast("Error: " + e.message, "error"); }
  };

  // Generate bill till date for a customer
  var generateBillTillDate = async function(cust, endDate) {
    var startDate = cust.last_billed || today;
    var days = countWorkingDays(startDate, endDate, cust.no_saturday);
    var vegAmt = (cust.default_veg || 0) * days * (prices.Veg || 0);
    var nvAmt = (cust.default_nonveg || 0) * days * (prices["Non-Veg"] || 0);
    var chAmt = (cust.default_chapathi || 0) * days * (prices.Chapathi || 0);
    var total = vegAmt + nvAmt + chAmt;
    var inv = {
      id: "INV-" + Date.now().toString(36).toUpperCase(),
      customer_id: cust.id, period_start: startDate, period_end: endDate,
      period_label: startDate + " to " + endDate, amount: total, status: "Unpaid"
    };
    await createInvoice(inv);
    setBillGenCust(null);
  };

  var sendWhatsApp = function(route) {
    var list = routeGroups[route] || [];
    var msg = "MULLAI DELIVERIES\n" + selDate + " | " + route + "\n============================\n\n";
    list.forEach(function(c, i) {
      var parts = [];
      if (c.counts.veg > 0) parts.push(c.counts.veg + " Veg");
      if (c.counts.nonveg > 0) parts.push(c.counts.nonveg + " Non-Veg");
      if (c.counts.chapathi > 0) parts.push(c.counts.chapathi + " Chapathi");
      msg += (i+1) + ". " + c.name + "\nAddress: " + c.address + "\nPhone: " + c.phone1 + "\nMeals: " + parts.join(" + ") + " = " + c.totalMeals + "\n";
      if (c.map_link) msg += "Map: " + c.map_link + "\n";
      msg += "--------------------------\n\n";
    });
    msg += "TOTAL: " + list.reduce(function(s,c){return s+c.totalMeals},0) + " meals";
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  };

  // FORMS
  var CustForm = function({ initial, onSave, onCancel }) {
    var empty = { name: "", address: "", phone1: "", phone2: "", map_link: "", default_veg: 0, default_nonveg: 0, default_chapathi: 0, billing_cycle: "30 Days", route: "Route 1", no_saturday: false };
    var init = initial ? { name: initial.name, address: initial.address, phone1: initial.phone1, phone2: initial.phone2 || "", map_link: initial.map_link || "", default_veg: initial.default_veg || 0, default_nonveg: initial.default_nonveg || 0, default_chapathi: initial.default_chapathi || 0, billing_cycle: initial.billing_cycle, route: initial.route, no_saturday: !!initial.no_saturday } : empty;
    var [f, setF] = useState(init);
    var set = function(k, v) { setF(function(p) { return Object.assign({}, p, { [k]: v }); }); };
    var totalDef = (parseInt(f.default_veg)||0) + (parseInt(f.default_nonveg)||0) + (parseInt(f.default_chapathi)||0);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Inp label="Office Name" value={f.name} onChange={function(v){set("name",v)}} placeholder="e.g. TCS Siruseri" style={{ gridColumn: "1/-1" }} />
        <Inp label="Address" value={f.address} onChange={function(v){set("address",v)}} placeholder="Full address" style={{ gridColumn: "1/-1" }} textarea />
        <Inp label="Primary Contact" value={f.phone1} onChange={function(v){set("phone1",v)}} placeholder="9876543210" />
        <Inp label="Secondary Contact" value={f.phone2} onChange={function(v){set("phone2",v)}} placeholder="Optional" />
        <Inp label="Google Maps Link" value={f.map_link} onChange={function(v){set("map_link",v)}} placeholder="https://maps.google.com/..." style={{ gridColumn: "1/-1" }} />
        <div style={{ gridColumn: "1/-1", padding: "12px 16px", background: C.bg, borderRadius: 10, border: "1px solid " + C.border }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Default Daily Meal Counts</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Inp label="Veg" value={f.default_veg} onChange={function(v){set("default_veg",parseInt(v)||0)}} type="number" />
            <Inp label="Non-Veg" value={f.default_nonveg} onChange={function(v){set("default_nonveg",parseInt(v)||0)}} type="number" />
            <Inp label="Chapathi" value={f.default_chapathi} onChange={function(v){set("default_chapathi",parseInt(v)||0)}} type="number" />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: C.accent, fontWeight: 600 }}>Total: {totalDef}/day</div>
        </div>
        <Inp label="Billing Cycle" value={f.billing_cycle} onChange={function(v){set("billing_cycle",v)}} options={BILLING_CYCLES} />
        <Inp label="Route" value={f.route} onChange={function(v){set("route",v)}} options={ROUTES} />
        <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: C.bg, borderRadius: 10, border: "1px solid " + C.border }}>
          <input type="checkbox" checked={f.no_saturday} onChange={function(e){set("no_saturday", e.target.checked)}} style={{ width: 18, height: 18, accentColor: C.accent }} />
          <div><div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>No Saturday delivery</div><div style={{ fontSize: 11, color: C.textDim }}>Skip Saturdays for this customer (office closed)</div></div>
        </div>
        <div style={{ gridColumn: "1/-1", display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={function(){onSave(f)}} disabled={!f.name || !f.phone1}>Save</Btn>
        </div>
      </div>
    );
  };

  var InvForm = function({ onSave, onCancel }) {
    var [f, setF] = useState({ customer_id: customers[0] ? customers[0].id : "", period_start: today, period_end: today, amount: 0 });
    var set = function(k, v) { setF(function(p){ return Object.assign({}, p, {[k]:v}); }); };
    var cust = customers.find(function(c){return c.id===f.customer_id});
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Inp label="Customer" value={f.customer_id} onChange={function(v){set("customer_id",v)}} options={customers.map(function(c){return c.id})} style={{ gridColumn: "1/-1" }} />
        {cust && <div style={{ gridColumn: "1/-1", color: C.textDim, fontSize: 12 }}>{cust.name} | {cust.default_veg||0}V + {cust.default_nonveg||0}NV + {cust.default_chapathi||0}Ch</div>}
        <Inp label="Period Start" value={f.period_start} onChange={function(v){set("period_start",v)}} type="date" />
        <Inp label="Period End" value={f.period_end} onChange={function(v){set("period_end",v)}} type="date" />
        <Inp label="Amount" value={f.amount} onChange={function(v){set("amount",parseInt(v)||0)}} type="number" style={{ gridColumn: "1/-1" }} />
        <div style={{ gridColumn: "1/-1", display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={function(){onSave({ id: "INV-" + Date.now().toString(36).toUpperCase(), customer_id: f.customer_id, period_start: f.period_start, period_end: f.period_end, period_label: f.period_start + " to " + f.period_end, amount: f.amount, status: "Unpaid" })}}>Create</Btn>
        </div>
      </div>
    );
  };

  var PriceForm = function({ onSave, onCancel }) {
    var [p, setP] = useState(Object.assign({}, prices));
    return (<div>{MEAL_TYPES.map(function(t){return <Inp key={t} label={t + " per meal"} value={p[t]} onChange={function(v){setP(function(pr){return Object.assign({},pr,{[t]:parseInt(v)||0})})}} type="number" style={{ marginBottom: 16 }} />})}<div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}><Btn onClick={onCancel}>Cancel</Btn><Btn primary onClick={function(){onSave(p)}}>Save</Btn></div></div>);
  };

  // Bill Till Date Form
  var BillGenForm = function({ cust, onGenerate, onCancel }) {
    var [endDate, setEndDate] = useState(today);
    var startDate = cust.last_billed || today;
    var days = countWorkingDays(startDate, endDate, cust.no_saturday);
    var vegAmt = (cust.default_veg || 0) * days * (prices.Veg || 0);
    var nvAmt = (cust.default_nonveg || 0) * days * (prices["Non-Veg"] || 0);
    var chAmt = (cust.default_chapathi || 0) * days * (prices.Chapathi || 0);
    var total = vegAmt + nvAmt + chAmt;
    return (
      <div>
        <div style={{ marginBottom: 20, padding: 16, background: C.bg, borderRadius: 10, border: "1px solid " + C.border }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{cust.name} ({cust.id})</div>
          <div style={{ fontSize: 12, color: C.textDim }}>Billing cycle: {cust.billing_cycle} | Last billed: {startDate}</div>
          <div style={{ fontSize: 12, color: C.textDim }}>Defaults: {cust.default_veg||0}V + {cust.default_nonveg||0}NV + {cust.default_chapathi||0}Ch{cust.no_saturday ? " | No Saturday" : ""}</div>
        </div>
        <Inp label="Bill end date" value={endDate} onChange={setEndDate} type="date" style={{ marginBottom: 16 }} />
        <div style={{ padding: 16, background: C.accent + "10", borderRadius: 10, border: "1px solid " + C.accent + "30", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>Bill preview: {startDate} to {endDate}</div>
          <div style={{ fontSize: 12, color: C.textDim }}>Working days: {days} (excl. Sundays{cust.no_saturday ? " + Saturdays" : ""})</div>
          <div style={{ fontSize: 12, color: C.textDim }}>Veg: {cust.default_veg||0} x {days} x {toINR(prices.Veg||0)} = {toINR(vegAmt)}</div>
          <div style={{ fontSize: 12, color: C.textDim }}>Non-Veg: {cust.default_nonveg||0} x {days} x {toINR(prices["Non-Veg"]||0)} = {toINR(nvAmt)}</div>
          <div style={{ fontSize: 12, color: C.textDim }}>Chapathi: {cust.default_chapathi||0} x {days} x {toINR(prices.Chapathi||0)} = {toINR(chAmt)}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, marginTop: 8, fontFamily: "'DM Mono', monospace" }}>Total: {toINR(total)}</div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={function(){onGenerate(cust, endDate)}} disabled={days<=0}>Generate Invoice</Btn>
        </div>
      </div>
    );
  };

  // TABS
  var renderDashboard = function() {
    var todayRev = kitchenData.veg * (prices.Veg||0) + kitchenData.nonveg * (prices["Non-Veg"]||0) + kitchenData.chapathi * (prices.Chapathi||0);
    return (<div>
      <div style={{ marginBottom: 28 }}><h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Welcome to Mullai</h1><p style={{ margin: "4px 0 0", color: C.textDim, fontSize: 14 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{isSunday(today) ? " (Sunday - Off)" : ""}</p></div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <Stat label="Meals Today" value={kitchenData.total} sub={kitchenData.veg+"V | "+kitchenData.nonveg+"NV | "+kitchenData.chapathi+"Ch"} accent={C.accent} />
        <Stat label="Customers" value={customers.length} sub={Object.keys(routeGroups).length + " routes"} />
        <Stat label="Pending" value={toINR(pendingTotal)} sub={invoices.filter(function(i){return i.status==="Unpaid"}).length+" invoices"} accent={C.red} />
        <Stat label="Revenue" value={toINR(todayRev)} accent={C.green} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 768 ? "1fr 1fr" : "1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Meal Breakdown</div>
          <div style={{ display: "flex", gap: 12 }}>
            {[{l:"Veg",v:kitchenData.veg,c:C.green},{l:"Non-Veg",v:kitchenData.nonveg,c:C.red},{l:"Chapathi",v:kitchenData.chapathi,c:C.accent}].map(function(m){ var pct = kitchenData.total ? Math.round(m.v/kitchenData.total*100) : 0; return <div key={m.l} style={{ flex:1, background:m.c+"12", borderRadius:12, padding:16, textAlign:"center" }}><div style={{ fontSize:24, fontWeight:700, color:m.c, fontFamily:"'DM Mono', monospace" }}>{m.v}</div><div style={{ fontSize:11, color:C.textDim, marginTop:4 }}>{m.l} ({pct}%)</div></div>; })}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Routes</div>
          {Object.keys(routeGroups).length === 0 && <p style={{ color: C.textDim, fontSize: 13 }}>Add customers</p>}
          {Object.entries(routeGroups).map(function(e){ return (<div key={e[0]} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid "+C.border }}><div><span style={{ fontWeight:600 }}>{e[0]}</span><span style={{ color:C.textDim, fontSize:12, marginLeft:8 }}>{e[1].length}</span></div><span style={{ fontWeight:700, fontFamily:"'DM Mono', monospace", color:C.accent }}>{e[1].reduce(function(s,c){return s+c.totalMeals},0)}</span></div>); })}
        </Card>
      </div>
    </div>);
  };

  var renderCustomers = function() {
    var filtered = customers.filter(function(c){return !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.id.toLowerCase().includes(searchQ.toLowerCase())});
    return (<div>
      <Header right={<><div style={{ position: "relative" }}><input value={searchQ} onChange={function(e){setSearchQ(e.target.value)}} placeholder="Search..." style={{ padding: "9px 12px 9px 36px", borderRadius: 8, border: "1px solid " + C.border, background: C.bg, color: C.text, fontSize: 13, outline: "none", width: 200, fontFamily: "inherit" }} /><span style={{ position: "absolute", left: 10, top: 9, color: C.textDim }}><Ico d={ICON.search} s={16} /></span></div><Btn primary onClick={function(){setEditCust(null);setModal("customer")}}><Ico d={ICON.plus} s={14} /> Add</Btn></>}>Customers</Header>
      <Tbl columns={[
        { key: "id", label: "ID", render: function(v){return <Badge>{v}</Badge>} },
        { key: "name", label: "Office", render: function(v,row){return <div><span style={{fontWeight:600}}>{v}</span>{row.no_saturday ? <span style={{marginLeft:6}}><Badge color={C.purple}>No Sat</Badge></span> : null}</div>} },
        { key: "route", label: "Route", render: function(v){return <Badge color={C.blue}>{v}</Badge>} },
        { key: "default_veg", label: "V", render: function(v){return <span style={{fontWeight:700,color:C.green,fontFamily:"'DM Mono', monospace"}}>{v||0}</span>} },
        { key: "default_nonveg", label: "NV", render: function(v){return <span style={{fontWeight:700,color:C.red,fontFamily:"'DM Mono', monospace"}}>{v||0}</span>} },
        { key: "default_chapathi", label: "Ch", render: function(v){return <span style={{fontWeight:700,color:C.accent,fontFamily:"'DM Mono', monospace"}}>{v||0}</span>} },
        { key: "billing_cycle", label: "Cycle" },
      ]} data={filtered} actions={function(row){return (<div style={{ display: "flex", gap: 6 }}>
        <Btn small onClick={function(){setEditCust(row);setModal("customer")}}><Ico d={ICON.edit} s={14} /></Btn>
        <Btn small onClick={function(){setBillGenCust(row)}} style={{background:C.green+"20",color:C.green,border:"1px solid "+C.green+"40"}}><Ico d={ICON.money} s={14} /></Btn>
        <Btn small danger onClick={function(){setDeleteConfirm(row)}}><Ico d={ICON.trash} s={14} /></Btn>
      </div>)}} />
      {modal === "customer" && <Modal title={editCust && editCust.id ? "Edit " + editCust.name : "Add Customer"} onClose={function(){setModal(null);setEditCust(null)}}><CustForm initial={editCust} onSave={saveCustomer} onCancel={function(){setModal(null);setEditCust(null)}} /></Modal>}
      {deleteConfirm && <Modal title="Confirm Delete" onClose={function(){setDeleteConfirm(null)}}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.red + "20", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><Ico d={ICON.trash} s={28} c={C.red} /></div>
          <h3 style={{ margin: "0 0 8px", color: C.text }}>Delete {deleteConfirm.name}?</h3>
          <p style={{ color: C.textDim, fontSize: 13, margin: "0 0 8px" }}>ID: {deleteConfirm.id}</p>
          <p style={{ color: C.red, fontSize: 13, margin: "0 0 24px", fontWeight: 600 }}>This permanently deletes all data for this customer. Cannot be undone.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}><Btn onClick={function(){setDeleteConfirm(null)}} style={{minWidth:120}}>Cancel</Btn><Btn danger onClick={function(){deleteCustomer(deleteConfirm.id)}} style={{minWidth:120}}>Yes, Delete</Btn></div>
        </div>
      </Modal>}
      {billGenCust && <Modal title="Generate Bill Till Date" onClose={function(){setBillGenCust(null)}}><BillGenForm cust={billGenCust} onGenerate={generateBillTillDate} onCancel={function(){setBillGenCust(null)}} /></Modal>}
    </div>);
  };

  var renderKitchen = function() { return (<div>
    <Header right={<><Inp value={selDate} onChange={setSelDate} type="date" /><Btn onClick={function(){exportCSV("kitchen_"+selDate+".csv", ["ID","Office","Veg","Non-Veg","Chapathi","Total","Route"], kitchenData.details.map(function(c){return [c.id,c.name,c.counts.veg,c.counts.nonveg,c.counts.chapathi,c.totalMeals,c.route]}))}}><Ico d={ICON.dl} s={14} /> Export</Btn></>}>{"Kitchen - " + selDate}</Header>
    {isSunday(selDate) && <div style={{ padding: "12px 20px", background: C.red+"15", border: "1px solid "+C.red+"30", borderRadius: 10, marginBottom: 16, color: C.red, fontSize: 13, fontWeight: 600 }}>Sunday - No deliveries</div>}
    <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <Stat label="Total" value={kitchenData.total} accent={C.accent} />
      <Stat label="Veg" value={kitchenData.veg} accent={C.green} />
      <Stat label="Non-Veg" value={kitchenData.nonveg} accent={C.red} />
      <Stat label="Chapathi" value={kitchenData.chapathi} accent={C.accent} />
    </div>
    <Tbl columns={[
      { key: "id", label: "ID", render: function(v){return <Badge>{v}</Badge>} },
      { key: "name", label: "Office", render: function(v){return <span style={{fontWeight:600}}>{v}</span>} },
      { key: "counts", label: "Veg", render: function(v){return <span style={{fontWeight:700,color:C.green,fontFamily:"'DM Mono', monospace"}}>{v.veg}</span>} },
      { key: "_nv", label: "NV", render: function(v,row){return <span style={{fontWeight:700,color:C.red,fontFamily:"'DM Mono', monospace"}}>{row.counts.nonveg}</span>} },
      { key: "_ch", label: "Ch", render: function(v,row){return <span style={{fontWeight:700,color:C.accent,fontFamily:"'DM Mono', monospace"}}>{row.counts.chapathi}</span>} },
      { key: "totalMeals", label: "Total", render: function(v){return <span style={{fontWeight:700,fontSize:15,fontFamily:"'DM Mono', monospace"}}>{v}</span>} },
      { key: "route", label: "Route" },
    ]} data={kitchenData.details} />
  </div>); };

  var renderBilling = function() { return (<div>
    <Header right={<><Btn onClick={function(){setModal("pricing")}}><Ico d={ICON.money} s={14} /> Pricing</Btn><Btn onClick={function(){setModal("invoice")}}><Ico d={ICON.plus} s={14} /> Invoice</Btn><Btn onClick={function(){exportCSV("invoices.csv", ["Invoice","Customer","Period","Amount","Status"], invoices.map(function(i){return [i.id,i.customer_id,i.period_label,i.amount,i.status]}))}}><Ico d={ICON.dl} s={14} /> Export</Btn></>}>Billing</Header>
    <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <Stat label="Pricing" value="" sub={MEAL_TYPES.map(function(t){return t+": "+toINR(prices[t])}).join(" | ")} />
      <Stat label="Pending" value={toINR(pendingTotal)} accent={C.red} />
      <Stat label="Collected" value={toINR(invoices.filter(function(i){return i.status==="Paid"}).reduce(function(s,i){return s+Number(i.amount)},0))} accent={C.green} />
    </div>
    <Tbl columns={[
      { key: "id", label: "Invoice", render: function(v){return <span style={{fontWeight:600}}>{v}</span>} },
      { key: "customer_id", label: "Customer", render: function(v){var c=customers.find(function(x){return x.id===v}); return c?c.name:v;} },
      { key: "period_label", label: "Period" },
      { key: "amount", label: "Amount", render: function(v){return <span style={{fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{toINR(v)}</span>} },
      { key: "status", label: "Status", render: function(v){return <Badge color={v==="Paid"?C.green:C.red}>{v}</Badge>} },
    ]} data={invoices} actions={function(row){return (<div style={{display:"flex",gap:6}}>
      {row.status==="Unpaid" && <Btn small primary onClick={function(){markPaid(row.id)}}>Paid</Btn>}
      <Btn small danger onClick={function(){setDeleteInvConfirm(row)}}><Ico d={ICON.trash} s={14} /></Btn>
    </div>)}} />
    {modal === "pricing" && <Modal title="Pricing" onClose={function(){setModal(null)}}><PriceForm onSave={updatePricing} onCancel={function(){setModal(null)}} /></Modal>}
    {modal === "invoice" && <Modal title="New Invoice" onClose={function(){setModal(null)}}><InvForm onSave={createInvoice} onCancel={function(){setModal(null)}} /></Modal>}
    {deleteInvConfirm && <Modal title="Delete Invoice?" onClose={function(){setDeleteInvConfirm(null)}}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ color: C.text, fontSize: 14 }}>Delete invoice <strong>{deleteInvConfirm.id}</strong> for {toINR(deleteInvConfirm.amount)}?</p>
        <p style={{ color: C.red, fontSize: 12, marginBottom: 20 }}>This cannot be undone.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}><Btn onClick={function(){setDeleteInvConfirm(null)}}>Cancel</Btn><Btn danger onClick={function(){deleteInvoice(deleteInvConfirm.id)}}>Delete</Btn></div>
      </div>
    </Modal>}
  </div>); };

  var renderDelivery = function() { return (<div>
    <Header right={<><Inp value={selDate} onChange={setSelDate} type="date" /><Inp value={routeFilter} onChange={setRouteFilter} options={["All"].concat(ROUTES)} /></>}>{"Delivery - " + selDate}</Header>
    {isSunday(selDate) && <div style={{ padding: "12px 20px", background: C.red+"15", border: "1px solid "+C.red+"30", borderRadius: 10, marginBottom: 16, color: C.red, fontSize: 13, fontWeight: 600 }}>Sunday - No deliveries</div>}
    {Object.entries(routeGroups).filter(function(e){return routeFilter==="All"||e[0]===routeFilter}).map(function(entry){var route=entry[0]; var list=entry[1]; return (
      <Card key={route} style={{ marginBottom: 20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div><span style={{ fontSize:16, fontWeight:700 }}>{route}</span> <Badge color={C.blue}>{list.length+" | "+list.reduce(function(s,c){return s+c.totalMeals},0)+" meals"}</Badge></div>
          <Btn primary onClick={function(){sendWhatsApp(route)}}><svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d={ICON.wa} /></svg> WhatsApp</Btn>
        </div>
        {list.map(function(c, i){return (<div key={c.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 0", borderTop: i ? "1px solid "+C.border : "none" }}>
          <div style={{ width:32, height:32, borderRadius:8, background:C.accentDim, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:C.accent, flexShrink:0 }}>{i+1}</div>
          <div style={{ flex:1, minWidth:0 }}><div style={{ fontWeight:600, fontSize:14 }}>{c.name}{c.no_saturday && isSaturday(selDate) ? " (Off)" : ""}</div><div style={{ fontSize:12, color:C.textDim }}>{c.address}</div><div style={{ fontSize:12, color:C.textMid, marginTop:2 }}>{c.phone1}{c.map_link ? " | " : ""}{c.map_link ? <a href={c.map_link} target="_blank" rel="noreferrer" style={{ color:C.blue, textDecoration:"none" }}>Map</a> : null}</div></div>
          <div style={{ textAlign:"right", flexShrink:0 }}><div style={{ fontWeight:700, fontSize:18, fontFamily:"'DM Mono', monospace", color:C.accent }}>{c.totalMeals}</div><MealCounts counts={c.counts} /></div>
        </div>)})}
      </Card>
    ); })}
  </div>); };

  var renderReports = function() {
    return <ReportsTab customers={customers} overrides={overrides} invoices={invoices} prices={prices} reportDate={reportDate} setReportDate={setReportDate} reportDateEnd={reportDateEnd} setReportDateEnd={setReportDateEnd} reportTab={reportTab} setReportTab={setReportTab} />;
  };

  if (authLoading) return <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:"'DM Sans', sans-serif" }}><div style={{color:C.textDim}}>Loading...</div></div>;
  if (!user) return <LoginScreen onLogin={setUser} />;
  if (loading) return <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:"'DM Sans', sans-serif" }}><div style={{color:C.textDim}}>Loading data...</div></div>;

  var pages = {
    Dashboard: renderDashboard,
    Customers: renderCustomers,
    Operations: function(){ return <OperationsTab customers={customers} overrides={overrides} selDate={selDate} setSelDate={setSelDate} onSaveOverride={saveOverride} onRemoveOverride={removeOverride} showToast={showToast} />; },
    Kitchen: renderKitchen,
    Billing: renderBilling,
    Delivery: renderDelivery,
    Reports: renderReports,
  };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans', sans-serif", background:C.bg, color:C.text, overflow:"hidden" }}>
      <div style={{ width: sidebar?220:56, background:C.card, borderRight:"1px solid "+C.border, display:"flex", flexDirection:"column", transition:"width .2s", flexShrink:0, overflow:"hidden" }}>
        <div onClick={function(){setSidebar(!sidebar)}} style={{ padding: sidebar?"20px 16px":"20px 10px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg, "+C.accent+", #D4842A)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:C.accentText, flexShrink:0 }}>M</div>
          {sidebar && <div><div style={{ fontWeight:700, fontSize:15, lineHeight:1 }}>Mullai</div><div style={{ fontSize:10, color:C.textDim, marginTop:2, letterSpacing:1 }}>MEAL DELIVERY</div></div>}
        </div>
        <nav style={{ padding:"12px 8px", flex:1 }}>
          {TABS.map(function(t){return (<div key={t} onClick={function(){setTab(t);if(window.innerWidth<768)setSidebar(false)}} style={{ display:"flex", alignItems:"center", gap:12, padding: sidebar?"10px 14px":"10px 12px", borderRadius:10, cursor:"pointer", marginBottom:2, background: tab===t?C.accentDim:"transparent", color: tab===t?C.accent:C.textDim, justifyContent: sidebar?"flex-start":"center" }}><Ico d={tabIcons[t]} s={18} />{sidebar && <span style={{ fontSize:13, fontWeight: tab===t?600:400 }}>{t}</span>}</div>)})}
        </nav>
        <div style={{ padding: sidebar?"12px 16px":"12px 8px", borderTop:"1px solid "+C.border }}>
          <div onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, cursor:"pointer", color:C.textDim, justifyContent: sidebar?"flex-start":"center" }}><Ico d={ICON.logout} s={18} />{sidebar && <span style={{ fontSize:13 }}>Logout</span>}</div>
          {sidebar && <div style={{ fontSize:10, color:C.textDim, padding:"8px 14px", overflow:"hidden", textOverflow:"ellipsis" }}>{user.email}</div>}
        </div>
      </div>
      <div style={{ flex:1, overflow:"auto", padding: window.innerWidth<768 ? "20px 16px" : "28px 36px" }}>{pages[tab] ? pages[tab]() : null}</div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={function(){setToast(null)}} />}
    </div>
  );
}
