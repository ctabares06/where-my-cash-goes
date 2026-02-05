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
      const mockTransaction: Transaction = {
        id: 'transactionId',
        userId: 'userId',
        quantity: 100,
        description: 'Test transaction',
        transaction_type: Transaction_T.income,
        createdAt: new Date(),
        updateAt: new Date(),
        categoryId: null,
      };
      const spy = jest
        .spyOn(dbService.client.transaction, 'findFirst')
        .mockResolvedValue(mockTransaction);

      const result = await transactionService.belongsToUser(
        'userId',
        'transactionId',
      );
      expect(result).toBe(mockTransaction);
      expect(spy).toHaveBeenCalledWith({
        where: {
          id: 'transactionId',
        },
      });
    });

    it('should return null if transaction does not belong to user', async () => {
      const mockTransaction: Transaction = {
        id: 'transactionId',
        userId: 'otherUserId',
        quantity: 100,
        description: 'Test transaction',
        transaction_type: Transaction_T.income,
        createdAt: new Date(),
        updateAt: new Date(),
        categoryId: null,
      };
      const spy = jest
        .spyOn(dbService.client.transaction, 'findFirst')
        .mockResolvedValue(mockTransaction);

      const result = await transactionService.belongsToUser(
        'userId',
        'transactionId',
      );
      expect(result).toBe(null);
      expect(spy).toHaveBeenCalledWith({
        where: {
          id: 'transactionId',
        },
      });
    });

    it('should return null if transaction not found', async () => {
      const spy = jest
        .spyOn(dbService.client.transaction, 'findFirst')
        .mockResolvedValue(null);

      const result = await transactionService.belongsToUser(
        'userId',
        'transactionId',
      );
      expect(result).toBe(null);
      expect(spy).toHaveBeenCalledWith({
        where: {
          id: 'transactionId',
        },
      });
    });
  });

  it('should create a transaction', async () => {
    const createTransactionDto = {
      quantity: 100,
      description: 'Test transaction',
      transaction_type: Transaction_T.income,
    };
    const expectedTransaction: Transaction = {
      id: '1',
      ...createTransactionDto,
      userId: 'userId',
      createdAt: new Date(),
      updateAt: new Date(),
      categoryId: null,
    };

    const spy = jest
      .spyOn(dbService.client.transaction, 'create')
      .mockResolvedValue(expectedTransaction);

    const result = await transactionService.create(
      createTransactionDto,
      'userId',
    );
    expect(result).toEqual(expectedTransaction);
    expect(spy).toHaveBeenCalledWith({
      data: {
        ...createTransactionDto,
        userId: 'userId',
      },
    });
  });

  it('should find all transactions', async () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        quantity: 100,
        description: 'Test transaction 1',
        transaction_type: Transaction_T.income,
        userId: 'userId',
        createdAt: new Date(),
        updateAt: new Date(),
        categoryId: null,
      },
      {
        id: '2',
        quantity: 200,
        description: 'Test transaction 2',
        transaction_type: Transaction_T.expense,
        userId: 'userId',
        createdAt: new Date(),
        updateAt: new Date(),
        categoryId: null,
      },
    ];

    const spy = jest
      .spyOn(dbService.client.transaction, 'findMany')
      .mockResolvedValue(transactions);

    const result = await transactionService.findAll('userId');
    expect(result).toEqual(transactions);
    expect(spy).toHaveBeenCalledWith({
      where: {
        userId: 'userId',
      },
    });
  });

  it('should find one transaction by id', async () => {
    const transaction: Transaction = {
      id: '1',
      quantity: 100,
      description: 'Test transaction',
      transaction_type: Transaction_T.income,
      userId: 'userId',
      createdAt: new Date(),
      updateAt: new Date(),
      categoryId: null,
    };

    const spy = jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(transaction);

    const result = await transactionService.findOne('1', 'userId');
    expect(result).toEqual(transaction);
    expect(spy).toHaveBeenCalledWith({
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
    const existingTransaction: Transaction = {
      id: '1',
      userId: 'userId',
      quantity: 100,
      description: 'Test transaction',
      transaction_type: Transaction_T.income,
      createdAt: new Date(),
      updateAt: new Date(),
      categoryId: null,
    };
    const updatedTransaction: Transaction = {
      id: '1',
      quantity: 150,
      description: 'Updated transaction',
      transaction_type: Transaction_T.income,
      userId: 'userId',
      createdAt: new Date(),
      updateAt: new Date(),
      categoryId: null,
    };

    jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(existingTransaction);
    const spy = jest
      .spyOn(dbService.client.transaction, 'update')
      .mockResolvedValue(updatedTransaction);

    const result = await transactionService.update(
      '1',
      updateTransactionDto,
      'userId',
    );
    expect(result).toEqual(updatedTransaction);
    expect(spy).toHaveBeenCalledWith({
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
    const existingTransaction: Transaction = {
      id: '1',
      userId: 'userId',
      quantity: 100,
      description: 'Test transaction',
      transaction_type: Transaction_T.income,
      createdAt: new Date(),
      updateAt: new Date(),
      categoryId: null,
    };
    const deletedTransaction: Transaction = {
      id: '1',
      quantity: 100,
      description: 'Test transaction',
      transaction_type: Transaction_T.income,
      userId: 'userId',
      createdAt: new Date(),
      updateAt: new Date(),
      categoryId: null,
    };

    jest
      .spyOn(dbService.client.transaction, 'findFirst')
      .mockResolvedValue(existingTransaction);
    const spy = jest
      .spyOn(dbService.client.transaction, 'delete')
      .mockResolvedValue(deletedTransaction);

    const result = await transactionService.remove('1', 'userId');
    expect(result).toEqual(deletedTransaction);
    expect(spy).toHaveBeenCalledWith({
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
