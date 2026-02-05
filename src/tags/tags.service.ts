import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTagDto } from './tags.dto';
import { Prisma } from '../lib/ormClient/client';

@Injectable()
export class TagsService {
  constructor(private db: DatabaseService) {}

  async createTag(body: CreateTagDto | CreateTagDto[], userId: string) {
    try {
      if (Array.isArray(body)) {
        const createdTags = await this.db.client.tags.createMany({
          data: body.map((t) => ({ name: t.name, userId })),
        });

        // return created items
        return await this.db.client.tags.findMany({
          where: { userId },
          skip: 0,
          take: createdTags.count,
          orderBy: { createdAt: 'desc' },
        });
      }

      const tag = await this.db.client.tags.create({
        data: { name: body.name, userId },
      });

      return tag;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(error);
        throw new BadRequestException('Invalid data provided');
      }
      throw new InternalServerErrorException('Tag creation failed');
    }
  }

  async getTagsByUser(userId: string, page?: number, limit?: number) {
    return await this.db.client.tags.findMany({
      where: { userId },
      skip: page && limit ? (page - 1) * limit : 0,
      take: limit || 20,
    });
  }

  async getTagById(tagId: string, userId: string) {
    const tag = await this.db.client.tags.findFirst({
      where: { id: tagId, userId },
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async updateTag(tagId: string, userId: string, body: Partial<CreateTagDto>) {
    try {
      const tag = await this.db.client.tags.update({
        where: { id: tagId, userId },
        data: body,
      });
      if (!tag) throw new NotFoundException('Tag not found');

      return tag;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid data provided');
      }
      throw new InternalServerErrorException('Failed to update tag');
    }
  }

  async deleteTag(tagId: string, userId: string) {
    const tag = await this.db.client.tags.findFirst({
      where: { id: tagId, userId },
    });
    if (!tag) throw new NotFoundException('Tag not found');

    return await this.db.client.tags.delete({ where: { id: tag.id } });
  }
}
