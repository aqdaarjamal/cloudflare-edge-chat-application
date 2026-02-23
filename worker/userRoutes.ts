import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, User, Room, Message } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (env: Env) => env.GlobalDurableObject.get(env.GlobalDurableObject.idFromName("global_state"));
  app.post('/api/auth/login', async (c) => {
    const { email } = await c.req.json();
    const stub = getStub(c.env);
    const user = await stub.handleAuth(email);
    return c.json({ success: true, data: user } satisfies ApiResponse<User>);
  });
  app.get('/api/rooms', async (c) => {
    const stub = getStub(c.env);
    const rooms = await stub.getRooms();
    return c.json({ success: true, data: rooms } satisfies ApiResponse<Room[]>);
  });
  app.post('/api/rooms', async (c) => {
    const { name, type } = await c.req.json();
    const stub = getStub(c.env);
    const room = await stub.createRoom(name, type);
    return c.json({ success: true, data: room } satisfies ApiResponse<Room>);
  });
  app.get('/api/rooms/:id/messages', async (c) => {
    const roomId = c.req.param('id');
    const stub = getStub(c.env);
    const messages = await stub.getMessages(roomId);
    return c.json({ success: true, data: messages } satisfies ApiResponse<Message[]>);
  });
  app.post('/api/rooms/:id/messages', async (c) => {
    const roomId = c.req.param('id');
    const body = await c.req.json();
    const stub = getStub(c.env);
    const message = await stub.postMessage(roomId, body);
    return c.json({ success: true, data: message } satisfies ApiResponse<Message>);
  });
  app.post('/api/rooms/:id/presence', async (c) => {
    const roomId = c.req.param('id');
    const { userId, userName, isTyping } = await c.req.json();
    const stub = getStub(c.env);
    await stub.updatePresence(roomId, userId, userName, isTyping);
    return c.json({ success: true, data: null } satisfies ApiResponse<null>);
  });
  app.get('/api/rooms/:id/presence', async (c) => {
    const roomId = c.req.param('id');
    const stub = getStub(c.env);
    const data = await stub.getPresence(roomId);
    return c.json({ success: true, data } satisfies ApiResponse<any>);
  });
}