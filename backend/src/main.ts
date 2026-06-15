import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";
import { API_PREFIX } from "./common/constants/api.constants";
import {
  ENV_KEYS,
  getRequiredNumberConfig,
  getRequiredStringConfig,
} from "./config/app.config";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const backendPort = getRequiredNumberConfig(
    configService,
    ENV_KEYS.BACKEND_PORT,
  );
  const frontendUrl = getRequiredStringConfig(
    configService,
    ENV_KEYS.FRONTEND_URL,
  );

  app.setGlobalPrefix(API_PREFIX.VERSION_1);

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(backendPort);
}

void bootstrap();