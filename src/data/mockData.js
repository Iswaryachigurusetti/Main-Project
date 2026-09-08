export const VERDICT = {
  reliable: { label: "Reliable", color: "#1E9E62", bg: "#E6F6ED", Icon: "ShieldCheck" },
  unverified: { label: "Needs Verification", color: "#B8790C", bg: "#FDF3DF", Icon: "ShieldQuestion" },
  misinformation: { label: "Likely Misinformation", color: "#D93025", bg: "#FCE8E6", Icon: "ShieldAlert" },
};

const SOURCE_POOL = {
  reliable: [
    { name: "Press Information Bureau", domain: "pib.gov.in", reliability: 97, snippet: "The official notification confirms the scheme details and eligibility criteria as circulated, with no changes to the published guidelines." },
    { name: "Ministry of Finance", domain: "finmin.nic.in", reliability: 96, snippet: "The circular dated this week outlines the revised implementation timeline consistent with earlier public statements." },
    { name: "UIDAI Official Portal", domain: "uidai.gov.in", reliability: 95, snippet: "No such requirement appears in the current enrolment guidelines published by the authority." },
  ],
  unverified: [
    { name: "State Education Department", domain: "education.gov.in", reliability: 72, snippet: "A draft proposal referencing similar terms is under internal review, but no public order has been issued yet." },
    { name: "Regional News Wire", domain: "newswire.in", reliability: 58, snippet: "Multiple outlets report the claim but attribute it to unnamed sources; no primary document has surfaced." },
  ],
  misinformation: [
    { name: "PIB Fact Check", domain: "factcheck.pib.gov.in", reliability: 98, snippet: "This claim has been reviewed and found to be false. No such circular has been issued by the ministry." },
    { name: "Reserve Bank of India", domain: "rbi.org.in", reliability: 97, snippet: "RBI has not issued any notification matching the description circulating on social platforms." },
  ],
};

function makeClaim(id, verdict, o) {
  return {
    id, verdict, confidence: o.confidence ?? (verdict === "unverified" ? 55 : 88),
    title: o.title, category: o.category, fullText: o.fullText,
    trendLevel: o.trendLevel, engagement: o.engagement, growth: o.growth, time: o.time,
    words: o.words, explanation: o.explanation,
    sources: o.sources ?? SOURCE_POOL[verdict],
    model: "StreamGuard-XAI v2.3 · Incremental ensemble",
  };
}

export const CLAIMS = [
  makeClaim("c1", "misinformation", {
    title: "Government announces ₹50,000 scholarship for every student, no application needed",
    category: "Education",
    fullText: "BREAKING: Central Government has announced a ₹50,000 scholarship for EVERY student in India, credited automatically tomorrow. No application required — forward to 10 people to confirm your eligibility before the deadline!",
    trendLevel: 94, engagement: "128K", growth: "+340%", time: "18m ago",
    words: [["₹50,000", 0.92], ["automatically", 0.81], ["forward to 10", 0.88], ["no application", 0.74], ["tomorrow", 0.55], ["EVERY student", 0.61]],
    explanation: "The model flagged this claim mainly because of urgency language (\"forward to 10 people\", \"before the deadline\") and an unrealistic universal cash promise with no official process attached — patterns strongly associated with forwarded hoaxes rather than genuine government notices.",
  }),
  makeClaim("c2", "unverified", {
    title: "New UPI transaction rule starting September — daily limit to change",
    category: "Finance",
    fullText: "Reports circulating that UPI daily transaction limits will change starting this September, with a new cap on person-to-merchant payments. Several regional pages are sharing slightly different numbers.",
    trendLevel: 81, engagement: "64K", growth: "+120%", time: "1h ago",
    words: [["daily limit", 0.58], ["starting September", 0.49], ["reports circulating", 0.62], ["several pages", 0.41]],
    explanation: "The claim references a plausible policy area (UPI limits are periodically revised) but no single authoritative notification could be matched yet, and the specific figures vary across sources — so the model withholds a strong verdict pending confirmation.",
  }),
  makeClaim("c3", "reliable", {
    title: "UIDAI clarifies: Aadhaar update is free at official centres, no third-party fee applies",
    category: "Public Announcement",
    fullText: "UIDAI has reiterated that Aadhaar demographic updates remain free of cost when done through official enrolment centres, and has warned users against third-party apps charging a fee for the service.",
    trendLevel: 67, engagement: "41K", growth: "+38%", time: "3h ago",
    words: [["free of cost", 0.71], ["official centres", 0.68], ["UIDAI reiterated", 0.66], ["warned against", 0.52]],
    explanation: "This matches an active, verifiable notice from the issuing authority itself, uses measured official language, and is corroborated by the authority's own published guidance — all patterns associated with reliable public communication.",
  }),
  makeClaim("c4", "misinformation", {
    title: "Viral claim: All government jobs to require a ₹5,000 'registration fee' from October",
    category: "Government Scheme",
    fullText: "A viral post claims every government job applicant will need to pay a ₹5,000 non-refundable 'registration fee' starting October, or their application will be rejected automatically.",
    trendLevel: 88, engagement: "97K", growth: "+210%", time: "42m ago",
    words: [["₹5,000 fee", 0.89], ["automatically rejected", 0.79], ["viral post", 0.62], ["non-refundable", 0.58]],
    explanation: "Government recruitment fees are typically published through official recruitment boards with exact category-wise breakdowns; this claim's vague, fear-based framing and lack of an issuing authority are strong misinformation markers.",
  }),
  makeClaim("c5", "unverified", {
    title: "Rumoured layoffs at a major tech firm's India office \"confirmed by insiders\"",
    category: "Technology",
    fullText: "Anonymous posts claim a major tech company is planning layoffs at its India office, citing unnamed \"insiders.\" No official statement has been made by the company.",
    trendLevel: 73, engagement: "52K", growth: "+95%", time: "2h ago",
    words: [["unnamed insiders", 0.55], ["no official statement", 0.6], ["anonymous posts", 0.49]],
    explanation: "The claim relies entirely on unverifiable anonymous sourcing with no corroborating official statement, placing it in a genuine grey zone rather than confirmed fact or clear fabrication.",
  }),
  makeClaim("c6", "reliable", {
    title: "RBI reiterates: no plan to withdraw ₹200 and ₹500 notes",
    category: "Finance",
    fullText: "The Reserve Bank of India has again clarified that there is no proposal to withdraw ₹200 or ₹500 currency notes from circulation, addressing a recurring rumour.",
    trendLevel: 59, engagement: "33K", growth: "+22%", time: "5h ago",
    words: [["RBI clarifies", 0.7], ["no proposal", 0.66], ["recurring rumour", 0.44]],
    explanation: "This is a direct, on-record statement from the relevant regulator addressing a known recurring rumour, which is the strongest possible reliability signal the model can weigh.",
  }),
  makeClaim("c7", "unverified", {
    title: "Claim: new state policy offers free electric scooters to college students",
    category: "Government Scheme",
    fullText: "A regional post claims a state government will distribute free electric scooters to all college students enrolled this year, though details vary by page.",
    trendLevel: 76, engagement: "45K", growth: "+140%", time: "26m ago",
    words: [["free scooters", 0.6], ["details vary", 0.57], ["regional post", 0.46]],
    explanation: "State-level welfare schemes of this kind do occasionally exist, but inconsistent details across sources and the absence of a matching official order keep this in unverified territory for now.",
  }),
  makeClaim("c8", "misinformation", {
    title: "Fake alert: bank accounts will be frozen if Aadhaar isn't linked \"within 24 hours\"",
    category: "Finance",
    fullText: "A message spreading on messaging apps warns that bank accounts will be frozen within 24 hours unless Aadhaar is linked immediately via a shared link.",
    trendLevel: 85, engagement: "112K", growth: "+265%", time: "9m ago",
    words: [["frozen within 24h", 0.9], ["shared link", 0.86], ["immediately", 0.68], ["messaging apps", 0.5]],
    explanation: "Artificial urgency combined with a request to click an unofficial shared link is a classic phishing pattern the model has learned to associate strongly with misinformation and fraud attempts, not genuine banking communication.",
  }),
  makeClaim("c9", "reliable", {
    title: "Ministry of Education confirms revised academic calendar for the coming term",
    category: "Education",
    fullText: "The Ministry of Education has published a revised academic calendar for the upcoming term, adjusting a small number of holiday dates via an official circular.",
    trendLevel: 48, engagement: "21K", growth: "+15%", time: "7h ago",
    words: [["official circular", 0.64], ["Ministry confirms", 0.6], ["revised calendar", 0.5]],
    explanation: "The announcement is traceable to a dated official circular from the issuing ministry with specific, checkable changes — consistent with genuine public communication rather than a rumour.",
  }),
];

export const DRIFT_EVENTS = [
  { time: "2h ago", detail: "Minor drift detected in 'urgency-language' feature distribution — model recalibrated automatically." },
  { time: "1d ago", detail: "Incremental update applied after 1,240 new labelled streaming samples." },
  { time: "3d ago", detail: "Concept drift flagged in finance-category claims; ADWIN window reset, retraining completed in 4m 12s." },
];

export const SUGGESTED = [
  "Is this actually true?", "Show me the official source.", "Why is this suspicious?",
  "When was this announced?", "Who is affected?", "Explain this simply.", "What evidence supports this claim?",
];

export { SOURCE_POOL };
