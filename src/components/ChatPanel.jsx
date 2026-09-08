import { useState, useEffect, useRef } from "react";
import { Sparkles, Send } from "lucide-react";
import { SUGGESTED } from "../data/mockData.js";

export default function ChatPanel({ claim, messages, onSend, placeholder }) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const submit = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setInput("");
    onSend(t, setTyping);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-avatar"><Sparkles size={14} color="#fff" /></div>
        <div>
          <p className="chat-title">Fact-checking assistant</p>
          <p className="chat-subtitle">{claim ? "Context: this claim" : "General claim verification"}</p>
        </div>
      </div>
      <div className="chat-body">
        {messages.length === 0 && (
          <div className="chip-row">
            {SUGGESTED.map((s) => (
              <button key={s} className="chip" onClick={() => submit(s)}>{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role === "user" ? "chat-bubble--user" : "chat-bubble--ai"}`}>{m.text}</div>
        ))}
        {typing && (
          <div className="chat-bubble chat-bubble--ai chat-typing">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-input-row">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder ?? "Ask about this claim…"} className="chat-input" />
        <button className="chat-send" onClick={() => submit()}><Send size={14} color="#fff" /></button>
      </div>
    </div>
  );
}
