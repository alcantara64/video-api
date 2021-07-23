"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppException_1 = __importDefault(require("../AppException"));
class HttpException extends AppException_1.default {
    constructor(httpStatus, message, details) {
        super(message, details);
        this.name = "HttpException";
        this.httpStatus = httpStatus;
    }
}
exports.default = HttpException;
//# sourceMappingURL=HttpException.js.map