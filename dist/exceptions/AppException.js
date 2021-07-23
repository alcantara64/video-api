"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppException extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'AppException';
        this.details = details;
    }
}
exports.default = AppException;
//# sourceMappingURL=AppException.js.map