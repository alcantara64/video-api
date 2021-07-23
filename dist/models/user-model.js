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
exports.UserSchema = void 0;
const mongoose_util_1 = require("../lib/mongoose.util");
const config_1 = __importDefault(require("../lib/config"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.UserSchema = new mongoose_1.default.Schema({
    email: emailSchemaInternal(),
    name: String,
    password: {
        type: String,
        required: true,
        //minlength: 6,
        //maxlength: 20 doesnt make sense. this is the hash value
    },
    resetPasswordNextLogon: Boolean,
    resetPasswordCode: {
        type: String,
        default: '',
    },
    resetPasswordToken: {
        type: String,
        default: '',
    },
    resetPasswordExpires: {
        type: Number,
        default: 0,
    }
}, {
    toJSON: { virtuals: true },
    timestamps: true
});
exports.UserSchema.methods.generateAuthToken = function () {
    return jsonwebtoken_1.default.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        isAdmin: this.isAdmin,
    }, config_1.default.jwtSecret, { expiresIn: '12h' });
};
function isUniqueEmail(doc, email) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield mongoose_util_1.isUnique(UserModel, doc, {
            email: email
        });
    });
}
function emailSchemaInternal() {
    return mongoose_util_1.emailSchema({
        required: true,
        isUniqueFn: isUniqueEmail,
        isUnique: true
    });
}
const UserModel = mongoose_1.default.model("User", exports.UserSchema);
exports.default = UserModel;
//# sourceMappingURL=user-model.js.map