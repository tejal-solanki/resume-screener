import { useState } from "react";

const API = "http://localhost:8000/api/v1";

function ScoreRing({ score }) {
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 75 ? "#1D9E75" : score >= 50 ? "#BA7517" : "#D85A30";
  return (
    <svg width={88} height={88} style={{ display: "block" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={7} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={18} fontWeight={600} fill={color}>{score}</text>
    </svg>
  );
}

function KeywordPill({ kw }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, padding: "4px 10px", borderRadius: 99,
      background: kw.found ? "#E1F5EE" : "#FAECE7",
      color: kw.found ? "#085041" : "#712B13",
      border: `0.5px solid ${kw.found ? "#5DCAA5" : "#F0997B"}`,
      margin: "3px 4px 3px 0"
    }}>
      <span style={{ fontSize: 10 }}>{kw.found ? "✓" : "✗"}</span>
      {kw.keyword}
    </span>
  );
}

export default function App() {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("paste"); // "paste" | "upload"

  async function loadExample() {
    const res = await fetch(`${API}/screen/example`);
    const data = await res.json();
    setJd(data.job_description);
    setResumeText(data.resume_text);
    setTab("paste");
  }

  async function handleSubmit() {
    setError(""); setResult(null); setLoading(true);
    try {
      const form = new FormData();
      form.append("job_description", jd);
      if (tab === "upload" && file) form.append("resume_file", file);
      else form.append("resume_text", resumeText);

      const res = await fetch(`${API}/screen`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Something went wrong");
      }
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = jd.trim() && (tab === "paste" ? resumeText.trim() : file);

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ borderBottom: "0.5px solid #e5e7eb", background: "#fff", padding: "0 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "#1D9E75", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>R</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 15 }}>ResumeMatch</span>
          </div>
          <button onClick={loadExample} style={{ fontSize: 12, color: "#6b7280", background: "none", border: "0.5px solid #d1d5db", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
            Load example
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {!result ? (
          <>
            <div style={{ marginBottom: "1.75rem" }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 6px" }}>Resume screener</h1>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Paste a job description + your resume → get an AI match score, gap analysis, and improvement tips.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* JD */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Job description</label>
                <textarea
                  value={jd} onChange={e => setJd(e.target.value)}
                  placeholder="Paste the full job description here..."
                  style={{ width: "100%", height: 240, resize: "vertical", fontSize: 13, padding: "10px 12px", borderRadius: 8, border: "0.5px solid #d1d5db", background: "#fff", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", outline: "none" }}
                />
              </div>

              {/* Resume */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>Your resume</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["paste", "upload"].map(t => (
                      <button key={t} onClick={() => setTab(t)} style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 99, cursor: "pointer",
                        background: tab === t ? "#1D9E75" : "transparent",
                        color: tab === t ? "#fff" : "#6b7280",
                        border: `0.5px solid ${tab === t ? "#1D9E75" : "#d1d5db"}`
                      }}>{t === "paste" ? "Paste text" : "Upload PDF"}</button>
                    ))}
                  </div>
                </div>
                {tab === "paste" ? (
                  <textarea
                    value={resumeText} onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here..."
                    style={{ width: "100%", height: 240, resize: "vertical", fontSize: 13, padding: "10px 12px", borderRadius: 8, border: "0.5px solid #d1d5db", background: "#fff", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box", outline: "none" }}
                  />
                ) : (
                  <div style={{ height: 240, border: "0.5px dashed #d1d5db", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", cursor: "pointer" }}
                    onClick={() => document.getElementById("file-input").click()}>
                    <input id="file-input" type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
                    <div style={{ fontSize: 28, color: "#9ca3af" }}>↑</div>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{file ? file.name : "Click to upload PDF or TXT"}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Max 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={{ background: "#FAECE7", border: "0.5px solid #F0997B", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#712B13", marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={!canSubmit || loading}
              style={{ width: "100%", padding: "13px", background: canSubmit && !loading ? "#1D9E75" : "#d1d5db", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: canSubmit && !loading ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "background 0.15s" }}>
              {loading ? "Analyzing..." : "Analyze match →"}
            </button>
          </>
        ) : (
          <>
            {/* Results */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Analysis results</h2>
              <button onClick={() => setResult(null)} style={{ fontSize: 12, color: "#6b7280", background: "none", border: "0.5px solid #d1d5db", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
                ← New analysis
              </button>
            </div>

            {/* Score + summary */}
            <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: 14, display: "flex", gap: 20, alignItems: "center" }}>
              <ScoreRing score={result.match_score} />
              <div>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px", fontWeight: 500 }}>Match score</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: "#374151" }}>{result.summary}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {/* Strengths */}
              <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "1.1rem 1.25rem" }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#085041", margin: "0 0 10px" }}>Strengths</p>
                <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
                  {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              {/* Gaps */}
              <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "1.1rem 1.25rem" }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#712B13", margin: "0 0 10px" }}>Gaps</p>
                <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
                  {result.gaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            </div>

            {/* Keywords */}
            <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#374151", margin: "0 0 10px" }}>Keyword match</p>
              <div>{result.keyword_matches.map((k, i) => <KeywordPill key={i} kw={k} />)}</div>
            </div>

            {/* Improvements */}
            <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "1.1rem 1.25rem" }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#374151", margin: "0 0 10px" }}>Suggested improvements</p>
              <ol style={{ margin: 0, padding: "0 0 0 18px", fontSize: 13, color: "#374151", lineHeight: 2 }}>
                {result.suggested_improvements.map((tip, i) => <li key={i}>{tip}</li>)}
              </ol>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
