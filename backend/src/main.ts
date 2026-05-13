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
      if (!isProduction || !origin) {
        return callback(null, true);
      }

      // Normalizar origin: quitar barra al final para evitar errores en móviles
      const cleanOrigin = origin.replace(/\/$/, '');

      if (
        allowedOrigins.includes(cleanOrigin) || 
        cleanOrigin.includes('uparmall.com') ||
        cleanOrigin.includes('vercel.app')
      ) {
        callback(null, true);
      } else {
        console.error(`Bloqueado por CORS: ${origin}`);
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
