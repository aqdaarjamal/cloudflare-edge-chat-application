import React from 'react';
import { useChatStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Info, Users, Shield, Calendar, Hash } from 'lucide-react';
import { format } from 'date-fns';
export function RoomDetails() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const rooms = useChatStore((s) => s.rooms);
  const onlineUsersMap = useChatStore((s) => s.onlineUsers);
  const room = rooms.find(r => r.id === activeRoomId);
  const members = activeRoomId ? (onlineUsersMap[activeRoomId] || []) : [];
  if (!room) return null;
  return (
    <div className="flex flex-col h-full bg-slate-900/20 border-l border-white/5">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Info className="w-4 h-4" /> Room Overview
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Hash className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-white font-bold leading-none mb-1">{room.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{room.type} Channel</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Edge Encryption Enabled</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Created Today</span>
            </div>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Users className="w-4 h-4" /> Members — {members.length}
          </h3>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 group">
                <div className="relative">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-slate-800 text-[10px]">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#020617] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                    {member.name}
                  </p>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-xs text-slate-600 italic">No one else is here yet...</p>
            )}
          </div>
        </div>
      </ScrollArea>
      <div className="p-6 border-t border-white/5 bg-slate-900/40">
        <p className="text-[10px] text-slate-500 text-center font-medium uppercase tracking-widest">
          Session ID: {activeRoomId.split('_')[1] || activeRoomId}
        </p>
      </div>
    </div>
  );
}