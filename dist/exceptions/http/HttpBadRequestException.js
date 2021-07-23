"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus_1 = __importDefault(require("../../enums/HttpStatus"));
const HttpException_1 = __importDefault(require("./HttpException"));
class HttpBadRequestException extends HttpException_1.default {
    constructor(message, details = "") {
        super(HttpStatus_1.default.BAD_REQUEST.CODE, message, details);
        this.name = "HttpBadRequestException";
    }
}
exports.default = HttpBadRequestException;
//# sourceMappingURL=HttpBadRequestException.js.map