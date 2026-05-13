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
    'https://www.uparmall.com'
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // En producción solo permitimos los dominios oficiales.
      // En desarrollo permitimos localhost y 127.0.0.1
      if (!isProduction) {
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }
      
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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
