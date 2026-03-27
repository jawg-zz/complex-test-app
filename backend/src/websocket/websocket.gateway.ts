import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.DOMAIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('task:subscribe')
  handleTaskSubscribe(client: Socket, userId: string) {
    client.join(`user:${userId}`);
    return { event: 'subscribed', data: userId };
  }

  emitTaskCreated(task: any) {
    this.server.to(`user:${task.userId}`).emit('task:created', task);
  }

  emitTaskUpdated(task: any) {
    this.server.to(`user:${task.userId}`).emit('task:updated', task);
  }

  emitTaskDeleted(taskId: string) {
    this.server.emit('task:deleted', taskId);
  }
}
