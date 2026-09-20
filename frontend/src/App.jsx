import { useMemo, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Download, FileImage, HeartPulse, Image as ImageIcon, Info, ScanLine, ShieldCheck, Upload } from "lucide-react";
import { analyzeImage, getAssetUrl } from "./services/api";

const severityMeta = {
  mild: { label: "Mild", className: "mild", description: "Low estimated narrowing" },
  moderate: { label: "Moderate", className: "moderate", description: "Intermediate estimated narrowing" },
  severe: { label: "Severe", className: "severe", description: "High estimated narrowing" },
  critical: { label: "Critical", className: "critical", description: "Very high estimated narrowing" },
};

function severityInfo(value = "mild") {
  return severityMeta[String(value).toLowerCase()] || { label: value || "Unclassified", className: "unknown", description: "Review required" };
}

function Metric({ label, value, suffix, icon: Icon, tone }) {
  return <div className={`metric-card ${tone}`}><div className="metric-icon"><Icon size={19} /></div><div><p>{label}</p><strong>{value ?? "—"}{suffix || ""}</strong></div></div>;
}

function ImagePanel({ title, subtitle, src, alt }) {
  return <article className="image-panel"><div className="image-panel-heading"><div><h3>{title}</h3><p>{subtitle}</p></div><ImageIcon size={20} /></div>{src ? <img src={src} alt={alt} /> : <div className="image-empty">Image unavailable</div>}</article>;
}

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const regions = result?.regions || [];

  const highestSeverity = useMemo(() => {
    const order = { mild: 1, moderate: 2, severe: 3, critical: 4 };
    return regions.reduce((highest, region) => (order[String(region.severity).toLowerCase()] || 0) > (order[String(highest).toLowerCase()] || 0) ? region.severity : highest, regions.length ? regions[0].severity : "Not detected");
  }, [regions]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) return setError("Please select a coronary angiography image first.");
    setLoading(true); setError(""); setResult(null);
    try { setResult(await analyzeImage(file)); setActiveTab("overview"); }
    catch (err) { const detail = err.response?.data?.detail; setError(typeof detail === "string" ? detail : "Analysis failed. Confirm that the FastAPI backend is running on port 8000."); }
    finally { setLoading(false); }
  }

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><HeartPulse size={25} /></div><div><strong>CardioVision <span>AI</span></strong><small>Coronary Vessel Analysis Suite</small></div></div><div className="topbar-status"><span className="status-dot" /> Research workstation <span>•</span> Prototype</div></header>

    <section className="intro"><div><p className="eyebrow">CARDIOVASCULAR IMAGING / CLINICAL REVIEW</p><h1>Turn angiography into<br /><span>actionable visual insight.</span></h1><p className="intro-copy">Review coronary vessel enhancement, suspicious regions, estimated narrowing and supporting image evidence in one focused workspace.</p></div><div className="intro-art"><Activity size={115} strokeWidth={1.2} /><div className="pulse-line" /></div></section>

    <section className="upload-card"><div className="section-title"><div className="title-icon"><Upload size={20} /></div><div><h2>New angiography study</h2><p>Upload a PNG, JPG or JPEG image to begin automated screening.</p></div></div><form onSubmit={handleSubmit} className="upload-form"><label className="dropzone"><FileImage size={34} /><strong>{file ? file.name : "Select coronary angiography image"}</strong><span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : "Click to browse or drop an image here"}</span><input type="file" accept="image/png,image/jpeg" onChange={(event) => { setFile(event.target.files?.[0] || null); setResult(null); setError(""); }} /></label><button className="primary-button" disabled={loading || !file}>{loading ? <><span className="spinner" /> Processing study…</> : <><ScanLine size={18} /> Analyze study</>}</button></form>{error && <div className="error-box"><AlertCircle size={18} />{error}</div>}</section>

    {result && <section className="dashboard"><div className="study-heading"><div><p className="eyebrow">ANALYSIS COMPLETE</p><h2>Study overview <span className="case-id">#{result.case_id}</span></h2><p>Automated vessel screening summary generated from the uploaded image.</p></div><a className="report-button" href={getAssetUrl(result.report_url)} target="_blank" rel="noreferrer"><Download size={17} /> Download PDF report</a></div>
      <div className="metrics-grid"><Metric label="Max. estimated narrowing" value={result.max_estimated_narrowing?.toFixed?.(2) ?? result.max_estimated_narrowing} suffix="%" icon={Activity} tone="orange" /><Metric label="Suspicious regions" value={result.suspicious_regions} icon={AlertCircle} tone="rose" /><Metric label="Vessel area" value={result.vessel_area_percent?.toFixed?.(2) ?? result.vessel_area_percent} suffix="%" icon={ScanLine} tone="teal" /><Metric label="Analysis confidence" value={result.confidence?.toFixed?.(1) ?? result.confidence} suffix="%" icon={ShieldCheck} tone="violet" /></div>
      <nav className="tabs"><button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview & images</button><button className={activeTab === "regions" ? "active" : ""} onClick={() => setActiveTab("regions")}>Region findings <b>{regions.length}</b></button><button className={activeTab === "details" ? "active" : ""} onClick={() => setActiveTab("details")}>Technical details</button></nav>

      {activeTab === "overview" && <><div className="finding-banner"><div className={`severity-badge ${severityInfo(highestSeverity).className}`}><AlertCircle size={18} /> {severityInfo(highestSeverity).label}</div><div><strong>Highest flagged severity</strong><p>{severityInfo(highestSeverity).description}. Review highlighted regions alongside the source image.</p></div><Info size={20} /></div><div className="image-grid"><ImagePanel title="Original angiography" subtitle="Source image" src={getAssetUrl(result.original_image_url)} alt="Original coronary angiography" /><ImagePanel title="Vessel-enhanced view" subtitle="Contrast and vesselness enhancement" src={getAssetUrl(result.enhanced_image_url)} alt="Enhanced coronary vessels" /><ImagePanel title="Vessel segmentation" subtitle="Extracted vessel mask" src={getAssetUrl(result.vessel_mask_url)} alt="Coronary vessel mask" /><ImagePanel title="Analysis overlay" subtitle="Suspicious regions highlighted" src={getAssetUrl(result.overlay_image_url)} alt="Coronary analysis overlay" /></div></>}

      {activeTab === "regions" && <div className="regions-list">{regions.length ? regions.map((region) => { const meta = severityInfo(region.severity); return <article className="region-card" key={region.id}><div className={`region-number ${meta.className}`}>{region.id}</div><div className="region-main"><div className="region-title"><h3>Region {region.id}</h3><span className={`severity-pill ${meta.className}`}>{meta.label}</span></div><div className="region-stats"><span>Estimated narrowing <strong>{region.estimated_narrowing}%</strong></span><span>Confidence <strong>{region.confidence}%</strong></span><span>Bounding box <strong>{region.width} × {region.height}px</strong></span></div><div className="progress-track"><div className={`progress-fill ${meta.className}`} style={{ width: `${Math.min(100, region.estimated_narrowing)}%` }} /></div><small>Location: x {region.x}, y {region.y}</small></div></article>; }) : <div className="empty-state"><CheckCircle2 size={30} />No suspicious regions were returned.</div>}</div>}

      {activeTab === "details" && <div className="details-card"><div><span>Case ID</span><strong>{result.case_id}</strong></div><div><span>Vessel area percentage</span><strong>{result.vessel_area_percent}%</strong></div><div><span>Suspicious regions</span><strong>{result.suspicious_regions}</strong></div><div><span>Model confidence</span><strong>{result.confidence}%</strong></div><div className="full-detail"><span>Disclaimer</span><p>{result.disclaimer}</p></div></div>}
    </section>}
    <footer><strong>CardioVision AI</strong> · Research prototype · Not for diagnosis or treatment decisions. All findings require qualified clinical review.</footer>
  </main>;
}
