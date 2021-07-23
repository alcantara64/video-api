"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const HttpStatus_1 = __importDefault(require("../enums/HttpStatus"));
const HttpException_1 = __importDefault(require("../exceptions/http/HttpException"));
const AppException_1 = __importDefault(require("../exceptions/AppException"));
exports.default = {
    handleError,
    handleAppError,
    handleValidationError,
    notFound
};
function standardErrorLogMsg(req) {
    return `url: ${req.originalUrl ? req.originalUrl + ' -- ' : ''}`;
}
function handleError(err, req, res, next) {
    const logMessage = standardErrorLogMsg(req);
    console.log(`middleware.error:handleError::${logMessage}`, err);
    if (res.headersSent) {
        //see "The default error handler" http://expressjs.com/en/guide/error-handling.html#error-handling
        return next(err);
    }
    const httpStatus = err.statusCode || 500;
    return res
        .status(httpStatus)
        .json({
        httpStatus: httpStatus,
        errorType: 'Error',
        errorMessage: HttpStatus_1.default.INTERNAL_SERVER_ERROR.MESSAGE,
        message: HttpStatus_1.default.INTERNAL_SERVER_ERROR.MESSAGE //legacy response
    });
}
function handleAppError(err, req, res, next) {
    if (err instanceof AppException_1.default) {
        const logMessage = standardErrorLogMsg(req);
        console.log(`middleware.error:handleAppError::${logMessage}`, err);
        const httpStatus = HttpStatus_1.default.NOT_FOUND.CODE;
        return res
            .status(httpStatus)
            .json({
            httpStatus: (err instanceof HttpException_1.default) ? err.httpStatus : HttpStatus_1.default.INTERNAL_SERVER_ERROR.CODE,
            errorType: err.name,
            errorMessage: err.message,
            errorDetails: err.details,
            message: err.message //legacy response
        });
    }
    return next(err);
}
function handleValidationError(err, req, res, next) {
    if (err.name === 'ValidationError') {
        console.log(`middleware.error:handleValidationError::`, err);
        const httpStatus = HttpStatus_1.default.BAD_REQUEST.CODE;
        let validationErrors = lodash_1.default.map(err.errors, a => a.message);
        return res
            .status(httpStatus)
            .json({
            httpStatus: httpStatus,
            errorType: err.name,
            errorMessage: err._message,
            validationErrors: validationErrors,
            errorDetails: err.errors,
            message: lodash_1.default.join(validationErrors, ', ') //legacy response
        });
    }
    return next(err);
}
function notFound(req, res) {
    //https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
    console.log(`middleware.error:handleValidationError::Route not found ${req.ip} ${req.originalUrl}`);
    const httpStatus = HttpStatus_1.default.NOT_FOUND.CODE;
    return res
        .status(httpStatus)
        .json({
        httpStatus: httpStatus,
        errorType: 'NotFound',
        errorMessage: 'Route not found',
        errorDetails: `Route ${req.originalUrl} not found`,
        message: 'Route not found' //legacy response
    });
}
//# sourceMappingURL=error-middleware.js.map