import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { DatabaseService } from '../database/database.service';
import { createMockContext } from '../../test/prisma.mock';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './categories.dto';
import type { Category } from '../lib/ormClient/client';
import { Transaction_T } from '../lib/ormClient/enums';
import { Prisma } from '../lib/ormClient/client';

describe('CategoriesService - UT', () => {
  let service: CategoriesService;
  let dbService: DatabaseService;

  const mockCategory: Category = {
    id: 'categoryId',
    name: 'Groceries',
    unicode: '🛒',
    transactionType: Transaction_T.expense,
    userId: 'userId',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockContext = createMockContext();

    const mockDbService = {
      client: mockContext.prisma,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    dbService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a single category successfully', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Groceries',
        unicode: '🛒',
        transactionType: Transaction_T.expense,
      };

      const spy = jest
        .spyOn(dbService.client.category, 'create')
        .mockResolvedValue(mockCategory);

      const result = await service.createCategory(createCategoryDto, 'userId');

      expect(result).toEqual(mockCategory);
      expect(spy).toHaveBeenCalledWith({
        data: {
          name: 'Groceries',
          unicode: '🛒',
          transactionType: Transaction_T.expense,
          userId: 'userId',
        },
      });
    });

    it('should create multiple categories in batch', async () => {
      const createCategoriesDto: CreateCategoryDto[] = [
        {
          name: 'Groceries',
          unicode: '🛒',
          transactionType: Transaction_T.expense,
        },
        {
          name: 'Utilities',
          unicode: '💡',
          transactionType: Transaction_T.expense,
        },
        {
          name: 'Salary',
          unicode: '💰',
          transactionType: Transaction_T.income,
        },
      ];

      const mockBatchResult = { count: 3 };

      const createdItems: Category[] = [
        {
          id: 'c1',
          name: 'Groceries',
          unicode: '🛒',
          transactionType: Transaction_T.expense,
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'c2',
          name: 'Utilities',
          unicode: '💡',
          transactionType: Transaction_T.expense,
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'c3',
          name: 'Salary',
          unicode: '💰',
          transactionType: Transaction_T.income,
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const spyCreateMany = jest
        .spyOn(dbService.client.category, 'createMany')
        .mockResolvedValue(mockBatchResult);

      const spyFindMany = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue(createdItems);

      const result = (await service.createCategory(
        createCategoriesDto,
        'userId',
      )) as Category[];

      expect(result).toEqual(createdItems);
      expect(result).toHaveLength(3);
      expect(spyCreateMany).toHaveBeenCalledWith({
        data: [
          {
            name: 'Groceries',
            unicode: '🛒',
            transactionType: Transaction_T.expense,
            userId: 'userId',
          },
          {
            name: 'Utilities',
            unicode: '💡',
            transactionType: Transaction_T.expense,
            userId: 'userId',
          },
          {
            name: 'Salary',
            unicode: '💰',
            transactionType: Transaction_T.income,
            userId: 'userId',
          },
        ],
      });
      expect(spyFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 0,
        take: mockBatchResult.count,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should handle empty batch creation', async () => {
      const createCategoriesDto: CreateCategoryDto[] = [];

      const mockBatchResult = { count: 0 };
      const createdItems: Category[] = [];

      const spyCreateMany = jest
        .spyOn(dbService.client.category, 'createMany')
        .mockResolvedValue(mockBatchResult);

      const spyFindMany = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue(createdItems);

      const result = (await service.createCategory(
        createCategoriesDto,
        'userId',
      )) as Category[];

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(spyCreateMany).toHaveBeenCalled();
      expect(spyFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 0,
        take: mockBatchResult.count,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should throw BadRequestException on Prisma for single creation', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Invalid',
        unicode: '🛒',
        transactionType: Transaction_T.expense,
      };

      jest.spyOn(dbService.client.category, 'create').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Invalid data', {
          clientVersion: '1.0.0',
          code: 'P2000',
        }),
      );

      await expect(
        service.createCategory(createCategoryDto, 'userId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on Prisma for batch creation', async () => {
      const createCategoriesDto: CreateCategoryDto[] = [
        {
          name: 'Invalid',
          unicode: '🛒',
          transactionType: Transaction_T.expense,
        },
      ];

      jest.spyOn(dbService.client.category, 'createMany').mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Invalid data', {
          clientVersion: '1.0.0',
          code: 'P2000',
        }),
      );

      await expect(
        service.createCategory(createCategoriesDto, 'userId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Category',
        unicode: '🛒',
        transactionType: Transaction_T.expense,
      };

      jest
        .spyOn(dbService.client.category, 'create')
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(
        service.createCategory(createCategoryDto, 'userId'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getCategoriesByUser', () => {
    it('should return all categories for a user without pagination', async () => {
      const categories: Category[] = [
        mockCategory,
        {
          id: 'categoryId2',
          name: 'Utilities',
          unicode: '💡',
          transactionType: Transaction_T.expense,
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const spy = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue(categories);

      const result = await service.getCategoriesByUser('userId');

      expect(result).toEqual(categories);
      expect(result).toHaveLength(2);
      expect(spy).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 0,
        take: undefined,
      });
    });

    it('should return categories for a user with pagination on first page', async () => {
      const categories: Category[] = [mockCategory];

      const spy = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue(categories);

      const result = await service.getCategoriesByUser('userId', 1, 10);

      expect(result).toEqual(categories);
      expect(result).toHaveLength(1);
      expect(spy).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 0,
        take: 10,
      });
    });

    it('should return categories for a user with pagination on second page', async () => {
      const categories: Category[] = [
        {
          id: 'categoryId2',
          name: 'Utilities',
          unicode: '💡',
          transactionType: Transaction_T.expense,
          userId: 'userId',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const spy = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue(categories);

      const result = await service.getCategoriesByUser('userId', 2, 10);

      expect(result).toHaveLength(1);
      expect(spy).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 10,
        take: 10,
      });
    });

    it('should return categories with custom limit', async () => {
      const categories: Category[] = [mockCategory];

      const spy = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue(categories);

      const result = await service.getCategoriesByUser('userId', 1, 5);

      expect(result).toHaveLength(1);
      expect(spy).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 0,
        take: 5,
      });
    });

    it('should calculate correct skip value for pagination', async () => {
      const categories: Category[] = [];

      const spy = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue(categories);

      // Page 5 with limit 20 should skip 80 records
      await service.getCategoriesByUser('userId', 5, 20);

      expect(spy).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 80,
        take: 20,
      });
    });

    it('should return empty array when no categories exist', async () => {
      const spy = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue([]);

      const result = await service.getCategoriesByUser('userId');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(spy).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 0,
        take: undefined,
      });
    });

    it('should return empty array when pagination results in no matches', async () => {
      const spy = jest
        .spyOn(dbService.client.category, 'findMany')
        .mockResolvedValue([]);

      const result = await service.getCategoriesByUser('userId', 10, 10);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(spy).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        skip: 90,
        take: 10,
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return a category if it exists', async () => {
      const spy = jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(mockCategory);

      const result = await service.getCategoryById('categoryId', 'userId');

      expect(result).toEqual(mockCategory);
      expect(result.id).toBe('categoryId');
      expect(result.userId).toBe('userId');
      expect(spy).toHaveBeenCalledWith({
        where: { id: 'categoryId', userId: 'userId' },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      const spy = jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.getCategoryById('invalidId', 'userId'),
      ).rejects.toThrow(NotFoundException);
      expect(spy).toHaveBeenCalledWith({
        where: { id: 'invalidId', userId: 'userId' },
      });
    });

    it('should throw NotFoundException if category belongs to different user', async () => {
      const spy = jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.getCategoryById('categoryId', 'differentUserId'),
      ).rejects.toThrow(NotFoundException);
      expect(spy).toHaveBeenCalledWith({
        where: { id: 'categoryId', userId: 'differentUserId' },
      });
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const updateDto: Partial<CreateCategoryDto> = {
        name: 'Updated Groceries',
      };

      const updatedCategory: Category = {
        ...mockCategory,
        name: 'Updated Groceries',
      };

      jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(mockCategory);

      const spy = jest
        .spyOn(dbService.client.category, 'update')
        .mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(
        'categoryId',
        'userId',
        updateDto,
      );

      expect(result).toEqual(updatedCategory);
      expect(result.name).toBe('Updated Groceries');
      expect(spy).toHaveBeenCalledWith({
        where: { id: 'categoryId' },
        data: updateDto,
      });
    });

    it('should update multiple fields on a category', async () => {
      const updateDto: Partial<CreateCategoryDto> = {
        name: 'New Name',
        unicode: '🆕',
      };

      const updatedCategory: Category = {
        ...mockCategory,
        name: 'New Name',
        unicode: '🆕',
      };

      jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(mockCategory);

      const spy = jest
        .spyOn(dbService.client.category, 'update')
        .mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(
        'categoryId',
        'userId',
        updateDto,
      );

      expect(result.name).toBe('New Name');
      expect(result.unicode).toBe('🆕');
      expect(spy).toHaveBeenCalledWith({
        where: { id: 'categoryId' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      const updateDto: Partial<CreateCategoryDto> = {
        name: 'Updated',
      };

      jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.updateCategory('invalidId', 'userId', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if category belongs to different user', async () => {
      const updateDto: Partial<CreateCategoryDto> = {
        name: 'Updated',
      };

      jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.updateCategory('categoryId', 'differentUserId', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(mockCategory);

      const spy = jest
        .spyOn(dbService.client.category, 'delete')
        .mockResolvedValue(mockCategory);

      const result = await service.deleteCategory('categoryId', 'userId');

      expect(result).toEqual(mockCategory);
      expect(result.id).toBe('categoryId');
      expect(spy).toHaveBeenCalledWith({
        where: { id: 'categoryId' },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.deleteCategory('invalidId', 'userId'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if category belongs to different user', async () => {
      jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.deleteCategory('categoryId', 'differentUserId'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should actually delete the category from database', async () => {
      jest
        .spyOn(dbService.client.category, 'findFirst')
        .mockResolvedValue(mockCategory);

      const deleteSpy = jest
        .spyOn(dbService.client.category, 'delete')
        .mockResolvedValue(mockCategory);

      await service.deleteCategory('categoryId', 'userId');

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 'categoryId' },
      });
    });
  });
});
