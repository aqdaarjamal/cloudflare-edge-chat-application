import { DurableObject } from "cloudflare:workers";
import type { User, Message, Room } from '@shared/types';
export class GlobalDurableObject extends DurableObject {
  // Authentication & Users
  async handleAuth(email: string): Promise<User> {
    const userId = `u_${btoa(email).slice(0, 8)}`;
    const user: User = {
      id: userId,
      name: email.split('@')[0],
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      status: 'online',
    };
    await this.ctx.storage.put(`user:${userId}`, user);
    return user;
  }
  // Room Management
  async getRooms(): Promise<Room[]> {
    const rooms = await this.ctx.storage.get<Room[]>("global_rooms");
    if (!rooms) {
      const defaultRooms: Room[] = [
        { id: 'general', name: 'General Lounge', type: 'public', unreadCount: 0, lastMessage: 'Welcome to Velocity!' }
      ];
      await this.ctx.storage.put("global_rooms", defaultRooms);
      return defaultRooms;
    }
    return rooms;
  }
  async createRoom(name: string, type: 'public' | 'private'): Promise<Room> {
    const rooms = await this.getRooms();
    const newRoom: Room = {
      id: `r_${Math.random().toString(36).substring(2, 9)}`,
      name,
      type,
      unreadCount: 0,
    };
    const updated = [...rooms, newRoom];
    await this.ctx.storage.put("global_rooms", updated);
    return newRoom;
  }
  // Messaging
  async getMessages(roomId: string): Promise<Message[]> {
    const key = `msgs:${roomId}`;
    return (await this.ctx.storage.get<Message[]>(key)) || [];
  }
  async postMessage(roomId: string, message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const key = `msgs:${roomId}`;
    const messages = await this.getMessages(roomId);
    const newMessage: Message = {
      ...message,
      id: `m_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...messages, newMessage].slice(-100); // Keep last 100 messages
    await this.ctx.storage.put(key, updated);
    // Update last message in room list
    const rooms = await this.getRooms();
    const updatedRooms = rooms.map(r => 
      r.id === roomId ? { ...r, lastMessage: newMessage.content } : r
    );
    await this.ctx.storage.put("global_rooms", updatedRooms);
    return newMessage;
  }
}