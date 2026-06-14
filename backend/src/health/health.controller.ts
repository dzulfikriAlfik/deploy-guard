import { Controller, Get } from "@nestjs/common";

import { HEALTH_ROUTES } from "../common/constants/api.constants";

interface HealthResponse {
  status: "ok";
  service: "deployguard-api";
}

@Controller(HEALTH_ROUTES.ROOT)
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "deployguard-api",
    };
  }
}