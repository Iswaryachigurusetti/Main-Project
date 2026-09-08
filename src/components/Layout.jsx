import { Menu, X, Search, Bell, User, ShieldCheck, Home, TrendingUp, Sparkles, LayoutGrid } from "lucide-react";

export const NAV_ITEMS = [
  ["home", Home, "Home"],
  ["trending", TrendingUp, "Trending"],
  ["verify", Search, "Verify"],
  ["assistant", Sparkles, "AI Assistant"],
  ["activity", User, "My Activity"],
  ["insights", LayoutGrid, "Insights"],
];

export function Header({ view, goto, query, setQuery, setMobileOpen, addToast }) {
  return (
    <header className="header">
      <div className="header-inner">
        <button className="icon-btn only-mobile" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
        <button className="logo" onClick={() => goto("home")}>
          <div className="logo-mark"><ShieldCheck size={17} color="#fff" /></div>
          <span className="logo-text hide-mobile">VerifyAI</span>
        </button>
        <nav className="nav hide-mobile">
          {NAV_ITEMS.map(([key, Icon, label]) => (
            <button key={key} className={`nav-item ${view === key ? "nav-item--active" : ""}`} onClick={() => goto(key)}>
              <Icon size={16.5} /> {label}
            </button>
          ))}
        </nav>
        <div className="spacer" />
        <div className="search-box hide-mobile-sm">
          <Search size={14} />
          <input value={query} onChange={(e) => { setQuery(e.target.value); if (view !== "trending") goto("trending"); }} placeholder="Search claims…" />
        </div>
        <button className="icon-btn" onClick={() => addToast("You're all caught up.")}>
          <Bell size={19} /><span className="notif-dot" />
        </button>
        <button className="avatar-btn" onClick={() => goto("activity")}><User size={15} /></button>
      </div>
    </header>
  );
}

export function MobileDrawer({ open, onClose, view, goto }) {
  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <span className="logo-text">VerifyAI</span>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        {NAV_ITEMS.map(([key, Icon, label]) => (
          <button key={key} className={`nav-item ${view === key ? "nav-item--active" : ""}`} onClick={() => goto(key)}>
            <Icon size={16.5} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileNav({ view, goto }) {
  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.slice(0, 5).map(([key, Icon, label]) => (
        <button key={key} className={`mobile-nav-item ${view === key ? "mobile-nav-item--active" : ""}`} onClick={() => goto(key)}>
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export function Toasts({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">✓ {t.msg}</div>
      ))}
    </div>
  );
}
