import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCycleDto } from './cycles.dto';
import { PrismaClientValidationError } from '@prisma/client/runtime/client';

@Injectable()
export class CyclesService {
  constructor(private db: DatabaseService) {}

  async belongsToUser(userId: string, cycleId: string) {
    if (!userId || !cycleId) {
      return false;
    }

    const cycle = await this.db.client.cycle.findFirst({
      where: {
        id: cycleId,
      },
    });

    if (cycle?.userId === userId) {
      return cycle;
    }

    return null;
  }

  async createCycle(body: CreateCycleDto, userId: string) {
    try {
      const cycle = await this.db.client.cycle.create({
        data: {
          label: body.label,
          duration: body.duration,
          isActive: body.isActive ?? false,
          userId: userId,
        },
      });
      return cycle;
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw error;
      }

      throw new Error('Cycle creation failed');
    }
  }

  async getCyclesByUser(userId: string) {
    const cycles = await this.db.client.cycle.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true,
      },
    });
    return cycles;
  }

  async getCycleById(cycleId: string, userId: string) {
    const cycle = await this.belongsToUser(userId, cycleId);

    if (!cycle) {
      throw new Error('Unauthorized');
    }

    return await this.db.client.cycle.findUnique({
      where: {
        id: cycleId,
      },
      include: {
        items: true,
      },
    });
  }

  async updateCycle(
    cycleId: string,
    userId: string,
    body: Partial<CreateCycleDto>,
  ) {
    const oldCycle = await this.belongsToUser(userId, cycleId);

    if (!oldCycle) {
      throw new Error('Unauthorized');
    }

    const cycle = await this.db.client.cycle.update({
      where: {
        id: cycleId,
      },
      data: body,
    });
    return cycle;
  }

  async deleteCycle(cycleId: string, userId: string) {
    const cycle = await this.belongsToUser(userId, cycleId);

    if (!cycle) {
      throw new Error('Unauthorized');
    }

    return await this.db.client.cycle.delete({
      where: {
        id: cycleId,
      },
    });
  }
}
