import { Module } from '@nestjs/common';
import { MasterController } from './master.controller';
import { PublicController } from './public.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MasterController, PublicController],
})
export class MasterModule {}
