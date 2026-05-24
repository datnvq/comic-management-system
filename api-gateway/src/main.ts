import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';
import { authMiddleware } from './middleware/auth.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(loggerMiddleware);

  app.use(authMiddleware);

  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://auth-service:3001/auth',
      changeOrigin: true,
    }),
  );

  app.use(
    '/api/comics',
    createProxyMiddleware({
      target: 'http://comic-service:3002/comics',
      changeOrigin: true,
    }),
  );

  app.use(
    '/api/chapters',
    createProxyMiddleware({
      target: 'http://chapter-service:3003/chapters',
      changeOrigin: true,
    }),
  );

  app.use(
    '/api/search',
    createProxyMiddleware({
      target: 'http://search-service:3005/search',
      changeOrigin: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();