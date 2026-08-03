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
import { StaffService } from './staff.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';
import type { User as SupabaseUser } from '@supabase/supabase-js';

@UseGuards(SupabaseAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async findAll(@User() user: SupabaseUser) {
    return this.staffService.findAll(user.id);
  }

  @Post()
  async create(
    @User() user: SupabaseUser,
    @Body() body: { name: string; role: string; pin_code: string },
  ) {
    return this.staffService.create(user.id, body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @User() user: SupabaseUser,
  ) {
    return this.staffService.update(id, body, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: SupabaseUser) {
    return this.staffService.delete(id, user.id);
  }
}
