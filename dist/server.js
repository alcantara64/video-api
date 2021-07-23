"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loaders_1 = __importDefault(require("./loaders"));
const config_1 = __importDefault(require("./lib/config"));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express_1.default();
        yield loaders_1.default(app);
        const port = config_1.default.server.port;
        const server = app.listen(port, () => {
            console.info(`Server is listening on port ${port}...`);
            process.on("unhandledRejection", ex => {
                console.info("index::undhandledRejection", ex);
            });
            process.on("unhandledException", ex => {
                console.error("index::unhandledException", ex);
                throw ex;
            });
        });
        return server;
    });
}
startServer();
//# sourceMappingURL=server.js.map