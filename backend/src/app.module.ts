import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { getEnvFilePaths } from "./config/app.config";
import { HealthModule } from "./health/health.module";
import { LoggingModule } from "./logging/logging.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths(),
    }),
    LoggingModule,
    HealthModule,
  ],
})
export class AppModule {}