import { Module } from '@nestjs/common';
import { CyclesService } from './cycles.service';
import { CyclesController } from './cycles.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CyclesService, DatabaseService],
  controllers: [CyclesController],
})
export class CyclesModule {}
