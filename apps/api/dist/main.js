"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const body_parser_1 = require("body-parser");
const cookieParser = require("cookie-parser");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, body_parser_1.json)({ verify: (req, res, buf) => { req.rawBody = buf; } }));
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: true },
    }));
    const isProd = process.env.NODE_ENV === 'production';
    const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    const allowedOrigins = isProd
        ? configuredOrigins
        : [...configuredOrigins, 'http://localhost:3000', 'http://localhost:3002', 'http://localhost:4500'];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    });
    const port = process.env.API_PORT || 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`NestJS API listening on http://0.0.0.0:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map