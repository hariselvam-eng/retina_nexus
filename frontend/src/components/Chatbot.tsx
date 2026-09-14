import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useState } from 'react';

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (!message.trim()) return;

    // Temporary UI response.
    // Connect this to your chatbot API later.
    setMessage('');
  };

  return (
    <>
      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[350px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500">
                <Bot size={19} />
              </div>

              <div>
                <p className="text-sm font-bold">Retina Assistant</p>
                <p className="text-[10px] text-teal-200">
                  Clinical workspace assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 transition hover:bg-white/10"
            >
              <X size={17} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[300px] overflow-y-auto bg-slate-50 p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-white p-3 shadow-sm">
              <p className="text-xs leading-5 text-slate-600">
                Hi! I'm the Retina Nexus assistant. I can help you navigate
                screening results, explain AI findings, review governance
                indicators, and understand the clinical workflow.
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                'Explain this result',
                'Start screening',
                'What is RetinaGuard?',
              ].map((text) => (
                <button
                  key={text}
                  onClick={() => setMessage(text)}
                  className="rounded-full border border-teal-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-400">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Ask Retina Assistant..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              />

              <button
                onClick={sendMessage}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white transition hover:bg-teal-700"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Open Retina Assistant"
        className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-teal-700"
      >
        {open ? <X size={22} /> : <MessageCircle size={23} />}

        {!open && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
        )}
      </button>
    </>
  );
}