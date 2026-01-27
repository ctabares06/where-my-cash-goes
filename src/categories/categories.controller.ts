import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateCategoryDto } from './categories.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { CategoriesService } from './categories.service';

@Controller('category')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @Post()
  async createCategory(
    @Body() body: CreateCategoryDto,
    @Session() session: UserSession,
  ) {
    const category = await this.categoryService.createCategory(
      body,
      session.user.id,
    );
    return category;
  }

  @Get()
  async getCategories(@Session() session: UserSession) {
    const categories = await this.categoryService.getCategoriesByUser(
      session.user.id,
    );
    return categories;
  }

  @Get(':id')
  async getCategoryById(
    @Param('id') categoryId: string,
    @Session() session: UserSession,
  ) {
    const category = await this.categoryService.getCategoryById(
      categoryId,
      session.user.id,
    );
    return category;
  }

  @Put(':id')
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() body: Partial<CreateCategoryDto>,
    @Session() session: UserSession,
  ) {
    const category = await this.categoryService.updateCategory(
      categoryId,
      session.user.id,
      body,
    );
    return category;
  }

  @Delete(':id')
  async deleteCategory(
    @Param('id') categoryId: string,
    @Session() session: UserSession,
  ) {
    const category = await this.categoryService.deleteCategory(
      categoryId,
      session.user.id,
    );
    return category;
  }
}
