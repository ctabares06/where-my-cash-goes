import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto } from './categories.dto';
import { PrismaClientValidationError } from '@prisma/client/runtime/client';

@Injectable()
export class CategoriesService {
  constructor(private db: DatabaseService) {}

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
        throw new BadRequestException('Invalid data provided');
      }

      throw new InternalServerErrorException('Category creation failed');
    }
  }

  async getCategoriesByUser(userId: string, page?: number, limit?: number) {
    const categories = await this.db.client.category.findMany({
      where: {
        userId: userId,
      },
      skip: page && limit ? (page - 1) * limit : 0,
      take: limit || undefined,
    });
    return categories;
  }

  async getCategoryById(categoryId: string, userId: string) {
    const category = await this.db.client.category.findFirst({
      where: { id: categoryId, userId: userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(
    categoryId: string,
    userId: string,
    body: Partial<CreateCategoryDto>,
  ) {
    const category = await this.db.client.category.findFirst({
      where: { id: categoryId, userId: userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updatedCategory = await this.db.client.category.update({
      where: {
        id: category.id,
      },
      data: body,
    });
    return updatedCategory;
  }

  async deleteCategory(categoryId: string, userId: string) {
    const category = await this.db.client.category.findFirst({
      where: { id: categoryId, userId: userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return await this.db.client.category.delete({
      where: {
        id: category.id,
      },
    });
  }
}
