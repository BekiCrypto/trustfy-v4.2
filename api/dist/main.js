"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: true,
    }));
    const configService = app.get(config_1.ConfigService);
    const port = configService.get("PORT", 4000);
    const corsOrigins = configService
        .get("CORS_ORIGINS")
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : undefined,
    });
    app.use((0, helmet_1.default)());
    app.use((0, express_rate_limit_1.default)({
        windowMs: Number(configService.get("RATE_LIMIT_WINDOW_MS") ?? 60_000),
        max: Number(configService.get("RATE_LIMIT_MAX") ?? 60),
        standardHeaders: true,
        legacyHeaders: false,
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("Trustfy API")
        .setDescription("Trustfy V4.2 escrow operations")
        .setVersion("4.2")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("v1/docs", app, document);
    await app.listen(port);
    console.log(`🚀 Trustfy API listening on port ${port}`);
}
bootstrap().catch((err) => {
    console.error("Failed to boot Trustfy API", err);
    process.exit(1);
});
