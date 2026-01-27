import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCategoryDto } from './categories.dto';
import { PrismaClientValidationError } from '@prisma/client/runtime/client';

@Injectable()
export class CategoriesService {
  constructor(private db: DatabaseService) {}

  async belongsToUser(userId: string, categoryId: string) {
    if (!userId || !categoryId) {
      return false;
    }

    const category = await this.db.client.category.findFirst({
      where: {
        id: categoryId,
      },
    });

    if (category?.userId === userId) {
      return category;
    }

    return null;
  }

  async createCategory(body: CreateCategoryDto, userId: string) {
    try {
      const category = await this.db.client.category.create({
        data: {
          name: body.name,
          unicode: body.unicode,
          transaction_type: body.transaction_type,
          userId: userId,
        },
      });
      return category;
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw error;
      }

      throw new Error('Category creation failed');
    }
  }

  async getCategoriesByUser(userId: string) {
    const categories = await this.db.client.category.findMany({
      where: {
        userId: userId,
      },
    });
    return categories;
  }

  async getCategoryById(categoryId: string, userId: string) {
    const category = await this.belongsToUser(userId, categoryId);

    if (!category) {
      throw new Error('Unauthorized');
    }

    return category;
  }

  async updateCategory(
    categoryId: string,
    userId: string,
    body: Partial<CreateCategoryDto>,
  ) {
    const oldCategory = await this.belongsToUser(userId, categoryId);

    if (!oldCategory) {
      throw new Error('Unauthorized');
    }

    const category = await this.db.client.category.update({
      where: {
        id: categoryId,
      },
      data: body,
    });
    return category;
  }

  async deleteCategory(categoryId: string, userId: string) {
    const category = await this.belongsToUser(userId, categoryId);

    if (!category) {
      throw new Error('Unauthorized');
    }

    return await this.db.client.category.delete({
      where: {
        id: categoryId,
      },
    });
  }
}
