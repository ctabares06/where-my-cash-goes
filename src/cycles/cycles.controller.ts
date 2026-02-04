import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateCycleDto } from './cycles.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { CyclesService } from './cycles.service';

@Controller('cycles')
export class CyclesController {
  constructor(private cycleService: CyclesService) {}

  @Post()
  async createCycle(
    @Body() body: CreateCycleDto,
    @Session() session: UserSession,
  ) {
    const cycle = await this.cycleService.createCycle(body, session.user.id);
    return cycle;
  }

  @Get()
  async getCycles(@Session() session: UserSession) {
    const cycles = await this.cycleService.getCyclesByUser(session.user.id);
    return cycles;
  }

  @Get(':id')
  async getCycleById(
    @Param('id') cycleId: string,
    @Session() session: UserSession,
  ) {
    const cycle = await this.cycleService.getCycleById(
      cycleId,
      session.user.id,
    );
    return cycle;
  }

  @Put(':id')
  async updateCycle(
    @Param('id') cycleId: string,
    @Body() body: Partial<CreateCycleDto>,
    @Session() session: UserSession,
  ) {
    const cycle = await this.cycleService.updateCycle(
      cycleId,
      session.user.id,
      body,
    );
    return cycle;
  }

  @Delete(':id')
  async deleteCycle(
    @Param('id') cycleId: string,
    @Session() session: UserSession,
  ) {
    const cycle = await this.cycleService.deleteCycle(cycleId, session.user.id);
    return cycle;
  }
}
