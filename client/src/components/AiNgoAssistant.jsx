import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, CheckCircle2 } from "lucide-react";
import { api } from "../api";

const QUICK_PROMPTS = [
  "How do I join as a Cadet or Volunteer?",
  "What are AGNI's key rural programs?",
  "Are donations eligible for 80G tax deduction?",
  "How does registration and ID card verification work?",
  "Where is AGNI located and how can I contact?"
];

export function AiNgoAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste! Welcome to AGNI Rural Welfare Society. I am your assistant. How can I help you today? You can ask about our Youth Cadet Corps, membership, volunteering, donations, or social programs.",
      time: "Just now"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (queryText) => {
    const text = String(queryText || inputValue || "").trim();
    if (!text || isLoading) return;

    const userMsg = {
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await api("/ai/assistant", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });

      const reply = res?.reply || "AGNI Rural Welfare Society is here to assist you. Please visit our Activities or Register pages for more details.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
          source: res?.source,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Thank you for reaching out. AGNI Rural Welfare Society works for rural youth discipline, healthcare, women self-help, and social welfare. Feel free to explore our Activities or contact our office!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ngo-assistant-root" aria-label="AGNI Society Assistant">
      {!isOpen && (
        <button
          type="button"
          className="ngo-assistant-trigger"
          onClick={() => setIsOpen(true)}
          aria-expanded="false"
          aria-controls="ngo-assistant-window"
          title="Open AGNI Society Assistant"
        >
          <span className="trigger-pulse" aria-hidden="true" />
          <MessageSquare size={20} className="trigger-icon" />
          <span className="trigger-text">AGNI Assistant</span>
        </button>
      )}

      {isOpen && (
        <section
          id="ngo-assistant-window"
          className="ngo-assistant-window"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-title"
        >
          {/* Header */}
          <header className="ngo-assistant-header">
            <div className="assistant-header-meta">
              <div className="assistant-avatar" aria-hidden="true">
                <Bot size={18} />
              </div>
              <div>
                <h3 id="assistant-title" className="assistant-title">AGNI Society Assistant</h3>
                <span className="assistant-status">
                  <span className="online-dot" /> Online • Official Guide
                </span>
              </div>
            </div>
            <div className="assistant-header-actions">
              <button
                type="button"
                className="assistant-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Quick Prompts */}
          <div className="assistant-prompts-bar">
            <span className="prompts-label">Suggested Inquiries:</span>
            <div className="prompts-scroll">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="prompt-chip"
                  disabled={isLoading}
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="assistant-messages-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`assistant-msg-bubble ${msg.role === "user" ? "msg-user" : "msg-assistant"}`}
              >
                <div className="msg-content">
                  <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.text}</p>
                </div>
                <span className="msg-time">{msg.time}</span>
              </div>
            ))}
            {isLoading && (
              <div className="assistant-msg-bubble msg-assistant loading-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <footer className="assistant-footer">
            <div className="assistant-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="assistant-input"
                placeholder="Ask about cadets, registration, donations..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                aria-label="Your inquiry"
              />
              <button
                type="button"
                className="assistant-send-btn"
                disabled={!inputValue.trim() || isLoading}
                onClick={() => handleSend()}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="assistant-disclaimer">
              Powered by verified AGNI Rural Welfare Society records & guidelines.
            </div>
          </footer>
        </section>
      )}
    </div>
  );
}

