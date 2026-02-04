import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './categories.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockSession = {
    user: {
      id: 'userId',
    },
  };

  const mockCategoriesService = {
    createCategory: jest.fn(),
    getCategoriesByUser: jest.fn(),
    getCategoryById: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const dto: CreateCategoryDto = {
        name: 'Test Category',
        unicode: '📁',
        transaction_type: 'income' as any,
      };
      const result = { id: '1', ...dto, userId: 'userId' };
      mockCategoriesService.createCategory.mockResolvedValue(result);

      const response = await controller.createCategory(dto, mockSession as any);
      expect(response).toEqual(result);
      expect(mockCategoriesService.createCategory).toHaveBeenCalledWith(
        dto,
        'userId',
      );
    });
  });

  describe('getCategories', () => {
    it('should return categories for user', async () => {
      const categories = [{ id: '1', name: 'Test' }];
      mockCategoriesService.getCategoriesByUser.mockResolvedValue(categories);

      const result = await controller.getCategories(mockSession as any);
      expect(result).toEqual(categories);
      expect(mockCategoriesService.getCategoriesByUser).toHaveBeenCalledWith(
        'userId',
      );
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      const category = { id: '1', name: 'Test' };
      mockCategoriesService.getCategoryById.mockResolvedValue(category);

      const result = await controller.getCategoryById('1', mockSession as any);
      expect(result).toEqual(category);
      expect(mockCategoriesService.getCategoryById).toHaveBeenCalledWith(
        '1',
        'userId',
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category', async () => {
      const dto: Partial<CreateCategoryDto> = { name: 'Updated' };
      const result = { id: '1', name: 'Updated' };
      mockCategoriesService.updateCategory.mockResolvedValue(result);

      const response = await controller.updateCategory(
        '1',
        dto,
        mockSession as any,
      );
      expect(response).toEqual(result);
      expect(mockCategoriesService.updateCategory).toHaveBeenCalledWith(
        '1',
        'userId',
        dto,
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete category', async () => {
      const result = { id: '1' };
      mockCategoriesService.deleteCategory.mockResolvedValue(result);

      const response = await controller.deleteCategory('1', mockSession as any);
      expect(response).toEqual(result);
      expect(mockCategoriesService.deleteCategory).toHaveBeenCalledWith(
        '1',
        'userId',
      );
    });
  });
});
