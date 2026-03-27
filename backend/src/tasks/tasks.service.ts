import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
    });
    const saved = await this.taskRepository.save(task);
    this.websocketGateway.emitTaskCreated(saved);
    return saved;
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    Object.assign(task, updateTaskDto);
    const updated = await this.taskRepository.save(task);
    this.websocketGateway.emitTaskUpdated(updated);
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
    this.websocketGateway.emitTaskDeleted(id);
  }
}
