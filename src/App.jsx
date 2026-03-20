import { useState, useEffect, useCallback, useRef } from "react";

/* ─── FONTS ─────────────────────────────────────────── */
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;1,14..32,400&family=JetBrains+Mono:wght@500;700&display=swap";
document.head.appendChild(fl);

/* ─── GLOBAL STYLES ─────────────────────────────────── */
const st = document.createElement("style");
st.textContent = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f1f5f9;
  --surface:#ffffff;
  --surface2:#f8fafc;
  --bdr:#e2e8f0;
  --bdr2:#cbd5e1;

  --green:#16a34a;
  --green-light:#dcfce7;
  --green-mid:#86efac;
  --green-dark:#15803d;

  --orange:#ea580c;
  --orange-light:#fff7ed;
  --orange-mid:#fdba74;
  --orange-dark:#c2410c;

  --red:#dc2626;
  --red-light:#fee2e2;
  --red-mid:#fca5a5;
  --red-dark:#b91c1c;

  --blue:#2563eb;
  --blue-light:#eff6ff;

  --txt:#0f172a;
  --txt2:#475569;
  --txt3:#94a3b8;
  --txt4:#e2e8f0;

  --fb:'Inter',sans-serif;
  --fm:'JetBrains Mono',monospace;
  --radius:10px;
  --shadow:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
  --shadow-md:0 4px 8px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04);
  --shadow-lg:0 12px 24px rgba(0,0,0,.1),0 4px 8px rgba(0,0,0,.06);
}
body{background:var(--bg);color:#0f172a;font-family:var(--fb);font-size:14px;line-height:1.6;min-height:100vh}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--surface2)}
::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}

input,select,textarea{
  background:var(--surface)!important;border:1.5px solid #cbd5e1!important;
  color:#0f172a!important;font-family:var(--fb)!important;font-size:14px;
  padding:9px 12px;border-radius:8px;width:100%;outline:none;
  transition:border-color .15s, box-shadow .15s;
}
input:focus,select:focus,textarea:focus{
  border-color:#2563eb!important;
  box-shadow:0 0 0 3px rgba(37,99,235,.12)!important;
}
input::placeholder,textarea::placeholder{color:#94a3b8}
select option{background:white}
label{font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;}
textarea{resize:vertical}

.btn{
  font-family:var(--fb);font-size:14px;font-weight:600;
  padding:9px 18px;border-radius:8px;border:none;cursor:pointer;
  display:inline-flex;align-items:center;gap:7px;
  transition:all .15s;white-space:nowrap;
}
.btn:active{transform:scale(.98)}
.btn-green{background:#16a34a;color:#fff}
.btn-green:hover{background:var(--green-dark);box-shadow:0 4px 12px rgba(22,163,74,.3)}
.btn-red{background:#dc2626;color:#fff}
.btn-red:hover{background:var(--red-dark);box-shadow:0 4px 12px rgba(220,38,38,.3)}
.btn-orange{background:#ea580c;color:#fff}
.btn-orange:hover{background:var(--orange-dark)}
.btn-blue{background:#2563eb;color:#fff}
.btn-blue:hover{background:#1d4ed8;box-shadow:0 4px 12px rgba(37,99,235,.3)}
.btn-ghost{background:var(--surface);color:#475569;border:1.5px solid #cbd5e1!important;box-shadow:var(--shadow)}
.btn-ghost:hover{border-color:#cbd5e1!important;color:#0f172a;background:var(--surface2)}
.btn-sm{padding:6px 14px;font-size:13px}
.btn-xs{padding:4px 10px;font-size:12px;border-radius:6px}

.card{background:var(--surface);border:1px solid #e2e8f0;border-radius:var(--radius);padding:18px;box-shadow:var(--shadow)}
.fg{margin-bottom:14px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.divider{height:1px;background:#e2e8f0;margin:16px 0}

.overlay{
  position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:1000;
  display:flex;align-items:center;justify-content:center;padding:16px;
  backdrop-filter:blur(4px);
}
.modal{
  background:var(--surface);border-radius:14px;width:100%;
  max-width:640px;max-height:94vh;overflow-y:auto;
  box-shadow:var(--shadow-lg);border:1px solid #e2e8f0;
}

@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
.fade-up{animation:fadeUp .2s ease both}
.blink{animation:blink 1.4s infinite}
.kart-card{transition:transform .12s,box-shadow .12s;cursor:pointer}
.kart-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)!important}
@media(max-width:640px){.g2,.g3{grid-template-columns:1fr}}
`
document.head.appendChild(st);

/* ─── CONSTANTS ─────────────────────────────────────── */
const TOTAL_KARTS = 32;

// Status: "active" | "on_track" | "maintenance"
const buildInitialKarts = () =>
  Array.from({ length: TOTAL_KARTS }, (_, i) => ({
    id: i + 1,
    number: String(i + 1).padStart(2, "0"),
    status: "active",
    maintenanceLogs: [],
  }));

/* ─── INITIAL STOCK ─────────────────────────────────── */
const buildInitialStock = () => {
  let id = 1;
  return PARTS_BY_CAT.flatMap(({ cat, color, parts }) =>
    parts.map(name => ({
      id: id++,
      name,
      cat,
      color,
      qty: 0,
      minQty: 2,
    }))
  );
};

/* ─── HELPERS ───────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";
const uid = () => Date.now() + Math.floor(Math.random() * 9999);
const nowISO = () => new Date().toISOString();

/* ─── SYNC / STORAGE KEYS ──────────────────────────── */
const SK = {
  karts:    "oficina-karts-v2",
  activity: "oficina-activity-v2",
  presence: "oficina-presence-v2",
  stock:    "oficina-stock-v2",
};

const POLL_MS   = 4000;   // sync poll interval
const HBEAT_MS  = 12000;  // presence heartbeat
const DEAD_MS   = 30000;  // consider offline after 30s

/* ─── STORAGE HELPERS ──────────────────────────────── */
async function storageGet(key) {
  try {
    const r = await window.storage.get(key, true);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); return true; }
  catch { return false; }
}

/* ─── CLOCK ─────────────────────────────────────────── */
function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span style={{ fontFamily: "var(--fm)", fontSize: 14, fontWeight: 700, color: "#475569", letterSpacing: ".04em" }}>
      {t.toLocaleTimeString("pt-BR")}
    </span>
  );
}


/* ─── PARTS PICKER COMPONENT ───────────────────────── */
const PARTS_BY_CAT = [
  { cat: "Motor", color: "#ff7c1a", parts: [
    "Chaveta do virabrequim","Volante do motor","Tampa de partida","Botão lig./desliga",
    "Bobina motor","Cabeçote","Junta do cabeçote","Mesa do motor","Garra do motor",
    "Tampa da troca óleo","Parafuso sangrado óleo","Vareta do motor","Balanceiro do motor",
    "Baquilete","Pistão","Biela","Virabrequim","Chaveta do motor","Anel do pistão",
    "Bronzina","Pino da biela","Bomba de combustível","Mangueira de combustível",
    "Filtro de combustível","Cabo do acelerador","Capa do cabo do acelerador","Prende cabo",
  ]},
  { cat: "Carburador", color: "#f97316", parts: [
    "Carburador completo","Junta do carburador base maior","Junta carburador base menor",
    "Giclê de alta","Giclê de baixa","Prisioneiro do carburador","Restritor","Afogador",
    "Mesa caixa de filtro","Filtro de ar","Capa do filtro de ar","Filtro de ar completo",
  ]},
  { cat: "Transmissão", color: "#ffe033", parts: [
    "Embreagem completa","Capa de embreagem","Pastilhas de embreagem","Mola de embreagem",
    "Corrente","Coroa","Suporte da coroa","Rolamento da embreagem","Chaveta embreagem",
    "Cubo suporte coroa",
  ]},
  { cat: "Rodas / Pneus", color: "#3d9fff", parts: [
    "Cubo de roda traseiro","Cubo de roda dianteiro/Ressalto","Cubo de roda dianteiro/Sem Ressalto",
    "Pneus dianteiros","Pneus traseiros",
  ]},
  { cat: "Traseira", color: "#22d3ee", parts: [
    "Eixo Indoor","Rolamento do eixo","Chaveta lisa do eixo",
    "Chaveta 2 pino fino","Chaveta 2 pino grosso",
    "Chaveta 3 pino fino","Chaveta 3 pino grosso","Mancal do eixo",
  ]},
  { cat: "Freio", color: "#ff2020", parts: [
    "Cabo do freio","Capa do cabo de freio","Pastilha de freio","Disco de freio",
    "Suporte disco de freio","Cubo disco de freio","Mola cabo disco freio","Pinça completa",
  ]},
  { cat: "Direção", color: "#c084fc", parts: [
    "Manga Indoor c/ ressalto D.","Manga Indoor s/ ressalto D.",
    "Manga Indoor c/ ressalto E.","Manga Indoor s/ ressalto E.",
    "Uniboll Indoor D.","Uniboll Indoor E.","Barra de direção","Coluna de direção",
    "Volante direção","Mesa do volante","Mancal da coluna direção",
  ]},
  { cat: "Rolamentos", color: "#818cf8", parts: [
    "Rolamento do cubo Z6004","Rolamento do cubo Z6203","Rolamento da manga Indoor",
  ]},
  { cat: "Parafusos", color: "#94a3b8", parts: [
    "Parafuso allen c/c 6/15mm","Parafuso allen c/c 6/20mm","Parafuso allen c/c 6/25mm",
    "Parafuso allen c/c 6/30mm","Parafuso allen c/c 6/35mm","Parafuso allen c/c 6/40mm",
    "Parafuso allen c/c 6/45mm","Parafuso allen c/c 6/50mm","Parafuso allen c/c 6/60mm",
    "Parafuso allen c/c 6/70mm","Parafuso allen c/c 6/80mm","Parafuso allen c/c 6/90mm",
    "Parafuso allen 6/15mm","Parafuso allen 6/20mm","Parafuso allen 6/25mm",
    "Parafuso allen 6/30mm","Parafuso allen 6/35mm","Parafuso allen 6/40mm",
    "Parafuso allen 6/45mm","Parafuso allen 6/50mm","Parafuso allen 6/60mm",
    "Parafuso allen 6/70mm","Parafuso allen 6/80mm","Parafuso allen 6/90mm",
    "Parafuso allen c/c 8/15mm","Parafuso allen c/c 8/20mm","Parafuso allen c/c 8/25mm",
    "Parafuso allen c/c 8/30mm","Parafuso allen c/c 8/35mm","Parafuso allen c/c 8/40mm",
    "Parafuso allen c/c 8/45mm","Parafuso allen c/c 8/50mm","Parafuso allen c/c 8/60mm",
    "Parafuso allen c/c 8/70mm","Parafuso allen c/c 8/80mm","Parafuso allen c/c 8/90mm",
    "Parafuso allen 8/15mm","Parafuso allen 8/20mm","Parafuso allen 8/25mm",
    "Parafuso allen 8/30mm","Parafuso allen 8/35mm","Parafuso allen 8/40mm",
    "Parafuso allen 8/45mm","Parafuso allen 8/50mm","Parafuso allen 8/60mm",
    "Parafuso allen 8/70mm","Parafuso allen 8/80mm","Parafuso allen 8/90mm",
    "Parafuso allen 10mm","Parafuso allen 12mm",
    "Parafuso sextavado 10mm","Parafuso sextavado 12mm","Parafuso sextavado 15mm",
    "Parafuso da manga Indoor","Parafuso sextavado 8/90mm",
  ]},
  { cat: "Porcas", color: "#a8a29e", parts: [
    "Porca 6mm","Porca flangeada 6mm","Porca 8mm","Porca flangeada 8mm",
    "Porca 10mm","Porca 12mm",
  ]},
  { cat: "Arruelas", color: "#78716c", parts: [
    "Arruela lisa do banco","Arruela côncava do banco",
    "Arruela 6mm borda larga","Arruela 6mm borda fina",
    "Arruela 8mm borda larga","Arruela 8mm borda fina","Arruela 10mm",
    "Arruela da manga 5mm meia","Arruela da manga 5mm inteira",
    "Arruela da manga 10mm meia","Arruela da manga 10mm inteira","Arruela de assoalho",
  ]},
  { cat: "Outros", color: "#1aff6e", parts: [
    "Banco","Assoalho","Bico","Gravata","Borrachão","Coxim","Ferragem",
  ]},
  { cat: "Serviços", color: "#f43f5e", parts: [
    "Solda","Alinhamento","Gabarito",
  ]},
];

function PartsPicker({ selected, onChange, accentColor = "#d97706" }) {
  // Internal draft — changes only propagate when user clicks "Confirmar"
  const [draft, setDraft]     = useState(() => selected.map(s => typeof s === "object" ? { ...s } : { name: s, qty: 1 }));
  const [search, setSearch]   = useState("");
  const [custom, setCustom]   = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Sync draft when selected resets externally (e.g. form reset)
  const prevSelected = useRef(selected);
  useEffect(() => {
    if (selected.length === 0 && prevSelected.current.length > 0) {
      setDraft([]);
      setConfirmed(false);
    }
    prevSelected.current = selected;
  }, [selected]);

  const draftNames = draft.map(s => s.name);

  const toggle = (name) => {
    setConfirmed(false);
    if (draftNames.includes(name)) {
      setDraft(draft.filter(s => s.name !== name));
    } else {
      setDraft([...draft, { name, qty: 1 }]);
    }
  };

  const setQty = (name, val) => {
    const n = Math.max(1, parseInt(val) || 1);
    setDraft(draft.map(s => s.name === name ? { ...s, qty: n } : s));
    setConfirmed(false);
  };

  const addCustom = () => {
    const t = custom.trim();
    if (!t || draftNames.includes(t)) return;
    setDraft([...draft, { name: t, qty: 1 }]);
    setCustom("");
    setConfirmed(false);
  };

  const handleConfirm = () => {
    onChange(draft);
    setConfirmed(true);
  };

  const allParts = PARTS_BY_CAT.flatMap(c => c.parts);
  const searchLower = search.toLowerCase();
  const filteredCats = search
    ? [{ cat: "Resultados", color: accentColor, parts: allParts.filter(p => p.toLowerCase().includes(searchLower)) }]
    : PARTS_BY_CAT;

  const hasPending = JSON.stringify(draft) !== JSON.stringify(selected.map(s => typeof s === "object" ? s : { name: s, qty: 1 }));

  return (
    <div>
      {/* Search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar peças..." style={{ paddingLeft: 30 }} />
        </div>
        {search && <button className="btn btn-ghost btn-xs" onClick={() => setSearch("")} style={{ whiteSpace: "nowrap" }}>✕ Limpar</button>}
      </div>

      {/* Catalog */}
      <div style={{ border: "1px solid #cbd5e1", borderRadius: 7, background: "#f8fafc", maxHeight: 220, overflowY: "auto", padding: "10px 12px" }}>
        {filteredCats.map(({ cat, color, parts }) => (
          parts.length === 0 ? null :
          <div key={cat} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: color }} />
              {cat}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {parts.map(p => {
                const isSel = draftNames.includes(p);
                const draftItem = draft.find(s => s.name === p);
                return (
                  <button key={p} onClick={() => toggle(p)} style={{
                    padding: "4px 11px", borderRadius: 4,
                    border: `1.5px solid ${isSel ? color : "#cbd5e1"}`,
                    background: isSel ? `${color}22` : "#f1f5f9",
                    color: isSel ? color : "#475569",
                    fontSize: 11, fontWeight: isSel ? 700 : 400,
                    cursor: "pointer", transition: "all .12s",
                    display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--fb)",
                  }}>
                    {isSel && <span style={{ fontSize: 10 }}>✓</span>}
                    {p}
                    {isSel && draftItem?.qty > 1 && (
                      <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "var(--fm)" }}>×{draftItem.qty}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filteredCats.every(c => c.parts.length === 0) && (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: "16px 0" }}>Nenhuma peça encontrada.</div>
        )}
      </div>

      {/* Draft list with qty controls */}
      {draft.length > 0 && (
        <div style={{ marginTop: 10, padding: "12px", background: "#f8fafc", border: `1px solid ${hasPending ? "#fde68a" : "#e2e8f0"}`, borderRadius: 8, transition: "border-color .2s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
              {draft.length} peça{draft.length > 1 ? "s" : ""} — ajuste as quantidades:
            </span>
            {hasPending && (
              <span style={{ fontSize: 10, color: "#92400e", background: "#fef9c3", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                não confirmado
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {draft.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7 }}>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#0f172a", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                  <button onClick={() => setQty(s.name, s.qty - 1)} style={{
                    width: 26, height: 26, borderRadius: 5, border: "1px solid #e2e8f0",
                    background: "#f1f5f9", fontSize: 15, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626",
                  }}>−</button>
                  <input type="number" min={1} value={s.qty}
                    onChange={e => setQty(s.name, e.target.value)}
                    style={{ width: 52, textAlign: "center", fontSize: 13, padding: "4px 6px", fontFamily: "var(--fm)", fontWeight: 700 }}
                  />
                  <button onClick={() => setQty(s.name, s.qty + 1)} style={{
                    width: 26, height: 26, borderRadius: 5, border: "1px solid #e2e8f0",
                    background: "#f1f5f9", fontSize: 15, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a",
                  }}>+</button>
                </div>
                <button onClick={() => toggle(s.name)} style={{
                  width: 24, height: 24, borderRadius: 4, border: "1px solid #fca5a5",
                  background: "#fff1f2", fontSize: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", flexShrink: 0,
                }}>×</button>
              </div>
            ))}
          </div>

          {/* Total + Confirm button */}
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, padding: "6px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#15803d" }}>Total</span>
              <span style={{ fontFamily: "var(--fm)", fontSize: 14, fontWeight: 800, color: "#16a34a" }}>
                {draft.reduce((a, s) => a + s.qty, 0)} un.
              </span>
            </div>
            <button
              onClick={handleConfirm}
              style={{
                padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 13, fontFamily: "var(--fb)",
                background: confirmed ? "#16a34a" : hasPending ? "#2563eb" : "#16a34a",
                color: "#fff", transition: "all .2s", whiteSpace: "nowrap",
                boxShadow: confirmed ? "none" : hasPending ? "0 2px 8px rgba(37,99,235,.35)" : "none",
              }}
            >
              {confirmed ? "✓ Confirmado" : "Confirmar peças"}
            </button>
          </div>

          {confirmed && (
            <div style={{ marginTop: 6, fontSize: 11, color: "#15803d", display: "flex", alignItems: "center", gap: 5 }}>
              <span>✓</span>
              <span>{draft.length} peça{draft.length > 1 ? "s" : ""} confirmada{draft.length > 1 ? "s" : ""} · {draft.reduce((a, s) => a + s.qty, 0)} unidades no total</span>
            </div>
          )}
        </div>
      )}

      {/* Custom part */}
      <div style={{ marginTop: 8, display: "flex", gap: 7 }}>
        <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Adicionar peça personalizada..."
          onKeyDown={e => e.key === "Enter" && addCustom()} style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" onClick={addCustom} style={{ whiteSpace: "nowrap", fontSize: 12 }}>+ Adicionar</button>
      </div>
    </div>
  );
}

/* ─── KART CARD ─────────────────────────────────────── */
function KartCard({ kart, onClick }) {
  const isActive  = kart.status === "active";
  const isOnTrack = kart.status === "on_track";
  const isMaint   = kart.status === "maintenance";
  const openLog   = isMaint ? kart.maintenanceLogs.find(l => l.status === "open") : null;
  const days      = openLog ? Math.max(0, Math.floor((new Date() - new Date(openLog.entryDate + "T12:00:00")) / 86400000)) : 0;

  const accent = isActive ? "#16a34a" : isOnTrack ? "#ea580c" : "#dc2626";
  const bgCard = isActive ? "#f0fdf4" : isOnTrack ? "#fff7ed" : "#fff1f2";
  const statusLabel = isActive ? "Disponível" : isOnTrack ? "Na Pista" : "Manutenção";

  return (
    <div onClick={onClick} className="kart-card" style={{
      background: bgCard,
      border: `1px solid ${isActive ? "#bbf7d0" : isOnTrack ? "#fed7aa" : "#fecdd3"}`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: 10,
      padding: "10px 12px",
      userSelect: "none",
      boxShadow: "0 1px 3px rgba(0,0,0,.06)",
    }}>
      {/* Number */}
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1, fontFamily: "var(--fm)" }}>
        {kart.number}
      </div>

      {/* Status badge */}
      <div style={{
        display: "inline-block", marginTop: 5,
        padding: "2px 8px", borderRadius: 20,
        background: isActive ? "#dcfce7" : isOnTrack ? "#ffedd5" : "#ffe4e6",
        color: accent, fontSize: 10, fontWeight: 700,
      }}>
        {statusLabel}
      </div>

      {/* Maintenance details */}
      {isMaint && openLog && (
        <div style={{ marginTop: 5 }}>
          <div style={{ fontSize: 10, color: "#dc2626", fontWeight: 600, lineHeight: 1.3,
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "100%" }}>
            {openLog.reason}
          </div>
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1, fontFamily: "var(--fm)", fontWeight: 700 }}>
            {days}d parado
          </div>
        </div>
      )}
      {isOnTrack && (
        <div style={{ marginTop: 4, fontSize: 11 }}>🏁</div>
      )}
    </div>
  );
}

/* ─── KART DETAIL MODAL ─────────────────────────────── */
function KartModal({ kart, onClose, onSave }) {
  const isActive = kart.status === "active";
  const isOnTrack = kart.status === "on_track";
  const isMaint = kart.status === "maintenance";

  const openLog = isMaint ? kart.maintenanceLogs.find(l => l.status === "open") : null;

  const [tab, setTab] = useState(isMaint ? "current" : "new");

  const [newForm, setNewForm] = useState({
    mechanic: "",
    reason: "",
    cause: "",
    entryDate: today(),
    parts: [],
    notes: "",
  });

  const [repairForm, setRepairForm] = useState(openLog ? {
    exitDate: openLog.exitDate || today(),
    repairNotes: openLog.repairNotes || "",
    mechanicRepair: openLog.mechanicRepair || "",
    addParts: [],
  } : {
    exitDate: today(),
    repairNotes: "",
    mechanicRepair: "",
    addParts: [],
  });

  const color = isActive ? "#16a34a" : isOnTrack ? "#ea580c" : "#dc2626";
  const statusLabel = isActive ? "Disponível" : isOnTrack ? "Na Pista" : "Em Manutenção";
  const statusBg = isActive ? "#f0fdf4" : isOnTrack ? "#fff7ed" : "#fff1f2";
  const statusBorder = isActive ? "#86efac" : isOnTrack ? "#fdba74" : "#fca5a5";

  const sendToMaintenance = () => {
    if (!newForm.reason.trim()) return;
    const log = {
      id: uid(),
      entryDate: newForm.entryDate,
      exitDate: "",
      reason: newForm.reason,
      cause: newForm.cause,
      parts: newForm.parts,
      mechanic: newForm.mechanic.trim() || "Não informado",
      mechanicRepair: "",
      repairNotes: "",
      notes: newForm.notes,
      status: "open",
    };
    onSave(
      { ...kart, status: "maintenance", maintenanceLogs: [...kart.maintenanceLogs, log] },
      "Entrada Manutenção",
      newForm.reason,
      newForm.mechanic.trim() || "Oficina"
    );
  };

  const closeMaintenanceLog = () => {
    if (!openLog || !repairForm.mechanicRepair.trim()) return;
    const updated = kart.maintenanceLogs.map(l =>
      l.id === openLog.id
        ? { ...l, exitDate: repairForm.exitDate, repairNotes: repairForm.repairNotes,
            mechanicRepair: repairForm.mechanicRepair,
            parts: [...l.parts, ...repairForm.addParts], status: "closed" }
        : l
    );
    onSave(
      { ...kart, status: "active", maintenanceLogs: updated },
      "Conserto Concluído",
      repairForm.repairNotes || openLog.reason,
      repairForm.mechanicRepair.trim() || "Oficina"
    );
  };

  const toggleStatus = () => {
    const next = kart.status === "active" ? "on_track" : "active";
    onSave(
      { ...kart, status: next },
      next === "on_track" ? "Enviado para Pista" : "Retornou para Ativo",
      "", "Oficina"
    );
  };

  const closedLogs = kart.maintenanceLogs.filter(l => l.status === "closed");
  const allLogs = [...kart.maintenanceLogs].reverse();

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-up" style={{ border: `1.5px solid ${statusBorder}` }}>

        {/* Header */}
        <div style={{ padding: "18px 22px 16px", borderBottom: "1px solid #e2e8f0", background: statusBg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                fontFamily: "var(--fm)", fontSize: 52, fontWeight: 800, lineHeight: 1,
                color,
              }}>
                {kart.number}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: 6 }}>
                  Kart #{kart.number}
                </div>
                <span style={{
                  display: "inline-block", padding: "3px 12px",
                  background: color, borderRadius: 20,
                  fontSize: 11, fontWeight: 700, color: isActive ? "#fff" : "#fff",
                }}>
                  {statusLabel}
                </span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: "5px 10px", fontSize: 16 }}>✕</button>
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Total baixas</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{kart.maintenanceLogs.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Encerradas</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#16a34a" }}>{closedLogs.length}</div>
            </div>
            {isMaint && openLog && (
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Dias parado</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}>
                  {Math.max(0, Math.floor((new Date() - new Date(openLog.entryDate + "T12:00:00")) / 86400000))}d
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          {[
            isMaint && { id: "current", label: "🔴  Manutenção Atual" },
            (isActive || isOnTrack) && { id: "new", label: "⚠  Registrar Baixa" },
            allLogs.length > 0 && { id: "history", label: `📋  Histórico (${allLogs.length})` },
            !isMaint && { id: "status", label: "⚙  Status" },
          ].filter(Boolean).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "11px 8px", border: "none", cursor: "pointer",
              background: tab === t.id ? "#fff" : "transparent",
              color: tab === t.id ? "#0f172a" : "#94a3b8",
              fontSize: 11, fontWeight: tab === t.id ? 700 : 400,
              borderBottom: tab === t.id ? `2px solid ${color}` : "2px solid transparent",
              transition: "all .15s", letterSpacing: ".04em",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "18px 22px 22px", maxHeight: "60vh", overflowY: "auto" }}>

          {/* ── TAB: CURRENT MAINTENANCE ── */}
          {tab === "current" && isMaint && openLog && (
            <div>
              <div style={{ padding: "14px 16px", background: "#fff1f2", border: "1px solid #fca5a5", borderRadius: 8, marginBottom: 18 }}>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Motivo da Baixa</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>{openLog.reason}</div>
                {openLog.cause && <div style={{ fontSize: 12, color: "#475569" }}>Causa: {openLog.cause}</div>}
                {openLog.notes && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>{openLog.notes}</div>}
                <div className="divider" />
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Entrada</div>
                    <div style={{ fontFamily: "var(--fm)", fontSize: 13, color: "#dc2626" }}>{fmtDate(openLog.entryDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Reportado por</div>
                    <div style={{ fontSize: 13, color: "#475569" }}>{openLog.mechanic}</div>
                  </div>
                </div>
                {openLog.parts.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Peças Indicadas</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {openLog.parts.map((p, i) => {
                        const name = typeof p === "object" ? p.name : p;
                        const qty  = typeof p === "object" ? p.qty  : 1;
                        return (
                          <span key={i} style={{ padding: "2px 9px", background: "rgba(255,32,32,.12)", border: "1px solid #fca5a5", borderRadius: 3, fontSize: 11, color: "#0f172a", display: "flex", alignItems: "center", gap: 5 }}>
                            {name}
                            {qty > 1 && <span style={{ fontFamily: "var(--fm)", fontWeight: 800, color: "#dc2626" }}>×{qty}</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Repair form */}
              <div style={{ fontFamily: "var(--fb)", fontSize: 15, letterSpacing: ".07em", color: "#16a34a", marginBottom: 14 }}>
                REGISTRAR CONSERTO
              </div>

              <div className="g2">
                <div className="fg">
                  <label>Mecânico que Consertou</label>
                  <input value={repairForm.mechanicRepair} onChange={e => setRepairForm({ ...repairForm, mechanicRepair: e.target.value })} placeholder="Nome do mecânico" />
                </div>
                <div className="fg">
                  <label>Data de Saída (Retorno)</label>
                  <input type="date" value={repairForm.exitDate} onChange={e => setRepairForm({ ...repairForm, exitDate: e.target.value })} />
                </div>
              </div>

              <div className="fg">
                <label>O que foi feito / Observações</label>
                <textarea rows={3} value={repairForm.repairNotes} onChange={e => setRepairForm({ ...repairForm, repairNotes: e.target.value })} placeholder="Descreva o conserto executado, substituições feitas..." />
              </div>

              {/* Add more parts */}
              <div className="fg">
                <label>Peças Utilizadas no Conserto</label>
                <PartsPicker
                  selected={repairForm.addParts}
                  onChange={v => setRepairForm({ ...repairForm, addParts: v })}
                  accentColor="#16a34a"
                />
              </div>

              <button className="btn btn-green" style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "11px", marginTop: 4 }} onClick={closeMaintenanceLog}>
                ✓ KART CONSERTADO — RETORNAR PARA ATIVO
              </button>
            </div>
          )}

          {/* ── TAB: NEW MAINTENANCE ── */}
          {tab === "new" && !isMaint && (
            <div>
              <div style={{ padding: "10px 14px", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 7, marginBottom: 16, fontSize: 12, color: "#ea580c" }}>
                ⚠ Ao registrar a baixa, o kart será marcado como <strong>EM MANUTENÇÃO</strong> e retirado da frota ativa.
              </div>

              <div className="g2">
                <div className="fg">
                  <label>Mecânico Responsável</label>
                  <input
                    value={newForm.mechanic}
                    onChange={e => setNewForm({ ...newForm, mechanic: e.target.value })}
                    placeholder="Nome do mecânico..."
                    autoFocus
                  />
                </div>
                <div className="fg">
                  <label>Data de Entrada na Manutenção *</label>
                  <input type="date" value={newForm.entryDate} onChange={e => setNewForm({ ...newForm, entryDate: e.target.value })} />
                </div>
              </div>

              <div className="fg">
                <label>Motivo da Quebra / Problema *</label>
                <input
                  value={newForm.reason}
                  onChange={e => setNewForm({ ...newForm, reason: e.target.value })}
                  placeholder="Ex: Motor falhando, freio sem pressão, problema na direção..."
                />
              </div>

              <div className="fg">
                <label>Causa Identificada</label>
                <input
                  value={newForm.cause}
                  onChange={e => setNewForm({ ...newForm, cause: e.target.value })}
                  placeholder="Causa provável ou identificada..."
                />
              </div>

              {/* Parts picker */}
              <div className="fg">
                <label>Peças Necessárias</label>
                <PartsPicker
                  selected={newForm.parts}
                  onChange={v => setNewForm({ ...newForm, parts: v })}
                  accentColor="#dc2626"
                />
              </div>

              <div className="fg">
                <label>Observações Adicionais</label>
                <textarea rows={2} value={newForm.notes} onChange={e => setNewForm({ ...newForm, notes: e.target.value })} placeholder="Notas extras sobre o problema..." />
              </div>

              <button className="btn btn-red" style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "11px", marginTop: 4 }}
                onClick={sendToMaintenance}
                disabled={!newForm.reason.trim()}
              >
                🔧 ENVIAR PARA MANUTENÇÃO
              </button>
            </div>
          )}

          {/* ── TAB: HISTORY ── */}
          {tab === "history" && (
            <div>
              {allLogs.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Nenhum registro de manutenção.</div>
              ) : (
                allLogs.map((log, i) => (
                  <div key={log.id} style={{
                    padding: "14px 16px",
                    background: log.status === "open" ? "#fff1f2" : "#f8fafc",
                    border: `1px solid ${log.status === "open" ? "#fca5a5" : "#e2e8f0"}`,
                    borderRadius: 8,
                    marginBottom: 12,
                    borderLeft: `4px solid ${log.status === "open" ? "#dc2626" : "#16a34a"}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, flex: 1, paddingRight: 12 }}>{log.reason}</div>
                      <span style={{
                        padding: "2px 9px", borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: ".07em",
                        background: log.status === "open" ? "#fff1f2" : "#f0fdf4",
                        color: log.status === "open" ? "#dc2626" : "#16a34a",
                        border: `1px solid ${log.status === "open" ? "#fca5a5" : "#86efac"}`,
                        whiteSpace: "nowrap",
                      }}>
                        {log.status === "open" ? "EM ABERTO" : "ENCERRADO"}
                      </span>
                    </div>

                    {log.cause && <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Causa: {log.cause}</div>}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Entrada</div>
                        <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "#dc2626" }}>{fmtDate(log.entryDate)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Saída</div>
                        <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "#16a34a" }}>{fmtDate(log.exitDate)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Reportou</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>{log.mechanic?.split(" ")[0] || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Consertou</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>{log.mechanicRepair?.split(" ")[0] || "—"}</div>
                      </div>
                    </div>

                    {log.parts.length > 0 && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Peças</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {log.parts.map((p, j) => {
                            const name = typeof p === "object" ? p.name : p;
                            const qty  = typeof p === "object" ? p.qty  : 1;
                            return (
                              <span key={j} style={{ padding: "1px 7px", background: "#e2e8f0", border: "1px solid #cbd5e1", borderRadius: 3, fontSize: 10, color: "#475569", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                {name}
                                {qty > 1 && <span style={{ fontFamily: "var(--fm)", fontWeight: 700, color: "#475569" }}>×{qty}</span>}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {log.repairNotes && (
                      <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", borderTop: "1px solid #e2e8f0", paddingTop: 6, marginTop: 6 }}>
                        {log.repairNotes}
                      </div>
                    )}

                    {log.entryDate && log.exitDate && (
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
                        Duração: {Math.max(0, Math.floor((new Date(log.exitDate + "T12:00:00") - new Date(log.entryDate + "T12:00:00")) / 86400000))} dia(s)
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: STATUS ── */}
          {tab === "status" && !isMaint && (
            <div>
              <div style={{ padding: 20, background: isActive ? "#f0fdf4" : "#fff7ed", borderRadius: 10, marginBottom: 16, textAlign: "center", border: `1px solid ${isActive ? "#bbf7d0" : "#fed7aa"}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Status atual</div>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>
                  {isActive ? "✅ Disponível" : "🏁 Na Pista"}
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                {isActive ? "Kart disponível para locação." : "Kart em uso na pista. Clique para marcar como disponível."}
              </p>
              <button className={`btn ${isActive ? "btn-orange" : "btn-green"}`} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: 11 }} onClick={toggleStatus}>
                {isActive ? "🏁 Enviar para Pista" : "✅ Marcar como Disponível"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── ESTOQUE ────────────────────────────────────────── */
function Estoque({ stock, onUpdate, lowStock }) {
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("all");
  const [showOnlyLow, setShowOnlyLow] = useState(false);
  const [editMinQty, setEditMinQty] = useState(null); // { id, val }

  const cats = ["all", ...PARTS_BY_CAT.map(c => c.cat)];

  const adjust = (id, delta) => {
    const updated = stock.map(s => s.id === id
      ? { ...s, qty: Math.max(0, s.qty + delta) }
      : s
    );
    onUpdate(updated);
  };

  const setMinQty = (id, val) => {
    const updated = stock.map(s => s.id === id ? { ...s, minQty: Math.max(0, val) } : s);
    onUpdate(updated);
    setEditMinQty(null);
  };

  const setQtyDirect = (id, val) => {
    const updated = stock.map(s => s.id === id ? { ...s, qty: Math.max(0, val) } : s);
    onUpdate(updated);
  };

  let filtered = stock;
  if (search)          filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.cat.toLowerCase().includes(search.toLowerCase()));
  if (catFilter !== "all") filtered = filtered.filter(s => s.cat === catFilter);
  if (showOnlyLow)     filtered = filtered.filter(s => s.qty <= s.minQty && s.minQty > 0);

  const totalItems = stock.reduce((a, s) => a + s.qty, 0);

  return (
    <div style={{ padding: "24px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

      {/* ── KPI ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total de peças",    value: stock.length,      color: "#2563eb", bg: "#eff6ff", bdr: "#bfdbfe", icon: "📦" },
          { label: "Itens em estoque",  value: totalItems,         color: "#16a34a", bg: "#f0fdf4", bdr: "#bbf7d0", icon: "✅" },
          { label: "Estoque baixo",     value: lowStock.length,    color: "#ea580c", bg: "#fff7ed", bdr: "#fed7aa", icon: "⚠️" },
          { label: "Sem estoque",       value: stock.filter(s => s.qty === 0 && s.minQty > 0).length, color: "#dc2626", bg: "#fff1f2", bdr: "#fecdd3", icon: "🚫" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.bdr}`, borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{k.label}</p>
                <p style={{ fontSize: 36, fontWeight: 800, color: k.color, lineHeight: 1, fontFamily: "var(--fm)" }}>{k.value}</p>
              </div>
              <span style={{ fontSize: 26 }}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar peça..." style={{ paddingLeft: 32, width: 200, fontSize: 13 }} />
        </div>

        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: "auto", fontSize: 13, padding: "8px 12px" }}>
          {cats.map(c => <option key={c} value={c}>{c === "all" ? "Todas categorias" : c}</option>)}
        </select>

        <button onClick={() => setShowOnlyLow(!showOnlyLow)} style={{
          padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${showOnlyLow ? "#ea580c" : "#e2e8f0"}`,
          background: showOnlyLow ? "#fff7ed" : "#fff", color: showOnlyLow ? "#ea580c" : "#64748b",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          ⚠️ Só estoque baixo {showOnlyLow ? "✓" : ""}
        </button>

        <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>{filtered.length} itens</span>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Categoria", "Peça", "Qtd. Mínima", "Estoque Atual", "Status", "Ajustar"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Nenhuma peça encontrada</td></tr>
            ) : filtered.map((s, i) => {
              const isLow   = s.qty <= s.minQty && s.minQty > 0;
              const isEmpty = s.qty === 0 && s.minQty > 0;
              const statusColor  = isEmpty ? "#dc2626" : isLow ? "#ea580c" : "#16a34a";
              const statusBg     = isEmpty ? "#fff1f2" : isLow ? "#fff7ed" : "#f0fdf4";
              const statusLabel  = isEmpty ? "Sem estoque" : isLow ? "Estoque baixo" : "OK";
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid #f8fafc", background: isEmpty ? "#fff8f8" : isLow ? "#fffbf5" : "#fff" }}>
                  {/* Category */}
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: s.color }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
                      {s.cat}
                    </span>
                  </td>
                  {/* Name */}
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{s.name}</span>
                  </td>
                  {/* Min qty (editable) */}
                  <td style={{ padding: "10px 16px" }}>
                    {editMinQty?.id === s.id ? (
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <input type="number" min={0} defaultValue={s.minQty}
                          style={{ width: 60, fontSize: 12, padding: "4px 8px" }}
                          onBlur={e => setMinQty(s.id, parseInt(e.target.value) || 0)}
                          onKeyDown={e => e.key === "Enter" && setMinQty(s.id, parseInt(e.target.value) || 0)}
                          autoFocus />
                      </div>
                    ) : (
                      <button onClick={() => setEditMinQty({ id: s.id })} style={{
                        background: "none", border: "1px dashed #cbd5e1", borderRadius: 6,
                        padding: "3px 10px", fontSize: 12, color: "#64748b", cursor: "pointer",
                        fontFamily: "var(--fm)", fontWeight: 700,
                      }}>
                        {s.minQty}
                      </button>
                    )}
                  </td>
                  {/* Current qty */}
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontFamily: "var(--fm)", fontSize: 20, fontWeight: 800, color: statusColor }}>{s.qty}</span>
                  </td>
                  {/* Status */}
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: statusBg, color: statusColor }}>
                      {statusLabel}
                    </span>
                  </td>
                  {/* Adjust buttons */}
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => adjust(s.id, -1)} style={{
                        width: 28, height: 28, borderRadius: 6, border: "1.5px solid #e2e8f0",
                        background: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626",
                      }}>−</button>
                      <input type="number" min={0} value={s.qty}
                        onChange={e => setQtyDirect(s.id, parseInt(e.target.value) || 0)}
                        style={{ width: 56, textAlign: "center", fontSize: 13, padding: "4px 6px", fontFamily: "var(--fm)", fontWeight: 700 }}
                      />
                      <button onClick={() => adjust(s.id, 1)} style={{
                        width: 28, height: 28, borderRadius: 6, border: "1.5px solid #e2e8f0",
                        background: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a",
                      }}>+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─────────────────────────────────────── */
function Dashboard({ karts, activity, stock = [], onReset, resetConfirm, setResetConfirm }) {
  const allLogs = karts.flatMap(k => k.maintenanceLogs);
  const closedLogs = allLogs.filter(l => l.status === "closed");
  const openLogs   = allLogs.filter(l => l.status === "open");

  // Total baixas this month
  const now = new Date();
  const thisMonth = allLogs.filter(l => {
    const d = new Date(l.entryDate + "T12:00:00");
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Avg days stopped (closed logs)
  const avgDays = closedLogs.length > 0
    ? (closedLogs.reduce((acc, l) => {
        const diff = Math.max(0, Math.floor((new Date(l.exitDate + "T12:00:00") - new Date(l.entryDate + "T12:00:00")) / 86400000));
        return acc + diff;
      }, 0) / closedLogs.length).toFixed(1)
    : "—";

  // Kart with most maintenances
  const kartRanking = karts.map(k => ({
    number: k.number,
    total: k.maintenanceLogs.length,
  })).sort((a, b) => b.total - a.total);
  const topKart = kartRanking[0];

  // Parts frequency
  const partCount = {};
  allLogs.forEach(l => l.parts.forEach(p => {
    const name = typeof p === "object" ? p.name : p;
    const qty  = typeof p === "object" ? p.qty  : 1;
    partCount[name] = (partCount[name] || 0) + qty;
  }));
  const topParts = Object.entries(partCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Status counts
  const statusCounts = {
    active:      karts.filter(k => k.status === "active").length,
    on_track:    karts.filter(k => k.status === "on_track").length,
    maintenance: karts.filter(k => k.status === "maintenance").length,
  };
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  // Last 7 days activity
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
    const dateStr = d.toISOString().split("T")[0];
    const count = allLogs.filter(l => l.entryDate === dateStr).length;
    return { label, count };
  });
  const maxDay = Math.max(...days7.map(d => d.count), 1);

  const card = (children, extra = {}) => ({
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
    padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.04)", ...extra,
  });

  return (
    <div style={{ padding: "24px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

      {/* ── KPI ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Baixas este mês",       value: thisMonth.length,    icon: "📅", color: "#2563eb", bg: "#eff6ff", bdr: "#bfdbfe" },
          { label: "Em manutenção agora",   value: openLogs.length,     icon: "🔧", color: "#dc2626", bg: "#fff1f2", bdr: "#fecdd3" },
          { label: "Kart mais problemático",value: topKart?.total > 0 ? `#${topKart.number}` : "—", icon: "🏎", color: "#ea580c", bg: "#fff7ed", bdr: "#fed7aa" },
          { label: "Média dias parado",     value: avgDays,             icon: "⏱", color: "#16a34a", bg: "#f0fdf4", bdr: "#bbf7d0" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.bdr}`, borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{k.label}</p>
                <p style={{ fontSize: 36, fontWeight: 800, color: k.color, lineHeight: 1, fontFamily: "var(--fm)" }}>{k.value}</p>
              </div>
              <span style={{ fontSize: 26 }}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 2: Status pie + Bar chart ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 24 }}>

        {/* Status da frota */}
        <div style={card()}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Status da Frota</h3>
          {[
            { label: "Disponíveis", count: statusCounts.active,      color: "#16a34a", bg: "#dcfce7" },
            { label: "Na Pista",    count: statusCounts.on_track,     color: "#ea580c", bg: "#ffedd5" },
            { label: "Manutenção",  count: statusCounts.maintenance,  color: "#dc2626", bg: "#ffe4e6" },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "var(--fm)" }}>{s.count}</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4 }}>
                <div style={{ height: 8, background: s.color, borderRadius: 4, width: `${(s.count / 32) * 100}%`, transition: "width .4s" }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Total frota</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "var(--fm)" }}>32 karts</span>
            </div>
          </div>
        </div>

        {/* Baixas por dia (últimos 7 dias) */}
        <div style={card()}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Baixas — Últimos 7 Dias</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {days7.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: d.count > 0 ? "#dc2626" : "#94a3b8", fontFamily: "var(--fm)" }}>
                  {d.count || ""}
                </span>
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0",
                  background: d.count > 0 ? "#dc2626" : "#e2e8f0",
                  height: `${Math.max((d.count / maxDay) * 70, d.count > 0 ? 8 : 4)}px`,
                  transition: "height .3s",
                  opacity: d.count > 0 ? 1 : 0.5,
                }} />
                <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", lineHeight: 1.2 }}>{d.label}</span>
              </div>
            ))}
          </div>
          {days7.every(d => d.count === 0) && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>Sem baixas nos últimos 7 dias</p>
          )}
        </div>
      </div>

      {/* ── ROW 3: Ranking karts + Peças mais usadas ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Ranking karts por manutenções */}
        <div style={card()}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Karts com Mais Manutenções</h3>
          {kartRanking.filter(k => k.total > 0).slice(0, 8).length === 0 ? (
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Nenhuma manutenção registrada.</p>
          ) : (
            kartRanking.filter(k => k.total > 0).slice(0, 8).map((k, i) => (
              <div key={k.number} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", width: 18, textAlign: "center" }}>{i + 1}</span>
                <span style={{ fontFamily: "var(--fm)", fontSize: 16, fontWeight: 800, color: "#dc2626", width: 36 }}>#{k.number}</span>
                <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3 }}>
                  <div style={{ height: 6, background: i === 0 ? "#dc2626" : i === 1 ? "#ea580c" : "#94a3b8", borderRadius: 3, width: `${(k.total / kartRanking[0].total) * 100}%` }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", width: 28, textAlign: "right", fontFamily: "var(--fm)" }}>{k.total}x</span>
              </div>
            ))
          )}
        </div>

        {/* Peças mais usadas */}
        <div style={card()}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Peças Mais Utilizadas</h3>
          {topParts.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Nenhuma peça registrada.</p>
          ) : (
            topParts.map(([part, count], i) => (
              <div key={part} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", width: 18, textAlign: "center" }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: "#0f172a", flex: 1 }}>{part}</span>
                <div style={{ width: 80, height: 6, background: "#f1f5f9", borderRadius: 3 }}>
                  <div style={{ height: 6, background: "#2563eb", borderRadius: 3, width: `${(count / topParts[0][1]) * 100}%` }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", width: 28, textAlign: "right", fontFamily: "var(--fm)" }}>{count}x</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── RESET ── */}
      <div style={{ background: "#fff", border: "1px solid #fecdd3", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>🗑 Limpar Feed de Atividade</h3>
            <p style={{ fontSize: 13, color: "#64748b" }}>Remove todas as entradas do feed de atividade. O histórico de manutenção dos karts não é afetado.</p>
          </div>
          {!resetConfirm ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setResetConfirm(true)}
              style={{ borderColor: "#fca5a5", color: "#dc2626", whiteSpace: "nowrap" }}>
              Limpar feed
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>Tem certeza?</span>
              <button className="btn btn-red btn-sm" onClick={onReset}>Sim, limpar</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setResetConfirm(false)}>Cancelar</button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/* ─── MAIN APP ──────────────────────────────────────── */
export default function App() {
  // No login — app opens directly. Device gets a stable anonymous ID.
  const deviceId   = useRef("device-" + Math.random().toString(36).slice(2, 8)).current;
  const deviceName = useRef("Dispositivo " + Math.floor(Math.random() * 900 + 100)).current;

  const [karts, setKarts]             = useState(buildInitialKarts);
  const [selected, setSelected]       = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchKart, setSearchKart]   = useState("");

  // Sync state
  const [syncStatus, setSyncStatus]   = useState("connecting");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activity, setActivity]       = useState([]);
  const [toasts, setToasts]           = useState([]);
  const [lastSyncTs, setLastSyncTs]   = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [resetConfirm, setResetConfirm]   = useState(false);
  const [activeTab, setActiveTab]         = useState("frota"); // "frota" | "estoque" | "dashboard"
  const [stock, setStock]                 = useState(buildInitialStock);

  const kartsRef   = useRef(karts);
  const channelRef = useRef(null);
  const pollRef    = useRef(null);
  const hbeatRef   = useRef(null);

  kartsRef.current = karts;

  /* ── Toast helpers ── */
  const addToast = useCallback((msg, type = "info") => {
    const id = uid();
    setToasts(t => [...t.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  }, []);

  /* ── Activity helper ── */
  const pushActivity = useCallback(async (action, kartNumber, detail, who) => {
    const entry = { id: uid(), ts: nowISO(), action, kartNumber, detail, who };
    setActivity(a => [entry, ...a].slice(0, 50));
    try {
      const existing = await storageGet(SK.activity) || [];
      await storageSet(SK.activity, [entry, ...existing].slice(0, 50));
    } catch {}
  }, []);

  /* ── Save karts to shared storage ── */
  const persistKarts = useCallback(async (updated, action, kartNumber, detail, who) => {
    const ok = await storageSet(SK.karts, updated);
    setSyncStatus(ok ? "online" : "offline");
    setLastSyncTs(new Date());
    if (ok && action) {
      await pushActivity(action, kartNumber, detail, who || "Oficina");
    }
    try {
      channelRef.current?.postMessage({
        type: "karts-update",
        karts: updated,
        from: deviceId,
        action, kartNumber, detail, who,
      });
    } catch {}
  }, [pushActivity, deviceId]);

  /* ── Load from storage (initial + poll) ── */
  const syncFromStorage = useCallback(async (silent = false) => {
    const stored = await storageGet(SK.karts);
    if (stored) {
      if (JSON.stringify(stored) !== JSON.stringify(kartsRef.current)) {
        setKarts(stored);
        setSelected(prev => {
          if (!prev) return prev;
          const fresh = stored.find(k => k.id === prev.id);
          return fresh || prev;
        });
        if (!silent) setLastSyncTs(new Date());
      }
      setSyncStatus("online");
      setLastSyncTs(new Date());
    } else {
      await storageSet(SK.karts, kartsRef.current);
      setSyncStatus("online");
    }
    const acts = await storageGet(SK.activity);
    if (acts) setActivity(acts);
    const storedStock = await storageGet(SK.stock);
    if (storedStock) setStock(storedStock);
    const pres = await storageGet(SK.presence) || {};
    const now  = Date.now();
    setOnlineUsers(Object.values(pres).filter(u => now - u.ts < DEAD_MS));
  }, []);

  /* ── Persist stock ── */
  const persistStock = useCallback(async (updated) => {
    setStock(updated);
    await storageSet(SK.stock, updated);
    try { channelRef.current?.postMessage({ type: "stock-update", stock: updated }); } catch {}
  }, []);

  /* ── Deduct parts from stock when conserto is registered ── */
  const deductStock = useCallback(async (parts) => {
    if (!parts || parts.length === 0) return;
    const current = await storageGet(SK.stock) || stock;
    const updated = current.map(s => {
      const used = parts.find(p => (typeof p === "object" ? p.name : p) === s.name);
      if (!used) return s;
      const qty = typeof used === "object" ? used.qty : 1;
      return { ...s, qty: Math.max(0, s.qty - qty) };
    });
    await persistStock(updated);
  }, [persistStock, stock]);

  /* ── Heartbeat (write own presence) ── */
  const sendHeartbeat = useCallback(async () => {
    const pres = await storageGet(SK.presence) || {};
    pres[deviceId] = { id: deviceId, name: deviceName, ts: Date.now() };
    await storageSet(SK.presence, pres);
    const now = Date.now();
    setOnlineUsers(Object.values(pres).filter(u => now - u.ts < DEAD_MS));
  }, [deviceId, deviceName]);

  /* ── Remove own presence on unload ── */
  const clearPresence = useCallback(async () => {
    const pres = await storageGet(SK.presence) || {};
    delete pres[deviceId];
    await storageSet(SK.presence, pres);
  }, [deviceId]);

  /* ── Mount sync on load ── */
  useEffect(() => {
    // BroadcastChannel (instant same-browser sync)
    try {
      const ch = new BroadcastChannel("oficina-karts");
      channelRef.current = ch;
      ch.onmessage = (e) => {
        if (e.data.type === "karts-update" && e.data.from !== deviceId) {
          setKarts(e.data.karts);
          setLastSyncTs(new Date());
          setSelected(prev => {
            if (!prev) return prev;
            const fresh = e.data.karts.find(k => k.id === prev.id);
            return fresh || prev;
          });
          if (e.data.action) {
            const icon = e.data.action.includes("Manutenção") || e.data.action.includes("Baixa") ? "🔴" : e.data.action.includes("Conserto") || e.data.action.includes("Ativo") ? "🟢" : "🟠";
            addToast(`${icon} ${e.data.who || "Oficina"} — Kart #${e.data.kartNumber}: ${e.data.action}`, "remote");
            const entry = { id: uid(), ts: nowISO(), action: e.data.action, kartNumber: e.data.kartNumber, detail: e.data.detail, who: e.data.who };
            setActivity(a => [entry, ...a].slice(0, 50));
          }
        }
        if (e.data.type === "stock-update") {
          setStock(e.data.stock);
        }
      };
    } catch {}

    syncFromStorage(true);
    pollRef.current    = setInterval(() => syncFromStorage(true), POLL_MS);
    sendHeartbeat();
    hbeatRef.current   = setInterval(sendHeartbeat, HBEAT_MS);

    const goOnline  = () => { setSyncStatus("online");  syncFromStorage(true); };
    const goOffline = () => setSyncStatus("offline");
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      clearInterval(pollRef.current);
      clearInterval(hbeatRef.current);
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
      clearPresence();
      try { channelRef.current?.close(); } catch {}
    };
  }, []); // eslint-disable-line

  /* ── Reset activity feed ── */
  const resetActivity = useCallback(async () => {
    setActivity([]);
    await storageSet(SK.activity, []);
    setResetConfirm(false);
    addToast("Feed de atividade limpo!", "info");
  }, [addToast]);

  /* ── Update kart (called by modal) ── */
  const updateKart = useCallback(async (updated, action, detail, who) => {
    const next = kartsRef.current.map(k => k.id === updated.id ? updated : k);
    setKarts(next);
    if (updated.status === "active" && action === "Conserto Concluído") {
      setSelected(null);
      // Auto-deduct used parts from stock
      const closedLog = updated.maintenanceLogs.find(l => l.status === "closed" && l.parts?.length > 0);
      if (closedLog) await deductStock(closedLog.parts);
    } else {
      setSelected(updated);
    }
    await persistKarts(next, action, updated.number, detail, who);
  }, [persistKarts, deductStock]);

  /* ── derived ── */
  const stats = {
    active:      karts.filter(k => k.status === "active").length,
    onTrack:     karts.filter(k => k.status === "on_track").length,
    maintenance: karts.filter(k => k.status === "maintenance").length,
  };
  let displayKarts = [...karts];
  if (filterStatus !== "all") displayKarts = displayKarts.filter(k => k.status === filterStatus);
  if (searchKart)             displayKarts = displayKarts.filter(k => k.number.includes(searchKart));
  const maintKarts = karts.filter(k => k.status === "maintenance");
  const lowStock   = stock.filter(s => s.qty <= s.minQty && s.minQty > 0);

  const syncDot = syncStatus === "online" ? "#16a34a" : syncStatus === "offline" ? "#dc2626" : "#ea580c";
  const todayStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const FILTERS = [
    { v: "all",         label: "Todos",       count: karts.length,      color: "#475569" },
    { v: "active",      label: "Disponíveis", count: stats.active,      color: "#16a34a" },
    { v: "on_track",    label: "Na Pista",    count: stats.onTrack,     color: "#ea580c" },
    { v: "maintenance", label: "Manutenção",  count: stats.maintenance, color: "#dc2626" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex" }}>

      {/* ══ TOASTS ══ */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
        {toasts.map(t => (
          <div key={t.id} className="fade-up" style={{
            padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "#fff",
            border: `1.5px solid ${t.type === "remote" ? "#bfdbfe" : t.type === "presence" ? "#bbf7d0" : "#fde68a"}`,
            color: t.type === "remote" ? "#1d4ed8" : t.type === "presence" ? "#15803d" : "#92400e",
            maxWidth: 320, boxShadow: "0 4px 16px rgba(0,0,0,.12)",
          }}>{t.msg}</div>
        ))}
      </div>

      {/* ══ SIDEBAR ══ */}
      <div style={{
        width: 64, background: "#1e293b", display: "flex", flexDirection: "column",
        alignItems: "center", padding: "16px 0", gap: 4,
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 200,
        borderRight: "1px solid #334155",
      }}>
        {/* Logo */}
        <div style={{ fontSize: 22, marginBottom: 12, lineHeight: 1 }}>🔧</div>

        {/* Nav items */}
        {[
          { id: "frota",     icon: "⊞", label: "Frota" },
          { id: "estoque",   icon: "☰", label: "Estoque", alert: lowStock.length > 0 },
          { id: "dashboard", icon: "◫", label: "Dashboard" },
        ].map(item => (
          <div key={item.id} title={item.label} onClick={() => setActiveTab(item.id)}
            style={{ position: "relative", cursor: "pointer" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, transition: "all .15s",
              background: activeTab === item.id ? "rgba(99,179,237,.15)" : "transparent",
              color: activeTab === item.id ? "#63b3ed" : "#94a3b8",
              border: activeTab === item.id ? "1px solid rgba(99,179,237,.3)" : "1px solid transparent",
            }}>{item.icon}</div>
            {item.alert && (
              <div style={{
                position: "absolute", top: 6, right: 6, width: 8, height: 8,
                borderRadius: "50%", background: "#f97316",
                border: "1.5px solid #1e293b",
              }} />
            )}
          </div>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Sync dot */}
        <div title={syncStatus} style={{
          width: 10, height: 10, borderRadius: "50%",
          background: syncDot,
          animation: syncStatus === "connecting" ? "blink 1s infinite" : "none",
          marginBottom: 8,
        }} />

        {/* Clock */}
        <div style={{ fontSize: 9, fontFamily: "var(--fm)", color: "#475569", textAlign: "center", lineHeight: 1.6, marginBottom: 8 }}>
          <Clock />
        </div>
      </div>

      {/* ══ MAIN AREA ══ */}
      <div style={{ marginLeft: 64, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── Topbar ── */}
        <div style={{
          height: 52, background: "#fff", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 3px rgba(0,0,0,.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              {activeTab === "frota" ? "Frota de Karts" : activeTab === "estoque" ? "Controle de Estoque" : "Dashboard"}
            </h1>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {activeTab === "frota" ? `${karts.length} karts` : activeTab === "estoque" ? `${stock.length} peças` : "Visão geral"}
            </span>
            {/* Sync label */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: syncStatus === "online" ? "#f0fdf4" : syncStatus === "offline" ? "#fff1f2" : "#fff7ed",
              border: `1px solid ${syncStatus === "online" ? "#bbf7d0" : syncStatus === "offline" ? "#fecdd3" : "#fed7aa"}`,
              color: syncDot,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: syncDot, animation: syncStatus === "connecting" ? "blink 1s infinite" : "none" }} />
              {syncStatus === "online" ? "Sincronizado" : syncStatus === "offline" ? "Offline" : "Conectando"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {onlineUsers.length > 1 && (
              <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                {onlineUsers.length} online
              </span>
            )}
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{todayStr}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => syncFromStorage(false)} title="Sincronizar agora" style={{ padding: "4px 10px", fontSize: 12 }}>↺</button>
          </div>
        </div>

        {/* ── Page Content ── */}
        {activeTab === "dashboard" ? (
          <Dashboard karts={karts} activity={activity} stock={stock} onReset={resetActivity} resetConfirm={resetConfirm} setResetConfirm={setResetConfirm} />
        ) : activeTab === "estoque" ? (
          <Estoque stock={stock} onUpdate={persistStock} lowStock={lowStock} />
        ) : (
          /* ── FROTA ── */
          <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden" }}>

            {/* Main column */}
            <div style={{ flex: 1, padding: "20px 20px 40px", overflowY: "auto" }}>

              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                {[
                  { label: "Disponíveis", count: stats.active,      color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
                  { label: "Na Pista",    count: stats.onTrack,     color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
                  { label: "Manutenção",  count: stats.maintenance, color: "#dc2626", bg: "#fff1f2", border: "#fecdd3" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "16px 20px" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontSize: 44, fontWeight: 800, color: s.color, lineHeight: 1, fontFamily: "var(--fm)" }}>{s.count}</p>
                    <div style={{ marginTop: 10, height: 4, background: "rgba(0,0,0,.06)", borderRadius: 2 }}>
                      <div style={{ height: 4, background: s.color, borderRadius: 2, width: `${(s.count / 32) * 100}%`, transition: "width .3s" }} />
                    </div>
                    <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{s.count} de 32</p>
                  </div>
                ))}
              </div>

              {/* Low stock alert */}
              {lowStock.length > 0 && (
                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span>⚠️</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>Estoque baixo:</span>
                  <span style={{ fontSize: 13, color: "#ea580c", flex: 1 }}>
                    {lowStock.slice(0, 3).map(s => `${s.name} (${s.qty})`).join(" · ")}
                    {lowStock.length > 3 ? ` · +${lowStock.length - 3} mais` : ""}
                  </span>
                  <button className="btn btn-ghost btn-xs" onClick={() => setActiveTab("estoque")} style={{ borderColor: "#fdba74", color: "#ea580c" }}>Ver →</button>
                </div>
              )}

              {/* Filter bar */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 5, flex: 1, flexWrap: "wrap" }}>
                  {FILTERS.map(f => (
                    <button key={f.v} onClick={() => setFilterStatus(f.v)} style={{
                      padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                      fontWeight: 600, fontSize: 12, transition: "all .15s",
                      background: filterStatus === f.v ? f.color : "#f1f5f9",
                      color: filterStatus === f.v ? "#fff" : "#475569",
                    }}>
                      {f.label} <span style={{ opacity: .7 }}>({f.count})</span>
                    </button>
                  ))}
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13 }}>🔍</span>
                  <input value={searchKart} onChange={e => setSearchKart(e.target.value)} placeholder="Kart..." style={{ paddingLeft: 28, width: 120, fontSize: 12 }} />
                </div>
                {searchKart && <button className="btn btn-ghost btn-xs" onClick={() => setSearchKart("")}>✕</button>}
              </div>

              {/* Kart grid */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                    Grade de Karts
                    <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8", marginLeft: 8 }}>{displayKarts.length} exibindo</span>
                  </span>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#64748b" }}>
                    {[["#16a34a","Disponível"],["#ea580c","Na Pista"],["#dc2626","Manutenção"]].map(([c,l]) => (
                      <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />{l}
                      </span>
                    ))}
                  </div>
                </div>
                {displayKarts.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))", gap: 9 }}>
                    {displayKarts.map(kart => (
                      <KartCard key={kart.id} kart={kart} onClick={() => setSelected(kart)} />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 20px", color: "#94a3b8" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>Nenhum kart encontrado</p>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => { setFilterStatus("all"); setSearchKart(""); }}>Limpar filtros</button>
                  </div>
                )}
              </div>

              {/* Activity feed */}
              {activity.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", marginTop: 16 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Atividade Recente</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>atualiza a cada 4s</span>
                  </div>
                  <div>
                    {activity.slice(0, 6).map((a, i) => {
                      const isRed = a.action?.includes("Manutenção") || a.action?.includes("Baixa");
                      const isGreen = a.action?.includes("Conserto") || a.action?.includes("Ativo");
                      const acColor = isRed ? "#dc2626" : isGreen ? "#16a34a" : "#ea580c";
                      return (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: i < 5 ? "1px solid #f8fafc" : "none" }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: acColor, flexShrink: 0 }} />
                          <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "#94a3b8", width: 40, flexShrink: 0 }}>
                            {new Date(a.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>#{a.kartNumber}</span>
                          <span style={{ fontSize: 12, color: acColor, fontWeight: 600 }}>{a.action}</span>
                          {a.detail && <span style={{ fontSize: 11, color: "#64748b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.detail}</span>}
                          <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{a.who?.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT PANEL: Manutenção ── */}
            <div style={{
              width: 300, flexShrink: 0, borderLeft: "1px solid #e2e8f0", background: "#fff",
              display: "flex", flexDirection: "column", overflowY: "auto",
            }}>
              {/* Header */}
              <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", animation: maintKarts.length > 0 ? "blink 1.4s infinite" : "none" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Manutenção</span>
                  {maintKarts.length > 0 && (
                    <span style={{ padding: "1px 8px", borderRadius: 20, background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>
                      {maintKarts.length}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>Karts fora da frota ativa</p>
              </div>

              {maintKarts.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, color: "#94a3b8", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Nenhum kart em manutenção</p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>Toda a frota está disponível</p>
                </div>
              ) : (
                <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {maintKarts.map(k => {
                    const log  = k.maintenanceLogs.find(l => l.status === "open");
                    const days = log ? Math.max(0, Math.floor((new Date() - new Date(log.entryDate + "T12:00:00")) / 86400000)) : 0;
                    const urgent = days > 3;
                    return (
                      <div key={k.id} onClick={() => setSelected(k)} style={{
                        background: urgent ? "#fff1f2" : "#fafafa",
                        border: `1px solid ${urgent ? "#fca5a5" : "#e2e8f0"}`,
                        borderLeft: `4px solid ${urgent ? "#dc2626" : "#f87171"}`,
                        borderRadius: 8, padding: "10px 12px", cursor: "pointer",
                        transition: "all .12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = urgent ? "#ffe4e6" : "#f0f4f8"}
                      onMouseLeave={e => e.currentTarget.style.background = urgent ? "#fff1f2" : "#fafafa"}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontFamily: "var(--fm)", fontSize: 22, fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>{k.number}</span>
                          <span style={{
                            padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "var(--fm)",
                            background: urgent ? "#fecdd3" : "#fee2e2", color: urgent ? "#b91c1c" : "#dc2626",
                          }}>{days}d {urgent ? "⚠" : ""}</span>
                        </div>
                        {log && (
                          <>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 3, lineHeight: 1.3 }}>{log.reason}</p>
                            {log.cause && <p style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{log.cause}</p>}
                            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8" }}>
                              <span>Entrada: <span style={{ color: "#475569", fontFamily: "var(--fm)" }}>{fmtDate(log.entryDate)}</span></span>
                              {log.mechanic && <span>Mec: <span style={{ color: "#475569" }}>{log.mechanic.split(" ")[0]}</span></span>}
                            </div>
                            {log.parts.length > 0 && (
                              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 3 }}>
                                {log.parts.slice(0, 3).map((p, i) => {
                                  const nm = typeof p === "object" ? p.name : p;
                                  const qt = typeof p === "object" ? p.qty  : 1;
                                  return (
                                    <span key={i} style={{ padding: "1px 6px", fontSize: 10, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, color: "#475569", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                      {nm}{qt > 1 && <span style={{ fontFamily: "var(--fm)", fontWeight: 700 }}>×{qt}</span>}
                                    </span>
                                  );
                                })}
                                {log.parts.length > 3 && <span style={{ fontSize: 10, color: "#94a3b8" }}>+{log.parts.length - 3}</span>}
                              </div>
                            )}
                          </>
                        )}
                        <button className="btn btn-red btn-xs" style={{ width: "100%", justifyContent: "center", marginTop: 8, fontSize: 11 }}
                          onClick={e => { e.stopPropagation(); setSelected(k); }}>
                          Registrar conserto
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ── MODAL ── */}
      {selected && (
        <KartModal kart={selected} onClose={() => setSelected(null)} onSave={updateKart} />
      )}
    </div>
  );
}
