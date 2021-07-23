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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../lib/config"));
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`loaders.mongoose::Connecting to ${config_1.default.mongoDb.urlNoPw}`);
    const connection = yield mongoose_1.default.connect(config_1.default.mongoDb.url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
        .then(() => console.info(`loaders.mongoose::Connection to database established successfully.`))
        .catch((err) => { console.error(err.message); });
    return connection;
});
//# sourceMappingURL=mongoose.loader.js.map