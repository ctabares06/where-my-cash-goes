import { Injectable } from '@nestjs/common';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransactionService {
  constructor(private db: DatabaseService) {}

  async belongsToUser(userId: string, transactionId: string) {
    if (!userId || !transactionId) {
      return false;
    }

    const transaction = await this.db.client.transaction.findFirst({
      where: {
        id: transactionId,
      },
    });

    if (transaction?.userId === userId) {
      return transaction;
    }

    return null;
  }

  async create(data: CreateTransactionDto, userId: string) {
    return this.db.client.transaction.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.db.client.transaction.findMany({
      where: {
        userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.belongsToUser(userId, id);

    if (!transaction) {
      throw new Error('Unauthorized');
    }

    return transaction;
  }

  async update(id: string, data: UpdateTransactionDto, userId: string) {
    const oldTransaction = await this.belongsToUser(userId, id);

    if (!oldTransaction) {
      throw new Error('Unauthorized');
    }

    return this.db.client.transaction.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    const transaction = await this.belongsToUser(userId, id);

    if (!transaction) {
      throw new Error('Unauthorized');
    }

    return this.db.client.transaction.delete({ where: { id } });
  }
}
