'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';

const ASSISTANCE_OPTIONS = [
  { id: 'water', label: 'पिण्याचे पाणी (Drinking Water)', icon: '💧' },
  { id: 'bowls', label: 'जास्त वाट्या / चमचे (Extra Bowls & Spoons)', icon: '🥣' },
  { id: 'napkins', label: 'टिश्यू / नॅपकिन (Napkins / Tissues)', icon: '🧻' },
  { id: 'waiter', label: 'वेटर बोलवा (Call Waiter)', icon: '🙋' },
  { id: 'clean', label: 'टेबल साफ करा (Clean Table)', icon: '🧹' },
];

export default function CallWaiterModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [confirmedMsg, setConfirmedMsg] = useState<string | null>(null);

  const { tableNumber, requestAssistance, assistanceRequests } = useStore();

  if (pathname.startsWith('/admin')) return null;

  // Check if this table has an active pending request
  const activeForTable = assistanceRequests.filter((r) => r.tableNumber === tableNumber);

  const handleRequest = (text: string) => {
    requestAssistance(tableNumber, text);
    setConfirmedMsg(text);
    setTimeout(() => {
      setConfirmedMsg(null);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 shadow-2xl transition-all active:scale-95 border ${
            activeForTable.length > 0
              ? 'bg-accent-gold text-black border-yellow-500 animate-pulse font-extrabold'
              : 'bg-primary text-white border-primary/50 hover:bg-primary/90 font-bold'
          }`}
          title="Call staff or ask for water"
        >
          <span className="text-base">{activeForTable.length > 0 ? '⏳' : '🛎️'}</span>
          <span className="text-xs">
            {activeForTable.length > 0 ? 'Staff Alerted' : 'पाणी / Call Staff'}
          </span>
        </button>
      </div>

      {/* Assistance Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-georgia text-lg font-black text-text-dark">Table {tableNumber} Assistance</h3>
                <p className="text-xs text-text-muted">How can our staff help you right now?</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-text-dark text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {confirmedMsg ? (
              <div className="py-6 text-center space-y-2">
                <span className="text-4xl animate-bounce">✅</span>
                <p className="font-georgia text-sm font-black text-accent-green">Staff Notified!</p>
                <p className="text-xs text-text-muted">
                  Request sent: <strong>{confirmedMsg}</strong>. Someone will assist you shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {ASSISTANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleRequest(opt.label)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-xs font-bold text-text-dark">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Note input */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Other request (e.g. extra salt, lime)..."
                      value={customMsg}
                      onChange={(e) => setCustomMsg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customMsg.trim()) {
                          handleRequest(customMsg.trim());
                        }
                      }}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-dark outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => {
                        if (customMsg.trim()) {
                          handleRequest(customMsg.trim());
                          setCustomMsg('');
                        }
                      }}
                      disabled={!customMsg.trim()}
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
