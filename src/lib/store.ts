import { create } from 'zustand';
import { User, Message, Room } from '@shared/types';
import { api } from './api';
interface ChatState {
  currentUser: User | null;
  activeRoomId: string | null;
  rooms: Room[];
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  onlineUsers: Record<string, User[]>;
  isSidebarOpen: boolean;
  isLoading: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  socket: WebSocket | null;
  error: string | null;
  // Actions
  login: (email: string) => Promise<void>;
  logout: () => void;
  setActiveRoom: (roomId: string) => void;
  syncRooms: () => Promise<void>;
  connectRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  reportTyping: (roomId: string) => void;
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
  connectionStatus: 'disconnected',
  socket: null,
  error: null,
  login: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.login(email);
      set({ currentUser: user, isLoading: false });
      localStorage.setItem('velocity_user', JSON.stringify(user));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },
  logout: () => {
    const { socket } = get();
    if (socket) {
      socket.onclose = null; // Prevent reconnect on explicit logout
      socket.close();
    }
    set({ currentUser: null, activeRoomId: null, socket: null, connectionStatus: 'disconnected' });
    localStorage.removeItem('velocity_user');
  },
  setActiveRoom: (roomId: string) => set({ activeRoomId: roomId }),
  syncRooms: async () => {
    try {
      const rooms = await api.rooms.list();
      set({ rooms });
    } catch (err) {
      console.error('Failed to sync rooms', err);
    }
  },
  connectRoom: (roomId: string) => {
    const { socket, currentUser, connectionStatus, activeRoomId } = get();
    // Prevent redundant connections if already connecting/connected to THIS room
    if (socket && (connectionStatus === 'connecting' || connectionStatus === 'connected')) {
      return;
    }
    if (socket) {
      socket.onclose = null;
      socket.close();
    }
    if (!currentUser) return;
    set({ connectionStatus: 'connecting' });
    const wsUrl = api.getWsUrl(roomId, currentUser.id, currentUser.name);
    const newSocket = new WebSocket(wsUrl);
    newSocket.onopen = () => set({ connectionStatus: 'connected' });
    newSocket.onclose = () => {
      set({ connectionStatus: 'disconnected', socket: null });
      // Robust Reconnect logic: Only reconnect if we're still supposed to be in this room
      setTimeout(() => {
        if (get().activeRoomId === roomId && !get().socket) {
          get().connectRoom(roomId);
        }
      }, 3000);
    };
    newSocket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'message') {
        const msg = data as Message;
        set((state) => ({
          messages: {
            ...state.messages,
            [msg.roomId]: [...(state.messages[msg.roomId] || []), msg]
          }
        }));
      } else if (type === 'presence') {
        set((state) => ({
          typingUsers: { ...state.typingUsers, [roomId]: data.typing },
          onlineUsers: { ...state.onlineUsers, [roomId]: data.online }
        }));
      }
    };
    set({ socket: newSocket });
    // Load initial history
    api.messages.list(roomId).then(msgs => {
      set(state => ({ 
        messages: { ...state.messages, [roomId]: msgs } 
      }));
    }).catch(err => console.error("History sync failed", err));
  },
  sendMessage: (roomId, content) => {
    const { socket, currentUser } = get();
    if (!socket || !currentUser || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'chat', roomId, content }));
  },
  reportTyping: (roomId) => {
    const { socket } = get();
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'typing', roomId }));
  },
  createRoom: async (name, type) => {
    const room = await api.rooms.create(name, type);
    await get().syncRooms();
    return room;
  },
  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
}));