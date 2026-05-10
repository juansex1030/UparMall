import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { ProductsModule } from './products/products.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';
import { MasterModule } from './master/master.module';
import { MailModule } from './utils/mail.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    SupabaseModule,
    ProductsModule,
    SettingsModule,
    UploadsModule,
    WebhooksModule,
    MailModule,
    OrdersModule,
    MasterModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
