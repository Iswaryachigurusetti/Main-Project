import { ShieldCheck, ShieldAlert, ShieldQuestion, TrendingUp, ExternalLink } from "lucide-react";
import { VERDICT } from "../data/mockData.js";

const ICONS = { ShieldCheck, ShieldAlert, ShieldQuestion };

export function VerdictPill({ verdict, size = "md" }) {
  const v = VERDICT[verdict];
  const Icon = ICONS[v.Icon];
  return (
    <span className={`verdict-pill ${size === "sm" ? "verdict-pill--sm" : ""}`} style={{ color: v.color, background: v.bg }}>
      <Icon size={size === "sm" ? 13 : 15} strokeWidth={2.4} />
      {v.label}
    </span>
  );
}

export function ConfidenceGauge({ confidence, verdict, size = 108 }) {
  const v = VERDICT[verdict];
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (confidence / 100) * c;
  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E4E7EC" strokeWidth="9" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={v.color} strokeWidth="9" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="gauge-arc" />
      </svg>
      <div className="gauge-label">
        <span className="gauge-value" style={{ color: v.color }}>{confidence}%</span>
        <span className="gauge-caption">confidence</span>
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${accent}1a`, color: accent }}>
        <Icon size={16} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

export function SourceCard({ source }) {
  return (
    <div className="source-card">
      <div className="source-card-top">
        <div>
          <p className="source-name">{source.name}</p>
          <p className="source-domain">{source.domain}</p>
        </div>
        <div className="source-reliability" style={{ color: source.reliability > 85 ? "#1E9E62" : source.reliability > 65 ? "#B8790C" : "#D93025" }}>
          {source.reliability}% reliable
        </div>
      </div>
      <p className="source-snippet">"{source.snippet}"</p>
      <div className="source-card-bottom">
        <span className="source-tag">Evidence from external source</span>
        <span className="source-link"><ExternalLink size={12} /> View source</span>
      </div>
    </div>
  );
}

export function WordWeightBar({ word, weight }) {
  return (
    <div className="word-row">
      <span className="word-label">{word}</span>
      <div className="word-track"><div className="word-fill" style={{ width: `${weight * 100}%` }} /></div>
      <span className="word-value">{Math.round(weight * 100)}</span>
    </div>
  );
}

export function ClaimRow({ claim, onOpen, onBookmark, bookmarked, reason }) {
  const v = VERDICT[claim.verdict];
  return (
    <button className="claim-row" onClick={() => onOpen(claim.id)}>
      <span className="claim-row-stripe" style={{ background: v.color }} />
      <div className="claim-row-body">
        <div className="claim-row-meta">
          <VerdictPill verdict={claim.verdict} size="sm" />
          <span className="claim-row-category">{claim.category}</span>
          {reason && <span className="claim-row-reason">✦ {reason}</span>}
        </div>
        <h3 className="claim-row-title">{claim.title}</h3>
        <div className="claim-row-stats">
          <span><TrendingUp size={12} /> {claim.growth} growth</span>
          <span>{claim.engagement} discussing</span>
          <span>{claim.time}</span>
        </div>
      </div>
      <div className="claim-row-actions">
        <span className="bookmark-btn" onClick={(e) => { e.stopPropagation(); onBookmark(claim.id); }}>
          {bookmarked ? "★" : "☆"}
        </span>
        <span className="chevron">›</span>
      </div>
    </button>
  );
}
