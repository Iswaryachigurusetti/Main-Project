import { useState, useEffect } from "react";
import { CLAIMS } from "./data/mockData.js";
import { chatReply } from "./utils/helpers.js";
import { Header, MobileDrawer, MobileNav, Toasts } from "./components/Layout.jsx";
import { HomeView, TrendingView, VerifyView, AssistantView, ActivityView, InsightsView } from "./pages/Pages.jsx";
import ClaimDetail from "./pages/ClaimDetail.jsx";

export default function App() {
  const [view, setView] = useState("home");
  const [selectedId, setSelectedId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [chatByClaimId, setChatByClaimId] = useState({});
  const [feedbackByClaimId, setFeedbackByClaimId] = useState({});
  const [toasts, setToasts] = useState([]);
  const [liveTick, setLiveTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLiveTick((v) => v + Math.floor(Math.random() * 4)), 4000);
    return () => clearInterval(t);
  }, []);

  const addToast = (msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const goto = (v) => { setView(v); setMobileOpen(false); };

  const openClaim = (id) => {
    setSelectedId(id); setView("claimDetail");
    setActivity((a) => (a.find((x) => x.claimId === id) ? a : [{ claimId: id, at: Date.now() }, ...a]));
  };

  const toggleBookmark = (id) => {
    setBookmarks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
    addToast(bookmarks.includes(id) ? "Removed from saved" : "Saved for later");
  };

  const sendChat = (claimId, text, setTyping) => {
    setChatByClaimId((c) => ({ ...c, [claimId]: [...(c[claimId] || []), { role: "user", text }] }));
    setTyping(true);
    const claim = CLAIMS.find((c) => c.id === claimId);
    setTimeout(() => {
      setChatByClaimId((c) => ({ ...c, [claimId]: [...(c[claimId] || []), { role: "ai", text: chatReply(claim, text) }] }));
      setTyping(false);
    }, 900);
  };

  const selected = CLAIMS.find((c) => c.id === selectedId);

  return (
    <div className="app">
      <Header view={view} goto={goto} query={query} setQuery={setQuery} setMobileOpen={setMobileOpen} addToast={addToast} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} view={view} goto={goto} />

      <main className="main">
        {view === "home" && <HomeView claims={CLAIMS} onOpen={openClaim} bookmarks={bookmarks} onBookmark={toggleBookmark} liveTick={liveTick} />}
        {view === "trending" && <TrendingView claims={CLAIMS} onOpen={openClaim} bookmarks={bookmarks} onBookmark={toggleBookmark} query={query} />}
        {view === "verify" && <VerifyView addToast={addToast} />}
        {view === "assistant" && <AssistantView addToast={addToast} />}
        {view === "activity" && <ActivityView activity={activity} claims={CLAIMS} onOpen={openClaim} bookmarks={bookmarks} onBookmark={toggleBookmark} />}
        {view === "insights" && <InsightsView claims={CLAIMS} />}
        {view === "claimDetail" && selected && (
          <ClaimDetail
            claim={selected}
            onBack={() => setView("trending")}
            bookmarked={bookmarks.includes(selected.id)}
            onBookmark={toggleBookmark}
            chatMessages={chatByClaimId[selected.id] || []}
            onSend={(text, setTyping) => sendChat(selected.id, text, setTyping)}
            feedback={feedbackByClaimId[selected.id]}
            onFeedback={(id, f) => setFeedbackByClaimId((s) => ({ ...s, [id]: f }))}
            addToast={addToast}
          />
        )}
      </main>

      <MobileNav view={view} goto={goto} />
      <Toasts toasts={toasts} />
    </div>
  );
}
