import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swagger_config } from './swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({origin: "*"})
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');

  const config = app.get(ConfigService);
  const document = SwaggerModule.createDocument(app, swagger_config);
  SwaggerModule.setup('/api/v1/docs', app, document,{
    // swaggerOptions: { defaultModelsExpandDepth: -1 }
  }
  );

  const port = config.getOrThrow('app.port');
  await app.listen(port);
  
}
bootstrap();
