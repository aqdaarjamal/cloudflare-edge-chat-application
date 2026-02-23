import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { Plus, Hash, Lock, LogOut, Zap } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { RoomCreationModal } from './RoomCreationModal';
const RoomItem = memo(({ roomId }: { roomId: string }) => {
  const room = useChatStore(useShallow(s => s.rooms.find(r => r.id === roomId)));
  const activeRoomId = useChatStore(s => s.activeRoomId);
  const setActiveRoom = useChatStore(s => s.setActiveRoom);
  const connectionStatus = useChatStore(s => s.connectionStatus);
  if (!room) return null;
  const isActive = activeRoomId === roomId;
  return (
    <button
      onClick={() => setActiveRoom(room.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
        isActive
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute left-0 w-1 h-4 bg-white rounded-r-full"
        />
      )}
      <div className="relative">
        {room.type === 'public' ? (
          <Hash className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-200" : "text-slate-500")} />
        ) : (
          <Lock className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-200" : "text-slate-500")} />
        )}
        {isActive && connectionStatus === 'connected' && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-blue-600 animate-pulse" />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-bold truncate leading-tight text-sm">{room.name}</p>
        {room.lastMessage && (
           <p className={cn("text-[10px] truncate opacity-60 font-medium", isActive ? "text-blue-100" : "text-slate-500")}>
             {room.lastMessage}
           </p>
        )}
      </div>
    </button>
  );
});
RoomItem.displayName = 'RoomItem';
export function RoomList() {
  const roomIds = useChatStore(useShallow(s => s.rooms.map(r => r.id)));
  const currentUser = useChatStore(s => s.currentUser);
  const logout = useChatStore(s => s.logout);
  const syncRooms = useChatStore(s => s.syncRooms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    syncRooms();
    const interval = setInterval(syncRooms, 15000);
    return () => clearInterval(interval);
  }, [syncRooms]);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <div className="flex flex-col h-full p-4 bg-slate-900/50">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tighter text-white">Velocity</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Channels</p>
          {roomIds.map((id) => (
            <RoomItem key={id} roomId={id} />
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto pt-4 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 shadow-xl group">
          <div className="relative">
            <Avatar className="w-10 h-10 border border-white/10 shrink-0">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="bg-slate-800 text-white font-bold">{currentUser?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0f172a] rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authenticated</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 shrink-0 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <RoomCreationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}