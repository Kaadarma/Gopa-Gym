import { useEffect, useRef, useState } from 'react';
import { QUICK_REPLIES, reply } from '../lib/chatbot';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Halo! Saya Gopa Assistant. Tanyakan tentang membership, kelas, atau check-in Anda.' },
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = (question) => {
    const q = question.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: 'user', text: q }, { from: 'bot', text: reply(q) }]);
    setText('');
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Tutup chatbot' : 'Buka chatbot'}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition duration-300 hover:-translate-y-0.5 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
      >
        <img src="/images/chat-launcher.svg" alt="" className="h-full w-full" draggable="false" />
      </button>

      <div
        className={`fixed bottom-24 right-6 z-40 flex h-[560px] max-h-[calc(100vh-7rem)] w-[380px] max-w-[calc(100vw-3rem)] origin-bottom-right flex-col overflow-hidden rounded-[14px] border border-border bg-secondary shadow-[0_24px_64px_rgba(0,0,0,0.55)] transition duration-300 ${
          open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
        role="dialog"
        aria-hidden={!open}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 bg-card px-4">
          <img src="/images/chat-avatar.svg" alt="" className="h-9 w-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-condensed text-base font-bold uppercase tracking-[0.02em] text-text">Gopa Assistant</p>
            <p className="mt-0.5 text-[10px] tracking-[0.02em] text-muted">● Online · balas dalam hitungan detik</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup"
            className="px-1 text-2xl leading-none text-muted transition hover:text-lime"
          >
            &times;
          </button>
        </div>

        <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
          {messages.map((m, i) =>
            m.from === 'bot' ? (
              <div
                key={i}
                className="max-w-[280px] rounded-xl bg-card px-4 py-3 text-sm leading-[1.5] text-text"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={i}
                className="ml-auto max-w-[280px] rounded-xl bg-lime px-4 py-3 text-sm leading-[1.5] text-ink"
              >
                {m.text}
              </div>
            ),
          )}
        </div>

        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-border bg-secondary px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.02em] text-lime transition hover:bg-lime/10"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex items-center gap-2 px-4 pb-4 pt-2"
        >
          <div className="flex h-12 flex-1 items-center rounded-lg border border-border bg-base px-3.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tanya tentang membership…"
              className="w-full bg-transparent text-xs text-text placeholder:text-[#6E7268] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            aria-label="Kirim"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-lg font-bold text-ink transition hover:bg-limeBright"
          >
            ↑
          </button>
        </form>
      </div>
    </>
  );
}
