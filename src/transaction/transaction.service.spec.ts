import { Test } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { DatabaseService } from '../database/database.service';
import { Transaction_T } from '../lib/ormClient/enums';
import { createMockContext } from '../../test/prisma.mock';
import type { Transaction } from '../lib/ormClient/client';

describe('TransactionService - UT', () => {
  let transactionService: TransactionService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: DatabaseService,
          useValue: {
            client: createMockContext().prisma,
          },
        },
      ],
    }).compile();

    dbService = module.get<DatabaseService>(DatabaseService);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  describe('belongsToUser', () => {
    it('should return false if userId or transactionId is missing', async () => {
      const result = await transactionService.belongsToUser(
        '',
        'transactionId',
      );
      expect(result).toBe(false);

      const result2 = await transactionService.belongsToUser('userId', '');
      expect(result2).toBe(false);
    });

    it('should return transaction if it belongs to user', async () => {
      const mockTransaction = { id: 'transactionId', userId: 'userId' };
      jest
        .spyOn(dbService.client.transaction, 'findFirst')
        .mockResolvedValue(mockTransaction);

      const result = await transactionService.belongsToUser(
        'userId',
        'transactionId',
      );
      expect(result).toBe(mockTransaction);
      expect(dbService.client.transaction.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'transactionId',
        },
      });
    });

    it('should return null if transaction does not belong to user', async () => {
      const mockTransaction = { id: 'transactionId', userId: 'otherUserId' };
      jest
        .spyOn(dbService.client.transaction, 'findFirst')
        .mockResolvedValue(mockTransaction);

      const result = await transactionService.belongsToUser(
        'userId',
        'transactionId',
      );
      expect(result).toBe(null);
    });

    it('should return null if transaction not found', async () => {
      jest
        .spyOn(dbService.client.transaction, 'findFirst')
        .mockResolvedValue(null);

      const result = await transactionService.belongsToUser(
        'userId',
        'transactionId',
      );
      expect(result).toBe(null);
    });
  });

  it('should create a transaction', async () => {
    const createTransactionDto = {
      quantity: 100,
      descrition: 'Test transaction',
      transaction_type: Transaction_T.income,
    };
    const expectedTransaction: Transaction = {
      id: '1',
      ...createTransactionDto,
      userId: 'userId',
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
      cycle: null,
      category: null,
      periodics: [],
      user: {} as any, // mock
    };

    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'create')
      .mockResolvedValue(expectedTransaction);

    const result = await transactionService.create(
      createTransactionDto,
      'userId',
    );
    expect(result).toEqual(expectedTransaction);
    expect(spyDbService).toHaveBeenCalledWith({
      data: {
        ...createTransactionDto,
        userId: 'userId',
      },
    });
  });

  it('should find all transactions', async () => {
    const transactions = [
      {
        id: '1',
        quantity: 100,
        descrition: 'Test transaction 1',
        transaction_type: Transaction_T.income,
        userId: 'userId',
        createdAt: new Date(),
        updateAt: new Date(),
        cycleId: null,
        categoryId: null,
        cycle: null,
        category: null,
        periodics: [],
        user: {} as any,
      },
      {
        id: '2',
        quantity: 200,
        descrition: 'Test transaction 2',
        transaction_type: Transaction_T.expense,
        userId: 'userId',
        createdAt: new Date(),
        updateAt: new Date(),
        cycleId: null,
        categoryId: null,
        cycle: null,
        category: null,
        periodics: [],
        user: {} as any,
      },
    ];

    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'findMany')
      .mockResolvedValue(transactions);

    const result = await transactionService.findAll('userId');
    expect(result).toEqual(transactions);
    expect(spyDbService).toHaveBeenCalledWith({
      where: {
        userId: 'userId',
      },
    });
  });

  it('should find one transaction by id', async () => {
    const transaction = {
      id: '1',
      quantity: 100,
      descrition: 'Test transaction',
      transaction_type: Transaction_T.income,
      userId: 'userId',
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
      cycle: null,
      category: null,
      periodics: [],
      user: {} as any,
    };

    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(transaction);

    const result = await transactionService.findOne('1', 'userId');
    expect(result).toEqual(transaction);
    expect(spyDbService).toHaveBeenCalledWith({
      where: {
        id: '1',
      },
    });
  });

  it('should throw error if findOne unauthorized', async () => {
    jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(null);

    await expect(transactionService.findOne('1', 'userId')).rejects.toThrow(
      'Unauthorized',
    );
  });

  it('should update a transaction', async () => {
    const updateTransactionDto = {
      quantity: 150,
      descrition: 'Updated transaction',
    };
    const existingTransaction = {
      id: '1',
      userId: 'userId',
      quantity: 100,
      descrition: 'Test transaction',
      transaction_type: Transaction_T.income,
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
      cycle: null,
      category: null,
      periodics: [],
      user: {} as any,
    };
    const updatedTransaction = {
      id: '1',
      quantity: 150,
      descrition: 'Updated transaction',
      transaction_type: Transaction_T.income,
      userId: 'userId',
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
      cycle: null,
      category: null,
      periodics: [],
      user: {} as any,
    };

    jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(existingTransaction);
    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'update')
      .mockResolvedValue(updatedTransaction);

    const result = await transactionService.update(
      '1',
      updateTransactionDto,
      'userId',
    );
    expect(result).toEqual(updatedTransaction);
    expect(spyDbService).toHaveBeenCalledWith({
      where: { id: '1' },
      data: updateTransactionDto,
    });
  });

  it('should throw error if update unauthorized', async () => {
    jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(null);

    await expect(
      transactionService.update('1', { quantity: 200 }, 'userId'),
    ).rejects.toThrow('Unauthorized');
  });

  it('should remove a transaction', async () => {
    const existingTransaction = {
      id: '1',
      userId: 'userId',
      quantity: 100,
      descrition: 'Test transaction',
      transaction_type: Transaction_T.income,
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
      cycle: null,
      category: null,
      periodics: [],
      user: {} as any,
    };
    const deletedTransaction = {
      id: '1',
      quantity: 100,
      descrition: 'Test transaction',
      transaction_type: Transaction_T.income,
      userId: 'userId',
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
      cycle: null,
      category: null,
      periodics: [],
      user: {} as any,
    };

    jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(existingTransaction);
    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'delete')
      .mockResolvedValue(deletedTransaction);

    const result = await transactionService.remove('1', 'userId');
    expect(result).toEqual(deletedTransaction);
    expect(spyDbService).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('should throw error if remove unauthorized', async () => {
    jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(null);

    await expect(transactionService.remove('1', 'userId')).rejects.toThrow(
      'Unauthorized',
    );
  });
});
