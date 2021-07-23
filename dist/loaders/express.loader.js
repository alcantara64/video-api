"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bodyParser = __importStar(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
require("express-async-errors"); //https://dev.to/ama/how-to-use-express-js-error-handling-middleware-to-make-your-code-cleaner-34j3
const helmet_1 = __importDefault(require("helmet"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const error_middleware_1 = __importDefault(require("../middleware/error-middleware"));
//export default async ({ app }: { app: express.Application }) => {
exports.default = (app) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        app.get('/status', (req, res) => { res.status(200).end(); });
        app.head('/status', (req, res) => { res.status(200).end(); });
        //app.enable('trust proxy'); need to check if necessary
        app.use(helmet_1.default());
        app.use(cors_1.default());
        //app.use(require('morgan')('dev'));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json({ limit: "10MB" }));
        /********** login route **********/
        app.post('/login', auth_middleware_1.default.authenticate, auth_middleware_1.default.login);
        //app.post('/register', auth.resetPassword);
        /********** secured routes **********/
        app.use(auth_middleware_1.default.ensureUser);
        app.use('/user/users', (new UserController_1.default()).getRouter());
        //app.use('/movie', (new OrgController().getRouter()));
        /********** error handling **********/
        app.use(error_middleware_1.default.handleValidationError);
        app.use(error_middleware_1.default.handleAppError);
        app.use(error_middleware_1.default.handleError);
        app.use(error_middleware_1.default.notFound);
        return app;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
//# sourceMappingURL=express.loader.js.map