"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _AControllerBase_router;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
class AControllerBase {
    constructor(loggerString, 
    /** 2021-01-07 FK - I'd normally handle this in the implementing class, but attribute will be undefined in initRoutes() because called before assignment */
    routeOptions) {
        this.loggerString = loggerString;
        this.routeOptions = routeOptions;
        _AControllerBase_router.set(this, void 0);
        __classPrivateFieldSet(this, _AControllerBase_router, express_1.default.Router(), "f");
        this.initRoutes(__classPrivateFieldGet(this, _AControllerBase_router, "f"), this.routeOptions);
    }
    getRouter() {
        return __classPrivateFieldGet(this, _AControllerBase_router, "f");
    }
}
_AControllerBase_router = new WeakMap();
exports.default = AControllerBase;
//# sourceMappingURL=AControllerBase.js.map