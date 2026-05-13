import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const isProduction = process.env['NODE_ENV'] === 'production';

  // 1. Security Headers (Helmet)
  app.use(helmet({
    crossOriginResourcePolicy: isProduction,
    contentSecurityPolicy: isProduction,
  }));

  // 2. Restricted CORS
  const adminUrl = process.env['ADMIN_URL'] || 'https://admin.uparmall.com';
  const storeUrl = process.env['STORE_URL'] || 'https://uparmall.com';
  const allowedOrigins = [
    adminUrl, 
    storeUrl,
    'https://www.admin.uparmall.com',
    'https://www.uparmall.com',
    'https://upar-mall.vercel.app',
    'https://admin-upar.pages.dev'
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitimos si:
      // 1. Es desarrollo (no origin o localhost)
      // 2. El origin está en nuestra lista blanca
      // 3. El origin contiene 'uparmall.com' (para subdominios dinámicos y móvil)
      if (
        !isProduction || 
        !origin || 
        allowedOrigins.includes(origin) || 
        origin.includes('uparmall.com')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Acceso no permitido por política CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  
  // 3. Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           
    forbidNonWhitelisted: false,
    transform: true,            
  }));

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  const mode = isProduction ? '🚀 PRODUCCIÓN' : '🛠️ DESARROLLO';
  console.log(`Backend corriendo en modo: ${mode} en el puerto: ${port}`);
}
bootstrap();
