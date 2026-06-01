import React, { useState, useEffect, useRef, useCallback } from "react";

const API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_KEY ||
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
  "";

// ─── Load Google Maps ─────────────────────────────────────────────────────────
let gmapsState = "idle"; // idle | loading | ready | error
const gmapsCallbacks = [];

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (gmapsState === "ready") { resolve(window.google); return; }
    if (gmapsState === "error") { reject(new Error("Failed")); return; }
    gmapsCallbacks.push({ resolve, reject });
    if (gmapsState === "loading") return;
    gmapsState = "loading";
    if (!API_KEY) {
      gmapsState = "error";
      gmapsCallbacks.forEach(c => c.reject(new Error("No API key")));
      return;
    }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=__gmapsReady`;
    s.async = true;
    s.defer = true;
    window.__gmapsReady = () => {
      gmapsState = "ready";
      gmapsCallbacks.forEach(c => c.resolve(window.google));
    };
    s.onerror = () => {
      gmapsState = "error";
      gmapsCallbacks.forEach(c => c.reject(new Error("Script error")));
    };
    document.head.appendChild(s);
  });
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #000; font-family: 'Inter', -apple-system, sans-serif; color: #fff; }

.app {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  background: #0f0f0f;
  position: relative;
}

/* ── TOP BAR ── */
.topbar {
  padding: 52px 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.topbar-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #1c1c1e; border: none; color: #fff;
  font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.topbar-title {
  font-size: 17px; font-weight: 600; color: #fff;
}

/* ── LOCATION INPUT AREA (like Uber/Ola) ── */
.loc-inputs {
  margin: 20px 16px 0;
  background: #1c1c1e;
  border-radius: 16px;
  padding: 4px 0;
  overflow: hidden;
}
.loc-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  position: relative;
}
.loc-row + .loc-row {
  border-top: 1px solid #2c2c2e;
}
.loc-dot {
  width: 10px; height: 10px; border-radius: 50%;
  flex-shrink: 0;
}
.loc-dot.green { background: #30d158; }
.loc-dot.red   { background: #ff453a; }
.loc-input-field {
  flex: 1;
  background: transparent; border: none;
  font-size: 15px; color: #fff;
  font-family: 'Inter', sans-serif;
  outline: none;
}
.loc-input-field::placeholder { color: #636366; }
.loc-clear {
  background: #3a3a3c; border: none; color: #aeaeb2;
  width: 20px; height: 20px; border-radius: 50%;
  font-size: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

/* ── GPS BUTTON ── */
.gps-btn {
  margin: 12px 16px 0;
  width: calc(100% - 32px);
  background: #1c1c1e; border: none;
  border-radius: 12px; padding: 13px 16px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; text-align: left;
  transition: background .15s;
}
.gps-btn:hover { background: #2c2c2e; }
.gps-btn:active { background: #3a3a3c; }
.gps-icon-wrap {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(10,132,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}
.gps-text strong { display: block; font-size: 14px; font-weight: 600; color: #fff; }
.gps-text span   { font-size: 12px; color: #636366; }
.gps-detecting   { font-size: 12px; color: #0a84ff; animation: blink 1s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── SECTION ── */
.section { margin: 20px 16px 0; }
.section-title {
  font-size: 12px; font-weight: 600; color: #636366;
  text-transform: uppercase; letter-spacing: .8px;
  margin-bottom: 8px; padding: 0 4px;
}

/* ── SUGGESTION LIST ── */
.sugg-list { display: flex; flex-direction: column; gap: 2px; }
.sugg-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  cursor: pointer; transition: background .12s;
  animation: fadeIn .15s ease;
}
@keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
.sugg-item:hover { background: #1c1c1e; }
.sugg-item:active { background: #2c2c2e; }
.sugg-icon {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 16px;
}
.sugg-icon.place  { background: #2c2c2e; }
.sugg-icon.recent { background: #2c2c2e; }
.sugg-name  { font-size: 14px; font-weight: 500; color: #fff; }
.sugg-sub   {
  font-size: 12px; color: #636366; margin-top: 1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 280px;
}

/* ── SHIMMER ── */
.shimmer-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
}
.shimmer-circle {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(90deg,#1c1c1e 25%,#2c2c2e 50%,#1c1c1e 75%);
  background-size: 200% 100%; animation: sh 1.2s infinite; flex-shrink:0;
}
.shimmer-lines { flex:1; display:flex; flex-direction:column; gap:6px; }
.shimmer-line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg,#1c1c1e 25%,#2c2c2e 50%,#1c1c1e 75%);
  background-size: 200% 100%; animation: sh 1.2s infinite;
}
.shimmer-line.short { width: 60%; }
@keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── ERROR BANNER ── */
.err-banner {
  margin: 12px 16px 0;
  background: rgba(255,69,58,.1); border: 1px solid rgba(255,69,58,.25);
  border-radius: 12px; padding: 12px 14px;
  font-size: 13px; color: #ff6b6b; line-height: 1.5;
}
.err-banner strong { display:block; color:#ff453a; margin-bottom:3px; }

/* ── NO RESULT ── */
.no-result {
  text-align: center; padding: 32px 16px;
  font-size: 13px; color: #636366; line-height: 1.7;
}
.no-result .nr-icon { font-size: 30px; margin-bottom: 8px; }

/* ── DIVIDER ── */
.divider { height: 1px; background: #1c1c1e; margin: 16px 0; }

/* ════════════════
   ADDRESS PAGE
════════════════ */
.addr-header { padding: 52px 20px 0; }
.addr-back {
  background: none; border: none; color: #0a84ff;
  font-size: 15px; font-family: 'Inter',sans-serif;
  cursor: pointer; padding: 0; margin-bottom: 16px;
  display: flex; align-items: center; gap: 4px;
}
.addr-back:hover { opacity: .8; }
.addr-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.addr-sub   { font-size: 13px; color: #636366; }

.picked-card {
  margin: 16px 16px 0;
  background: rgba(48,209,88,.08);
  border: 1px solid rgba(48,209,88,.2);
  border-radius: 12px; padding: 12px 14px;
  display: flex; align-items: flex-start; gap: 10px;
}
.picked-dot { width:8px;height:8px;border-radius:50%;background:#30d158;flex-shrink:0;margin-top:5px; }
.picked-name { font-size:14px;font-weight:600;color:#30d158; }
.picked-sub  { font-size:12px;color:#636366;margin-top:2px;line-height:1.4; }

.form-body { padding: 16px; }

.type-chips { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px; }
.type-chip {
  padding: 7px 14px; border-radius: 20px;
  border: 1px solid #2c2c2e; background: #1c1c1e;
  color: #aeaeb2; font-size:13px; font-family:'Inter',sans-serif;
  cursor:pointer; transition:all .15s;
}
.type-chip.active {
  border-color: #30d158; background: rgba(48,209,88,.1); color:#30d158;
}

.form-group { margin-bottom: 14px; }
.form-label {
  font-size: 12px; font-weight:600; color:#636366;
  text-transform:uppercase; letter-spacing:.5px;
  display:block; margin-bottom:7px;
}
.form-input, .form-textarea {
  width:100%; background:#1c1c1e; border:1px solid #2c2c2e;
  border-radius:12px; padding:13px 14px;
  font-size:14px; color:#fff; font-family:'Inter',sans-serif;
  outline:none; transition:border-color .2s;
}
.form-textarea { resize:none; min-height:90px; line-height:1.5; }
.form-input::placeholder,.form-textarea::placeholder { color:#3a3a3c; }
.form-input:focus,.form-textarea:focus { border-color:#0a84ff; }
.form-input.err { border-color:#ff453a; }
.form-textarea.err { border-color:#ff453a; }
.form-hint { font-size:11px;color:#48484a;margin-top:5px; }
.form-err  { font-size:12px;color:#ff453a;margin-top:5px; }

.confirm-btn {
  width:100%;padding:16px;background:#0a84ff;border:none;border-radius:14px;
  color:#fff;font-family:'Inter',sans-serif;font-size:16px;font-weight:600;
  cursor:pointer;margin-top:8px;transition:opacity .2s,transform .1s;
}
.confirm-btn:hover { opacity:.9; }
.confirm-btn:active { transform:scale(.98); }

/* ════════════════
   CONFIRM PAGE
════════════════ */
.done-wrap {
  padding:60px 20px;display:flex;flex-direction:column;
  align-items:center;text-align:center;min-height:100vh;justify-content:center;
}
.done-check {
  width:72px;height:72px;border-radius:50%;background:#30d158;
  display:flex;align-items:center;justify-content:center;
  font-size:32px;margin-bottom:20px;
  animation:pop .4s cubic-bezier(.34,1.56,.64,1);
}
@keyframes pop{0%{transform:scale(0)}100%{transform:scale(1)}}
.done-title { font-size:24px;font-weight:700;margin-bottom:6px; }
.done-sub   { font-size:14px;color:#636366;margin-bottom:28px; }

.summary-card {
  width:100%;background:#1c1c1e;border-radius:16px;
  padding:4px 0;margin-bottom:16px;text-align:left;
}
.summary-row {
  display:flex;align-items:flex-start;gap:12px;
  padding:13px 16px;border-bottom:1px solid #2c2c2e;
}
.summary-row:last-child { border-bottom:none; }
.sum-ico { font-size:16px;flex-shrink:0;margin-top:1px; }
.sum-lbl { font-size:11px;color:#636366;text-transform:uppercase;letter-spacing:.4px; }
.sum-val { font-size:14px;color:#fff;font-weight:500;margin-top:2px;line-height:1.4; }

.restart-btn {
  width:100%;padding:14px;background:#1c1c1e;border:1px solid #2c2c2e;
  border-radius:14px;color:#aeaeb2;font-family:'Inter',sans-serif;
  font-size:14px;cursor:pointer;transition:border-color .2s;
}
.restart-btn:hover { border-color:#636366; }
`;

// ─── localStorage helpers ─────────────────────────────────────────────────────
const RKEY = "loc_recents_v3";
const getRecents = () => { try { return JSON.parse(localStorage.getItem(RKEY)) || []; } catch { return []; } };
const addRecent  = (item) => {
  const list = [item, ...getRecents().filter(r => r.place_id !== item.place_id)].slice(0, 6);
  localStorage.setItem(RKEY, JSON.stringify(list));
};

// ─── useGooglePlaces ──────────────────────────────────────────────────────────
function useGooglePlaces() {
  const svc   = useRef(null);
  const locRef = useRef(null);
  const [ready, setReady]     = useState(false);
  const [apiErr, setApiErr]   = useState("");

  useEffect(() => {
    // Get GPS in background
    navigator.geolocation?.getCurrentPosition(
      p => { locRef.current = { lat: p.coords.latitude, lng: p.coords.longitude }; },
      () => { locRef.current = { lat: 22.3072, lng: 73.1812 }; }
    );

    loadGoogleMaps()
      .then(g => { svc.current = new g.maps.places.AutocompleteService(); setReady(true); })
      .catch(e => setApiErr(e.message || "Could not load Google Maps"));
  }, []);

  const search = useCallback((input, cb) => {
    if (!svc.current || !input.trim()) { cb([]); return; }
    const req = {
      input,
      componentRestrictions: { country: "in" },
      language: "en",
    };
    if (locRef.current) {
      req.location = new window.google.maps.LatLng(locRef.current.lat, locRef.current.lng);
      req.radius   = 60000;
    }
    svc.current.getPlacePredictions(req, (preds, status) => {
      if (preds && status === window.google.maps.places.PlacesServiceStatus.OK) {
        cb(preds.map(p => ({
          place_id: p.place_id,
          name: p.structured_formatting.main_text,
          sub:  p.structured_formatting.secondary_text || "",
        })));
      } else {
        cb([]);
      }
    });
  }, []);

  return { ready, apiErr, search };
}

// ─── Components ───────────────────────────────────────────────────────────────
function SuggItem({ item, onClick }) {
  return (
    <div className="sugg-item" onClick={() => onClick(item)}>
      <div className={`sugg-icon ${item._recent ? "recent" : "place"}`}>
        {item._recent ? "🕐" : "📍"}
      </div>
      <div>
        <div className="sugg-name">{item.name}</div>
        <div className="sugg-sub">{item.sub}</div>
      </div>
    </div>
  );
}

function Shimmer() {
  return [1,2,3,4].map(i => (
    <div key={i} className="shimmer-item">
      <div className="shimmer-circle" />
      <div className="shimmer-lines">
        <div className="shimmer-line" />
        <div className="shimmer-line short" />
      </div>
    </div>
  ));
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1
// ═══════════════════════════════════════════════════════════════════════════════
function ChoosePage({ onSelect }) {
  const [q, setQ]           = useState("");
  const [results, setRes]   = useState([]);
  const [loading, setLoad]  = useState(false);
  const [detecting, setDet] = useState(false);
  const { ready, apiErr, search } = useGooglePlaces();
  const timer = useRef(null);

  useEffect(() => {
    if (!q.trim()) { setRes([]); setLoad(false); return; }
    setLoad(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      search(q, res => { setRes(res); setLoad(false); });
    }, 350);
    return () => clearTimeout(timer.current);
  }, [q, search]);

  const pick = item => { addRecent(item); onSelect(item); };

  const gps = () => {
    setDet(true);
    navigator.geolocation?.getCurrentPosition(
      p => {
        setDet(false);
        const item = { place_id:"gps", name:"Current Location", sub:`${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}` };
        addRecent(item); onSelect(item);
      },
      () => { setDet(false); alert("Location permission denied. Enable it in browser settings."); }
    );
  };

  const recents   = getRecents();
  const searching = q.trim().length > 0;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Set pickup location</div>
      </div>

      {/* Search input — Uber style */}
      <div className="loc-inputs">
        <div className="loc-row">
          <div className="loc-dot green" />
          <input
            className="loc-input-field"
            placeholder={ready ? "Search area, colony, street, pincode…" : "Loading…"}
            value={q}
            disabled={!ready && !apiErr}
            onChange={e => setQ(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {q && <button className="loc-clear" onClick={() => { setQ(""); setRes([]); }}>✕</button>}
        </div>
      </div>

      {/* API Error */}
      {apiErr && (
        <div className="err-banner">
          <strong>⚠ Google Maps Error</strong>
          {apiErr === "No API key"
            ? 'API key missing. Add REACT_APP_GOOGLE_MAPS_KEY in .env and restart npm.'
            : `${apiErr} — Check browser Console (F12) for details.`}
        </div>
      )}

      {/* GPS */}
      <button className="gps-btn" onClick={gps} disabled={detecting}>
        <div className="gps-icon-wrap">🎯</div>
        <div className="gps-text">
          <strong>Use current location</strong>
          {detecting
            ? <span className="gps-detecting">Detecting…</span>
            : <span>Auto-detect via GPS</span>}
        </div>
      </button>

      {/* Results */}
      {searching ? (
        <div className="section">
          <div className="section-title">Results</div>
          <div className="sugg-list">
            {loading
              ? <Shimmer />
              : results.length > 0
                ? results.map(r => <SuggItem key={r.place_id} item={r} onClick={pick} />)
                : <div className="no-result"><div className="nr-icon">🔍</div>No results for "{q}"<br/>Try different spelling</div>
            }
          </div>
        </div>
      ) : (
        <>
          {recents.length > 0 && (
            <div className="section">
              <div className="section-title">Recent</div>
              <div className="sugg-list">
                {recents.map(r => <SuggItem key={r.place_id} item={{...r,_recent:true}} onClick={pick} />)}
              </div>
            </div>
          )}
          <div className="section">
            <div className="no-result" style={{paddingTop:24}}>
              <div className="nr-icon">🗺️</div>
              Search any area, colony, pincode<br/>or society across India
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2
// ═══════════════════════════════════════════════════════════════════════════════
function AddressPage({ location, onBack, onSubmit }) {
  const [type, setType] = useState("Home");
  const [form, setForm] = useState({ addr:"", landmark:"", city:"", mobile:"" });
  const [errs, setErrs] = useState({});

  useEffect(() => {
    if (location?.sub) {
      const parts = location.sub.split(",");
      setForm(f => ({ ...f, city: parts[parts.length-2]?.trim() || parts[0]?.trim() || "" }));
    }
  }, [location]);

  const types = ["🏠 Home","💼 Work","🏨 Hotel","📍 Other"];

  const validate = () => {
    const e = {};
    if (!form.addr.trim())   e.addr = "Address is required";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter valid 10-digit number";
    return e;
  };

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrs(e=>({...e,[k]:undefined})); };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    onSubmit({ ...form, type, location });
  };

  const typeLabel = t => t.split(" ")[1];

  return (
    <>
      <div className="addr-header">
        <button className="addr-back" onClick={onBack}>← Back</button>
        <div className="addr-title">Enter address details</div>
        <div className="addr-sub">Help driver find you easily</div>
      </div>

      <div className="picked-card">
        <div className="picked-dot" />
        <div>
          <div className="picked-name">{location?.name}</div>
          <div className="picked-sub">{location?.sub}</div>
        </div>
      </div>

      <div className="form-body">
        <div className="type-chips" style={{marginTop:4}}>
          {types.map(t => (
            <button key={t} className={`type-chip ${type===typeLabel(t)?"active":""}`}
              onClick={()=>setType(typeLabel(t))}>{t}</button>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Full Address *</label>
          <textarea className={`form-textarea${errs.addr?" err":""}`}
            placeholder="Flat no., Floor, Building name, Society, Street…"
            value={form.addr} onChange={e=>set("addr",e.target.value)} />
          <div className="form-hint">Include flat no., floor, building & society name</div>
          {errs.addr && <div className="form-err">⚠ {errs.addr}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Landmark (optional)</label>
          <input className="form-input" placeholder="Near school, temple, mall…"
            value={form.landmark} onChange={e=>set("landmark",e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          <input className="form-input" placeholder="City"
            value={form.city} onChange={e=>set("city",e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Mobile Number *</label>
          <input className={`form-input${errs.mobile?" err":""}`}
            placeholder="10-digit mobile number" inputMode="numeric" maxLength={10}
            value={form.mobile} onChange={e=>set("mobile",e.target.value.replace(/\D/g,""))} />
          <div className="form-hint">Driver will call on this number</div>
          {errs.mobile && <div className="form-err">⚠ {errs.mobile}</div>}
        </div>

        <button className="confirm-btn" onClick={submit}>Confirm Location</button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 3
// ═══════════════════════════════════════════════════════════════════════════════
function DonePage({ data, onReset }) {
  const rows = [
    { ico:"📍", lbl:"Pickup location", val: data.location?.name },
    { ico:"🏠", lbl:`Address (${data.type})`, val: data.addr },
    data.landmark && { ico:"🗺️", lbl:"Landmark", val: data.landmark },
    data.city && { ico:"🏙️", lbl:"City", val: data.city },
    { ico:"📱", lbl:"Mobile", val:`+91 ${data.mobile}` },
  ].filter(Boolean);

  return (
    <div className="done-wrap">
      <div className="done-check">✓</div>
      <div className="done-title">Location Set!</div>
      <div className="done-sub">Pickup details confirmed</div>
      <div className="summary-card">
        {rows.map((r,i) => (
          <div key={i} className="summary-row">
            <div className="sum-ico">{r.ico}</div>
            <div>
              <div className="sum-lbl">{r.lbl}</div>
              <div className="sum-val">{r.val}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="restart-btn" onClick={onReset}>Choose different location</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [page, setPage]   = useState("choose");
  const [loc,  setLoc]    = useState(null);
  const [done, setDone]   = useState(null);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {page === "choose" && (
          <ChoosePage onSelect={l => { setLoc(l); setPage("address"); }} />
        )}
        {page === "address" && (
          <AddressPage location={loc} onBack={() => setPage("choose")}
            onSubmit={d => { setDone(d); setPage("done"); }} />
        )}
        {page === "done" && (
          <DonePage data={done}
            onReset={() => { setLoc(null); setDone(null); setPage("choose"); }} />
        )}
      </div>
    </>
  );
}