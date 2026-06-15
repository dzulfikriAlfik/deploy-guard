import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import {
  ENV_KEYS,
  getOptionalBooleanConfig,
  getOptionalStringConfig,
} from "../config/app.config";
import {
  DEFAULT_LOG_FILE_PATH,
  LOGGER_REDACT_CENSOR,
  LOGGER_REDACT_PATHS,
} from "./logging.constants";
import { 
  ensureLogFileDirectory,
  resolveLogFilePath,
  resolveRequestId,
} from "./logging.utils";

const DEFAULT_LOG_LEVEL = "info";
const DEFAULT_LOG_PRETTY = false;
const DEFAULT_LOG_FILE_ENABLED = false;

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

        const logFileEnabled = getOptionalBooleanConfig(
          configService,
          ENV_KEYS.LOG_FILE_ENABLED,
          DEFAULT_LOG_FILE_ENABLED,
        );

        const logFilePath = getOptionalStringConfig(
          configService,
          ENV_KEYS.LOG_FILE_PATH,
          DEFAULT_LOG_FILE_PATH,
        );

        if (logFileEnabled) {
          ensureLogFileDirectory(logFilePath);
        }

        const transportTargets = [
          ...(logPretty
            ? [
                {
                  target: "pino-pretty",
                  level: logLevel,
                  options: {
                    singleLine: true,
                    translateTime: "SYS:standard",
                  },
                },
              ]
            : [
                {
                  target: "pino/file",
                  level: logLevel,
                  options: {
                    destination: 1,
                  },
                },
              ]),
          ...(logFileEnabled
            ? [
                {
                  target: "pino/file",
                  level: logLevel,
                  options: {
                    destination: resolveLogFilePath(logFilePath),
                  },
                },
              ]
            : []),
        ];

        return {
          pinoHttp: {
            level: logLevel,
            genReqId: resolveRequestId,
            redact: {
              paths: [...LOGGER_REDACT_PATHS],
              censor: LOGGER_REDACT_CENSOR,
            },
            transport: {
              targets: transportTargets,
            },
          },
        };
      },
    }),
  ],
})
export class LoggingModule {}