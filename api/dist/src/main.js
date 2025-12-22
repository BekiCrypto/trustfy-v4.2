import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: true,
    }));
    const configService = app.get(ConfigService);
    const port = configService.get("PORT", 4000);
    const corsOrigins = configService
        .get("CORS_ORIGINS")
        ?.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : undefined,
    });
    app.use(helmet());
    app.use(rateLimit({
        windowMs: Number(configService.get("RATE_LIMIT_WINDOW_MS") ?? 60_000),
        max: Number(configService.get("RATE_LIMIT_MAX") ?? 60),
        standardHeaders: true,
        legacyHeaders: false,
    }));
    const swaggerConfig = new DocumentBuilder()
        .setTitle("Trustfy API")
        .setDescription("Trustfy V4.2 escrow operations")
        .setVersion("4.2")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("v1/docs", app, document);
    await app.listen(port);
    console.log(`🚀 Trustfy API listening on port ${port}`);
}
bootstrap().catch((err) => {
    console.error("Failed to boot Trustfy API", err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map