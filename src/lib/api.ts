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
    reportTyping: (roomId: string, userId: string, userName: string) => 
      request<null>(`/api/rooms/${roomId}/presence`, {
        method: 'POST',
        body: JSON.stringify({ userId, userName, isTyping: true }),
      }),
    getPresence: (roomId: string) => 
      request<{ typing: string[], online: User[] }>(`/api/rooms/${roomId}/presence`),
  },
  messages: {
    list: (roomId: string) => request<Message[]>(`/api/rooms/${roomId}/messages`),
    send: (roomId: string, message: { senderId: string, senderName: string, content: string, type: string }) =>
      request<Message>(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        body: JSON.stringify(message),
      }),
  },
};