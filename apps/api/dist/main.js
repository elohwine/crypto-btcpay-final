"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const body_parser_1 = require("body-parser");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, body_parser_1.json)({ verify: (req, res, buf) => { req.rawBody = buf; } }));
    app.use(cookieParser());
    const allowedOrigins = [process.env.FRONTEND_ORIGIN, 'http://localhost:3000', 'http://localhost:3002'].filter(Boolean);
    app.enableCors({
        origin: (incomingOrigin, callback) => {
            if (!incomingOrigin)
                return callback(null, true);
            if (allowedOrigins.includes(incomingOrigin))
                return callback(null, true);
            return callback(new Error('CORS not allowed'), false);
        },
        credentials: true,
    });
    app.setGlobalPrefix('api');
    const port = process.env.PORT || process.env.API_PORT || 3001;
    await app.listen(port);
    console.log(`NestJS API listening on port ${port} (serving frontend static files + API under /api)`);
}
bootstrap();
//# sourceMappingURL=main.js.map