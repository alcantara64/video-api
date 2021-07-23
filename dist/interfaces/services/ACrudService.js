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
const AServiceBase_1 = __importDefault(require("./AServiceBase"));
const HttpNotFoundException_1 = __importDefault(require("../../exceptions/http/HttpNotFoundException"));
class ACrudService extends AServiceBase_1.default {
    /**
     * Standard implementation for ICrudService.
     * @param model The mongoose model
     * @param loggerString Returned string will be used to build up logger information. Example "modules.customer.CustomerService"
     */
    constructor(model, loggerString) {
        super(loggerString);
        this.model = model;
    }
    searchByFilterCriteria(appUser, queryOpts) {
        throw new Error('Method not implemented.');
    }
    /**
     * Creates one item in the database
     * @param payload The json object that comes from the external caller
     */
    createOne(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${this.loggerString}:createOne::Start`);
            const newModel = new this.model(payload);
            return yield newModel.save();
        });
    }
    /**
     * Creates many items in the database
     * @param payload An array of payloads to be created in the database.
     */
    createMany(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${this.loggerString}:createMany::Start`);
            const newModels = yield this.model.insertMany(payload);
            return newModels;
        });
    }
    /**
     * Reads one item from the database by database ID. Throws exception if user does not have access
     * @param appUser
     * @param id
     */
    readOneById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${this.loggerString}:readOneById::Start`);
            const result = yield this.model.findById(id)
                .select(this.getMongooseQuerySelectOptions())
                .populate(this.getMongooseQueryPopulateOptions("readOneById"));
            if (!result) {
                throw new HttpNotFoundException_1.default("Object does not exist.");
            }
            return result;
        });
    }
    /**
     * @param appUser
     * @param opts Model attribute names, either single value or array. Example {status = 0} or {status=[0,1]}
     * Strings will be used as a regex. To avoid wildcard for attributes, add an object "disableWildcardFor". Example:
     * disableWildcardFor.code = 1 will avoid wildcard search for the code attribute
     */
    readMany(appUser, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`${this.loggerString}:readMany::Started`, opts);
            const hrstart = process.hrtime();
            //temporarily leaving this in. removing offset and limit eventually
            //readMany will be fixed limited to 1000 records for now
            /** 2021-01-19 - Frank - Extending standard limit to 5000 until UI is adjusted to do server side pagination */
            const { offset = 0, limit = 5000, disableWildcardFor = {} } = opts, optsQuery = __rest(opts, ["offset", "limit", "disableWildcardFor"]);
            /*
            Commenting out, by default returning active and inactive
            if(optsQuery["status"] === undefined) {
              optsQuery.status = ModelStatus.ACTIVE;
            }
            */
            Object.keys(optsQuery).forEach(function (key) {
                const value = optsQuery[key];
                if (!(value instanceof Array) && isNaN(value)) {
                    //convert to regex because we want to do wildcard searches; 'i' is for ignore case
                    if (key !== 'memberOrg' && key !== 'holdingOrg' && !disableWildcardFor[key]) {
                        optsQuery[key] = new RegExp(value, 'i');
                    }
                }
            });
            let securedQuery = {};
            securedQuery = optsQuery;
            const resultCount = yield this.model.countDocuments(securedQuery);
            let sort = this.getSortOrderForReadMany();
            if (!sort) {
                sort = { name: 1 };
            }
            const results = yield this.model.find(securedQuery)
                .select(this.getMongooseQuerySelectOptions())
                .populate(this.getMongooseQueryPopulateOptions("readMany"))
                .sort(sort)
                .skip(Number(offset))
                .limit(Number(limit));
            const hrend = process.hrtime(hrstart)[1] / 1000000; //time in ms
            console.info(`${this.loggerString}:readMany::${results.length} records found in ${hrend}ms`);
            return {
                info: {
                    offset: offset,
                    limit: limit,
                    resultCount: results.length,
                    totalCount: resultCount,
                    queryTime: hrend,
                    query: securedQuery
                },
                results: results
            };
        });
    }
    updateOneById(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${this.loggerString}:updateOneById::Started`);
            //this will automatically check for user security
            const result = yield this.readOneById(id);
            //doesnt work with validators unfortunately. _id is empty which is needed for unique custom validator
            //let result = await User.findByIdAndUpdate(id, payload, {runValidators: true});
            Object.keys(payload).forEach(function (key) {
                result[key] = payload[key];
            });
            return yield result.save();
        });
    }
    /**
     * Raw implementation using this.updateOneById. It may make sense to investigate if there are better ways
     * in mongoose to do that. This function, however, is not likely to be used often.
     * @param userSecurity
     * @param payload
     */
    updateMany(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${this.loggerString}:updateMany::Started`);
            const results = [];
            for (let item of payload) {
                //also checks each one for security
                results.push(yield this.updateOneById(item.id, item));
            }
            ;
            return results;
        });
    }
    deleteOneById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${this.loggerString}:deleteOneById::Started`);
            yield this.readOneById(id);
            const result = yield this.model.findByIdAndDelete(id);
            return result;
        });
    }
    /**
     * Standard implementation returns null.
     * This can be used to sepcifically exclude fields. For example, "-password" would exclude the password field.
     */
    getMongooseQuerySelectOptions() {
        return null;
    }
    /**
     * Standard implementation returns null.
     * This can be used to sepcifically load fields. For example, "roles" for users.
     */
    getMongooseQueryPopulateOptions(methodName) {
        return null;
    }
    /**
     * Search by mongoose query
     * @param appUser
     * @param queryOpts
     * @param mongooseOptions override default mongoose options for select and popoulate
     */
    searchByQuery(queryOpts, mongooseOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`${this.loggerString}:searchByQuery::Started`, { queryOpts: queryOpts });
            const hrstart = process.hrtime();
            const { options, query } = queryOpts;
            let securedQuery = {};
            securedQuery = query;
            console.info(`${this.loggerString}:searchByQuery::Secured query`, { securedQuery: securedQuery });
            /**2021-02-01 Creating Mongoose Query for Dynamic Search facility */
            let searchQuery = {};
            let mergeQuery = { "$and": [] };
            if (options.globalSearch) {
                const { fieldNames = [], searchValue = "" } = options.globalSearch;
                let qArr = [];
                fieldNames.forEach(function (fieldName) {
                    /** 2021-02-10 - Frank - Removed dataAttributeMap check again to make this route more generic.
                     * This means, the customer list will have to honor the check for string and only pass those fields for global search
                    */
                    qArr.push({ [fieldName]: { $regex: searchValue, $options: 'i' } });
                });
                mergeQuery.$and.push(securedQuery);
                if (qArr.length > 0) {
                    searchQuery.$or = qArr;
                    mergeQuery.$and.push(searchQuery);
                }
                /**2021-02-01 Generating new merged query (securedquery + searchQuery) */
                /**2021-02-01 End of merged query (securedquery + searchQuery) generation*/
            }
            else {
                mergeQuery.$and.push(securedQuery);
            }
            console.info(`${this.loggerString}:searchByQuery::merge query`, { mergeQuery });
            /**2021-02-01 End of Creating Mongoose Query for Dynamic Search facility */
            /** 2021-01-19 - Frank - Extending standard limit to 5000 until UI is adjusted to do server side pagination */
            const { offset = 0, limit = 5000 } = options;
            const selectOptions = this.getMongooseQuerySelectOptions();
            const resultCount = yield this.model.countDocuments(mergeQuery);
            const results = yield this.model.find(mergeQuery)
                .lean()
                .select((mongooseOptions === null || mongooseOptions === void 0 ? void 0 : mongooseOptions.select) || selectOptions)
                .populate(mongooseOptions === null || mongooseOptions === void 0 ? void 0 : mongooseOptions.populate)
                .skip(Number(offset))
                .limit(Number(limit))
                .sort(options.sort);
            const hrend = process.hrtime(hrstart)[1] / 1000000; //time in ms
            console.info(`${this.loggerString}:searchByQuery::${results.length} records found in ${hrend}ms`);
            return {
                info: {
                    offset: offset,
                    limit: limit,
                    resultCount: results.length,
                    totalCount: resultCount,
                    queryTime: hrend,
                    query: mergeQuery
                },
                results: results
            };
        });
    }
    /**
     * Empty implementation. Can be overwritten in child class.
     * @param appUser The current appUser
     * @param newModel The new model instance that was created.
     * @param payload The payload.
     */
    afterCreateOne(appUser, newModel, payload) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Empty implementation. Can be overwritten in child class.
     * @param appUser The current appUser
     * @param newModel The new model instances that were created.
     * @param payload The payload.
     */
    afterCreateMany(appUser, newModels, payload) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Empty implementation. Can be overwritten in child class.
     * Note: There is no afterUpdateMany, because updateMany calls updateOne
     * @param appUser
     * @param updatedModel
     * @param id
     * @param payload
     */
    afterUpdateOne(appUser, updatedModel, id, payload) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Model not yet updated, but data fetched from database
     * @param appUser
     * @param notYetUpdatedModel
     * @param id
     * @param payload
     */
    beforeUpdateOnePayloadProcessing(appUser, notYetUpdatedModel, id, payload) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Provide the sort order for readMany
     */
    getSortOrderForReadMany() {
        return undefined;
    }
    /**
     * Empty implementation. Can be overwritten in child class.
     * @param appUser The current appUser
     * @param payload The payload.
     */
    beforeCreateOne(appUser, payload) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Empty implementation. Can be overwritten in child class.
     * @param appUser The current appUser
     * @param payload The payload.
     */
    beforeCreateMany(appUser, payload) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Empty implementation. Can be overwritten in child class.
     * Note: There is no afterUpdateMany, because updateMany calls updateOne
     * @param appUser
     * @param id
     * @param payload
     */
    beforeUpdateOne(appUser, id, payload) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    beforeDeleteOne(appUser, id) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * Can be used to filter the Model data for specific fields.
     * Example use: EmailTemplateService uses MessageTemplateModel where dataDomain = "communication"
     * Standard implementation returns null.
     */
    restrictModelByDataDomain() {
        return false;
    }
}
exports.default = ACrudService;
//# sourceMappingURL=ACrudService.js.map