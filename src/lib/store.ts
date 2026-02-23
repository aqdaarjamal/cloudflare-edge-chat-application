import { create } from 'zustand';
import { User, Message, Room } from '@shared/types';
interface ChatState {
  currentUser: User | null;
  activeRoomId: string | null;
  rooms: Room[];
  messages: Record<string, Message[]>;
  isSidebarOpen: boolean;
  // Actions
  login: (email: string) => void;
  logout: () => void;
  setActiveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  addIncomingMessage: (message: Message) => void;
  setSidebarOpen: (open: boolean) => void;
}
const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Edge',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  status: 'online',
};
const MOCK_ROOMS: Room[] = [
  { id: 'r1', name: 'General Lounge', type: 'public', unreadCount: 0, lastMessage: 'Welcome to the edge!' },
  { id: 'r2', name: 'Dev Ops', type: 'public', unreadCount: 3, lastMessage: 'New deployment successful' },
  { id: 'r3', name: 'Design System', type: 'private', unreadCount: 0, lastMessage: 'Check the new nebula theme' },
];
const MOCK_MESSAGES: Record<string, Message[]> = {
  'r1': [
    { id: 'm1', roomId: 'r1', senderId: 'u2', senderName: 'Sarah', content: 'Hey everyone! How is the latency today?', createdAt: new Date(Date.now() - 3600000).toISOString(), type: 'text' },
    { id: 'm2', roomId: 'r1', senderId: 'u1', senderName: 'Alex Edge', content: 'Sub-millisecond as usual. Cloudflare is flying.', createdAt: new Date(Date.now() - 1800000).toISOString(), type: 'text' },
  ],
};
export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  activeRoomId: 'r1',
  rooms: MOCK_ROOMS,
  messages: MOCK_MESSAGES,
  isSidebarOpen: true,
  login: (email: string) => set({ 
    currentUser: { ...MOCK_USER, email } 
  }),
  logout: () => set({ currentUser: null }),
  setActiveRoom: (roomId: string) => set({ activeRoomId: roomId }),
  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
  sendMessage: (roomId, content) => set((state) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      roomId,
      senderId: state.currentUser?.id || 'anon',
      senderName: state.currentUser?.name || 'Anonymous',
      content,
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    const roomMessages = state.messages[roomId] || [];
    return {
      messages: {
        ...state.messages,
        [roomId]: [...roomMessages, newMessage],
      }
    };
  }),
  addIncomingMessage: (message) => set((state) => {
    const roomMessages = state.messages[message.roomId] || [];
    return {
      messages: {
        ...state.messages,
        [message.roomId]: [...roomMessages, message],
      }
    };
  }),
}));