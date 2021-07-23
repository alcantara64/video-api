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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const config_1 = __importDefault(require("../lib/config"));
//import UserService from '../modules/user/UserService';
const HttpStatus_1 = __importDefault(require("../enums/HttpStatus"));
const AppUser_1 = __importDefault(require("../interfaces/models/AppUser"));
const HttpUnauthorizedException_1 = __importDefault(require("../exceptions/http/HttpUnauthorizedException"));
const user_service_1 = require("../services/user-service");
const jwtSecret = config_1.default.jwtSecret;
const jwtOpts = { algorithm: 'HS256', expiresIn: '12h' };
passport_1.default.use(dbStrategy());
const authenticate = passport_1.default.authenticate('local', { session: false });
exports.default = {
    authenticate,
    login,
    ensureUser,
};
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const userIdOrEmail = req.body.userId;
        console.log(`milddleware.auth:login::Login of user started ${userIdOrEmail}`);
        const userService = new user_service_1.UserService();
        const user = yield userService.findUserForAuthByIdOrEmailWithPassword(userIdOrEmail);
        if (!user) {
            throw new HttpUnauthorizedException_1.default("Invalid login credentials.");
        }
        ;
        const appUser = yield buildAppUser(user);
        const token = yield sign({
            _id: user._id,
            email: user.email,
        });
        //res.cookie('jwt', token, { httpOnly: true }) Removing cookie for now.
        res.json({ token, user });
    });
}
function ensureUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //const token = req.headers.authorization; //|| req.cookies.jwt removing cookie for now
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(HttpStatus_1.default.UNAUTHORIZED.CODE).send('Access denied. No token provided.');
        }
        try {
            const userFromToken = yield verify(token);
            const appUser = yield buildAppUserWithId(userFromToken._id);
            req.user = appUser;
            return next();
        }
        catch (error) {
            console.log("milddleware.auth:ensureUser::Token verification error.", error);
            return res.status(HttpStatus_1.default.UNAUTHORIZED.CODE).send('Invalid token.');
        }
    });
}
function sign(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield jsonwebtoken_1.default.sign(payload, jwtSecret, jwtOpts);
        return token;
    });
}
function verify(jwtString = '') {
    return __awaiter(this, void 0, void 0, function* () {
        jwtString = jwtString.replace(/^Bearer /i, '');
        try {
            const payload = yield jsonwebtoken_1.default.verify(jwtString, jwtSecret); //TODO need to check if this really works asynchronosly.
            return payload;
        }
        catch (err) {
            console.log("milddleware.auth:verify::There was an error verifying the auth token.", err);
            throw new HttpUnauthorizedException_1.default("Invalid token.", err.message);
        }
    });
}
function dbStrategy() {
    return new passport_local_1.Strategy({ usernameField: 'userId' }, function (username, password, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            const userService = new user_service_1.UserService();
            try {
                const user = yield userService.findUserForAuthByIdOrEmailWithPassword(username);
                if (!user) {
                    return cb(null, false);
                }
                const isUser = yield bcrypt_1.default.compare(password, user.password);
                if (isUser) {
                    return cb(null, { username: user.username });
                }
            }
            catch (err) {
                console.log("milddleware.auth:dbStrategy::There was an error retrieving the user.", err);
                throw new HttpUnauthorizedException_1.default("User login failed.", err.message);
            }
            cb(null, false);
        });
    });
}
function buildAppUserWithId(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const userService = new user_service_1.UserService();
        const user = yield userService.findUserById(id);
        const appUser = yield buildAppUser(user);
        return appUser;
    });
}
function buildAppUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const appUser = new AppUser_1.default(user._id, user.name, user.email);
        return appUser;
    });
}
//# sourceMappingURL=auth.middleware.js.map