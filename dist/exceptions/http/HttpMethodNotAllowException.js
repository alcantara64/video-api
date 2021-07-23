"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus_1 = __importDefault(require("../../enums/HttpStatus"));
const HttpException_1 = __importDefault(require("./HttpException"));
class HttpMethodNotAllowedException extends HttpException_1.default {
    constructor(message, details = "") {
        super(HttpStatus_1.default.METHOD_NOT_ALLOWED.CODE, message, details);
        this.name = "HttpMethodNotAllowedException";
    }
}
exports.default = HttpMethodNotAllowedException;
//# sourceMappingURL=HttpMethodNotAllowException.js.map