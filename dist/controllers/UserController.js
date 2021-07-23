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
const ACrudController_1 = __importDefault(require("../interfaces/controllers/ACrudController"));
const user_service_1 = require("../services/user-service");
class UserController extends ACrudController_1.default {
    constructor() {
        super(new user_service_1.UserService(), UserController.LOGGER_STRING);
    }
    addRoutesBeforeStandardRoutes(router, routeOptions) {
        if (!(routeOptions === null || routeOptions === void 0 ? void 0 : routeOptions.createAdminRoute))
            router.get('/me', (req, res) => { return this.readMe(req, res); });
    }
    readMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${UserController.LOGGER_STRING}:readMe::Start`);
            const userService = this.crudService;
            const id = req.user.toString();
            const user = yield userService.readOneById(id);
            return res.send(user);
        });
    }
    createAdminUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`${UserController.LOGGER_STRING}:createAdmin::Start`);
            const userService = this.crudService;
            const user = req.user; //await userService.createAdminUser(req.body);
            return res.send(user);
        });
    }
}
UserController.LOGGER_STRING = 'modules.customer.UserController';
exports.default = UserController;
//# sourceMappingURL=UserController.js.map