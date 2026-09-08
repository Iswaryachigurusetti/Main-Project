import { useState, useMemo } from "react";
import { Activity, ShieldAlert, ShieldCheck, TrendingUp, Users, Zap, Radio, Sparkles, Search, Loader2, CheckCircle2, AlertTriangle, Cpu, GitBranch } from "lucide-react";
import { VERDICT, DRIFT_EVENTS } from "../data/mockData.js";
import { StatCard, ClaimRow, VerdictPill } from "../components/Common.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import ClaimDetail from "./ClaimDetail.jsx";
import { analyzeText, chatReply } from "../utils/helpers.js";

function timeAgoRandomTick() {
  return ["just now", "1m ago", "2m ago", "moments ago"][Math.floor(Math.random() * 4)];
}

export function HomeView({ claims, onOpen, bookmarks, onBookmark, liveTick }) {
  const featured = claims[0];
  const rest = claims.slice(1, 6);
  const recommended = [claims[6], claims[3], claims[7]];
  const stats = useMemo(() => ({
    checked: 128470 + liveTick,
    misinfo: claims.filter((c) => c.verdict === "misinformation").length,
    reliable: claims.filter((c) => c.verdict === "reliable").length,
  }), [liveTick]);

  return (
    <div className="view view--narrow">
      <div className="live-row">
        <span className="live-dot" /><span className="live-label">Live</span>
        <span className="live-sub">Streaming detection active · updated {timeAgoRandomTick()}</span>
      </div>
      <h1 className="hero-title">Know what's actually true, before you share it.</h1>
      <p className="hero-sub">Real-time misinformation detection across streaming social text — with the evidence and reasoning shown, not hidden.</p>

      <div className="stats-grid">
        <StatCard icon={Activity} label="Claims checked today" value={stats.checked.toLocaleString()} accent="#3B78E7" />
        <StatCard icon={ShieldAlert} label="Misinformation caught" value={stats.misinfo * 214 + 12} accent="#D93025" />
        <StatCard icon={ShieldCheck} label="Verified reliable" value={stats.reliable * 180 + 40} accent="#1E9E62" />
      </div>

      <button className="featured-card" onClick={() => onOpen(featured.id)}>
        <p className="featured-eyebrow"><Zap size={13} /> Rapidly rising</p>
        <VerdictPill verdict={featured.verdict} size="sm" />
        <h2 className="featured-title">{featured.title}</h2>
        <div className="claim-row-stats">
          <span><TrendingUp size={12} /> {featured.growth} in the last hour</span>
          <span><Users size={12} /> {featured.engagement} discussing</span>
        </div>
      </button>

      <h2 className="section-title"><Radio size={15} color="#D93025" /> What's trending</h2>
      <div>{rest.map((c) => <ClaimRow key={c.id} claim={c} onOpen={onOpen} onBookmark={onBookmark} bookmarked={bookmarks.includes(c.id)} />)}</div>

      <h2 className="section-title" style={{ marginTop: 36 }}><Sparkles size={15} color="#3B78E7" /> Recommended for you</h2>
      <div>
        {recommended.map((c, i) => (
          <ClaimRow key={c.id} claim={c} onOpen={onOpen} onBookmark={onBookmark} bookmarked={bookmarks.includes(c.id)}
            reason={["Similar to claims you checked", "Trending rapidly", "Needs verification"][i]} />
        ))}
      </div>
    </div>
  );
}

export function TrendingView({ claims, onOpen, bookmarks, onBookmark, query }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("trending");
  let list = claims.filter((c) => filter === "all" || c.verdict === filter);
  if (query) list = list.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));
  list = [...list].sort((a, b) => (sort === "trending" ? b.trendLevel - a.trendLevel : parseFloat(b.growth) - parseFloat(a.growth)));

  return (
    <div className="view view--narrow">
      <h1 className="page-title">Trending</h1>
      <p className="page-sub">Live claims from streaming social text, ranked by trending activity.</p>
      <div className="filter-row">
        {[["all", "All"], ["reliable", "Reliable"], ["unverified", "Unverified"], ["misinformation", "Misinformation"]].map(([k, l]) => (
          <button key={k} className={`filter-chip ${filter === k ? "filter-chip--active" : ""}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
        <div className="spacer" />
        {[["trending", "Trending"], ["growth", "Growth"]].map(([k, l]) => (
          <button key={k} className={`sort-chip ${sort === k ? "sort-chip--active" : ""}`} onClick={() => setSort(k)}>{l}</button>
        ))}
      </div>
      {list.length === 0 ? <div className="empty-state">No claims match this filter yet.</div>
        : list.map((c) => <ClaimRow key={c.id} claim={c} onOpen={onOpen} onBookmark={onBookmark} bookmarked={bookmarks.includes(c.id)} />)}
    </div>
  );
}

function ClaimDetailWrapper({ claim, onBack, addToast }) {
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const onSend = (text, setTyping) => {
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);
    setTimeout(() => { setMessages((m) => [...m, { role: "ai", text: chatReply(claim, text) }]); setTyping(false); }, 900);
  };
  return (
    <ClaimDetail claim={claim} onBack={onBack} bookmarked={false} onBookmark={() => {}}
      chatMessages={messages} onSend={onSend} feedback={feedback} onFeedback={(id, f) => setFeedback(f)} addToast={addToast} />
  );
}

export function VerifyView({ addToast }) {
  const [text, setText] = useState("");
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState(null);
  const stages = ["Understanding claim", "Analyzing text", "Checking available evidence", "Comparing evidence", "Preparing explanation"];

  const run = () => {
    if (!text.trim()) return;
    setResult(null); setStage(0);
    let i = 0;
    const step = () => {
      i++;
      if (i < stages.length) { setStage(i); setTimeout(step, 620); }
      else { setTimeout(() => { setResult(analyzeText(text)); setStage(-1); }, 500); }
    };
    setTimeout(step, 620);
  };

  if (result) return <ClaimDetailWrapper claim={result} onBack={() => { setResult(null); setText(""); }} addToast={addToast} />;

  return (
    <div className="view view--narrow-sm">
      <h1 className="page-title"><Search size={20} color="#3B78E7" /> Verify any claim</h1>
      <p className="page-sub">Paste a WhatsApp forward, headline, social post, or any statement you want checked.</p>
      <textarea className="textarea" rows={6} value={text} disabled={stage >= 0}
        onChange={(e) => setText(e.target.value)} placeholder="Paste the claim you want to verify…" />
      <div className="verify-actions">
        <span className="char-count">{text.length} characters</span>
        <button className="btn-primary" disabled={!text.trim() || stage >= 0} onClick={run}>
          {stage >= 0 ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
          {stage >= 0 ? "Analyzing…" : "Verify claim"}
        </button>
      </div>
      {stage >= 0 && (
        <div className="stage-list">
          {stages.map((s, i) => (
            <div key={s} className="stage-item">
              {i < stage ? <CheckCircle2 size={17} color="#1E9E62" /> : i === stage ? <Loader2 size={17} className="spin" color="#3B78E7" /> : <span className="stage-empty" />}
              <span style={{ color: i <= stage ? "#202124" : "#9AA0A6" }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AssistantView({ addToast }) {
  const [messages, setMessages] = useState([]);
  const onSend = (text, setTyping) => {
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: "I can help you verify claims, explain a prediction, or point you to trusted sources. Try pasting a specific claim in the Verify tab, or open any trending claim and ask me directly — I keep it in context automatically so you don't need to repeat it." }]);
      setTyping(false);
    }, 900);
  };
  return (
    <div className="view view--narrow-sm">
      <h1 className="page-title"><Sparkles size={20} color="#3B78E7" /> AI Assistant</h1>
      <p className="page-sub">A specialized fact-checking assistant — ask general questions, or open a claim to ask about it specifically.</p>
      <ChatPanel claim={null} messages={messages} onSend={onSend} placeholder="Ask the assistant anything about verification…" />
    </div>
  );
}

export function ActivityView({ activity, claims, onOpen, bookmarks, onBookmark }) {
  const items = activity.map((a) => claims.find((c) => c.id === a.claimId)).filter(Boolean);
  return (
    <div className="view view--narrow">
      <h1 className="page-title">My activity</h1>
      <p className="page-sub">Claims you've checked, with predictions and evidence saved for later.</p>
      {items.length === 0 ? (
        <div className="empty-state empty-state--card">
          <p>Nothing checked yet.</p>
          <p className="empty-state-sub">Open a trending claim or verify one of your own to see it here.</p>
        </div>
      ) : items.map((c) => <ClaimRow key={c.id} claim={c} onOpen={onOpen} onBookmark={onBookmark} bookmarked={bookmarks.includes(c.id)} />)}

      {bookmarks.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 36 }}>★ Saved claims</h2>
          {claims.filter((c) => bookmarks.includes(c.id)).map((c) => <ClaimRow key={c.id} claim={c} onOpen={onOpen} onBookmark={onBookmark} bookmarked />)}
        </>
      )}
    </div>
  );
}

export function InsightsView({ claims }) {
  const misinfo = claims.filter((c) => c.verdict === "misinformation").length;
  const reliable = claims.filter((c) => c.verdict === "reliable").length;
  const unverified = claims.filter((c) => c.verdict === "unverified").length;
  const total = claims.length;
  const donut = [
    { v: "misinformation", n: misinfo, color: VERDICT.misinformation.color },
    { v: "unverified", n: unverified, color: VERDICT.unverified.color },
    { v: "reliable", n: reliable, color: VERDICT.reliable.color },
  ];
  let acc = 0;
  const r = 60, c = 2 * Math.PI * r;

  return (
    <div className="view view--narrow">
      <h1 className="page-title">Insights</h1>
      <p className="page-sub">A snapshot of detection activity across the streaming pipeline.</p>

      <div className="insights-grid">
        <div className="donut-card">
          <svg width={148} height={148} style={{ transform: "rotate(-90deg)" }}>
            {donut.map((seg) => {
              const dash = (seg.n / total) * c;
              const el = <circle key={seg.v} cx={74} cy={74} r={r} fill="none" stroke={seg.color} strokeWidth="16" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-acc} />;
              acc += dash;
              return el;
            })}
          </svg>
          <div className="donut-legend">
            {donut.map((seg) => (
              <div key={seg.v} className="legend-item">
                <span className="legend-dot" style={{ background: seg.color }} />
                <span>{VERDICT[seg.v].label}</span><span className="legend-n">{seg.n}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-stack">
          <StatCard icon={Activity} label="Claims checked (demo window)" value={total} accent="#3B78E7" />
          <StatCard icon={ShieldAlert} label="Misinformation detected" value={misinfo} accent="#D93025" />
          <StatCard icon={ShieldCheck} label="Reliable claims confirmed" value={reliable} accent="#1E9E62" />
        </div>
      </div>

      <div className="system-banner">
        <p className="system-title"><Cpu size={15} /> System &amp; model insights</p>
        <div className="system-status-grid">
          <div className="status-card">
            <span className="dot-green">●</span>
            <div><p>Model adapting normally</p><span>Streaming data status: healthy</span></div>
          </div>
          <div className="status-card">
            <AlertTriangle size={16} color="#B8790C" />
            <div><p>Minor drift last detected 2h ago</p><span>ADWIN window auto-recalibrated</span></div>
          </div>
        </div>
        <div className="system-numbers">
          <div><p>1,240</p><span>samples since last update</span></div>
          <div><p>4m 12s</p><span>last retraining time</span></div>
          <div><p>3</p><span>drift events this week</span></div>
        </div>
        <p className="mini-label"><GitBranch size={12} /> Recent drift events</p>
        <div className="drift-list">
          {DRIFT_EVENTS.map((e, i) => (
            <div key={i} className="drift-item"><span>{e.time}</span><span>{e.detail}</span></div>
          ))}
        </div>
      </div>
      <p className="fine-print">Demo statistics — connects to the live incremental-learning &amp; ADWIN monitoring pipeline in production.</p>
    </div>
  );
}
