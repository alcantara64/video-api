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
const HttpStatus_1 = __importDefault(require("../../enums/HttpStatus"));
const HttpBadRequestException_1 = __importDefault(require("../../exceptions/http/HttpBadRequestException"));
const AControllerBase_1 = __importDefault(require("./AControllerBase"));
class ACrudController extends AControllerBase_1.default {
    constructor(crudService, loggerString, routeOptions) {
        super(loggerString, routeOptions);
        this.crudService = crudService;
    }
    initRoutes(router, routeOptions) {
        this.addRoutesBeforeStandardRoutes(router, routeOptions);
        if (!routeOptions || routeOptions.create) {
            console.log('silly', `${this.loggerString}:initRoutes::Registering create route.`);
            router.post('/', (req, res) => { return this.createSendResponse(req, res); });
        }
        if (!routeOptions || routeOptions.readOne) {
            console.log('silly', `${this.loggerString}:initRoutes::Registering readOne route.`);
            router.get('/:id', (req, res) => { return this.readOneSendResponse(req, res); });
        }
        if (!routeOptions || routeOptions.readMany) {
            console.log('silly', `${this.loggerString}:initRoutes::Registering readMany route.`);
            router.get('/', (req, res) => { return this.readManySendResponse(req, res); });
        }
        if (!routeOptions || routeOptions.updateOne) {
            console.log('silly', `${this.loggerString}:initRoutes::Registering updateOne route.`);
            router.put('/:id', (req, res) => { return this.updateOneSendResponse(req, res); });
        }
        if (!routeOptions || routeOptions.updateMany) {
            console.log('silly', `${this.loggerString}:initRoutes::Registering updateMany route.`);
            router.put('/', (req, res) => { return this.updateManySendResponse(req, res); });
        }
        if (!routeOptions || routeOptions.delete) {
            console.log('silly', `${this.loggerString}:initRoutes::Registering delete route.`);
            router.delete('/:id', (req, res) => { return this.deleteSendResponse(req, res); });
        }
        this.addRoutesAfterStandardRoutes(router, routeOptions);
    }
    addRoutesBeforeStandardRoutes(router, routeOptions) {
        //empty implementation, can be overwritten
    }
    addRoutesAfterStandardRoutes(router, routeOptions) {
        //empty implementation, can be overwritten
    }
    createSendResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.create(req, res);
            res.status(HttpStatus_1.default.OK.CODE).json(obj);
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appUser = this.extractAppUser(req);
            this.processPayloadCreate(req.body);
            if (Array.isArray(req.body)) {
                console.debug(`${this.loggerString}:create::Processing array.`);
                this.processPayloadCreateMany(req.body);
                const results = yield this.crudService.createMany(req.body);
                return results;
            }
            else {
                console.debug(`${this.loggerString}:create::Processing single item.`);
                this.processPayloadCreateOne(req.body);
                //check for unique code happens in model
                const result = yield this.crudService.createOne(req.body);
                return result;
            }
        });
    }
    readOneSendResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.readOne(req, res);
            res.status(HttpStatus_1.default.OK.CODE).json(obj);
        });
    }
    readOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appUser = this.extractAppUser(req);
            this.processPayloadReadOne(req.params);
            const id = req.params.id;
            const result = yield this.crudService.readOneById(id);
            return result;
        });
    }
    readManySendResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.readMany(req, res);
            res.status(HttpStatus_1.default.OK.CODE).json(obj);
        });
    }
    readMany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appUser = this.extractAppUser(req);
            const results = yield this.crudService.readMany(req.query);
            return results;
        });
    }
    updateOneSendResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.updateOne(req, res);
            res.status(HttpStatus_1.default.OK.CODE).json(obj);
        });
    }
    updateOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appUser = this.extractAppUser(req);
            this.processPayloadUpdateOne(req.params, req.body);
            const id = req.params.id;
            const result = yield this.crudService.updateOneById(id, req.body);
            return result;
        });
    }
    updateManySendResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.updateMany(req, res);
            res.status(HttpStatus_1.default.OK.CODE).json(obj);
        });
    }
    updateMany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appUser = this.extractAppUser(req);
            this.processPayloadUpdateMany(appUser);
            const results = yield this.crudService.updateMany(req.body);
            return results;
        });
    }
    deleteSendResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.delete(req, res);
            res.status(HttpStatus_1.default.OK.CODE).json(obj);
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appUser = this.extractAppUser(req);
            this.processPayloadDelete(req.params);
            const id = req.params.id;
            const result = yield this.crudService.deleteOneById(id);
            return result;
        });
    }
    searchSendResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.search(req, res);
            res.status(HttpStatus_1.default.OK.CODE).json(obj);
        });
    }
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appUser = this.extractAppUser(req);
            const searchQueryOpts = req.body;
            let result = null;
            if (searchQueryOpts.query) {
                result = yield this.crudService.searchByQuery(searchQueryOpts);
            }
            else if (searchQueryOpts.queryByCriteria) {
                result = yield this.crudService.searchByFilterCriteria(appUser, searchQueryOpts);
            }
            else {
                throw new HttpBadRequestException_1.default("Query or criteria attributes need to be specified.");
            }
            return result;
        });
    }
    getSearchFilterDataBasedOnConfigSendResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.getSearchFilterDataBasedOnConfig(req, res);
            res.status(HttpStatus_1.default.OK.CODE).json(obj);
        });
    }
    getSearchFilterDataBasedOnConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const appUser = this.extractAppUser(req);
            return appUser;
        });
    }
    /**
     * Can be overwritten if needed.
     * @param req
     */
    extractAppUser(req) {
        return req.user;
    }
    /**
     * Can be used to modify the payload.
     * @param appUser
     * @param payload
     */
    processPayloadCreate(payload) { }
    processPayloadCreateOne(payload) { }
    processPayloadCreateMany(payload) { }
    processPayloadReadOne(params) { }
    processPayloadUpdateOne(params, payload) { }
    processPayloadUpdateMany(payload) { }
    processPayloadDelete(params) { }
}
exports.default = ACrudController;
//# sourceMappingURL=ACrudController.js.map