import { ApiResponse, User, Room, Message } from '@shared/types';
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  const result: ApiResponse<T> = await response.json();
  if (!result.success || result.data === undefined) {
    throw new Error(result.error || 'Request failed');
  }
  return result.data;
}
export const api = {
  getWsUrl: (roomId: string, userId: string, userName: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/chat/ws/${roomId}?userId=${encodeURIComponent(userId)}&userName=${encodeURIComponent(userName)}`;
  },
  auth: {
    login: (email: string) => request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  },
  rooms: {
    list: () => request<Room[]>('/api/rooms'),
    create: (name: string, type: 'public' | 'private') => request<Room>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, type }),
    }),
  },
  messages: {
    list: (roomId: string) => request<Message[]>(`/api/rooms/${roomId}/messages`),
  },
};