import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { API_PREFIX } from "./common/constants/api.constants";
import { APP_CONFIG } from "./config/app.config";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX.VERSION_1);

  app.enableCors({
    origin: APP_CONFIG.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(APP_CONFIG.PORT);
}

void bootstrap();