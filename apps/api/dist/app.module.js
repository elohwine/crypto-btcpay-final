"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const prisma_module_1 = require("./prisma/prisma.module");
const btcpay_module_1 = require("./modules/btcpay/btcpay.module");
const auth_module_1 = require("./modules/auth/auth.module");
const ledger_module_1 = require("./modules/ledger/ledger.module");
const deposits_module_1 = require("./modules/deposits/deposits.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const admin_module_1 = require("./modules/admin/admin.module");
const health_module_1 = require("./modules/health/health.module");
const chat_module_1 = require("./modules/chat/chat.module");
const stats_module_1 = require("./modules/stats/stats.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [
                    '.env',
                    '../../.env',
                ],
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
                exclude: ['/api*'],
            }),
            prisma_module_1.PrismaModule,
            btcpay_module_1.BtcpayModule,
            auth_module_1.AuthModule,
            ledger_module_1.LedgerModule,
            deposits_module_1.DepositsModule,
            webhooks_module_1.WebhooksModule,
            admin_module_1.AdminModule,
            health_module_1.HealthModule,
            chat_module_1.ChatModule,
            stats_module_1.StatsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map