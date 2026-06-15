import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import {
  ENV_KEYS,
  getOptionalBooleanConfig,
  getOptionalStringConfig,
} from "../config/app.config";
import {
  LOGGER_REDACT_CENSOR,
  LOGGER_REDACT_PATHS,
} from "./logging.constants";
import { resolveRequestId } from "./logging.utils";

const DEFAULT_LOG_LEVEL = "info";
const DEFAULT_LOG_PRETTY = false;

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logLevel = getOptionalStringConfig(
          configService,
          ENV_KEYS.LOG_LEVEL,
          DEFAULT_LOG_LEVEL,
        );

        const logPretty = getOptionalBooleanConfig(
          configService,
          ENV_KEYS.LOG_PRETTY,
          DEFAULT_LOG_PRETTY,
        );

        return {
          pinoHttp: {
            level: logLevel,
            genReqId: resolveRequestId,
            redact: {
              paths: [...LOGGER_REDACT_PATHS],
              censor: LOGGER_REDACT_CENSOR,
            },
            transport: logPretty
              ? {
                  target: "pino-pretty",
                  options: {
                    singleLine: true,
                    translateTime: "SYS:standard",
                  },
                }
              : undefined,
          },
        };
      },
    }),
  ],
})
export class LoggingModule {}