"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
require("winston-mongodb");
const config_1 = __importDefault(require("../lib/config"));
const { combine, splat, timestamp, printf, colorize } = winston_1.default.format;
//import config from '../lib/config'
const logDir = './logs/';
const myFormat = printf((_a) => {
    var { level, message, timestamp } = _a, metadata = __rest(_a, ["level", "message", "timestamp"]);
    let msg = `${timestamp} [${level}] : ${message}`;
    if (metadata.stack) {
        msg += ` -- ${metadata.stack}`;
    }
    else if (JSON.stringify(metadata) !== JSON.stringify({})) {
        msg += ' -- ' + JSON.stringify(metadata);
    }
    return msg;
});
const consoleTransport = new winston_1.default.transports.Console({
    format: combine(colorize(), splat(), timestamp(), myFormat),
    handleExceptions: true,
    //handleRejections: true,
    level: config_1.default.logging.level
});
let logConfiguration = null;
console.log("middleware.logger::log level - " + config_1.default.logging.level);
if (process.env.NODE_ENV === 'production') {
    console.log("middleware.logger::setting up logging with production settings");
    //const DB_URL = config.mongoDb.url
    logConfiguration = {
        format: combine(splat(), timestamp(), myFormat),
        transports: [
            consoleTransport,
            new winston_1.default.transports.DailyRotateFile({
                filename: `${logDir}/logfile-%DATE%.log`,
                handleExceptions: true,
                //handleRejections: true,
                maxFiles: '30d',
                utc: true,
                level: config_1.default.logging.level
            }),
            //      new winston.transports.MongoDB({db: DB_URL, handleExceptions: true, handleRejections: true}),
        ],
        exceptionHandlers: [
            new winston_1.default.transports.DailyRotateFile({
                filename: `${logDir}/uncaughtExceptions-%DATE%.log`,
                maxFiles: '30d',
                utc: true,
                level: config_1.default.logging.level
            }),
        ],
        //    rejectionHandlers: [
        //      new winston.transports.DailyRotateFile({filename: `${logDir}/rejections-%DATE%.log`,
        //                                              maxFiles: '30d',
        //                                              utc: true}),
        //    ]
    };
}
else {
    console.log("middleware.logger::setting up logging with development settings");
    logConfiguration = {
        format: combine(splat(), timestamp(), myFormat),
        transports: [
            consoleTransport,
            new winston_1.default.transports.DailyRotateFile({
                filename: `${logDir}/logfile-%DATE%.log`,
                handleExceptions: true,
                //handleRejections: true,
                maxFiles: '1d',
                utc: false,
                level: config_1.default.logging.level
            }),
        ],
        exceptionHandlers: [
            new winston_1.default.transports.DailyRotateFile({
                filename: `${logDir}/uncaughtExceptions-%DATE%.log`,
                maxFiles: '1d',
                utc: false,
                level: config_1.default.logging.level
            }),
        ],
        //    rejectionHandlers: [
        //      new winston.transports.DailyRotateFile({filename: `${logDir}/rejections-%DATE%.log`,
        //                                              maxFiles: '1d',
        //                                              utc: false}),
        //    ]
    };
}
const logger = winston_1.default.createLogger(logConfiguration);
exports.default = logger;
//# sourceMappingURL=winston.loader.js.map