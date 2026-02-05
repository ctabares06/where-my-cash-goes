import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '../lib/ormClient/client';

@Injectable()
export class TransactionService {
  constructor(private db: DatabaseService) {}

  async create(
    data: CreateTransactionDto | CreateTransactionDto[],
    userId: string,
  ) {
    try {
      if (Array.isArray(data)) {
        const createdTransactions = await this.db.client.transaction.createMany(
          {
            data: data.map((transaction) => ({
              ...transaction,
              userId,
            })),
          },
        );

        return await this.db.client.transaction.findMany({
          orderBy: { createdAt: 'desc' },
          where: {
            userId,
          },
          take: createdTransactions.count,
        });
      }

      return this.db.client.transaction.create({
        data: {
          ...data,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Transaction creation failed');
    }
  }

  async findAll(userId: string) {
    return this.db.client.transaction.findMany({
      where: {
        userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.db.client.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: string, data: UpdateTransactionDto, userId: string) {
    try {
      return await this.db.client.transaction.update({
        where: {
          id,
          userId,
        },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Transaction not found');
        }

        if (error.code === 'P2001') {
          throw new NotFoundException('Transaction not found 2');
        }

        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async remove(id: string, userId: string) {
    const transaction = await this.db.client.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Unauthorized');
    }

    return this.db.client.transaction.delete({ where: { id } });
  }
}
