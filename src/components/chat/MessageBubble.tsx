import React from 'react';
import { Message } from '@shared/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}
export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full mb-4", isMe ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] flex flex-col", isMe ? "items-end" : "items-start")}>
        {!isMe && (
          <span className="text-[10px] font-bold text-slate-500 mb-1 ml-3 uppercase tracking-wider">
            {message.senderName}
          </span>
        )}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
            isMe 
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none" 
              : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5"
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-slate-600 mt-1 px-1">
          {format(new Date(message.createdAt), 'HH:mm')}
        </span>
      </div>
    </div>
  );
}