"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// config() will read the .env file, parse the contents, assign it to process.env.
const envFound = dotenv_1.default.config();
if (envFound.error) {
    // This error should crash whole process
    console.log("loaders.config::No .env file loaded. Using environment variables only.");
}
else {
    console.log("loaders.config::Using .env file.");
}
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("⚠  JWT Secret not set in .env file  ⚠");
}
const getMongoDbUrl = function (includePassword) {
    //for example mongodb://admin:12ayden@158.101.105.96:27017/admin?authSource=admin
    let credentials = '';
    if (process.env.MONGODB_USER) {
        let password = includePassword ? process.env.MONGODB_PW : '********';
        credentials = `${process.env.MONGODB_USER}:${password}@`;
    }
    let mongoDbUrl = `mongodb://${credentials}${process.env.MONGODB_SERVERS}/${process.env.MONGODB_DATABASE}`;
    if (process.env.MONGODB_OPTIONS) {
        mongoDbUrl += `?${process.env.MONGODB_OPTIONS}`;
    }
    return mongoDbUrl;
};
const MONGO_DB_URL = getMongoDbUrl(true);
const MONGO_DB_URL_NOPW = getMongoDbUrl(false);
exports.default = {
    nodeEnv: process.env.NODE_ENV,
    server: {
        port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 5000,
    },
    jwtSecret: jwtSecret,
    logging: {
        level: process.env.LOGGING_LOG_LEVEL || 'silly',
    },
    mongoDb: {
        url: MONGO_DB_URL,
        urlNoPw: MONGO_DB_URL_NOPW
    },
};
//# sourceMappingURL=config.loader.js.map