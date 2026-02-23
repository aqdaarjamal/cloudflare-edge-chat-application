import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useChatStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Hash, Info, Search } from 'lucide-react';
export function ChatArea() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const rooms = useChatStore((s) => s.rooms);
  const messagesMap = useChatStore((s) => s.messages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const syncMessages = useChatStore((s) => s.syncMessages);
  const currentUser = useChatStore((s) => s.currentUser);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const room = useMemo(() => rooms.find(r => r.id === activeRoomId), [rooms, activeRoomId]);
  const messages = useMemo(() => activeRoomId ? (messagesMap[activeRoomId] || []) : [], [activeRoomId, messagesMap]);
  // Polling Sync Engine
  useEffect(() => {
    if (!activeRoomId) return;
    syncMessages(activeRoomId); // Initial load
    const interval = setInterval(() => {
      syncMessages(activeRoomId);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeRoomId, syncMessages]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  const handleSend = async () => {
    if (!input.trim() || !activeRoomId) return;
    const content = input.trim();
    setInput('');
    try {
      await sendMessage(activeRoomId, content);
    } catch (err) {
      console.error("Message failed to send");
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  if (!room) return <div className="flex-1 flex items-center justify-center text-slate-500 font-medium">Select a room to start at the edge</div>;
  return (
    <div className="flex flex-col h-full">
      <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-slate-900/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-blue-500" />
          <h1 className="font-bold text-lg text-white">{room.name}</h1>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1" />
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Search className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <Info className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-slate-500 space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Hash className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">This is the beginning of the #{room.name} channel.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={msg.senderId === currentUser?.id}
              />
            ))
          )}
        </div>
      </div>
      <footer className="p-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto relative group">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${room.name}`}
            className="min-h-[56px] w-full bg-slate-800 border-white/5 text-slate-200 pr-16 py-4 rounded-2xl focus-visible:ring-blue-500/50 resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-3 uppercase tracking-[0.2em] font-medium">
          Edge Optimized Syncing • Zero Latency Feel
        </p>
      </footer>
    </div>
  );
}