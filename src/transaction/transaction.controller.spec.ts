import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { Transaction_T } from '../lib/ormClient/enums';
import { TransactionController } from './transaction.controller';
import { CreateTransactionDto } from './transaction.dto';
import { Transaction } from 'src/lib/ormClient/client';

describe('Transactions controller - UT', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  const mockSession = {
    user: {
      id: 'userId',
    },
  };

  const mockTransactionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    transactionService = moduleFixture.get(TransactionService);
    transactionController = moduleFixture.get(TransactionController);
  });

  it('should create a transaction', async () => {
    const createTransactionDto: CreateTransactionDto = {
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

    const spyCreate = jest
      .spyOn(transactionService, 'create')
      .mockResolvedValue(expectedTransaction);

    const transaction = await transactionController.create(
      createTransactionDto,
      mockSession as any,
    );
    expect(transaction).toEqual(expectedTransaction);
    expect(spyCreate).toHaveBeenCalledWith(createTransactionDto, 'userId');
  });

  it('/transactions (GET) - should return all transactions', async () => {
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

    const spyFindAll = jest
      .spyOn(transactionService, 'findAll')
      .mockResolvedValue(transactions);

    const result = await transactionController.findAll(mockSession as any);
    expect(result).toEqual(transactions);
    expect(spyFindAll).toHaveBeenCalledWith('userId');
  });

  it('/transactions/:id (GET) - should return a transaction by id', async () => {
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

    const spyFindOne = jest
      .spyOn(transactionService, 'findOne')
      .mockResolvedValue(transaction);

    const result = await transactionController.findOne('1', mockSession as any);
    expect(result).toEqual(transaction);
    expect(spyFindOne).toHaveBeenCalledWith('1', 'userId');
  });

  it('/transactions/:id (PATCH) - should update a transaction', async () => {
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

    const spyUpdate = jest
      .spyOn(transactionService, 'update')
      .mockResolvedValue(updatedTransaction);

    const result = await transactionController.update(
      '1',
      updateTransactionDto,
      mockSession as any,
    );
    expect(result).toEqual(updatedTransaction);
    expect(spyUpdate).toHaveBeenCalledWith('1', updateTransactionDto, 'userId');
  });

  it('/transactions/:id (DELETE) - should delete a transaction', async () => {
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

    const spyRemove = jest
      .spyOn(transactionService, 'remove')
      .mockResolvedValue(deletedTransaction);

    const result = await transactionController.remove('1', mockSession as any);
    expect(result).toEqual(deletedTransaction);
    expect(spyRemove).toHaveBeenCalledWith('1', 'userId');
  });
});
