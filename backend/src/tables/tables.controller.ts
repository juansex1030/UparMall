/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';
import type { User as SupabaseUser } from '@supabase/supabase-js';

@UseGuards(SupabaseAuthGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  async findAll(@User() user: SupabaseUser) {
    // Assuming the user object contains the store ID (they are the store owner)
    return this.tablesService.findAll(user.id);
  }

  @Post()
  async create(@User() user: SupabaseUser, @Body('name') name: string) {
    return this.tablesService.create(user.id, name);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: SupabaseUser,
    @Body('orderId') orderId?: string,
  ) {
    return this.tablesService.updateStatus(id, status, user.id, orderId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: SupabaseUser) {
    return this.tablesService.delete(id, user.id);
  }
}
