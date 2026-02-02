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

  it('should create a transaction', async () => {
    const createTransactionDto = {
      quantity: 100,
      descrition: 'Test transaction',
      transaction_type: Transaction_T.income,
    };
    const expectedTransaction: Transaction = {
      id: '1',
      ...createTransactionDto,
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
    };

    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'create')
      .mockResolvedValue(expectedTransaction);

    const result = await transactionService.create(createTransactionDto);
    expect(result).toEqual(expectedTransaction);
    expect(spyDbService).toHaveBeenCalledWith({
      data: createTransactionDto,
    });
  });

  it('should find all transactions', async () => {
    const transactions = [
      {
        id: '1',
        quantity: 100,
        descrition: 'Test transaction 1',
        transaction_type: Transaction_T.income,
        createdAt: new Date(),
        updateAt: new Date(),
        cycleId: null,
        categoryId: null,
      },
      {
        id: '2',
        quantity: 200,
        descrition: 'Test transaction 2',
        transaction_type: Transaction_T.expense,
        createdAt: new Date(),
        updateAt: new Date(),
        cycleId: null,
        categoryId: null,
      },
    ];

    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'findMany')
      .mockResolvedValue(transactions);

    const result = await transactionService.findAll();
    expect(result).toEqual(transactions);
    expect(spyDbService).toHaveBeenCalledTimes(1);
  });

  it('should find one transaction by id', async () => {
    const transaction = {
      id: '1',
      quantity: 100,
      descrition: 'Test transaction',
      transaction_type: Transaction_T.income,
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
    };

    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'findUnique')
      .mockResolvedValue(transaction);

    const result = await transactionService.findOne('1');
    expect(result).toEqual(transaction);
    expect(spyDbService).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('should update a transaction', async () => {
    const updateTransactionDto = {
      quantity: 150,
      descrition: 'Updated transaction',
    };
    const updatedTransaction = {
      id: '1',
      quantity: 150,
      descrition: 'Updated transaction',
      transaction_type: Transaction_T.income,
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
    };

    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'update')
      .mockResolvedValue(updatedTransaction);

    const result = await transactionService.update('1', updateTransactionDto);
    expect(result).toEqual(updatedTransaction);
    expect(spyDbService).toHaveBeenCalledWith({
      where: { id: '1' },
      data: updateTransactionDto,
    });
  });

  it('should remove a transaction', async () => {
    const deletedTransaction = {
      id: '1',
      quantity: 100,
      descrition: 'Test transaction',
      transaction_type: Transaction_T.income,
      createdAt: new Date(),
      updateAt: new Date(),
      cycleId: null,
      categoryId: null,
    };

    const spyDbService = jest
      .spyOn(dbService.client.transaction, 'delete')
      .mockResolvedValue(deletedTransaction);

    const result = await transactionService.remove('1');
    expect(result).toEqual(deletedTransaction);
    expect(spyDbService).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });
});
