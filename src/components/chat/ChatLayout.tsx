import React from 'react';
import { RoomList } from './RoomList';
import { RoomDetails } from './RoomDetails';
import { useChatStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { SidebarTrigger, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
export function ChatLayout({ children }: { children: React.ReactNode }) {
  const isSidebarOpen = useChatStore((s) => s.isSidebarOpen);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-white/5 transition-transform duration-300 md:relative md:translate-x-0 shadow-2xl",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <RoomList />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 min-w-0 flex flex-col">
            {children}
          </div>
          {activeRoomId && (
            <aside className="hidden lg:block w-72 shrink-0">
              <RoomDetails />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}