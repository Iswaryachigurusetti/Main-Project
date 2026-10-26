# VerifyAI — Frontend Prototype

Final-year project: Adaptive Explainable Machine Learning Framework for
Real-Time Misinformation Detection in Streaming Text Data.

Plain React + Vite + plain CSS (no Tailwind, no build-step CSS tooling).

## Run it

```
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Project structure

```
src/
  data/mockData.js      demo claims, sources, drift events
  utils/helpers.js       analyzeText() + chatReply() — swap these for real API calls
  components/            reusable UI: Header, ChatPanel, ClaimRow, cards, etc.
  pages/                 Home, Trending, Verify, Assistant, Activity, Insights, ClaimDetail
  App.jsx                app state + routing (view switch, no react-router needed)
  index.css              all styling (plain CSS, Google-Workspace-inspired palette)
```

## Connecting a real backend later

- `src/utils/helpers.js` — replace `analyzeText()` with a `fetch()` call to your
  ML prediction API, and `chatReply()` with a call to your LLM/RAG service.
- `src/data/mockData.js` — replace `CLAIMS` with data fetched from your
  streaming/social-media pipeline.
- Evidence sources, ADWIN/drift stats, and incremental-learning numbers in
  `InsightsView` and `ClaimDetail` are demo values — wire them to your
  monitoring endpoints when ready.
