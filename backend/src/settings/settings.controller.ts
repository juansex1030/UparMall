import { Controller, Get, Body, Patch, UseGuards, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';
import type { User as SupabaseUser } from '@supabase/supabase-js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':slug')
  async getSettings(@Param('slug') slug: string): Promise<unknown> {
    return this.settingsService.findBySlug(slug);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  findMySettings(@User() user: SupabaseUser) {
    return this.settingsService.findByStoreId(user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch()
  update(
    @Body() updateSettingDto: UpdateSettingDto,
    @User() user: SupabaseUser,
  ) {
    return this.settingsService.update(updateSettingDto, user.id);
  }
}
