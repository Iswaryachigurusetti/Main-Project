import { SOURCE_POOL } from "../data/mockData.js";

export function analyzeText(raw) {
  const text = raw.toLowerCase();
  let score = 38;
  ["free", "win", "urgent", "forward this", "act now", "lakh", "crore", "guaranteed", "click the link", "within 24 hours", "no application"]
    .forEach((w) => { if (text.includes(w)) score += 13; });
  ["official", "ministry", "notification", "pib", "government of india", ".gov.in", "circular", "reserve bank"]
    .forEach((w) => { if (text.includes(w)) score -= 11; });
  score = Math.max(6, Math.min(96, Math.round(score + (Math.random() * 10 - 5))));
  const verdict = score > 62 ? "misinformation" : score > 34 ? "unverified" : "reliable";
  const confidence = verdict === "misinformation" ? score : verdict === "reliable" ? 100 - score : 50 + Math.round(Math.random() * 14);
  const words = raw.split(/\s+/).filter(Boolean).slice(0, 6).map((w) => [w, Math.round((0.35 + Math.random() * 0.55) * 100) / 100]);
  const explanations = {
    misinformation: "The submitted text shows several patterns commonly seen in fabricated or manipulated claims — urgency cues, unverifiable specifics, or requests to share/forward — without a traceable official source.",
    unverified: "The submitted text references a plausible but unconfirmed situation. No matching official notification or authoritative report could be found yet, so the system withholds a strong verdict.",
    reliable: "The submitted text is phrased in a measured, attributable way and shares structural similarities with verified official communications, though you should still confirm against a primary source.",
  };
  return {
    id: "user-" + Date.now(), verdict, confidence,
    title: raw.slice(0, 90) + (raw.length > 90 ? "…" : ""),
    category: "User Submitted", fullText: raw, trendLevel: null, engagement: null, growth: null, time: "just now",
    words, explanation: explanations[verdict], sources: SOURCE_POOL[verdict],
    model: "StreamGuard-XAI v2.3 · Incremental ensemble", userSubmitted: true,
  };
}

export function chatReply(claim, question) {
  const q = question.toLowerCase();
  const label = claim.verdict === "misinformation" ? "Likely Misinformation" : claim.verdict === "reliable" ? "Reliable" : "Needs Verification";
  if (q.includes("true") || q.includes("real")) {
    return `Based on current evidence, this claim is assessed as ${label.toLowerCase()} (${claim.confidence}% model confidence). ${claim.explanation.slice(0, 160)}… I'd still recommend checking the official source in the Evidence tab before acting on it.`;
  }
  if (q.includes("source") || q.includes("official")) {
    const s = claim.sources[0];
    return `The most relevant source I found is ${s.name} (${s.domain}), last updated recently. It states: "${s.snippet}" You can open it directly from the Evidence & Verification section below.`;
  }
  if (q.includes("suspicious") || q.includes("why") || q.includes("flag")) return claim.explanation;
  if (q.includes("when")) {
    return `This claim started trending ${claim.time}, based on streaming activity from public posts. That's separate from when any underlying event actually occurred — the evidence sources give the most reliable timeline.`;
  }
  if (q.includes("who") || q.includes("affected")) {
    return `The claim as worded implies broad impact across ${claim.category.toLowerCase()}-related audiences, but the available evidence doesn't confirm the scope described — that's part of why it's marked "${label}."`;
  }
  if (q.includes("simply") || q.includes("simple") || q.includes("explain")) {
    return `In plain terms: ${claim.explanation.replace(/^The (model|submitted text)/, "the system")}`;
  }
  if (q.includes("evidence") || q.includes("support")) {
    return `${claim.sources.length} sources were checked for this claim. ${claim.sources.map((s) => s.name).join(" and ")} are the most relevant — see the Evidence tab for reliability scores and direct links.`;
  }
  return `Here's what I can tell you: this claim is currently rated "${label}" with ${claim.confidence}% confidence. ${claim.explanation.slice(0, 180)}… Ask me about the source, the reasoning, or who's affected for more detail.`;
}
