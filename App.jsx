import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// --- SUPABASE CLIENT ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://mretgmwksftvqeltfbfk.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZXRnbXdrc2Z0dnFlbHRmYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTk0NjEsImV4cCI6MjA5MTEzNTQ2MX0.W6e-ptM0Gp-v3z-W60-HsB6XXmmo2rSaMqemxwv2qXI"
);

// --- CONSTANTS ---
const MEAL_TYPES = ["Veg", "Non-Veg", "Chapathi"];
const BILLING_CYCLES = ["Weekly", "15 Days", "30 Days"];
const ROUTES = ["Route 1", "Route 2", "Route 3", "Route 4", "Route 5"];
const TABS = ["Dashboard", "Customers", "Operations", "Kitchen", "Billing", "Delivery", "Reports"];

const fmt = (d) => (typeof d === "string" ? d : d.toISOString().split("T")[0]);
const today = fmt(new Date());
const toINR = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN");
const genId = (n) => `MLB${String(n).padStart(3, "0")}`;

// --- COLORS ---
const C = {
  bg: "#0C0F12", card: "#151920", cardHover: "#1A2029", border: "#222933",
  accent: "#E8A838", accentDim: "#E8A83833", accentText: "#0C0F12",
  text: "#E8ECF1", textDim: "#7B8594", textMid: "#A3ADBA",
  green: "#34D399", red: "#F87171", blue: "#60A5FA",
};

// --- ICONS (SVG paths) ---
const ICON = {
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
  loader: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4",
};
const tabIcons = { Dashboard: ICON.home, Customers: ICON.users, Operations: ICON.ops, Kitchen: ICON.cup, Billing: ICON.file, Delivery: ICON.map, Reports: ICON.bar };

const Ico = ({ d, s = 18, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

// --- UI COMPONENTS ---
const Badge = ({ children, color = C.accent }) => (
  <span style={{ background: color + "20", color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: .5, whiteSpace: "nowrap" }}>{children}</span>
);

const Btn = ({ children, onClick, primary, small, danger, disabled, style: st }) => (
  <button disabled={disabled} onClick={onClick} style={{
    padding: small ? "6px 14px" : "10px 22px", borderRadius: 8, border: primary || danger ? "none" : `1px solid ${C.border}`,
    cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: small ? 12 : 13,
    display: "inline-flex", alignItems: "center", gap: 6, transition: "all .15s", fontFamily: "inherit",
    background: danger ? C.red : primary ? C.accent : C.card,
    color: danger ? "#fff" : primary ? C.accentText : C.text, opacity: disabled ? .5 : 1, ...st,
  }}>{children}</button>
);

const Inp = ({ label, value, onChange, type = "text", options, placeholder, style: st, textarea }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, ...st }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
    )}
  </div>
);

const Card = ({ children, style: st }) => (
  <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, ...st }}>{children}</div>
);

const Stat = ({ label, value, sub, accent }) => (
  <Card style={{ flex: 1, minWidth: 170 }}>
    <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: accent || C.text, fontFamily: "'DM Mono', monospace" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{sub}</div>}
  </Card>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28, width: wide ? 700 : 500, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, color: C.text }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer" }}><Ico d={ICON.x} /></button>
      </div>
      {children}
    </div>
  </div>
);

const Tbl = ({ columns, data, actions }) => (
  <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead><tr>
        {columns.map(c => <th key={c.key} style={{ textAlign: "left", padding: "12px 16px", background: C.bg, color: C.textDim, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{c.label}</th>)}
        {actions && <th style={{ textAlign: "right", padding: "12px 16px", background: C.bg, color: C.textDim, fontWeight: 600, fontSize: 11, letterSpacing: 1, borderBottom: `1px solid ${C.border}` }}>Actions</th>}
      </tr></thead>
      <tbody>{data.map((row, i) => (
        <tr key={row.id || i} style={{ borderBottom: `1px solid ${C.border}` }}>
          {columns.map(c => <td key={c.key} style={{ padding: "12px 16px", color: C.text, whiteSpace: "nowrap" }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
          {actions && <td style={{ padding: "12px 16px", textAlign: "right" }}>{actions(row)}</td>}
        </tr>
      ))}</tbody>
    </table>
    {data.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.textDim }}>No data found</div>}
  </div>
);

const Header = ({ children, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>{children}</h2>
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{right}</div>
  </div>
);

const Toast = ({ msg, type, onClose }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, background: type === "error" ? C.red : C.green, color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>
    {msg}
    <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: 8 }}><Ico d={ICON.x} s={14} /></button>
  </div>
);

// --- CSV EXPORT ---
const exportCSV = (filename, headers, rows) => {
  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = filename; a.click();
};

// ==========================================
// MAIN APP
// ==========================================
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [customers, setCustomers] = useState([]);
  const [prices, setPrices] = useState({ Veg: 90, "Non-Veg": 120, Chapathi: 75 });
  const [overrides, setOverrides] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editCust, setEditCust] = useState(null);
  const [selDate, setSelDate] = useState(today);
  const [searchQ, setSearchQ] = useState("");
  const [routeFilter, setRouteFilter] = useState("All");
  const [reportTab, setReportTab] = useState("Kitchen");
  const [sidebar, setSidebar] = useState(window.innerWidth > 768);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  // --- LOAD DATA ---
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, pRes, oRes, iRes] = await Promise.all([
        supabase.from("customers").select("*").order("created_at"),
        supabase.from("pricing").select("*"),
        supabase.from("daily_overrides").select("*"),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      ]);
      if (cRes.data) setCustomers(cRes.data);
      if (pRes.data) {
        const p = {};
        pRes.data.forEach(r => { p[r.meal_type] = r.price; });
        setPrices(p);
      }
      if (oRes.data) setOverrides(oRes.data);
      if (iRes.data) setInvoices(iRes.data);
    } catch (e) { console.error(e); showToast("Failed to load data", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // --- HELPERS ---
  const getMealCount = useCallback((cust, date) => {
    const ov = overrides.find(o => o.customer_id === cust.id && o.override_date === date);
    return ov ? ov.meal_count : cust.default_meals;
  }, [overrides]);

  const kitchenData = useMemo(() => {
    const d = { Veg: 0, "Non-Veg": 0, Chapathi: 0, total: 0, details: [] };
    customers.forEach(c => {
      const count = getMealCount(c, selDate);
      d[c.meal_type] += count;
      d.total += count;
      d.details.push({ ...c, todayMeals: count });
    });
    return d;
  }, [customers, selDate, getMealCount]);

  const routeGroups = useMemo(() => {
    const g = {};
    customers.forEach(c => {
      if (!g[c.route]) g[c.route] = [];
      g[c.route].push({ ...c, todayMeals: getMealCount(c, selDate) });
    });
    return g;
  }, [customers, selDate, getMealCount]);

  const pendingTotal = invoices.filter(i => i.status === "Unpaid").reduce((s, i) => s + Number(i.amount), 0);

  // --- CUSTOMER CRUD ---
  const saveCustomer = async (data) => {
    try {
      if (editCust?.id && customers.find(c => c.id === editCust.id)) {
        const { error } = await supabase.from("customers").update({
          name: data.name, address: data.address, phone1: data.phone1, phone2: data.phone2,
          map_link: data.map_link, default_meals: data.default_meals, meal_type: data.meal_type,
          billing_cycle: data.billing_cycle, route: data.route, updated_at: new Date().toISOString(),
        }).eq("id", editCust.id);
        if (error) throw error;
        showToast("Customer updated!");
      } else {
        const { data: settings } = await supabase.from("app_settings").select("value").eq("key", "customer_counter").single();
        const nextNum = (parseInt(settings?.value || "0") + 1);
        const newId = genId(nextNum);
        const { error } = await supabase.from("customers").insert({
          id: newId, name: data.name, address: data.address, phone1: data.phone1, phone2: data.phone2,
          map_link: data.map_link, default_meals: data.default_meals, meal_type: data.meal_type,
          billing_cycle: data.billing_cycle, route: data.route, balance: 0, last_billed: today,
        });
        if (error) throw error;
        await supabase.from("app_settings").update({ value: String(nextNum) }).eq("key", "customer_counter");
        showToast(`Customer ${newId} added!`);
      }
      await loadAll();
      setModal(null); setEditCust(null);
    } catch (e) { console.error(e); showToast("Error saving: " + e.message, "error"); }
  };

  const deleteCustomer = async (id) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) { showToast("Error: " + error.message, "error"); return; }
    showToast("Customer deleted"); loadAll();
  };

  // --- OVERRIDE ---
  const saveOverride = async (custId, date, count) => {
    try {
      const { error } = await supabase.from("daily_overrides").upsert(
        { customer_id: custId, override_date: date, meal_count: count },
        { onConflict: "customer_id,override_date" }
      );
      if (error) throw error;
      showToast("Meal count updated!"); loadAll();
    } catch (e) { showToast("Error: " + e.message, "error"); }
  };

  const removeOverride = async (custId, date) => {
    await supabase.from("daily_overrides").delete().eq("customer_id", custId).eq("override_date", date);
    showToast("Reset to default"); loadAll();
  };

  // --- INVOICES ---
  const markPaid = async (id) => {
    await supabase.from("invoices").update({ status: "Paid", paid_at: new Date().toISOString() }).eq("id", id);
    showToast("Invoice marked as paid!"); loadAll();
  };

  const createInvoice = async (data) => {
    try {
      const { error } = await supabase.from("invoices").insert(data);
      if (error) throw error;
      showToast("Invoice created!"); loadAll(); setModal(null);
    } catch (e) { showToast("Error: " + e.message, "error"); }
  };

  // --- PRICING ---
  const updatePricing = async (newPrices) => {
    try {
      for (const mt of MEAL_TYPES) {
        await supabase.from("pricing").update({ price: newPrices[mt], updated_at: new Date().toISOString() }).eq("meal_type", mt);
      }
      setPrices(newPrices); showToast("Pricing updated!"); setModal(null);
    } catch (e) { showToast("Error: " + e.message, "error"); }
  };

  // --- WHATSAPP ---
  const sendWhatsApp = (route) => {
    const list = routeGroups[route] || [];
    let msg = `🍱 *MULLAI DELIVERIES*\n📅 ${selDate} | ${route}\n${"━".repeat(28)}\n\n`;
    list.forEach((c, i) => {
      msg += `*${i + 1}. ${c.name}*\n📍 ${c.address}\n📞 ${c.phone1}\n🍽️ ${c.todayMeals} × ${c.meal_type}\n${c.map_link ? `🔗 ${c.map_link}\n` : ""}${"─".repeat(26)}\n\n`;
    });
    msg += `\u2705 Total: ${list.reduce((s, c) => s + c.todayMeals, 0)} meals`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // --- CUSTOMER FORM ---
  const CustForm = ({ initial, onSave, onCancel }) => {
    const empty = { name: "", address: "", phone1: "", phone2: "", map_link: "", default_meals: 10, meal_type: "Veg", billing_cycle: "30 Days", route: "Route 1" };
    const [f, setF] = useState(initial ? { name: initial.name, address: initial.address, phone1: initial.phone1, phone2: initial.phone2 || "", map_link: initial.map_link || "", default_meals: initial.default_meals, meal_type: initial.meal_type, billing_cycle: initial.billing_cycle, route: initial.route } : empty);
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Inp label="Office Name" value={f.name} onChange={v => set("name", v)} placeholder="e.g. TCS Siruseri" style={{ gridColumn: "1/-1" }} />
        <Inp label="Address" value={f.address} onChange={v => set("address", v)} placeholder="Full address" style={{ gridColumn: "1/-1" }} textarea />
        <Inp label="Primary Contact" value={f.phone1} onChange={v => set("phone1", v)} placeholder="9876543210" />
        <Inp label="Secondary Contact" value={f.phone2} onChange={v => set("phone2", v)} placeholder="Optional" />
        <Inp label="Google Maps Link" value={f.map_link} onChange={v => set("map_link", v)} placeholder="https://maps.google.com/..." style={{ gridColumn: "1/-1" }} />
        <Inp label="Default Meal Count" value={f.default_meals} onChange={v => set("default_meals", parseInt(v) || 0)} type="number" />
        <Inp label="Meal Type" value={f.meal_type} onChange={v => set("meal_type", v)} options={MEAL_TYPES} />
        <Inp label="Billing Cycle" value={f.billing_cycle} onChange={v => set("billing_cycle", v)} options={BILLING_CYCLES} />
        <Inp label="Route" value={f.route} onChange={v => set("route", v)} options={ROUTES} />
        <div style={{ gridColumn: "1/-1", display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={() => onSave(f)} disabled={!f.name || !f.phone1}>Save Customer</Btn>
        </div>
      </div>
    );
  };

  // --- INVOICE FORM ---
  const InvForm = ({ onSave, onCancel }) => {
    const [f, setF] = useState({ customer_id: customers[0]?.id || "", period_start: today, period_end: today, amount: 0 });
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    const cust = customers.find(c => c.id === f.customer_id);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Inp label="Customer" value={f.customer_id} onChange={v => set("customer_id", v)} options={customers.map(c => c.id)} style={{ gridColumn: "1/-1" }} />
        {cust && <div style={{ gridColumn: "1/-1", color: C.textDim, fontSize: 12 }}>{cust.name} · {cust.meal_type} · {toINR(prices[cust.meal_type])}/meal</div>}
        <Inp label="Period Start" value={f.period_start} onChange={v => set("period_start", v)} type="date" />
        <Inp label="Period End" value={f.period_end} onChange={v => set("period_end", v)} type="date" />
        <Inp label="Amount (₹)" value={f.amount} onChange={v => set("amount", parseInt(v) || 0)} type="number" style={{ gridColumn: "1/-1" }} />
        <div style={{ gridColumn: "1/-1", display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={() => onSave({ id: `INV-${Date.now().toString(36).toUpperCase()}`, customer_id: f.customer_id, period_start: f.period_start, period_end: f.period_end, period_label: `${f.period_start} to ${f.period_end}`, amount: f.amount, status: "Unpaid" })}>Create Invoice</Btn>
        </div>
      </div>
    );
  };

  // --- PRICING FORM ---
  const PriceForm = ({ onSave, onCancel }) => {
    const [p, setP] = useState({ ...prices });
    return (
      <div>
        {MEAL_TYPES.map(t => <Inp key={t} label={`${t} (₹ per meal)`} value={p[t]} onChange={v => setP(pr => ({ ...pr, [t]: parseInt(v) || 0 }))} type="number" style={{ marginBottom: 16 }} />)}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={() => onSave(p)}>Save Pricing</Btn>
        </div>
      </div>
    );
  };

  // ==========================================
  // TAB RENDERS
  // ==========================================

  const renderDashboard = () => (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"} 👋</h1>
        <p style={{ margin: "4px 0 0", color: C.textDim, fontSize: 14 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <Stat label="Total Meals Today" value={kitchenData.total} sub={`${kitchenData.Veg} Veg · ${kitchenData["Non-Veg"]} NV · ${kitchenData.Chapathi} Ch`} accent={C.accent} />
        <Stat label="Active Customers" value={customers.length} sub={`${Object.keys(routeGroups).length} routes`} />
        <Stat label="Pending Payments" value={toINR(pendingTotal)} sub={`${invoices.filter(i => i.status === "Unpaid").length} invoices`} accent={C.red} />
        <Stat label="Today's Revenue" value={toINR(kitchenData.details.reduce((s, c) => s + c.todayMeals * (prices[c.meal_type] || 0), 0))} accent={C.green} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Meal Breakdown</div>
          <div style={{ display: "flex", gap: 12 }}>
            {MEAL_TYPES.map(t => {
              const pct = kitchenData.total ? Math.round(kitchenData[t] / kitchenData.total * 100) : 0;
              const clr = t === "Veg" ? C.green : t === "Non-Veg" ? C.red : C.accent;
              return (<div key={t} style={{ flex: 1, background: clr + "12", borderRadius: 12, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: clr, fontFamily: "'DM Mono', monospace" }}>{kitchenData[t]}</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{t} ({pct}%)</div>
              </div>);
            })}
          </div>
          <div style={{ marginTop: 16, height: 8, borderRadius: 4, background: C.bg, display: "flex", overflow: "hidden" }}>
            {MEAL_TYPES.map(t => { const pct = kitchenData.total ? kitchenData[t] / kitchenData.total * 100 : 0; const clr = t === "Veg" ? C.green : t === "Non-Veg" ? C.red : C.accent; return <div key={t} style={{ width: pct + "%", background: clr }} />; })}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Route Summary</div>
          {Object.entries(routeGroups).length === 0 && <p style={{ color: C.textDim, fontSize: 13 }}>Add customers to see routes</p>}
          {Object.entries(routeGroups).map(([route, list]) => (
            <div key={route} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div><span style={{ fontWeight: 600, fontSize: 13 }}>{route}</span><span style={{ color: C.textDim, fontSize: 12, marginLeft: 8 }}>{list.length} stops</span></div>
              <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace", color: C.accent }}>{list.reduce((s, c) => s + c.todayMeals, 0)}</span>
            </div>
          ))}
        </Card>
      </div>
      {invoices.filter(i => i.status === "Unpaid").length > 0 && (
        <Card style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Pending Invoices</div>
          <Tbl columns={[
            { key: "id", label: "Invoice", render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
            { key: "customer_id", label: "Customer", render: v => { const c = customers.find(x => x.id === v); return c ? c.name : v; } },
            { key: "period_label", label: "Period" },
            { key: "amount", label: "Amount", render: v => <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{toINR(v)}</span> },
          ]} data={invoices.filter(i => i.status === "Unpaid")} actions={row => <Btn small primary onClick={() => markPaid(row.id)}>Mark Paid</Btn>} />
        </Card>
      )}
    </div>
  );

  const renderCustomers = () => {
    const filtered = customers.filter(c => !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.id.toLowerCase().includes(searchQ.toLowerCase()));
    return (<div>
      <Header right={<>
        <div style={{ position: "relative" }}>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search..." style={{ padding: "9px 12px 9px 36px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, outline: "none", width: 200, fontFamily: "inherit" }} />
          <span style={{ position: "absolute", left: 10, top: 9, color: C.textDim }}><Ico d={ICON.search} s={16} /></span>
        </div>
        <Btn primary onClick={() => { setEditCust(null); setModal("customer"); }}><Ico d={ICON.plus} s={14} /> Add Customer</Btn>
      </>}>Customer Management</Header>
      <Tbl columns={[
        { key: "id", label: "ID", render: v => <Badge>{v}</Badge> },
        { key: "name", label: "Office", render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
        { key: "route", label: "Route", render: v => <Badge color={C.blue}>{v}</Badge> },
        { key: "meal_type", label: "Type", render: v => <Badge color={v === "Veg" ? C.green : v === "Non-Veg" ? C.red : C.accent}>{v}</Badge> },
        { key: "default_meals", label: "Default", render: v => <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{v}</span> },
        { key: "billing_cycle", label: "Cycle" },
        { key: "phone1", label: "Contact" },
      ]} data={filtered} actions={row => (<div style={{ display: "flex", gap: 8 }}>
        <Btn small onClick={() => { setEditCust(row); setModal("customer"); }}><Ico d={ICON.edit} s={14} /></Btn>
        <Btn small danger onClick={() => deleteCustomer(row.id)}><Ico d={ICON.trash} s={14} /></Btn>
      </div>)} />
      {modal === "customer" && <Modal title={editCust?.id ? `Edit ${editCust.name}` : "Add New Customer"} onClose={() => { setModal(null); setEditCust(null); }}>
        <CustForm initial={editCust} onSave={saveCustomer} onCancel={() => { setModal(null); setEditCust(null); }} />
      </Modal>}
    </div>);
  };

  const renderOperations = () => {
    const [editId, setEditId] = useState(null);
    const [editVal, setEditVal] = useState("");
    return (<div>
      <Header right={<Inp value={selDate} onChange={setSelDate} type="date" />}>Daily Operations — {selDate}</Header>
      <Tbl columns={[
        { key: "id", label: "ID", render: v => <Badge>{v}</Badge> },
        { key: "name", label: "Office", render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
        { key: "meal_type", label: "Type", render: v => <Badge color={v === "Veg" ? C.green : v === "Non-Veg" ? C.red : C.accent}>{v}</Badge> },
        { key: "default_meals", label: "Default", render: v => <span style={{ color: C.textDim }}>{v}</span> },
        { key: "todayMeals", label: "Today's Count", render: (v, row) => {
          const isOv = overrides.some(o => o.customer_id === row.id && o.override_date === selDate);
          if (editId === row.id) return (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input autoFocus type="number" value={editVal} onChange={e => setEditVal(e.target.value)} style={{ width: 70, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.accent}`, background: C.bg, color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
                onKeyDown={e => { if (e.key === "Enter") { saveOverride(row.id, selDate, parseInt(editVal) || 0); setEditId(null); } if (e.key === "Escape") setEditId(null); }} />
              <Btn small primary onClick={() => { saveOverride(row.id, selDate, parseInt(editVal) || 0); setEditId(null); }}><Ico d={ICON.check} s={14} /></Btn>
              <Btn small onClick={() => setEditId(null)}><Ico d={ICON.x} s={14} /></Btn>
            </div>
          );
          return <span onClick={() => { setEditId(row.id); setEditVal(String(v)); }} style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace", color: isOv ? C.accent : C.text, cursor: "pointer", borderBottom: `1px dashed ${isOv ? C.accent : C.textDim}` }}>{v} {isOv && "✎"}</span>;
        }},
        { key: "route", label: "Route" },
      ]} data={kitchenData.details} actions={row => {
        const isOv = overrides.some(o => o.customer_id === row.id && o.override_date === selDate);
        return isOv ? <Btn small danger onClick={() => removeOverride(row.id, selDate)}>Reset</Btn> : null;
      }} />
    </div>);
  };

  const renderKitchen = () => (<div>
    <Header right={<>
      <Inp value={selDate} onChange={setSelDate} type="date" />
      <Btn onClick={() => exportCSV(`kitchen_${selDate}.csv`, ["ID", "Office", "Type", "Meals", "Route"], kitchenData.details.map(c => [c.id, c.name, c.meal_type, c.todayMeals, c.route]))}><Ico d={ICON.dl} s={14} /> Export</Btn>
    </>}>Kitchen Report — {selDate}</Header>
    <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <Stat label="Total Meals" value={kitchenData.total} accent={C.accent} />
      {MEAL_TYPES.map(t => <Stat key={t} label={t} value={kitchenData[t]} accent={t === "Veg" ? C.green : t === "Non-Veg" ? C.red : C.accent} />)}
    </div>
    <Tbl columns={[
      { key: "id", label: "ID", render: v => <Badge>{v}</Badge> },
      { key: "name", label: "Office", render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
      { key: "meal_type", label: "Type", render: v => <Badge color={v === "Veg" ? C.green : v === "Non-Veg" ? C.red : C.accent}>{v}</Badge> },
      { key: "todayMeals", label: "Count", render: v => <span style={{ fontWeight: 700, fontSize: 16, fontFamily: "'DM Mono', monospace" }}>{v}</span> },
      { key: "route", label: "Route" },
    ]} data={kitchenData.details} />
  </div>);

  const renderBilling = () => (<div>
    <Header right={<>
      <Btn onClick={() => setModal("pricing")}><Ico d={ICON.money} s={14} /> Pricing</Btn>
      <Btn onClick={() => setModal("invoice")}><Ico d={ICON.plus} s={14} /> New Invoice</Btn>
      <Btn onClick={() => exportCSV("invoices.csv", ["Invoice", "Customer", "Period", "Amount", "Status"], invoices.map(i => [i.id, i.customer_id, i.period_label, i.amount, i.status]))}><Ico d={ICON.dl} s={14} /> Export</Btn>
    </>}>Billing & Invoices</Header>
    <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <Stat label="Pricing" value="" sub={MEAL_TYPES.map(t => `${t}: ${toINR(prices[t])}`).join(" · ")} />
      <Stat label="Pending" value={toINR(pendingTotal)} accent={C.red} />
      <Stat label="Collected" value={toINR(invoices.filter(i => i.status === "Paid").reduce((s, i) => s + Number(i.amount), 0))} accent={C.green} />
    </div>
    <Tbl columns={[
      { key: "id", label: "Invoice", render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
      { key: "customer_id", label: "Customer", render: v => { const c = customers.find(x => x.id === v); return c ? <><Badge>{v}</Badge> <span style={{ marginLeft: 8 }}>{c.name}</span></> : v; } },
      { key: "period_label", label: "Period" },
      { key: "amount", label: "Amount", render: v => <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{toINR(v)}</span> },
      { key: "status", label: "Status", render: v => <Badge color={v === "Paid" ? C.green : C.red}>{v}</Badge> },
    ]} data={invoices} actions={row => row.status === "Unpaid" ? <Btn small primary onClick={() => markPaid(row.id)}>Mark Paid</Btn> : <Badge color={C.green}>Settled</Badge>} />
    {modal === "pricing" && <Modal title="Update Pricing" onClose={() => setModal(null)}><PriceForm onSave={updatePricing} onCancel={() => setModal(null)} /></Modal>}
    {modal === "invoice" && <Modal title="Create Invoice" onClose={() => setModal(null)}><InvForm onSave={createInvoice} onCancel={() => setModal(null)} /></Modal>}
  </div>);

  const renderDelivery = () => (<div>
    <Header right={<>
      <Inp value={selDate} onChange={setSelDate} type="date" />
      <Inp value={routeFilter} onChange={setRouteFilter} options={["All", ...ROUTES]} />
    </>}>Delivery — {selDate}</Header>
    {Object.entries(routeGroups).filter(([r]) => routeFilter === "All" || r === routeFilter).map(([route, list]) => (
      <Card key={route} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div><span style={{ fontSize: 16, fontWeight: 700 }}>{route}</span> <Badge color={C.blue}>{list.length} stops · {list.reduce((s, c) => s + c.todayMeals, 0)} meals</Badge></div>
          <Btn primary onClick={() => sendWhatsApp(route)}><svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d={ICON.wa} /></svg> WhatsApp</Btn>
        </div>
        {list.map((c, i) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderTop: i ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: C.accent, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: C.textDim, overflow: "hidden", textOverflow: "ellipsis" }}>{c.address}</div>
              <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{c.phone1} {c.map_link && <> · <a href={c.map_link} target="_blank" rel="noreferrer" style={{ color: C.blue, textDecoration: "none" }}>📍 Map</a></>}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 20, fontFamily: "'DM Mono', monospace", color: C.accent }}>{c.todayMeals}</div>
              <Badge color={c.meal_type === "Veg" ? C.green : c.meal_type === "Non-Veg" ? C.red : C.accent}>{c.meal_type}</Badge>
            </div>
          </div>
        ))}
      </Card>
    ))}
    {Object.keys(routeGroups).length === 0 && <Card><p style={{ color: C.textDim, textAlign: "center" }}>Add customers to see delivery routes</p></Card>}
  </div>);

  const renderReports = () => {
    const RTYPES = ["Kitchen", "Billing", "Customer", "Delivery", "Route", "Payments"];
    return (<div>
      <Header>Reports</Header>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {RTYPES.map(r => <Btn key={r} small primary={reportTab === r} onClick={() => setReportTab(r)}>{r}</Btn>)}
      </div>
      {reportTab === "Kitchen" && renderKitchen()}
      {reportTab === "Billing" && <Tbl columns={[
        { key: "id", label: "Invoice" }, { key: "customer_id", label: "Customer", render: v => customers.find(c => c.id === v)?.name || v },
        { key: "period_label", label: "Period" }, { key: "amount", label: "Amount", render: v => toINR(v) },
        { key: "status", label: "Status", render: v => <Badge color={v === "Paid" ? C.green : C.red}>{v}</Badge> },
      ]} data={invoices} />}
      {reportTab === "Customer" && <Tbl columns={[
        { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "route", label: "Route" },
        { key: "meal_type", label: "Type" }, { key: "default_meals", label: "Meals" }, { key: "billing_cycle", label: "Cycle" },
      ]} data={customers} />}
      {reportTab === "Delivery" && <><Inp value={selDate} onChange={setSelDate} type="date" style={{ marginBottom: 16, maxWidth: 200 }} />
        <Tbl columns={[{ key: "id", label: "ID" }, { key: "name", label: "Office" }, { key: "route", label: "Route" }, { key: "meal_type", label: "Type" },
          { key: "todayMeals", label: "Meals", render: v => <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{v}</span> }]} data={kitchenData.details} /></>}
      {reportTab === "Route" && Object.entries(routeGroups).map(([route, list]) => (
        <Card key={route} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>{route} — {list.length} customers · {list.reduce((s, c) => s + c.todayMeals, 0)} meals</div>
          <Tbl columns={[{ key: "name", label: "Office" }, { key: "meal_type", label: "Type" }, { key: "todayMeals", label: "Meals" }]} data={list} />
        </Card>
      ))}
      {reportTab === "Payments" && <Tbl columns={[
        { key: "id", label: "Invoice" }, { key: "customer_id", label: "Customer", render: v => customers.find(c => c.id === v)?.name || v },
        { key: "amount", label: "Amount", render: v => <span style={{ fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{toINR(v)}</span> },
        { key: "status", label: "Status", render: v => <Badge color={v === "Paid" ? C.green : C.red}>{v}</Badge> },
      ]} data={invoices} />}
    </div>);
  };

  const pages = { Dashboard: renderDashboard, Customers: renderCustomers, Operations: renderOperations, Kitchen: renderKitchen, Billing: renderBilling, Delivery: renderDelivery, Reports: renderReports };

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center", color: C.textDim }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${C.accent}, #D4842A)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, fontWeight: 700, color: C.accentText }}>M</div>
        Loading Mullai...
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: C.bg, color: C.text, overflow: "hidden" }}>
      {/* SIDEBAR */}
      <div style={{ width: sidebar ? 220 : 56, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width .2s", flexShrink: 0, overflow: "hidden" }}>
        <div onClick={() => setSidebar(!sidebar)} style={{ padding: sidebar ? "20px 16px" : "20px 10px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, #D4842A)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: C.accentText, flexShrink: 0 }}>M</div>
          {sidebar && <div><div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1 }}>Mullai</div><div style={{ fontSize: 10, color: C.textDim, marginTop: 2, letterSpacing: 1 }}>MEAL DELIVERY</div></div>}
        </div>
        <nav style={{ padding: "12px 8px", flex: 1 }}>
          {TABS.map(t => (
            <div key={t} onClick={() => { setTab(t); if (window.innerWidth < 768) setSidebar(false); }} style={{
              display: "flex", alignItems: "center", gap: 12, padding: sidebar ? "10px 14px" : "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 2,
              background: tab === t ? C.accentDim : "transparent", color: tab === t ? C.accent : C.textDim, justifyContent: sidebar ? "flex-start" : "center",
            }}>
              <Ico d={tabIcons[t]} s={18} /> {sidebar && <span style={{ fontSize: 13, fontWeight: tab === t ? 600 : 400 }}>{t}</span>}
            </div>
          ))}
        </nav>
      </div>
      {/* MAIN */}
      <div style={{ flex: 1, overflow: "auto", padding: window.innerWidth < 768 ? "20px 16px" : "28px 36px" }}>
        {pages[tab]?.()}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
