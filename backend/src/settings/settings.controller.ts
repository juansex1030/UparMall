import { Controller, Get, Body, Patch, UseGuards, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.settingsService.findBySlug(slug);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  findMySettings(@User() user: any) {
    console.log('Fetching settings for user:', user.id, user.email);
    return this.settingsService.findByStoreId(user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch()
  update(@Body() updateSettingDto: UpdateSettingDto, @User() user: any) {
    return this.settingsService.update(updateSettingDto, user.id);
  }
}
