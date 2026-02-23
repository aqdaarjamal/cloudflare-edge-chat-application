import { create } from 'zustand';
import { User, Message, Room } from '@shared/types';
import { api } from './api';
interface ChatState {
  currentUser: User | null;
  activeRoomId: string | null;
  rooms: Room[];
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>; // roomId -> userNames
  onlineUsers: Record<string, User[]>; // roomId -> Users
  isSidebarOpen: boolean;
  isLoading: boolean;
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  error: string | null;
  // Actions
  login: (email: string) => Promise<void>;
  logout: () => void;
  setActiveRoom: (roomId: string) => void;
  syncRooms: () => Promise<void>;
  syncMessages: (roomId: string) => Promise<void>;
  syncPresence: (roomId: string) => Promise<void>;
  reportTyping: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  createRoom: (name: string, type: 'public' | 'private') => Promise<Room>;
  setSidebarOpen: (open: boolean) => void;
}
export const useChatStore = create<ChatState>((set, get) => ({
  currentUser: JSON.parse(localStorage.getItem('velocity_user') || 'null'),
  activeRoomId: null,
  rooms: [],
  messages: {},
  typingUsers: {},
  onlineUsers: {},
  isSidebarOpen: true,
  isLoading: false,
  connectionStatus: 'connected',
  error: null,
  login: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.login(email);
      set({ currentUser: user, isLoading: false, connectionStatus: 'connected' });
      localStorage.setItem('velocity_user', JSON.stringify(user));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false, connectionStatus: 'disconnected' });
      throw err;
    }
  },
  logout: () => {
    set({ currentUser: null, activeRoomId: null });
    localStorage.removeItem('velocity_user');
  },
  setActiveRoom: (roomId: string) => set({ activeRoomId: roomId }),
  syncRooms: async () => {
    try {
      const rooms = await api.rooms.list();
      set({ rooms, connectionStatus: 'connected' });
    } catch (err) {
      set({ connectionStatus: 'reconnecting' });
    }
  },
  syncMessages: async (roomId: string) => {
    try {
      const msgs = await api.messages.list(roomId);
      set((state) => ({
        messages: { ...state.messages, [roomId]: msgs }
      }));
    } catch (err) {
      console.error('Failed to sync messages', err);
    }
  },
  syncPresence: async (roomId: string) => {
    try {
      const { typing, online } = await api.rooms.getPresence(roomId);
      set((state) => ({
        typingUsers: { ...state.typingUsers, [roomId]: typing },
        onlineUsers: { ...state.onlineUsers, [roomId]: online }
      }));
    } catch (err) {
      console.error('Failed to sync presence', err);
    }
  },
  reportTyping: async (roomId: string) => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      await api.rooms.reportTyping(roomId, currentUser.id, currentUser.name);
    } catch (err) {
      console.error('Failed to report typing', err);
    }
  },
  sendMessage: async (roomId, content) => {
    const { currentUser, messages } = get();
    if (!currentUser) return;
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      createdAt: new Date().toISOString(),
      type: 'text',
    };
    const prevMsgs = messages[roomId] || [];
    set((state) => ({
      messages: { ...state.messages, [roomId]: [...prevMsgs, optimisticMsg] }
    }));
    try {
      await api.messages.send(roomId, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
        type: 'text'
      });
    } catch (err) {
      set((state) => ({
        messages: { ...state.messages, [roomId]: prevMsgs }
      }));
      throw err;
    }
  },
  createRoom: async (name, type) => {
    const room = await api.rooms.create(name, type);
    await get().syncRooms();
    return room;
  },
  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
}));