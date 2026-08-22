import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { askAI } from "../../services/Operations/authAPI";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion } from "framer-motion";

const AIGeminiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading, isOpen]);

  const handleAskAi = (e) => {
    e.preventDefault();
    const currentQuery = inputQuery.trim();
    if (!currentQuery) return;

    const newUserMessage = { type: "user", text: currentQuery };
    setChatHistory((prev) => [...prev, newUserMessage]);

    setLoading(true);
    setInputQuery("");

    dispatch(
      askAI(currentQuery, (res) => {
        const newBotMessage = { type: "bot", text: res };
        setChatHistory((prev) => [...prev, newBotMessage]);
        setLoading(false);
      })
    );
  };

  return (
    <div
      className={`fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[1000] font-sans flex flex-col items-end ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`mb-4 w-[calc(100vw-32px)] sm:w-[380px] md:w-[420px] h-[70vh] max-h-[580px] rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300 transform ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-10 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-[var(--surface-raised)] border-b border-[var(--border-subtle)] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-blue)] flex items-center justify-center text-black shadow-md">
              <Sparkles size={18} className="text-[#070707]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  Samaj AI Assistant
                </h3>
                <span className="inline-flex items-center rounded-full bg-[var(--accent-primary)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                Online & Ready
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
            aria-label="Close Chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg)] custom-scrollbar"
        >
          {/* Welcome Message */}
          <div className="flex items-start gap-2.5 max-w-[90%]">
            <div className="w-7 h-7 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0 mt-1">
              <Bot size={14} />
            </div>
            <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-3.5 rounded-2xl rounded-tl-sm text-[var(--text-primary)] text-xs sm:text-sm leading-relaxed shadow-sm">
              Namaste! 🙏 How can I assist you with community programs, matrimonial profiles, donations, or member details today?
            </div>
          </div>

          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              } items-start gap-2.5`}
            >
              {msg.type === "bot" && (
                <div className="w-7 h-7 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shrink-0 mt-1">
                  <Bot size={14} />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                  msg.type === "user"
                    ? "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[#070707] font-medium rounded-tr-sm shadow-md"
                    : "bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.type === "bot" ? (
                  <article className="prose prose-sm dark:prose-invert max-w-none break-words text-[var(--text-primary)]">
                    <ReactMarkdown
                      components={{
                        strong: ({ node, ...props }) => (
                          <span className="font-bold text-[var(--accent-primary)]" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc ml-4 my-2 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal ml-4 my-2 space-y-1" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </article>
                ) : (
                  msg.text
                )}
              </div>

              {msg.type === "user" && (
                <div className="w-7 h-7 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0 mt-1">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 ml-9">
              <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-3.5 bg-[var(--surface-raised)] border-t border-[var(--border-subtle)]">
          <form
            onSubmit={handleAskAi}
            className="flex items-center bg-[var(--surface-elevated)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-primary)] rounded-full px-3.5 py-1.5 transition-all shadow-inner"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about Samaj..."
              className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-1"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="ml-2 w-8 h-8 rounded-full bg-[var(--accent-primary)] text-[#070707] hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Send Query"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl z-50 pointer-events-auto border border-[var(--border-subtle)] overflow-hidden cursor-pointer ${
          isOpen
            ? "bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-lg"
            : "bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-blue)] text-[#070707] shadow-[0_10px_30px_rgba(0,223,165,0.35)]"
        }`}
        aria-label="Toggle AI Assistant"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "bot"}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X size={22} className="text-[var(--text-primary)]" strokeWidth={2.2} />
            ) : (
              <Sparkles size={22} className="text-[#070707]" strokeWidth={2.2} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default AIGeminiChat;
