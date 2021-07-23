"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpStatus {
}
HttpStatus.OK = {
    CODE: 200,
    MESSAGE: 'The request has succeeded.',
};
HttpStatus.BAD_REQUEST = {
    CODE: 400,
    MESSAGE: 'The server could not understand the request.',
};
HttpStatus.UNAUTHORIZED = {
    CODE: 401,
    MESSAGE: 'The requested resource requires an authentication.',
};
HttpStatus.FORBIDDEN = {
    CODE: 403,
    MESSAGE: 'The authentication failed.',
};
HttpStatus.NOT_FOUND = {
    CODE: 404,
    MESSAGE: 'The requested resource not found.',
};
HttpStatus.METHOD_NOT_ALLOWED = {
    CODE: 405,
    MESSAGE: 'The requested method is not allowed for the specified resource',
};
HttpStatus.INTERNAL_SERVER_ERROR = {
    CODE: 500,
    MESSAGE: 'There was an internal server error while processing the request.',
};
HttpStatus.CREATED = {
    CODE: 201,
    MESSAGE: 'New resource was created successfully',
};
HttpStatus.UNPROCESSABLE_ENTITY = {
    CODE: 422,
    MESSAGE: 'Request contains some semantic errors',
};
HttpStatus.NOT_ACCEPTABLE = {
    CODE: 406,
    MESSAGE: 'Oops something went wrong in our server',
};
exports.default = HttpStatus;
//# sourceMappingURL=HttpStatus.js.map