import { Module } from '@nestjs/common';
import { MasterController } from './master.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MasterController],
})
export class MasterModule {}
