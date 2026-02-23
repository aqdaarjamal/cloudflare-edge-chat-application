import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Hash, Info, Search, Users, Activity } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
export function ChatArea() {
  const activeRoomId = useChatStore(s => s.activeRoomId);
  const rooms = useChatStore(s => s.rooms);
  const messagesMap = useChatStore(useShallow(s => s.messages));
  const typingUsersMap = useChatStore(useShallow(s => s.typingUsers));
  const sendMessage = useChatStore(s => s.sendMessage);
  const reportTyping = useChatStore(s => s.reportTyping);
  const connectRoom = useChatStore(s => s.connectRoom);
  const connectionStatus = useChatStore(s => s.connectionStatus);
  const currentUser = useChatStore(s => s.currentUser);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const room = useMemo(() => rooms.find(r => r.id === activeRoomId), [rooms, activeRoomId]);
  const messages = useMemo(() => (activeRoomId ? messagesMap[activeRoomId] || [] : []), [activeRoomId, messagesMap]);
  const typingUsers = useMemo(() => (activeRoomId ? (typingUsersMap[activeRoomId] || []).filter(name => name !== currentUser?.name) : []), [activeRoomId, typingUsersMap, currentUser?.name]);
  useEffect(() => {
    if (activeRoomId) {
      connectRoom(activeRoomId);
    }
  }, [activeRoomId, connectRoom]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  const handleSend = () => {
    if (!input.trim() || !activeRoomId) return;
    sendMessage(activeRoomId, input.trim());
    setInput('');
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (activeRoomId) reportTyping(activeRoomId);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  if (!room) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-medium space-y-4">
      <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl">
        <Hash className="w-8 h-8 text-blue-500/50" />
      </div>
      <p>Select a room to start at the edge</p>
    </div>
  );
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-slate-900/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-blue-500" />
          <h1 className="font-bold text-lg text-white">{room.name}</h1>
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors",
            connectionStatus === 'connected' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", connectionStatus === 'connected' ? "bg-green-500" : "bg-orange-500 animate-pulse")} />
            {connectionStatus}
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Search className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <Users className="w-5 h-5 lg:hidden cursor-pointer hover:text-white transition-colors" />
          <Info className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth bg-[#020617]">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-slate-500 space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Activity className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">Channel history synced at edge.</p>
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
      <footer className="p-6 bg-slate-900/50 border-t border-white/5 shrink-0">
        <div className="max-w-4xl mx-auto relative group">
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -top-6 left-2 flex items-center gap-2"
              >
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} people are typing...`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <Textarea
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${room.name}`}
            className="min-h-[56px] w-full bg-slate-800 border-white/5 text-slate-200 pr-16 py-4 rounded-2xl focus-visible:ring-blue-500/50 resize-none shadow-inner"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || connectionStatus !== 'connected'}
            className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}