import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateAndUpdateTagDto } from './tags.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Post()
  async createTag(
    @Body() body: CreateAndUpdateTagDto,
    @Session() session: UserSession,
  ) {
    return await this.tagsService.createTag(body, session.user.id);
  }

  @Get()
  async getTags(
    @Session() session: UserSession,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.tagsService.getTagsByUser(session.user.id, page, limit);
  }

  @Get(':id')
  async getTagById(
    @Param('id') tagId: string,
    @Session() session: UserSession,
  ) {
    return await this.tagsService.getTagById(tagId, session.user.id);
  }

  @Put(':id')
  async updateTag(
    @Param('id') tagId: string,
    @Body() body: Partial<CreateAndUpdateTagDto>,
    @Session() session: UserSession,
  ) {
    return await this.tagsService.updateTag(tagId, session.user.id, body);
  }

  @Delete(':id')
  async deleteTag(@Param('id') tagId: string, @Session() session: UserSession) {
    return await this.tagsService.deleteTag(tagId, session.user.id);
  }
}
