import { useState } from "react";
import { Activity, Upload, FileImage, AlertCircle, CheckCircle2 } from "lucide-react";
import { analyzeImage, getAssetUrl } from "./services/api";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) return setError("Please select a coronary angiography image first.");
    setLoading(true); setError(""); setResult(null);
    try { setResult(await analyzeImage(file)); }
    catch (err) { setError(err.response?.data?.detail || "Analysis failed. Check that the backend is running on port 8000."); }
    finally { setLoading(false); }
  }

  return <main className="page">
    <header className="header"><div className="brand"><Activity size={30} /> <span>CardioVision <b>AI</b></span></div><span className="tag">Coronary Vessel Analyzer</span></header>
    <section className="hero"><div><p className="eyebrow">AI-ASSISTED MEDICAL IMAGING</p><h1>Visualize coronary vessels.<br /><span>Detect suspicious regions.</span></h1><p className="subtitle">Upload an angiography image to generate vessel-enhanced visualizations and an automated screening report.</p></div><div className="hero-icon"><Activity size={110} /></div></section>
    <section className="panel"><h2><Upload size={22} /> Upload angiography image</h2><form onSubmit={handleSubmit}><label className="dropzone"><FileImage size={42} /><strong>{file ? file.name : "Choose an image"}</strong><small>PNG, JPG or JPEG</small><input type="file" accept="image/png,image/jpeg" onChange={e => { setFile(e.target.files?.[0] || null); setResult(null); }} /></label><button disabled={loading || !file}>{loading ? "Analyzing…" : "Analyze image"}</button></form>{error && <p className="error"><AlertCircle size={18} />{error}</p>}</section>
    {result && <section className="results"><h2><CheckCircle2 size={22} /> Analysis results</h2>{result.overlay_url && <img src={getAssetUrl(result.overlay_url)} alt="Vessel analysis overlay" />}{result.report_url && <a href={getAssetUrl(result.report_url)} target="_blank" rel="noreferrer">Open PDF report</a>}<pre>{JSON.stringify(result, null, 2)}</pre></section>}
    <footer>Research prototype · Not for clinical diagnosis or treatment decisions.</footer>
  </main>;
}
