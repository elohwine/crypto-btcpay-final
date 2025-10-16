"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const body_parser_1 = require("body-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, body_parser_1.json)({ verify: (req, res, buf) => { req.rawBody = buf; } }));
    app.enableCors();
    const port = process.env.API_PORT || 3001;
    await app.listen(port);
    console.log(`NestJS API listening on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map