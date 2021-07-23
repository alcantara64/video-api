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
exports.UserService = void 0;
const user_model_1 = __importDefault(require("../models/user-model"));
const ACrudService_1 = __importDefault(require("../interfaces/services/ACrudService"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService extends ACrudService_1.default {
    constructor() {
        super(user_model_1.default, UserService.LOGGER_STRING);
        this.hashPassword = function (user) {
            return __awaiter(this, void 0, void 0, function* () {
                //if (!user.password) throw user.invalidate('password', 'password is required')
                //if (user.password.length < 12) throw user.invalidate('password', 'password must be at least 12 characters')
                const salt = yield bcrypt_1.default.genSalt(10);
                user.password = yield bcrypt_1.default.hash(user.password, salt);
            });
        };
    }
    getMongooseQuerySelectOptions() {
        //do not return the password in standard curd end points
        return "-password";
    }
    getMongooseQueryPopulateOptions(methodName) {
        //do not return the password in standard curd end points
        return "roles";
    }
    /**
 * No security check. Supposed to be used only internally for authentication routes!
 * @param userIdOrEmail Can be userId or Email
 */
    findUserForAuthByIdOrEmailWithPassword(userIdOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_model_1.default.findOne({ email: userIdOrEmail });
        });
    }
    createOne(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${this.loggerString}:createOne::Start`);
            yield this.hashPassword(payload);
            const newModel = new this.model(payload);
            yield newModel.save();
            delete newModel._doc.password;
            return newModel;
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_model_1.default.findById(id).select('-password');
        });
    }
}
exports.UserService = UserService;
UserService.LOGGER_STRING = 'modules.customer.UserService';
//# sourceMappingURL=user-service.js.map