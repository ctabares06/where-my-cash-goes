import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [TagsService, DatabaseService],
  controllers: [TagsController],
})
export class TagsModule {}
