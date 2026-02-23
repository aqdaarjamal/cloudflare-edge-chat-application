import React, { useState, useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Hash, Lock, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { RoomCreationModal } from './RoomCreationModal';
export function RoomList() {
  const rooms = useChatStore((s) => s.rooms);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const currentUser = useChatStore((s) => s.currentUser);
  const logout = useChatStore((s) => s.logout);
  const syncRooms = useChatStore((s) => s.syncRooms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    syncRooms();
    const interval = setInterval(syncRooms, 10000); // Background room refresh
    return () => clearInterval(interval);
  }, [syncRooms]);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-500 rounded-full" />
          Velocity
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-white hover:bg-white/5"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-1">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                activeRoomId === room.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              {room.type === 'public' ? (
                <Hash className={cn("w-4 h-4", activeRoomId === room.id ? "text-blue-200" : "text-slate-500")} />
              ) : (
                <Lock className={cn("w-4 h-4", activeRoomId === room.id ? "text-blue-200" : "text-slate-500")} />
              )}
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold truncate leading-tight">{room.name}</p>
                {room.lastMessage && (
                   <p className={cn("text-[10px] truncate", activeRoomId === room.id ? "text-blue-200" : "text-slate-500")}>
                     {room.lastMessage}
                   </p>
                )}
              </div>
              {room.unreadCount > 0 && activeRoomId !== room.id && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {room.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl border border-white/5">
          <Avatar className="w-10 h-10 border border-white/10 ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback className="bg-slate-800 text-white font-bold">{currentUser?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-red-400 hover:bg-red-400/10"
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