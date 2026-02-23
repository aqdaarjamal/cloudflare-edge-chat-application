import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, User, Room, Message } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getRegistryStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global_registry"));
  const getRoomStub = (env: Env, roomId: string) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName(`room_${roomId}`));
  app.post('/api/auth/login', async (c) => {
    const { email } = await c.req.json();
    const stub = getRegistryStub(c.env);
    const user = await stub.handleAuth(email);
    return c.json({ success: true, data: user } satisfies ApiResponse<User>);
  });
  app.get('/api/rooms', async (c) => {
    const stub = getRegistryStub(c.env);
    const rooms = await stub.getRooms();
    return c.json({ success: true, data: rooms } satisfies ApiResponse<Room[]>);
  });
  app.post('/api/rooms', async (c) => {
    const { name, type } = await c.req.json();
    const stub = getRegistryStub(c.env);
    const room = await stub.createRoom(name, type);
    return c.json({ success: true, data: room } satisfies ApiResponse<Room>);
  });
  // WebSocket Upgrade Endpoint
  app.get('/api/chat/ws/:id', async (c) => {
    const roomId = c.req.param('id');
    const userId = c.req.query('userId');
    const userName = c.req.query('userName');
    const stub = getRoomStub(c.env, roomId);
    // Create a new request based on the original for DO upgrade
    const upgradeHeader = c.req.header('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return c.text('Expected Upgrade: websocket', 426);
    }
    return stub.fetch(new Request(c.req.raw, {
      headers: {
        ...c.req.header(),
        'X-User-Id': userId || 'unknown',
        'X-User-Name': userName || 'Anonymous'
      }
    }));
  });
  app.get('/api/rooms/:id/messages', async (c) => {
    const roomId = c.req.param('id');
    const stub = getRoomStub(c.env, roomId);
    const messages = await stub.getMessages(roomId);
    return c.json({ success: true, data: messages } satisfies ApiResponse<Message[]>);
  });
}