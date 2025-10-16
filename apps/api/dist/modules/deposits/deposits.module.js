"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositsModule = void 0;
const common_1 = require("@nestjs/common");
const deposits_controller_1 = require("./deposits.controller");
const btcpay_module_1 = require("../btcpay/btcpay.module");
const prisma_module_1 = require("../../prisma/prisma.module");
const tron_module_1 = require("../tron/tron.module");
const ledger_module_1 = require("../ledger/ledger.module");
let DepositsModule = class DepositsModule {
};
exports.DepositsModule = DepositsModule;
exports.DepositsModule = DepositsModule = __decorate([
    (0, common_1.Module)({ imports: [btcpay_module_1.BtcpayModule, prisma_module_1.PrismaModule, tron_module_1.TronModule, ledger_module_1.LedgerModule], controllers: [deposits_controller_1.DepositsController] })
], DepositsModule);
//# sourceMappingURL=deposits.module.js.map