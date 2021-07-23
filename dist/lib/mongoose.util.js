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
exports.extractId = exports.intSchema = exports.stringSchema = exports.getMongooseModelAttributes = exports.emailSchema = exports.isUnique = exports.codeSchema = exports.DEFAULT_MODEL_OPTIONS = void 0;
const validator_1 = __importDefault(require("validator"));
const AppException_1 = __importDefault(require("../exceptions/AppException"));
exports.DEFAULT_MODEL_OPTIONS = {
    timestamps: true
};
/**
 *
 * @param opts Only set isUnique if there is no compound unique key
 */
function codeSchema(opts) {
    const { required = true, isUnique = false, isUniqueFn } = opts;
    return {
        type: String,
        required: required,
        unique: isUnique,
        uppercase: true,
        validate: [
            {
                validator: function (code) {
                    let codeAlphanum = code.replace(/-/g, '');
                    codeAlphanum = codeAlphanum.replace(/_/g, '');
                    return validator_1.default.isAlphanumeric(codeAlphanum);
                },
                message: (props) => `Code ${props.value} contains special characters`,
                type: 'format'
            },
            {
                validator: function (code) { return isUniqueFn(this, code); },
                message: (props) => `Code ${props.value} is already in use`,
                type: 'unique'
            }
        ]
    };
}
exports.codeSchema = codeSchema;
function isUnique(model, doc, query = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const docFromDb = yield model.findOne(query);
        const exists = !!docFromDb;
        return !exists || (doc && docFromDb && doc._id.equals(docFromDb._id));
    });
}
exports.isUnique = isUnique;
/**
 *
 * @param opts required: boolean: unique: boolean
 * @param isUnique If opts.unique = true then you will have to pass this function
 */
function emailSchema(opts = {}) {
    const { required = false, emailValidation = {}, isUnique = false, isUniqueFn } = opts;
    const { allowDisplayName = false } = emailValidation;
    return {
        type: String,
        required: required,
        unique: isUnique,
        lowercase: allowDisplayName ? false : true,
        validate: [
            {
                validator: (v) => {
                    let isValid = false;
                    if (required) {
                        isValid = validator_1.default.isEmail(v, { allow_display_name: allowDisplayName });
                    }
                    else {
                        isValid = v ? validator_1.default.isEmail(v, { allow_display_name: allowDisplayName }) : v === null || v === '';
                    }
                    return isValid;
                },
                message: (props) => `${props.value} is not a valid email address`,
                type: 'format'
            },
            {
                validator: function (email) { return isUniqueFn ? isUniqueFn(this, email) : true; },
                message: (props) => `Email ${props.value} is already in use`,
                type: 'unique'
            }
        ]
    };
}
exports.emailSchema = emailSchema;
/**
 *
 * @param model
 * @param fieldNames
 * @deprecated Not maintained anymore
 */
function getMongooseModelAttributes(model, fieldNames) {
    const searchSchema = {};
    const schemaPaths = model.schema.paths;
    //********note: this doesnt necessarily have to be dynamic. We could also just hardcode this instead of using the mongoose definition.
    //depends on if we're going to reuse this or not.
    fieldNames.forEach((fieldName) => {
        if (schemaPaths[fieldName]) {
            const type = schemaPaths[fieldName].instance;
            let enumValues = schemaPaths[fieldName].enumValues;
            if (type === 'Number') {
                enumValues = schemaPaths[fieldName].options.enum;
            }
            searchSchema[fieldName] = {};
            searchSchema[fieldName].type = type;
            if (enumValues) {
                enumValues = enumValues.filter((v) => {
                    //filter empty items
                    return (typeof v !== 'string' && v !== null)
                        || (typeof v === 'string' && v !== null && v !== '');
                });
                searchSchema[fieldName].data = enumValues;
            }
        }
        else {
            throw new AppException_1.default("Internal server error", `Field does not exist ${fieldName}`);
        }
    });
    return searchSchema;
}
exports.getMongooseModelAttributes = getMongooseModelAttributes;
;
function stringSchema(opts = {}) {
    const { required, defaultValue } = opts;
    return {
        type: String,
        required: !!required,
        default: defaultValue
    };
}
exports.stringSchema = stringSchema;
function intSchema(opts = {}) {
    const { required, defaultValue } = opts;
    return {
        type: Number,
        required: !!required,
        default: defaultValue
        //TODO: add integer validation -- be mindful that it also can be empty if not required
    };
}
exports.intSchema = intSchema;
/**
 * If record is an object with _id attribute, it will return toString value of _id attribute.
 * Otherwise, it will return the record itself (which should be a string)
 * @param org
 */
function extractId(record) {
    let id;
    if (record) {
        if (record._id) {
            id = record._id.toString();
        }
        else {
            id = record;
        }
    }
    return id;
}
exports.extractId = extractId;
//# sourceMappingURL=mongoose.util.js.map