import { useState } from "react";
import { ArrowLeft, Radio, Brain, ChevronDown, ThumbsUp, ThumbsDown, Flag, TrendingUp } from "lucide-react";
import { VERDICT } from "../data/mockData.js";
import { VerdictPill, ConfidenceGauge, SourceCard, WordWeightBar } from "../components/Common.jsx";
import ChatPanel from "../components/ChatPanel.jsx";

export default function ClaimDetail({ claim, onBack, bookmarked, onBookmark, chatMessages, onSend, feedback, onFeedback, addToast }) {
  const [tab, setTab] = useState("evidence");
  const [showTech, setShowTech] = useState(false);
  const v = VERDICT[claim.verdict];

  return (
    <div className="view view--narrow">
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back</button>

      <div className="detail-top">
        <VerdictPill verdict={claim.verdict} />
        <button className="bookmark-btn bookmark-btn--lg" onClick={() => onBookmark(claim.id)}>{bookmarked ? "★" : "☆"}</button>
      </div>

      <h1 className="detail-title">{claim.title}</h1>
      <p className="detail-text">{claim.fullText}</p>

      {!claim.userSubmitted && (
        <div className="detail-meta">
          <span>{claim.category}</span><span>·</span>
          <span><TrendingUp size={12} /> {claim.growth}</span><span>·</span>
          <span>{claim.engagement} discussing</span><span>·</span>
          <span>{claim.time}</span>
        </div>
      )}

      <div className="verdict-banner" style={{ background: v.bg, borderColor: `${v.color}44` }}>
        <ConfidenceGauge confidence={claim.confidence} verdict={claim.verdict} />
        <div>
          <p className="verdict-banner-eyebrow" style={{ color: v.color }}>AI Verdict</p>
          <p className="verdict-banner-label">{v.label}</p>
          <p className="verdict-banner-note">This is a model estimate, not a final determination — review the evidence below before drawing conclusions.</p>
        </div>
      </div>

      <div className="tabs">
        {[["evidence", "Evidence & Verification"], ["why", "Why this prediction"], ["ask", "Ask about this claim"]].map(([key, label]) => (
          <button key={key} className={`tab ${tab === key ? "tab--active" : ""}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === "evidence" && (
        <div>
          <p className="section-label"><Radio size={14} /> Evidence retrieved from external sources</p>
          <div className="source-grid">{claim.sources.map((s, i) => <SourceCard key={i} source={s} />)}</div>
          <p className="fine-print">Demo data — in production this section queries live official and authoritative sources at verification time and clearly labels retrieval date and confidence.</p>
        </div>
      )}

      {tab === "why" && (
        <div>
          <p className="section-label"><Brain size={14} /> Why did the model make this prediction?</p>
          <p className="explanation-text">{claim.explanation}</p>
          <p className="mini-label">Most influential phrases</p>
          <div className="word-list">{claim.words.map(([w, wt], i) => <WordWeightBar key={i} word={w} weight={wt} />)}</div>
          <button className="tech-toggle" onClick={() => setShowTech((s) => !s)}>
            <ChevronDown size={15} style={{ transform: showTech ? "rotate(180deg)" : "none", transition: "transform .2s" }} /> Technical details
          </button>
          {showTech && (
            <div className="tech-grid">
              <div><p>Model</p><span>{claim.model}</span></div>
              <div><p>Prediction score</p><span>{(claim.confidence / 100).toFixed(2)}</span></div>
              <div><p>Feature space</p><span>TF-IDF + contextual embeddings</span></div>
              <div><p>Incremental status</p><span className="dot-green">● Adapting normally</span></div>
            </div>
          )}
        </div>
      )}

      {tab === "ask" && <ChatPanel claim={claim} messages={chatMessages} onSend={onSend} />}

      <div className="feedback-block">
        <p className="mini-label" style={{ marginBottom: 12 }}>Was this verification helpful?</p>
        <div className="feedback-row">
          <button className={`feedback-btn ${feedback === "up" ? "feedback-btn--up" : ""}`}
            onClick={() => { onFeedback(claim.id, "up"); addToast("Thanks — your feedback helps retrain the model."); }}>
            <ThumbsUp size={14} /> Helpful
          </button>
          <button className={`feedback-btn ${feedback === "down" ? "feedback-btn--down" : ""}`}
            onClick={() => { onFeedback(claim.id, "down"); addToast("Thanks — flagged for review."); }}>
            <ThumbsDown size={14} /> Not helpful
          </button>
          {feedback === "down" && (
            <div className="report-row">
              {["Incorrect prediction", "Missing evidence", "Irrelevant source", "Outdated info", "Other"].map((r) => (
                <button key={r} className="report-chip" onClick={() => addToast(`Reported: ${r}`)}><Flag size={10} /> {r}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
