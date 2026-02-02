import { Injectable } from '@nestjs/common';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransactionService {
  constructor(private db: DatabaseService) {}

  async create(data: CreateTransactionDto) {
    return this.db.client.transaction.create({ data });
  }

  async findAll() {
    return this.db.client.transaction.findMany();
  }

  async findOne(id: string) {
    return this.db.client.transaction.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateTransactionDto) {
    return this.db.client.transaction.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.db.client.transaction.delete({ where: { id } });
  }
}
