'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, ChevronDown, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: "Hi! I'm Ready Reckoner, CONCERN's assistant. I'm here to help with questions about our services, therapies, team, admissions, and programs. How can I help you today?",
};

const SUGGESTED_ACTIONS = [
  { label: 'Our Services', message: 'What services does CONCERN offer?' },
  { label: 'Admissions', message: 'How can someone get admitted to CONCERN?' },
  { label: 'Our Programs', message: 'Tell me about the programs at CONCERN' },
  { label: 'Contact Team', message: 'How can I contact the CONCERN team?' },
  { label: 'Annual Reports', message: 'Where can I find the annual reports and ITR filings?' },
];

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return <code key={i} className="text-[0.8em] bg-black/10 rounded px-1 font-mono">{part.slice(1, -1)}</code>;
    return part || null;
  });
}

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      if (out.length > 0) out.push(<div key={`sp-${i}`} className="h-2" />);
      i++; continue;
    }

    if (line.startsWith('### ')) {
      out.push(<p key={i} className="font-semibold mt-1">{renderInline(line.slice(4))}</p>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      out.push(<p key={i} className="font-bold mt-2">{renderInline(line.slice(3))}</p>);
      i++; continue;
    }

    if (/^[*-] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[*-] /.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].slice(2))}</li>);
        i++;
      }
      out.push(<ul key={`ul-${i}`} className="list-disc list-outside pl-4 space-y-0.5 my-1">{items}</ul>);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      out.push(<ol key={`ol-${i}`} className="list-decimal list-outside pl-4 space-y-0.5 my-1">{items}</ol>);
      continue;
    }

    out.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5 text-sm">{out}</div>;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
        scrollToBottom('instant');
      }, 320);
    }
  }, [isOpen, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  }, []);

  function adjustHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }

  async function handleSend(messageText?: string) {
    const text = (messageText ?? input).trim();
    if (!text || isLoading) return;

    setShowSuggestions(false);
    const history = messages.slice(1).filter(m => !m.isError);

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text };
    const assistantMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok || !res.body) throw new Error('Bad response');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Sorry, something went wrong. Please try again or call us at **+91 9840800816**.',
          isError: true,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const lastMsg = messages[messages.length - 1];
  const isTyping = isLoading && lastMsg?.role === 'assistant' && !lastMsg.content;
  const isStreaming = isLoading && lastMsg?.role === 'assistant' && !!lastMsg.content;
  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-50 flex flex-col items-start gap-3">

      {/* ── Chat panel — opens above the launcher row ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ transformOrigin: 'bottom left' }}
            className="w-[min(340px,calc(100vw-88px))] sm:w-[384px]"
          >
            <div
              className="flex flex-col rounded-2xl overflow-hidden border border-border/60 bg-background shadow-[0_8px_40px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)]"
              style={{ height: 'min(560px, calc(100dvh - 96px))' }}
            >

              {/* Header */}
              <div className="shrink-0 px-4 py-3.5 flex items-center justify-between"
                   style={{ background: 'hsl(88 52% 38%)' }}>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                      <Bot className="h-[18px] w-[18px] text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[hsl(88_52%_38%)]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-snug">Ready Reckoner</p>
                    <p className="text-white/65 text-[11px] leading-snug mt-0.5">Online · Usually replies instantly</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white hover:bg-white/15 transition-all p-1.5 rounded-full"
                  aria-label="Close chat"
                >
                  <X className="h-[18px] w-[18px]" strokeWidth={2.5} />
                </button>
              </div>

              {/* Messages + scroll-down button */}
              <div className="relative flex-1 min-h-0">

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="h-full overflow-y-auto px-4 py-4"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
                >
                  <div className="flex flex-col gap-2">

                    {messages.map((msg, i) => {
                      const isEmpty = msg.role === 'assistant' && !msg.content;
                      if (isEmpty) return null;

                      const prevRole = i > 0 ? messages[i - 1].role : null;
                      const isGrouped = prevRole === msg.role;

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-1'}`}
                        >
                          {/* Avatar */}
                          {msg.role === 'assistant' && (
                            <div className={`shrink-0 mb-0.5 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center ${isGrouped ? 'invisible' : ''}`}>
                              <Bot className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}

                          {/* Bubble */}
                          <div
                            className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-[4px]'
                                : msg.isError
                                ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-[4px]'
                                : 'bg-card border border-border/50 text-foreground rounded-bl-[4px] shadow-sm'
                            }`}
                          >
                            {msg.role === 'assistant' ? renderMarkdown(msg.content) : (
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                            )}

                            {/* Blinking cursor during streaming */}
                            {isStreaming && i === messages.length - 1 && (
                              <motion.span
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.9, repeat: Infinity }}
                                className="inline-block w-[2px] h-[13px] bg-current ml-0.5 align-middle rounded-full"
                              />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-end gap-2 justify-start mt-1"
                        >
                          <div className="shrink-0 mb-0.5 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="bg-card border border-border/50 rounded-2xl rounded-bl-[4px] px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-[5px]">
                              {[0, 1, 2].map(j => (
                                <motion.span
                                  key={j}
                                  className="h-[6px] w-[6px] rounded-full bg-muted-foreground/50"
                                  animate={{ y: ['0%', '-55%', '0%'] }}
                                  transition={{ duration: 0.7, repeat: Infinity, delay: j * 0.13, ease: 'easeInOut' }}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Suggested action chips */}
                    <AnimatePresence>
                      {showSuggestions && messages.length === 1 && !isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.12 }}
                          className="flex flex-wrap gap-1.5 mt-2 ml-8"
                        >
                          {SUGGESTED_ACTIONS.map(action => (
                            <button
                              key={action.label}
                              onClick={() => handleSend(action.message)}
                              className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-primary/35 text-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-all duration-150"
                            >
                              {action.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={bottomRef} className="h-1 shrink-0" />
                  </div>
                </div>

                {/* Scroll-to-bottom button */}
                <AnimatePresence>
                  {showScrollDown && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => scrollToBottom()}
                      className="absolute bottom-3 right-3 h-7 w-7 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Scroll to latest message"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Fade at bottom when scrolled up */}
                {showScrollDown && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent" />
                )}
              </div>

              {/* Input area */}
              <div className="shrink-0 border-t border-border/60 px-3 pt-2.5 pb-3">
                <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => { setInput(e.target.value); adjustHeight(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about CONCERN…"
                    disabled={isLoading}
                    rows={1}
                    maxLength={500}
                    aria-label="Message"
                    className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/55 disabled:opacity-50 leading-relaxed py-0.5 min-h-[22px] max-h-[96px]"
                    style={{ scrollbarWidth: 'none' }}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!canSend}
                    aria-label="Send message"
                    className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                      canSend
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                        : 'bg-transparent text-muted-foreground/40 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-[15px] w-[15px]" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/45 text-center mt-1.5 select-none">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Launcher row: FAB on left, pill on right ── */}
      <div className="flex flex-row items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(v => !v)}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_18px_rgba(0,0,0,0.20)] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow hover:shadow-[0_4px_22px_rgba(0,0,0,0.26)]"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span key="x"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }}>
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span key="msg"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.14 }}>
                <MessageCircle className="h-6 w-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, x: -6, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -6, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              onClick={() => setIsOpen(true)}
              aria-label="Open chat"
              className="flex items-center gap-2 bg-background text-foreground text-sm font-medium px-4 py-2.5 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.10)] border border-border/70 whitespace-nowrap hover:border-primary/40 hover:shadow-[0_4px_18px_rgba(0,0,0,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"
              />
              Chat with us
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
