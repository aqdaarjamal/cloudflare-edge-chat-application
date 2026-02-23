import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/lib/store';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ChatArea } from '@/components/chat/ChatArea';
export function ChatPage() {
  const currentUser = useChatStore((s) => s.currentUser);
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);
  if (!currentUser) return null;
  return (
    <ChatLayout>
      <ChatArea />
    </ChatLayout>
  );
}