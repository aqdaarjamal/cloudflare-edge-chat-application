import { DurableObject } from "cloudflare:workers";
import type { User, Message, Room } from '@shared/types';
interface PresenceData {
  userId: string;
  userName: string;
  lastActive: number;
  isTyping: boolean;
}
export class GlobalDurableObject extends DurableObject {
  // Registry vs Room logic
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    // WebSocket Upgrade Handler
    if (url.pathname.includes("/ws")) {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      // Extract metadata from headers or query params
      const userId = request.headers.get("X-User-Id") || "unknown";
      const userName = request.headers.get("X-User-Name") || "Anonymous";
      // Accept with Hibernation API support
      this.ctx.acceptWebSocket(server, [userId, userName]);
      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response("Not Found", { status: 404 });
  }
  // WebSocket Event Handlers (Hibernation API)
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const tags = this.ctx.getTags(ws);
    const userId = tags[0] || "unknown";
    const userName = tags[1] || "Anonymous";
    try {
      const data = JSON.parse(message as string);
      const roomId = data.roomId;
      if (!roomId) return;
      if (data.type === 'chat') {
        const msg = await this.postMessage(roomId, {
          roomId: roomId,
          senderId: userId,
          senderName: userName,
          content: data.content,
          type: 'text'
        });
        this.broadcast({ type: 'message', data: msg });
      } else if (data.type === 'typing') {
        await this.updatePresence(roomId, userId, userName, true);
        const presence = await this.getPresence(roomId);
        this.broadcast({ type: 'presence', data: presence });
      }
    } catch (err) {
      console.error("WS Message Error:", err);
    }
  }
  async webSocketClose(ws: WebSocket) {
    ws.close();
  }
  broadcast(data: any) {
    const message = JSON.stringify(data);
    this.ctx.getWebSockets().forEach(ws => {
      try {
        ws.send(message);
      } catch (e) {
        console.error("Broadcast error", e);
      }
    });
  }
  // Authentication & Users (Registry Role)
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
  // Presence (Room Role)
  async updatePresence(roomId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    const key = `presence:${roomId}:${userId}`;
    const data: PresenceData = { userId, userName, lastActive: Date.now(), isTyping };
    await this.ctx.storage.put(key, data);
  }
  async getPresence(roomId: string): Promise<{ typing: string[], online: User[] }> {
    const prefix = `presence:${roomId}:`;
    const records = await this.ctx.storage.list<PresenceData>({ prefix });
    const now = Date.now();
    const typing: string[] = [];
    const onlineUserIds: string[] = [];
    for (const [key, data] of records.entries()) {
      if (now - data.lastActive > 10000) {
        await this.ctx.storage.delete(key);
        continue;
      }
      if (data.isTyping && now - data.lastActive < 4000) {
        typing.push(data.userName);
      }
      onlineUserIds.push(data.userId);
    }
    const onlineUsers: User[] = [];
    for (const uid of onlineUserIds) {
      const u = await this.ctx.storage.get<User>(`user:${uid}`);
      if (u) onlineUsers.push(u);
    }
    return { typing, online: onlineUsers };
  }
  // Room Management (Registry Role)
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
  // Messaging (Room Role)
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
      roomId,
    };
    const updated = [...messages, newMessage].slice(-100);
    await this.ctx.storage.put(key, updated);
    return newMessage;
  }
}