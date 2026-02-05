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
import { PrismaClientValidationError } from '@prisma/client/runtime/client';

describe('CategoriesService - UT', () => {
  let service: CategoriesService;
  let dbService: DatabaseService;

  const mockCategory: Category = {
    id: 'categoryId',
    name: 'Groceries',
    unicode: '🛒',
    transaction_type: Transaction_T.expense,
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
    it('should create a category successfully', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Groceries',
        unicode: '🛒',
        transaction_type: Transaction_T.expense,
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
          transaction_type: Transaction_T.expense,
          userId: 'userId',
        },
      });
    });

    it('should throw BadRequestException on PrismaClientValidationError', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Invalid',
        unicode: '🛒',
        transaction_type: Transaction_T.expense,
      };

      jest.spyOn(dbService.client.category, 'create').mockRejectedValue(
        new PrismaClientValidationError('Invalid data', {
          clientVersion: 'si',
        }),
      );

      await expect(
        service.createCategory(createCategoryDto, 'userId'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Category',
        unicode: '🛒',
        transaction_type: Transaction_T.expense,
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
    it('should return all categories for a user', async () => {
      const categories: Category[] = [
        mockCategory,
        {
          id: 'categoryId2',
          name: 'Utilities',
          unicode: '💡',
          transaction_type: Transaction_T.expense,
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
