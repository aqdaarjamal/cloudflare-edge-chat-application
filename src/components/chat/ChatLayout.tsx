import React from 'react';
import { RoomList } from './RoomList';
import { useChatStore } from '@/lib/store';
import { cn } from '@/lib/utils';
export function ChatLayout({ children }: { children: React.ReactNode }) {
  const isSidebarOpen = useChatStore((s) => s.isSidebarOpen);
  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 md:relative md:translate-x-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <RoomList />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 relative">
        {children}
      </main>
    </div>
  );
}