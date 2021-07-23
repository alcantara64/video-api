"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus_1 = __importDefault(require("../../enums/HttpStatus"));
const HttpException_1 = __importDefault(require("./HttpException"));
class HttpNotFoundException extends HttpException_1.default {
    constructor(message, details = "") {
        super(HttpStatus_1.default.NOT_FOUND.CODE, message, details);
        this.name = "HttpNotFoundException";
    }
}
exports.default = HttpNotFoundException;
//# sourceMappingURL=HttpNotFoundException.js.map